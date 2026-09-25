-- P3 (25/09/2026) — projeção sanitizada da próxima entrega no App Cliente.
--
-- O App lê só portal_casos (teste de fronteira proíbe ops_microentregas no
-- caminho do portal). Esta migration recria a view IDÊNTICA à de
-- 20260922120000 (mesmas reloptions, mesmo filtro portal_caso_permitido,
-- mesmas colunas, na mesma ordem) e acrescenta UMA coluna no fim:
--
--   proxima_entrega_prevista_em (date) = menor prazo entre as micro-entregas
--   do caso não arquivadas e não concluídas/canceladas.
--
-- Só a data atravessa: nenhum título, descrição, responsável, critério de
-- aceite, evidência ou status interno. Nenhuma policy muda, nenhum dado é
-- tocado. Reversão: recriar a view de 20260922120000 (sem a coluna).

create or replace view public.portal_casos
with (security_barrier = true, security_invoker = false) as
select c.id, c.organization_id, c.cliente_id, c.codigo, c.titulo, c.pais, c.via,
       c.status, c.ativo, c.suspenso_em, c.app_access_status, c.onboarding_iniciado_em,
       c.created_at, c.updated_at,
       p.fase_jornada,
       p.composicao,
       (
         select min(m.prazo)
         from public.ops_microentregas m
         where m.caso_id = c.id
           and m.archived_at is null
           and m.status not in ('concluida', 'cancelada')
       ) as proxima_entrega_prevista_em
from public.crm_casos c
left join lateral (
  select cp.fase_jornada, cp.composicao
  from public.case_plans cp
  where cp.case_id = c.id
    and cp.status = 'ativo'
    and cp.archived_at is null
  order by cp.updated_at desc
  limit 1
) p on true
where c.archived_at is null and public.portal_caso_permitido(c.id);

revoke all on public.portal_casos from anon;
grant select on public.portal_casos to authenticated;

comment on view public.portal_casos is
  'Projeção do caso para o App Cliente. security_invoker = false é DELIBERADO: '
  'a autorização vem de portal_caso_permitido(id), que é security definer e '
  'filtra por auth.uid(); crm_casos não tem policy de portal desde a migration '
  '20260816230357, então invoker=true devolveria zero linha ao cliente. '
  'Só fase_jornada e composicao atravessam de case_plans, e só a DATA da '
  'próxima micro-entrega aberta (proxima_entrega_prevista_em) atravessa de '
  'ops_microentregas — nenhuma nota interna, título, responsável, pendência, '
  'marco ou SLA.';
