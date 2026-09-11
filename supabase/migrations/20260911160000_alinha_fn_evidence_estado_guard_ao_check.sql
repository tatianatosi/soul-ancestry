-- Alinha fn_evidence_estado_guard ao CHECK evidences_workflow_ck.
-- Antes: o trigger só aceitava vocabulário legado (validada_internamente,
-- aprovada_para_entrega_cliente, …) enquanto o CHECK só aceita
-- aprovada_para_entrega / publicada / requer_traducao_apostila / rejeitada_inaplicavel.
-- Interseção útil era só triagem — validação e publicação estavam impossíveis.

CREATE OR REPLACE FUNCTION public.fn_evidence_estado_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.workflow_status NOT IN (
    'recebida','registrada','em_revisao','divergente','insuficiente',
    'requer_complemento','requer_retificacao','requer_traducao_apostila',
    'rejeitada_inaplicavel','aprovada_para_entrega','publicada'
  ) THEN
    RAISE EXCEPTION 'Situação de evidência inválida: %', NEW.workflow_status;
  END IF;

  -- Aprovação para entrega nunca é conclusão jurídica.
  IF NEW.workflow_status = 'aprovada_para_entrega' THEN
    NEW.legal_review_status := coalesce(NEW.legal_review_status, 'nao_aplicavel');
  END IF;

  -- Publicação exige aprovação prévia explícita.
  IF NEW.workflow_status = 'publicada'
     AND coalesce(OLD.workflow_status,'') <> 'aprovada_para_entrega' THEN
    RAISE EXCEPTION 'Evidência só é publicada após aprovação explícita para entrega.';
  END IF;

  IF NEW.workflow_status = 'aprovada_para_entrega'
     AND NEW.reviewed_by IS NULL THEN
    RAISE EXCEPTION 'Informe o revisor responsável antes de aprovar a evidência para entrega.';
  END IF;

  RETURN NEW;
END;
$function$;
