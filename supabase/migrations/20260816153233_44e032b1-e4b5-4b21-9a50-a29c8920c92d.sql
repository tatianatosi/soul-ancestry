-- ===================== ENUM =====================
create type public.staff_status as enum ('invited','active','suspended','revoked');

-- ===================== STAFF ACCESS =====================
create table public.staff_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  auth_user_id uuid,
  email text not null,
  full_name text,
  role public.app_role not null default 'leitura',
  status public.staff_status not null default 'invited',
  invited_at timestamptz not null default now(),
  invited_by uuid,
  invitation_expires_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  suspended_by uuid,
  revoked_at timestamptz,
  revoked_by uuid,
  reason text,
  last_login_at timestamptz,
  demo boolean not null default false,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  created_by uuid default auth.uid(),
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index staff_access_email_org_unico
  on public.staff_access (organization_id, lower(email))
  where archived_at is null;
create index staff_access_user_idx on public.staff_access (auth_user_id);
create index staff_access_email_idx on public.staff_access (lower(email));

grant select, insert, update on public.staff_access to authenticated;
grant all on public.staff_access to service_role;
alter table public.staff_access enable row level security;

-- ===================== CONTROLE DE TENTATIVAS =====================
-- Guarda apenas um identificador embaralhado e o horário. Sem e-mail em texto,
-- sem senha, sem token, sem URL de redefinição.
create table public.auth_throttle (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  subject_hash text not null,
  occurred_at timestamptz not null default now()
);
create index auth_throttle_idx on public.auth_throttle (scope, subject_hash, occurred_at desc);
grant all on public.auth_throttle to service_role;
alter table public.auth_throttle enable row level security;
-- sem policies: acessível somente pelo servidor (service_role).

-- ===================== HELPERS =====================
create or replace function public.is_staff_ativo(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff_access s
    where s.organization_id = _org
      and s.auth_user_id = auth.uid()
      and s.status = 'active'
      and s.archived_at is null
  )
$$;

create or replace function public.staff_meu_papel(_org uuid)
returns public.app_role language sql stable security definer set search_path = public as $$
  select s.role from public.staff_access s
  where s.organization_id = _org and s.auth_user_id = auth.uid()
    and s.status = 'active' and s.archived_at is null
  limit 1
$$;

revoke all on function public.is_staff_ativo(uuid) from public, anon, authenticated;
revoke all on function public.staff_meu_papel(uuid) from public, anon, authenticated;

-- ===================== BACKFILL (antes de endurecer is_org_member) =====================
insert into public.staff_access (organization_id, auth_user_id, email, full_name, role, status, activated_at, invited_at)
select
  m.organization_id,
  m.user_id,
  coalesce(lower(p.email), m.user_id::text || '@sem-email.local'),
  p.nome,
  coalesce(
    (select r.role from public.user_roles r
      where r.organization_id = m.organization_id and r.user_id = m.user_id
      order by case r.role
        when 'admin' then 1 when 'operacoes' then 2 when 'financeiro' then 3
        when 'comercial' then 4 when 'pesquisador' then 5 else 6 end
      limit 1),
    'leitura'::public.app_role),
  'active',
  now(),
  now()
from public.organization_members m
left join public.profiles p on p.id = m.user_id
where m.archived_at is null
on conflict do nothing;

-- ===================== ENDURECER ISOLAMENTO =====================
-- Toda policy existente depende de is_org_member: suspender/revogar corta o acesso na hora.
create or replace function public.is_org_member(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = _org and m.user_id = auth.uid() and m.archived_at is null
  )
  and exists (
    select 1 from public.staff_access s
    where s.organization_id = _org and s.auth_user_id = auth.uid()
      and s.status = 'active' and s.archived_at is null
  )
$$;

-- Papéis efetivos passam a exigir equipe ativa.
create or replace function public.has_org_role(_org uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff_ativo(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid() and r.role = _role
  )
$$;

-- ===================== POLICIES: staff_access =====================
create policy "staff_select_self" on public.staff_access for select to authenticated
  using (auth_user_id = auth.uid());
create policy "staff_select_member" on public.staff_access for select to authenticated
  using (public.is_org_member(organization_id));
create policy "staff_insert_admin" on public.staff_access for insert to authenticated
  with check (public.has_org_role(organization_id,'admin'));
create policy "staff_update_admin" on public.staff_access for update to authenticated
  using (public.has_org_role(organization_id,'admin'))
  with check (public.has_org_role(organization_id,'admin'));

-- ===================== TRIGGERS =====================
create or replace function public.fn_staff_archive_meta()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.archived_at is not null and OLD.archived_at is null then
    NEW.archived_by := coalesce(NEW.archived_by, auth.uid());
    if NEW.archive_reason is null or length(trim(NEW.archive_reason)) = 0 then
      raise exception 'Informe o motivo do arquivamento.';
    end if;
  end if;
  return NEW;
end $$;

create trigger no_delete_staff before delete on public.staff_access for each row execute function public.fn_block_delete();
create trigger t_upd_staff before update on public.staff_access for each row execute function public.update_updated_at_column();
create trigger archive_staff before update on public.staff_access for each row execute function public.fn_staff_archive_meta();
create trigger audit_staff after insert or update on public.staff_access for each row execute function public.fn_audit();

-- ===================== BOOTSTRAP: fundador vira equipe ativa =====================
create or replace function public.bootstrap_minha_organizacao(_nome text default 'Clube Ancestral (DEMO)')
returns uuid language plpgsql security definer set search_path = public as $function$
declare v_org uuid; v_user uuid := auth.uid(); v_cliente uuid; v_caso uuid; v_email text; v_nome text;
begin
  if v_user is null then raise exception 'Sessão obrigatória.'; end if;
  select m.organization_id into v_org from public.organization_members m where m.user_id = v_user and m.archived_at is null limit 1;
  if v_org is not null then return v_org; end if;

  insert into public.organizations (nome, slug, demo)
  values (_nome, 'org-' || replace(v_user::text,'-',''), true) returning id into v_org;

  select lower(u.email), u.raw_user_meta_data->>'nome' into v_email, v_nome from auth.users u where u.id = v_user;

  insert into public.profiles (id, nome, email)
  values (v_user, v_nome, v_email)
  on conflict (id) do nothing;

  insert into public.organization_members (organization_id, user_id) values (v_org, v_user);
  insert into public.user_roles (organization_id, user_id, role) values (v_org, v_user, 'admin');
  insert into public.staff_access (organization_id, auth_user_id, email, full_name, role, status, activated_at, invited_by)
  values (v_org, v_user, coalesce(v_email, v_user::text || '@sem-email.local'), v_nome, 'admin', 'active', now(), v_user);

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

  -- equipe DEMO estritamente fictícia, sem conta de autenticação vinculada
  insert into public.staff_access (organization_id, email, full_name, role, status, demo, invited_by)
  values
    (v_org,'operacoes.demo@exemplo.test','DEMO — Operações Fictícia','operacoes','invited',true,v_user),
    (v_org,'leitura.demo@exemplo.test','DEMO — Leitura Fictícia','leitura','invited',true,v_user);

  return v_org;
end $function$;

revoke all on function public.bootstrap_minha_organizacao(text) from public, anon;
grant execute on function public.bootstrap_minha_organizacao(text) to authenticated;