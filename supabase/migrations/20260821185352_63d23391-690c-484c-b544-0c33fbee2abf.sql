-- ============================================================
-- Acessos ao portal: e-mails previamente autorizados e travas por nível
-- ============================================================

CREATE TABLE IF NOT EXISTS public.authorized_portal_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  client_id uuid REFERENCES public.clientes(id),
  case_id uuid REFERENCES public.crm_casos(id),
  email text NOT NULL,
  finalidade text NOT NULL,
  nivel_pretendido public.portal_access_level NOT NULL DEFAULT 'proposal_portal',
  status text NOT NULL DEFAULT 'pendente',
  validado_por uuid,
  validado_em timestamptz,
  motivo_recusa text,
  is_demo boolean NOT NULL DEFAULT false,
  notes_internal text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.authorized_portal_emails TO authenticated;
GRANT ALL ON public.authorized_portal_emails TO service_role;

ALTER TABLE public.authorized_portal_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_portal_emails_select"
  ON public.authorized_portal_emails FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY "authorized_portal_emails_insert"
  ON public.authorized_portal_emails FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, 'admin'::public.app_role)
           OR public.has_org_role(organization_id, 'operacoes'::public.app_role));

CREATE POLICY "authorized_portal_emails_update"
  ON public.authorized_portal_emails FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, 'admin'::public.app_role)
      OR public.has_org_role(organization_id, 'operacoes'::public.app_role))
  WITH CHECK (public.has_org_role(organization_id, 'admin'::public.app_role)
           OR public.has_org_role(organization_id, 'operacoes'::public.app_role));

CREATE UNIQUE INDEX IF NOT EXISTS authorized_portal_emails_unico
  ON public.authorized_portal_emails (organization_id, lower(email), coalesce(case_id, '00000000-0000-0000-0000-000000000000'::uuid), nivel_pretendido)
  WHERE archived_at IS NULL;

CREATE TRIGGER trg_authorized_portal_emails_updated
  BEFORE UPDATE ON public.authorized_portal_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_authorized_portal_emails_no_delete
  BEFORE DELETE ON public.authorized_portal_emails
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE OR REPLACE FUNCTION public.fn_authorized_portal_email_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_cliente uuid;
BEGIN
  NEW.email := lower(btrim(NEW.email));
  IF NEW.email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'E-mail inválido para autorização de portal.';
  END IF;

  IF NEW.finalidade IS NULL OR length(btrim(NEW.finalidade)) < 5 THEN
    RAISE EXCEPTION 'Registre a finalidade da autorização (mínimo 5 caracteres).';
  END IF;

  IF NEW.status NOT IN ('pendente', 'aprovado', 'recusado', 'revogado') THEN
    RAISE EXCEPTION 'Status de autorização inválido: %', NEW.status;
  END IF;

  IF NEW.status IN ('aprovado', 'recusado', 'revogado') THEN
    IF NEW.validado_por IS NULL THEN NEW.validado_por := auth.uid(); END IF;
    IF NEW.validado_em IS NULL THEN NEW.validado_em := now(); END IF;
  END IF;

  IF NEW.case_id IS NOT NULL THEN
    SELECT cliente_id INTO v_case_cliente FROM public.crm_casos WHERE id = NEW.case_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Caso informado não existe.';
    END IF;
    IF NEW.client_id IS NOT NULL AND v_case_cliente IS DISTINCT FROM NEW.client_id THEN
      RAISE EXCEPTION 'O caso autorizado não pertence à pessoa informada.';
    END IF;
  END IF;

  IF NEW.archived_at IS NOT NULL AND (NEW.archive_motivo IS NULL OR length(btrim(NEW.archive_motivo)) < 5) THEN
    RAISE EXCEPTION 'Arquivamento exige motivo registrado.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_authorized_portal_email_guard
  BEFORE INSERT OR UPDATE ON public.authorized_portal_emails
  FOR EACH ROW EXECUTE FUNCTION public.fn_authorized_portal_email_guard();

-- ============================================================
-- Campos adicionais no acesso ao portal
-- ============================================================

ALTER TABLE public.client_portal_access
  ADD COLUMN IF NOT EXISTS finalidade text,
  ADD COLUMN IF NOT EXISTS authorized_email_id uuid REFERENCES public.authorized_portal_emails(id),
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS magic_link_max_uses integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS magic_link_uses integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS magic_link_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text;

CREATE OR REPLACE FUNCTION public.fn_portal_access_autorizacao_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aut public.authorized_portal_emails%ROWTYPE;
BEGIN
  NEW.email := lower(btrim(NEW.email));

  IF TG_OP = 'INSERT'
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.access_level IS DISTINCT FROM OLD.access_level THEN
    SELECT * INTO v_aut
    FROM public.authorized_portal_emails a
    WHERE a.organization_id = NEW.organization_id
      AND lower(a.email) = NEW.email
      AND a.status = 'aprovado'
      AND a.archived_at IS NULL
      AND a.nivel_pretendido = NEW.access_level
      AND (a.client_id IS NULL OR a.client_id = NEW.client_id)
    ORDER BY a.validado_em DESC NULLS LAST
    LIMIT 1;

    IF v_aut.id IS NULL THEN
      RAISE EXCEPTION 'Bloqueado: e-mail não autorizado previamente para este nível de acesso.';
    END IF;

    NEW.authorized_email_id := v_aut.id;
    IF NEW.finalidade IS NULL OR length(btrim(NEW.finalidade)) < 5 THEN
      NEW.finalidade := v_aut.finalidade;
    END IF;
    IF v_aut.is_demo THEN NEW.is_demo := true; END IF;
  END IF;

  IF NEW.access_status = 'suspended' THEN
    IF NEW.suspended_at IS NULL THEN NEW.suspended_at := now(); END IF;
    IF NEW.suspension_reason IS NULL OR length(btrim(NEW.suspension_reason)) < 5 THEN
      NEW.suspension_reason := coalesce(NEW.revocation_reason, 'Suspensão registrada pela equipe.');
    END IF;
  END IF;

  IF NEW.access_status = 'revoked' AND (NEW.revocation_reason IS NULL OR length(btrim(NEW.revocation_reason)) < 5) THEN
    RAISE EXCEPTION 'Revogação exige motivo registrado.';
  END IF;

  IF NEW.magic_link_max_uses < 1 THEN
    RAISE EXCEPTION 'O link mágico precisa ter pelo menos um uso permitido.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_access_autorizacao_guard ON public.client_portal_access;
CREATE TRIGGER trg_portal_access_autorizacao_guard
  BEFORE INSERT OR UPDATE ON public.client_portal_access
  FOR EACH ROW EXECUTE FUNCTION public.fn_portal_access_autorizacao_guard();

-- ============================================================
-- Trava do vínculo de caso: elegibilidade do Espaço do cliente
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_portal_case_access_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acesso public.client_portal_access%ROWTYPE;
  v_caso public.crm_casos%ROWTYPE;
BEGIN
  SELECT * INTO v_acesso FROM public.client_portal_access WHERE id = NEW.client_portal_access_id;
  IF v_acesso.id IS NULL THEN
    RAISE EXCEPTION 'Acesso ao portal não encontrado.';
  END IF;

  SELECT * INTO v_caso FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_caso.id IS NULL OR v_caso.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Caso não encontrado ou arquivado.';
  END IF;

  IF v_acesso.access_level = 'proposal_portal' THEN
    RAISE EXCEPTION 'Bloqueado: portal de proposta não recebe vínculo de caso operacional.';
  END IF;

  IF v_caso.cliente_id IS DISTINCT FROM v_acesso.client_id THEN
    RAISE EXCEPTION 'Bloqueado: o caso não pertence à pessoa deste acesso.';
  END IF;

  IF NEW.access_status IS DISTINCT FROM 'revoked'::public.portal_case_status THEN
    IF NOT coalesce(v_caso.contrato_assinado, false) THEN
      RAISE EXCEPTION 'Bloqueado: contrato não assinado.';
    END IF;
    IF NOT coalesce(v_caso.pagamento_confirmado, false) THEN
      RAISE EXCEPTION 'Bloqueado: pagamento inicial não confirmado.';
    END IF;
    IF NOT coalesce(v_caso.documentos_minimos_ok, false) THEN
      RAISE EXCEPTION 'Bloqueado: documentos mínimos não concluídos.';
    END IF;
    IF v_caso.ativado_em IS NULL AND v_caso.onboarding_iniciado_em IS NULL THEN
      RAISE EXCEPTION 'Bloqueado: falta decisão humana de ativação ou onboarding elegível.';
    END IF;
    IF coalesce(v_acesso.is_demo, false) <> coalesce(v_caso.demo, false) THEN
      RAISE EXCEPTION 'Bloqueado: acesso de demonstração não pode ser vinculado a caso real.';
    END IF;
  END IF;

  IF NEW.access_status = 'revoked'::public.portal_case_status
     AND (NEW.revocation_reason IS NULL OR length(btrim(NEW.revocation_reason)) < 5) THEN
    RAISE EXCEPTION 'Revogação de caso exige motivo registrado.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_case_access_guard ON public.client_portal_case_access;
CREATE TRIGGER trg_portal_case_access_guard
  BEFORE INSERT OR UPDATE ON public.client_portal_case_access
  FOR EACH ROW EXECUTE FUNCTION public.fn_portal_case_access_guard();
