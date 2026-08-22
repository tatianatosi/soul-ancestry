ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS dossie_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dossie_mae_ref text,
  ADD COLUMN IF NOT EXISTS dossie_ambiente text,
  ADD COLUMN IF NOT EXISTS dossie_nivel_acesso text,
  ADD COLUMN IF NOT EXISTS dossie_responsavel text;

CREATE OR REPLACE FUNCTION public.fn_lead_dossie_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.dossie_ativo THEN
    IF coalesce(btrim(NEW.dossie_mae_ref), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ID/nome do dossiê-mãe.';
    END IF;
    IF coalesce(btrim(NEW.dossie_ambiente), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ambiente autorizado.';
    END IF;
    IF coalesce(btrim(NEW.dossie_link_interno), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige link interno autorizado.';
    END IF;
    IF coalesce(btrim(NEW.dossie_nivel_acesso), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige nível de acesso.';
    END IF;
    IF coalesce(btrim(NEW.dossie_responsavel), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige responsável nominal.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_dossie_guard ON public.leads;
CREATE TRIGGER trg_lead_dossie_guard
BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.fn_lead_dossie_guard();