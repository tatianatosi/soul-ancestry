-- A. research_cases: campos do modelo A
ALTER TABLE public.research_cases
  ADD COLUMN IF NOT EXISTS family_id uuid,
  ADD COLUMN IF NOT EXISTS citizenship_track_id uuid REFERENCES public.citizenship_tracks(id),
  ADD COLUMN IF NOT EXISTS research_type text NOT NULL DEFAULT 'genealogica',
  ADD COLUMN IF NOT EXISTS internal_hypothesis text,
  ADD COLUMN IF NOT EXISTS authorized_scope text,
  ADD COLUMN IF NOT EXISTS next_milestone text;

CREATE OR REPLACE FUNCTION public.fn_research_case_estado_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN (
    'nao_iniciada','preparacao_pendente','aguardando_autorizacao','em_andamento',
    'aguardando_cliente','aguardando_terceiro_ou_arquivo','em_revisao','pausada',
    'concluida_parcialmente','concluida','arquivada'
  ) THEN
    RAISE EXCEPTION 'Situação de pesquisa inválida: %', NEW.status;
  END IF;
  IF NEW.status = 'em_andamento'
     AND coalesce(NEW.external_research_authorization_status,'pendente') <> 'autorizada' THEN
    RAISE EXCEPTION 'Pesquisa não pode avançar sem autorização registrada.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_research_case_estado_guard ON public.research_cases;
CREATE TRIGGER trg_research_case_estado_guard
  BEFORE INSERT OR UPDATE ON public.research_cases
  FOR EACH ROW EXECUTE FUNCTION public.fn_research_case_estado_guard();

-- B. research_people
ALTER TABLE public.research_people
  ADD COLUMN IF NOT EXISTS family_member_id uuid,
  ADD COLUMN IF NOT EXISTS genealogical_person_profile_id uuid REFERENCES public.genealogical_person_profiles(id),
  ADD COLUMN IF NOT EXISTS papel_na_linhagem text,
  ADD COLUMN IF NOT EXISTS geracao text,
  ADD COLUMN IF NOT EXISTS linha_transmissao text,
  ADD COLUMN IF NOT EXISTS pais_localidade text;

-- C. research_sources
ALTER TABLE public.research_sources
  ADD COLUMN IF NOT EXISTS source_location text,
  ADD COLUMN IF NOT EXISTS consulted_at timestamptz,
  ADD COLUMN IF NOT EXISTS consulted_by uuid,
  ADD COLUMN IF NOT EXISTS result_summary_internal text;

-- D. evidences
ALTER TABLE public.evidences
  ADD COLUMN IF NOT EXISTS validation_notes_internal text;

CREATE OR REPLACE FUNCTION public.fn_evidence_estado_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.workflow_status NOT IN (
    'recebida','registrada','em_revisao','validada_internamente','divergente','insuficiente',
    'requer_complemento','requer_retificacao','requer_traducao_ou_apostila',
    'rejeitada_ou_inaplicavel','aprovada_para_entrega_cliente','publicada_ao_cliente'
  ) THEN
    RAISE EXCEPTION 'Situação de evidência inválida: %', NEW.workflow_status;
  END IF;

  -- Validação interna nunca é conclusão jurídica.
  IF NEW.workflow_status = 'validada_internamente' THEN
    NEW.legal_review_status := coalesce(NEW.legal_review_status, 'nao_aplicavel');
  END IF;

  -- Publicação ao cliente exige aprovação prévia explícita e revisor registrado.
  IF NEW.workflow_status = 'publicada_ao_cliente'
     AND coalesce(OLD.workflow_status,'') <> 'aprovada_para_entrega_cliente' THEN
    RAISE EXCEPTION 'Evidência só é publicada após aprovação explícita para entrega ao cliente.';
  END IF;

  IF NEW.workflow_status IN ('validada_internamente','aprovada_para_entrega_cliente')
     AND NEW.reviewed_by IS NULL THEN
    RAISE EXCEPTION 'Informe o revisor responsável antes de validar ou aprovar a evidência.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evidence_estado_guard ON public.evidences;
CREATE TRIGGER trg_evidence_estado_guard
  BEFORE INSERT OR UPDATE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION public.fn_evidence_estado_guard();

-- E. genealogical_findings
ALTER TABLE public.genealogical_findings
  ADD COLUMN IF NOT EXISTS confidence text NOT NULL DEFAULT 'baixa',
  ADD COLUMN IF NOT EXISTS client_projection_status text NOT NULL DEFAULT 'nao_projetado';

CREATE OR REPLACE FUNCTION public.fn_finding_projecao_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.confidence NOT IN ('baixa','media','alta') THEN
    RAISE EXCEPTION 'Nível de confiança inválido: %', NEW.confidence;
  END IF;
  IF NEW.client_projection_status NOT IN ('nao_projetado','rascunho_sanitizado','aprovado_interno','publicado_cliente') THEN
    RAISE EXCEPTION 'Situação de projeção inválida: %', NEW.client_projection_status;
  END IF;
  IF NEW.client_projection_status IN ('aprovado_interno','publicado_cliente')
     AND NEW.validation_status <> 'validado' THEN
    RAISE EXCEPTION 'Achado precisa estar validado internamente antes de qualquer projeção ao cliente.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_finding_projecao_guard ON public.genealogical_findings;
CREATE TRIGGER trg_finding_projecao_guard
  BEFORE INSERT OR UPDATE ON public.genealogical_findings
  FOR EACH ROW EXECUTE FUNCTION public.fn_finding_projecao_guard();

-- F. research_reports
ALTER TABLE public.research_reports
  ADD COLUMN IF NOT EXISTS version text NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS internal_reference text,
  ADD COLUMN IF NOT EXISTS evidence_summary_internal text,
  ADD COLUMN IF NOT EXISTS approved_summary_client text,
  ADD COLUMN IF NOT EXISTS responsible_user_id uuid,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE OR REPLACE FUNCTION public.fn_research_report_estado_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.report_type NOT IN ('F1','F2') THEN
    RAISE EXCEPTION 'Tipo de relatório inválido: %', NEW.report_type;
  END IF;
  IF NEW.status NOT IN ('rascunho_interno','em_revisao','aprovado_interno','publicado_cliente','arquivado') THEN
    RAISE EXCEPTION 'Situação de relatório inválida: %', NEW.status;
  END IF;
  IF NEW.status = 'publicado_cliente' THEN
    IF coalesce(btrim(NEW.approved_summary_client),'') = '' THEN
      RAISE EXCEPTION 'Relatório só é publicado com resumo sanitizado aprovado para o cliente.';
    END IF;
    IF NEW.approved_by IS NULL OR NEW.approved_at IS NULL THEN
      RAISE EXCEPTION 'Relatório só é publicado com aprovação interna registrada.';
    END IF;
    NEW.published_at := coalesce(NEW.published_at, now());
  ELSE
    NEW.published_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_research_report_estado_guard ON public.research_reports;
CREATE TRIGGER trg_research_report_estado_guard
  BEFORE INSERT OR UPDATE ON public.research_reports
  FOR EACH ROW EXECUTE FUNCTION public.fn_research_report_estado_guard();

-- Exclusão física bloqueada nos registros críticos da cadeia
CREATE OR REPLACE FUNCTION public.fn_pesquisa_sem_exclusao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Exclusão física proibida. Utilize arquivamento lógico com motivo.';
END;
$$;

DROP TRIGGER IF EXISTS trg_no_delete_research_cases ON public.research_cases;
CREATE TRIGGER trg_no_delete_research_cases BEFORE DELETE ON public.research_cases
  FOR EACH ROW EXECUTE FUNCTION public.fn_pesquisa_sem_exclusao();
DROP TRIGGER IF EXISTS trg_no_delete_research_people ON public.research_people;
CREATE TRIGGER trg_no_delete_research_people BEFORE DELETE ON public.research_people
  FOR EACH ROW EXECUTE FUNCTION public.fn_pesquisa_sem_exclusao();
DROP TRIGGER IF EXISTS trg_no_delete_research_sources ON public.research_sources;
CREATE TRIGGER trg_no_delete_research_sources BEFORE DELETE ON public.research_sources
  FOR EACH ROW EXECUTE FUNCTION public.fn_pesquisa_sem_exclusao();
DROP TRIGGER IF EXISTS trg_no_delete_evidences ON public.evidences;
CREATE TRIGGER trg_no_delete_evidences BEFORE DELETE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION public.fn_pesquisa_sem_exclusao();
DROP TRIGGER IF EXISTS trg_no_delete_findings ON public.genealogical_findings;
CREATE TRIGGER trg_no_delete_findings BEFORE DELETE ON public.genealogical_findings
  FOR EACH ROW EXECUTE FUNCTION public.fn_pesquisa_sem_exclusao();
DROP TRIGGER IF EXISTS trg_no_delete_research_reports ON public.research_reports;
CREATE TRIGGER trg_no_delete_research_reports BEFORE DELETE ON public.research_reports
  FOR EACH ROW EXECUTE FUNCTION public.fn_pesquisa_sem_exclusao();