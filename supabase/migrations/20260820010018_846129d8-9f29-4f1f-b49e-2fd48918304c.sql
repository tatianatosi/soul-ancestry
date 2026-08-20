-- A. Catálogo -------------------------------------------------------------
ALTER TABLE public.product_catalog
  ADD COLUMN IF NOT EXISTS exige_case_service boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exige_justificativa_escopo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gera_comunicacao_automatica boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS regra_uso text;

INSERT INTO public.product_catalog
  (organization_id, code, nome_comercial, jornada_fase, tipo_oferta, prioridade_catalogo,
   status_homologacao, elegivel_para_proposta, condicao_comercial_padrao, escopo_aprovado,
   exige_case_service, exige_justificativa_escopo, gera_comunicacao_automatica, regra_uso)
SELECT o.id, t.code, t.nome, t.fase, t.tipo, t.prio, t.status, t.eleg, t.condicao, t.escopo,
       t.exige_cs, t.exige_just, false, t.regra
FROM public.organizations o
CROSS JOIN (VALUES
  ('CA-WPP-001','Pacote WhatsApp Essencial','acompanhamento','complemento',30,'homologado',true,
   'Conforme catálogo homologado','Canal de acompanhamento por WhatsApp dentro do escopo aprovado.',
   true,true,'Representa oferta e escopo aprovado. Não ativa mensagem automática nem automação de canal.'),
  ('CA-WPP-002','Pacote WhatsApp Premium','acompanhamento','complemento',31,'homologado',true,
   'Conforme catálogo homologado','Acompanhamento ampliado por WhatsApp dentro do escopo aprovado.',
   true,true,'Representa oferta e escopo aprovado. Não ativa mensagem automática nem automação de canal.'),
  ('CA-FAM-001','Familiar Conectado','acompanhamento','contextual',40,'homologado',true,
   'Conforme catálogo homologado','Inclusão de familiar em acompanhamento informativo do caso.',
   true,true,'Não substitui núcleo familiar, dossiê-mãe nem acompanhamento familiar de processo.'),
  ('CA-FAM-002','Familiar Conectado Plus','acompanhamento','contextual',41,'homologado',true,
   'Conforme catálogo homologado','Acompanhamento informativo ampliado para familiares.',
   true,true,'Não substitui núcleo familiar, dossiê-mãe nem acompanhamento familiar de processo.'),
  ('CA-CID-025','Acompanhamento Familiar — Processo Compartilhado','execucao','complemento',20,'homologado',true,
   'Conforme catálogo homologado','Acompanhamento de processo compartilhado do núcleo familiar.',
   true,true,'Exige núcleo familiar validado e serviço do caso. Não cria dossiê automaticamente.'),
  ('CA-ASS-001','Continuidade — Assinatura Base','pos_reconhecimento','contextual',50,'em_revisao',false,
   'Conforme catálogo homologado','Continuidade de relacionamento após entrega principal.',
   true,true,'Produto em revisão: não entra em proposta enquanto não homologado.'),
  ('CA-ASS-002','Continuidade — Assinatura Documental','pos_reconhecimento','contextual',51,'em_revisao',false,
   'Conforme catálogo homologado','Continuidade com apoio documental recorrente.',
   true,true,'Produto em revisão: não entra em proposta enquanto não homologado.'),
  ('CA-ASS-003','Continuidade — Assinatura Familiar','pos_reconhecimento','contextual',52,'em_revisao',false,
   'Conforme catálogo homologado','Continuidade para o núcleo familiar.',
   true,true,'Produto em revisão: não entra em proposta enquanto não homologado.'),
  ('CA-ASS-004','Continuidade — Assinatura Patrimônio Ancestral','pos_reconhecimento','contextual',53,'em_revisao',false,
   'Conforme catálogo homologado','Curadoria continuada do acervo ancestral.',
   true,true,'Produto em revisão: não entra em proposta enquanto não homologado.'),
  ('CA-ASS-005','Continuidade — Assinatura Concierge','pos_reconhecimento','contextual',54,'em_revisao',false,
   'Conforme catálogo homologado','Acompanhamento concierge pós-reconhecimento.',
   true,true,'Produto em revisão: não entra em proposta enquanto não homologado.')
) AS t(code, nome, fase, tipo, prio, status, eleg, condicao, escopo, exige_cs, exige_just, regra)
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_catalog p WHERE p.organization_id = o.id AND p.code = t.code
);

-- B. Blueprint paramétrico --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blueprint_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  case_service_id uuid REFERENCES public.case_services(id),
  product_catalog_id uuid REFERENCES public.product_catalog(id),
  citizenship_track_id uuid REFERENCES public.citizenship_tracks(id),
  family_id uuid REFERENCES public.nucleos_familiares(id),
  proposal_id uuid REFERENCES public.proposals(id),
  proposta_version text,
  escopo_aprovado text,
  fases_jornada jsonb NOT NULL DEFAULT '[]'::jsonb,
  entregas_previstas jsonb NOT NULL DEFAULT '[]'::jsonb,
  criterios_aceite jsonb NOT NULL DEFAULT '[]'::jsonb,
  preco_comercial_vigente numeric,
  condicao_comercial_padrao text,
  parcelas integer,
  data_vigencia date,
  origem_preco text NOT NULL DEFAULT 'product_catalog',
  excecao_comercial_id uuid REFERENCES public.sku_price_exceptions(id),
  despesas_terceiros_status text NOT NULL DEFAULT 'nao_aplicavel',
  despesas_terceiros_faixa text,
  regra_despesas text,
  link_proposta_interno text,
  conteudo_aprovado_para_proposta boolean NOT NULL DEFAULT false,
  status_preparacao text NOT NULL DEFAULT 'rascunho',
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT blueprint_origem_preco_chk CHECK (origem_preco IN ('product_catalog','excecao_comercial_aprovada')),
  CONSTRAINT blueprint_status_chk CHECK (status_preparacao IN ('rascunho','em_preparacao','pronto_para_proposta','bloqueado','arquivado'))
);

GRANT SELECT, INSERT, UPDATE ON public.blueprint_parameters TO authenticated;
GRANT ALL ON public.blueprint_parameters TO service_role;
ALTER TABLE public.blueprint_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY bp_select ON public.blueprint_parameters FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY bp_insert ON public.blueprint_parameters FOR INSERT WITH CHECK (can_write(organization_id));
CREATE POLICY bp_update ON public.blueprint_parameters FOR UPDATE USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_blueprint_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prod public.product_catalog%ROWTYPE;
  exc public.sku_price_exceptions%ROWTYPE;
BEGIN
  IF NEW.product_catalog_id IS NOT NULL THEN
    SELECT * INTO prod FROM public.product_catalog WHERE id = NEW.product_catalog_id;
    IF prod.exige_case_service AND NEW.case_service_id IS NULL THEN
      RAISE EXCEPTION 'Produto contextual/complementar exige case_service vinculado.';
    END IF;
    IF prod.exige_justificativa_escopo AND coalesce(btrim(NEW.escopo_aprovado), '') = '' THEN
      RAISE EXCEPTION 'Produto contextual/complementar exige justificativa de escopo aprovado.';
    END IF;
    IF NEW.conteudo_aprovado_para_proposta AND (prod.status_homologacao <> 'homologado' OR prod.elegivel_para_proposta IS NOT TRUE) THEN
      RAISE EXCEPTION 'Produto não homologado/não elegível não entra em proposta.';
    END IF;
  END IF;

  IF NEW.origem_preco = 'excecao_comercial_aprovada' THEN
    IF NEW.excecao_comercial_id IS NULL THEN
      RAISE EXCEPTION 'Origem de preço por exceção exige exceção comercial aprovada vinculada.';
    END IF;
    SELECT * INTO exc FROM public.sku_price_exceptions WHERE id = NEW.excecao_comercial_id;
    IF exc.id IS NULL THEN
      RAISE EXCEPTION 'Exceção comercial não encontrada.';
    END IF;
  ELSE
    IF NEW.preco_comercial_vigente IS NOT NULL THEN
      IF prod.id IS NULL THEN
        RAISE EXCEPTION 'Preço no Blueprint exige produto do catálogo homologado.';
      END IF;
      IF prod.status_homologacao <> 'homologado' THEN
        RAISE EXCEPTION 'Preço no Blueprint exige produto com homologação vigente.';
      END IF;
      IF prod.preco_comercial_vigente IS NULL OR prod.preco_comercial_vigente <> NEW.preco_comercial_vigente THEN
        RAISE EXCEPTION 'Preço manual bloqueado: use o preço comercial vigente do catálogo homologado.';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_blueprint_guard ON public.blueprint_parameters;
CREATE TRIGGER trg_blueprint_guard BEFORE INSERT OR UPDATE ON public.blueprint_parameters
FOR EACH ROW EXECUTE FUNCTION public.fn_blueprint_guard();
DROP TRIGGER IF EXISTS trg_blueprint_no_delete ON public.blueprint_parameters;
CREATE TRIGGER trg_blueprint_no_delete BEFORE DELETE ON public.blueprint_parameters
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- C. Linha do tempo operacional ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  event_type text NOT NULL,
  phase text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'registrado',
  occurred_at timestamptz,
  due_at timestamptz,
  responsible_user_id uuid,
  responsavel_nome text,
  source_entity_type text,
  source_entity_id uuid,
  next_action_id uuid,
  next_action text,
  visibility text NOT NULL DEFAULT 'interno',
  summary_internal text,
  summary_client_approved text,
  bloqueio boolean NOT NULL DEFAULT false,
  alerta text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT cte_visibility_chk CHECK (visibility IN ('interno','cliente_aprovado')),
  CONSTRAINT cte_status_chk CHECK (status IN ('previsto','em_andamento','registrado','bloqueado','cancelado'))
);
CREATE INDEX IF NOT EXISTS idx_cte_case ON public.case_timeline_events(case_id, occurred_at);

GRANT SELECT, INSERT, UPDATE ON public.case_timeline_events TO authenticated;
GRANT ALL ON public.case_timeline_events TO service_role;
ALTER TABLE public.case_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY cte_select ON public.case_timeline_events FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY cte_insert ON public.case_timeline_events FOR INSERT WITH CHECK (can_write(organization_id));
CREATE POLICY cte_update ON public.case_timeline_events FOR UPDATE USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_timeline_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.visibility = 'cliente_aprovado' AND coalesce(btrim(NEW.summary_client_approved), '') = '' THEN
    RAISE EXCEPTION 'Evento visível ao cliente exige resumo aprovado para o cliente.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_timeline_guard ON public.case_timeline_events;
CREATE TRIGGER trg_timeline_guard BEFORE INSERT OR UPDATE ON public.case_timeline_events
FOR EACH ROW EXECUTE FUNCTION public.fn_timeline_guard();
DROP TRIGGER IF EXISTS trg_timeline_no_delete ON public.case_timeline_events;
CREATE TRIGGER trg_timeline_no_delete BEFORE DELETE ON public.case_timeline_events
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- D. Fila de provisionamento Drive (sem execução externa) --------------------
CREATE TABLE IF NOT EXISTS public.drive_provisioning_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  family_id uuid REFERENCES public.nucleos_familiares(id),
  stage_trigger text NOT NULL,
  requested_structure jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_gates jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'blocked',
  approval_required boolean NOT NULL DEFAULT true,
  approved_by uuid,
  approved_at timestamptz,
  external_result_reference text,
  error_message text,
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT dpq_status_chk CHECK (status IN ('blocked','ready_for_review','approved','executed','failed','cancelled'))
);

GRANT SELECT, INSERT, UPDATE ON public.drive_provisioning_queue TO authenticated;
GRANT ALL ON public.drive_provisioning_queue TO service_role;
ALTER TABLE public.drive_provisioning_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY dpq_select ON public.drive_provisioning_queue FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY dpq_insert ON public.drive_provisioning_queue FOR INSERT WITH CHECK (can_write(organization_id));
CREATE POLICY dpq_update ON public.drive_provisioning_queue FOR UPDATE USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_drive_queue_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE c public.crm_casos%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.crm_casos WHERE id = NEW.case_id;
  IF NEW.stage_trigger = 'oportunidade' AND NEW.status <> 'blocked' THEN
    RAISE EXCEPTION 'Oportunidade não provisiona dossiê: item permanece bloqueado.';
  END IF;
  IF NEW.stage_trigger = 'confirmacao_formal' AND NEW.status NOT IN ('blocked','cancelled') THEN
    RAISE EXCEPTION 'Confirmação formal só cria item de fila bloqueado.';
  END IF;
  IF NEW.status IN ('ready_for_review','approved','executed')
     AND NOT (coalesce(c.contrato_assinado,false) AND coalesce(c.pagamento_confirmado,false)) THEN
    RAISE EXCEPTION 'Fila do Drive exige contrato assinado e pagamento confirmado.';
  END IF;
  IF NEW.status IN ('approved','executed') AND NEW.approval_required AND NEW.approved_by IS NULL THEN
    RAISE EXCEPTION 'Execução exige confirmação humana registrada.';
  END IF;
  IF NEW.status = 'executed' AND coalesce(btrim(NEW.external_result_reference), '') = '' THEN
    RAISE EXCEPTION 'Execução registrada exige referência do resultado externo.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_dpq_guard ON public.drive_provisioning_queue;
CREATE TRIGGER trg_dpq_guard BEFORE INSERT OR UPDATE ON public.drive_provisioning_queue
FOR EACH ROW EXECUTE FUNCTION public.fn_drive_queue_guard();
DROP TRIGGER IF EXISTS trg_dpq_no_delete ON public.drive_provisioning_queue;
CREATE TRIGGER trg_dpq_no_delete BEFORE DELETE ON public.drive_provisioning_queue
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();