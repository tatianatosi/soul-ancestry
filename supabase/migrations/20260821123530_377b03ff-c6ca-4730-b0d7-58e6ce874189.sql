-- ============ 1. case_plans ============
CREATE TABLE public.case_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  family_id uuid,
  case_service_id uuid,
  fase_jornada text NOT NULL DEFAULT 'aceite_e_formalizacao',
  marco_atual text,
  responsavel_user_id uuid,
  proxima_acao text,
  prazo_proxima_acao date,
  checklist_aplicavel text[] NOT NULL DEFAULT '{}',
  pendencias_cliente text[] NOT NULL DEFAULT '{}',
  pendencias_internas text[] NOT NULL DEFAULT '{}',
  entrega_robusta_atual text,
  proxima_microentrega text,
  ultima_atualizacao_cliente_em timestamptz,
  proxima_atualizacao_limite_em timestamptz,
  dias_sem_touchpoint integer NOT NULL DEFAULT 0,
  status_saude text NOT NULL DEFAULT 'regular',
  status text NOT NULL DEFAULT 'rascunho',
  observacao_interna text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT case_plans_fase_chk CHECK (fase_jornada = ANY (ARRAY['aceite_e_formalizacao','onboarding','pesquisa_inicial','pesquisa_e_validacao','preparacao_documental','protocolo_e_acompanhamento','reconhecimento','pos_reconhecimento'])),
  CONSTRAINT case_plans_saude_chk CHECK (status_saude = ANY (ARRAY['regular','atencao','critico'])),
  CONSTRAINT case_plans_status_chk CHECK (status = ANY (ARRAY['rascunho','ativo','pausado','concluido','arquivado']))
);

GRANT SELECT, INSERT, UPDATE ON public.case_plans TO authenticated;
GRANT ALL ON public.case_plans TO service_role;
ALTER TABLE public.case_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_plans_select" ON public.case_plans FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY "case_plans_insert" ON public.case_plans FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY "case_plans_update" ON public.case_plans FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE UNIQUE INDEX case_plans_um_ativo_por_fase
  ON public.case_plans (case_id, fase_jornada)
  WHERE status = 'ativo' AND archived_at IS NULL;
CREATE INDEX case_plans_case_idx ON public.case_plans (case_id);

-- ============ 2. case_espera_externa ============
CREATE TABLE public.case_espera_externa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  motivo text NOT NULL,
  responsavel_user_id uuid NOT NULL,
  prazo_rechecagem date NOT NULL,
  ultima_atualizacao_contextualizada_em timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'em_espera',
  observacao_interna text,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT case_espera_status_chk CHECK (status = ANY (ARRAY['em_espera','rechecar','encerrada']))
);

GRANT SELECT, INSERT, UPDATE ON public.case_espera_externa TO authenticated;
GRANT ALL ON public.case_espera_externa TO service_role;
ALTER TABLE public.case_espera_externa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_espera_select" ON public.case_espera_externa FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY "case_espera_insert" ON public.case_espera_externa FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY "case_espera_update" ON public.case_espera_externa FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE INDEX case_espera_case_idx ON public.case_espera_externa (case_id);

-- ============ 3. colunas aditivas ============
ALTER TABLE public.onboarding_checklist
  ADD COLUMN IF NOT EXISTS descricao_interna text,
  ADD COLUMN IF NOT EXISTS responsavel_user_id uuid,
  ADD COLUMN IF NOT EXISTS evidencia_referencia_interna text,
  ADD COLUMN IF NOT EXISTS bloqueio_codigo text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid,
  ADD COLUMN IF NOT EXISTS archive_motivo text;

ALTER TABLE public.client_deliverables
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS eixo_operacao text NOT NULL DEFAULT 'nao_iniciado',
  ADD COLUMN IF NOT EXISTS onboarding_iniciado_em timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_iniciado_por uuid;

ALTER TABLE public.crm_casos
  ADD CONSTRAINT crm_casos_eixo_operacao_chk CHECK (eixo_operacao = ANY (ARRAY[
    'nao_iniciado','formalizacao_em_preparacao','contrato_enviado','contrato_assinado',
    'pagamento_inicial_confirmado','onboarding_iniciado','caso_ativo','arquivado']));

ALTER TABLE public.case_alerts
  ADD COLUMN IF NOT EXISTS origem_regra text,
  ADD COLUMN IF NOT EXISTS resolucao_observacao text;

-- ============ 4. guardas ============
CREATE OR REPLACE FUNCTION public.fn_case_plan_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_derivado text;
BEGIN
  IF NEW.status = 'ativo' AND NEW.archived_at IS NULL THEN
    IF NEW.responsavel_user_id IS NULL THEN
      RAISE EXCEPTION 'Plano ativo exige responsável.';
    END IF;
    IF NEW.proxima_acao IS NULL OR btrim(NEW.proxima_acao) = '' THEN
      RAISE EXCEPTION 'Plano ativo exige próxima ação.';
    END IF;
    IF NEW.prazo_proxima_acao IS NULL THEN
      RAISE EXCEPTION 'Plano ativo exige prazo da próxima ação.';
    END IF;
    SELECT status_caso_derivado INTO v_derivado FROM public.crm_casos WHERE id = NEW.case_id;
    IF v_derivado = 'pre_onboarding_bloqueado' THEN
      RAISE EXCEPTION 'Caso em pre_onboarding_bloqueado não pode ter plano ativo.';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_case_plan_guard BEFORE INSERT OR UPDATE ON public.case_plans
  FOR EACH ROW EXECUTE FUNCTION public.fn_case_plan_guard();

CREATE OR REPLACE FUNCTION public.fn_caso_ativo_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pend integer;
BEGIN
  IF NEW.eixo_operacao = 'caso_ativo' AND COALESCE(OLD.eixo_operacao,'') <> 'caso_ativo' THEN
    IF NEW.onboarding_iniciado_em IS NULL THEN
      RAISE EXCEPTION 'Caso ativo exige onboarding iniciado.';
    END IF;
    SELECT count(*) INTO v_pend FROM public.onboarding_checklist
      WHERE case_id = NEW.id AND obrigatorio IS TRUE
        AND COALESCE(status,'pendente') NOT IN ('concluido','nao_aplicavel')
        AND archived_at IS NULL;
    IF v_pend > 0 THEN
      RAISE EXCEPTION 'Caso ativo bloqueado: % item(ns) obrigatório(s) do checklist de onboarding pendente(s).', v_pend;
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_caso_ativo_guard BEFORE UPDATE ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_caso_ativo_guard();

CREATE OR REPLACE FUNCTION public.fn_deliverable_publicacao_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.approval_status = 'published' THEN
    IF NEW.approved_by IS NULL OR NEW.approved_at IS NULL THEN
      RAISE EXCEPTION 'Publicação exige aprovação humana registrada.';
    END IF;
    IF NEW.summary_approved IS NULL OR btrim(NEW.summary_approved) = '' THEN
      RAISE EXCEPTION 'Publicação exige resumo sanitizado aprovado.';
    END IF;
    IF NEW.published_at IS NULL THEN NEW.published_at := now(); END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_deliverable_publicacao_guard BEFORE INSERT OR UPDATE ON public.client_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.fn_deliverable_publicacao_guard();

CREATE OR REPLACE FUNCTION public.fn_jornada_no_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Exclusão física proibida em %. Use arquivamento lógico com motivo.', TG_TABLE_NAME;
END $$;

CREATE TRIGGER trg_case_plans_no_delete BEFORE DELETE ON public.case_plans
  FOR EACH ROW EXECUTE FUNCTION public.fn_jornada_no_delete();
CREATE TRIGGER trg_case_espera_no_delete BEFORE DELETE ON public.case_espera_externa
  FOR EACH ROW EXECUTE FUNCTION public.fn_jornada_no_delete();
CREATE TRIGGER trg_onboarding_checklist_no_delete BEFORE DELETE ON public.onboarding_checklist
  FOR EACH ROW EXECUTE FUNCTION public.fn_jornada_no_delete();
