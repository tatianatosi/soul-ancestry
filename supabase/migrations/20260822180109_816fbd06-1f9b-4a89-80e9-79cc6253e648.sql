CREATE OR REPLACE FUNCTION public.fn_research_case_estado_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN (
    'not_started','preparation','internal_research','awaiting_documents',
    'awaiting_review','paused','completed','archived'
  ) THEN
    RAISE EXCEPTION 'Situação de pesquisa inválida: %', NEW.status;
  END IF;

  IF coalesce(NEW.external_research_gate_status,'blocked_by_contract') = 'released_by_authorized_user'
     AND coalesce(NEW.external_research_authorization_status,'not_requested')
         NOT IN ('authorized','autorizada') THEN
    RAISE EXCEPTION 'Pesquisa externa não pode ser liberada sem autorização registrada.';
  END IF;

  RETURN NEW;
END;
$function$;