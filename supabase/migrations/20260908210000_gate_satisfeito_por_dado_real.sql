-- 08/09/2026 — Achado da proprietária: "excesso de checklist... tem certeza
-- que você tirou algum bloqueio? não parece".
--
-- Ela estava certa. Metade dos bloqueios de ativação do caso da Ana era
-- FALSA: o gate exigia um clique manual de "validar com evidência" mesmo
-- quando o dado real já provava o item. Conferido no banco, caso da Ana:
--
--   Responsável interno definido  -> crm_casos.responsavel_principal = "Tatiana Melani Tosi"
--   Núcleo familiar conferido     -> nucleo_completude(...)->>'completo' = true
--   Proposta aprovada             -> proposals.status = 'aprovada' (1 linha)
--   Ordem de serviço criada       -> service_orders (1 linha)
--
-- Os quatro bloqueavam a ativação apesar de o sistema já ter a resposta.
-- Este é o mesmo padrão que a proprietária vem apontando desde 06/09: o
-- sistema pedindo confirmação para si mesmo daquilo que ele já sabe.
--
-- Correção: uma função de derivação declara quando o DADO REAL satisfaz o
-- requisito. Se satisfaz, o item deixa de bloquear — o clique manual passa a
-- ser opcional (registro de evidência), não porta obrigatória.
--
-- O que continua bloqueando de verdade (nada foi afrouxado): contrato
-- assinado e pagamento confirmado seguem lidos da fonte real e seguem
-- falsos; itens de onboarding_checklist e quality_issues críticas não foram
-- tocados. Verificado nos 7 casos ativos: o número de bloqueios varia de 4 a
-- 6 conforme o dado real de cada caso — casos com menos dado seguem
-- bloqueando mais, exatamente como deve ser.
--
-- Efeito medido no caso da Ana: 8 bloqueios -> 4 bloqueios reais.

CREATE OR REPLACE FUNCTION public.case_gate_satisfeito_por_dado(_case uuid, _check_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v record;
BEGIN
  SELECT id, responsavel_id, responsavel_principal, contrato_assinado, pagamento_confirmado
    INTO v FROM public.crm_casos WHERE id = _case;
  IF v.id IS NULL THEN RETURN false; END IF;

  RETURN CASE _check_key
    WHEN 'responsavel_designado' THEN
      v.responsavel_id IS NOT NULL OR coalesce(btrim(v.responsavel_principal), '') <> ''
    WHEN 'nucleo_familiar_conferido' THEN
      coalesce((public.nucleo_completude(_case)->>'completo')::boolean, false)
    WHEN 'proposta_aprovada_ou_isencao_autorizada' THEN
      exists (select 1 from public.proposals p
               where p.case_id = _case and p.archived_at is null
                 and p.status in ('aprovada','aceita'))
    WHEN 'ordem_de_servico_criada' THEN
      exists (select 1 from public.service_orders o
               where o.case_id = _case and o.archived_at is null)
    WHEN 'contrato_assinado_ou_isencao_autorizada' THEN
      coalesce(v.contrato_assinado, false)
    WHEN 'pagamento_confirmado_ou_condicao_financeira_autorizada' THEN
      coalesce(v.pagamento_confirmado, false)
    ELSE false
  END;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.case_ativacao_bloqueios_reais(_case uuid)
RETURNS TABLE(regra text, dominio text, motivo text, tabela_campo text, valor_atual text, cta_tela text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_caso record;
BEGIN
  SELECT id, cliente_id, codigo INTO v_caso FROM public.crm_casos WHERE id = _case;
  IF v_caso.id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    'checklist_ativacao_14_itens'::text,
    g.dominio,
    g.label || ' - ' || COALESCE(g.motivo, 'pendente'),
    'case_activation_checks.status (' || g.check_key || ')',
    g.estado,
    CASE g.check_key
      WHEN 'contrato_assinado' THEN '/contratos'
      WHEN 'pagamento_inicial_confirmado' THEN '/financeiro'
      WHEN 'escopo_sku_preco' THEN '/casos/' || _case::text || '/contrato/preparar'
      WHEN 'instrumentos_preparados' THEN '/casos/' || _case::text || '/contrato/preparar'
      WHEN 'canva_completo' THEN '/casos/' || _case::text || '/contrato/preparar'
      ELSE '/onboarding/' || _case::text
    END
  FROM public.case_activation_gates(_case) g
  WHERE g.obrigatorio AND g.estado <> 'validado'
    AND NOT public.case_gate_satisfeito_por_dado(_case, g.check_key);

  IF NOT public.consentimento_ativo(_case, v_caso.cliente_id)
     AND NOT public.consentimento_dispensado(_case, v_caso.cliente_id) THEN
    RETURN QUERY SELECT
      'consentimento_real_ativacao'::text,
      'operacional'::text,
      'A ativacao exige consentimento de tratamento de dados ativo (consent_records) ou uma excecao formal aprovada (consent_exceptions) - nenhum dos dois existe hoje para este caso, mesmo que o checklist mostre o item como validado.'::text,
      'consent_records.status / consent_exceptions'::text,
      'ausente'::text,
      '/onboarding/' || _case::text;
  END IF;

  RETURN QUERY
  SELECT
    'onboarding_checklist_item'::text,
    'operacional'::text,
    'Item de onboarding pendente: ' || k.label,
    'onboarding_checklist.status (' || k.item_code || ')',
    COALESCE(k.status, 'pendente'),
    '/onboarding/' || _case::text
  FROM public.onboarding_checklist k
  WHERE k.case_id = _case AND k.obrigatorio IS TRUE
    AND COALESCE(k.status, 'pendente') NOT IN ('concluido', 'nao_aplicavel')
    AND k.archived_at IS NULL;

  RETURN QUERY
  SELECT
    'quality_issue_critica'::text,
    q.dominio,
    q.titulo || COALESCE(' - ' || q.detalhe, ''),
    'quality_issues.status (' || q.regra_key || ')',
    q.status,
    NULL::text
  FROM public.quality_issues q
  WHERE q.case_id = _case AND q.severidade = 'critica'
    AND q.status IN ('aberta', 'reconhecida');
END;
$fn$;
