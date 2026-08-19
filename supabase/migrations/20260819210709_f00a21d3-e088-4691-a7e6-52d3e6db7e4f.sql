ALTER TABLE public.product_catalog
  ADD COLUMN IF NOT EXISTS parcelas_padrao integer,
  ADD COLUMN IF NOT EXISTS vigencia_inicio date,
  ADD COLUMN IF NOT EXISTS vigencia_fim date,
  ADD COLUMN IF NOT EXISTS homologado_por uuid,
  ADD COLUMN IF NOT EXISTS homologado_em timestamptz,
  ADD COLUMN IF NOT EXISTS origem_legada_referencia text,
  ADD COLUMN IF NOT EXISTS auditoria_origem jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.product_catalog.preco_historico_legado IS 'Planilha Mestre = legado de migração/reconciliação; não é fonte operacional viva.';
COMMENT ON COLUMN public.product_catalog.preco_comercial_vigente IS 'Fonte canônica de preço comercial vigente (Desk Intelligence).';