create or replace function public.fn_perfil_institucional_evento_append_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'Eventos do perfil institucional são append-only: alteração e exclusão não são permitidas.';
end;
$$;

drop trigger if exists ipe_append_only on public.institutional_profile_events;
create trigger ipe_append_only
before update or delete on public.institutional_profile_events
for each row execute function public.fn_perfil_institucional_evento_append_only();

create or replace function public.fn_perfil_institucional_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Perfil institucional não pode ser excluído: use novo versionamento.';
  end if;
  if new.status not in ('under_legal_review','vigente','superseded') then
    raise exception 'Estado inválido do perfil institucional: %', new.status;
  end if;
  if tg_op = 'UPDATE' and old.versao is distinct from new.versao then
    raise exception 'A versão do perfil institucional é imutável: registre nova versão.';
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists ip_guard on public.institutional_profiles;
create trigger ip_guard
before insert or update or delete on public.institutional_profiles
for each row execute function public.fn_perfil_institucional_guard();