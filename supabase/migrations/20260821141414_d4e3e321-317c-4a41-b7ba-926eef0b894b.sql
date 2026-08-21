ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS papel_registro text NOT NULL DEFAULT 'operacional',
  ADD COLUMN IF NOT EXISTS finalidade_registro text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crm_casos_papel_registro_chk'
  ) THEN
    ALTER TABLE public.crm_casos
      ADD CONSTRAINT crm_casos_papel_registro_chk
      CHECK (papel_registro IN ('operacional', 'piloto_real', 'demonstracao'));
  END IF;
END $$;

UPDATE public.crm_casos
   SET papel_registro = CASE
         WHEN demo IS TRUE OR codigo LIKE 'CA-DEMO-%' THEN 'demonstracao'
         WHEN piloto IS TRUE THEN 'piloto_real'
         ELSE 'operacional'
       END
 WHERE papel_registro = 'operacional';

CREATE OR REPLACE FUNCTION public.fn_caso_papel_registro()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.demo IS TRUE OR COALESCE(NEW.codigo, '') LIKE 'CA-DEMO-%' THEN
    NEW.papel_registro := 'demonstracao';
    NEW.demo := true;
  ELSIF NEW.piloto IS TRUE AND COALESCE(NEW.papel_registro, 'operacional') = 'operacional' THEN
    NEW.papel_registro := 'piloto_real';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_caso_papel_registro ON public.crm_casos;
CREATE TRIGGER trg_caso_papel_registro
  BEFORE INSERT OR UPDATE ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_caso_papel_registro();

CREATE UNIQUE INDEX IF NOT EXISTS nucleos_familiares_case_unico
  ON public.nucleos_familiares (case_id)
  WHERE archived_at IS NULL AND case_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.crm_casos TO authenticated;
GRANT ALL ON public.crm_casos TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.nucleos_familiares TO authenticated;
GRANT ALL ON public.nucleos_familiares TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.nucleo_membros TO authenticated;
GRANT ALL ON public.nucleo_membros TO service_role;