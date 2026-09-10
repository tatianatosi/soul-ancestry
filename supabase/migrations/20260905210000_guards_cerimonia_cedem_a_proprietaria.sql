-- Guards de cerimônia de processo cedem à proprietária.
--
-- Diagnóstico: 113 funções de guarda, 106 levantando exceção, nenhuma
-- reconhecendo a proprietária. Classificação:
--   isolamento de organização .... 24  → mantidos (protegem dado, não travam)
--   campo obrigatório ............ 18  → mantidos (evitam registro pela metade)
--   calculam campo ............... 36  → mantidos (liberar quebraria numeração)
--   cerimônia de processo ........ 27  → liberados aqui
--   demais ....................... 8
--
-- Autorizado expressamente pela proprietária em 05/09/2026, incluindo os três
-- guards jurídicos e de consentimento, após ressalva explícita do risco legal.
--
-- Fora da liberação, de propósito:
--   fn_portal_case_access_guard   fronteira entre clientes no App Cliente
--   fn_guard_cobranca             ato financeiro externo
--   fn_contracts_signature_guard  validade de assinatura

create or replace function public.fn_proprietaria_operando()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.staff_access s
     where s.auth_user_id = auth.uid()
       and s.status = 'active'
       and s.archived_at is null
       and s.role = 'admin'
  );
$$;

-- Cada guard da lista recebeu, logo após o BEGIN:
--
--   if public.fn_proprietaria_operando() then
--     if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
--   end if;
--
-- Lista aplicada (27):
--   fn_artifact_guard, fn_atendimento_solicitacao_guard, fn_case_dependent_guard,
--   fn_case_service_promocao_guard, fn_caso_ativacao_gates_guard, fn_caso_ativo_guard,
--   fn_decisao_guard, fn_evidence_guard, fn_finding_projecao_guard, fn_g02_evento_guard,
--   fn_g02_modulo_guard, fn_g02_variante_guard, fn_guard_consentimento_ativacao,
--   fn_guard_pesquisa_externa, fn_lead_desk_guard, fn_lead_dossie_guard,
--   fn_legal_clause_guard, fn_legal_matrix_guard, fn_nucleo_dossie_guard,
--   fn_piloto_contrato_guard, fn_quality_guard_ativacao, fn_research_case_estado_guard,
--   fn_rg_evento_guard, fn_rg_relatorio_guard, fn_rg_resumo_cliente_guard,
--   fn_sku_price_exception_guard, fn_third_party_expense_guard
--
-- Para reverter um guard específico, basta recriá-lo sem a cláusula acima.
-- Verificado após a aplicação: 27 guards cedendo + 1 função auxiliar.
