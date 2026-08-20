
create table if not exists public.checklist_cadastral (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  case_id uuid not null references public.crm_casos(id),
  pessoa_tipo text not null check (pessoa_tipo in ('titular','dependente','contratada')),
  pessoa_nome text not null,
  pessoa_ref_id uuid,
  campo text not null,
  campo_rotulo text not null,
  obrigatorio boolean not null default true,
  status text not null default 'pendente' check (status in ('pendente','informado','verificado','nao_aplicavel','aguarda_fonte_societaria')),
  fonte text,
  data_verificacao date,
  acesso_restrito boolean not null default true,
  observacao_interna text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (case_id, pessoa_tipo, pessoa_nome, campo)
);

grant select, insert, update on public.checklist_cadastral to authenticated;
grant all on public.checklist_cadastral to service_role;

alter table public.checklist_cadastral enable row level security;

create policy chk_cad_select on public.checklist_cadastral for select using (is_org_member(organization_id));
create policy chk_cad_insert on public.checklist_cadastral for insert with check (can_write(organization_id));
create policy chk_cad_update on public.checklist_cadastral for update using (can_write(organization_id)) with check (can_write(organization_id));

create trigger trg_chk_cad_block_delete before delete on public.checklist_cadastral
  for each row execute function public.fn_block_delete();

create index if not exists idx_chk_cad_caso on public.checklist_cadastral (case_id, pessoa_tipo, ordem);
