ALTER TABLE public.conversion_events
  ADD COLUMN IF NOT EXISTS recorded_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS recorded_by uuid,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

ALTER TABLE public.conversion_events DISABLE TRIGGER trg_conversion_events_imutavel;
UPDATE public.conversion_events SET recorded_at = created_at, recorded_by = created_by;
ALTER TABLE public.conversion_events ENABLE TRIGGER trg_conversion_events_imutavel;

CREATE OR REPLACE FUNCTION public.fn_conversion_event_tipo_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_contrato boolean;
  v_pagamento boolean;
  v_onboarding boolean;
BEGIN
  IF NEW.event_type NOT IN (
    'lead_criado','lead_qualificado','discovery_agendada','discovery_realizada',
    'proposta_em_preparacao','proposta_enviada','aceite_verbal_confirmado',
    'confirmacao_formal_pendente','confirmacao_formal_recebida','formalizacao_em_preparacao',
    'contrato_enviado','contrato_assinado','pagamento_inicial_confirmado',
    'onboarding_iniciado','caso_ativo','perdido'
  ) THEN
    RAISE EXCEPTION 'Evento comercial não permitido: %', NEW.event_type;
  END IF;

  IF NEW.lead_id IS NULL AND NEW.case_id IS NULL THEN
    RAISE EXCEPTION 'EVENTO_SEM_VINCULO: informe lead_id ou case_id.';
  END IF;

  IF NEW.event_type IN (
    'aceite_verbal_confirmado','confirmacao_formal_recebida','contrato_assinado',
    'pagamento_inicial_confirmado','onboarding_iniciado','caso_ativo'
  ) AND coalesce(btrim(NEW.evidencia_referencia), '') = '' THEN
    RAISE EXCEPTION 'EVENTO_SENSIVEL_SEM_EVIDENCIA: % exige referência interna verificável.', NEW.event_type;
  END IF;

  IF NEW.event_type IN ('contrato_assinado','pagamento_inicial_confirmado')
     AND coalesce(btrim(NEW.origem), '') = '' THEN
    RAISE EXCEPTION 'EVENTO_SEM_ORIGEM: % exige origem/fonte verificável (assinatura ou fonte financeira).', NEW.event_type;
  END IF;

  IF NEW.event_type IN ('onboarding_iniciado','caso_ativo') THEN
    SELECT
      bool_or(e.event_type = 'contrato_assinado'),
      bool_or(e.event_type = 'pagamento_inicial_confirmado'),
      bool_or(e.event_type = 'onboarding_iniciado')
      INTO v_contrato, v_pagamento, v_onboarding
    FROM public.conversion_events e
    WHERE e.organization_id = NEW.organization_id
      AND (
        (NEW.case_id IS NOT NULL AND e.case_id = NEW.case_id)
        OR (NEW.lead_id IS NOT NULL AND e.lead_id = NEW.lead_id)
      );

    IF NEW.event_type = 'onboarding_iniciado'
       AND NOT (coalesce(v_contrato,false) AND coalesce(v_pagamento,false)) THEN
      RAISE EXCEPTION 'ONBOARDING_BLOQUEADO: exige contrato assinado e pagamento inicial confirmado registrados.';
    END IF;

    IF NEW.event_type = 'caso_ativo' AND NOT coalesce(v_onboarding,false) THEN
      RAISE EXCEPTION 'CASO_ATIVO_BLOQUEADO: exige onboarding iniciado registrado.';
    END IF;
  END IF;

  IF NEW.responsavel_id IS NULL AND coalesce(btrim(NEW.responsavel), '') = '' THEN
    RAISE EXCEPTION 'Evento de funil exige responsável nominal.';
  END IF;

  NEW.recorded_at := now();
  IF NEW.recorded_by IS NULL THEN
    NEW.recorded_by := coalesce(NEW.created_by, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;