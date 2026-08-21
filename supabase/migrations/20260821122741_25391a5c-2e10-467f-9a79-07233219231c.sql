-- A. contacts
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  nome text NOT NULL,
  email text,
  telefone text,
  origem text NOT NULL DEFAULT 'nao_informada',
  origem_detalhe text,
  responsavel_user_id uuid,
  status text NOT NULL DEFAULT 'novo',
  observacao_interna text,
  data_origin text NOT NULL DEFAULT 'registro_interno',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);
GRANT SELECT, INSERT, UPDATE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_sel ON public.contacts FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY contacts_ins ON public.contacts FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY contacts_upd ON public.contacts FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- B. opportunities
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
  case_id uuid REFERENCES public.crm_casos(id) ON DELETE RESTRICT,
  lead_id uuid REFERENCES public.leads(id) ON DELETE RESTRICT,
  objetivo_declarado text NOT NULL,
  pais_linha_prioritaria text,
  citizenship_track_id uuid REFERENCES public.citizenship_tracks(id) ON DELETE RESTRICT,
  via_preliminar text,
  etapa_comercial text NOT NULL DEFAULT 'contato_inicial',
  responsavel_user_id uuid,
  responsavel_nome text,
  proxima_acao text,
  prazo_proxima_acao date,
  resumo_interno text,
  bloqueio_interno text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT opportunities_etapa_chk CHECK (etapa_comercial IN (
    'contato_inicial','qualificacao','discovery_agendada','discovery_realizada',
    'proposta_em_preparacao','proposta_enviada','aceite_verbal','confirmacao_formal_pendente',
    'confirmacao_formal_recebida','formalizacao_em_preparacao','caso_ativo','perdido','arquivada'
  ))
);
GRANT SELECT, INSERT, UPDATE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY opportunities_sel ON public.opportunities FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY opportunities_ins ON public.opportunities FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY opportunities_upd ON public.opportunities FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- C. crm_interactions (aditivo)
ALTER TABLE public.crm_interactions
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS origem_referencia_interna text,
  ADD COLUMN IF NOT EXISTS consentimento_gravacao boolean;

-- D. discovery_assessments
CREATE TABLE public.discovery_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  interaction_id uuid REFERENCES public.crm_interactions(id) ON DELETE RESTRICT,
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE RESTRICT,
  objetivo_principal text NOT NULL,
  estrutura_familiar text,
  ascendente_ou_geracao_informada text,
  linha_transmissao text,
  estado_documental_inicial text,
  complexidade_percebida text,
  pais_linha_prioritaria text,
  via_preliminar text,
  sinal_aderencia_preliminar text,
  confianca_triagem text,
  riscos_internos text,
  notas_internas text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);
GRANT SELECT, INSERT, UPDATE ON public.discovery_assessments TO authenticated;
GRANT ALL ON public.discovery_assessments TO service_role;
ALTER TABLE public.discovery_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY discovery_sel ON public.discovery_assessments FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY discovery_ins ON public.discovery_assessments FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY discovery_upd ON public.discovery_assessments FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- E. conversion_events (aditivo)
ALTER TABLE public.conversion_events
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE RESTRICT;

-- Eventos permitidos
CREATE OR REPLACE FUNCTION public.fn_conversion_event_tipo_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.event_type NOT IN (
    'lead_criado','lead_qualificado','discovery_agendada','discovery_realizada',
    'proposta_em_preparacao','proposta_enviada','aceite_verbal_confirmado',
    'confirmacao_formal_pendente','confirmacao_formal_recebida','formalizacao_em_preparacao',
    'contrato_enviado','contrato_assinado','pagamento_inicial_confirmado',
    'onboarding_iniciado','caso_ativo','perdido'
  ) THEN
    RAISE EXCEPTION 'Evento comercial não permitido: %', NEW.event_type;
  END IF;
  IF NEW.event_type = 'confirmacao_formal_recebida'
     AND coalesce(btrim(NEW.evidencia_referencia), '') = '' THEN
    RAISE EXCEPTION 'Confirmação formal exige referência interna verificável.';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_conversion_event_tipo_guard() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_conversion_event_tipo ON public.conversion_events;
CREATE TRIGGER trg_conversion_event_tipo BEFORE INSERT ON public.conversion_events
FOR EACH ROW EXECUTE FUNCTION public.fn_conversion_event_tipo_guard();

-- Oportunidade ativa exige responsável, próxima ação e prazo
CREATE OR REPLACE FUNCTION public.fn_opportunity_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.archived_at IS NOT NULL AND coalesce(btrim(NEW.archive_motivo), '') = '' THEN
    RAISE EXCEPTION 'Arquivamento exige motivo.';
  END IF;
  IF NEW.archived_at IS NULL AND NEW.etapa_comercial NOT IN ('perdido','arquivada') THEN
    IF NEW.responsavel_user_id IS NULL AND coalesce(btrim(NEW.responsavel_nome), '') = '' THEN
      RAISE EXCEPTION 'Oportunidade ativa exige responsável nominal.';
    END IF;
    IF coalesce(btrim(NEW.proxima_acao), '') = '' OR NEW.prazo_proxima_acao IS NULL THEN
      RAISE EXCEPTION 'Oportunidade ativa exige próxima ação e prazo.';
    END IF;
  END IF;
  IF NEW.etapa_comercial = 'aceite_verbal'
     AND coalesce(btrim(NEW.proxima_acao), '') = '' THEN
    NEW.proxima_acao := 'Solicitar confirmação formal por escrito';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_opportunity_guard() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_opportunity_guard ON public.opportunities;
CREATE TRIGGER trg_opportunity_guard BEFORE INSERT OR UPDATE ON public.opportunities
FOR EACH ROW EXECUTE FUNCTION public.fn_opportunity_guard();

CREATE OR REPLACE FUNCTION public.fn_contact_meta()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.archived_at IS NOT NULL AND coalesce(btrim(NEW.archive_motivo), '') = '' THEN
    RAISE EXCEPTION 'Arquivamento exige motivo.';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_contact_meta() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_contact_meta ON public.contacts;
CREATE TRIGGER trg_contact_meta BEFORE INSERT OR UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION public.fn_contact_meta();

-- Sem exclusão física
CREATE OR REPLACE FUNCTION public.fn_crm_no_delete()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Exclusão física proibida. Use arquivamento lógico com motivo.';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.fn_crm_no_delete() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_no_delete_contacts ON public.contacts;
CREATE TRIGGER trg_no_delete_contacts BEFORE DELETE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.fn_crm_no_delete();
DROP TRIGGER IF EXISTS trg_no_delete_opportunities ON public.opportunities;
CREATE TRIGGER trg_no_delete_opportunities BEFORE DELETE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.fn_crm_no_delete();
DROP TRIGGER IF EXISTS trg_no_delete_discovery ON public.discovery_assessments;
CREATE TRIGGER trg_no_delete_discovery BEFORE DELETE ON public.discovery_assessments FOR EACH ROW EXECUTE FUNCTION public.fn_crm_no_delete();

CREATE INDEX IF NOT EXISTS idx_opportunities_org ON public.opportunities(organization_id, etapa_comercial);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON public.contacts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_discovery_opp ON public.discovery_assessments(opportunity_id);