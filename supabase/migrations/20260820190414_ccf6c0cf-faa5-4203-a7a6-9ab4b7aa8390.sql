CREATE OR REPLACE FUNCTION public.fn_lead_case_id_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE v_org uuid;
BEGIN
  IF NEW.case_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Lead só pode ser vinculado a um caso já aberto.';
  END IF;
  IF v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'Lead e caso precisam pertencer à mesma organização.';
  END IF;

  IF lower(coalesce(NEW.estagio, '')) <> 'ganho' THEN
    RAISE EXCEPTION 'Lead em triagem/negociação não recebe identificador de caso. Registre a abertura formal (lead ganho) antes de vincular.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_lead_case_id_guard() FROM PUBLIC, anon, authenticated;