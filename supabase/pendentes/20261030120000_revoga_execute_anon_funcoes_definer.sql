-- ESTADO: JÁ APLICADO em 30/10/2026, com autorização da Proprietária (aplicado via consulta SQL do projeto Lovable; confirmado: zero funções DEFINER não-trigger executáveis por anon).
--
-- O que faz
--   Retira o direito de EXECUTE de `anon` e de `PUBLIC` em 35 funções SECURITY DEFINER do schema
--   public que hoje podem ser chamadas por qualquer pessoa sem login (RPC /rest/v1/rpc/<função>).
--   `authenticated` e `service_role` mantêm EXECUTE: o Desk, o App Cliente (inclusive
--   `portal_sou_contratante_financeiro` e `portal_membros_do_meu_caso`) e as server functions
--   continuam chamando as mesmas RPCs, com os mesmos nomes e argumentos.
--
-- Por quê
--   Conferido em produção em 30/10/2026 (leitura, com `set local role anon` e rollback):
--   `proxima_acao_prioritaria(uuid)` e `case_activation_pendencias(uuid)` devolveram, para o caso
--   CA-CID-PT-IND-2026-002, o motivo da próxima ação e os 12 portões de ativação, sem login.
--   Exige o UUID do caso (difícil de adivinhar), mas um cliente logado que descubra o UUID de
--   outro caso também lê. Autorização é RLS/servidor (AGENTS.md); estas funções não checam
--   `auth.uid()` nem organização.
--
-- Fora do escopo (de propósito)
--   * As 46 funções SECURITY DEFINER que retornam `trigger` (fn_*_guard etc.): não são chamáveis
--     como RPC, e o disparo por gatilho não depende de EXECUTE do chamador.
--   * Nenhuma tabela, policy, coluna ou dado é tocado. Sem DDL de schema.
--
-- Idempotente: REVOKE/GRANT repetidos não falham.
-- Reversão: ver o bloco ROLLBACK no fim.
-- Antes de aplicar: abrir /acesso (cliente), /equipe/entrar (equipe) e um caso no Desk; depois de
-- aplicar, repetir. Nenhum deve mudar.

do $$
declare
  f text;
  funcoes text[] := array[
    'case_activation_pendencias(uuid)',
    'case_gate_satisfeito_por_dado(uuid,text)',
    'consentimento_ativo(uuid,uuid)',
    'consentimento_dispensado(uuid,uuid)',
    'contract_parameters_completude(uuid)',
    'contract_parameters_pendencias(uuid)',
    'contract_pode_aprovar(uuid)',
    'contract_pode_financeiro(uuid)',
    'contract_pode_ler(uuid)',
    'contract_pode_preparar(uuid)',
    'fn_app_projection_compartilhada_com_cliente(uuid,uuid)',
    'fn_app_projection_org_bate(uuid,uuid)',
    'fn_decisao_proprietaria_ativa(uuid,text,text,interval)',
    'fn_eh_proprietaria_ativa(uuid)',
    'fn_proprietaria_operando()',
    'fn_sou_titular_app_projection(uuid)',
    'pode_iniciar_pesquisa_externa(uuid)',
    'pode_pesquisar_caso(uuid)',
    'portal_membros_do_meu_caso()',
    'portal_sou_contratante_financeiro(uuid)',
    'proxima_acao_prioritaria_lote(uuid[])',
    'proxima_acao_prioritaria(uuid)',
    'quality_relatorio_semanal(uuid,date)',
    'quality_scan(uuid)',
    'quality_sync_checklist(uuid)',
    'research_quality_scan(uuid)',
    'resolver_case_canonico(text)',
    'rg_admin(uuid)',
    'rg_editar(uuid)',
    'rg_ler_detalhe(uuid)',
    'rg_ler_resumo(uuid)',
    'rg_papel(uuid)',
    'rg_pode_editar_caso(uuid)',
    'rg_tem_evidencia_validada(text,uuid)',
    'validate_contract_readiness(uuid,uuid)'
  ];
begin
  foreach f in array funcoes loop
    -- Pula sem falhar se a função não existir neste ambiente.
    if to_regprocedure('public.' || f) is null then
      raise notice 'ignorada (nao existe): public.%', f;
      continue;
    end if;
    execute format('revoke execute on function public.%s from anon, public', f);
    execute format('grant execute on function public.%s to authenticated, service_role', f);
  end loop;
end $$;

-- Verificação (deve retornar zero linhas): funções DEFINER não-trigger ainda executáveis por anon.
-- select p.oid::regprocedure
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--  where n.nspname = 'public' and p.prosecdef
--    and p.prorettype <> 'trigger'::regtype
--    and has_function_privilege('anon', p.oid, 'execute');

-- ROLLBACK (só se algo quebrar; reabre o furo):
--   grant execute on function public.<assinatura> to anon;
--   (repetir para cada função da lista acima)
