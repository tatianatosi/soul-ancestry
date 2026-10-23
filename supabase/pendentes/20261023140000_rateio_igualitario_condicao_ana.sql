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

-- Rateio igualitário da condição comercial do caso CA-CID-AT-FAM-2026-001 (23/10/2026).
--
-- Ordem da Proprietária, reafirmando decisão já aprovada várias vezes: o total
-- de R$ 9.600,00 é rateado IGUALITARIAMENTE entre os três adultos — R$ 3.200,00
-- cada, em 10 parcelas mensais de R$ 320,00 por pessoa. Felipe, menor
-- representado, sem acréscimo. Literal da Proprietária em 23/10/2026: "fica 3
-- vezes de 320 por pessoa, 10 parcelas conforme esta acordado na proposta".
--
-- O que muda: só `approved_items[].valor`. A versão 2 aprovada guardava a
-- composição desigual lida das páginas 4 e 6 do deck (Ana R$ 4.800, Adair
-- R$ 2.400, Alice R$ 2.400) — dimensionamento técnico interno de horas, que não
-- é a obrigação de cada contratante. Total, parcelas, valor da parcela, forma de
-- pagamento, responsáveis financeiros, despesas, taxas e validade não mudam:
-- `payment_terms` já dizia "3 assinaturas mensais de R$ 320 por responsável".
--
-- Como muda: VERSÃO NOVA, nunca reescrita da anterior — mesma regra do writer
-- `novaVersao` (`condicao-comercial-caso.functions.ts`) e do índice único
-- `ccc_versao_unica`. A versão 2 passa a `substituida` e a 3 nasce `aprovada`.
--
-- Por que `aprovada` e não `rascunho`: `condicaoVigente()`
-- (`condicao-comercial-caso.ts:53`) só considera `approval_status = 'aprovada'`.
-- Criar a v3 como rascunho e substituir a v2 deixaria o caso SEM condição
-- vigente — o Caso 360 pararia de mostrar a condição e a conferência viraria
-- nula. A v2 também nasceu `aprovada` pelo canal de dados (`created_by` nulo,
-- `aprovado_por` nulo, `aprovado_em` preenchido); esta segue o mesmo padrão.
--
-- Aritmética conferida nas duas vias que `conferirCondicao` usa:
--   3 × R$ 3.200,00                = R$ 9.600,00 = `fees`
--   3 responsáveis × R$ 320 × 10   = R$ 9.600,00
--
-- Idempotente: só age se ainda existir uma versão aprovada com valor desigual.
-- Reaplicar não cria versão duplicada nem altera nada.

BEGIN;

DO $$
DECLARE
  v_case_id uuid := 'a11a0000-0000-4000-8000-000000000002';
  v_org_id  uuid;
  v_atual   public.case_commercial_condition;
  v_nova_id uuid;
  v_proxima integer;
BEGIN
  -- A condição aprovada vigente do caso, só se ainda carregar o rateio desigual.
  SELECT * INTO v_atual
    FROM public.case_commercial_condition
   WHERE case_id = v_case_id
     AND archived_at IS NULL
     AND approval_status = 'aprovada'
     AND approved_items::text LIKE '%4800%'
   ORDER BY versao DESC
   LIMIT 1;

  IF NOT FOUND THEN
    RAISE NOTICE 'Rateio igualitário: nada a fazer (nenhuma versão aprovada com valor desigual).';
    RETURN;
  END IF;

  v_org_id := v_atual.organization_id;

  SELECT COALESCE(MAX(versao), 0) + 1 INTO v_proxima
    FROM public.case_commercial_condition
   WHERE organization_id = v_org_id AND case_id = v_case_id AND archived_at IS NULL;

  INSERT INTO public.case_commercial_condition (
    organization_id, case_id, proposal_id, proposal_reference, versao,
    approved_items, fees, third_party_costs, official_fees, payment_terms,
    responsaveis_financeiros, parcelas, valor_parcela, moeda, validity,
    approval_status, aprovado_em, origem, observacao_interna
  ) VALUES (
    v_org_id, v_case_id, v_atual.proposal_id, v_atual.proposal_reference, v_proxima,
    -- Escopos preservados palavra por palavra: o trabalho de cada pessoa não
    -- mudou. Só o valor passa a ser a cota igualitária de cada contratante.
    jsonb_build_array(
      jsonb_build_object(
        'parte', 'Ana Luiza Gomes Silveira Rodrigues',
        'valor', 3200,
        'escopo', 'Pesquisa histórica, dossiê-base e declaração individual; titular do dossiê-base'
      ),
      jsonb_build_object(
        'parte', 'Adair Pinto Silveira Júnior',
        'valor', 3200,
        'escopo', 'Aproveita o dossiê já produzido; elo documental direto, documentos pessoais e declaração própria'
      ),
      jsonb_build_object(
        'parte', 'Alice Gomes Silveira',
        'valor', 3200,
        'escopo', 'Aproveita 100% do dossiê-base compartilhado; certidões pessoais e declaração própria'
      ),
      jsonb_build_object(
        'parte', 'Felipe',
        'valor', 0,
        'escopo', 'Dependente menor representado — sem assinatura e sem cobrança própria'
      )
    ),
    v_atual.fees, v_atual.third_party_costs, v_atual.official_fees, v_atual.payment_terms,
    v_atual.responsaveis_financeiros, v_atual.parcelas, v_atual.valor_parcela,
    v_atual.moeda, v_atual.validity,
    'aprovada', now(), 'condicao_particular',
    'Versao ' || v_proxima || ' (2026-10-23): rateio IGUALITARIO entre os tres adultos, ' ||
    'por ordem da Proprietaria reafirmando decisao ja aprovada varias vezes — R$ 3.200,00 ' ||
    'para cada (Ana Luiza, Adair e Alice), em 10 parcelas mensais de R$ 320,00 por pessoa; ' ||
    'Felipe menor representado sem acrescimo. A versao ' || v_atual.versao || ' guardava a ' ||
    'composicao desigual lida das paginas 4 e 6 do deck (4.800 / 2.400 / 2.400), que era ' ||
    'dimensionamento tecnico interno de horas e nao a obrigacao de cada contratante. Total, ' ||
    'parcelas, valor da parcela, forma de pagamento, responsaveis, despesas, taxas e validade ' ||
    'inalterados. Escopos preservados na integra. Soma conferida: 3 x 3.200 = 9.600 = fees; ' ||
    '3 responsaveis x 320 x 10 = 9.600.'
  )
  RETURNING id INTO v_nova_id;

  -- A anterior é substituída, nunca reescrita nem apagada.
  UPDATE public.case_commercial_condition
     SET approval_status = 'substituida', updated_at = now()
   WHERE id = v_atual.id;

  INSERT INTO public.audit_logs (
    organization_id, entidade, entidade_id, acao, valores_anteriores, valores_posteriores, metadados
  ) VALUES (
    v_org_id, 'case_commercial_condition', v_nova_id, 'condicao_comercial_versao_criada',
    jsonb_build_object('versao', v_atual.versao, 'approved_items', v_atual.approved_items),
    jsonb_build_object('versao', v_proxima, 'total', v_atual.fees),
    jsonb_build_object(
      'case_id', v_case_id,
      'motivo', 'Rateio igualitario entre os tres adultos (R$ 3.200,00 cada) por ordem da Proprietaria em 23/10/2026',
      'origem_da_ordem', 'Proprietaria autenticada, decisao reafirmada'
    )
  );

  RAISE NOTICE 'Rateio igualitário: versão % criada e aprovada; versão % passou a substituída.',
    v_proxima, v_atual.versao;
END $$;

COMMIT;
