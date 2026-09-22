-- Fixa, explicitamente, o modelo de acesso da view portal_casos (22/09/2026).
--
-- POR QUE ESTA MIGRATION EXISTE
--
-- A view vinha trocando de configuração por acidente: 20260822232251 ligou
-- `security_invoker = true`; 20260827151500 fez `create or replace ... with
-- (security_barrier = true)`, que substitui TODAS as reloptions e derrubou
-- aquele ajuste. Nenhuma das duas mudanças foi deliberada.
--
-- POR QUE `security_invoker` NÃO É O ESTADO SEGURO AQUI
--
-- Investigado contra as migrations, não presumido:
--
--   1. `portal_caso_permitido(_case)` (20260816152446) é `security definer` e
--      filtra por `auth.uid()`: exige acesso de portal ativo, não arquivado,
--      não expirado, nível `client_workspace`, acesso ao caso ativo e não
--      revogado, `c.cliente_id = a.client_id`, caso não arquivado,
--      `app_access_status = 'liberado'`, visibilidade workspace/completo,
--      consentimento e liberação de informação. O isolamento por cliente e por
--      caso está NO BANCO e independe da reloption da view.
--
--   2. A migration 20260816230357 DERRUBOU a policy `casos_select_portal` de
--      `crm_casos` — comentário original: "Portal do cliente: expor apenas
--      colunas seguras de casos e do próprio cadastro". A única policy de
--      SELECT que restou em `crm_casos` é `casos_select`, com
--      `is_org_member(organization_id)`, que um cliente não satisfaz.
--
-- Consequência: com `security_invoker = true`, a view passaria a ler
-- `crm_casos` sob a RLS do cliente, que NÃO tem policy — e devolveria zero
-- linha para todo cliente. Ligar `security_invoker` aqui não endurece nada;
-- quebra o App inteiro. A restrição de colunas da view É o mecanismo de acesso
-- desenhado, e `portal_caso_permitido` é a autorização.
--
-- O QUE ESTA MIGRATION FAZ
--
-- Torna a configuração deliberada e resistente a acidente: declara as duas
-- reloptions juntas, na mesma instrução, e documenta o motivo na própria view.
-- Nenhuma policy é criada, alterada ou removida. Nenhuma coluna muda. Nenhum
-- dado é tocado. A lista de colunas é idêntica à de 20260921160000.

create or replace view public.portal_casos
with (security_barrier = true, security_invoker = false) as
select c.id, c.organization_id, c.cliente_id, c.codigo, c.titulo, c.pais, c.via,
       c.status, c.ativo, c.suspenso_em, c.app_access_status, c.onboarding_iniciado_em,
       c.created_at, c.updated_at,
       p.fase_jornada,
       p.composicao
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
  'Só fase_jornada e composicao atravessam de case_plans — nenhuma nota '
  'interna, responsável, pendência, marco ou SLA.';
