-- Corte 3c (01/10/2026) — "União de Ramos" real, por caso, no App Cliente.
--
-- Até aqui a única união de ramos exibida na Jornada era um par de ids
-- escrito no código para o cliente de demonstração. Para qualquer caso real,
-- a equipe precisa poder ligar DUAS publicações já existentes do mesmo caso
-- (uma da linha ancestral, uma da linha do processo) e escrever a legenda que
-- o cliente lê entre elas.
--
-- `source_entity_id` já guarda a ponta da história; esta coluna aditiva guarda
-- a ponta do processo. A legenda continua em `content_sanitized` — e só ela,
-- porque é o único texto que chega ao cliente; id nunca aparece na tela.
--
-- Aditiva e opcional: nenhuma linha existente muda, nenhuma linha nova fica
-- visível. A view mantém filtro e opções (security_barrier + security_invoker).

ALTER TABLE public.app_projections
  ADD COLUMN IF NOT EXISTS vinculo_projecao_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.app_projections'::regclass AND conname = 'app_proj_vinculo_projecao_fk'
  ) THEN
    ALTER TABLE public.app_projections
      ADD CONSTRAINT app_proj_vinculo_projecao_fk
      FOREIGN KEY (vinculo_projecao_id) REFERENCES public.app_projections(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.app_projections.vinculo_projecao_id IS
  'União de Ramos: a outra publicação ligada por esta (a da linha do processo). A ponta da história fica em source_entity_id. Só projeções do tipo uniao_ramos.';

CREATE OR REPLACE VIEW public.portal_projecoes
WITH (security_barrier = true, security_invoker = true) AS
SELECT p.id,
       p.case_id,
       p.projection_type,
       p.content_sanitized,
       p.effective_from,
       p.updated_at,
       p.pessoa_id,
       p.geracao_cliente,
       p.source_entity_id,
       p.vinculo_projecao_id
  FROM public.app_projections p
 WHERE p.destination = 'app'
   AND p.approval_status = 'published'
   AND p.archived_at IS NULL
   AND p.effective_from IS NOT NULL
   AND p.effective_from <= now();
