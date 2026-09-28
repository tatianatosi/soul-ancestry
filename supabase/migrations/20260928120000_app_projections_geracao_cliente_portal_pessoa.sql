-- Corte 2a (28/09/2026) — nomes da família na aba Árvore do App Cliente.
-- Aditiva: nova coluna opcional e a view do portal passa a expor, ao final,
-- `pessoa_id` e `geracao_cliente`. Mesmo filtro, mesmas opções
-- (security_barrier + security_invoker) — nenhuma linha nova fica visível.

ALTER TABLE public.app_projections
  ADD COLUMN IF NOT EXISTS geracao_cliente smallint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.app_projections'::regclass AND conname = 'app_proj_geracao_cliente_ck'
  ) THEN
    ALTER TABLE public.app_projections
      ADD CONSTRAINT app_proj_geracao_cliente_ck CHECK (geracao_cliente IS NULL OR geracao_cliente BETWEEN 1 AND 5);
  END IF;
END $$;

COMMENT ON COLUMN public.app_projections.geracao_cliente IS
  'Geração da pessoa na árvore do App (1 = cliente … 5 = ancestrais), escrita pela equipe ao publicar. Só projeções do tipo arvore.';

CREATE OR REPLACE VIEW public.portal_projecoes
WITH (security_barrier = true, security_invoker = true) AS
SELECT p.id,
       p.case_id,
       p.projection_type,
       p.content_sanitized,
       p.effective_from,
       p.updated_at,
       p.pessoa_id,
       p.geracao_cliente
  FROM public.app_projections p
 WHERE p.destination = 'app'
   AND p.approval_status = 'published'
   AND p.archived_at IS NULL
   AND p.effective_from IS NOT NULL
   AND p.effective_from <= now();
