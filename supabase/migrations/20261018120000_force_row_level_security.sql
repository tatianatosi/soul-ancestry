-- Ativa FORCE ROW LEVEL SECURITY nas 167 tabelas do schema public com RLS
-- habilitado (18/10/2026).
--
-- Origem: auditoria launchworthy desta sessão identificou que nenhuma das
-- tabelas com `ENABLE ROW LEVEL SECURITY` também tinha `FORCE ROW LEVEL
-- SECURITY` — ou seja, a política RLS só se aplica a roles comuns
-- (authenticated/anon); o dono da tabela ou uma conexão futura que use
-- privilégio de owner por engano passaria por cima da política
-- silenciosamente, em vez de falhar. Não é uma falha ativa hoje
-- (service_role fica confinado a src/integrations/supabase/client.server.ts,
-- testado em ~15 arquivos de teste dedicados), mas é rede de segurança que
-- faltava. Autorizado pela Proprietária em 18/10/2026.
--
-- A lista completa de 167 tabelas (não as 99 que uma contagem anterior,
-- incorreta, tinha identificado) foi extraída de
-- `grep -rhoiE "alter table ... enable row level security" supabase/migrations/*.sql`
-- e cruzada contra o schema atual gerado (`src/integrations/supabase/types.ts`):
-- 166 das 167 existem lá; `client_tab_dwell_events` (migration
-- 20261011120000) não aparece no types.ts deste checkout mas não foi
-- dropada em nenhuma migration — incluída mesmo assim, por segurança.
--
-- `FORCE ROW LEVEL SECURITY` é idempotente: pode rodar mais de uma vez sem
-- efeito colateral. Não cria política nova, não altera dado, não afeta
-- service_role (que sempre ignora RLS, com ou sem FORCE).

alter table public.ancestralscan_triagens force row level security;
alter table public.app_projection_shares force row level security;
alter table public.app_projections force row level security;
alter table public.artifact_register force row level security;
alter table public.attribution_records force row level security;
alter table public.audit_logs force row level security;
alter table public.auth_throttle force row level security;
alter table public.authorized_portal_emails force row level security;
alter table public.blueprint_parameters force row level security;
alter table public.bootstrap_lock force row level security;
alter table public.case_activation_checks force row level security;
alter table public.case_alerts force row level security;
alter table public.case_aliases force row level security;
alter table public.case_checklist_items force row level security;
alter table public.case_commercial_condition force row level security;
alter table public.case_dependents force row level security;
alter table public.case_espera_externa force row level security;
alter table public.case_grupos_comunicacao force row level security;
alter table public.case_members force row level security;
alter table public.case_phase_history force row level security;
alter table public.case_plans force row level security;
alter table public.case_reports force row level security;
alter table public.case_service_criterios force row level security;
alter table public.case_services force row level security;
alter table public.case_source_document_links force row level security;
alter table public.case_source_documents force row level security;
alter table public.case_timeline_events force row level security;
alter table public.caso_log force row level security;
alter table public.casos force row level security;
alter table public.catalog_audit_events force row level security;
alter table public.catalog_payment_link_refs force row level security;
alter table public.catalog_reconciliation_runs force row level security;
alter table public.catalog_source_divergences force row level security;
alter table public.change_log force row level security;
alter table public.checklist_cadastral force row level security;
alter table public.citizenship_tracks force row level security;
alter table public.client_access_events force row level security;
alter table public.client_contacts force row level security;
alter table public.client_deliverables force row level security;
alter table public.client_portal_access force row level security;
alter table public.client_portal_case_access force row level security;
alter table public.client_tab_dwell_events force row level security;
alter table public.clientes force row level security;
alter table public.commercial_conditions force row level security;
alter table public.communication_queue force row level security;
alter table public.composition_template_events force row level security;
alter table public.composition_templates force row level security;
alter table public.consent_exceptions force row level security;
alter table public.consent_records force row level security;
alter table public.contacts force row level security;
alter table public.contract_annexes force row level security;
alter table public.contract_case_parameters force row level security;
alter table public.contract_clause_overrides force row level security;
alter table public.contract_exceptions force row level security;
alter table public.contract_parameter_previews force row level security;
alter table public.contract_parameter_values force row level security;
alter table public.contract_parties force row level security;
alter table public.contract_review_events force row level security;
alter table public.contract_scope_items force row level security;
alter table public.contract_source_links force row level security;
alter table public.contract_templates force row level security;
alter table public.contract_validation_results force row level security;
alter table public.contract_versions force row level security;
alter table public.contracts force row level security;
alter table public.controlled_taxonomies force row level security;
alter table public.conversion_events force row level security;
alter table public.crm_casos force row level security;
alter table public.crm_interactions force row level security;
alter table public.decisions force row level security;
alter table public.discovery_assessments force row level security;
alter table public.document_requests force row level security;
alter table public.documents force row level security;
alter table public.drive_provisioning_queue force row level security;
alter table public.editorial_content_items force row level security;
alter table public.editorial_content_links force row level security;
alter table public.entity_labels force row level security;
alter table public.eventos_financeiros force row level security;
alter table public.evidence_validations force row level security;
alter table public.evidences force row level security;
alter table public.evidencia_acessos force row level security;
alter table public.evidencias force row level security;
alter table public.expense_estimates force row level security;
alter table public.genealogical_events force row level security;
alter table public.genealogical_findings force row level security;
alter table public.genealogical_person_profiles force row level security;
alter table public.genealogical_relationships force row level security;
alter table public.genealogical_sources_catalog force row level security;
alter table public.import_batches force row level security;
alter table public.incremental_scope force row level security;
alter table public.institutional_profile_events force row level security;
alter table public.institutional_profiles force row level security;
alter table public.institutions force row level security;
alter table public.integration_review_queue force row level security;
alter table public.integration_runs force row level security;
alter table public.integrations force row level security;
alter table public.invoice_adjustments force row level security;
alter table public.invoices force row level security;
alter table public.knowledge_items force row level security;
alter table public.label_taxonomy force row level security;
alter table public.lead_sources force row level security;
alter table public.leads force row level security;
alter table public.legacy_catalog_import force row level security;
alter table public.legacy_record_links force row level security;
alter table public.legacy_sku_mappings force row level security;
alter table public.legal_clause_matrix force row level security;
alter table public.legal_reference_milestones force row level security;
alter table public.lineage_encounters force row level security;
alter table public.lineage_paths force row level security;
alter table public.marketing_campaigns force row level security;
alter table public.marketing_investments force row level security;
alter table public.master_library_items force row level security;
alter table public.master_library_state_events force row level security;
alter table public.message_template_categories force row level security;
alter table public.message_template_usage force row level security;
alter table public.message_template_versions force row level security;
alter table public.message_templates force row level security;
alter table public.microentregas force row level security;
alter table public.migration_exceptions force row level security;
alter table public.name_variants force row level security;
alter table public.nucleo_membros force row level security;
alter table public.nucleos_familiares force row level security;
alter table public.onboarding_checklist force row level security;
alter table public.onboarding_planos force row level security;
alter table public.onboarding_template_items force row level security;
alter table public.onboarding_templates force row level security;
alter table public.opportunities force row level security;
alter table public.ops_excecoes force row level security;
alter table public.ops_microentregas force row level security;
alter table public.ops_sla_regras force row level security;
alter table public.organization_members force row level security;
alter table public.organizations force row level security;
alter table public.owner_override_events force row level security;
alter table public.payments force row level security;
alter table public.piloto_bloqueios force row level security;
alter table public.piloto_conferencia force row level security;
alter table public.planner_catalog_feed force row level security;
alter table public.planner_tarefas force row level security;
alter table public.portal_document_requests force row level security;
alter table public.portal_ticket_messages force row level security;
alter table public.portal_tickets force row level security;
alter table public.price_catalog_rescued force row level security;
alter table public.privacy_alerts force row level security;
alter table public.product_catalog force row level security;
alter table public.profiles force row level security;
alter table public.proposal_canva_pages force row level security;
alter table public.proposals force row level security;
alter table public.quality_checklist_templates force row level security;
alter table public.quality_exports force row level security;
alter table public.quality_issues force row level security;
alter table public.report_evidence_links force row level security;
alter table public.report_microdelivery_links force row level security;
alter table public.research_action_plan_items force row level security;
alter table public.research_events force row level security;
alter table public.research_hypotheses force row level security;
alter table public.service_orders force row level security;
alter table public.sku_catalog force row level security;
alter table public.sku_price_exceptions force row level security;
alter table public.sla_regras force row level security;
alter table public.source_access_logs force row level security;
alter table public.source_evaluation_matrix force row level security;
alter table public.sources_activation_backlog force row level security;
alter table public.staff_access force row level security;
alter table public.tarefas force row level security;
alter table public.third_party_expenses force row level security;
alter table public.touchpoints force row level security;
alter table public.user_roles force row level security;
alter table public.versioned_legal_rules force row level security;
