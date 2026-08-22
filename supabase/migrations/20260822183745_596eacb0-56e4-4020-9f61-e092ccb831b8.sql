ALTER TABLE public.product_catalog ADD COLUMN IF NOT EXISTS condicao_comercial_vigente text;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;
ALTER TABLE public.eventos_financeiros ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_invoices_dados_teste ON public.invoices (organization_id, dados_teste);
CREATE INDEX IF NOT EXISTS idx_payments_dados_teste ON public.payments (organization_id, dados_teste);
CREATE INDEX IF NOT EXISTS idx_eventos_financeiros_dados_teste ON public.eventos_financeiros (organization_id, dados_teste);