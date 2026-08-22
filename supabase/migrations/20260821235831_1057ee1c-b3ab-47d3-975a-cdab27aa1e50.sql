CREATE OR REPLACE FUNCTION public.fn_citizenship_track_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.lifecycle_status = 'vigente' THEN
    IF coalesce(NEW.versao,'') = '' OR NEW.owner_id IS NULL
       OR coalesce(NEW.criterio_aprovacao,'') = ''
       OR coalesce(NEW.evidencia_aprovacao_referencia,'') = '' THEN
      RAISE EXCEPTION 'Trilha só fica vigente com versão, responsável, critério e evidência de aprovação registrados';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.fn_citizenship_track_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_legal_milestone_meta() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_lead_discovery_guard() FROM anon, authenticated;