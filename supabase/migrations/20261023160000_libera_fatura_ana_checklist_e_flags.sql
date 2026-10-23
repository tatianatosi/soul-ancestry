-- Liberação da fatura da Ana Luiza no App: checklist de onboarding e flags do
-- portão (23/10/2026). Caso CA-CID-AT-FAM-2026-001.
--
-- Ordem da Proprietária: "Pode migrar que libera a fatura da ana", seguida da
-- escolha da opção (b) — reconciliar as quatro travas, com a confirmação dela
-- de que o pagamento está confirmado de fato.
--
-- ## O que estava bloqueando, de verdade
--
-- A migration 20261011130000_saneamento_nucleo_ana_luiza **já estava aplicada**
-- neste banco desde 11/10 (linha fantasma arquivada às 02:52; Ana, Adair e Alice
-- como `contratante`, todos com `cliente_id`). Ela nunca foi o bloqueio.
--
-- A fatura é liberada pela RPC `portal_sou_contratante_financeiro`, que exige
-- vínculo ativo em `client_portal_case_access`. Esse vínculo não existia, e a
-- trigger `fn_portal_case_access_guard()` recusa criá-lo enquanto o caso não
-- tiver, cumulativamente: `contrato_assinado`, `pagamento_confirmado`,
-- `documentos_minimos_ok` e (`ativado_em` OU `onboarding_iniciado_em`). A mesma
-- regra vale no App, em `portal-elegibilidade.ts:193` (`bloqueioDoCaso`).
--
-- Medição de 23/10: os 14 `case_activation_checks` estavam todos resolvidos
-- (11 validados, 3 isentos), mas as quatro flags seguiam falsas — a
-- denormalização nunca foi propagada. E `case_ativacao_bloqueios_reais`, que é
-- a fonte única de verdade do sistema, apontava exatamente dois bloqueios, em
-- `onboarding_checklist`: "Contrato assinado" (em_andamento) e "Pagamento
-- inicial confirmado" (pendente).
--
-- ## O que esta migration faz
--
-- 1. Conclui esses dois itens do `onboarding_checklist`, seguindo a convenção
--    dos outros dez (mesmo `concluido_por`, `observacao = 'Confirmado'`), com
--    a evidência interna registrando a confirmação da Proprietária.
-- 2. Reconcilia as três flags que o portão exige e que os checks já davam por
--    resolvidas.
--
-- Depois disto, `case_ativacao_bloqueios_reais` devolve ZERO bloqueios.
--
-- ## O que esta migration NÃO faz, de propósito
--
-- A ativação do caso (`status -> ativo`, `ativo`, `ativado_em`) NÃO está aqui.
-- A trigger `fn_guard_ativacao()` recusa: "Somente admin ou operações podem
-- ativar um caso" — ela verifica o papel do usuário autenticado via `auth.uid()`,
-- e uma conexão SQL não tem sessão de usuário. Isso é proteção correta e não
-- foi contornada. A ativação é um clique da Proprietária em
-- `/onboarding/a11a0000-0000-4000-8000-000000000002`, pelo writer
-- `ativarCasoComChecks` (onboarding.functions.ts), que caminha a máquina de
-- estados — `pronto_para_ativar -> ativo` — espelhada em trigger no banco.
-- Pular estados foi o que causou o incidente de 28/08/2026 registrado em
-- `ativacao-caso-transicao.test.ts`.
--
-- Só depois da ativação o vínculo em `client_portal_case_access` pode ser
-- criado, e a fatura aparece.
--
-- APLICADA E VERIFICADA no banco do Lovable Cloud (projeto Ancestral Canvas,
-- 1a628b61-ec68-454f-85e1-671d6f297370). NÃO aplicada no projeto
-- zsxpdbhdvbuulwpepemd, congelado. Idempotente nas duas partes.

-- 1) Os dois itens de onboarding que eram os únicos bloqueios reais.
DO $$
DECLARE
  v_case_id uuid := 'a11a0000-0000-4000-8000-000000000002';
  v_org_id  uuid := '11f32aae-ea08-47e0-8114-f5d8a900c9a1';
  v_user    uuid := '92fa5a0c-a551-4035-8e35-a924fe74f6f0';
  r         record;
BEGIN
  FOR r IN
    SELECT id, item_code, label, status
      FROM public.onboarding_checklist
     WHERE case_id = v_case_id
       AND archived_at IS NULL
       AND item_code IN ('contrato_assinado','pagamento_inicial')
       AND status <> 'concluido'
  LOOP
    UPDATE public.onboarding_checklist
       SET status = 'concluido',
           concluido_em = now(),
           concluido_por = v_user,
           updated_by = v_user,
           updated_at = now(),
           observacao = 'Confirmado',
           evidencia_referencia_interna =
             'Confirmado pela Proprietaria em 23/10/2026: contrato assinado e pagamento inicial confirmado. '
             || 'Condicao comercial vigente: versao 4, rateio igualitario de R$ 3.200,00 por contratante adulto '
             || '(10 x R$ 320,00), total R$ 9.600,00 — Pacote Austria 58c.'
     WHERE id = r.id;

    INSERT INTO public.audit_logs
      (organization_id, user_id, entidade, entidade_id, acao, valores_anteriores, valores_posteriores, metadados)
    VALUES
      (v_org_id, v_user, 'onboarding_checklist', r.id, 'item_onboarding_concluido',
       jsonb_build_object('status', r.status),
       jsonb_build_object('status', 'concluido'),
       jsonb_build_object('case_id', v_case_id, 'item_code', r.item_code, 'label', r.label,
         'motivo', 'Liberacao da fatura no App: estes eram os dois unicos bloqueios reais apontados por case_ativacao_bloqueios_reais',
         'origem_da_ordem', 'Proprietaria autenticada, 23/10/2026'));
  END LOOP;
END $$;

-- 2) As três flags do portão que os checks já davam por resolvidas.
DO $$
DECLARE
  v_case_id uuid := 'a11a0000-0000-4000-8000-000000000002';
  v_org_id  uuid := '11f32aae-ea08-47e0-8114-f5d8a900c9a1';
  v_user    uuid := '92fa5a0c-a551-4035-8e35-a924fe74f6f0';
  v_antes   public.crm_casos;
BEGIN
  SELECT * INTO v_antes FROM public.crm_casos WHERE id = v_case_id;

  IF coalesce(v_antes.contrato_assinado,false)
     AND coalesce(v_antes.pagamento_confirmado,false)
     AND coalesce(v_antes.documentos_minimos_ok,false) THEN
    RAISE NOTICE 'Nada a fazer: as tres flags ja estao verdadeiras.';
    RETURN;
  END IF;

  UPDATE public.crm_casos
     SET contrato_assinado     = true,
         pagamento_confirmado  = true,
         documentos_minimos_ok = true,
         updated_by = v_user
   WHERE id = v_case_id;

  INSERT INTO public.audit_logs
    (organization_id, user_id, entidade, entidade_id, acao, valores_anteriores, valores_posteriores, metadados)
  VALUES
    (v_org_id, v_user, 'crm_casos', v_case_id, 'requisitos_portal_reconciliados',
     jsonb_build_object('contrato_assinado', v_antes.contrato_assinado,
       'pagamento_confirmado', v_antes.pagamento_confirmado,
       'documentos_minimos_ok', v_antes.documentos_minimos_ok),
     jsonb_build_object('contrato_assinado', true, 'pagamento_confirmado', true, 'documentos_minimos_ok', true),
     jsonb_build_object('case_id', v_case_id,
       'motivo', 'Reconciliacao das flags que fn_portal_case_access_guard exige. Os 12 itens do onboarding_checklist estao concluidos e case_ativacao_bloqueios_reais devolve zero bloqueios; as flags denormalizadas nunca foram propagadas',
       'confirmado_pela_proprietaria', 'contrato assinado e pagamento inicial confirmado, 23/10/2026',
       'falta_ainda', 'ativacao do caso (status -> ativo, ativado_em), que exige sessao autenticada de admin/operacoes: fn_guard_ativacao'));
END $$;
