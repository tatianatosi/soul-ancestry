-- P4 (25/09/2026) — sinal sanitizado de "pendência humana" no App Cliente.
--
-- O item 5 do P4 pede que o cliente veja etapa, próximo marco, entrega e
-- pendência humana. `marco_atual` (case_plans) é texto livre de uso interno
-- sem vocabulário controlado — nenhuma tela do App jamais mandou texto do
-- staff cru ao cliente (etapa vem de `fase_jornada`, um enum fechado de 8
-- valores; a próxima entrega, de `proxima_entrega_prevista_em`, só a data).
-- Decisão da Proprietária: "próximo marco" cru fica Desk-only nesta rodada
-- (declarado em docs/arquitetura). "Pendência humana" segue o MESMO padrão
-- já usado para documento/pagamento pendente: um BOOLEANO, nunca o texto.
--
-- Esta migration recria `portal_casos` IDÊNTICA à de 20260925120000 (mesmas
-- reloptions, mesmo filtro portal_caso_permitido, mesmas colunas na mesma
-- ordem) e acrescenta no fim `pendencia_cliente_pendente` (boolean) = true
-- quando o plano ATIVO do caso (`case_plans.status = 'ativo'`) tem
-- `dependencias_cliente` não vazio. Nenhum texto de `case_plans` atravessa.

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
       ) as proxima_entrega_prevista_em,
       coalesce(
         (
           select cardinality(p2.dependencias_cliente) > 0
           from public.case_plans p2
           where p2.case_id = c.id
             and p2.status = 'ativo'
             and p2.archived_at is null
           order by p2.updated_at desc
           limit 1
         ),
         false
       ) as pendencia_cliente_pendente
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
  'Só fase_jornada e composicao atravessam de case_plans, só a DATA da '
  'próxima micro-entrega aberta (proxima_entrega_prevista_em) atravessa de '
  'ops_microentregas, e só um BOOLEANO (pendencia_cliente_pendente) atravessa '
  'de case_plans.dependencias_cliente — nenhuma nota interna, título, '
  'responsável, marco, texto de dependência, gate ou SLA.';
