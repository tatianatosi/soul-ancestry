ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'canva',
  ADD COLUMN IF NOT EXISTS origem_referencia text,
  ADD COLUMN IF NOT EXISTS paginas_registradas smallint[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS escopo_paginas jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS extracao_em timestamptz,
  ADD COLUMN IF NOT EXISTS extracao_por uuid;

ALTER TABLE public.proposals
  DROP CONSTRAINT IF EXISTS proposals_origem_chk,
  ADD CONSTRAINT proposals_origem_chk CHECK (origem IN ('canva','outro'));

ALTER TABLE public.proposals
  DROP CONSTRAINT IF EXISTS proposals_origem_ref_sem_url_chk,
  ADD CONSTRAINT proposals_origem_ref_sem_url_chk
    CHECK (origem_referencia IS NULL OR origem_referencia !~* '(https?://|www\.)');

CREATE OR REPLACE FUNCTION public.fn_proposta_paginas_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE p smallint;
BEGIN
  IF NEW.paginas_registradas IS NOT NULL THEN
    FOREACH p IN ARRAY NEW.paginas_registradas LOOP
      IF p < 1 OR p > 7 THEN
        RAISE EXCEPTION 'Páginas da proposta Canva devem estar entre 1 e 7 (recebido %).', p;
      END IF;
    END LOOP;
  END IF;
  IF NEW.escopo_paginas IS NOT NULL AND jsonb_typeof(NEW.escopo_paginas) <> 'object' THEN
    RAISE EXCEPTION 'Conteúdo extraído por página deve ser um objeto.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proposta_paginas_guard ON public.proposals;
CREATE TRIGGER trg_proposta_paginas_guard
  BEFORE INSERT OR UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.fn_proposta_paginas_guard();