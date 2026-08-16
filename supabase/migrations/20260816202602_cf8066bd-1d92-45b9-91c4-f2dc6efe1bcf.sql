-- =========================================================
-- 1. DOCUMENTOS: categorias, sensibilidade, visibilidade, versão
-- =========================================================
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT 'interno',
  ADD COLUMN IF NOT EXISTS sensibilidade text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS visibilidade text NOT NULL DEFAULT 'interno_restrito',
  ADD COLUMN IF NOT EXISTS versao integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS nome_arquivo text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS tamanho_bytes bigint,
  ADD COLUMN IF NOT EXISTS carregado_por uuid,
  ADD COLUMN IF NOT EXISTS carregado_em timestamptz,
  ADD COLUMN IF NOT EXISTS liberado_em timestamptz,
  ADD COLUMN IF NOT EXISTS liberado_por uuid;

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_categoria_chk;
ALTER TABLE public.documents ADD CONSTRAINT documents_categoria_chk CHECK (categoria IN (
  'identificacao','certidao','documento_civil','documento_financeiro','contrato','evidencia_pesquisa','entrega_cliente','interno'
));

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_sensibilidade_chk;
ALTER TABLE public.documents ADD CONSTRAINT documents_sensibilidade_chk CHECK (sensibilidade IN ('normal','sensivel','altamente_sensivel'));

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_visibilidade_chk;
ALTER TABLE public.documents ADD CONSTRAINT documents_visibilidade_chk CHECK (visibilidade IN ('interno_restrito','equipe_do_caso','cliente_quando_liberado'));

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_chk;
ALTER TABLE public.documents ADD CONSTRAINT documents_status_chk CHECK (status IN ('pendente','em_revisao','aprovado','liberado','recusado','arquivado'));

CREATE INDEX IF NOT EXISTS documents_case_idx ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS documents_client_idx ON public.documents(client_id);

-- =========================================================
-- 2. CONSENTIMENTOS: método de coleta, revogação, escopo
-- =========================================================
ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES public.crm_casos(id),
  ADD COLUMN IF NOT EXISTS metodo_coleta text,
  ADD COLUMN IF NOT EXISTS escopo_compartilhamento text,
  ADD COLUMN IF NOT EXISTS texto_aceito text,
  ADD COLUMN IF NOT EXISTS revogacao_motivo text,
  ADD COLUMN IF NOT EXISTS revogado_por uuid,
  ADD COLUMN IF NOT EXISTS evidencia_id uuid REFERENCES public.evidencias(id),
  ADD COLUMN IF NOT EXISTS documento_id uuid REFERENCES public.documents(id);

ALTER TABLE public.consent_records DROP CONSTRAINT IF EXISTS consent_records_status_chk;
ALTER TABLE public.consent_records ADD CONSTRAINT consent_records_status_chk CHECK (status IN ('coletado','ativo','revogado','expirado'));

ALTER TABLE public.consent_records DROP CONSTRAINT IF EXISTS consent_records_tipo_chk;
ALTER TABLE public.consent_records ADD CONSTRAINT consent_records_tipo_chk CHECK (tipo_consentimento IN ('tratamento_dados','compartilhamento_terceiros','comunicacoes'));

-- =========================================================
-- 3. EXCEÇÕES FORMAIS DE CONSENTIMENTO (somente admin)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.consent_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  client_id uuid REFERENCES public.clientes(id),
  motivo text NOT NULL,
  valido_ate date,
  aprovado_por uuid NOT NULL,
  aprovado_em timestamptz NOT NULL DEFAULT now(),
  revogado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

GRANT SELECT, INSERT, UPDATE ON public.consent_exceptions TO authenticated;
GRANT ALL ON public.consent_exceptions TO service_role;
ALTER TABLE public.consent_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_exceptions_select" ON public.consent_exceptions
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "consent_exceptions_insert" ON public.consent_exceptions
  FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, 'admin'));
CREATE POLICY "consent_exceptions_update" ON public.consent_exceptions
  FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, 'admin'))
  WITH CHECK (public.has_org_role(organization_id, 'admin'));

CREATE TRIGGER consent_exceptions_meta BEFORE INSERT OR UPDATE ON public.consent_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();
CREATE TRIGGER consent_exceptions_archive BEFORE UPDATE ON public.consent_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.fn_archive_meta();
CREATE TRIGGER consent_exceptions_no_delete BEFORE DELETE ON public.consent_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER consent_exceptions_audit AFTER INSERT OR UPDATE ON public.consent_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();

-- =========================================================
-- 4. ALERTAS DE PRIVACIDADE (admin/operações)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.privacy_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  client_id uuid REFERENCES public.clientes(id),
  consent_id uuid REFERENCES public.consent_records(id),
  tipo text NOT NULL,
  mensagem text NOT NULL,
  status text NOT NULL DEFAULT 'aberto',
  resolvido_em timestamptz,
  resolvido_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT privacy_alerts_status_chk CHECK (status IN ('aberto','resolvido'))
);

GRANT SELECT, INSERT, UPDATE ON public.privacy_alerts TO authenticated;
GRANT ALL ON public.privacy_alerts TO service_role;
ALTER TABLE public.privacy_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "privacy_alerts_select" ON public.privacy_alerts
  FOR SELECT TO authenticated USING (
    public.has_org_role(organization_id, 'admin') OR public.has_org_role(organization_id, 'operacoes')
  );
CREATE POLICY "privacy_alerts_update" ON public.privacy_alerts
  FOR UPDATE TO authenticated USING (
    public.has_org_role(organization_id, 'admin') OR public.has_org_role(organization_id, 'operacoes')
  ) WITH CHECK (
    public.has_org_role(organization_id, 'admin') OR public.has_org_role(organization_id, 'operacoes')
  );

CREATE TRIGGER privacy_alerts_no_delete BEFORE DELETE ON public.privacy_alerts
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- =========================================================
-- 5. FUNÇÕES DE APOIO
-- =========================================================
CREATE OR REPLACE FUNCTION public.consentimento_ativo(_case uuid, _client uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consent_records c
    WHERE c.tipo_consentimento = 'tratamento_dados'
      AND c.status IN ('coletado','ativo')
      AND c.archived_at IS NULL
      AND c.revogado_em IS NULL
      AND ((_case IS NOT NULL AND c.case_id = _case) OR (_client IS NOT NULL AND c.client_id = _client))
  );
$$;

CREATE OR REPLACE FUNCTION public.consentimento_dispensado(_case uuid, _client uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consent_exceptions e
    WHERE e.archived_at IS NULL
      AND e.revogado_em IS NULL
      AND (e.valido_ate IS NULL OR e.valido_ate >= current_date)
      AND ((_case IS NOT NULL AND e.case_id = _case) OR (_client IS NOT NULL AND e.client_id = _client))
  );
$$;

REVOKE EXECUTE ON FUNCTION public.consentimento_ativo(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.consentimento_dispensado(uuid, uuid) FROM anon;

-- =========================================================
-- 6. TRAVAS DE DOCUMENTOS
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_documents_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cliente uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Envio de documentos exige usuário autenticado.';
  END IF;
  IF NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'Documento fora da sua organização.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.carregado_por := COALESCE(NEW.carregado_por, auth.uid());
    NEW.carregado_em := COALESCE(NEW.carregado_em, now());
    IF NEW.case_id IS NOT NULL THEN
      SELECT cliente_id INTO v_cliente FROM public.crm_casos WHERE id = NEW.case_id;
      NEW.client_id := COALESCE(NEW.client_id, v_cliente);
    END IF;
    -- Categorias sensíveis exigem consentimento ativo ou exceção formal.
    IF NEW.categoria IN ('identificacao','certidao','documento_civil','documento_financeiro')
       AND NOT public.consentimento_ativo(NEW.case_id, NEW.client_id)
       AND NOT public.consentimento_dispensado(NEW.case_id, NEW.client_id) THEN
      RAISE EXCEPTION 'Categoria sensível bloqueada: registre consentimento de tratamento de dados ou uma exceção formal aprovada.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.storage_path IS DISTINCT FROM OLD.storage_path AND NEW.storage_path IS NOT NULL THEN
      NEW.versao := COALESCE(OLD.versao, 1) + 1;
    END IF;
    IF NEW.status = 'liberado' AND OLD.status IS DISTINCT FROM 'liberado' THEN
      IF NEW.visibilidade <> 'cliente_quando_liberado' THEN
        RAISE EXCEPTION 'Só documentos com visibilidade "cliente quando liberado" podem ser liberados ao cliente.';
      END IF;
      NEW.liberado_em := now();
      NEW.liberado_por := auth.uid();
    END IF;
  END IF;

  -- O espelho antigo (liberado_cliente) segue coerente com a nova regra.
  NEW.liberado_cliente := (NEW.visibilidade = 'cliente_quando_liberado' AND NEW.status = 'liberado');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_guard ON public.documents;
CREATE TRIGGER documents_guard BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.fn_documents_guard();

-- =========================================================
-- 7. TRAVAS DE CONSENTIMENTO + ALERTA DE REVOGAÇÃO
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_consent_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Registro de consentimento exige usuário autenticado.';
  END IF;
  IF NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'Consentimento fora da sua organização.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.coletado_em := COALESCE(NEW.coletado_em, now());
    IF COALESCE(btrim(NEW.metodo_coleta), '') = '' THEN
      RAISE EXCEPTION 'Informe o método de coleta do consentimento.';
    END IF;
    IF COALESCE(btrim(NEW.versao_texto), '') = '' THEN
      RAISE EXCEPTION 'Informe a versão do texto aceito.';
    END IF;
  END IF;

  IF NEW.status = 'revogado' THEN
    NEW.revogado_em := COALESCE(NEW.revogado_em, now());
    NEW.revogado_por := COALESCE(NEW.revogado_por, auth.uid());
    IF COALESCE(btrim(NEW.revogacao_motivo), '') = '' THEN
      RAISE EXCEPTION 'A revogação exige motivo registrado.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'revogado' AND NEW.status <> 'revogado' THEN
    RAISE EXCEPTION 'Consentimento revogado não pode ser reativado: registre um novo consentimento.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS consent_guard ON public.consent_records;
CREATE TRIGGER consent_guard BEFORE INSERT OR UPDATE ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_consent_guard();

CREATE OR REPLACE FUNCTION public.fn_consent_revogacao_alerta()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'revogado' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'revogado') THEN
    INSERT INTO public.privacy_alerts (organization_id, case_id, client_id, consent_id, tipo, mensagem)
    VALUES (
      NEW.organization_id, NEW.case_id, NEW.client_id, NEW.id, 'consentimento_revogado',
      'Consentimento revogado em ' || to_char(COALESCE(NEW.revogado_em, now()), 'DD/MM/YYYY HH24:MI') ||
      '. Motivo: ' || COALESCE(NEW.revogacao_motivo, 'não informado') || '. Revisar acessos e uploads do caso.'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS consent_revogacao_alerta ON public.consent_records;
CREATE TRIGGER consent_revogacao_alerta AFTER INSERT OR UPDATE ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_consent_revogacao_alerta();

-- =========================================================
-- 8. ATIVAÇÃO DE CASO EXIGE CONSENTIMENTO ATIVO
-- =========================================================
CREATE OR REPLACE FUNCTION public.fn_guard_consentimento_ativacao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'ativo' AND OLD.status IS DISTINCT FROM 'ativo' THEN
    IF NOT public.consentimento_ativo(NEW.id, NEW.cliente_id)
       AND NOT public.consentimento_dispensado(NEW.id, NEW.cliente_id) THEN
      RAISE EXCEPTION 'Ativação bloqueada: o caso não possui consentimento de tratamento de dados ativo nem exceção formal aprovada.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_consentimento_ativacao ON public.crm_casos;
CREATE TRIGGER guard_consentimento_ativacao BEFORE UPDATE ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_consentimento_ativacao();
