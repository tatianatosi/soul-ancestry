-- ============ 1. DOCUMENTOS: origem cliente, entrega e vínculo de solicitação ============
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'interno',
  ADD COLUMN IF NOT EXISTS entrega_cliente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS solicitacao_id uuid,
  ADD COLUMN IF NOT EXISTS revisado_em timestamptz,
  ADD COLUMN IF NOT EXISTS revisado_por uuid,
  ADD COLUMN IF NOT EXISTS revisao_motivo text;

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_origem_chk;
ALTER TABLE public.documents ADD CONSTRAINT documents_origem_chk CHECK (origem IN ('interno','cliente'));

-- ============ 2. SOLICITAÇÕES DE DOCUMENTO AO CLIENTE ============
CREATE TABLE IF NOT EXISTS public.portal_document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  client_id uuid REFERENCES public.clientes(id),
  titulo text NOT NULL,
  descricao text,
  obrigatorio boolean NOT NULL DEFAULT true,
  prazo date,
  status text NOT NULL DEFAULT 'aguardando',
  document_id uuid REFERENCES public.documents(id),
  motivo_recusa text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT portal_document_requests_status_chk
    CHECK (status IN ('aguardando','recebido','em_revisao','aceito','recusado','cancelado'))
);

GRANT SELECT, INSERT, UPDATE ON public.portal_document_requests TO authenticated;
GRANT ALL ON public.portal_document_requests TO service_role;
ALTER TABLE public.portal_document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY pdr_sel ON public.portal_document_requests FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY pdr_ins ON public.portal_document_requests FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY pdr_upd ON public.portal_document_requests FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));
-- portal: leitura apenas das próprias solicitações, em casos autorizados
CREATE POLICY pdr_sel_portal ON public.portal_document_requests FOR SELECT TO authenticated
  USING (
    organization_id = public.portal_minha_org()
    AND public.portal_caso_permitido(case_id)
    AND (client_id IS NULL OR client_id = public.portal_meu_cliente())
    AND archived_at IS NULL
  );

-- ============ 3. TICKETS DO PORTAL ============
CREATE TABLE IF NOT EXISTS public.portal_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  client_id uuid REFERENCES public.clientes(id),
  assunto text NOT NULL,
  categoria text NOT NULL DEFAULT 'duvida',
  status text NOT NULL DEFAULT 'aberto',
  origem text NOT NULL DEFAULT 'cliente',
  aberto_por uuid,
  responsavel_id uuid,
  ultima_mensagem_em timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT portal_tickets_status_chk CHECK (status IN ('aberto','em_analise','respondido','resolvido','fechado')),
  CONSTRAINT portal_tickets_categoria_chk CHECK (categoria IN ('duvida','documento','prazo','financeiro','outro')),
  CONSTRAINT portal_tickets_origem_chk CHECK (origem IN ('cliente','equipe'))
);

CREATE TABLE IF NOT EXISTS public.portal_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  ticket_id uuid NOT NULL REFERENCES public.portal_tickets(id),
  autor_tipo text NOT NULL,
  autor_user_id uuid,
  corpo text NOT NULL,
  visivel_cliente boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT portal_ticket_messages_autor_chk CHECK (autor_tipo IN ('cliente','equipe'))
);

GRANT SELECT, INSERT, UPDATE ON public.portal_tickets TO authenticated;
GRANT ALL ON public.portal_tickets TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.portal_ticket_messages TO authenticated;
GRANT ALL ON public.portal_ticket_messages TO service_role;
ALTER TABLE public.portal_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY pt_sel ON public.portal_tickets FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY pt_ins ON public.portal_tickets FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY pt_upd ON public.portal_tickets FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE POLICY pt_sel_portal ON public.portal_tickets FOR SELECT TO authenticated
  USING (
    organization_id = public.portal_minha_org()
    AND public.portal_caso_permitido(case_id)
    AND client_id = public.portal_meu_cliente()
    AND archived_at IS NULL
  );
-- o cliente pode abrir ticket, mas nunca alterar status (sem policy de UPDATE)
CREATE POLICY pt_ins_portal ON public.portal_tickets FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.portal_minha_org()
    AND public.portal_caso_permitido(case_id)
    AND client_id = public.portal_meu_cliente()
    AND origem = 'cliente'
    AND status = 'aberto'
  );

CREATE POLICY ptm_sel ON public.portal_ticket_messages FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY ptm_ins ON public.portal_ticket_messages FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY ptm_upd ON public.portal_ticket_messages FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE POLICY ptm_sel_portal ON public.portal_ticket_messages FOR SELECT TO authenticated
  USING (
    organization_id = public.portal_minha_org()
    AND visivel_cliente = true
    AND archived_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.portal_tickets t
      WHERE t.id = ticket_id
        AND t.client_id = public.portal_meu_cliente()
        AND public.portal_caso_permitido(t.case_id)
    )
  );
CREATE POLICY ptm_ins_portal ON public.portal_ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.portal_minha_org()
    AND autor_tipo = 'cliente'
    AND visivel_cliente = true
    AND EXISTS (
      SELECT 1 FROM public.portal_tickets t
      WHERE t.id = ticket_id
        AND t.client_id = public.portal_meu_cliente()
        AND public.portal_caso_permitido(t.case_id)
        AND t.status <> 'fechado'
    )
  );

-- ============ 4. FATURAS LIBERADAS AO CLIENTE ============
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS liberada_cliente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS liberada_em timestamptz,
  ADD COLUMN IF NOT EXISTS liberada_por uuid;

CREATE POLICY invoices_sel_portal ON public.invoices FOR SELECT TO authenticated
  USING (
    organization_id = public.portal_minha_org()
    AND liberada_cliente = true
    AND archived_at IS NULL
    AND case_id IS NOT NULL
    AND public.portal_caso_permitido(case_id)
    AND (client_id IS NULL OR client_id = public.portal_meu_cliente())
  );

-- ============ 5. DOCUMENTOS: leitura e envio pelo portal ============
CREATE POLICY documents_sel_portal ON public.documents FOR SELECT TO authenticated
  USING (
    organization_id = public.portal_minha_org()
    AND archived_at IS NULL
    AND case_id IS NOT NULL
    AND public.portal_caso_permitido(case_id)
    AND client_id = public.portal_meu_cliente()
    AND (liberado_cliente = true OR origem = 'cliente')
  );
CREATE POLICY documents_ins_portal ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.portal_minha_org()
    AND case_id IS NOT NULL
    AND public.portal_caso_permitido(case_id)
    AND client_id = public.portal_meu_cliente()
    AND origem = 'cliente'
  );

-- ============ 6. TRAVAS ============
-- 6.1 guard de documentos: aceita envio do cliente, sempre pendente de revisão
CREATE OR REPLACE FUNCTION public.fn_documents_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cliente uuid;
  v_portal boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Envio de documentos exige usuário autenticado.';
  END IF;

  v_portal := (NEW.origem = 'cliente')
              AND NEW.case_id IS NOT NULL
              AND public.portal_caso_permitido(NEW.case_id)
              AND NEW.client_id IS NOT DISTINCT FROM public.portal_meu_cliente();

  IF NOT v_portal AND NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'Documento fora da sua organização.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.carregado_por := COALESCE(NEW.carregado_por, auth.uid());
    NEW.carregado_em := COALESCE(NEW.carregado_em, now());
    IF NEW.case_id IS NOT NULL THEN
      SELECT cliente_id INTO v_cliente FROM public.crm_casos WHERE id = NEW.case_id;
      NEW.client_id := COALESCE(NEW.client_id, v_cliente);
    END IF;

    IF v_portal THEN
      -- Envio do cliente: sempre pendente de revisão, nunca visível como entrega.
      NEW.status := 'pendente_de_revisao';
      NEW.visibilidade := 'interno';
      NEW.entrega_cliente := false;
      NEW.liberado_em := NULL;
      NEW.liberado_por := NULL;
      NEW.revisado_em := NULL;
      NEW.revisado_por := NULL;
    ELSE
      IF NEW.categoria IN ('identificacao','certidao','documento_civil','documento_financeiro')
         AND NOT public.consentimento_ativo(NEW.case_id, NEW.client_id)
         AND NOT public.consentimento_dispensado(NEW.case_id, NEW.client_id) THEN
        RAISE EXCEPTION 'Categoria sensível bloqueada: registre consentimento de tratamento de dados ou uma exceção formal aprovada.';
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NOT public.is_org_member(NEW.organization_id) THEN
      RAISE EXCEPTION 'Apenas a equipe interna pode alterar documentos.';
    END IF;
    IF NEW.storage_path IS DISTINCT FROM OLD.storage_path AND NEW.storage_path IS NOT NULL THEN
      NEW.versao := COALESCE(OLD.versao, 1) + 1;
    END IF;
    IF NEW.status = 'liberado' AND OLD.status IS DISTINCT FROM 'liberado' THEN
      IF NEW.visibilidade <> 'cliente_quando_liberado' THEN
        RAISE EXCEPTION 'Só documentos com visibilidade "cliente quando liberado" podem ser liberados ao cliente.';
      END IF;
      IF NOT public.is_staff_ativo(NEW.organization_id) THEN
        RAISE EXCEPTION 'Liberação de entrega exige usuário interno ativo.';
      END IF;
      NEW.liberado_em := now();
      NEW.liberado_por := auth.uid();
    END IF;
  END IF;

  NEW.liberado_cliente := (NEW.visibilidade = 'cliente_quando_liberado' AND NEW.status = 'liberado');
  RETURN NEW;
END;
$function$;

-- 6.2 auditoria obrigatória da liberação de entregas
CREATE OR REPLACE FUNCTION public.fn_documento_liberacao_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.liberado_cliente = true AND COALESCE(OLD.liberado_cliente, false) = false THEN
    INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
    VALUES (NEW.organization_id, auth.uid(), 'entrega_liberada_cliente', 'documents', NEW.id,
            jsonb_build_object('case_id', NEW.case_id, 'titulo', NEW.titulo,
                               'entrega', NEW.entrega_cliente, 'liberado_em', NEW.liberado_em));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documento_liberacao_audit ON public.documents;
CREATE TRIGGER trg_documento_liberacao_audit AFTER UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.fn_documento_liberacao_audit();

-- 6.3 liberação de fatura ao cliente: exige interno ativo + auditoria
CREATE OR REPLACE FUNCTION public.fn_invoice_liberacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.liberada_cliente = true AND COALESCE(OLD.liberada_cliente, false) = false THEN
    IF NOT public.is_staff_ativo(NEW.organization_id) THEN
      RAISE EXCEPTION 'Liberar fatura ao cliente exige usuário interno ativo.';
    END IF;
    NEW.liberada_em := now();
    NEW.liberada_por := auth.uid();
  END IF;
  IF NEW.liberada_cliente = false AND COALESCE(OLD.liberada_cliente, false) = true THEN
    NEW.liberada_em := NULL;
    NEW.liberada_por := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_liberacao ON public.invoices;
CREATE TRIGGER trg_invoice_liberacao BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.fn_invoice_liberacao();

CREATE OR REPLACE FUNCTION public.fn_invoice_liberacao_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.liberada_cliente IS DISTINCT FROM COALESCE(OLD.liberada_cliente, false) THEN
    INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
    VALUES (NEW.organization_id, auth.uid(),
            CASE WHEN NEW.liberada_cliente THEN 'fatura_liberada_cliente' ELSE 'fatura_ocultada_cliente' END,
            'invoices', NEW.id,
            jsonb_build_object('case_id', NEW.case_id, 'numero', NEW.numero));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_liberacao_audit ON public.invoices;
CREATE TRIGGER trg_invoice_liberacao_audit AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.fn_invoice_liberacao_audit();

-- 6.4 tickets: mensagem do cliente nunca dispara automação externa e mantém ticket vivo
CREATE OR REPLACE FUNCTION public.fn_portal_ticket_msg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.autor_tipo = 'cliente' THEN
    NEW.visivel_cliente := true;
  END IF;
  NEW.autor_user_id := COALESCE(NEW.autor_user_id, auth.uid());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_ticket_msg ON public.portal_ticket_messages;
CREATE TRIGGER trg_portal_ticket_msg BEFORE INSERT ON public.portal_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_portal_ticket_msg();

CREATE OR REPLACE FUNCTION public.fn_portal_ticket_touch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.portal_tickets
     SET ultima_mensagem_em = now(),
         status = CASE
           WHEN NEW.autor_tipo = 'cliente' AND status IN ('resolvido','respondido') THEN 'aberto'
           WHEN NEW.autor_tipo = 'equipe' AND status IN ('aberto','em_analise') THEN 'respondido'
           ELSE status END,
         updated_at = now()
   WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_ticket_touch ON public.portal_ticket_messages;
CREATE TRIGGER trg_portal_ticket_touch AFTER INSERT ON public.portal_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_portal_ticket_touch();

-- 6.5 sem exclusão física + updated_at
DROP TRIGGER IF EXISTS trg_pdr_nodelete ON public.portal_document_requests;
CREATE TRIGGER trg_pdr_nodelete BEFORE DELETE ON public.portal_document_requests
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
DROP TRIGGER IF EXISTS trg_pt_nodelete ON public.portal_tickets;
CREATE TRIGGER trg_pt_nodelete BEFORE DELETE ON public.portal_tickets
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
DROP TRIGGER IF EXISTS trg_ptm_nodelete ON public.portal_ticket_messages;
CREATE TRIGGER trg_ptm_nodelete BEFORE DELETE ON public.portal_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

DROP TRIGGER IF EXISTS trg_pdr_touch ON public.portal_document_requests;
CREATE TRIGGER trg_pdr_touch BEFORE UPDATE ON public.portal_document_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_pt_touch ON public.portal_tickets;
CREATE TRIGGER trg_pt_touch BEFORE UPDATE ON public.portal_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_pdr_case ON public.portal_document_requests(case_id);
CREATE INDEX IF NOT EXISTS idx_pt_case ON public.portal_tickets(case_id);
CREATE INDEX IF NOT EXISTS idx_ptm_ticket ON public.portal_ticket_messages(ticket_id);