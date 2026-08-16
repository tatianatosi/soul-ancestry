-- ============ ENUMS ============
create type public.app_role as enum ('admin','operacoes','pesquisador','comercial','financeiro','leitura');

-- ============ ORGANIZATIONS ============
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  demo boolean not null default false,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;

create table public.profiles (
  id uuid primary key,
  nome text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
grant select, insert, update on public.organization_members to authenticated;
grant all on public.organization_members to service_role;
alter table public.organization_members enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);
grant select, insert, update on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- ============ HELPERS (security definer) ============
create or replace function public.is_org_member(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = _org and m.user_id = auth.uid() and m.archived_at is null)
$$;

create or replace function public.has_org_role(_org uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid() and r.role = _role)
$$;

create or replace function public.can_write(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_member(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid()
      and r.role in ('admin','operacoes','pesquisador','comercial','financeiro'))
$$;

create or replace function public.can_write_financeiro(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_member(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid()
      and r.role in ('admin','financeiro'))
$$;

-- ============ AUDIT LOGS ============
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid,
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  valores_anteriores jsonb,
  valores_posteriores jsonb,
  metadados jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit_select_admin" on public.audit_logs for select to authenticated
  using (public.has_org_role(organization_id, 'admin'));
create policy "audit_insert_member" on public.audit_logs for insert to authenticated
  with check (public.is_org_member(organization_id));

-- ============ OPERATIONAL TABLES ============
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nome text not null,
  email text,
  telefone text,
  origem text,
  estagio text not null default 'novo',
  pais_interesse text,
  observacoes text,
  demo boolean not null default false,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nome text not null,
  email text,
  telefone text,
  documento text,
  pais_interesse text,
  status text not null default 'ativo',
  observacoes text,
  demo boolean not null default false,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crm_casos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  cliente_id uuid references public.clientes(id),
  codigo text not null,
  titulo text not null,
  pais text,
  via text not null default 'a-definir',
  status text not null default 'em_leitura',
  hipotese_elegibilidade text,
  contrato_assinado boolean not null default false,
  pagamento_confirmado boolean not null default false,
  documentos_minimos_ok boolean not null default false,
  condicoes_verificadas_em timestamptz,
  condicoes_verificadas_por uuid,
  ativo boolean not null default false,
  ativado_em timestamptz,
  ativado_por uuid,
  demo boolean not null default false,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidencias (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caso_id uuid references public.crm_casos(id),
  titulo text not null,
  tipo text not null default 'documento',
  status text not null default 'pendente',
  visibilidade text not null default 'interna',
  descricao text,
  storage_path text,
  demo boolean not null default false,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidencia_acessos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  evidencia_id uuid not null references public.evidencias(id),
  user_id uuid default auth.uid(),
  acao text not null,
  metadados jsonb,
  created_at timestamptz not null default now()
);

create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caso_id uuid references public.crm_casos(id),
  titulo text not null,
  descricao text,
  responsavel_id uuid,
  prioridade text not null default 'media',
  status text not null default 'aberta',
  prazo date,
  concluida_em timestamptz,
  demo boolean not null default false,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.eventos_financeiros (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caso_id uuid references public.crm_casos(id),
  tipo text not null default 'receita',
  descricao text not null,
  valor numeric(14,2) not null default 0,
  moeda text not null default 'BRL',
  status text not null default 'previsto',
  vencimento date,
  demo boolean not null default false,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.leads, public.clientes, public.crm_casos, public.evidencias, public.evidencia_acessos, public.tarefas, public.eventos_financeiros to authenticated;
grant all on public.leads, public.clientes, public.crm_casos, public.evidencias, public.evidencia_acessos, public.tarefas, public.eventos_financeiros to service_role;

alter table public.leads enable row level security;
alter table public.clientes enable row level security;
alter table public.crm_casos enable row level security;
alter table public.evidencias enable row level security;
alter table public.evidencia_acessos enable row level security;
alter table public.tarefas enable row level security;
alter table public.eventos_financeiros enable row level security;

-- ============ POLICIES ============
create policy "orgs_select_member" on public.organizations for select to authenticated
  using (public.is_org_member(id));
create policy "orgs_update_admin" on public.organizations for update to authenticated
  using (public.has_org_role(id,'admin')) with check (public.has_org_role(id,'admin'));

create policy "profiles_select_self_or_org" on public.profiles for select to authenticated
  using (id = auth.uid() or exists (
    select 1 from public.organization_members m1
    join public.organization_members m2 on m1.organization_id = m2.organization_id
    where m1.user_id = auth.uid() and m2.user_id = public.profiles.id));
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "members_select" on public.organization_members for select to authenticated
  using (public.is_org_member(organization_id));
create policy "members_write_admin" on public.organization_members for insert to authenticated
  with check (public.has_org_role(organization_id,'admin'));
create policy "members_update_admin" on public.organization_members for update to authenticated
  using (public.has_org_role(organization_id,'admin')) with check (public.has_org_role(organization_id,'admin'));

create policy "roles_select" on public.user_roles for select to authenticated
  using (public.is_org_member(organization_id));
create policy "roles_insert_admin" on public.user_roles for insert to authenticated
  with check (public.has_org_role(organization_id,'admin'));
create policy "roles_update_admin" on public.user_roles for update to authenticated
  using (public.has_org_role(organization_id,'admin')) with check (public.has_org_role(organization_id,'admin'));

create policy "leads_select" on public.leads for select to authenticated using (public.is_org_member(organization_id));
create policy "leads_insert" on public.leads for insert to authenticated with check (public.can_write(organization_id));
create policy "leads_update" on public.leads for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

create policy "clientes_select" on public.clientes for select to authenticated using (public.is_org_member(organization_id));
create policy "clientes_insert" on public.clientes for insert to authenticated with check (public.can_write(organization_id));
create policy "clientes_update" on public.clientes for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

create policy "casos_select" on public.crm_casos for select to authenticated using (public.is_org_member(organization_id));
create policy "casos_insert" on public.crm_casos for insert to authenticated with check (public.can_write(organization_id));
create policy "casos_update" on public.crm_casos for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

create policy "evid_select" on public.evidencias for select to authenticated using (public.is_org_member(organization_id));
create policy "evid_insert" on public.evidencias for insert to authenticated with check (public.can_write(organization_id));
create policy "evid_update" on public.evidencias for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

create policy "evid_acesso_select" on public.evidencia_acessos for select to authenticated using (public.is_org_member(organization_id));
create policy "evid_acesso_insert" on public.evidencia_acessos for insert to authenticated with check (public.is_org_member(organization_id));

create policy "tarefas_select" on public.tarefas for select to authenticated using (public.is_org_member(organization_id));
create policy "tarefas_insert" on public.tarefas for insert to authenticated with check (public.can_write(organization_id));
create policy "tarefas_update" on public.tarefas for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

create policy "fin_select" on public.eventos_financeiros for select to authenticated
  using (public.is_org_member(organization_id) and (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'financeiro')));
create policy "fin_insert" on public.eventos_financeiros for insert to authenticated with check (public.can_write_financeiro(organization_id));
create policy "fin_update" on public.eventos_financeiros for update to authenticated
  using (public.can_write_financeiro(organization_id)) with check (public.can_write_financeiro(organization_id));

-- ============ NO PHYSICAL DELETE ============
create or replace function public.fn_block_delete()
returns trigger language plpgsql as $$
begin
  raise exception 'Exclusão física não permitida em %. Use arquivamento (archived_at, archived_by, archive_motivo).', TG_TABLE_NAME;
end $$;

create trigger no_delete_leads before delete on public.leads for each row execute function public.fn_block_delete();
create trigger no_delete_clientes before delete on public.clientes for each row execute function public.fn_block_delete();
create trigger no_delete_casos before delete on public.crm_casos for each row execute function public.fn_block_delete();
create trigger no_delete_evidencias before delete on public.evidencias for each row execute function public.fn_block_delete();
create trigger no_delete_evid_acessos before delete on public.evidencia_acessos for each row execute function public.fn_block_delete();
create trigger no_delete_tarefas before delete on public.tarefas for each row execute function public.fn_block_delete();
create trigger no_delete_fin before delete on public.eventos_financeiros for each row execute function public.fn_block_delete();
create trigger no_delete_audit before delete on public.audit_logs for each row execute function public.fn_block_delete();

-- ============ ARCHIVE METADATA ============
create or replace function public.fn_archive_meta()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.archived_at is not null and OLD.archived_at is null then
    NEW.archived_by := coalesce(NEW.archived_by, auth.uid());
    if NEW.archive_motivo is null or length(trim(NEW.archive_motivo)) = 0 then
      raise exception 'Informe o motivo do arquivamento.';
    end if;
  end if;
  return NEW;
end $$;

create trigger archive_leads before update on public.leads for each row execute function public.fn_archive_meta();
create trigger archive_clientes before update on public.clientes for each row execute function public.fn_archive_meta();
create trigger archive_casos before update on public.crm_casos for each row execute function public.fn_archive_meta();
create trigger archive_evidencias before update on public.evidencias for each row execute function public.fn_archive_meta();
create trigger archive_tarefas before update on public.tarefas for each row execute function public.fn_archive_meta();
create trigger archive_fin before update on public.eventos_financeiros for each row execute function public.fn_archive_meta();

-- ============ CASE ACTIVATION GUARD ============
create or replace function public.fn_guard_ativacao()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.ativo and not coalesce(OLD.ativo,false) then
    if not (NEW.contrato_assinado and NEW.pagamento_confirmado and NEW.documentos_minimos_ok) then
      raise exception 'Ativação bloqueada: contrato assinado, pagamento confirmado e documentos mínimos são obrigatórios.';
    end if;
    if NEW.condicoes_verificadas_em is null then
      raise exception 'Ativação bloqueada: condições obrigatórias ainda não verificadas.';
    end if;
    NEW.ativado_em := now();
    NEW.ativado_por := auth.uid();
  end if;
  return NEW;
end $$;
create trigger guard_ativacao before update on public.crm_casos for each row execute function public.fn_guard_ativacao();

-- ============ AUDIT TRIGGER ============
create or replace function public.fn_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_id uuid;
begin
  v_org := (to_jsonb(NEW)->>'organization_id')::uuid;
  v_id := (to_jsonb(NEW)->>'id')::uuid;
  insert into public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, valores_anteriores, valores_posteriores)
  values (v_org, auth.uid(), lower(TG_OP), TG_TABLE_NAME, v_id,
    case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end, to_jsonb(NEW));
  return NEW;
end $$;

create trigger audit_leads after insert or update on public.leads for each row execute function public.fn_audit();
create trigger audit_clientes after insert or update on public.clientes for each row execute function public.fn_audit();
create trigger audit_casos after insert or update on public.crm_casos for each row execute function public.fn_audit();
create trigger audit_evidencias after insert or update on public.evidencias for each row execute function public.fn_audit();
create trigger audit_tarefas after insert or update on public.tarefas for each row execute function public.fn_audit();
create trigger audit_fin after insert or update on public.eventos_financeiros for each row execute function public.fn_audit();

-- ============ UPDATED_AT ============
create trigger t_upd_orgs before update on public.organizations for each row execute function public.update_updated_at_column();
create trigger t_upd_profiles before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger t_upd_members before update on public.organization_members for each row execute function public.update_updated_at_column();
create trigger t_upd_leads before update on public.leads for each row execute function public.update_updated_at_column();
create trigger t_upd_clientes before update on public.clientes for each row execute function public.update_updated_at_column();
create trigger t_upd_casos before update on public.crm_casos for each row execute function public.update_updated_at_column();
create trigger t_upd_evid before update on public.evidencias for each row execute function public.update_updated_at_column();
create trigger t_upd_tarefas before update on public.tarefas for each row execute function public.update_updated_at_column();
create trigger t_upd_fin before update on public.eventos_financeiros for each row execute function public.update_updated_at_column();

-- ============ BOOTSTRAP + DEMO SEED ============
create or replace function public.bootstrap_minha_organizacao(_nome text default 'Clube Ancestral (DEMO)')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_user uuid := auth.uid(); v_cliente uuid; v_caso uuid;
begin
  if v_user is null then raise exception 'Sessão obrigatória.'; end if;
  select m.organization_id into v_org from public.organization_members m where m.user_id = v_user and m.archived_at is null limit 1;
  if v_org is not null then return v_org; end if;

  insert into public.organizations (nome, slug, demo)
  values (_nome, 'org-' || replace(v_user::text,'-',''), true) returning id into v_org;

  insert into public.profiles (id, nome, email)
  select v_user, u.raw_user_meta_data->>'nome', u.email from auth.users u where u.id = v_user
  on conflict (id) do nothing;

  insert into public.organization_members (organization_id, user_id) values (v_org, v_user);
  insert into public.user_roles (organization_id, user_id, role) values (v_org, v_user, 'admin');

  insert into public.leads (organization_id, nome, email, telefone, origem, estagio, pais_interesse, observacoes, demo, created_by)
  values
    (v_org,'DEMO — Marina Fictícia','marina.demo@exemplo.test','+55 11 90000-0001','Instagram','novo','Itália','DEMO — não usar dados reais.',true,v_user),
    (v_org,'DEMO — Rodrigo Exemplo','rodrigo.demo@exemplo.test','+55 21 90000-0002','Indicação','qualificado','Portugal','DEMO — não usar dados reais.',true,v_user);

  insert into public.clientes (organization_id, nome, email, telefone, pais_interesse, status, observacoes, demo, created_by)
  values (v_org,'DEMO — Família Exemplo','familia.demo@exemplo.test','+55 51 90000-0003','Itália','ativo','DEMO — não usar dados reais.',true,v_user)
  returning id into v_cliente;

  insert into public.crm_casos (organization_id, cliente_id, codigo, titulo, pais, via, status, hipotese_elegibilidade, demo, created_by)
  values (v_org, v_cliente,'DEMO-001','DEMO — Linha materna fictícia','Itália','a-definir','em_leitura','Hipótese preliminar — depende de confirmação documental.',true,v_user)
  returning id into v_caso;

  insert into public.evidencias (organization_id, caso_id, titulo, tipo, status, visibilidade, descricao, demo, created_by)
  values
    (v_org,v_caso,'DEMO — Certidão de nascimento (fictícia)','certidao','pendente','interna','DEMO — não usar dados reais.',true,v_user),
    (v_org,v_caso,'DEMO — Registro paroquial (fictício)','registro','em_validacao','cliente','DEMO — não usar dados reais.',true,v_user);

  insert into public.tarefas (organization_id, caso_id, titulo, prioridade, status, demo, created_by)
  values
    (v_org,v_caso,'DEMO — Organizar cadeia familiar','alta','aberta',true,v_user),
    (v_org,v_caso,'DEMO — Conferir grafias dos sobrenomes','media','aberta',true,v_user);

  insert into public.eventos_financeiros (organization_id, caso_id, tipo, descricao, valor, status, demo, created_by)
  values (v_org,v_caso,'receita','DEMO — Parcela de pesquisa (fictícia)',1500.00,'previsto',true,v_user);

  return v_org;
end $$;

revoke all on function public.bootstrap_minha_organizacao(text) from public;
grant execute on function public.bootstrap_minha_organizacao(text) to authenticated;