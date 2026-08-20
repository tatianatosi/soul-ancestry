-- ============ G-03: BIBLIOTECA DE EVIDÊNCIAS E PROJEÇÕES AUTORIZADAS ============

CREATE TABLE IF NOT EXISTS public.evidences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  research_item_id uuid,
  research_person_id uuid REFERENCES public.research_people(id),
  source_id uuid REFERENCES public.research_sources(id),
  evidence_type text NOT NULL,
  evidence_nature text NOT NULL,
  title_internal text NOT NULL,
  description_internal text,
  reference_date date,
  reference_location text,
  storage_reference_internal text,
  access_level text NOT NULL DEFAULT 'equipe_do_caso',
  workflow_status text NOT NULL DEFAULT 'recebida',
  epistemic_validation_status text NOT NULL DEFAULT 'DADO_PESQUISA_INICIAL',
  confidence_level text NOT NULL DEFAULT 'INICIAL',
  negative_search_source text,
  negative_search_date date,
  negative_search_next_action text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  legal_review_status text NOT NULL DEFAULT 'nao_solicitado',
  legal_review_notes_internal text,
  data_origin text NOT NULL DEFAULT 'real',
  archived_at timestamptz,
  archived_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidences_access_ck CHECK (access_level IN ('restrito','equipe_do_caso','cliente_autorizado')),
  CONSTRAINT evidences_workflow_ck CHECK (workflow_status IN ('recebida','registrada','em_revisao','divergente','insuficiente','requer_complemento','requer_retificacao','requer_traducao_apostila','rejeitada_inaplicavel','aprovada_para_entrega','publicada')),
  CONSTRAINT evidences_epistemic_ck CHECK (epistemic_validation_status IN ('INFORMACAO_COMPARTILHADA_FAMILIA','DADO_PESQUISA_INICIAL','EM_VALIDACAO_DOCUMENTAL','VALIDADO_POR_DOCUMENTO','PENDENTE_CONFIRMACAO','NAO_APLICAVEL')),
  CONSTRAINT evidences_confidence_ck CHECK (confidence_level IN ('INICIAL','BAIXO','MEDIO','ALTO')),
  CONSTRAINT evidences_nature_ck CHECK (evidence_nature IN ('documental_oficial','documental_nao_oficial','colaborativa_familiar','registro_interno','busca_negativa','material_de_apoio')),
  CONSTRAINT evidences_legal_ck CHECK (legal_review_status IN ('nao_solicitado','solicitado','em_analise','concluido','nao_aplicavel'))
);

GRANT SELECT, INSERT, UPDATE ON public.evidences TO authenticated;
GRANT ALL ON public.evidences TO service_role;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidences_select" ON public.evidences
  FOR SELECT TO authenticated
  USING (
    public.is_org_member(organization_id)
    AND (
      access_level <> 'restrito'
      OR public.has_org_role(organization_id, 'admin'::public.app_role)
      OR public.has_org_role(organization_id, 'pesquisador'::public.app_role)
      OR created_by = auth.uid()
      OR reviewed_by = auth.uid()
    )
  );

CREATE POLICY "evidences_insert" ON public.evidences
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));

CREATE POLICY "evidences_update" ON public.evidences
  FOR UPDATE TO authenticated USING (public.can_write(organization_id))
  WITH CHECK (public.can_write(organization_id));

CREATE INDEX IF NOT EXISTS evidences_case_idx ON public.evidences(case_id);
CREATE INDEX IF NOT EXISTS evidences_person_idx ON public.evidences(research_person_id);

-- ============ HISTÓRICO DE VALIDAÇÃO ============
CREATE TABLE IF NOT EXISTS public.evidence_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  evidence_id uuid NOT NULL REFERENCES public.evidences(id),
  estado_anterior text,
  estado_novo text NOT NULL,
  confianca_anterior text,
  confianca_nova text NOT NULL,
  justificativa text NOT NULL,
  revisado_por uuid NOT NULL,
  revisado_em timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ev_val_justificativa_ck CHECK (length(btrim(justificativa)) >= 10)
);

GRANT SELECT, INSERT ON public.evidence_validations TO authenticated;
GRANT ALL ON public.evidence_validations TO service_role;
ALTER TABLE public.evidence_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ev_val_select" ON public.evidence_validations
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "ev_val_insert" ON public.evidence_validations
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));

CREATE INDEX IF NOT EXISTS ev_val_evidence_idx ON public.evidence_validations(evidence_id);

-- ============ PROJEÇÕES AUTORIZADAS ============
CREATE TABLE IF NOT EXISTS public.app_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  source_entity_type text NOT NULL,
  source_entity_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  projection_type text NOT NULL,
  destination text NOT NULL,
  content_sanitized text NOT NULL,
  approval_status text NOT NULL DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  visibility_scope text NOT NULL DEFAULT 'titular',
  effective_from timestamptz,
  archived_at timestamptz,
  archived_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_proj_dest_ck CHECK (destination IN ('app','one_page','pdf_aprovado')),
  CONSTRAINT app_proj_status_ck CHECK (approval_status IN ('draft','in_review','approved','published','archived')),
  CONSTRAINT app_proj_scope_ck CHECK (visibility_scope IN ('titular','nucleo','equipe_interna')),
  CONSTRAINT app_proj_source_ck CHECK (source_entity_type IN ('evidence','finding','lineage','event','milestone','case'))
);

GRANT SELECT, INSERT, UPDATE ON public.app_projections TO authenticated;
GRANT ALL ON public.app_projections TO service_role;
ALTER TABLE public.app_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_proj_select" ON public.app_projections
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "app_proj_insert" ON public.app_projections
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "app_proj_update" ON public.app_projections
  FOR UPDATE TO authenticated USING (public.can_write(organization_id))
  WITH CHECK (public.can_write(organization_id));

CREATE INDEX IF NOT EXISTS app_proj_case_idx ON public.app_projections(case_id);
CREATE INDEX IF NOT EXISTS app_proj_source_idx ON public.app_projections(source_entity_type, source_entity_id);

-- ============ METADADOS E AUTORIA ============
CREATE OR REPLACE FUNCTION public.fn_g03_meta()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := coalesce(NEW.created_by, auth.uid());
  ELSE
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
  END IF;
  NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
  NEW.updated_at := now();
  IF NEW.archived_at IS NOT NULL AND coalesce(length(btrim(NEW.archived_reason)), 0) < 5 THEN
    RAISE EXCEPTION 'Arquivamento exige motivo com pelo menos 5 caracteres.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evidences_meta ON public.evidences;
CREATE TRIGGER trg_evidences_meta BEFORE INSERT OR UPDATE ON public.evidences
FOR EACH ROW EXECUTE FUNCTION public.fn_g03_meta();

DROP TRIGGER IF EXISTS trg_app_proj_meta ON public.app_projections;
CREATE TRIGGER trg_app_proj_meta BEFORE INSERT OR UPDATE ON public.app_projections
FOR EACH ROW EXECUTE FUNCTION public.fn_g03_meta();

DROP TRIGGER IF EXISTS trg_evidences_no_delete ON public.evidences;
CREATE TRIGGER trg_evidences_no_delete BEFORE DELETE ON public.evidences
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

DROP TRIGGER IF EXISTS trg_ev_val_no_delete ON public.evidence_validations;
CREATE TRIGGER trg_ev_val_no_delete BEFORE DELETE ON public.evidence_validations
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

DROP TRIGGER IF EXISTS trg_app_proj_no_delete ON public.app_projections;
CREATE TRIGGER trg_app_proj_no_delete BEFORE DELETE ON public.app_projections
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- ============ TRAVAS EPISTÊMICAS DA EVIDÊNCIA ============
CREATE OR REPLACE FUNCTION public.fn_evidence_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ordem_ant int;
  ordem_nova int;
  tem_registro boolean;
BEGIN
  -- Busca negativa é evidência válida, mas exige fonte, data e próxima ação
  IF NEW.evidence_nature = 'busca_negativa' THEN
    IF coalesce(btrim(NEW.negative_search_source), '') = ''
       OR NEW.negative_search_date IS NULL
       OR coalesce(btrim(NEW.negative_search_next_action), '') = '' THEN
      RAISE EXCEPTION 'Busca negativa exige fonte consultada, data da consulta e próxima ação possível.';
    END IF;
  END IF;

  -- Fonte colaborativa não valida sozinha vínculo, direito, cidadania ou relação
  IF NEW.evidence_nature = 'colaborativa_familiar' THEN
    IF NEW.epistemic_validation_status = 'VALIDADO_POR_DOCUMENTO' THEN
      RAISE EXCEPTION 'Fonte colaborativa não valida sozinha vínculo, direito, cidadania ou relação: exige documento.';
    END IF;
    IF NEW.confidence_level = 'ALTO' THEN
      RAISE EXCEPTION 'Fonte colaborativa não atinge confiança ALTA sem validação documental.';
    END IF;
  END IF;

  -- Validado por documento exige documento e revisão nominal
  IF NEW.epistemic_validation_status = 'VALIDADO_POR_DOCUMENTO' THEN
    IF NEW.evidence_nature NOT IN ('documental_oficial','documental_nao_oficial') THEN
      RAISE EXCEPTION 'Validação por documento exige evidência de natureza documental.';
    END IF;
    IF NEW.reviewed_by IS NULL OR NEW.reviewed_at IS NULL THEN
      RAISE EXCEPTION 'Validação por documento exige responsável pela revisão e data da revisão.';
    END IF;
  END IF;

  ordem_ant := CASE coalesce(OLD.confidence_level, 'INICIAL')
                 WHEN 'INICIAL' THEN 0 WHEN 'BAIXO' THEN 1 WHEN 'MEDIO' THEN 2 ELSE 3 END;
  ordem_nova := CASE NEW.confidence_level
                 WHEN 'INICIAL' THEN 0 WHEN 'BAIXO' THEN 1 WHEN 'MEDIO' THEN 2 ELSE 3 END;

  IF TG_OP = 'INSERT' THEN
    IF NEW.confidence_level IN ('MEDIO','ALTO') THEN
      RAISE EXCEPTION 'Evidência nasce com confiança INICIAL ou BAIXO: elevação exige revisão registrada.';
    END IF;
    RETURN NEW;
  END IF;

  IF ordem_nova > ordem_ant THEN
    -- Sem salto automático de INICIAL para ALTO
    IF ordem_ant = 0 AND ordem_nova = 3 THEN
      RAISE EXCEPTION 'Salto de confiança INICIAL para ALTO não é permitido: eleve por etapas com revisão.';
    END IF;
    IF NEW.reviewed_by IS NULL OR NEW.reviewed_at IS NULL THEN
      RAISE EXCEPTION 'Elevação de confiança exige responsável e data da revisão.';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM public.evidence_validations v
       WHERE v.evidence_id = NEW.id
         AND v.confianca_nova = NEW.confidence_level
         AND v.revisado_em >= now() - interval '10 minutes'
    ) INTO tem_registro;
    IF NOT tem_registro THEN
      RAISE EXCEPTION 'Elevação de confiança exige justificativa registrada no histórico de validação.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evidence_guard ON public.evidences;
CREATE TRIGGER trg_evidence_guard BEFORE INSERT OR UPDATE ON public.evidences
FOR EACH ROW EXECUTE FUNCTION public.fn_evidence_guard();

-- ============ TRAVAS DA PROJEÇÃO AUTORIZADA ============
CREATE OR REPLACE FUNCTION public.fn_app_projection_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  txt text := lower(coalesce(NEW.content_sanitized, ''));
  ev public.evidences%ROWTYPE;
BEGIN
  IF coalesce(btrim(NEW.content_sanitized), '') = '' THEN
    RAISE EXCEPTION 'Projeção exige conteúdo sanitizado.';
  END IF;

  IF txt ~ '(https?://|www\.|drive\.google|storage/|/storage|s3://|supabase\.co|\.pdf|\.jpg|\.png)' THEN
    RAISE EXCEPTION 'Conteúdo com URL, link ou referência de arquivo interno não pode compor projeção.';
  END IF;

  IF txt ~ '(hipótese|hipotese|risco|suspeita|transcri|nota interna|uso interno|confidencial|probabilidade|chance de êxito|chance de exito|garantid|parecer jurídico|parecer juridico)' THEN
    RAISE EXCEPTION 'Conteúdo com hipótese, risco, transcrição, nota interna ou juízo de mérito não pode compor projeção.';
  END IF;

  IF NEW.source_entity_type = 'evidence' THEN
    SELECT * INTO ev FROM public.evidences WHERE id = NEW.source_entity_id;
    IF ev.id IS NULL THEN
      RAISE EXCEPTION 'Projeção de evidência exige evidência existente.';
    END IF;
    IF ev.case_id <> NEW.case_id THEN
      RAISE EXCEPTION 'Projeção deve pertencer ao mesmo caso da evidência.';
    END IF;
    IF NEW.approval_status IN ('approved','published') THEN
      IF ev.access_level = 'restrito' THEN
        RAISE EXCEPTION 'Evidência restrita não pode ser projetada ao cliente.';
      END IF;
      IF ev.workflow_status NOT IN ('aprovada_para_entrega','publicada') THEN
        RAISE EXCEPTION 'Somente evidência aprovada para entrega pode ser projetada.';
      END IF;
    END IF;
  END IF;

  IF NEW.approval_status IN ('approved','published') THEN
    IF NEW.approved_by IS NULL OR NEW.approved_at IS NULL THEN
      RAISE EXCEPTION 'Aprovação de projeção exige aprovador e data de aprovação.';
    END IF;
  ELSE
    NEW.approved_by := NULL;
    NEW.approved_at := NULL;
  END IF;

  IF NEW.approval_status = 'published' AND NEW.effective_from IS NULL THEN
    NEW.effective_from := now();
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.approval_status = 'published' AND NEW.approval_status NOT IN ('published','archived') THEN
    RAISE EXCEPTION 'Projeção publicada só pode ser arquivada, nunca revertida silenciosamente.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_app_projection_guard ON public.app_projections;
CREATE TRIGGER trg_app_projection_guard BEFORE INSERT OR UPDATE ON public.app_projections
FOR EACH ROW EXECUTE FUNCTION public.fn_app_projection_guard();