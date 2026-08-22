
CREATE TABLE IF NOT EXISTS public.composition_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  template_key text NOT NULL,
  nome text NOT NULL,
  versao text NOT NULL,
  status text NOT NULL DEFAULT 'under_legal_review',
  finalidade text,
  fonte text,
  base_contratual text,
  autor text,
  criado_por uuid,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid,
  archived_reason text,
  UNIQUE (organization_id, template_key, versao)
);

GRANT SELECT, INSERT, UPDATE ON public.composition_templates TO authenticated;
GRANT ALL ON public.composition_templates TO service_role;
ALTER TABLE public.composition_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY comp_tpl_select ON public.composition_templates FOR SELECT TO authenticated
  USING (public.contract_pode_ler(organization_id));
CREATE POLICY comp_tpl_insert ON public.composition_templates FOR INSERT TO authenticated
  WITH CHECK (public.contract_pode_aprovar(organization_id));
CREATE POLICY comp_tpl_update ON public.composition_templates FOR UPDATE TO authenticated
  USING (public.contract_pode_aprovar(organization_id))
  WITH CHECK (public.contract_pode_aprovar(organization_id));

CREATE TRIGGER trg_comp_tpl_no_delete BEFORE DELETE ON public.composition_templates
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TABLE IF NOT EXISTS public.composition_template_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  template_id uuid NOT NULL REFERENCES public.composition_templates(id),
  evento text NOT NULL,
  detalhe text,
  ator uuid,
  criado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.composition_template_events TO authenticated;
GRANT ALL ON public.composition_template_events TO service_role;
ALTER TABLE public.composition_template_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY comp_tpl_ev_select ON public.composition_template_events FOR SELECT TO authenticated
  USING (public.contract_pode_ler(organization_id));
CREATE POLICY comp_tpl_ev_insert ON public.composition_template_events FOR INSERT TO authenticated
  WITH CHECK (public.contract_pode_aprovar(organization_id));

CREATE TRIGGER trg_comp_tpl_ev_no_delete BEFORE DELETE ON public.composition_template_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_comp_tpl_ev_no_update BEFORE UPDATE ON public.composition_template_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
