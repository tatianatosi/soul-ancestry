-- Historico de fase por caso (seção 10, PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md e
-- seção 8, Prompt de Implantação — Política Unificada de Casos Familiares):
-- "Alteração de fase deve criar case_phase_history, mas não depender de
-- auditoria/gate para acontecer." Implementado como trigger em crm_casos.fase
-- para que NENHUM ponto de gravação precise lembrar de chamar isso — vale
-- para os 7 casos reais hoje e para qualquer caso futuro, sem exceção.
--
-- Aditivo: nenhuma tabela apagada ou renomeada, nenhuma linha existente
-- alterada.

create table if not exists public.case_phase_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references public.crm_casos(id),
  fase_anterior text,
  fase_nova text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid
);

create index if not exists idx_case_phase_history_case_id
  on public.case_phase_history (case_id, changed_at desc);

alter table public.case_phase_history enable row level security;

create policy case_phase_history_sel on public.case_phase_history
  for select to authenticated using (is_org_member(organization_id));
create policy case_phase_history_ins on public.case_phase_history
  for insert to authenticated with check (can_write(organization_id));

create or replace function public.fn_registrar_case_phase_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and new.fase is distinct from old.fase) then
    insert into public.case_phase_history (organization_id, case_id, fase_anterior, fase_nova, changed_by)
    values (new.organization_id, new.id, old.fase, new.fase, new.updated_by);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_case_phase_history on public.crm_casos;
create trigger trg_case_phase_history
  after update on public.crm_casos
  for each row
  execute function public.fn_registrar_case_phase_history();
