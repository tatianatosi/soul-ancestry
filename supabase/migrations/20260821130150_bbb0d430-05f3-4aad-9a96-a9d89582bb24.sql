ALTER TABLE public.nucleos_familiares
  ADD COLUMN IF NOT EXISTS link_interno text,
  ADD COLUMN IF NOT EXISTS responsavel_nome text,
  ADD COLUMN IF NOT EXISTS dossie_status text NOT NULL DEFAULT 'nao_iniciado';

ALTER TABLE public.nucleos_familiares
  DROP CONSTRAINT IF EXISTS nucleos_familiares_dossie_status_chk;
ALTER TABLE public.nucleos_familiares
  ADD CONSTRAINT nucleos_familiares_dossie_status_chk
  CHECK (dossie_status IN ('nao_iniciado','em_preparacao','ativo','arquivado'));

CREATE OR REPLACE FUNCTION public.fn_nucleo_dossie_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.dossie_status = 'ativo' THEN
    IF coalesce(btrim(NEW.dossie_mae), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ID/nome do dossiê-mãe.';
    END IF;
    IF coalesce(btrim(NEW.ambiente), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ambiente autorizado.';
    END IF;
    IF coalesce(btrim(NEW.link_interno), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige link interno do dossiê.';
    END IF;
    IF coalesce(btrim(NEW.nivel_acesso), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige nível de acesso.';
    END IF;
    IF coalesce(btrim(NEW.responsavel_nome), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige responsável nominal.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nucleo_dossie_guard ON public.nucleos_familiares;
CREATE TRIGGER trg_nucleo_dossie_guard
BEFORE INSERT OR UPDATE ON public.nucleos_familiares
FOR EACH ROW EXECUTE FUNCTION public.fn_nucleo_dossie_guard();