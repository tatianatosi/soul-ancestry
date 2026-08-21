create table if not exists public.message_template_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  key text not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (organization_id, key)
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  category_id uuid not null references public.message_template_categories(id),
  key text not null,
  name text not null,
  objective text,
  channel text not null check (channel in ('whatsapp','email','portal','artigo','newsletter','social','interno')),
  stage_scope text,
  audience text not null check (audience in ('lead','contato','contratante','participante_autorizado','cliente_ativo','interno','publico')),
  body text not null,
  subject text,
  safe_variables jsonb not null default '[]'::jsonb,
  required_variables jsonb not null default '[]'::jsonb,
  prohibited_claims jsonb not null default '[]'::jsonb,
  requires_human_review boolean not null default true,
  requires_gate_validation boolean not null default true,
  status text not null default 'rascunho'
    check (status in ('rascunho','em_revisao','aprovado','vigente','substituido','suspenso','arquivado')),
  version int not null default 1,
  effective_from timestamptz,
  effective_until timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  supersedes_template_id uuid references public.message_templates(id),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  unique (organization_id, key)
);

create table if not exists public.message_template_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  template_id uuid not null references public.message_templates(id),
  version int not null,
  body_snapshot text not null,
  subject_snapshot text,
  variables_snapshot jsonb not null default '{}'::jsonb,
  change_reason text,
  status_snapshot text not null,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);

create table if not exists public.message_template_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  template_id uuid not null references public.message_templates(id),
  template_version int not null,
  lead_id uuid,
  opportunity_id uuid,
  case_id uuid,
  person_id uuid,
  channel text not null,
  rendered_preview text,
  variables_used jsonb not null default '{}'::jsonb,
  purpose text,
  external_send_status text not null default 'nao_enviado'
    check (external_send_status in ('nao_enviado','copiado_para_envio_manual','registrado_como_enviado_externamente')),
  external_evidence_reference text,
  notes text,
  bloqueado boolean not null default false,
  bloqueios jsonb not null default '[]'::jsonb,
  used_by uuid default auth.uid(),
  used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);

create table if not exists public.editorial_content_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  title text not null,
  content_type text not null check (content_type in ('artigo','newsletter','post_social','roteiro_video','pauta','atualizacao_site')),
  theme text,
  funnel_stage text check (funnel_stage in ('descoberta','consideracao','decisao','onboarding','legado','institucional')),
  target_audience text,
  country_or_service text,
  status text not null default 'ideia'
    check (status in ('ideia','pauta_aprovada','rascunho','em_revisao','aprovado','agendado','publicado','arquivado')),
  owner_id uuid,
  planned_for date,
  published_at timestamptz,
  content_body text,
  source_references jsonb not null default '[]'::jsonb,
  review_notes text,
  approval_by uuid,
  approval_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);

create table if not exists public.editorial_content_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  editorial_content_item_id uuid not null references public.editorial_content_items(id),
  linked_entity_type text not null,
  linked_entity_id uuid,
  link_type text not null check (link_type in ('referencia','derivado_de','reutiliza_template','relacionado_a')),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);

grant select, insert, update on public.message_template_categories to authenticated;
grant select, insert, update on public.message_templates to authenticated;
grant select, insert on public.message_template_versions to authenticated;
grant select, insert, update on public.message_template_usage to authenticated;
grant select, insert, update on public.editorial_content_items to authenticated;
grant select, insert, update on public.editorial_content_links to authenticated;
grant all on public.message_template_categories to service_role;
grant all on public.message_templates to service_role;
grant all on public.message_template_versions to service_role;
grant all on public.message_template_usage to service_role;
grant all on public.editorial_content_items to service_role;
grant all on public.editorial_content_links to service_role;

alter table public.message_template_categories enable row level security;
alter table public.message_templates enable row level security;
alter table public.message_template_versions enable row level security;
alter table public.message_template_usage enable row level security;
alter table public.editorial_content_items enable row level security;
alter table public.editorial_content_links enable row level security;

create policy mtc_sel on public.message_template_categories for select to authenticated using (is_org_member(organization_id));
create policy mtc_ins on public.message_template_categories for insert to authenticated with check (has_org_role(organization_id,'admin'::app_role));
create policy mtc_upd on public.message_template_categories for update to authenticated using (has_org_role(organization_id,'admin'::app_role)) with check (has_org_role(organization_id,'admin'::app_role));

create policy mt_sel on public.message_templates for select to authenticated using (is_org_member(organization_id));
create policy mt_ins on public.message_templates for insert to authenticated with check (can_write(organization_id));
create policy mt_upd on public.message_templates for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

create policy mtv_sel on public.message_template_versions for select to authenticated using (is_org_member(organization_id));
create policy mtv_ins on public.message_template_versions for insert to authenticated with check (can_write(organization_id));

create policy mtu_sel on public.message_template_usage for select to authenticated using (is_org_member(organization_id));
create policy mtu_ins on public.message_template_usage for insert to authenticated with check (can_write(organization_id));
create policy mtu_upd on public.message_template_usage for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

create policy eci_sel on public.editorial_content_items for select to authenticated using (is_org_member(organization_id));
create policy eci_ins on public.editorial_content_items for insert to authenticated with check (can_write(organization_id));
create policy eci_upd on public.editorial_content_items for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

create policy ecl_sel on public.editorial_content_links for select to authenticated using (is_org_member(organization_id));
create policy ecl_ins on public.editorial_content_links for insert to authenticated with check (can_write(organization_id));
create policy ecl_upd on public.editorial_content_links for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));