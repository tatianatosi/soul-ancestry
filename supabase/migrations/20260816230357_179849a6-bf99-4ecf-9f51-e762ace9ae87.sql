-- Portal do cliente: expor apenas colunas seguras de casos e do próprio cadastro.
drop policy if exists "casos_select_portal" on public.crm_casos;
drop policy if exists "clientes_select_portal" on public.clientes;

create or replace view public.portal_casos
with (security_barrier = true) as
select c.id, c.organization_id, c.cliente_id, c.codigo, c.titulo, c.pais, c.via,
       c.status, c.ativo, c.suspenso_em, c.app_access_status, c.created_at, c.updated_at
from public.crm_casos c
where c.archived_at is null and public.portal_caso_permitido(c.id);

create or replace view public.portal_meu_cadastro
with (security_barrier = true) as
select cl.id, cl.organization_id, cl.nome, cl.nome_social, cl.email, cl.telefone,
       cl.pais_interesse, cl.status
from public.clientes cl
where cl.archived_at is null
  and cl.id = public.portal_meu_cliente()
  and cl.organization_id = public.portal_minha_org();

revoke all on public.portal_casos from anon;
revoke all on public.portal_meu_cadastro from anon;
grant select on public.portal_casos to authenticated;
grant select on public.portal_meu_cadastro to authenticated;