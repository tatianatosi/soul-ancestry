-- =========================================================
-- 1. Colunas complementares nas entidades existentes
-- =========================================================
alter table public.leads      add column if not exists updated_by uuid;
alter table public.clientes   add column if not exists updated_by uuid,
                              add column if not exists nome_social text,
                              add column if not exists origem text;
alter table public.crm_casos  add column if not exists updated_by uuid,
                              add column if not exists tipo_servico text,
                              add column if not exists fase text,
                              add column if not exists responsavel_id uuid,
                              add column if not exists prioridade text not null default 'media',
                              add column if not exists data_entrada date not null default current_date,
                              add column if not exists data_ativacao timestamptz,
                              add column if not exists resumo text,
                              add column if not exists risco text,
                              add column if not exists proxima_acao text;
alter table public.tarefas    add column if not exists updated_by uuid,
                              add column if not exists bloqueio boolean not null default false,
                              add column if not exists motivo_bloqueio text;
alter table public.evidencias add column if not exists updated_by uuid,
                              add column if not exists pessoa_relacionada text,
                              add column if not exists local_relacionado text,
                              add column if not exists periodo text,
                              add column if not exists fonte text,
                              add column if not exists grau_confianca text,
                              add column if not exists observacao text;

-- =========================================================
-- 2. Vocabulários de estado
-- =========================================================
alter table public.leads      alter column estagio set default 'novo';
alter table public.clientes   alter column status  set default 'pre_onboarding';
alter table public.crm_casos  alter column status  set default 'rascunho';
alter table public.tarefas    alter column status  set default 'nao_iniciada';
alter table public.tarefas    alter column prioridade set default 'media';
alter table public.evidencias alter column status  set default 'coletada';

alter table public.leads      drop constraint if exists leads_estagio_chk;
alter table public.leads      add  constraint leads_estagio_chk check (estagio in ('novo','qualificado','proposta_em_preparo','proposta_enviada','ganho','perdido','arquivado'));
alter table public.clientes   drop constraint if exists clientes_status_chk;
alter table public.clientes   add  constraint clientes_status_chk check (status in ('pre_onboarding','ativo','suspenso','encerrado','arquivado'));
alter table public.crm_casos  drop constraint if exists crm_casos_status_chk;
alter table public.crm_casos  add  constraint crm_casos_status_chk check (status in ('rascunho','aguardando_documentos','aguardando_pagamento','pronto_para_ativar','ativo','pausado','concluido','encerrado','arquivado'));
alter table public.crm_casos  drop constraint if exists crm_casos_prioridade_chk;
alter table public.crm_casos  add  constraint crm_casos_prioridade_chk check (prioridade in ('baixa','media','alta','critica'));
alter table public.tarefas    drop constraint if exists tarefas_status_chk;
alter table public.tarefas    add  constraint tarefas_status_chk check (status in ('nao_iniciada','em_andamento','bloqueada','concluida','cancelada'));
alter table public.tarefas    drop constraint if exists tarefas_prioridade_chk;
alter table public.tarefas    add  constraint tarefas_prioridade_chk check (prioridade in ('baixa','media','alta','critica'));
alter table public.evidencias drop constraint if exists evidencias_status_chk;
alter table public.evidencias add  constraint evidencias_status_chk check (status in ('coletada','em_revisao','validada','inconclusiva','descartada'));

-- =========================================================
-- 3. Funções utilitárias (autoria, transições, auditoria)
-- =========================================================
create or replace function public.fn_touch_meta()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    NEW.created_by := coalesce(NEW.created_by, auth.uid());
    NEW.updated_by := coalesce(NEW.updated_by, auth.uid());
    NEW.created_at := coalesce(NEW.created_at, now());
  else
    NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
  end if;
  NEW.updated_at := now();
  return NEW;
end $$;

create or replace function public.transicao_permitida(_entidade text, _de text, _para text)
returns boolean language sql immutable set search_path = public as $$
  select case
    when _de = _para then true
    when _entidade = 'lead' then _para = any (case _de
      when 'novo' then array['qualificado','perdido','arquivado']
      when 'qualificado' then array['proposta_em_preparo','perdido','arquivado']
      when 'proposta_em_preparo' then array['proposta_enviada','perdido','arquivado']
      when 'proposta_enviada' then array['ganho','perdido','arquivado']
      when 'ganho' then array['arquivado']
      when 'perdido' then array['novo','qualificado','arquivado']
      else array[]::text[] end)
    when _entidade = 'cliente' then _para = any (case _de
      when 'pre_onboarding' then array['ativo','encerrado','arquivado']
      when 'ativo' then array['suspenso','encerrado','arquivado']
      when 'suspenso' then array['ativo','encerrado','arquivado']
      when 'encerrado' then array['arquivado']
      else array[]::text[] end)
    when _entidade = 'caso' then _para = any (case _de
      when 'rascunho' then array['aguardando_documentos','aguardando_pagamento','encerrado','arquivado']
      when 'aguardando_documentos' then array['aguardando_pagamento','pronto_para_ativar','encerrado','arquivado']
      when 'aguardando_pagamento' then array['aguardando_documentos','pronto_para_ativar','encerrado','arquivado']
      when 'pronto_para_ativar' then array['ativo','aguardando_documentos','aguardando_pagamento','encerrado','arquivado']
      when 'ativo' then array['pausado','concluido','encerrado','arquivado']
      when 'pausado' then array['ativo','encerrado','arquivado']
      when 'concluido' then array['encerrado','arquivado']
      when 'encerrado' then array['arquivado']
      else array[]::text[] end)
    when _entidade = 'tarefa' then _para = any (case _de
      when 'nao_iniciada' then array['em_andamento','bloqueada','cancelada']
      when 'em_andamento' then array['bloqueada','concluida','cancelada']
      when 'bloqueada' then array['em_andamento','cancelada']
      when 'cancelada' then array['nao_iniciada']
      else array[]::text[] end)
    when _entidade = 'evidencia' then _para = any (case _de
      when 'coletada' then array['em_revisao','descartada']
      when 'em_revisao' then array['validada','inconclusiva','descartada','coletada']
      when 'validada' then array['em_revisao','descartada']
      when 'inconclusiva' then array['em_revisao','descartada']
      else array[]::text[] end)
    else false end
$$;

create or replace function public.fn_audit_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_old text; v_new text;
begin
  v_old := to_jsonb(OLD)->>TG_ARGV[0];
  v_new := to_jsonb(NEW)->>TG_ARGV[0];
  if v_old is distinct from v_new then
    insert into public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, valores_anteriores, valores_posteriores, metadados)
    values ((to_jsonb(NEW)->>'organization_id')::uuid, auth.uid(), 'status_change', TG_TABLE_NAME, NEW.id,
            jsonb_build_object('status', v_old), jsonb_build_object('status', v_new),
            jsonb_build_object('campo', TG_ARGV[0]));
  end if;
  return NEW;
end $$;

-- Guardas de estado por entidade
create or replace function public.fn_estado_lead()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and not public.transicao_permitida('lead', OLD.estagio, NEW.estagio) then
    raise exception 'Transição de lead não permitida: % -> %', OLD.estagio, NEW.estagio;
  end if;
  return NEW;
end $$;

create or replace function public.fn_estado_cliente()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and not public.transicao_permitida('cliente', OLD.status, NEW.status) then
    raise exception 'Transição de cliente não permitida: % -> %', OLD.status, NEW.status;
  end if;
  return NEW;
end $$;

create or replace function public.fn_estado_caso()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and not public.transicao_permitida('caso', OLD.status, NEW.status) then
    raise exception 'Transição de caso não permitida: % -> %', OLD.status, NEW.status;
  end if;
  if NEW.status = 'ativo' then
    if NEW.cliente_id is null then raise exception 'Caso ativo exige cliente vinculado.'; end if;
    if NEW.responsavel_id is null then raise exception 'Caso ativo exige responsável.'; end if;
    if NEW.tipo_servico is null or length(trim(NEW.tipo_servico)) = 0 then raise exception 'Caso ativo exige tipo de serviço.'; end if;
    NEW.data_ativacao := coalesce(NEW.data_ativacao, now());
  end if;
  return NEW;
end $$;

create or replace function public.fn_estado_tarefa()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and not public.transicao_permitida('tarefa', OLD.status, NEW.status) then
    raise exception 'Transição de tarefa não permitida: % -> %', OLD.status, NEW.status;
  end if;
  if NEW.status = 'bloqueada' then
    NEW.bloqueio := true;
    if NEW.motivo_bloqueio is null or length(trim(NEW.motivo_bloqueio)) = 0 then
      raise exception 'Tarefa bloqueada exige motivo do bloqueio.';
    end if;
  end if;
  if NEW.status = 'concluida' then
    if NEW.bloqueio then raise exception 'Tarefa bloqueada não pode ser concluída.'; end if;
    NEW.concluida_em := coalesce(NEW.concluida_em, now());
  end if;
  return NEW;
end $$;

create or replace function public.fn_estado_evidencia()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and not public.transicao_permitida('evidencia', OLD.status, NEW.status) then
    raise exception 'Transição de evidência não permitida: % -> %', OLD.status, NEW.status;
  end if;
  return NEW;
end $$;

drop trigger if exists estado_leads on public.leads;
create trigger estado_leads before update on public.leads for each row execute function public.fn_estado_lead();
drop trigger if exists estado_clientes on public.clientes;
create trigger estado_clientes before update on public.clientes for each row execute function public.fn_estado_cliente();
drop trigger if exists estado_casos on public.crm_casos;
create trigger estado_casos before insert or update on public.crm_casos for each row execute function public.fn_estado_caso();
drop trigger if exists estado_tarefas on public.tarefas;
create trigger estado_tarefas before insert or update on public.tarefas for each row execute function public.fn_estado_tarefa();
drop trigger if exists estado_evidencias on public.evidencias;
create trigger estado_evidencias before update on public.evidencias for each row execute function public.fn_estado_evidencia();

drop trigger if exists status_audit_leads on public.leads;
create trigger status_audit_leads after update on public.leads for each row execute function public.fn_audit_status('estagio');
drop trigger if exists status_audit_clientes on public.clientes;
create trigger status_audit_clientes after update on public.clientes for each row execute function public.fn_audit_status('status');
drop trigger if exists status_audit_casos on public.crm_casos;
create trigger status_audit_casos after update on public.crm_casos for each row execute function public.fn_audit_status('status');
drop trigger if exists status_audit_tarefas on public.tarefas;
create trigger status_audit_tarefas after update on public.tarefas for each row execute function public.fn_audit_status('status');
drop trigger if exists status_audit_evidencias on public.evidencias;
create trigger status_audit_evidencias after update on public.evidencias for each row execute function public.fn_audit_status('status');

drop trigger if exists archive_tarefas_meta on public.tarefas;
create trigger archive_tarefas_meta before update on public.tarefas for each row execute function public.fn_archive_meta();

-- =========================================================
-- 4. Novas entidades operacionais
-- =========================================================
create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_id uuid not null references public.clientes(id),
  nome text not null,
  relacao text,
  email text,
  telefone text,
  principal boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text
);

create table if not exists public.case_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  case_id uuid not null references public.crm_casos(id),
  nome text not null,
  parentesco text not null,
  data_nascimento date,
  local_nascimento text,
  observacoes_protegidas text,
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  case_id uuid references public.crm_casos(id),
  client_id uuid references public.clientes(id),
  titulo text not null,
  tipo text not null default 'outro',
  storage_path text,
  file_hash text,
  status text not null default 'pendente' check (status in ('pendente','recebido','em_revisao','validado','rejeitado')),
  liberado_cliente boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_id uuid not null references public.clientes(id),
  tipo_consentimento text not null,
  versao_texto text not null,
  status text not null default 'coletado' check (status in ('pendente','coletado','revogado','expirado')),
  coletado_em timestamptz,
  evidencia_consentimento text,
  revogado_em timestamptz,
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  lead_id uuid references public.leads(id),
  client_id uuid references public.clientes(id),
  versao integer not null default 1,
  status text not null default 'rascunho' check (status in ('rascunho','enviada','aprovada','recusada','expirada','arquivada')),
  valor numeric(14,2) not null default 0,
  moeda text not null default 'BRL',
  escopo text,
  validade date,
  enviada_em timestamptz,
  aprovada_em timestamptz,
  recusada_em timestamptz,
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text,
  constraint proposals_origem_chk check (lead_id is not null or client_id is not null)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_id uuid references public.clientes(id),
  case_id uuid references public.crm_casos(id),
  contract_id uuid references public.contracts(id),
  service_order_id uuid references public.service_orders(id),
  numero text,
  valor numeric(14,2) not null default 0,
  moeda text not null default 'BRL',
  vencimento date,
  status text not null default 'aberta' check (status in ('rascunho','aberta','paga','parcial','vencida','cancelada')),
  referencia_externa text,
  conciliacao_status text not null default 'nao_conciliado' check (conciliacao_status in ('nao_conciliado','conciliado','divergente')),
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  invoice_id uuid references public.invoices(id),
  valor numeric(14,2) not null default 0,
  moeda text not null default 'BRL',
  vencimento date,
  pago_em timestamptz,
  metodo text,
  status text not null default 'pendente' check (status in ('pendente','confirmado','estornado','falhou')),
  referencia_externa text,
  conciliacao_status text not null default 'nao_conciliado' check (conciliacao_status in ('nao_conciliado','conciliado','divergente')),
  created_at timestamptz not null default now(), created_by uuid,
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_motivo text
);

-- Grants
grant select, insert, update on public.client_contacts, public.case_members, public.documents,
  public.consent_records, public.proposals, public.invoices, public.payments to authenticated;
grant all on public.client_contacts, public.case_members, public.documents,
  public.consent_records, public.proposals, public.invoices, public.payments to service_role;

-- RLS
alter table public.client_contacts enable row level security;
alter table public.case_members enable row level security;
alter table public.documents enable row level security;
alter table public.consent_records enable row level security;
alter table public.proposals enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

do $$
declare t text;
begin
  foreach t in array array['client_contacts','case_members','documents','consent_records','proposals','invoices','payments'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id))', t||'_sel', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.can_write(organization_id))', t||'_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id))', t||'_upd', t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.fn_touch_meta()', t||'_meta', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.fn_archive_meta()', t||'_archive', t);
    execute format('create trigger %I after insert or update on public.%I for each row execute function public.fn_audit()', t||'_audit', t);
    execute format('create trigger %I before delete on public.%I for each row execute function public.fn_block_delete()', t||'_no_delete', t);
  end loop;
end $$;

create index if not exists idx_client_contacts_client on public.client_contacts(client_id);
create index if not exists idx_case_members_case on public.case_members(case_id);
create index if not exists idx_documents_case on public.documents(case_id);
create index if not exists idx_consent_client on public.consent_records(client_id);
create index if not exists idx_proposals_lead on public.proposals(lead_id);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_payments_invoice on public.payments(invoice_id);