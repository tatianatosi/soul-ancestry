CREATE TABLE public.case_service_criterios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  case_service_id uuid REFERENCES public.case_services(id),
  entrega_codigo text NOT NULL,
  entrega_rotulo text NOT NULL,
  criterio_codigo text NOT NULL,
  criterio_descricao text NOT NULL,
  obrigatorio boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pendente_decisao_humana',
  decidido_por text,
  decidido_em timestamptz,
  observacao_interna text,
  origem_regra text NOT NULL DEFAULT 'proposta_canva_conferida',
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT case_service_criterios_status_chk CHECK (status IN ('pendente_decisao_humana','aceito','recusado','nao_aplicavel')),
  CONSTRAINT case_service_criterios_unico UNIQUE (case_id, entrega_codigo, criterio_codigo)
);

GRANT SELECT, INSERT, UPDATE ON public.case_service_criterios TO authenticated;
GRANT ALL ON public.case_service_criterios TO service_role;

ALTER TABLE public.case_service_criterios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "criterios_select" ON public.case_service_criterios
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "criterios_insert" ON public.case_service_criterios
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));

CREATE POLICY "criterios_update" ON public.case_service_criterios
  FOR UPDATE TO authenticated
  USING (public.can_write(organization_id))
  WITH CHECK (public.can_write(organization_id));

CREATE TRIGGER trg_criterios_block_delete
  BEFORE DELETE ON public.case_service_criterios
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_criterios_touch
  BEFORE UPDATE ON public.case_service_criterios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_criterios_case ON public.case_service_criterios (case_id, entrega_codigo, ordem);