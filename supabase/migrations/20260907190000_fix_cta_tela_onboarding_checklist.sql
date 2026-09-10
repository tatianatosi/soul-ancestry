-- 07/09/2026 — achado real reportado pela Proprietária: ao clicar em "Abrir"
-- na tabela de bloqueios reais (tela /onboarding/$id) para um item de
-- onboarding_checklist (dossie_mae, app_cliente, checklist_inicial,
-- micro_entrega_d7, plano_acao), o link cta_tela mandava para /casos/<case>
-- (a ficha do caso). Essa tela é só leitura — mostra um card "Estado derivado
-- pelos requisitos de ativação" que o próprio texto avisa "não altera status"
-- — e não tem nenhum botão para concluir o item. A única tela que realmente
-- conclui um item de onboarding_checklist é a seção "Checklist de onboarding"
-- na PRÓPRIA tela /onboarding/<case> de onde o clique partiu. Resultado: a
-- proprietária ficava presa num ciclo — Reverter, Abrir, tela sem ação,
-- voltar — sem nenhum caminho de saída.
--
-- A migração original (20260905120000_case_ativacao_bloqueios_reais.sql)
-- já apontava corretamente para /onboarding/<case> em todos os casos; em
-- algum momento posterior (fora de uma migração rastreada) a função em
-- produção passou a rotear o checklist de 14 itens e, por engano, também
-- alguns itens de onboarding_checklist para /contratos, /financeiro e
-- /casos/<case>/contrato/preparar. Mantemos o roteamento específico só para
-- os 3 itens do checklist de 14 que genuinamente têm uma tela própria
-- (contrato_assinado -> /contratos, pagamento_inicial_confirmado ->
-- /financeiro, escopo/instrumentos/canva -> preparar contrato); todo o resto,
-- e sempre os itens de onboarding_checklist, voltam a apontar para
-- /onboarding/<case>.
CREATE OR REPLACE FUNCTION public.case_ativacao_bloqueios_reais(_case uuid)
RETURNS TABLE(
  regra text,
  dominio text,
  motivo text,
  tabela_campo text,
  valor_atual text,
  cta_tela text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caso record;
BEGIN
  SELECT id, cliente_id, codigo
    INTO v_caso
  FROM public.crm_casos
  WHERE id = _case;

  IF v_caso.id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    'checklist_ativacao_14_itens'::text,
    g.dominio,
    g.label || ' — ' || COALESCE(g.motivo, 'pendente'),
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
  WHERE g.obrigatorio AND g.estado <> 'validado';

  IF NOT public.consentimento_ativo(_case, v_caso.cliente_id)
     AND NOT public.consentimento_dispensado(_case, v_caso.cliente_id) THEN
    RETURN QUERY SELECT
      'consentimento_real_ativacao'::text,
      'operacional'::text,
      'A ativação exige consentimento de tratamento de dados ativo (consent_records) ou uma exceção formal aprovada (consent_exceptions) — nenhum dos dois existe hoje para este caso, mesmo que o checklist mostre o item como validado.'::text,
      'consent_records.status / consent_exceptions'::text,
      'ausente'::text,
      '/onboarding/' || _case::text;
  END IF;

  -- Corrigido em 07/09/2026: sempre /onboarding/<case> — é a única tela com
  -- ação real para estes itens.
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
    q.titulo || COALESCE(' — ' || q.detalhe, ''),
    'quality_issues.status (' || q.regra_key || ')',
    q.status,
    NULL::text
  FROM public.quality_issues q
  WHERE q.case_id = _case AND q.severidade = 'critica'
    AND q.status IN ('aberta', 'reconhecida');
END;
$$;

REVOKE ALL ON FUNCTION public.case_ativacao_bloqueios_reais(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.case_ativacao_bloqueios_reais(uuid) TO authenticated, service_role;
