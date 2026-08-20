
CREATE TABLE public.case_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  report_type text NOT NULL,
  report_status text NOT NULL DEFAULT 'a_preparar',
  fase_jornada text NOT NULL,
  versao integer NOT NULL DEFAULT 1,
  titulo text,
  responsavel_id uuid,
  revisor_id uuid,
  data_aprovacao date,
  data_entrega date,
  link_interno text,
  resumo_aprovado_cliente text,
  publicado_no_app boolean NOT NULL DEFAULT false,
  observacao_interna text,
  data_origin text NOT NULL DEFAULT 'registro_interno',
  archived_at timestamptz,
  archived_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT case_reports_tipo_chk CHECK (report_type IN (
    'REPORT_F1_DIAGNOSTICO','REPORT_F2_PESQUISA','REPORT_F3_PRONTIDAO_DOCUMENTAL',
    'REPORT_F4_PROTOCOLO','REPORT_F5_CONCLUSAO','REPORT_MEM_LEGADO')),
  CONSTRAINT case_reports_status_chk CHECK (report_status IN (
    'a_preparar','em_elaboracao','em_revisao','aprovado_internamente','entregue','arquivado')),
  CONSTRAINT case_reports_versao_chk CHECK (versao >= 1)
);

CREATE UNIQUE INDEX case_reports_unico_versao ON public.case_reports (case_id, report_type, versao);
CREATE INDEX case_reports_caso_idx ON public.case_reports (case_id, report_type);

GRANT SELECT, INSERT, UPDATE ON public.case_reports TO authenticated;
GRANT ALL ON public.case_reports TO service_role;

ALTER TABLE public.case_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cr_select_org" ON public.case_reports
FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));

CREATE POLICY "cr_insert_org" ON public.case_reports
FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.can_write(organization_id));

CREATE POLICY "cr_update_org" ON public.case_reports
FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.can_write(organization_id))
WITH CHECK (public.is_org_member(organization_id));

CREATE TABLE public.report_evidence_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  report_id uuid NOT NULL REFERENCES public.case_reports(id),
  evidence_id uuid NOT NULL REFERENCES public.evidences(id),
  relacao text NOT NULL,
  observacao_interna text,
  archived_at timestamptz,
  archived_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rel_relacao_chk CHECK (relacao IN ('principal','suporte','pendencia','contraponto'))
);

CREATE UNIQUE INDEX report_evidence_links_unico ON public.report_evidence_links (report_id, evidence_id);

GRANT SELECT, INSERT, UPDATE ON public.report_evidence_links TO authenticated;
GRANT ALL ON public.report_evidence_links TO service_role;

ALTER TABLE public.report_evidence_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rel_select_org" ON public.report_evidence_links
FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));

CREATE POLICY "rel_insert_org" ON public.report_evidence_links
FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.can_write(organization_id));

CREATE POLICY "rel_update_org" ON public.report_evidence_links
FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.can_write(organization_id))
WITH CHECK (public.is_org_member(organization_id));

CREATE TABLE public.report_microdelivery_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  report_id uuid NOT NULL REFERENCES public.case_reports(id),
  microentrega_id uuid NOT NULL REFERENCES public.ops_microentregas(id),
  observacao_interna text,
  archived_at timestamptz,
  archived_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX report_microdelivery_links_unico ON public.report_microdelivery_links (report_id, microentrega_id);

GRANT SELECT, INSERT, UPDATE ON public.report_microdelivery_links TO authenticated;
GRANT ALL ON public.report_microdelivery_links TO service_role;

ALTER TABLE public.report_microdelivery_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rml_select_org" ON public.report_microdelivery_links
FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));

CREATE POLICY "rml_insert_org" ON public.report_microdelivery_links
FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.can_write(organization_id));

CREATE POLICY "rml_update_org" ON public.report_microdelivery_links
FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.can_write(organization_id))
WITH CHECK (public.is_org_member(organization_id));

CREATE OR REPLACE FUNCTION public.fn_case_report_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();

  IF NEW.report_status IN ('aprovado_internamente','entregue') AND NEW.data_aprovacao IS NULL THEN
    RAISE EXCEPTION 'Data de aprovacao obrigatoria a partir de aprovado internamente';
  END IF;

  IF NEW.report_status = 'entregue' THEN
    IF NEW.data_entrega IS NULL THEN
      RAISE EXCEPTION 'Data de entrega obrigatoria quando o relatorio esta entregue';
    END IF;
    IF NEW.resumo_aprovado_cliente IS NULL OR btrim(NEW.resumo_aprovado_cliente) = '' THEN
      RAISE EXCEPTION 'Entrega exige resumo aprovado e sanitizado para o cliente';
    END IF;
  END IF;

  IF NEW.publicado_no_app THEN
    IF NEW.report_status <> 'entregue' THEN
      RAISE EXCEPTION 'Relatorio nao entregue nao pode ser publicado no App';
    END IF;
    IF NEW.resumo_aprovado_cliente IS NULL OR btrim(NEW.resumo_aprovado_cliente) = '' THEN
      RAISE EXCEPTION 'Publicacao exige projecao aprovada e sanitizada';
    END IF;
  END IF;

  IF NEW.archived_at IS NOT NULL AND (NEW.archived_reason IS NULL OR btrim(NEW.archived_reason) = '') THEN
    RAISE EXCEPTION 'Arquivamento exige motivo';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_case_report_guard
BEFORE INSERT OR UPDATE ON public.case_reports
FOR EACH ROW EXECUTE FUNCTION public.fn_case_report_guard();

CREATE OR REPLACE FUNCTION public.fn_report_link_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_org uuid;
BEGIN
  NEW.updated_at := now();
  SELECT organization_id INTO v_org FROM public.case_reports WHERE id = NEW.report_id;
  IF v_org IS NULL OR v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'Vinculo deve pertencer a mesma organizacao do relatorio';
  END IF;
  IF NEW.archived_at IS NOT NULL AND (NEW.archived_reason IS NULL OR btrim(NEW.archived_reason) = '') THEN
    RAISE EXCEPTION 'Arquivamento exige motivo';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_report_evidence_link_guard
BEFORE INSERT OR UPDATE ON public.report_evidence_links
FOR EACH ROW EXECUTE FUNCTION public.fn_report_link_guard();

CREATE TRIGGER trg_report_microdelivery_link_guard
BEFORE INSERT OR UPDATE ON public.report_microdelivery_links
FOR EACH ROW EXECUTE FUNCTION public.fn_report_link_guard();

CREATE TRIGGER trg_case_reports_block_delete
BEFORE DELETE ON public.case_reports
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_report_evidence_links_block_delete
BEFORE DELETE ON public.report_evidence_links
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_report_microdelivery_links_block_delete
BEFORE DELETE ON public.report_microdelivery_links
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
