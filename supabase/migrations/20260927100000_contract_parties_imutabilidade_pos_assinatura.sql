-- Fase 0 (27/09/2026) — "Prompt Canônicos: Fichas, Evidências, Identidade e
-- Contrato": snapshot de contract_parties deve ser imutável após a
-- assinatura do contrato; correção deve gerar nova versão/aditivo, nunca
-- alterar o que já foi assinado.
--
-- Achado real (investigação desta sessão): hoje nada no banco impede um
-- UPDATE direto em contract_parties depois de contracts.status='signed' —
-- só a geração de rascunho (gerarRascunhoInterno) e a checagem de
-- aplicação (sincronizarPessoaDoCaso/sincronizarContatoPartesDoCaso)
-- bloqueiam no nível do app. fn_contract_parties_guard() já roda BEFORE
-- INSERT OR UPDATE em contract_parties (migration 20260816155807) — só
-- valida representação de menor. Esta migration estende a MESMA função,
-- aditivamente, sem remover a regra existente.
--
-- IMPORTANTE: NÃO aplicada ao banco de produção nesta rodada — proposta
-- para confirmação explícita da Proprietária antes de qualquer `supabase
-- db push`/aplicação manual, por ser mudança de trigger em tabela com
-- dado de contrato já assinado.

CREATE OR REPLACE FUNCTION public.fn_contract_parties_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_signed_at timestamptz;
BEGIN
  IF NEW.signature_required AND NEW.legal_capacity_status IN ('minor', 'legal_representative_required')
     AND NEW.represented_by_party_id IS NULL THEN
    RAISE EXCEPTION 'Parte menor de idade não pode assinar sem representante legal vinculado.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT signed_at INTO v_signed_at FROM public.contracts WHERE id = NEW.contract_id;
    IF v_signed_at IS NOT NULL THEN
      RAISE EXCEPTION 'Contrato já assinado: partes não podem ser alteradas. Use complementar ou aditivo.';
    END IF;
  END IF;

  RETURN NEW;
END $$;

COMMENT ON FUNCTION public.fn_contract_parties_guard() IS
  'Guarda de contract_parties: representação de menor (original) + imutabilidade pós-assinatura (Fase 0, 27/09/2026) — nenhum UPDATE é aceito depois que contracts.signed_at é preenchido.';
