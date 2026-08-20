
CREATE TABLE public.document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  family_id uuid,
  research_person_id uuid,
  source_id uuid,
  evidence_id uuid REFERENCES public.evidences(id),
  generation integer,
  full_name_text text,
  document_type text NOT NULL,
  institution_or_archive text,
  requested_at date,
  status text NOT NULL DEFAULT 'nao_solicitado',
  received_at date,
  observation_internal text,
  request_type text NOT NULL DEFAULT 'certidao',
  responsible_user_id uuid,
  next_action text,
  next_action_due date,
  priority text NOT NULL DEFAULT 'media',
  estimated_external_cost numeric(12,2),
  client_approval_status text NOT NULL DEFAULT 'nao_aplicavel',
  internal_link text,
  access_level text NOT NULL DEFAULT 'equipe_do_caso',
  data_origin text NOT NULL DEFAULT 'registro_interno',
  archived_at timestamptz,
  archived_reason text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.document_requests TO authenticated;
GRANT ALL ON public.document_requests TO service_role;

ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dr_select_org" ON public.document_requests
FOR SELECT TO authenticated
USING (
  public.is_org_member(organization_id)
  AND (
    access_level <> 'restrito'
    OR public.has_org_role(organization_id, 'admin'::public.app_role)
    OR public.has_org_role(organization_id, 'pesquisador'::public.app_role)
  )
);

CREATE POLICY "dr_insert_org" ON public.document_requests
FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.can_write(organization_id));

CREATE POLICY "dr_update_org" ON public.document_requests
FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.can_write(organization_id))
WITH CHECK (public.is_org_member(organization_id));

CREATE INDEX idx_document_requests_caso ON public.document_requests(case_id, status);

CREATE TRIGGER trg_document_requests_no_delete
BEFORE DELETE ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE OR REPLACE FUNCTION public.fn_document_request_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status_ok text[] := ARRAY['nao_solicitado','a_preparar','solicitado','aguardando_pagamento_cliente','aguardando_cliente','aguardando_instituicao','recebido','em_revisao','validado_internamente','divergente','insuficiente','requer_complemento','requer_retificacao','requer_traducao_apostila','nao_localizado','cancelado','nao_aplicavel'];
  v_pos_pedido text[] := ARRAY['solicitado','aguardando_cliente','aguardando_instituicao','recebido','em_revisao','validado_internamente','divergente','insuficiente','requer_complemento','requer_retificacao','requer_traducao_apostila','nao_localizado'];
  v_exige_acao text[] := ARRAY['aguardando_cliente','aguardando_instituicao','divergente','nao_localizado','requer_retificacao'];
  v_evid uuid;
BEGIN
  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'ORGANIZACAO_OBRIGATORIA';
  END IF;

  IF NOT (NEW.status = ANY(v_status_ok)) THEN
    RAISE EXCEPTION 'STATUS_FORA_DO_DICIONARIO: %', NEW.status;
  END IF;
  IF NOT (NEW.priority = ANY(ARRAY['baixa','media','alta','critica'])) THEN
    RAISE EXCEPTION 'PRIORIDADE_FORA_DO_DICIONARIO: %', NEW.priority;
  END IF;
  IF NOT (NEW.access_level = ANY(ARRAY['restrito','equipe_do_caso','cliente_autorizado'])) THEN
    RAISE EXCEPTION 'NIVEL_ACESSO_FORA_DO_DICIONARIO: %', NEW.access_level;
  END IF;
  IF NOT (NEW.client_approval_status = ANY(ARRAY['nao_aplicavel','aguardando_aprovacao','aprovado','recusado'])) THEN
    RAISE EXCEPTION 'APROVACAO_CLIENTE_FORA_DO_DICIONARIO: %', NEW.client_approval_status;
  END IF;
  IF NOT (NEW.request_type = ANY(ARRAY['certidao','busca_arquivo','copia_processo','traducao','apostilamento','retificacao','documento_familia','outro'])) THEN
    RAISE EXCEPTION 'TIPO_SOLICITACAO_FORA_DO_DICIONARIO: %', NEW.request_type;
  END IF;

  IF NEW.research_person_id IS NULL AND coalesce(btrim(NEW.full_name_text),'') = '' THEN
    RAISE EXCEPTION 'NOME_COMPLETO_OBRIGATORIO: vincule uma pessoa cadastrada ou informe o nome completo.';
  END IF;
  IF NEW.research_person_id IS NOT NULL THEN
    NEW.full_name_text := NULL;
  END IF;

  IF NEW.status = ANY(v_pos_pedido) AND NEW.requested_at IS NULL THEN
    RAISE EXCEPTION 'DATA_PEDIDO_OBRIGATORIA a partir de Solicitado.';
  END IF;
  IF NEW.status = 'recebido' AND NEW.received_at IS NULL THEN
    RAISE EXCEPTION 'DATA_RECEBIMENTO_OBRIGATORIA para Recebido.';
  END IF;

  IF NEW.status = ANY(v_exige_acao) THEN
    IF coalesce(btrim(NEW.next_action),'') = '' OR NEW.next_action_due IS NULL OR NEW.responsible_user_id IS NULL THEN
      RAISE EXCEPTION 'PROXIMA_ACAO_OBRIGATORIA: informe próxima ação, prazo e responsável para a situação %.', NEW.status;
    END IF;
  END IF;

  IF NEW.estimated_external_cost IS NOT NULL AND NEW.estimated_external_cost < 0 THEN
    RAISE EXCEPTION 'CUSTO_EXTERNO_INVALIDO: previsão não pode ser negativa.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    NEW.organization_id := OLD.organization_id;
  ELSE
    NEW.created_by := coalesce(NEW.created_by, auth.uid());
  END IF;
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();

  IF NEW.archived_at IS NOT NULL AND coalesce(btrim(NEW.archived_reason),'') = '' THEN
    RAISE EXCEPTION 'ARQUIVAMENTO_EXIGE_MOTIVO';
  END IF;

  -- Recebido cria ou vincula evidência com fluxo "recebida"
  IF NEW.status = 'recebido' AND NEW.evidence_id IS NULL THEN
    INSERT INTO public.evidences (
      organization_id, case_id, research_person_id, source_id,
      evidence_type, evidence_nature, title_internal, description_internal,
      reference_date, access_level, workflow_status, data_origin, created_by, updated_by
    ) VALUES (
      NEW.organization_id, NEW.case_id, NEW.research_person_id, NEW.source_id,
      NEW.document_type, 'documental_oficial',
      'Documento recebido: ' || NEW.document_type,
      'Criada automaticamente pelo recebimento da solicitação documental.',
      NEW.received_at, NEW.access_level, 'recebida', NEW.data_origin, auth.uid(), auth.uid()
    ) RETURNING id INTO v_evid;
    NEW.evidence_id := v_evid;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_document_request_guard
BEFORE INSERT OR UPDATE ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.fn_document_request_guard();

CREATE OR REPLACE FUNCTION public.fn_document_request_pos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exige_acao text[] := ARRAY['aguardando_cliente','aguardando_instituicao','divergente','nao_localizado','requer_retificacao'];
BEGIN
  IF NEW.status = ANY(v_exige_acao)
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN

    INSERT INTO public.case_alerts (
      organization_id, case_id, tipo, titulo, detalhe, criticidade, status, due_at, data_origin, created_by, updated_by
    ) VALUES (
      NEW.organization_id, NEW.case_id, 'documento_solicitacao',
      'Solicitação documental exige ação: ' || NEW.document_type,
      NEW.next_action, 'alta', 'aberto', NEW.next_action_due::timestamptz,
      NEW.data_origin, auth.uid(), auth.uid()
    );

    IF NEW.status = 'aguardando_cliente' THEN
      INSERT INTO public.communication_queue (
        organization_id, case_id, acao_codigo, assunto, corpo_rascunho,
        target_audience, suggested_channel, visibility, requires_human_approval, status,
        observacao_interna, data_origin, created_by, updated_by
      ) VALUES (
        NEW.organization_id, NEW.case_id, 'documento_aguardando_cliente',
        'Pendência de documento',
        'Rascunho interno: precisamos do documento ' || NEW.document_type || '. Próxima ação combinada: ' || coalesce(NEW.next_action,'') || '.',
        'cliente', 'whatsapp', 'interno', true, 'rascunho',
        'Gerado pela solicitação documental. Nenhum envio automático.',
        NEW.data_origin, auth.uid(), auth.uid()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_document_request_pos
AFTER INSERT OR UPDATE ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.fn_document_request_pos();
