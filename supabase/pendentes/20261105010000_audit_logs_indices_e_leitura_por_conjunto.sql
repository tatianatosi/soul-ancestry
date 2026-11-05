-- ESTADO: PROPOSTA — NÃO APLICADA. Exige a palavra da Proprietária (migration + RLS), pela fila de microcortes.
-- Origem: otimização do banco pedida em 05/11/2026 00:33 UTC. Medição real (pg_stat_statements, 05/11 00:34 UTC):
--   1) contagem de audit_logs por organização ............ 608 chamadas, média 503 ms, máx. 1.143 ms (306 s no total)
--   2) audit_logs por organização ordenado por data ........ 103 chamadas, média 395 ms
--   3) audit_logs por organização ordenado por data ........ 140 chamadas, média 266 ms
--   4) audit_logs por entidade/ação/usuário/data ........... 542 chamadas, média 53 ms
--   Juntas, ~412 s — mais do que todas as outras consultas do topo somadas.
-- Causa: a tabela tem só 2.551 linhas (4,5 MB), mas (a) não há índice além da chave primária e (b) a política
-- de leitura `audit_select_admin` chama `has_org_role(organization_id,'admin')` — função SECURITY DEFINER, que o
-- Postgres não consegue embutir — UMA VEZ POR LINHA. Cada leitura avalia o papel 2.551 vezes.
--
-- O que faz (idempotente; não altera nem apaga dado; quem lê continua exatamente o mesmo):
--   Parte 1 — dois índices: (organization_id, created_at desc) e (entidade, entidade_id, acao, created_at desc).
--   Parte 2 — a política passa a comparar a organização com o CONJUNTO de organizações em que a pessoa é admin
--   ativa, calculado uma vez por consulta por `orgs_admin_ativas()`. Mesma regra de has_org_role: staff ativo na
--   organização (is_staff_ativo) E papel admin não arquivado em user_roles. A inserção (audit_insert_member) não muda.
--
-- Conferir antes:
--   select indexname from pg_indexes where schemaname='public' and tablename='audit_logs';            -- só audit_logs_pkey
--   select qual from pg_policies where tablename='audit_logs' and policyname='audit_select_admin';     -- has_org_role(...)
-- Conferir depois:
--   mesmos selects: 3 índices; qual = (organization_id IN (SELECT orgs_admin_ativas() ...))
--   Desk → Radar & Matrizes → "Erros do app e recusas" continua listando os mesmos registros para a admin;
--   usuário sem papel admin continua sem ler nenhum registro; slow_queries: média da consulta 1 abaixo de 50 ms.
-- Reverter: drop dos dois índices; recriar a política com `using (public.has_org_role(organization_id, 'admin'))`.

-- Parte 1 — índices
create index if not exists audit_logs_org_created_idx
  on public.audit_logs (organization_id, created_at desc);

create index if not exists audit_logs_entidade_acao_created_idx
  on public.audit_logs (entidade, entidade_id, acao, created_at desc);

-- Parte 2 — leitura por conjunto (mesma regra de has_org_role, avaliada uma vez)
create or replace function public.orgs_admin_ativas()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select r.organization_id
  from public.user_roles r
  where r.user_id = auth.uid()
    and r.role = 'admin'
    and r.archived_at is null
    and public.is_staff_ativo(r.organization_id)
$$;

revoke all on function public.orgs_admin_ativas() from public, anon;
grant execute on function public.orgs_admin_ativas() to authenticated;

drop policy if exists audit_select_admin on public.audit_logs;
create policy audit_select_admin on public.audit_logs
  for select to authenticated
  using (organization_id in (select public.orgs_admin_ativas()));
