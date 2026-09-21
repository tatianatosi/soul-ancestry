-- Extensão autorizada da projeção do caso para o App Cliente (21/09/2026).
--
-- Por que: o mockup de 17 páginas mostra, na Home (1/7), a etapa atual do caso
-- com barra de progresso, e na Jornada (2/7) a linha do processo com a etapa
-- ativa destacada. O De-Para §3 (linha 2) e §4 (linha 2) repetem a mesma
-- exigência. Nada disso era possível: `portal_casos` projetava
-- id/codigo/titulo/pais/via/status/ativo/... e NENHUM campo de fase — então
-- `portal/jornada.tsx` usava uma lista fixa de passos, igual para todo caso, e
-- sem etapa ativa para cliente real.
--
-- A composição (individual / casal / núcleo familiar) entra pelo mesmo motivo:
-- o caso é do titular, do casal ou da família, e o cliente precisa ler isso na
-- própria tela em vez de deduzir.
--
-- O que NÃO muda: nenhuma policy, nenhum GRANT novo, nenhuma coluna de tabela,
-- nenhum dado. O gate continua sendo `portal_caso_permitido(c.id)`, e as
-- reloptions da view ficam exatamente como a migration 20260827151500 as
-- deixou (`security_barrier = true`) — este arquivo não altera o modelo de
-- segurança da view, só a lista de colunas projetadas.
--
-- Dívida declarada, NÃO corrigida aqui: a migration 20260822232251 tinha posto
-- `security_invoker = true` nesta view; o `create or replace ... with
-- (security_barrier = true)` de 20260827151500 substituiu as reloptions e
-- derrubou esse ajuste. Restaurá-lo exigiria policy de portal em `case_plans`
-- (hoje só `is_org_member`), o que é alteração de RLS — fora desta autorização.
--
-- Fonte da fase: `case_plans.fase_jornada`, que tem CHECK dos 8 valores
-- canônicos (`case_plans_fase_chk`, migration 20260821123530). Como um caso
-- pode ter um plano ativo por fase (índice `case_plans_um_ativo_por_fase`), a
-- fase corrente é a do plano ativo mais recentemente atualizado. Planos
-- arquivados e rascunhos não contam.
--
-- Nada de nota interna, responsável, pendência, bloqueio, SLA, marco ou
-- observação do plano é projetado: só fase e composição.

create or replace view public.portal_casos
with (security_barrier = true) as
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
  'Projeção do caso para o App Cliente. Gate: portal_caso_permitido(id). '
  'fase_jornada e composicao vêm do plano ativo mais recente do caso; '
  'nenhum outro campo de case_plans é exposto.';
