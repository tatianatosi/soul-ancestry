-- 05/09/2026 — achado real reportado pela Proprietária: a tela de ativação do
-- caso (onboarding.$id.tsx) e o card de casos (casos.index.tsx) mostravam
-- "Requisitos completos" / "N/14 requisitos validados" olhando SOMENTE para
-- public.case_activation_checks (checklist de auto-atestação, editável por
-- clique em "Validar"). Mas a transição real para status='ativo' em
-- crm_casos passa por CINCO trilhas de trava independentes, cada uma lendo
-- uma tabela diferente e nenhuma delas espelhada nesta tela:
--   1. trg_guard_ativacao            -> case_activation_pendencias() (checklist)
--   2. guard_consentimento_ativacao  -> consent_records / consent_exceptions
--   3. trg_caso_ativacao_gates_guard -> case_activacao_bloqueios() (checklist, mesma tabela da 1)
--   4. trg_caso_ativo_guard          -> onboarding_checklist (tabela DIFERENTE do checklist acima)
--   5. trg_quality_guard_ativacao    -> quality_issues críticas em aberto
-- Um caso podia ter os 14 itens do checklist manualmente marcados como
-- "Validado" (fonte 1/3 zerada) e mesmo assim ser recusado pelo banco por
-- causa das fontes 2, 4 ou 5 — que a tela nunca consultava. Cada uma dessas
-- travas continua ativa e intacta (nenhuma proteção foi removida); esta
-- função só torna visível, em leitura, o que cada uma delas já verifica de
-- verdade, para a tela parar de mentir "completo" enquanto o banco recusaria
-- a ativação.
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

  -- 1/3. Checklist de 14 requisitos obrigatórios (case_activation_checks) —
  -- mesma tabela usada por trg_guard_ativacao e trg_caso_ativacao_gates_guard.
  RETURN QUERY
  SELECT
    'checklist_ativacao_14_itens'::text,
    g.dominio,
    g.label || ' — ' || COALESCE(g.motivo, 'pendente'),
    'case_activation_checks.status (' || g.check_key || ')',
    g.estado,
    '/onboarding/' || _case::text
  FROM public.case_activation_gates(_case) g
  WHERE g.obrigatorio AND g.estado <> 'validado';

  -- 2. Consentimento real (consent_records / consent_exceptions) —
  -- guard_consentimento_ativacao. Independente do item "Consentimento
  -- registrado" do checklist acima: aquele é só um clique manual, este é o
  -- dado que o banco realmente confere.
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

  -- 4. Checklist de onboarding (onboarding_checklist) — trg_caso_ativo_guard.
  -- Tabela diferente do checklist de 14 itens: um caso pode estar 14/14 lá
  -- e ainda ter itens de onboarding pendentes aqui.
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

  -- 5. Inconsistências críticas em aberto (quality_issues) —
  -- trg_quality_guard_ativacao.
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
