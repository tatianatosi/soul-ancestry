ALTER TABLE public.casos
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by text,
  ADD COLUMN IF NOT EXISTS archived_reason text,
  ADD COLUMN IF NOT EXISTS origem text,
  ADD COLUMN IF NOT EXISTS redirect_case_id uuid,
  ADD COLUMN IF NOT EXISTS redirect_codigo text;

COMMENT ON COLUMN public.casos.archived_at IS 'Arquivamento lógico do registro legado de protótipo; nunca exclusão física.';
COMMENT ON COLUMN public.casos.redirect_case_id IS 'Caso canônico em crm_casos para o qual este registro legado resolve.';