-- 1) Trava permanente de provisionamento inicial
CREATE TABLE IF NOT EXISTS public.bootstrap_lock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  completed_by uuid,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS bootstrap_lock_org_unico ON public.bootstrap_lock(organization_id);

GRANT ALL ON public.bootstrap_lock TO service_role;
ALTER TABLE public.bootstrap_lock ENABLE ROW LEVEL SECURITY;
-- sem policies: inacessível a anon/authenticated; somente service_role (bypass RLS)

DROP TRIGGER IF EXISTS no_delete_bootstrap_lock ON public.bootstrap_lock;
CREATE TRIGGER no_delete_bootstrap_lock BEFORE DELETE ON public.bootstrap_lock
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- 2) Consulta de elegibilidade (nunca reabre após primeiro admin)
CREATE OR REPLACE FUNCTION public.bootstrap_permitido()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select not exists (select 1 from public.bootstrap_lock)
     and not exists (select 1 from public.staff_access)
$$;

REVOKE ALL ON FUNCTION public.bootstrap_permitido() FROM public;
REVOKE ALL ON FUNCTION public.bootstrap_permitido() FROM anon;
REVOKE ALL ON FUNCTION public.bootstrap_permitido() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_permitido() TO service_role;

-- 3) Bootstrap atômico do primeiro admin
CREATE OR REPLACE FUNCTION public.bootstrap_primeiro_admin(
  _user_id uuid,
  _email text,
  _nome text,
  _organizacao text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_org uuid;
  v_staff uuid;
  v_slug text;
  v_email text := lower(trim(_email));
begin
  if _user_id is null or v_email = '' or coalesce(trim(_organizacao),'') = '' then
    raise exception 'Dados obrigatórios ausentes para o provisionamento inicial.';
  end if;

  perform pg_advisory_xact_lock(hashtext('clube_ancestral_bootstrap'));

  if exists (select 1 from public.bootstrap_lock)
     or exists (select 1 from public.staff_access) then
    raise exception 'BOOTSTRAP_BLOQUEADO';
  end if;

  v_slug := regexp_replace(lower(trim(_organizacao)), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  v_slug := left(coalesce(nullif(v_slug,''), 'org'), 40) || '-' || substr(replace(gen_random_uuid()::text,'-',''), 1, 6);

  insert into public.organizations (nome, slug, demo)
  values (trim(_organizacao), v_slug, false)
  returning id into v_org;

  insert into public.profiles (id, nome, email)
  values (_user_id, nullif(trim(coalesce(_nome,'')),''), v_email)
  on conflict (id) do update set nome = excluded.nome, email = excluded.email;

  insert into public.organization_members (organization_id, user_id)
  values (v_org, _user_id);

  insert into public.user_roles (organization_id, user_id, role)
  values (v_org, _user_id, 'admin');

  insert into public.staff_access (
    organization_id, auth_user_id, email, full_name, role, status, activated_at, created_by
  ) values (
    v_org, _user_id, v_email, nullif(trim(coalesce(_nome,'')),''), 'admin', 'active', now(), _user_id
  ) returning id into v_staff;

  insert into public.bootstrap_lock (organization_id, completed_by)
  values (v_org, _user_id);

  insert into public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
  values (v_org, _user_id, 'bootstrap_success', 'staff_access', v_staff,
          jsonb_build_object('papel','admin','origem','provisionamento_inicial'));

  return v_org;
end $$;

REVOKE ALL ON FUNCTION public.bootstrap_primeiro_admin(uuid, text, text, text) FROM public;
REVOKE ALL ON FUNCTION public.bootstrap_primeiro_admin(uuid, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.bootstrap_primeiro_admin(uuid, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_primeiro_admin(uuid, text, text, text) TO service_role;

-- 4) Proteção do último admin ativo
CREATE OR REPLACE FUNCTION public.fn_proteger_ultimo_admin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
declare v_outros int;
begin
  if OLD.role = 'admin' and OLD.status = 'active' and OLD.archived_at is null then
    if NEW.role <> 'admin' or NEW.status <> 'active' or NEW.archived_at is not null then
      select count(*) into v_outros
      from public.staff_access s
      where s.organization_id = OLD.organization_id
        and s.id <> OLD.id
        and s.role = 'admin'
        and s.status = 'active'
        and s.archived_at is null;
      if v_outros = 0 then
        raise exception 'Não é possível suspender, revogar, arquivar ou rebaixar o último administrador ativo. Ative outro administrador antes.';
      end if;
    end if;
  end if;
  return NEW;
end $$;

DROP TRIGGER IF EXISTS proteger_ultimo_admin ON public.staff_access;
CREATE TRIGGER proteger_ultimo_admin BEFORE UPDATE ON public.staff_access
FOR EACH ROW EXECUTE FUNCTION public.fn_proteger_ultimo_admin();

-- 5) Se já existe equipe, o bootstrap nasce travado
INSERT INTO public.bootstrap_lock (organization_id, completed_by)
SELECT DISTINCT s.organization_id, null::uuid
FROM public.staff_access s
ON CONFLICT (organization_id) DO NOTHING;