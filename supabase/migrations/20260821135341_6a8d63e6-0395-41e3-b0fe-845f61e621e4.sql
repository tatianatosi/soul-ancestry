ALTER TABLE public.nucleo_membros
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts(id),
  ADD COLUMN IF NOT EXISTS papel_no_caso text,
  ADD COLUMN IF NOT EXISTS representacao_necessaria boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS representacao_documentada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status_cadastral text NOT NULL DEFAULT 'pendente';

DO $$ BEGIN
  ALTER TABLE public.nucleo_membros
    ADD CONSTRAINT nucleo_membros_papel_no_caso_chk
    CHECK (papel_no_caso IS NULL OR papel_no_caso IN ('contratante','titular','dependente','representante','interlocutor_externo'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.nucleo_membros
    ADD CONSTRAINT nucleo_membros_status_cadastral_chk
    CHECK (status_cadastral IN ('pendente','em_revisao','completo','bloqueado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_nucleo_membros_contact ON public.nucleo_membros(contact_id);

ALTER TABLE public.nucleos_familiares
  ADD COLUMN IF NOT EXISTS contratante_contact_id uuid REFERENCES public.contacts(id),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ativo';

DO $$ BEGIN
  ALTER TABLE public.nucleos_familiares
    ADD CONSTRAINT nucleos_familiares_status_chk
    CHECK (status IN ('ativo','em_validacao','bloqueado','arquivado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_nucleos_contratante_contact ON public.nucleos_familiares(contratante_contact_id);

ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS estado_de_autorizacao_pesquisa text NOT NULL DEFAULT 'nao_autorizada';

DO $$ BEGIN
  ALTER TABLE public.crm_casos
    ADD CONSTRAINT crm_casos_estado_autorizacao_pesquisa_chk
    CHECK (estado_de_autorizacao_pesquisa IN ('nao_autorizada','autorizada_interna','autorizada_externa','suspensa'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.fn_conversion_event_tipo_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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

  IF NEW.event_type IN (
    'aceite_verbal_confirmado','confirmacao_formal_recebida','contrato_assinado',
    'pagamento_inicial_confirmado','onboarding_iniciado','caso_ativo'
  ) AND coalesce(btrim(NEW.evidencia_referencia), '') = '' THEN
    RAISE EXCEPTION 'EVENTO_SENSIVEL_SEM_EVIDENCIA: % exige referência interna verificável.', NEW.event_type;
  END IF;

  IF NEW.responsavel_id IS NULL AND coalesce(btrim(NEW.responsavel), '') = '' THEN
    RAISE EXCEPTION 'Evento de funil exige responsável nominal.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_interactions_no_delete ON public.crm_interactions;
CREATE TRIGGER trg_crm_interactions_no_delete
BEFORE DELETE ON public.crm_interactions
FOR EACH ROW EXECUTE FUNCTION public.fn_crm_interaction_imutavel();