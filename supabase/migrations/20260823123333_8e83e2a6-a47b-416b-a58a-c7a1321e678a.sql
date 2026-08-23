ALTER TABLE public.catalog_source_divergences
  ADD COLUMN IF NOT EXISTS severidade text NOT NULL DEFAULT 'atencao',
  ADD COLUMN IF NOT EXISTS case_id uuid,
  ADD COLUMN IF NOT EXISTS contract_id uuid,
  ADD COLUMN IF NOT EXISTS service_order_id uuid,
  ADD COLUMN IF NOT EXISTS observacao_resolucao text,
  ADD COLUMN IF NOT EXISTS resolucao_registrada_em timestamptz,
  ADD COLUMN IF NOT EXISTS resolucao_registrada_por uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'catalog_source_divergences_severidade_check'
  ) THEN
    ALTER TABLE public.catalog_source_divergences
      ADD CONSTRAINT catalog_source_divergences_severidade_check
      CHECK (severidade IN ('atencao','bloqueio'));
  END IF;
END $$;

UPDATE public.catalog_source_divergences
   SET severidade = 'bloqueio'
 WHERE detalhe LIKE '[BLOQUEANTE]%' AND severidade <> 'bloqueio';

CREATE INDEX IF NOT EXISTS idx_csd_org_sev ON public.catalog_source_divergences (organization_id, severidade, resolvido);
CREATE INDEX IF NOT EXISTS idx_csd_sku ON public.catalog_source_divergences (organization_id, sku);