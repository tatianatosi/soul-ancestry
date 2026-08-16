create or replace function public.ops_sla_status(_status text, _prazo_em timestamptz, _alerta_em timestamptz)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when _status in ('concluida','cancelada') then 'concluido'
    when _prazo_em is null then 'sem_sla'
    when now() > _prazo_em then 'atrasada'
    when _alerta_em is not null and now() > _alerta_em then 'em_risco'
    else 'no_prazo' end
$$;

revoke execute on function public.ops_painel(uuid) from anon, public;
revoke execute on function public.ops_sla_status(text, timestamptz, timestamptz) from anon, public;
grant execute on function public.ops_painel(uuid) to authenticated;
grant execute on function public.ops_sla_status(text, timestamptz, timestamptz) to authenticated;
