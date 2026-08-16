-- ===================== ENUMS =====================
create type public.portal_access_status as enum ('pending','invited','active','suspended','revoked','expired');
create type public.portal_access_level as enum ('proposal_portal','client_workspace');
create type public.portal_case_status as enum ('active','suspended','revoked');
create type public.portal_event_type as enum (
  'invite_created','invite_resent','magic_link_requested','magic_link_sent','authenticated',
  'authentication_denied','access_denied','access_revoked','access_suspended',
  'case_access_granted','case_access_revoked','session_expired');

-- ===================== COLUNAS DE LIBERAÇÃO =====================
alter table public.crm_casos
  add column if not exists app_access_status text not null default 'bloqueado',
  add column if not exists app_visibility_level text not null default 'nenhum',
  add column if not exists consentimento_compartilhamento boolean not null default false,
  add column if not exists info_cliente_liberada boolean not null default false;

alter table public.evidencias
  add column if not exists liberada_cliente boolean not null default false,
  add column if not exists origem text not null default 'interna';

alter table public.eventos_financeiros
  add column if not exists liberada_cliente boolean not null default false;

-- ===================== TABELAS DO PORTAL =====================
create table public.client_portal_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clientes(id),
  auth_user_id uuid,
  email text not null,
  access_status public.portal_access_status not null default 'pending',
  access_level public.portal_access_level not null default 'proposal_portal',
  invited_at timestamptz,
  invited_by uuid,
  invitation_expires_at timestamptz,
  first_authenticated_at timestamptz,
  last_authenticated_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid,
  revocation_reason text,
  notes_internal text,
  demo boolean not null default false,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_by uuid default auth.uid(),
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index client_portal_access_ativo_unico
  on public.client_portal_access (organization_id, client_id, email)
  where archived_at is null and access_status <> 'revoked';
create index client_portal_access_email_idx on public.client_portal_access (lower(email));
create index client_portal_access_user_idx on public.client_portal_access (auth_user_id);

grant select, insert, update on public.client_portal_access to authenticated;
grant all on public.client_portal_access to service_role;
alter table public.client_portal_access enable row level security;

create table public.client_portal_case_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_portal_access_id uuid not null references public.client_portal_access(id),
  case_id uuid not null references public.crm_casos(id),
  access_status public.portal_case_status not null default 'active',
  granted_at timestamptz not null default now(),
  granted_by uuid default auth.uid(),
  revoked_at timestamptz,
  revoked_by uuid,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_portal_access_id, case_id)
);
grant select, insert, update on public.client_portal_case_access to authenticated;
grant all on public.client_portal_case_access to service_role;
alter table public.client_portal_case_access enable row level security;

create table public.client_access_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_portal_access_id uuid references public.client_portal_access(id),
  auth_user_id uuid,
  event_type public.portal_event_type not null,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index client_access_events_acesso_idx on public.client_access_events (client_portal_access_id, occurred_at desc);
grant select, insert on public.client_access_events to authenticated;
grant all on public.client_access_events to service_role;
alter table public.client_access_events enable row level security;

-- ===================== HELPERS (security definer) =====================
create or replace function public.portal_meu_acesso()
returns uuid language sql stable security definer set search_path = public as $$
  select a.id from public.client_portal_access a
  where a.auth_user_id = auth.uid()
    and a.archived_at is null
    and a.access_status = 'active'
  limit 1
$$;

create or replace function public.portal_minha_org()
returns uuid language sql stable security definer set search_path = public as $$
  select a.organization_id from public.client_portal_access a
  where a.id = public.portal_meu_acesso()
$$;

create or replace function public.portal_meu_cliente()
returns uuid language sql stable security definer set search_path = public as $$
  select a.client_id from public.client_portal_access a
  where a.id = public.portal_meu_acesso()
$$;

create or replace function public.portal_meu_nivel()
returns public.portal_access_level language sql stable security definer set search_path = public as $$
  select a.access_level from public.client_portal_access a
  where a.id = public.portal_meu_acesso()
$$;

-- Todas as condições de liberação de caso, validadas no banco.
create or replace function public.portal_caso_permitido(_case uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.client_portal_access a
    join public.client_portal_case_access ca
      on ca.client_portal_access_id = a.id
     and ca.organization_id = a.organization_id
     and ca.access_status = 'active'
     and ca.revoked_at is null
    join public.crm_casos c
      on c.id = ca.case_id
     and c.organization_id = a.organization_id
    where a.auth_user_id = auth.uid()
      and a.archived_at is null
      and a.access_status = 'active'
      and a.access_level = 'client_workspace'
      and (a.invitation_expires_at is null or a.invitation_expires_at > now() or a.first_authenticated_at is not null)
      and ca.case_id = _case
      and c.cliente_id = a.client_id
      and c.archived_at is null
      and c.app_access_status = 'liberado'
      and c.app_visibility_level in ('workspace','completo')
      and c.consentimento_compartilhamento = true
      and c.info_cliente_liberada = true
  )
$$;

revoke all on function public.portal_meu_acesso() from public, anon, authenticated;
revoke all on function public.portal_minha_org() from public, anon, authenticated;
revoke all on function public.portal_meu_cliente() from public, anon, authenticated;
revoke all on function public.portal_meu_nivel() from public, anon, authenticated;
revoke all on function public.portal_caso_permitido(uuid) from public, anon, authenticated;

-- ===================== RLS: TABELAS DO PORTAL =====================
-- Equipe interna: admin e operações administram; demais membros apenas leem.
create policy "cpa_select_member" on public.client_portal_access for select to authenticated
  using (public.is_org_member(organization_id));
create policy "cpa_select_own" on public.client_portal_access for select to authenticated
  using (auth_user_id = auth.uid());
create policy "cpa_insert_admin_ops" on public.client_portal_access for insert to authenticated
  with check (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'));
create policy "cpa_update_admin_ops" on public.client_portal_access for update to authenticated
  using (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'))
  with check (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'));

create policy "cpca_select_member" on public.client_portal_case_access for select to authenticated
  using (public.is_org_member(organization_id));
create policy "cpca_select_own" on public.client_portal_case_access for select to authenticated
  using (client_portal_access_id = public.portal_meu_acesso() and access_status = 'active');
create policy "cpca_insert_admin_ops" on public.client_portal_case_access for insert to authenticated
  with check (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'));
create policy "cpca_update_admin_ops" on public.client_portal_case_access for update to authenticated
  using (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'))
  with check (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'));

-- Eventos: equipe lê, membros e o próprio portal registram; nunca são apagados.
create policy "cae_select_member" on public.client_access_events for select to authenticated
  using (public.is_org_member(organization_id));
create policy "cae_insert_member" on public.client_access_events for insert to authenticated
  with check (public.is_org_member(organization_id) or organization_id = public.portal_minha_org());

-- ===================== RLS: LEITURA DO CLIENTE =====================
create policy "clientes_select_portal" on public.clientes for select to authenticated
  using (id = public.portal_meu_cliente() and organization_id = public.portal_minha_org() and archived_at is null);

create policy "casos_select_portal" on public.crm_casos for select to authenticated
  using (public.portal_caso_permitido(id));

create policy "evidencias_select_portal" on public.evidencias for select to authenticated
  using (
    liberada_cliente = true
    and archived_at is null
    and caso_id is not null
    and public.portal_caso_permitido(caso_id)
  );

create policy "evidencias_insert_portal" on public.evidencias for insert to authenticated
  with check (
    organization_id = public.portal_minha_org()
    and caso_id is not null
    and public.portal_caso_permitido(caso_id)
    and origem = 'cliente'
    and status = 'pending_review'
    and visibilidade = 'interna'
    and liberada_cliente = false
  );

create policy "fin_select_portal" on public.eventos_financeiros for select to authenticated
  using (
    liberada_cliente = true
    and archived_at is null
    and caso_id is not null
    and public.portal_caso_permitido(caso_id)
  );

create policy "evid_acessos_insert_portal" on public.evidencia_acessos for insert to authenticated
  with check (organization_id = public.portal_minha_org());

-- ===================== INTEGRIDADE E TRILHA =====================
create trigger no_delete_cpa before delete on public.client_portal_access for each row execute function public.fn_block_delete();
create trigger no_delete_cpca before delete on public.client_portal_case_access for each row execute function public.fn_block_delete();
create trigger no_delete_cae before delete on public.client_access_events for each row execute function public.fn_block_delete();

create trigger t_upd_cpa before update on public.client_portal_access for each row execute function public.update_updated_at_column();
create trigger t_upd_cpca before update on public.client_portal_case_access for each row execute function public.update_updated_at_column();

create trigger archive_cpa before update on public.client_portal_access for each row execute function public.fn_archive_meta();

create trigger audit_cpa after insert or update on public.client_portal_access for each row execute function public.fn_audit();
create trigger audit_cpca after insert or update on public.client_portal_case_access for each row execute function public.fn_audit();

-- O cliente autenticado nunca altera o próprio nível/status de acesso:
-- não há policy de update para auth_user_id, apenas para admin/operações.
