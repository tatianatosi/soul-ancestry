-- O App Cliente precisa saber se o onboarding já começou para decidir quais
-- abas mostrar: antes do onboarding, só as 7 abas base (Home, Jornada, Radar,
-- Árvore, Docs, Legado, Conta); depois, mais Entrega, Fase 01 e Fase 02.
-- A view portal_casos não expunha essa data — sem ela, a decisão não tem
-- como ser tomada no servidor, e cai no cliente adivinhar.
create or replace view public.portal_casos
with (security_barrier = true) as
select c.id, c.organization_id, c.cliente_id, c.codigo, c.titulo, c.pais, c.via,
       c.status, c.ativo, c.suspenso_em, c.app_access_status, c.onboarding_iniciado_em,
       c.created_at, c.updated_at
from public.crm_casos c
where c.archived_at is null and public.portal_caso_permitido(c.id);

revoke all on public.portal_casos from anon;
grant select on public.portal_casos to authenticated;
