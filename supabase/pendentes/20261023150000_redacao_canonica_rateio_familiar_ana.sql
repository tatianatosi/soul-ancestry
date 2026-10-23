-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ ESTADO: JÁ APLICADO no banco do Lovable Cloud em 23/10/2026.            │
-- │                                                                         │
-- │ Mora em `supabase/pendentes/` por causa da Decisão de Hospedagem Única  │
-- │ (23/10/2026), regra 3: o Claude Code nunca escreve em                   │
-- │ `supabase/migrations/` nem em `drizzle/migrations/`; mudanças de banco   │
-- │ são propostas aqui e aplicadas pelo Lovable.                            │
-- │                                                                         │
-- │ Ressalva honesta: estas três foram aplicadas por mim, direto via a      │
-- │ ferramenta do Lovable, sob autorização explícita da Proprietária        │
-- │ ("descongelo", "escreva na base do Lovable", opção B) — ANTES de a      │
-- │ regra 3 existir. A regra agora proíbe isso, e eu não repito: daqui em   │
-- │ diante proponho aqui e a aplicação é pelo chat do Lovable.              │
-- │                                                                         │
-- │ Reaplicar é seguro: os três blocos são idempotentes e viram no-op.      │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Redação canônica da condição comercial e do rateio familiar — Pacote Áustria § 58c
-- (23/10/2026). Caso CA-CID-AT-FAM-2026-001.
--
-- Texto canônico fornecido pela Proprietária:
--   Valor Total dos Honorários: R$ 9.600,00.
--   Forma de Pagamento: 10 parcelas mensais, rateadas igualitariamente entre os
--   3 contratantes adultos:
--     Contratante 1 — Ana Luiza Gomes Silveira Rodrigues: 10 × R$ 320,00 (R$ 3.200,00)
--     Contratante 2 — Adair Pinto Silveira Júnior:        10 × R$ 320,00 (R$ 3.200,00)
--     Contratante 3 — Alice Gomes Silveira:               10 × R$ 320,00 (R$ 3.200,00)
--   Beneficiário Dependente: Felipe Silveira Rodrigues (menor representado, sem
--   acréscimo de custo).
--
-- O que esta versão 4 corrige em relação à versão 3 (aplicada horas antes, na
-- migration 20261023140000):
--   1. Nome completo do dependente — "Felipe" passa a "Felipe Silveira Rodrigues",
--      tanto em `approved_items` quanto em `case_dependents.nome_completo`, que
--      também guardava o nome incompleto.
--   2. Partes rotuladas como Contratante 1, 2 e 3, como a redação canônica nomeia.
--   3. `payment_terms` passa a declarar o rateio igualitário explicitamente, em
--      vez de só a operacionalização em 3 assinaturas.
--
-- NENHUM valor, parcela, prazo, responsável financeiro, despesa, taxa ou validade
-- foi alterado: segue R$ 3.200,00 por adulto, 10 × R$ 320,00, total R$ 9.600,00.
--
-- Por que versão nova e não UPDATE: é o padrão desta tabela (índice
-- `ccc_versao_unica`, writer `novaVersao`) e o precedente da própria versão 2,
-- que nasceu exatamente para corrigir o nome do Adair sem tocar em valor. A
-- versão 3 passa a `substituida`, preservada íntegra.
--
-- Por que nasce `aprovada`: `condicaoVigente()` só considera `aprovada`
-- (condicao-comercial-caso.ts:53). Deixar a nova em rascunho tiraria a condição
-- vigente do caso e a tela pararia de mostrá-la.
--
-- APLICADA E VERIFICADA no banco do Lovable Cloud (projeto Ancestral Canvas,
-- 1a628b61-ec68-454f-85e1-671d6f297370) em 23/10/2026, por ordem da
-- Proprietária. NÃO aplicada no projeto zsxpdbhdvbuulwpepemd, congelado.
-- Conferência pós-escrita: soma dos itens 9600 = fees 9600; 3 × 320 × 10 = 9600.
--
-- Idempotente: só age se o dependente ainda constar sem nome completo.

DO $$
DECLARE
  v_case_id uuid := 'a11a0000-0000-4000-8000-000000000002';
  v_org_id  uuid;
  v_atual   public.case_commercial_condition;
  v_nova_id uuid;
  v_proxima integer;
  v_terms   text;
BEGIN
  SELECT * INTO v_atual
    FROM public.case_commercial_condition
   WHERE case_id = v_case_id AND archived_at IS NULL AND approval_status = 'aprovada'
   ORDER BY versao DESC LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nenhuma versao aprovada encontrada.';
  END IF;

  IF v_atual.approved_items::text NOT LIKE '%"parte": "Felipe"%'
     AND v_atual.approved_items::text NOT LIKE '%"parte":"Felipe"%' THEN
    RAISE NOTICE 'Nada a fazer: dependente ja consta com nome completo.';
    RETURN;
  END IF;

  v_org_id := v_atual.organization_id;
  SELECT COALESCE(MAX(versao),0)+1 INTO v_proxima
    FROM public.case_commercial_condition
   WHERE organization_id=v_org_id AND case_id=v_case_id AND archived_at IS NULL;

  v_terms := '10 (dez) parcelas mensais, rateadas igualitariamente entre os 3 (tres) contratantes adultos: '
          || 'R$ 320,00 por pessoa ao mes, total individual de R$ 3.200,00 — total dos honorarios R$ 9.600,00. '
          || 'Operacionalizado como 3 assinaturas mensais de R$ 320 por responsavel, durante 10 meses. '
          || 'Cada assinatura termina automaticamente apos a 10a cobranca.';

  INSERT INTO public.case_commercial_condition (
    organization_id, case_id, proposal_id, proposal_reference, versao,
    approved_items, fees, third_party_costs, official_fees, payment_terms,
    responsaveis_financeiros, parcelas, valor_parcela, moeda, validity,
    approval_status, aprovado_em, origem, observacao_interna
  ) VALUES (
    v_org_id, v_case_id, v_atual.proposal_id, v_atual.proposal_reference, v_proxima,
    jsonb_build_array(
      jsonb_build_object('parte','Ana Luiza Gomes Silveira Rodrigues','valor',3200,'escopo','Contratante 1 — Pesquisa histórica, dossiê-base e declaração individual; titular do dossiê-base'),
      jsonb_build_object('parte','Adair Pinto Silveira Júnior','valor',3200,'escopo','Contratante 2 — Aproveita o dossiê já produzido; elo documental direto, documentos pessoais e declaração própria'),
      jsonb_build_object('parte','Alice Gomes Silveira','valor',3200,'escopo','Contratante 3 — Aproveita 100% do dossiê-base compartilhado; certidões pessoais e declaração própria'),
      jsonb_build_object('parte','Felipe Silveira Rodrigues','valor',0,'escopo','Beneficiário dependente — menor representado por Ana Luiza no § 58c, sem assinatura e sem acréscimo de custo')
    ),
    v_atual.fees, v_atual.third_party_costs, v_atual.official_fees, v_terms,
    v_atual.responsaveis_financeiros, v_atual.parcelas, v_atual.valor_parcela,
    v_atual.moeda, v_atual.validity,
    'aprovada', now(), 'condicao_particular',
    'Versao ' || v_proxima || ' (2026-10-23): redacao canonica da condicao comercial e do rateio familiar '
    || '(Pacote Austria § 58c), fornecida pela Proprietaria. Correcoes em relacao a versao ' || v_atual.versao || ': '
    || '(1) nome completo do beneficiario dependente — "Felipe" passa a "Felipe Silveira Rodrigues"; '
    || '(2) partes rotuladas como Contratante 1, 2 e 3, como a redacao canonica nomeia; '
    || '(3) payment_terms passa a declarar explicitamente o rateio igualitario. '
    || 'NENHUM valor, parcela, prazo, responsavel, despesa, taxa ou validade alterado — o rateio segue '
    || 'R$ 3.200,00 por adulto em 10 parcelas de R$ 320,00, total R$ 9.600,00. Mesmo padrao da versao 2, '
    || 'que tambem nasceu para corrigir nome sem tocar valor.'
  ) RETURNING id INTO v_nova_id;

  UPDATE public.case_commercial_condition
     SET approval_status='substituida', updated_at=now()
   WHERE id = v_atual.id;

  -- O cadastro do dependente guardava o mesmo nome incompleto.
  UPDATE public.case_dependents
     SET nome_completo = 'Felipe Silveira Rodrigues'
   WHERE case_id = v_case_id AND nome_completo = 'Felipe';

  INSERT INTO public.audit_logs (
    organization_id, entidade, entidade_id, acao, valores_anteriores, valores_posteriores, metadados
  ) VALUES (
    v_org_id, 'case_commercial_condition', v_nova_id, 'condicao_comercial_versao_criada',
    jsonb_build_object('versao', v_atual.versao, 'approved_items', v_atual.approved_items, 'payment_terms', v_atual.payment_terms),
    jsonb_build_object('versao', v_proxima, 'total', v_atual.fees),
    jsonb_build_object('case_id', v_case_id,
      'motivo', 'Redacao canonica do rateio familiar (Pacote Austria 58c) e nome completo do dependente',
      'origem_da_ordem', 'Proprietaria autenticada')
  );
END $$;
