CREATE TABLE public.case_source_document_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  source_document_id uuid NOT NULL REFERENCES public.case_source_documents(id),
  evidence_id uuid REFERENCES public.evidences(id),
  document_request_id uuid REFERENCES public.document_requests(id),
  research_person_id uuid REFERENCES public.research_people(id),
  case_report_id uuid REFERENCES public.case_reports(id),
  tipo_vinculo text NOT NULL,
  observacao_interna text,
  vinculado_por uuid,
  vinculado_em timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  archive_motivo text
);

CREATE INDEX idx_csdl_documento ON public.case_source_document_links(source_document_id);
CREATE INDEX idx_csdl_caso ON public.case_source_document_links(case_id);

GRANT SELECT, INSERT, UPDATE ON public.case_source_document_links TO authenticated;
GRANT ALL ON public.case_source_document_links TO service_role;

ALTER TABLE public.case_source_document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "csdl_select" ON public.case_source_document_links
  FOR SELECT TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
    AND public.pode_pesquisar_caso(case_id)
  );

CREATE POLICY "csdl_insert" ON public.case_source_document_links
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
    AND public.pode_pesquisar_caso(case_id)
    AND public.can_write(organization_id)
  );

CREATE POLICY "csdl_update" ON public.case_source_document_links
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
    AND public.pode_pesquisar_caso(case_id)
    AND public.can_write(organization_id)
  )
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
    AND public.pode_pesquisar_caso(case_id)
    AND public.can_write(organization_id)
  );

CREATE OR REPLACE FUNCTION public.fn_case_source_document_link_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alvos int;
  doc record;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_PROIBIDA';
  END IF;

  IF NEW.tipo_vinculo NOT IN ('comprova','complementa','atende_solicitacao','refere_pessoa','citado_em_relatorio') THEN
    RAISE EXCEPTION 'TIPO_VINCULO_INVALIDO';
  END IF;

  alvos := (CASE WHEN NEW.evidence_id IS NOT NULL THEN 1 ELSE 0 END)
         + (CASE WHEN NEW.document_request_id IS NOT NULL THEN 1 ELSE 0 END)
         + (CASE WHEN NEW.research_person_id IS NOT NULL THEN 1 ELSE 0 END)
         + (CASE WHEN NEW.case_report_id IS NOT NULL THEN 1 ELSE 0 END);
  IF alvos <> 1 THEN
    RAISE EXCEPTION 'ALVO_UNICO_OBRIGATORIO';
  END IF;

  SELECT organization_id, case_id INTO doc
  FROM public.case_source_documents WHERE id = NEW.source_document_id;
  IF doc IS NULL THEN
    RAISE EXCEPTION 'DOCUMENTO_NAO_ENCONTRADO';
  END IF;
  IF doc.organization_id <> NEW.organization_id OR doc.case_id <> NEW.case_id THEN
    RAISE EXCEPTION 'DOCUMENTO_DE_OUTRO_CASO';
  END IF;

  IF NEW.evidence_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.evidences e
    WHERE e.id = NEW.evidence_id AND e.case_id = NEW.case_id AND e.organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'ALVO_DE_OUTRO_CASO';
  END IF;
  IF NEW.document_request_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.document_requests d
    WHERE d.id = NEW.document_request_id AND d.case_id = NEW.case_id AND d.organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'ALVO_DE_OUTRO_CASO';
  END IF;
  IF NEW.research_person_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.research_people p
    WHERE p.id = NEW.research_person_id AND p.organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'ALVO_DE_OUTRO_CASO';
  END IF;
  IF NEW.case_report_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.case_reports r
    WHERE r.id = NEW.case_report_id AND r.case_id = NEW.case_id AND r.organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'ALVO_DE_OUTRO_CASO';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    NEW.vinculado_por := auth.uid();
    NEW.vinculado_em := now();
    NEW.created_at := now();
    NEW.archived_at := NULL;
    NEW.archive_motivo := NULL;
  ELSE
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    NEW.source_document_id := OLD.source_document_id;
    NEW.case_id := OLD.case_id;
    NEW.organization_id := OLD.organization_id;
    IF NEW.archived_at IS NOT NULL AND (NEW.archive_motivo IS NULL OR length(btrim(NEW.archive_motivo)) < 5) THEN
      RAISE EXCEPTION 'MOTIVO_DE_ARQUIVAMENTO_OBRIGATORIO';
    END IF;
  END IF;
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_csdl_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.case_source_document_links
FOR EACH ROW EXECUTE FUNCTION public.fn_case_source_document_link_guard();

CREATE OR REPLACE FUNCTION public.fn_case_source_document_link_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
  VALUES (
    NEW.organization_id,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'vinculo_fonte_criado'
         WHEN NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN 'vinculo_fonte_arquivado'
         ELSE 'vinculo_fonte_atualizado' END,
    'case_source_document_links',
    NEW.id,
    jsonb_build_object(
      'case_id', NEW.case_id,
      'source_document_id', NEW.source_document_id,
      'tipo_vinculo', NEW.tipo_vinculo,
      'alvo', CASE WHEN NEW.evidence_id IS NOT NULL THEN 'evidencia'
                   WHEN NEW.document_request_id IS NOT NULL THEN 'solicitacao'
                   WHEN NEW.research_person_id IS NOT NULL THEN 'pessoa'
                   ELSE 'relatorio' END
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_csdl_audit
AFTER INSERT OR UPDATE ON public.case_source_document_links
FOR EACH ROW EXECUTE FUNCTION public.fn_case_source_document_link_audit();