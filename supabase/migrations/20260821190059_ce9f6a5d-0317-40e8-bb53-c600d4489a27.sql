
ALTER TABLE public.portal_document_requests
  ADD COLUMN IF NOT EXISTS finalidade text,
  ADD COLUMN IF NOT EXISTS categoria text,
  ADD COLUMN IF NOT EXISTS participante_id uuid,
  ADD COLUMN IF NOT EXISTS participante_nome text,
  ADD COLUMN IF NOT EXISTS responsavel_id uuid;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS entrega_classificacao text,
  ADD COLUMN IF NOT EXISTS entrega_responsavel_id uuid,
  ADD COLUMN IF NOT EXISTS entrega_versao text,
  ADD COLUMN IF NOT EXISTS recolhido_em timestamptz,
  ADD COLUMN IF NOT EXISTS recolhido_por uuid,
  ADD COLUMN IF NOT EXISTS recolhimento_motivo text,
  ADD COLUMN IF NOT EXISTS versao_substituta text;

-- Motivos de bloqueio de ações client-facing (fonte de verdade no banco)
CREATE OR REPLACE FUNCTION public.atendimento_bloqueios(_case uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c record; m text[] := '{}';
BEGIN
  SELECT * INTO c FROM public.crm_casos WHERE id = _case;
  IF NOT FOUND THEN RETURN ARRAY['Caso não encontrado']; END IF;
  IF c.archived_at IS NOT NULL THEN m := m || 'Caso arquivado'; END IF;
  IF COALESCE(c.contrato_assinado,false) IS NOT TRUE THEN m := m || 'Contrato não assinado'; END IF;
  IF COALESCE(c.pagamento_confirmado,false) IS NOT TRUE THEN m := m || 'Pagamento inicial não confirmado'; END IF;
  IF COALESCE(c.documentos_minimos_ok,false) IS NOT TRUE THEN m := m || 'Documentos mínimos pendentes'; END IF;
  IF c.ativado_em IS NULL AND c.data_ativacao IS NULL THEN m := m || 'Falta decisão humana de ativação'; END IF;
  IF COALESCE(c.eixo_formalizacao,'') IN ('nao_iniciado','formalizacao_em_preparacao','confirmacao_formal')
     OR COALESCE(c.eixo_comercial,'') IN ('novo_lead','diagnostico','aceite_verbal','confirmacao_formal_recebida')
  THEN m := m || 'Caso ainda em diagnóstico/aceite verbal/confirmação formal/formalização'; END IF;
  RETURN m;
END; $$;

GRANT EXECUTE ON FUNCTION public.atendimento_bloqueios(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fn_atendimento_solicitacao_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b text[];
BEGIN
  IF TG_OP = 'INSERT' OR NEW.case_id IS DISTINCT FROM OLD.case_id THEN
    IF NEW.case_id IS NULL THEN RAISE EXCEPTION 'Solicitação exige caso vinculado.'; END IF;
    b := public.atendimento_bloqueios(NEW.case_id);
    IF array_length(b,1) > 0 THEN
      RAISE EXCEPTION 'Caso sem portal elegível: %', array_to_string(b, '; ');
    END IF;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(btrim(NEW.finalidade),'') = '' THEN RAISE EXCEPTION 'Informe a finalidade da solicitação.'; END IF;
    IF COALESCE(btrim(NEW.categoria),'') = '' THEN RAISE EXCEPTION 'Informe a categoria do documento solicitado.'; END IF;
    IF NEW.responsavel_id IS NULL THEN RAISE EXCEPTION 'Informe o responsável interno pela solicitação.'; END IF;
    IF NEW.prazo IS NULL THEN RAISE EXCEPTION 'Informe o prazo da solicitação.'; END IF;
    IF COALESCE(btrim(NEW.participante_nome),'') = '' THEN RAISE EXCEPTION 'Informe o participante a quem o documento se refere.'; END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_atendimento_solicitacao_guard ON public.portal_document_requests;
CREATE TRIGGER trg_atendimento_solicitacao_guard
BEFORE INSERT OR UPDATE ON public.portal_document_requests
FOR EACH ROW EXECUTE FUNCTION public.fn_atendimento_solicitacao_guard();

CREATE OR REPLACE FUNCTION public.fn_atendimento_entrega_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b text[]; pode boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.entrega_cliente,false) IS DISTINCT FROM COALESCE(OLD.entrega_cliente,false) THEN
    pode := public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operacoes');
    IF NOT pode THEN RAISE EXCEPTION 'Apenas admin e operações liberam ou recolhem entregas.'; END IF;

    IF COALESCE(NEW.entrega_cliente,false) THEN
      IF NEW.case_id IS NULL THEN RAISE EXCEPTION 'Entrega exige caso vinculado.'; END IF;
      b := public.atendimento_bloqueios(NEW.case_id);
      IF array_length(b,1) > 0 THEN
        RAISE EXCEPTION 'Caso sem portal elegível: %', array_to_string(b, '; ');
      END IF;
      IF COALESCE(NEW.entrega_classificacao,'') <> 'externa_aprovada' THEN
        RAISE EXCEPTION 'Entrega só pode ser liberada como externa aprovada.';
      END IF;
      IF COALESCE(btrim(NEW.entrega_versao),'') = '' THEN RAISE EXCEPTION 'Informe a versão da entrega.'; END IF;
      IF NEW.entrega_responsavel_id IS NULL THEN RAISE EXCEPTION 'Informe o responsável pela entrega.'; END IF;
      NEW.liberado_cliente := true;
      NEW.liberado_em := now();
      NEW.liberado_por := auth.uid();
      NEW.recolhido_em := NULL;
    ELSE
      IF COALESCE(btrim(NEW.recolhimento_motivo),'') = '' THEN
        RAISE EXCEPTION 'Recolher entrega exige justificativa objetiva.';
      END IF;
      NEW.liberado_cliente := false;
      NEW.recolhido_em := now();
      NEW.recolhido_por := auth.uid();
    END IF;

    INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
    VALUES (NEW.organization_id, auth.uid(),
      CASE WHEN COALESCE(NEW.entrega_cliente,false) THEN 'entrega_liberada' ELSE 'entrega_recolhida' END,
      'documents', NEW.id,
      jsonb_build_object(
        'case_id', NEW.case_id,
        'classificacao', NEW.entrega_classificacao,
        'versao', NEW.entrega_versao,
        'versao_substituta', NEW.versao_substituta,
        'responsavel_id', NEW.entrega_responsavel_id,
        'motivo_recolhimento', NEW.recolhimento_motivo));
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_atendimento_entrega_guard ON public.documents;
CREATE TRIGGER trg_atendimento_entrega_guard
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.fn_atendimento_entrega_guard();

CREATE OR REPLACE FUNCTION public.fn_atendimento_fatura_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b text[]; pode boolean; acesso int;
BEGIN
  IF TG_OP = 'UPDATE' AND COALESCE(NEW.liberada_cliente,false) IS DISTINCT FROM COALESCE(OLD.liberada_cliente,false) THEN
    pode := public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financeiro');
    IF NOT pode THEN RAISE EXCEPTION 'Apenas admin e financeiro alteram a visibilidade de faturas.'; END IF;

    IF COALESCE(NEW.liberada_cliente,false) THEN
      IF NEW.case_id IS NULL THEN RAISE EXCEPTION 'Fatura exige vínculo com caso antes de ficar visível.'; END IF;
      b := public.atendimento_bloqueios(NEW.case_id);
      IF array_length(b,1) > 0 THEN
        RAISE EXCEPTION 'Caso sem portal elegível: %', array_to_string(b, '; ');
      END IF;
      SELECT count(*) INTO acesso
        FROM public.client_portal_access a
       WHERE a.client_id = NEW.client_id
         AND a.access_status = 'active'
         AND a.access_level = 'client_workspace'
         AND a.archived_at IS NULL;
      IF acesso = 0 THEN RAISE EXCEPTION 'Cliente sem acesso autorizado e ativo ao espaço do cliente.'; END IF;
      NEW.liberada_em := now();
      NEW.liberada_por := auth.uid();
    END IF;

    INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
    VALUES (NEW.organization_id, auth.uid(),
      CASE WHEN COALESCE(NEW.liberada_cliente,false) THEN 'fatura_liberada' ELSE 'fatura_ocultada' END,
      'invoices', NEW.id,
      jsonb_build_object('case_id', NEW.case_id, 'client_id', NEW.client_id));
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_atendimento_fatura_guard ON public.invoices;
CREATE TRIGGER trg_atendimento_fatura_guard
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.fn_atendimento_fatura_guard();
