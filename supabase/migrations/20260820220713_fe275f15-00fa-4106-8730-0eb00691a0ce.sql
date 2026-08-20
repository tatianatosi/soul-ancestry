CREATE TABLE public.case_source_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL,
  pessoa_ref_id uuid,
  pessoa_nao_identificada boolean NOT NULL DEFAULT false,
  storage_path text NOT NULL,
  nome_arquivo text NOT NULL,
  mime_type text,
  tamanho_bytes bigint,
  tipo_documento text NOT NULL,
  origem_documento text NOT NULL,
  status text NOT NULL DEFAULT 'pendente_revisao',
  qualidade_origem text NOT NULL DEFAULT 'origem_a_confirmar',
  confidencialidade text NOT NULL DEFAULT 'equipe_do_caso',
  titulo_interno text,
  data_documento date,
  pais text,
  estado_provincia text,
  cidade text,
  instituicao_emissora text,
  referencia_origem text,
  idioma text,
  observacoes text,
  extracao_status text NOT NULL DEFAULT 'nao_preparado',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archive_motivo text
);

CREATE INDEX idx_csd_caso ON public.case_source_documents (organization_id, case_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.case_source_documents TO authenticated;
GRANT ALL ON public.case_source_documents TO service_role;

ALTER TABLE public.case_source_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY csd_select_org ON public.case_source_documents FOR SELECT TO authenticated
USING (
  is_org_member(organization_id)
  AND (
    confidencialidade <> 'restrito'
    OR has_org_role(organization_id, 'admin'::app_role)
    OR has_org_role(organization_id, 'pesquisador'::app_role)
  )
);

CREATE POLICY csd_insert_org ON public.case_source_documents FOR INSERT TO authenticated
WITH CHECK (is_org_member(organization_id) AND can_write(organization_id));

CREATE POLICY csd_update_org ON public.case_source_documents FOR UPDATE TO authenticated
USING (is_org_member(organization_id) AND can_write(organization_id))
WITH CHECK (is_org_member(organization_id));

CREATE OR REPLACE FUNCTION public.fn_case_source_document_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipos text[] := ARRAY[
    'certidao_nascimento','certidao_casamento','certidao_obito','registro_civil','inteiro_teor',
    'certidao_estrangeira','registro_religioso_batismo','registro_imigracao','lista_passageiros',
    'registro_consular','naturalizacao','passaporte','documento_identidade','comprovante_residencia',
    'documento_militar','documento_notarial','inventario_testamento','documento_judicial',
    'documento_cidadania','certidao_negativa_positiva','registro_arquivo_historico',
    'fotografia_imagem_historica','correspondencia','arvore_recebida_familia','relato_familiar',
    'documento_comercial_contratual','proposta_canva','outro_documento'];
  v_status text[] := ARRAY['pendente_revisao','revisado','rejeitado','arquivado'];
  v_qualidade text[] := ARRAY['original_oficial','copia_autenticada','copia_simples','imagem_digital',
    'relato_familiar','fonte_secundaria','origem_a_confirmar'];
  v_conf text[] := ARRAY['equipe_do_caso','interno','restrito'];
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_BLOQUEADA: use arquivamento com motivo.';
  END IF;

  IF NOT (NEW.tipo_documento = ANY (v_tipos)) THEN
    RAISE EXCEPTION 'TIPO_DOCUMENTO_INVALIDO: %', NEW.tipo_documento;
  END IF;
  IF NOT (NEW.status = ANY (v_status)) THEN
    RAISE EXCEPTION 'STATUS_INVALIDO: %', NEW.status;
  END IF;
  IF NOT (NEW.qualidade_origem = ANY (v_qualidade)) THEN
    RAISE EXCEPTION 'QUALIDADE_ORIGEM_INVALIDA: %', NEW.qualidade_origem;
  END IF;
  IF NOT (NEW.confidencialidade = ANY (v_conf)) THEN
    RAISE EXCEPTION 'CONFIDENCIALIDADE_INVALIDA: %', NEW.confidencialidade;
  END IF;
  IF NEW.extracao_status <> 'nao_preparado' THEN
    RAISE EXCEPTION 'EXTRACAO_NAO_DISPONIVEL: ponto de extensão ainda não implementado.';
  END IF;

  IF coalesce(btrim(NEW.origem_documento), '') = '' THEN
    RAISE EXCEPTION 'ORIGEM_DOCUMENTO_OBRIGATORIA';
  END IF;

  IF (NEW.pessoa_ref_id IS NULL AND NEW.pessoa_nao_identificada IS NOT TRUE)
     OR (NEW.pessoa_ref_id IS NOT NULL AND NEW.pessoa_nao_identificada IS TRUE) THEN
    RAISE EXCEPTION 'PESSOA_RELACIONADA_OBRIGATORIA: informe pessoa existente do caso ou marque pessoa ainda não identificada.';
  END IF;

  IF NEW.archived_at IS NOT NULL AND coalesce(btrim(NEW.archive_motivo), '') = '' THEN
    RAISE EXCEPTION 'MOTIVO_ARQUIVAMENTO_OBRIGATORIO';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    NEW.created_at := now();
    NEW.status := coalesce(NEW.status, 'pendente_revisao');
  ELSE
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    NEW.organization_id := OLD.organization_id;
    NEW.case_id := OLD.case_id;
    NEW.storage_path := OLD.storage_path;
  END IF;
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_csd_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.case_source_documents
FOR EACH ROW EXECUTE FUNCTION public.fn_case_source_document_guard();

CREATE OR REPLACE FUNCTION public.fn_case_source_document_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (organization_id, actor_user_id, entity, entity_id, action, payload)
  VALUES (
    NEW.organization_id,
    auth.uid(),
    'case_source_documents',
    NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'criacao'
         WHEN NEW.archived_at IS NOT NULL AND (OLD.archived_at IS NULL) THEN 'arquivamento'
         ELSE 'atualizacao' END,
    jsonb_build_object(
      'case_id', NEW.case_id,
      'tipo_documento', NEW.tipo_documento,
      'status', NEW.status,
      'qualidade_origem', NEW.qualidade_origem,
      'confidencialidade', NEW.confidencialidade,
      'archive_motivo', NEW.archive_motivo
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_csd_audit
AFTER INSERT OR UPDATE ON public.case_source_documents
FOR EACH ROW EXECUTE FUNCTION public.fn_case_source_document_audit();