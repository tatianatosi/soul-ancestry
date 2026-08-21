CREATE OR REPLACE FUNCTION public.fn_conversion_event_tipo_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_contrato boolean;
  v_pagamento boolean;
  v_onboarding boolean;
  v_chave text;
  v_alcancados text[];
  v_requisitos text[];
  v_falta text;
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

  -- Serializa gravações concorrentes da mesma entidade: sem isso, duas transições
  -- simultâneas leem o mesmo histórico e pulam etapa obrigatória.
  v_chave := coalesce(NEW.case_id::text, NEW.lead_id::text) || ':' || NEW.organization_id::text;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_chave, 0));

  SELECT coalesce(array_agg(DISTINCT e.event_type), ARRAY[]::text[])
    INTO v_alcancados
  FROM public.conversion_events e
  WHERE e.organization_id = NEW.organization_id
    AND (
      (NEW.case_id IS NOT NULL AND e.case_id = NEW.case_id)
      OR (NEW.lead_id IS NOT NULL AND e.lead_id = NEW.lead_id)
    );

  -- Máquina de estados: cada avanço exige o estado anterior registrado.
  v_requisitos := CASE NEW.event_type
    WHEN 'lead_qualificado' THEN ARRAY['lead_criado']
    WHEN 'discovery_agendada' THEN ARRAY['lead_qualificado']
    WHEN 'discovery_realizada' THEN ARRAY['discovery_agendada']
    WHEN 'proposta_enviada' THEN ARRAY['discovery_realizada']
    WHEN 'aceite_verbal_confirmado' THEN ARRAY['proposta_enviada']
    WHEN 'confirmacao_formal_pendente' THEN ARRAY['aceite_verbal_confirmado']
    WHEN 'confirmacao_formal_recebida' THEN ARRAY['aceite_verbal_confirmado']
    WHEN 'formalizacao_em_preparacao' THEN ARRAY['confirmacao_formal_recebida']
    WHEN 'contrato_enviado' THEN ARRAY['confirmacao_formal_recebida']
    WHEN 'contrato_assinado' THEN ARRAY['contrato_enviado']
    WHEN 'pagamento_inicial_confirmado' THEN ARRAY['contrato_assinado']
    WHEN 'onboarding_iniciado' THEN ARRAY['contrato_assinado','pagamento_inicial_confirmado']
    WHEN 'caso_ativo' THEN ARRAY['onboarding_iniciado']
    ELSE ARRAY[]::text[]
  END;

  FOREACH v_falta IN ARRAY v_requisitos LOOP
    IF NOT (v_falta = ANY (v_alcancados)) THEN
      RAISE EXCEPTION 'TRANSICAO_INVALIDA: % exige o evento anterior % registrado para este lead/caso.', NEW.event_type, v_falta;
    END IF;
  END LOOP;

  v_contrato := 'contrato_assinado' = ANY (v_alcancados);
  v_pagamento := 'pagamento_inicial_confirmado' = ANY (v_alcancados);
  v_onboarding := 'onboarding_iniciado' = ANY (v_alcancados);

  IF NEW.event_type = 'onboarding_iniciado' AND NOT (v_contrato AND v_pagamento) THEN
    RAISE EXCEPTION 'ONBOARDING_BLOQUEADO: exige contrato assinado e pagamento inicial confirmado registrados.';
  END IF;

  IF NEW.event_type = 'caso_ativo' AND NOT v_onboarding THEN
    RAISE EXCEPTION 'CASO_ATIVO_BLOQUEADO: exige onboarding iniciado registrado.';
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

REVOKE EXECUTE ON FUNCTION public.fn_conversion_event_tipo_guard() FROM PUBLIC;