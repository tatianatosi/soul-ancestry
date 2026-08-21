CREATE OR REPLACE FUNCTION public.ops_painel(_org uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
  if not public.is_org_member(_org) then
    raise exception 'Sem acesso a esta organização.';
  end if;

  select jsonb_build_object(
    'casos_ativos', (select count(*) from public.crm_casos c where c.organization_id=_org and c.status='ativo' and c.archived_at is null),
    'casos_bloqueados', (select count(*) from public.crm_casos c where c.organization_id=_org and c.status in ('pausado','aguardando_documentos','aguardando_pagamento') and c.archived_at is null),
    'tarefas_vencidas', (select count(*) from public.tarefas t where t.organization_id=_org and t.archived_at is null and t.status not in ('concluida','cancelada') and t.sla_prazo_em is not null and now() > t.sla_prazo_em),
    'sla_em_risco', (select count(*) from public.tarefas t where t.organization_id=_org and t.archived_at is null and t.status not in ('concluida','cancelada') and t.sla_alerta_em is not null and now() between t.sla_alerta_em and t.sla_prazo_em),
    'tarefas_bloqueadas', (select count(*) from public.tarefas t where t.organization_id=_org and t.archived_at is null and t.status='bloqueada'),
    'micro_pendentes', (select count(*) from public.ops_microentregas m where m.organization_id=_org and m.archived_at is null and m.status not in ('concluida','cancelada')),
    'micro_atrasadas', (select count(*) from public.ops_microentregas m where m.organization_id=_org and m.archived_at is null and m.status not in ('concluida','cancelada') and m.prazo is not null and m.prazo < current_date),
    'carga', (
      select coalesce(jsonb_agg(x order by x->>'nome'), '[]'::jsonb) from (
        select jsonb_build_object(
          'responsavel_id', s.auth_user_id,
          'nome', coalesce(s.full_name, s.email),
          'tarefas_abertas', (select count(*) from public.tarefas t where t.organization_id=_org and t.archived_at is null and t.responsavel_id = s.auth_user_id and t.status not in ('concluida','cancelada')),
          'tarefas_atrasadas', (select count(*) from public.tarefas t where t.organization_id=_org and t.archived_at is null and t.responsavel_id = s.auth_user_id and t.status not in ('concluida','cancelada') and t.sla_prazo_em is not null and now() > t.sla_prazo_em),
          'micro_abertas', (select count(*) from public.ops_microentregas m where m.organization_id=_org and m.archived_at is null and m.responsavel_id = s.auth_user_id and m.status not in ('concluida','cancelada'))
        ) as x
        from public.staff_access s
        where s.organization_id=_org and s.status='active' and s.archived_at is null
      ) q
    )
  ) into v;

  return v;
end $function$;