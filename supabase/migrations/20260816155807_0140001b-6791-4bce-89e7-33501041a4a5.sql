-- =========================================================
-- MOTOR CONTRATUAL MODULAR — CLUBE ANCESTRAL
-- =========================================================

-- ---------- helpers de autorização ----------
create or replace function public.contract_pode_ler(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_member(_org)
$$;

create or replace function public.contract_pode_preparar(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_member(_org)
     and public.staff_meu_papel(_org) in ('admin','operacoes','comercial','financeiro')
$$;

create or replace function public.contract_pode_aprovar(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_member(_org) and public.staff_meu_papel(_org) = 'admin'
$$;

create or replace function public.contract_pode_financeiro(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_member(_org)
     and public.staff_meu_papel(_org) in ('admin','financeiro')
$$;

revoke all on function public.contract_pode_ler(uuid) from public;
revoke all on function public.contract_pode_preparar(uuid) from public;
revoke all on function public.contract_pode_aprovar(uuid) from public;
revoke all on function public.contract_pode_financeiro(uuid) from public;
grant execute on function public.contract_pode_ler(uuid) to authenticated;
grant execute on function public.contract_pode_preparar(uuid) to authenticated;
grant execute on function public.contract_pode_aprovar(uuid) to authenticated;
grant execute on function public.contract_pode_financeiro(uuid) to authenticated;

-- ---------- metadados comuns ----------
create or replace function public.fn_contract_meta()
returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    NEW.created_by := coalesce(NEW.created_by, auth.uid());
    NEW.updated_by := coalesce(NEW.updated_by, auth.uid());
  else
    NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
    NEW.updated_at := now();
    if NEW.archived_at is not null and OLD.archived_at is null then
      NEW.archived_by := coalesce(NEW.archived_by, auth.uid());
      if coalesce(trim(NEW.archive_reason),'') = '' then
        raise exception 'Informe o motivo do arquivamento.';
      end if;
    end if;
  end if;
  return NEW;
end $$;

-- =========================================================
-- 3.1 contract_templates
-- =========================================================
create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  code text not null,
  name text not null,
  instrument_type text not null check (instrument_type in ('contract_base','contract_complement','amendment','service_order','annex','term','authorization')),
  description text,
  status text not null default 'draft' check (status in ('draft','active','retired','archived')),
  template_version integer not null default 1,
  body_schema jsonb not null default '{}'::jsonb,
  required_fields jsonb not null default '[]'::jsonb,
  default_clauses jsonb not null default '[]'::jsonb,
  permitted_case_contexts jsonb not null default '[]'::jsonb,
  requires_human_review boolean not null default true,
  effective_from date,
  effective_until date,
  legal_owner_user_id uuid,
  notes_internal text,
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (organization_id, code, template_version)
);
grant select, insert, update on public.contract_templates to authenticated;
grant all on public.contract_templates to service_role;
alter table public.contract_templates enable row level security;
create policy ct_select on public.contract_templates for select to authenticated using (public.contract_pode_ler(organization_id));
create policy ct_insert on public.contract_templates for insert to authenticated with check (public.contract_pode_aprovar(organization_id));
create policy ct_update on public.contract_templates for update to authenticated using (public.contract_pode_aprovar(organization_id)) with check (public.contract_pode_aprovar(organization_id));

-- =========================================================
-- 3.2 contracts
-- =========================================================
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_number text not null,
  contract_type text not null check (contract_type in ('contract_base','contract_complement','amendment')),
  title text not null,
  case_id uuid references public.crm_casos(id),
  client_id uuid references public.clientes(id),
  proposal_id uuid,
  parent_contract_id uuid references public.contracts(id),
  base_contract_reference text,
  relationship_type text not null default 'independent' check (relationship_type in ('independent','complement','amendment','replacement_reference')),
  status text not null default 'draft' check (status in ('draft','pending_data','ready_for_review','under_human_review','approved_for_send','sent','signed','rejected','cancelled','archived')),
  current_version_id uuid,
  template_id uuid references public.contract_templates(id),
  purpose_summary text,
  scope_summary text,
  exclusions_summary text,
  no_exclusions_confirmed boolean not null default false,
  effective_start_date date,
  effective_end_date date,
  effective_rule text,
  privacy_terms_status text not null default 'pending' check (privacy_terms_status in ('pending','defined','not_applicable')),
  financial_change_status text not null default 'pending_review' check (financial_change_status in ('no_change','pending_review','expressly_changed','not_applicable')),
  external_expense_status text not null default 'not_applicable' check (external_expense_status in ('not_applicable','pending','estimated','approved','client_pays_directly','partially_paid')),
  financial_gate_status text not null default 'pending_contract' check (financial_gate_status in ('not_applicable','pending_contract','pending_confirmation','confirmed','blocked','exception_authorized')),
  research_gate_status text not null default 'blocked_by_contract' check (research_gate_status in ('blocked_by_contract','blocked_by_financial_gate','eligible_for_human_release','released_by_authorized_user')),
  signature_provider text not null default 'none' check (signature_provider in ('none','pending_configuration','configured','sent','signed','failed')),
  provider_envelope_id text,
  invoice_reference text,
  payment_reference text,
  review_owner_user_id uuid,
  approved_for_send_by uuid,
  approved_for_send_at timestamptz,
  signed_at timestamptz,
  signed_source text,
  signature_reference text,
  cancellation_reason text,
  internal_notes text,
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (organization_id, contract_number)
);
grant select, insert, update on public.contracts to authenticated;
grant all on public.contracts to service_role;
alter table public.contracts enable row level security;
create policy c_select on public.contracts for select to authenticated using (public.contract_pode_ler(organization_id));
create policy c_insert on public.contracts for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy c_update on public.contracts for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.3 contract_versions
-- =========================================================
create table public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  version_number integer not null,
  status text not null default 'working' check (status in ('working','validation_failed','ready_for_review','under_review','approved_for_send','superseded','signed_snapshot','archived')),
  generated_content jsonb not null default '{}'::jsonb,
  rendered_file_path text,
  rendered_file_hash text,
  render_error text,
  source_template_id uuid references public.contract_templates(id),
  change_summary text,
  created_from_version_id uuid references public.contract_versions(id),
  frozen_at timestamptz,
  frozen_by uuid,
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_decision text not null default 'pending' check (review_decision in ('pending','approved','changes_requested','rejected')),
  review_notes text,
  approved_at timestamptz,
  approved_by uuid,
  superseded_at timestamptz,
  superseded_by_version_id uuid references public.contract_versions(id),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (contract_id, version_number)
);
grant select, insert, update on public.contract_versions to authenticated;
grant all on public.contract_versions to service_role;
alter table public.contract_versions enable row level security;
create policy cv_select on public.contract_versions for select to authenticated using (public.contract_pode_ler(organization_id));
create policy cv_insert on public.contract_versions for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy cv_update on public.contract_versions for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

alter table public.contracts add constraint contracts_current_version_fk
  foreign key (current_version_id) references public.contract_versions(id);

-- =========================================================
-- 3.4 contract_parties
-- =========================================================
create table public.contract_parties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  role text not null check (role in ('provider','contracting_client','co_contractor','legal_representative','dependent','witness','authorized_payer','third_party_reference')),
  client_id uuid references public.clientes(id),
  person_name text not null,
  preferred_name text,
  document_type text,
  document_number text,
  email text,
  phone text,
  address text,
  relationship_to_case text,
  legal_capacity_status text not null default 'unknown' check (legal_capacity_status in ('adult','minor','legal_representative_required','unknown')),
  represented_by_party_id uuid references public.contract_parties(id),
  signature_required boolean not null default false,
  signature_status text not null default 'not_required' check (signature_status in ('not_required','pending','signed','refused')),
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_parties to authenticated;
grant all on public.contract_parties to service_role;
alter table public.contract_parties enable row level security;
create policy cp_select on public.contract_parties for select to authenticated using (public.contract_pode_ler(organization_id));
create policy cp_insert on public.contract_parties for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy cp_update on public.contract_parties for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.5 contract_scope_items
-- =========================================================
create table public.contract_scope_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  category text not null check (category in ('contracted_scope','deliverable','operational_condition','customer_obligation','club_obligation','exclusion','dependency','external_expense')),
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('included','excluded','pending','conditional','not_applicable')),
  source_type text not null default 'manual_review' check (source_type in ('proposal','case','manual_review','template','annex')),
  source_reference text,
  display_order integer not null default 0,
  requires_human_validation boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_scope_items to authenticated;
grant all on public.contract_scope_items to service_role;
alter table public.contract_scope_items enable row level security;
create policy csi_select on public.contract_scope_items for select to authenticated using (public.contract_pode_ler(organization_id));
create policy csi_insert on public.contract_scope_items for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy csi_update on public.contract_scope_items for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.6 contract_clause_overrides
-- =========================================================
create table public.contract_clause_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  contract_version_id uuid references public.contract_versions(id),
  clause_code text not null,
  clause_title text not null,
  action text not null check (action in ('retain','specify','replace','add','remove_not_permitted')),
  base_contract_clause_reference text,
  clause_text text,
  change_reason text,
  precedence_statement text,
  requires_human_review boolean not null default true,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_clause_overrides to authenticated;
grant all on public.contract_clause_overrides to service_role;
alter table public.contract_clause_overrides enable row level security;
create policy cco_select on public.contract_clause_overrides for select to authenticated using (public.contract_pode_ler(organization_id));
create policy cco_insert on public.contract_clause_overrides for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy cco_update on public.contract_clause_overrides for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.7 contract_annexes
-- =========================================================
create table public.contract_annexes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  contract_version_id uuid references public.contract_versions(id),
  annex_code text not null,
  title text not null,
  annex_type text not null check (annex_type in ('scope','service_order','financial_schedule','external_expenses','privacy_data','family_structure','document_list','authorization','other')),
  required_for_contract boolean not null default false,
  status text not null default 'missing' check (status in ('missing','drafting','ready_for_review','approved','attached','signed_with_contract','not_applicable','archived')),
  file_path text,
  file_hash text,
  source_reference text,
  prepared_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,
  reason_not_applicable text,
  internal_notes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_annexes to authenticated;
grant all on public.contract_annexes to service_role;
alter table public.contract_annexes enable row level security;
create policy ca_select on public.contract_annexes for select to authenticated using (public.contract_pode_ler(organization_id));
create policy ca_insert on public.contract_annexes for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy ca_update on public.contract_annexes for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.8 service_orders
-- =========================================================
create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  service_order_number text not null,
  contract_id uuid not null references public.contracts(id),
  contract_version_id uuid references public.contract_versions(id),
  case_id uuid references public.crm_casos(id),
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','active','paused','completed','cancelled','archived')),
  scope_summary text,
  start_condition_status text not null default 'pending' check (start_condition_status in ('pending','contract_signed','financial_condition_met','manually_authorized','blocked')),
  start_condition_notes text,
  responsible_user_id uuid,
  start_date date,
  end_date date,
  deliverable_summary text,
  client_visible_summary text,
  internal_notes text,
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (organization_id, service_order_number)
);
grant select, insert, update on public.service_orders to authenticated;
grant all on public.service_orders to service_role;
alter table public.service_orders enable row level security;
create policy so_select on public.service_orders for select to authenticated using (public.contract_pode_ler(organization_id));
create policy so_insert on public.service_orders for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy so_update on public.service_orders for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.9 contract_validation_results
-- =========================================================
create table public.contract_validation_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  contract_version_id uuid references public.contract_versions(id),
  validation_key text not null,
  severity text not null check (severity in ('blocking','high','medium','low')),
  status text not null default 'open' check (status in ('open','passed','waived','resolved')),
  label text not null,
  details text,
  source_field text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  resolved_at timestamptz,
  resolved_by uuid,
  waiver_reason text,
  waived_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_validation_results to authenticated;
grant all on public.contract_validation_results to service_role;
alter table public.contract_validation_results enable row level security;
create policy cvr_select on public.contract_validation_results for select to authenticated using (public.contract_pode_ler(organization_id));
create policy cvr_insert on public.contract_validation_results for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy cvr_update on public.contract_validation_results for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.10 contract_review_events
-- =========================================================
create table public.contract_review_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  contract_version_id uuid references public.contract_versions(id),
  event_type text not null check (event_type in ('created','version_created','validation_run','review_requested','review_started','changes_requested','approved_for_send','send_blocked','signature_recorded','financial_gate_blocked','activation_gate_blocked','archived','restored','exception_created','render_failed','document_downloaded')),
  actor_user_id uuid,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.contract_review_events to authenticated;
grant all on public.contract_review_events to service_role;
alter table public.contract_review_events enable row level security;
create policy cre_select on public.contract_review_events for select to authenticated using (public.contract_pode_ler(organization_id));
create policy cre_insert on public.contract_review_events for insert to authenticated with check (public.contract_pode_ler(organization_id));

-- =========================================================
-- 3.11 contract_source_links
-- =========================================================
create table public.contract_source_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid not null references public.contracts(id),
  source_type text not null check (source_type in ('proposal','case','client','dossie','checklist','prior_contract','external_authorization','other')),
  source_id uuid,
  source_reference text not null,
  access_level text not null default 'internal_restricted' check (access_level in ('internal_restricted','case_team','finance_restricted')),
  verified boolean not null default false,
  verified_by uuid,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_source_links to authenticated;
grant all on public.contract_source_links to service_role;
alter table public.contract_source_links enable row level security;
create policy csl_select on public.contract_source_links for select to authenticated using (public.contract_pode_ler(organization_id));
create policy csl_insert on public.contract_source_links for insert to authenticated with check (public.contract_pode_preparar(organization_id));
create policy csl_update on public.contract_source_links for update to authenticated using (public.contract_pode_preparar(organization_id)) with check (public.contract_pode_preparar(organization_id));

-- =========================================================
-- 3.12 contract_exceptions (somente admin)
-- =========================================================
create table public.contract_exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  contract_id uuid references public.contracts(id),
  service_order_id uuid references public.service_orders(id),
  scope text not null check (scope in ('financial_gate','activation_gate','validation_waiver','other')),
  reason text not null,
  impact text not null,
  authorized_by uuid,
  authorized_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
grant select, insert, update on public.contract_exceptions to authenticated;
grant all on public.contract_exceptions to service_role;
alter table public.contract_exceptions enable row level security;
create policy cex_select on public.contract_exceptions for select to authenticated using (public.contract_pode_ler(organization_id));
create policy cex_insert on public.contract_exceptions for insert to authenticated with check (public.contract_pode_aprovar(organization_id));
create policy cex_update on public.contract_exceptions for update to authenticated using (public.contract_pode_aprovar(organization_id)) with check (public.contract_pode_aprovar(organization_id));

-- =========================================================
-- GUARDS DE NEGÓCIO
-- =========================================================

-- numeração e integridade de contratos
create or replace function public.fn_contracts_guard()
returns trigger language plpgsql set search_path = public as $$
declare v_seq int; v_parent record;
begin
  if TG_OP = 'INSERT' then
    select count(*) + 1 into v_seq from public.contracts where organization_id = NEW.organization_id;
    NEW.contract_number := to_char(now(),'YYYY') || '-' ||
      case NEW.contract_type when 'contract_base' then 'CB' when 'contract_complement' then 'CC' else 'AD' end ||
      '-' || lpad(v_seq::text, 4, '0');
    NEW.status := coalesce(NEW.status, 'draft');
    if NEW.status not in ('draft','pending_data') then
      raise exception 'Novo instrumento deve iniciar em rascunho.';
    end if;
  else
    if NEW.contract_number is distinct from OLD.contract_number then
      raise exception 'A numeração do contrato é gerada pelo sistema e não pode ser alterada.';
    end if;
    if OLD.status = 'signed' and NEW.status not in ('signed','archived') then
      raise exception 'Contrato assinado é imutável; use complementar ou aditivo.';
    end if;
    if OLD.status = 'signed' and (
         NEW.title is distinct from OLD.title
      or NEW.purpose_summary is distinct from OLD.purpose_summary
      or NEW.scope_summary is distinct from OLD.scope_summary
      or NEW.exclusions_summary is distinct from OLD.exclusions_summary
      or NEW.contract_type is distinct from OLD.contract_type
      or NEW.parent_contract_id is distinct from OLD.parent_contract_id) then
      raise exception 'Conteúdo de contrato assinado não pode ser alterado.';
    end if;
    -- transições desabilitadas nesta fase
    if OLD.status = 'approved_for_send' and NEW.status = 'sent' then
      raise exception 'Envio de contrato está desabilitado nesta fase (integração não configurada).';
    end if;
    if OLD.status = 'sent' and NEW.status = 'signed' then
      raise exception 'Registro de assinatura está desabilitado nesta fase.';
    end if;
    if NEW.status = 'archived' and OLD.status <> 'archived' and coalesce(trim(NEW.archive_reason),'') = '' then
      raise exception 'Arquivamento exige motivo.';
    end if;
  end if;

  -- relacionamento base/complementar/aditivo
  if NEW.contract_type = 'contract_base' then
    if NEW.parent_contract_id is not null then
      raise exception 'Contrato-base não pode ter contrato-pai.';
    end if;
    NEW.relationship_type := 'independent';
  else
    if NEW.parent_contract_id is null or coalesce(trim(NEW.base_contract_reference),'') = '' then
      raise exception 'Instrumento complementar ou aditivo exige contrato-base vinculado e referência do contrato-base.';
    end if;
    select * into v_parent from public.contracts where id = NEW.parent_contract_id;
    if v_parent is null or v_parent.organization_id <> NEW.organization_id then
      raise exception 'Contrato-base deve pertencer à mesma organização.';
    end if;
    if v_parent.contract_type <> 'contract_base' then
      raise exception 'O contrato-pai deve ser um contrato-base.';
    end if;
    if NEW.relationship_type not in ('complement','amendment','replacement_reference') then
      raise exception 'Tipo de relacionamento inválido para instrumento derivado.';
    end if;
  end if;
  return NEW;
end $$;

create trigger contracts_meta before insert or update on public.contracts
  for each row execute function public.fn_contract_meta();
create trigger contracts_guard before insert or update on public.contracts
  for each row execute function public.fn_contracts_guard();
create trigger contracts_audit after insert or update on public.contracts
  for each row execute function public.fn_audit();
create trigger contracts_no_delete before delete on public.contracts
  for each row execute function public.fn_block_delete();

-- versões: sequência, imutabilidade e clonagem
create or replace function public.fn_contract_versions_guard()
returns trigger language plpgsql set search_path = public as $$
declare v_next int;
begin
  if TG_OP = 'INSERT' then
    select coalesce(max(version_number),0) + 1 into v_next
      from public.contract_versions where contract_id = NEW.contract_id;
    NEW.version_number := v_next;
    if v_next > 1 and coalesce(trim(NEW.change_summary),'') = '' then
      raise exception 'A partir da versão 2 é obrigatório informar o resumo das alterações.';
    end if;
    if NEW.status <> 'working' then
      raise exception 'Nova versão deve iniciar como versão de trabalho.';
    end if;
  else
    if OLD.status in ('approved_for_send','signed_snapshot','superseded') then
      if NEW.generated_content is distinct from OLD.generated_content
         or NEW.rendered_file_path is distinct from OLD.rendered_file_path
         or NEW.rendered_file_hash is distinct from OLD.rendered_file_hash
         or NEW.version_number is distinct from OLD.version_number then
        raise exception 'Versão congelada é imutável. Crie uma nova versão de trabalho.';
      end if;
      if OLD.status <> 'superseded' and NEW.status not in (OLD.status,'superseded','archived','signed_snapshot') then
        raise exception 'Transição de versão não permitida a partir de versão congelada.';
      end if;
    end if;
    if OLD.frozen_at is not null and NEW.generated_content is distinct from OLD.generated_content then
      raise exception 'Conteúdo congelado não pode ser editado.';
    end if;
    if OLD.rendered_file_path is not null and NEW.rendered_file_path is distinct from OLD.rendered_file_path
       and OLD.status <> 'working' then
      raise exception 'Arquivo de versão não pode ser substituído no mesmo caminho.';
    end if;
  end if;
  return NEW;
end $$;

create trigger cv_meta before insert or update on public.contract_versions
  for each row execute function public.fn_contract_meta();
create trigger cv_guard before insert or update on public.contract_versions
  for each row execute function public.fn_contract_versions_guard();
create trigger cv_audit after insert or update on public.contract_versions
  for each row execute function public.fn_audit();
create trigger cv_no_delete before delete on public.contract_versions
  for each row execute function public.fn_block_delete();

-- cláusulas
create or replace function public.fn_clause_overrides_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.action = 'replace' then
    if coalesce(trim(NEW.base_contract_clause_reference),'') = ''
       or coalesce(trim(NEW.change_reason),'') = ''
       or coalesce(trim(NEW.precedence_statement),'') = '' then
      raise exception 'Substituição de cláusula exige referência da cláusula-base, justificativa e declaração de precedência.';
    end if;
    NEW.requires_human_review := true;
  end if;
  if NEW.action = 'remove_not_permitted' and coalesce(trim(NEW.change_reason),'') = '' then
    raise exception 'Registrar cláusula não reproduzida exige justificativa. O contrato-base permanece íntegro.';
  end if;
  return NEW;
end $$;

create trigger cco_meta before insert or update on public.contract_clause_overrides
  for each row execute function public.fn_contract_meta();
create trigger cco_guard before insert or update on public.contract_clause_overrides
  for each row execute function public.fn_clause_overrides_guard();
create trigger cco_no_delete before delete on public.contract_clause_overrides
  for each row execute function public.fn_block_delete();

-- partes
create or replace function public.fn_contract_parties_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.signature_required and NEW.legal_capacity_status in ('minor','legal_representative_required')
     and NEW.represented_by_party_id is null then
    raise exception 'Parte menor de idade não pode assinar sem representante legal vinculado.';
  end if;
  return NEW;
end $$;

create trigger cparties_meta before insert or update on public.contract_parties
  for each row execute function public.fn_contract_meta();
create trigger cparties_guard before insert or update on public.contract_parties
  for each row execute function public.fn_contract_parties_guard();
create trigger cparties_no_delete before delete on public.contract_parties
  for each row execute function public.fn_block_delete();

-- anexos
create or replace function public.fn_contract_annexes_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.status = 'not_applicable' and coalesce(trim(NEW.reason_not_applicable),'') = '' then
    raise exception 'Anexo marcado como não aplicável exige motivo.';
  end if;
  if NEW.status = 'signed_with_contract' then
    raise exception 'Assinatura de anexo está desabilitada nesta fase.';
  end if;
  return NEW;
end $$;

create trigger cannex_meta before insert or update on public.contract_annexes
  for each row execute function public.fn_contract_meta();
create trigger cannex_guard before insert or update on public.contract_annexes
  for each row execute function public.fn_contract_annexes_guard();
create trigger cannex_no_delete before delete on public.contract_annexes
  for each row execute function public.fn_block_delete();

-- ordens de serviço: numeração + gates
create or replace function public.fn_service_orders_guard()
returns trigger language plpgsql set search_path = public as $$
declare v_seq int; v_contract record; v_excecao boolean;
begin
  select * into v_contract from public.contracts where id = NEW.contract_id;
  if v_contract is null or v_contract.organization_id <> NEW.organization_id then
    raise exception 'Ordem de serviço deve referenciar contrato da mesma organização.';
  end if;

  if TG_OP = 'INSERT' then
    select count(*) + 1 into v_seq from public.service_orders where organization_id = NEW.organization_id;
    NEW.service_order_number := to_char(now(),'YYYY') || '-OS-' || lpad(v_seq::text, 4, '0');
  else
    if NEW.service_order_number is distinct from OLD.service_order_number then
      raise exception 'A numeração da ordem de serviço é gerada pelo sistema.';
    end if;
  end if;

  if NEW.status = 'active' and (TG_OP = 'INSERT' or OLD.status <> 'active') then
    select exists (
      select 1 from public.contract_exceptions e
      where e.contract_id = NEW.contract_id
        and e.scope in ('activation_gate','financial_gate')
        and e.revoked_at is null and e.archived_at is null
        and (e.expires_at is null or e.expires_at > now())
    ) into v_excecao;
    if not v_excecao then
      if v_contract.status <> 'signed' then
        insert into public.contract_review_events (organization_id, contract_id, event_type, actor_user_id, metadata)
        values (NEW.organization_id, NEW.contract_id, 'activation_gate_blocked', auth.uid(), jsonb_build_object('motivo','contrato_nao_assinado'));
        raise exception 'Ordem de serviço não pode ser ativada sem contrato assinado.';
      end if;
      if v_contract.financial_gate_status not in ('confirmed','not_applicable') then
        insert into public.contract_review_events (organization_id, contract_id, event_type, actor_user_id, metadata)
        values (NEW.organization_id, NEW.contract_id, 'financial_gate_blocked', auth.uid(), jsonb_build_object('motivo','condicao_financeira_nao_confirmada'));
        raise exception 'Ordem de serviço não pode ser ativada sem condição financeira confirmada.';
      end if;
    end if;
  end if;
  return NEW;
end $$;

create trigger so_meta before insert or update on public.service_orders
  for each row execute function public.fn_contract_meta();
create trigger so_guard before insert or update on public.service_orders
  for each row execute function public.fn_service_orders_guard();
create trigger so_audit after insert or update on public.service_orders
  for each row execute function public.fn_audit();
create trigger so_no_delete before delete on public.service_orders
  for each row execute function public.fn_block_delete();

-- demais metadados e bloqueio de delete
create trigger ctpl_meta before insert or update on public.contract_templates
  for each row execute function public.fn_contract_meta();
create trigger ctpl_no_delete before delete on public.contract_templates
  for each row execute function public.fn_block_delete();
create trigger csi_meta before insert or update on public.contract_scope_items
  for each row execute function public.fn_contract_meta();
create trigger csi_no_delete before delete on public.contract_scope_items
  for each row execute function public.fn_block_delete();
create trigger csl_meta before insert or update on public.contract_source_links
  for each row execute function public.fn_contract_meta();
create trigger csl_no_delete before delete on public.contract_source_links
  for each row execute function public.fn_block_delete();
create trigger cvr_meta before insert or update on public.contract_validation_results
  for each row execute function public.fn_contract_meta();
create trigger cvr_no_delete before delete on public.contract_validation_results
  for each row execute function public.fn_block_delete();
create trigger cex_meta before insert or update on public.contract_exceptions
  for each row execute function public.fn_contract_meta();
create trigger cex_audit after insert or update on public.contract_exceptions
  for each row execute function public.fn_audit();
create trigger cex_no_delete before delete on public.contract_exceptions
  for each row execute function public.fn_block_delete();
create trigger cre_no_delete before delete on public.contract_review_events
  for each row execute function public.fn_block_delete();

-- =========================================================
-- VALIDAÇÃO DE PRONTIDÃO
-- =========================================================
create or replace function public.validate_contract_readiness(_contract_id uuid, _version_id uuid default null)
returns table (validation_key text, severity text, status text, label text, details text)
language plpgsql security definer set search_path = public as $$
declare c record; v record; n int;
begin
  select * into c from public.contracts where id = _contract_id;
  if c is null then raise exception 'Contrato não encontrado.'; end if;
  if not public.contract_pode_ler(c.organization_id) then raise exception 'Acesso negado.'; end if;

  select * into v from public.contract_versions
    where contract_id = _contract_id and (_version_id is null or id = _version_id)
    order by version_number desc limit 1;

  create temp table _res (validation_key text, severity text, status text, label text, details text) on commit drop;

  insert into _res values
    ('contract_type','blocking', case when c.contract_type is null then 'open' else 'passed' end,'Tipo de instrumento definido', null),
    ('title_purpose','blocking', case when coalesce(trim(c.title),'')='' or coalesce(trim(c.purpose_summary),'')='' then 'open' else 'passed' end,'Título e finalidade preenchidos', null),
    ('review_owner','blocking', case when c.review_owner_user_id is null then 'open' else 'passed' end,'Responsável pela revisão humana definido', null),
    ('financial_classification','blocking', case when c.financial_change_status = 'pending_review' then 'open' else 'passed' end,'Condição financeira classificada', null),
    ('privacy_terms','high', case when c.privacy_terms_status = 'pending' then 'open' else 'passed' end,'Tratamento de dados indicado', null),
    ('external_expenses','high', case when c.external_expense_status = 'pending' then 'open' else 'passed' end,'Regra de despesas de terceiros definida', null),
    ('effective_period','blocking', case when c.effective_start_date is null and coalesce(trim(c.effective_rule),'')='' then 'open' else 'passed' end,'Vigência ou regra de vigência definida', null),
    ('exclusions','blocking', case when coalesce(trim(c.exclusions_summary),'')='' and not c.no_exclusions_confirmed then 'open' else 'passed' end,'Exclusões declaradas ou ausência confirmada', null);

  select count(*) into n from public.contract_parties where contract_id = _contract_id and role = 'provider' and active and archived_at is null;
  insert into _res values ('party_provider','blocking', case when n = 0 then 'open' else 'passed' end,'Parte prestadora informada', null);
  select count(*) into n from public.contract_parties where contract_id = _contract_id and role = 'contracting_client' and active and archived_at is null;
  insert into _res values ('party_client','blocking', case when n = 0 then 'open' else 'passed' end,'Parte contratante informada', null);
  select count(*) into n from public.contract_parties where contract_id = _contract_id and active and archived_at is null
    and signature_required and legal_capacity_status in ('minor','legal_representative_required') and represented_by_party_id is null;
  insert into _res values ('party_minor','blocking', case when n > 0 then 'open' else 'passed' end,'Menores com representante legal', null);

  select count(*) into n from public.contract_scope_items where contract_id = _contract_id and category = 'contracted_scope' and status = 'included' and archived_at is null;
  insert into _res values ('scope_defined','blocking', case when n = 0 then 'open' else 'passed' end,'Escopo contratado definido', null);

  select count(*) into n from public.contract_annexes where contract_id = _contract_id and required_for_contract
    and status not in ('ready_for_review','approved','attached','not_applicable') and archived_at is null;
  insert into _res values ('annexes_required','blocking', case when n > 0 then 'open' else 'passed' end,'Anexos obrigatórios preparados', nullif(n,0)::text);

  insert into _res values ('version_content','blocking',
    case when v is null or v.generated_content = '{}'::jsonb then 'open' else 'passed' end,
    'Versão de trabalho com conteúdo gerado', null);

  if c.contract_type in ('contract_complement','amendment') then
    insert into _res values
      ('parent_contract','blocking', case when c.parent_contract_id is null or coalesce(trim(c.base_contract_reference),'')='' then 'open' else 'passed' end,'Contrato-base vinculado e referenciado', null);
    select count(*) into n from public.contract_clause_overrides where contract_id = _contract_id and archived_at is null;
    insert into _res values ('instrument_not_empty','blocking', case when n = 0 then 'open' else 'passed' end,'Instrumento derivado possui itens expressamente indicados', null);
    select count(*) into n from public.contract_clause_overrides where contract_id = _contract_id and archived_at is null
      and action = 'replace' and (coalesce(trim(base_contract_clause_reference),'')='' or coalesce(trim(change_reason),'')='' or coalesce(trim(precedence_statement),'')='');
    insert into _res values ('replace_requirements','blocking', case when n > 0 then 'open' else 'passed' end,'Substituições com cláusula-base, justificativa e precedência', null);
  end if;

  -- persiste resultados
  delete from public.contract_validation_results
    where contract_id = _contract_id and status = 'open'
      and (contract_version_id is not distinct from (select v.id));
  insert into public.contract_validation_results
    (organization_id, contract_id, contract_version_id, validation_key, severity, status, label, details, created_by)
  select c.organization_id, _contract_id, (select v.id), r.validation_key, r.severity, r.status, r.label, r.details, auth.uid()
  from _res r;

  insert into public.contract_review_events (organization_id, contract_id, contract_version_id, event_type, actor_user_id, metadata)
  values (c.organization_id, _contract_id, (select v.id), 'validation_run', auth.uid(),
          jsonb_build_object('abertas', (select count(*) from _res where status = 'open')));

  return query select r.validation_key, r.severity, r.status, r.label, r.details from _res r;
end $$;

revoke all on function public.validate_contract_readiness(uuid, uuid) from public;
grant execute on function public.validate_contract_readiness(uuid, uuid) to authenticated;

create index idx_contracts_org on public.contracts(organization_id, status);
create index idx_cv_contract on public.contract_versions(contract_id, version_number desc);
create index idx_cvr_contract on public.contract_validation_results(contract_id, status);
create index idx_cre_contract on public.contract_review_events(contract_id, occurred_at desc);
create index idx_so_org on public.service_orders(organization_id, status);