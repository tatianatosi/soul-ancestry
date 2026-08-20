-- =========================================================
-- G-07 — Plano de ação de pesquisa, instituições e previsão de terceiros
-- Nenhuma ação externa: sem envio, sem despesa, sem cobrança, sem calendário.
-- =========================================================

-- 1) INSTITUIÇÕES (referência reutilizável por organização)
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  institution_type text NOT NULL DEFAULT 'outro',
  country text,
  city text,
  email text,
  phone text,
  opening_hours text,
  preferred_channel text NOT NULL DEFAULT 'nao_definido',
  operational_instruction text,
  contact_source text,
  last_verified_at timestamptz,
  verified_by uuid,
  update_status text NOT NULL DEFAULT 'nao_verificado',
  notes_internal text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  data_origin text NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT institutions_type_chk CHECK (institution_type = ANY (ARRAY['cartorio','arquivo_publico','arquivo_eclesiastico','paroquia','consulado','embaixada','orgao_estatal','biblioteca','museu','tradutor','apostilamento','pesquisador_local','outro'])),
  CONSTRAINT institutions_channel_chk CHECK (preferred_channel = ANY (ARRAY['nao_definido','email','telefone','presencial','portal_web','correio','whatsapp','intermediario'])),
  CONSTRAINT institutions_update_chk CHECK (update_status = ANY (ARRAY['nao_verificado','verificado','desatualizado','invalido'])),
  CONSTRAINT institutions_origin_chk CHECK (data_origin = ANY (ARRAY['real','fixture_demo','importado','migrado']))
);
CREATE UNIQUE INDEX institutions_nome_org_idx ON public.institutions (organization_id, lower(name), coalesce(lower(city),''), coalesce(lower(country),''));

GRANT SELECT, INSERT, UPDATE ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY institutions_sel ON public.institutions FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY institutions_ins ON public.institutions FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY institutions_upd ON public.institutions FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- 2) INTERAÇÕES DE CRM (imutáveis)
CREATE TABLE public.crm_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  origem text NOT NULL DEFAULT 'plano_acao_pesquisa',
  origem_id uuid,
  canal text NOT NULL DEFAULT 'desk_only',
  direcao text NOT NULL DEFAULT 'interno',
  resumo_interno text NOT NULL,
  ocorrido_em timestamptz NOT NULL DEFAULT now(),
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  data_origin text NOT NULL DEFAULT 'real',
  CONSTRAINT crm_interactions_origin_chk CHECK (data_origin = ANY (ARRAY['real','fixture_demo','importado','migrado']))
);
GRANT SELECT, INSERT ON public.crm_interactions TO authenticated;
GRANT ALL ON public.crm_interactions TO service_role;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_interactions_sel ON public.crm_interactions FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY crm_interactions_ins ON public.crm_interactions FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_crm_interaction_imutavel()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'INTERACAO_IMUTAVEL: registro de interação de CRM não pode ser alterado nem excluído.';
END; $$;
CREATE TRIGGER crm_interactions_imutavel BEFORE UPDATE OR DELETE ON public.crm_interactions
  FOR EACH ROW EXECUTE FUNCTION public.fn_crm_interaction_imutavel();

-- 3) PLANO DE AÇÃO DE PESQUISA
CREATE TABLE public.research_action_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  research_item_id uuid,
  document_request_id uuid REFERENCES public.document_requests(id),
  evidence_id uuid REFERENCES public.evidences(id),
  finding_id uuid REFERENCES public.genealogical_findings(id),
  institution_id uuid REFERENCES public.institutions(id),
  action_type text NOT NULL,
  titulo text NOT NULL,
  priority text NOT NULL DEFAULT 'media',
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'planejada',
  due_date date,
  responsible_user_id uuid,
  suggested_channel text NOT NULL DEFAULT 'desk_only',
  communication_draft text,
  communication_queue_id uuid REFERENCES public.communication_queue(id),
  requires_human_approval boolean NOT NULL DEFAULT true,
  contacted_at timestamptz,
  contact_result_internal text,
  next_action text,
  next_check_at date,
  estimated_cost_amount numeric(14,2),
  estimated_cost_currency text NOT NULL DEFAULT 'BRL',
  expense_approval_status text NOT NULL DEFAULT 'nao_aplicavel',
  payer text NOT NULL DEFAULT 'nao_definido',
  internal_evidence_link text,
  notes_internal text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  data_origin text NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT rapi_action_chk CHECK (action_type = ANY (ARRAY['consulta_acervo_interno','solicitacao_documento','contato_institucional','visita_presencial','pesquisa_em_campo','traducao','apostilamento','conferencia_documental','revisao_interna','organizacao_de_evidencias','preparacao_de_pedido','outro'])),
  CONSTRAINT rapi_priority_chk CHECK (priority = ANY (ARRAY['critica','alta','media','baixa'])),
  CONSTRAINT rapi_status_chk CHECK (status = ANY (ARRAY['planejada','pronta_para_revisao','aguardando_aprovacao','aprovada','realizada','aguardando_resposta','concluida','cancelada'])),
  CONSTRAINT rapi_channel_chk CHECK (suggested_channel = ANY (ARRAY['desk_only','email','telefone','presencial','portal_web','correio','whatsapp','intermediario'])),
  CONSTRAINT rapi_expense_chk CHECK (expense_approval_status = ANY (ARRAY['nao_aplicavel','nao_submetida','aguardando_aprovacao','aprovada','recusada'])),
  CONSTRAINT rapi_payer_chk CHECK (payer = ANY (ARRAY['nao_definido','cliente','clube','terceiro'])),
  CONSTRAINT rapi_origin_chk CHECK (data_origin = ANY (ARRAY['real','fixture_demo','importado','migrado']))
);
CREATE INDEX rapi_caso_idx ON public.research_action_plan_items (case_id, status, priority);

GRANT SELECT, INSERT, UPDATE ON public.research_action_plan_items TO authenticated;
GRANT ALL ON public.research_action_plan_items TO service_role;
ALTER TABLE public.research_action_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY rapi_sel ON public.research_action_plan_items FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY rapi_ins ON public.research_action_plan_items FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY rapi_upd ON public.research_action_plan_items FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- 4) PREVISÃO DE TERCEIROS
CREATE TABLE public.expense_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  research_action_plan_item_id uuid REFERENCES public.research_action_plan_items(id),
  institution_id uuid REFERENCES public.institutions(id),
  expense_type text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price_min numeric(14,2),
  unit_price_max numeric(14,2),
  estimated_total_min numeric(14,2),
  estimated_total_max numeric(14,2),
  currency text NOT NULL DEFAULT 'BRL',
  estimated_wait_days_min integer,
  estimated_wait_days_max integer,
  estimate_source text NOT NULL DEFAULT 'estimativa_interna',
  client_approval_status text NOT NULL DEFAULT 'nao_submetida',
  payer text NOT NULL DEFAULT 'cliente',
  notes_internal text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  data_origin text NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT ee_type_chk CHECK (expense_type = ANY (ARRAY['taxa_cartorio','emolumento','certidao','busca_documental','traducao_juramentada','apostilamento','envio_postal','pesquisador_local','taxa_consular','deslocamento','outro'])),
  CONSTRAINT ee_source_chk CHECK (estimate_source = ANY (ARRAY['tabela_publicada','informacao_institucional','historico_de_casos','estimativa_interna'])),
  CONSTRAINT ee_approval_chk CHECK (client_approval_status = ANY (ARRAY['nao_submetida','aguardando_aprovacao','aprovada','recusada'])),
  CONSTRAINT ee_payer_chk CHECK (payer = ANY (ARRAY['cliente','clube','terceiro'])),
  CONSTRAINT ee_origin_chk CHECK (data_origin = ANY (ARRAY['real','fixture_demo','importado','migrado']))
);
CREATE INDEX ee_caso_idx ON public.expense_estimates (case_id);

GRANT SELECT, INSERT, UPDATE ON public.expense_estimates TO authenticated;
GRANT ALL ON public.expense_estimates TO service_role;
ALTER TABLE public.expense_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY ee_sel ON public.expense_estimates FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY ee_ins ON public.expense_estimates FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY ee_upd ON public.expense_estimates FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- 5) TRAVAS
CREATE OR REPLACE FUNCTION public.fn_g07_institution_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_BLOQUEADA: instituição só pode ser arquivada.';
  END IF;
  IF coalesce(btrim(NEW.name),'') = '' THEN
    RAISE EXCEPTION 'INSTITUICAO_SEM_NOME: informe o nome da instituição.';
  END IF;
  IF NEW.update_status = 'verificado' AND (NEW.last_verified_at IS NULL OR coalesce(btrim(NEW.contact_source),'') = '') THEN
    RAISE EXCEPTION 'VERIFICACAO_INCOMPLETA: contato verificado exige fonte do contato e data da verificação.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER institutions_guard BEFORE INSERT OR UPDATE OR DELETE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.fn_g07_institution_guard();

CREATE OR REPLACE FUNCTION public.fn_g07_plan_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_org uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_BLOQUEADA: item do plano de ação só pode ser arquivado ou cancelado.';
  END IF;

  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL OR v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'CASO_FORA_DA_ORGANIZACAO: item precisa pertencer ao caso da mesma organização.';
  END IF;

  IF coalesce(btrim(NEW.reason),'') = '' THEN
    RAISE EXCEPTION 'ACAO_SEM_MOTIVO: descreva por que a ação é necessária.';
  END IF;

  -- Aprovação humana é padrão e não pode ser desligada.
  IF NEW.requires_human_approval IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'APROVACAO_HUMANA_OBRIGATORIA: toda ação do plano exige revisão humana.';
  END IF;

  -- Instituição é referência reutilizável da mesma organização.
  IF NEW.institution_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.institutions i WHERE i.id = NEW.institution_id AND i.organization_id = NEW.organization_id) THEN
      RAISE EXCEPTION 'INSTITUICAO_INVALIDA: use uma instituição cadastrada na mesma organização.';
    END IF;
  END IF;

  -- Canal externo exige instituição de referência (não duplicar contato na tarefa).
  IF NEW.suggested_channel <> 'desk_only' AND NEW.institution_id IS NULL AND NEW.action_type IN ('contato_institucional','visita_presencial','solicitacao_documento') THEN
    RAISE EXCEPTION 'CONTATO_SEM_INSTITUICAO: vincule a instituição de referência em vez de repetir contatos na tarefa.';
  END IF;

  -- Aguardando resposta exige rechecagem.
  IF NEW.status = 'aguardando_resposta' AND NEW.next_check_at IS NULL THEN
    RAISE EXCEPTION 'RECHECAGEM_OBRIGATORIA: item aguardando resposta exige data de próxima rechecagem.';
  END IF;

  -- Ação realizada exige registro interno do resultado.
  IF NEW.status IN ('realizada','concluida') AND coalesce(btrim(NEW.contact_result_internal),'') = '' THEN
    RAISE EXCEPTION 'RESULTADO_INTERNO_OBRIGATORIO: registre o resultado interno da ação realizada.';
  END IF;
  IF NEW.status IN ('realizada','concluida') AND NEW.contacted_at IS NULL THEN
    NEW.contacted_at := now();
  END IF;

  -- Estimativa de terceiro não é cobrança nem caixa do Clube.
  IF NEW.estimated_cost_amount IS NOT NULL AND NEW.estimated_cost_amount < 0 THEN
    RAISE EXCEPTION 'ESTIMATIVA_INVALIDA: previsão de custo não pode ser negativa.';
  END IF;
  IF NEW.expense_approval_status = 'aprovada' AND NEW.payer = 'nao_definido' THEN
    RAISE EXCEPTION 'PAGADOR_NAO_DEFINIDO: defina quem paga antes de aprovar a previsão.';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER rapi_guard BEFORE INSERT OR UPDATE OR DELETE ON public.research_action_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_g07_plan_guard();

-- Pós-gravação: alerta crítico, rascunho de comunicação e interação imutável.
CREATE OR REPLACE FUNCTION public.fn_g07_plan_pos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_comm uuid;
BEGIN
  -- Regra: prioridade crítica com prazo hoje/vencido gera alerta imediato no Desk.
  IF NEW.priority = 'critica'
     AND NEW.due_date IS NOT NULL
     AND NEW.due_date <= current_date
     AND NEW.status NOT IN ('concluida','cancelada')
     AND NEW.archived_at IS NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.case_alerts a
      WHERE a.case_id = NEW.case_id AND a.tipo = 'plano_acao_critico'
        AND a.status = 'pending' AND a.detalhe = NEW.id::text
    ) THEN
      INSERT INTO public.case_alerts (organization_id, case_id, tipo, criticidade, titulo, detalhe, status, due_at, data_origin)
      VALUES (NEW.organization_id, NEW.case_id, 'plano_acao_critico', 'critico',
              'Ação crítica de pesquisa vencida ou para hoje: ' || NEW.titulo,
              NEW.id::text, 'pending', (NEW.due_date::timestamptz), NEW.data_origin);
    END IF;
  END IF;

  -- Regra: comunicação externa só existe como rascunho na fila, com aprovação humana.
  IF NEW.communication_draft IS NOT NULL AND btrim(NEW.communication_draft) <> ''
     AND NEW.communication_queue_id IS NULL THEN
    INSERT INTO public.communication_queue
      (organization_id, case_id, acao_codigo, target_audience, visibility, suggested_channel,
       assunto, corpo_rascunho, status, requires_human_approval, observacao_interna, data_origin)
    VALUES (NEW.organization_id, NEW.case_id, 'g07_plano_acao', 'interno_tatiana', 'internal_only',
            CASE WHEN NEW.suggested_channel = 'desk_only' THEN 'desk_only' ELSE NEW.suggested_channel END,
            NEW.titulo, NEW.communication_draft, 'draft_created', true,
            'Rascunho gerado pelo plano de ação G-07. Nenhum envio automático.', NEW.data_origin)
    RETURNING id INTO v_comm;
    UPDATE public.research_action_plan_items SET communication_queue_id = v_comm WHERE id = NEW.id;
  END IF;

  -- Regra: ação realizada registra interação imutável de CRM (sem contato externo automático).
  IF NEW.status IN ('realizada','concluida')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.crm_interactions
      (organization_id, case_id, origem, origem_id, canal, direcao, resumo_interno, ocorrido_em, registrado_por, data_origin)
    VALUES (NEW.organization_id, NEW.case_id, 'plano_acao_pesquisa', NEW.id,
            NEW.suggested_channel, 'interno', NEW.contact_result_internal,
            coalesce(NEW.contacted_at, now()), NEW.updated_by, NEW.data_origin);
  END IF;

  RETURN NULL;
END; $$;
CREATE TRIGGER rapi_pos AFTER INSERT OR UPDATE ON public.research_action_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_g07_plan_pos();

CREATE OR REPLACE FUNCTION public.fn_g07_estimate_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_org uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_BLOQUEADA: previsão de terceiro só pode ser arquivada.';
  END IF;

  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL OR v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'CASO_FORA_DA_ORGANIZACAO: previsão precisa pertencer ao caso da mesma organização.';
  END IF;

  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'QUANTIDADE_INVALIDA: informe quantidade maior que zero.';
  END IF;
  IF NEW.unit_price_min IS NOT NULL AND NEW.unit_price_max IS NOT NULL AND NEW.unit_price_min > NEW.unit_price_max THEN
    RAISE EXCEPTION 'FAIXA_INVALIDA: preço mínimo não pode ser maior que o máximo.';
  END IF;
  IF NEW.estimated_wait_days_min IS NOT NULL AND NEW.estimated_wait_days_max IS NOT NULL
     AND NEW.estimated_wait_days_min > NEW.estimated_wait_days_max THEN
    RAISE EXCEPTION 'PRAZO_INVALIDO: prazo mínimo não pode ser maior que o máximo.';
  END IF;

  -- Totais são derivados: previsão, nunca lançamento financeiro.
  NEW.estimated_total_min := round(coalesce(NEW.unit_price_min, 0) * NEW.quantity, 2);
  NEW.estimated_total_max := round(coalesce(NEW.unit_price_max, NEW.unit_price_min, 0) * NEW.quantity, 2);

  IF NEW.client_approval_status = 'aprovada' AND coalesce(btrim(NEW.estimate_source),'') = '' THEN
    RAISE EXCEPTION 'ORIGEM_DA_ESTIMATIVA_OBRIGATORIA: informe a origem antes de registrar aprovação.';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER ee_guard BEFORE INSERT OR UPDATE OR DELETE ON public.expense_estimates
  FOR EACH ROW EXECUTE FUNCTION public.fn_g07_estimate_guard();