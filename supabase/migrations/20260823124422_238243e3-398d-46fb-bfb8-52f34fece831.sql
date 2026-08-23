CREATE TABLE public.catalog_reconciliation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  proposal_id uuid NOT NULL,
  case_id uuid,
  contract_id uuid,
  service_order_id uuid,
  versao integer NOT NULL,
  motivo text,
  origem text NOT NULL DEFAULT 'reprocessamento',
  sku text,
  preco_homologado numeric,
  pode_gerar_os boolean NOT NULL DEFAULT false,
  pode_gerar_contrato boolean NOT NULL DEFAULT false,
  bloqueios jsonb NOT NULL DEFAULT '[]'::jsonb,
  divergencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  decisoes_anteriores jsonb NOT NULL DEFAULT '[]'::jsonb,
  registradas integer NOT NULL DEFAULT 0,
  resolvidas integer NOT NULL DEFAULT 0,
  executado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, versao)
);

CREATE INDEX idx_catalog_recon_runs_proposta ON public.catalog_reconciliation_runs (proposal_id, versao DESC);
CREATE INDEX idx_catalog_recon_runs_org ON public.catalog_reconciliation_runs (organization_id, created_at DESC);

GRANT SELECT, INSERT ON public.catalog_reconciliation_runs TO authenticated;
GRANT ALL ON public.catalog_reconciliation_runs TO service_role;

ALTER TABLE public.catalog_reconciliation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalog_recon_runs_select ON public.catalog_reconciliation_runs
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));

CREATE POLICY catalog_recon_runs_insert ON public.catalog_reconciliation_runs
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_catalog_recon_run_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Execuções de conciliação são registro histórico e não podem ser alteradas ou excluídas.';
END;
$$;

CREATE TRIGGER trg_catalog_recon_run_append_only
  BEFORE UPDATE OR DELETE ON public.catalog_reconciliation_runs
  FOR EACH ROW EXECUTE FUNCTION public.fn_catalog_recon_run_append_only();