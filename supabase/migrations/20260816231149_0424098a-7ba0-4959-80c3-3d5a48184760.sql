-- ============ MÓDULO DE PESQUISA GENEALÓGICA E EVIDÊNCIAS ============
-- Camada nova, sem alterar tabelas existentes.

-- ---------- Helpers de papel ----------
create or replace function public.rg_papel(_org uuid)
returns app_role language sql stable security definer set search_path=public as $$
  select public.staff_meu_papel(_org)
$$;

create or replace function public.rg_ler_detalhe(_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff_ativo(_org)
     and public.staff_meu_papel(_org) = any (array['admin','operacoes','pesquisador','leitura']::app_role[])
$$;

create or replace function public.rg_ler_resumo(_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff_ativo(_org)
     and public.staff_meu_papel(_org) = any (array['admin','operacoes','pesquisador','leitura','comercial']::app_role[])
$$;

create or replace function public.rg_editar(_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff_ativo(_org)
     and public.staff_meu_papel(_org) = any (array['admin','operacoes','pesquisador']::app_role[])
$$;

create or replace function public.rg_admin(_org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_staff_ativo(_org) and public.staff_meu_papel(_org) = 'admin'::app_role
$$;

-- ---------- research_cases ----------
create table public.research_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid not null references public.crm_casos(id),
  status text not null default 'not_started'
    check (status in ('not_started','preparation','internal_research','awaiting_documents','awaiting_review','paused','completed','archived')),
  research_scope_summary text,
  country_context text,
  family_line_summary_internal text,
  research_objective text not null default '',
  confidence_level text not null default 'not_assessed'
    check (confidence_level in ('not_assessed','low','medium','high')),
  external_research_gate_status text not null default 'blocked_by_contract'
    check (external_research_gate_status in ('blocked_by_contract','blocked_by_financial_gate','pending_authorization','blocked_by_quality','blocked_by_case_status','eligible_for_human_release','released_by_authorized_user')),
  external_research_authorization_status text not null default 'not_requested'
    check (external_research_authorization_status in ('not_applicable','not_requested','pending','registered','denied','expired')),
  assigned_researcher_user_id uuid,
  next_research_action text,
  next_research_action_due_at timestamptz,
  internal_risk_summary text,
  client_summary_status text not null default 'not_drafted'
    check (client_summary_status in ('not_drafted','drafted','reviewed','approved_for_release','released','not_applicable')),
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (organization_id, case_id)
);

-- ---------- research_people ----------
create table public.research_people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  canonical_name text not null,
  preferred_display_name text,
  person_status text not null default 'unknown_person'
    check (person_status in ('subject','family_member','ancestor','descendant','related_person','unknown_person')),
  living_status text not null default 'unknown' check (living_status in ('living','deceased','unknown')),
  is_minor boolean not null default false,
  birth_date date,
  birth_date_precision text not null default 'unknown' check (birth_date_precision in ('exact','month_year','year','estimated','unknown')),
  birth_place text,
  death_date date,
  death_date_precision text check (death_date_precision in ('exact','month_year','year','estimated','unknown')),
  death_place text,
  gender_or_descriptor text,
  nationality_context text,
  notes_internal text,
  identity_status text not null default 'unreviewed'
    check (identity_status in ('unreviewed','tentative','reviewed','confirmed','conflicting')),
  sensitivity_level text not null default 'standard' check (sensitivity_level in ('standard','restricted','highly_restricted')),
  visible_to_client_summary boolean not null default false,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_name_variants ----------
create table public.research_name_variants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  person_id uuid not null references public.research_people(id),
  variant_name text not null,
  variant_type text not null default 'spelling'
    check (variant_type in ('spelling','transliteration','married_name','record_error','abbreviation','alternate_language','other')),
  source_evidence_id uuid,
  status text not null default 'unreviewed' check (status in ('unreviewed','plausible','validated','rejected')),
  notes text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_relationships ----------
create table public.research_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  person_a_id uuid not null references public.research_people(id),
  person_b_id uuid not null references public.research_people(id),
  relationship_type text not null default 'unknown'
    check (relationship_type in ('parent','child','spouse','sibling','grandparent','grandchild','guardian','adopter','adopted_child','other','unknown')),
  directionality text not null default 'unknown' check (directionality in ('a_to_b','b_to_a','bidirectional','unknown')),
  status text not null default 'asserted' check (status in ('asserted','under_review','supported','validated','conflicting','rejected')),
  confidence_level text not null default 'low' check (confidence_level in ('low','medium','high')),
  supporting_evidence_count integer not null default 0,
  notes_internal text,
  validated_by uuid, validated_at timestamptz,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text,
  constraint research_relationships_nao_reflexiva check (person_a_id <> person_b_id)
);

-- ---------- research_case_events ----------
create table public.research_case_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  person_id uuid references public.research_people(id),
  event_type text not null default 'other'
    check (event_type in ('birth','baptism','marriage','divorce','death','burial','migration','naturalization','military_service','residence','name_change','document_issue','other')),
  event_date date,
  event_date_precision text not null default 'unknown' check (event_date_precision in ('exact','month_year','year','estimated','unknown')),
  location_text text,
  country_context text,
  status text not null default 'asserted' check (status in ('asserted','under_review','supported','validated','conflicting','rejected')),
  confidence_level text not null default 'low' check (confidence_level in ('low','medium','high')),
  notes_internal text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_sources ----------
create table public.research_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid references public.research_cases(id),
  source_type text not null default 'other'
    check (source_type in ('family_document','civil_record','religious_record','archive_catalog','public_archive','familysearch_reference','official_registry','interview','client_provided','internal_note','other')),
  title text not null,
  repository_or_institution text,
  citation_text text,
  url text,
  access_date date,
  publication_or_record_date date,
  source_status text not null default 'referenced'
    check (source_status in ('referenced','located','reviewed','verified','inaccessible','rejected')),
  access_level text not null default 'internal_restricted'
    check (access_level in ('internal_restricted','case_team','client_provided_restricted')),
  external_source boolean not null default false,
  reviewed_by uuid, reviewed_at timestamptz,
  notes_internal text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_evidence_items ----------
create table public.research_evidence_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  evidence_type text not null default 'other'
    check (evidence_type in ('document','record_excerpt','photo','oral_history','registry_entry','archive_reference','timeline_item','correspondence','structured_note','other')),
  title text not null,
  description text,
  person_id uuid references public.research_people(id),
  relationship_id uuid references public.research_relationships(id),
  event_id uuid references public.research_case_events(id),
  source_id uuid references public.research_sources(id),
  document_id uuid references public.documents(id),
  external_reference text,
  origem_externa boolean not null default false,
  fornecida_pelo_cliente boolean not null default false,
  evidence_status text not null default 'collected'
    check (evidence_status in ('collected','under_review','validated','inconclusive','discarded','archived')),
  confidence_level text not null default 'low' check (confidence_level in ('low','medium','high')),
  validation_rationale text,
  discard_reason text,
  reviewed_by uuid, reviewed_at timestamptz,
  validated_by uuid, validated_at timestamptz,
  responsible_user_id uuid,
  sensitivity_level text not null default 'standard' check (sensitivity_level in ('standard','restricted','highly_restricted')),
  client_visibility text not null default 'never' check (client_visibility in ('never','summary_only','eligible_for_release','released')),
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

alter table public.research_name_variants
  add constraint research_name_variants_evidence_fkey
  foreign key (source_evidence_id) references public.research_evidence_items(id);

-- ---------- research_evidence_links ----------
create table public.research_evidence_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  evidence_item_id uuid not null references public.research_evidence_items(id),
  entity_type text not null check (entity_type in ('person','relationship','event','source','research_case')),
  entity_id uuid not null,
  link_role text not null default 'supports'
    check (link_role in ('supports','contradicts','identifies','dates','locates','contextualizes','duplicate_reference','other')),
  notes text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text,
  unique (evidence_item_id, entity_type, entity_id, link_role)
);

-- ---------- research_case_hypotheses ----------
create table public.research_case_hypotheses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  title text not null,
  statement text not null default '',
  category text not null default 'other'
    check (category in ('identity','parentage','lineage','location','date','document_gap','legal_context_internal','other')),
  status text not null default 'open' check (status in ('open','under_review','supported','not_supported','inconclusive','closed')),
  confidence_level text not null default 'low' check (confidence_level in ('low','medium','high')),
  related_person_id uuid references public.research_people(id),
  related_relationship_id uuid references public.research_relationships(id),
  related_event_id uuid references public.research_case_events(id),
  client_visibility text not null default 'never' check (client_visibility = 'never'),
  reviewed_by uuid, reviewed_at timestamptz, closure_reason text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_document_requests ----------
create table public.research_document_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  person_id uuid references public.research_people(id),
  request_type text not null default 'client_document'
    check (request_type in ('client_document','internal_review','future_external_request','archive_request','registry_request','translation','apostille','other')),
  requested_document_type text not null,
  target_institution text,
  target_location text,
  status text not null default 'draft'
    check (status in ('draft','requested_from_client','received','under_review','completed','blocked_by_gate','cancelled','archived')),
  external_action_required boolean not null default false,
  external_gate_status text not null default 'not_applicable'
    check (external_gate_status in ('not_applicable','blocked_by_contract','blocked_by_financial_gate','pending_authorization','blocked_by_quality','blocked_by_case_status','eligible_for_human_release','released_by_authorized_user')),
  requested_at timestamptz, due_at timestamptz, received_at timestamptz,
  responsible_user_id uuid,
  client_visible boolean not null default false,
  notes_internal text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_pending_items ----------
create table public.research_pending_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  title text not null,
  description text,
  category text not null default 'other'
    check (category in ('identity','relationship','event','source','document','conflict','authorization','external_gate','review','other')),
  severity text not null default 'medium' check (severity in ('critical','high','medium','low')),
  status text not null default 'open' check (status in ('open','in_progress','blocked','resolved','not_applicable','archived')),
  blocking_reason text,
  responsible_user_id uuid,
  tarefa_id uuid references public.tarefas(id),
  due_at timestamptz, resolved_at timestamptz, resolved_by uuid, resolution_note text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_reports ----------
create table public.research_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  report_type text not null default 'internal_progress'
    check (report_type in ('internal_progress','internal_findings','client_summary_draft','client_summary_approved','delivery_internal')),
  status text not null default 'draft' check (status in ('draft','under_review','approved','released','archived')),
  title text not null,
  content text not null default '',
  generated_from_snapshot_at timestamptz,
  reviewed_by uuid, reviewed_at timestamptz,
  approved_by uuid, approved_at timestamptz,
  client_release_authorized_by uuid, client_release_authorized_at timestamptz,
  file_path text, file_hash text,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_client_summaries ----------
create table public.research_client_summaries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid not null references public.research_cases(id),
  title_client_facing text not null,
  summary_client_facing text not null default '',
  validated_facts_only boolean not null default true,
  status text not null default 'draft' check (status in ('draft','under_review','approved_for_release','released','archived')),
  approved_by uuid, approved_at timestamptz,
  released_by uuid, released_at timestamptz,
  created_at timestamptz not null default now(), created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(), updated_by uuid,
  archived_at timestamptz, archived_by uuid, archive_reason text
);

-- ---------- research_audit_events ----------
create table public.research_audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  research_case_id uuid,
  entity_type text not null,
  entity_id uuid,
  event_type text not null
    check (event_type in ('created','updated','status_changed','validation_failed','review_requested','reviewed','validated','discarded','archived','restored','external_action_blocked','client_visibility_blocked','export_blocked')),
  actor_user_id uuid default auth.uid(),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index idx_rg_people_case on public.research_people(research_case_id);
create index idx_rg_rel_case on public.research_relationships(research_case_id);
create index idx_rg_ev_case on public.research_case_events(research_case_id);
create index idx_rg_evid_case on public.research_evidence_items(research_case_id);
create index idx_rg_links_ent on public.research_evidence_links(entity_type, entity_id);
create index idx_rg_pend_case on public.research_pending_items(research_case_id);
create index idx_rg_audit_case on public.research_audit_events(research_case_id, occurred_at desc);