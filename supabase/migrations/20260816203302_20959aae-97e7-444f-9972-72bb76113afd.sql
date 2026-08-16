-- =========================================================
-- DESK OPERACIONAL
-- =========================================================

-- 1) Regras de SLA -----------------------------------------------------------
create table if not exists public.ops_sla_regras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tipo_tarefa text not null default '*',
  prioridade text not null default '*',
  horas_alvo integer not null default 72,
  horas_alerta integer not null default 24,
  ativo boolean not null default true,
  observacoes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, tipo_tarefa, prioridade)
);

grant select, insert, update, delete on public.ops_sla_regras to authenticated;
grant all on public.ops_sla_regras to service_role;
alter table public.ops_sla_regras enable row level security;

create policy "sla_regras_select" on public.ops_sla_regras
  for select to authenticated using (public.is_org_member(organization_id));
create policy "sla_regras_write" on public.ops_sla_regras
  for insert to authenticated with check (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'));
create policy "sla_regras_update" on public.ops_sla_regras
  for update to authenticated using (public.has_org_role(organization_id,'admin') or public.has_org_role(organization_id,'operacoes'));

create trigger trg_sla_regras_touch before insert or update on public.ops_sla_regras
  for each row execute function public.fn_touch_meta();
create trigger trg_sla_regras_block_delete before delete on public.ops_sla_regras
  for each row execute function public.fn_block_delete();

-- regras padrão por organização
insert into public.ops_sla_regras (organization_id, tipo_tarefa, prioridade, horas_alvo, horas_alerta, observacoes)
select o.id, '*', p.prioridade, p.horas, p.alerta, 'Regra padrão inicial'
from public.organizations o
cross join (values ('urgente',24,6),('alta',48,12),('media',96,24),('baixa',168,48)) as p(prioridade,horas,alerta)
on conflict do nothing;

-- 2) Tarefas: campos operacionais e SLA --------------------------------------
alter table public.tarefas
  add column if not exists tipo text not null default 'geral',
  add column if not exists bloqueado_em timestamptz,
  add column if not exists desbloqueado_em timestamptz,
  add column if not exists desbloqueio_por uuid,
  add column if not exists desbloqueio_justificativa text,
  add column if not exists sla_horas integer,
  add column if not exists sla_prazo_em timestamptz,
  add column if not exists sla_alerta_em timestamptz;

-- 3) Micro-entregas operacionais ---------------------------------------------
create table if not exists public.ops_microentregas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caso_id uuid not null references public.crm_casos(id) on delete restrict,
  fase text not null default 'fase_01',
  titulo text not null,
  descricao text,
  responsavel_id uuid,
  prazo date,
  prioridade text not null default 'media',
  status text not null default 'pendente',
  criterio_aceite text,
  evidencia_url text,
  evidencia_descricao text,
  justificativa_sem_evidencia text,
  concluida_em timestamptz,
  concluida_por uuid,
  excecao_id uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.ops_microentregas to authenticated;
grant all on public.ops_microentregas to service_role;
alter table public.ops_microentregas enable row level security;

create policy "ops_micro_select" on public.ops_microentregas
  for select to authenticated using (public.is_org_member(organization_id));
create policy "ops_micro_insert" on public.ops_microentregas
  for insert to authenticated with check (public.can_write(organization_id));
create policy "ops_micro_update" on public.ops_microentregas
  for update to authenticated using (public.can_write(organization_id));

create index if not exists idx_ops_micro_caso on public.ops_microentregas(caso_id);
create index if not exists idx_ops_micro_resp on public.ops_microentregas(responsavel_id);

-- 4) Exceções operacionais ----------------------------------------------------
create table if not exists public.ops_excecoes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  caso_id uuid references public.crm_casos(id) on delete restrict,
  tipo text not null,
  referencia_entidade text,
  referencia_id uuid,
  motivo text not null,
  autorizado_por uuid,
  autorizado_em timestamptz not null default now(),
  valido_ate timestamptz,
  consumida_em timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.ops_excecoes to authenticated;
grant all on public.ops_excecoes to service_role;
alter table public.ops_excecoes enable row level security;

create policy "ops_exc_select" on public.ops_excecoes
  for select to authenticated using (public.is_org_member(organization_id));
create policy "ops_exc_insert" on public.ops_excecoes
  for insert to authenticated with check (public.has_org_role(organization_id,'admin'));
create policy "ops_exc_update" on public.ops_excecoes
  for update to authenticated using (public.has_org_role(organization_id,'admin'));

create trigger trg_ops_exc_touch before insert or update on public.ops_excecoes
  for each row execute function public.fn_touch_meta();
create trigger trg_ops_exc_block_delete before delete on public.ops_excecoes
  for each row execute function public.fn_block_delete();

-- 5) Cálculo de SLA no banco --------------------------------------------------
create or replace function public.fn_tarefa_sla()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_h integer; v_a integer; v_base timestamptz;
begin
  select r.horas_alvo, r.horas_alerta into v_h, v_a
  from public.ops_sla_regras r
  where r.organization_id = NEW.organization_id and r.ativo
    and r.tipo_tarefa in (NEW.tipo, '*')
    and r.prioridade in (coalesce(NEW.prioridade,'media'), '*')
  order by (r.tipo_tarefa = NEW.tipo) desc, (r.prioridade = coalesce(NEW.prioridade,'media')) desc
  limit 1;

  if v_h is null then
    NEW.sla_horas := null;
    NEW.sla_prazo_em := case when NEW.prazo is not null then (NEW.prazo + time '23:59')::timestamptz else null end;
    NEW.sla_alerta_em := null;
    return NEW;
  end if;

  v_base := coalesce(NEW.created_at, now()) + make_interval(hours => v_h);
  if NEW.prazo is not null then
    v_base := least(v_base, (NEW.prazo + time '23:59')::timestamptz);
  end if;
  NEW.sla_horas := v_h;
  NEW.sla_prazo_em := v_base;
  NEW.sla_alerta_em := v_base - make_interval(hours => v_a);
  return NEW;
end $$;

drop trigger if exists trg_tarefa_sla on public.tarefas;
create trigger trg_tarefa_sla before insert or update of tipo, prioridade, prazo, status on public.tarefas
  for each row execute function public.fn_tarefa_sla();

create or replace function public.ops_sla_status(_status text, _prazo_em timestamptz, _alerta_em timestamptz)
returns text
language sql
stable
as $$
  select case
    when _status in ('concluida','cancelada') then 'concluido'
    when _prazo_em is null then 'sem_sla'
    when now() > _prazo_em then 'atrasada'
    when _alerta_em is not null and now() > _alerta_em then 'em_risco'
    else 'no_prazo' end
$$;

-- 6) Travas de bloqueio/desbloqueio de tarefa --------------------------------
create or replace function public.fn_estado_tarefa()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' and not public.transicao_permitida('tarefa', OLD.status, NEW.status) then
    raise exception 'Transição de tarefa não permitida: % -> %', OLD.status, NEW.status;
  end if;

  if NEW.status = 'bloqueada' then
    NEW.bloqueio := true;
    if NEW.motivo_bloqueio is null or length(trim(NEW.motivo_bloqueio)) < 5 then
      raise exception 'Tarefa bloqueada exige motivo do bloqueio.';
    end if;
    NEW.bloqueado_em := coalesce(NEW.bloqueado_em, now());
    NEW.desbloqueado_em := null;
  end if;

  if TG_OP = 'UPDATE' and OLD.status = 'bloqueada' and NEW.status <> 'bloqueada' then
    if NEW.desbloqueado_em is null or NEW.desbloqueio_por is null
       or NEW.desbloqueio_justificativa is null or length(trim(NEW.desbloqueio_justificativa)) < 5 then
      raise exception 'Desbloqueio exige data, responsável e justificativa registrados.';
    end if;
    NEW.bloqueio := false;
  end if;

  if NEW.status = 'concluida' then
    if NEW.bloqueio then raise exception 'Tarefa bloqueada não pode ser concluída sem registrar o desbloqueio.'; end if;
    if NEW.bloqueado_em is not null and (NEW.desbloqueado_em is null or NEW.desbloqueio_por is null
        or NEW.desbloqueio_justificativa is null or length(trim(NEW.desbloqueio_justificativa)) < 5) then
      raise exception 'Tarefa que esteve bloqueada exige desbloqueio, responsável e justificativa antes da conclusão.';
    end if;
    NEW.concluida_em := coalesce(NEW.concluida_em, now());
  end if;

  return NEW;
end $$;

-- 7) Auditoria de responsável, prazo e prioridade ----------------------------
create or replace function public.fn_tarefa_audit_campos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.responsavel_id is distinct from NEW.responsavel_id
     or OLD.prazo is distinct from NEW.prazo
     or OLD.prioridade is distinct from NEW.prioridade then
    insert into public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, valores_anteriores, valores_posteriores)
    values (NEW.organization_id, auth.uid(), 'alteracao_operacional', 'tarefas', NEW.id,
      jsonb_build_object('responsavel_id', OLD.responsavel_id, 'prazo', OLD.prazo, 'prioridade', OLD.prioridade),
      jsonb_build_object('responsavel_id', NEW.responsavel_id, 'prazo', NEW.prazo, 'prioridade', NEW.prioridade));
  end if;
  return NEW;
end $$;

drop trigger if exists trg_tarefa_audit_campos on public.tarefas;
create trigger trg_tarefa_audit_campos after update on public.tarefas
  for each row execute function public.fn_tarefa_audit_campos();

-- 8) Travas de micro-entrega --------------------------------------------------
create or replace function public.fn_ops_micro_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_status text; v_arch timestamptz; v_exc uuid;
begin
  select c.status, c.archived_at into v_status, v_arch
  from public.crm_casos c where c.id = NEW.caso_id;

  if TG_OP = 'INSERT' then
    if v_status = 'pausado' then
      select e.id into v_exc from public.ops_excecoes e
      where e.caso_id = NEW.caso_id and e.tipo = 'microentrega_caso_pausado'
        and e.consumida_em is null and (e.valido_ate is null or e.valido_ate > now())
      order by e.autorizado_em desc limit 1;
      if v_exc is null then
        raise exception 'Caso pausado: criação de micro-entrega exige exceção autorizada pela administração.';
      end if;
      update public.ops_excecoes set consumida_em = now() where id = v_exc;
      NEW.excecao_id := v_exc;
    end if;
  end if;

  if v_status in ('encerrado','concluido') or v_arch is not null then
    select e.id into v_exc from public.ops_excecoes e
    where e.caso_id = NEW.caso_id and e.tipo = 'reabertura_caso'
      and e.consumida_em is null and (e.valido_ate is null or e.valido_ate > now())
    limit 1;
    if v_exc is null then
      raise exception 'Caso encerrado: alterações operacionais exigem reabertura autorizada pela administração.';
    end if;
  end if;

  if NEW.status = 'concluida' then
    if NEW.criterio_aceite is null or length(trim(NEW.criterio_aceite)) < 5 then
      raise exception 'Micro-entrega exige critério de aceite preenchido para ser concluída.';
    end if;
    if coalesce(length(trim(coalesce(NEW.evidencia_url,''))),0) = 0
       and coalesce(length(trim(coalesce(NEW.evidencia_descricao,''))),0) = 0
       and coalesce(length(trim(coalesce(NEW.justificativa_sem_evidencia,''))),0) < 5 then
      raise exception 'Micro-entrega concluída exige evidência registrada ou justificativa.';
    end if;
    NEW.concluida_em := coalesce(NEW.concluida_em, now());
    NEW.concluida_por := coalesce(NEW.concluida_por, auth.uid());
  end if;

  return NEW;
end $$;

drop trigger if exists trg_ops_micro_guard on public.ops_microentregas;
create trigger trg_ops_micro_guard before insert or update on public.ops_microentregas
  for each row execute function public.fn_ops_micro_guard();

create trigger trg_ops_micro_touch before insert or update on public.ops_microentregas
  for each row execute function public.fn_touch_meta();
create trigger trg_ops_micro_archive before update on public.ops_microentregas
  for each row execute function public.fn_archive_meta();
create trigger trg_ops_micro_block_delete before delete on public.ops_microentregas
  for each row execute function public.fn_block_delete();
create trigger trg_ops_micro_audit after insert or update on public.ops_microentregas
  for each row execute function public.fn_audit();

-- 9) Visões e painel OPS ------------------------------------------------------
create or replace view public.v_ops_tarefas
with (security_invoker = on) as
select t.*,
  public.ops_sla_status(t.status, t.sla_prazo_em, t.sla_alerta_em) as sla_status,
  c.codigo as caso_codigo, c.titulo as caso_titulo, c.status as caso_status
from public.tarefas t
left join public.crm_casos c on c.id = t.caso_id;

grant select on public.v_ops_tarefas to authenticated;
grant select on public.v_ops_tarefas to service_role;

create or replace view public.v_ops_microentregas
with (security_invoker = on) as
select m.*,
  case
    when m.status in ('concluida','cancelada') then 'concluido'
    when m.prazo is null then 'sem_prazo'
    when m.prazo < current_date then 'atrasada'
    when m.prazo <= current_date + 3 then 'em_risco'
    else 'no_prazo' end as prazo_status,
  c.codigo as caso_codigo, c.titulo as caso_titulo, c.status as caso_status
from public.ops_microentregas m
left join public.crm_casos c on c.id = m.caso_id;

grant select on public.v_ops_microentregas to authenticated;
grant select on public.v_ops_microentregas to service_role;

create or replace function public.ops_painel(_org uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
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
          'nome', coalesce(s.nome, s.email),
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
end $$;

grant execute on function public.ops_painel(uuid) to authenticated;

-- recalcula SLA das tarefas existentes
update public.tarefas set updated_at = now() where archived_at is null;
