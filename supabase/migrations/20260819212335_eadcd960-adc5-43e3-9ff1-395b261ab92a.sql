-- ============ camada de migração ============
CREATE TABLE public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  source_system text NOT NULL,
  source_file_or_endpoint text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  imported_by uuid,
  total_rows integer NOT NULL DEFAULT 0,
  created_records integer NOT NULL DEFAULT 0,
  updated_records integer NOT NULL DEFAULT 0,
  duplicated_records integer NOT NULL DEFAULT 0,
  rejected_records integer NOT NULL DEFAULT 0,
  error_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  mapping_version text NOT NULL DEFAULT 'v1',
  mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'rascunho',
  observacao text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "import_batches_select" ON public.import_batches FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "import_batches_insert" ON public.import_batches FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "import_batches_update" ON public.import_batches FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.legacy_record_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  entity_type text NOT NULL,
  canonical_record_id uuid,
  canonical_reference text,
  legacy_system text NOT NULL,
  legacy_record_id text NOT NULL,
  legacy_reference text,
  migration_batch_id uuid REFERENCES public.import_batches(id),
  imported_at timestamptz NOT NULL DEFAULT now(),
  confidence text NOT NULL DEFAULT 'media',
  deduplication_reason text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, legacy_system, legacy_record_id, entity_type)
);
GRANT SELECT, INSERT, UPDATE ON public.legacy_record_links TO authenticated;
GRANT ALL ON public.legacy_record_links TO service_role;
ALTER TABLE public.legacy_record_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legacy_links_select" ON public.legacy_record_links FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "legacy_links_insert" ON public.legacy_record_links FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "legacy_links_update" ON public.legacy_record_links FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.migration_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  migration_batch_id uuid REFERENCES public.import_batches(id),
  source_system text NOT NULL,
  source_record_id text,
  exception_type text NOT NULL,
  reason text NOT NULL,
  proposed_resolution text,
  status text NOT NULL DEFAULT 'aberta',
  assigned_to uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.migration_exceptions TO authenticated;
GRANT ALL ON public.migration_exceptions TO service_role;
ALTER TABLE public.migration_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "migration_exc_select" ON public.migration_exceptions FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "migration_exc_insert" ON public.migration_exceptions FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "migration_exc_update" ON public.migration_exceptions FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- ============ marketing e conversão ============
CREATE TABLE public.lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  codigo text NOT NULL,
  nome text NOT NULL,
  canal text,
  tipo text,
  descricao text,
  active boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, codigo)
);
GRANT SELECT, INSERT, UPDATE ON public.lead_sources TO authenticated;
GRANT ALL ON public.lead_sources TO service_role;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_sources_select" ON public.lead_sources FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "lead_sources_insert" ON public.lead_sources FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "lead_sources_update" ON public.lead_sources FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  codigo text NOT NULL,
  nome text NOT NULL,
  canal text,
  lead_source_id uuid REFERENCES public.lead_sources(id),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  inicio date,
  fim date,
  status text NOT NULL DEFAULT 'ativa',
  observacao text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, codigo)
);
GRANT SELECT, INSERT, UPDATE ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.marketing_campaigns TO service_role;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_select" ON public.marketing_campaigns FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "campaigns_insert" ON public.marketing_campaigns FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "campaigns_update" ON public.marketing_campaigns FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.marketing_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  lead_source_id uuid REFERENCES public.lead_sources(id),
  canal text,
  competencia date NOT NULL,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  moeda text NOT NULL DEFAULT 'BRL',
  origem_dado text NOT NULL DEFAULT 'registro_manual',
  referencia_interna text,
  observacao text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.marketing_investments TO authenticated;
GRANT ALL ON public.marketing_investments TO service_role;
ALTER TABLE public.marketing_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investments_select" ON public.marketing_investments FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "investments_insert" ON public.marketing_investments FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "investments_update" ON public.marketing_investments FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  event_type text NOT NULL,
  lead_id uuid,
  cliente_id uuid,
  case_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  responsavel text,
  responsavel_id uuid,
  origem text,
  canal text,
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  lead_source_id uuid REFERENCES public.lead_sources(id),
  evidencia_referencia text,
  observacao text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.conversion_events TO authenticated;
GRANT ALL ON public.conversion_events TO service_role;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_events_select" ON public.conversion_events FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "conv_events_insert" ON public.conversion_events FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_conversion_event_imutavel()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Eventos de conversão são imutáveis: registre um novo evento.';
END;
$$;
CREATE TRIGGER trg_conversion_events_imutavel
BEFORE UPDATE OR DELETE ON public.conversion_events
FOR EACH ROW EXECUTE FUNCTION public.fn_conversion_event_imutavel();

CREATE TABLE public.attribution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  lead_id uuid,
  cliente_id uuid,
  case_id uuid,
  modelo text NOT NULL DEFAULT 'primeiro_toque',
  lead_source_id uuid REFERENCES public.lead_sources(id),
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  canal text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  peso numeric(6,3) NOT NULL DEFAULT 1,
  valor_convertido numeric(14,2),
  observacao text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.attribution_records TO authenticated;
GRANT ALL ON public.attribution_records TO service_role;
ALTER TABLE public.attribution_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attribution_select" ON public.attribution_records FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "attribution_insert" ON public.attribution_records FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "attribution_update" ON public.attribution_records FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- ============ onboarding padrão reutilizável ============
CREATE TABLE public.onboarding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  codigo text NOT NULL,
  nome text NOT NULL,
  descricao text,
  versao text NOT NULL DEFAULT 'v1',
  active boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, codigo, versao)
);
GRANT SELECT, INSERT, UPDATE ON public.onboarding_templates TO authenticated;
GRANT ALL ON public.onboarding_templates TO service_role;
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onb_tpl_select" ON public.onboarding_templates FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "onb_tpl_insert" ON public.onboarding_templates FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "onb_tpl_update" ON public.onboarding_templates FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.onboarding_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  template_id uuid NOT NULL REFERENCES public.onboarding_templates(id),
  fase text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  item text NOT NULL,
  descricao text,
  obrigatorio boolean NOT NULL DEFAULT true,
  prazo_dias integer,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.onboarding_template_items TO authenticated;
GRANT ALL ON public.onboarding_template_items TO service_role;
ALTER TABLE public.onboarding_template_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onb_tpl_item_select" ON public.onboarding_template_items FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "onb_tpl_item_insert" ON public.onboarding_template_items FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "onb_tpl_item_update" ON public.onboarding_template_items FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- ============ caso: decisão humana do ID canônico ============
ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS id_canonico_decidido text,
  ADD COLUMN IF NOT EXISTS id_canonico_decidido_por text,
  ADD COLUMN IF NOT EXISTS id_canonico_decidido_em timestamptz,
  ADD COLUMN IF NOT EXISTS ids_historicos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============ triggers padrão ============
CREATE OR REPLACE FUNCTION public.fn_migracao_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['import_batches','legacy_record_links','migration_exceptions','lead_sources','marketing_campaigns','marketing_investments','attribution_records','onboarding_templates','onboarding_template_items']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_touch BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_migracao_touch()', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_no_delete BEFORE DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete()', t, t);
  END LOOP;
END $$;

CREATE INDEX idx_conv_events_org_tipo ON public.conversion_events (organization_id, event_type, occurred_at DESC);
CREATE INDEX idx_legacy_links_canonical ON public.legacy_record_links (organization_id, entity_type, canonical_record_id);
CREATE INDEX idx_mig_exc_status ON public.migration_exceptions (organization_id, status);