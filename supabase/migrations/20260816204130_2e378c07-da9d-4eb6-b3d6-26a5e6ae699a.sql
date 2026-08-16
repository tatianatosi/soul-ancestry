
-- ============ 1. Modelos de checklist por tipo de serviço e fase ============
CREATE TABLE public.quality_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tipo_servico text NOT NULL DEFAULT '*',
  fase text NOT NULL DEFAULT '*',
  item_key text NOT NULL,
  label text NOT NULL,
  descricao text,
  obrigatorio boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, tipo_servico, fase, item_key)
);
GRANT SELECT, INSERT, UPDATE ON public.quality_checklist_templates TO authenticated;
GRANT ALL ON public.quality_checklist_templates TO service_role;
ALTER TABLE public.quality_checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_templates_read" ON public.quality_checklist_templates
  FOR SELECT TO authenticated USING (public.is_staff_ativo(organization_id));
CREATE POLICY "checklist_templates_write" ON public.quality_checklist_templates
  FOR INSERT TO authenticated WITH CHECK (public.staff_meu_papel(organization_id) IN ('admin','operacoes'));
CREATE POLICY "checklist_templates_update" ON public.quality_checklist_templates
  FOR UPDATE TO authenticated USING (public.staff_meu_papel(organization_id) IN ('admin','operacoes'))
  WITH CHECK (public.staff_meu_papel(organization_id) IN ('admin','operacoes'));

CREATE TRIGGER trg_qct_meta BEFORE UPDATE ON public.quality_checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_qct_no_delete BEFORE DELETE ON public.quality_checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- ============ 2. Itens de checklist por caso ============
CREATE TABLE public.case_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.quality_checklist_templates(id),
  item_key text NOT NULL,
  label text NOT NULL,
  fase text NOT NULL DEFAULT '*',
  tipo_servico text NOT NULL DEFAULT '*',
  obrigatorio boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  observacao text,
  evidencia_url text,
  concluido_por uuid,
  concluido_em timestamptz,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT case_checklist_status_chk CHECK (status IN ('pendente','cumprido','nao_aplicavel')),
  UNIQUE (case_id, item_key)
);
GRANT SELECT, INSERT, UPDATE ON public.case_checklist_items TO authenticated;
GRANT ALL ON public.case_checklist_items TO service_role;
ALTER TABLE public.case_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_checklist_read" ON public.case_checklist_items
  FOR SELECT TO authenticated USING (public.is_staff_ativo(organization_id));
CREATE POLICY "case_checklist_insert" ON public.case_checklist_items
  FOR INSERT TO authenticated WITH CHECK (public.is_staff_ativo(organization_id));
CREATE POLICY "case_checklist_update" ON public.case_checklist_items
  FOR UPDATE TO authenticated USING (public.is_staff_ativo(organization_id))
  WITH CHECK (public.is_staff_ativo(organization_id));

CREATE OR REPLACE FUNCTION public.fn_checklist_item_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'cumprido' THEN
    IF NEW.concluido_por IS NULL THEN NEW.concluido_por := auth.uid(); END IF;
    IF NEW.concluido_em IS NULL THEN NEW.concluido_em := now(); END IF;
  ELSIF NEW.status = 'nao_aplicavel' THEN
    IF NEW.observacao IS NULL OR length(btrim(NEW.observacao)) < 10 THEN
      RAISE EXCEPTION 'Marcar item como não aplicável exige justificativa com ao menos 10 caracteres.';
    END IF;
    IF NEW.concluido_por IS NULL THEN NEW.concluido_por := auth.uid(); END IF;
    IF NEW.concluido_em IS NULL THEN NEW.concluido_em := now(); END IF;
  ELSE
    NEW.concluido_por := NULL;
    NEW.concluido_em := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_checklist_item_guard BEFORE INSERT OR UPDATE ON public.case_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_checklist_item_guard();
CREATE TRIGGER trg_checklist_no_delete BEFORE DELETE ON public.case_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- ============ 3. Inconsistências ============
CREATE TABLE public.quality_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  regra_key text NOT NULL,
  dominio text NOT NULL,
  severidade text NOT NULL,
  entidade text NOT NULL,
  entidade_id uuid NOT NULL,
  case_id uuid REFERENCES public.crm_casos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  detalhe text,
  status text NOT NULL DEFAULT 'aberta',
  bloqueia_ativacao boolean NOT NULL DEFAULT false,
  exige_suspensao boolean NOT NULL DEFAULT false,
  detectada_em timestamptz NOT NULL DEFAULT now(),
  vista_em timestamptz,
  reconhecida_por uuid,
  reconhecida_em timestamptz,
  resolucao_comentario text,
  resolucao_evidencia text,
  resolvida_por uuid,
  resolvida_em timestamptz,
  sanada_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quality_issues_sev_chk CHECK (severidade IN ('critica','alta','media','baixa')),
  CONSTRAINT quality_issues_status_chk CHECK (status IN ('aberta','reconhecida','resolvida','falso_positivo','sanada')),
  UNIQUE (organization_id, regra_key, entidade, entidade_id)
);
GRANT SELECT, UPDATE ON public.quality_issues TO authenticated;
GRANT ALL ON public.quality_issues TO service_role;
ALTER TABLE public.quality_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quality_issues_read" ON public.quality_issues
  FOR SELECT TO authenticated USING (public.is_staff_ativo(organization_id));
CREATE POLICY "quality_issues_update" ON public.quality_issues
  FOR UPDATE TO authenticated USING (public.staff_meu_papel(organization_id) IN ('admin','operacoes'))
  WITH CHECK (public.staff_meu_papel(organization_id) IN ('admin','operacoes'));

CREATE INDEX idx_quality_issues_org_status ON public.quality_issues (organization_id, status, severidade);
CREATE INDEX idx_quality_issues_case ON public.quality_issues (case_id);

CREATE OR REPLACE FUNCTION public.fn_quality_issue_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- campos de detecção são imutáveis: não é possível "ocultar" a inconsistência
  NEW.regra_key := OLD.regra_key;
  NEW.severidade := OLD.severidade;
  NEW.entidade := OLD.entidade;
  NEW.entidade_id := OLD.entidade_id;
  NEW.organization_id := OLD.organization_id;
  NEW.detectada_em := OLD.detectada_em;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'sanada' AND NEW.status <> 'sanada' THEN
      RAISE EXCEPTION 'Inconsistência já sanada pela varredura não pode mudar de estado.';
    END IF;
    IF NEW.status = 'reconhecida' THEN
      NEW.reconhecida_por := COALESCE(NEW.reconhecida_por, auth.uid());
      NEW.reconhecida_em := now();
      IF NEW.resolucao_comentario IS NULL OR length(btrim(NEW.resolucao_comentario)) < 10 THEN
        RAISE EXCEPTION 'Reconhecer a inconsistência exige comentário com ao menos 10 caracteres.';
      END IF;
    ELSIF NEW.status IN ('resolvida','falso_positivo') THEN
      IF NEW.resolucao_comentario IS NULL OR length(btrim(NEW.resolucao_comentario)) < 10 THEN
        RAISE EXCEPTION 'Resolver ou marcar falso positivo exige justificativa com ao menos 10 caracteres.';
      END IF;
      IF NEW.severidade IN ('critica','alta')
         AND NEW.status = 'resolvida'
         AND (NEW.resolucao_evidencia IS NULL OR length(btrim(NEW.resolucao_evidencia)) = 0) THEN
        RAISE EXCEPTION 'Inconsistências críticas e altas exigem evidência da resolução.';
      END IF;
      NEW.resolvida_por := COALESCE(NEW.resolvida_por, auth.uid());
      NEW.resolvida_em := now();
    ELSIF NEW.status = 'aberta' THEN
      NULL;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_quality_issue_guard BEFORE UPDATE ON public.quality_issues
  FOR EACH ROW EXECUTE FUNCTION public.fn_quality_issue_guard();
CREATE TRIGGER trg_quality_issue_no_delete BEFORE DELETE ON public.quality_issues
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_quality_issue_audit AFTER UPDATE ON public.quality_issues
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();

-- ============ 4. Exportações auditadas ============
CREATE TABLE public.quality_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conjunto text NOT NULL,
  campos text[] NOT NULL,
  filtros jsonb NOT NULL DEFAULT '{}'::jsonb,
  linhas integer NOT NULL DEFAULT 0,
  exportado_por uuid NOT NULL,
  exportado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quality_exports TO authenticated;
GRANT ALL ON public.quality_exports TO service_role;
ALTER TABLE public.quality_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quality_exports_read" ON public.quality_exports
  FOR SELECT TO authenticated USING (public.is_staff_ativo(organization_id));
CREATE POLICY "quality_exports_insert" ON public.quality_exports
  FOR INSERT TO authenticated
  WITH CHECK (public.staff_meu_papel(organization_id) = 'admin' AND exportado_por = auth.uid());
CREATE TRIGGER trg_quality_exports_no_delete BEFORE DELETE ON public.quality_exports
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- ============ 5. Varredura de qualidade ============
CREATE OR REPLACE FUNCTION public.quality_scan(_org uuid)
RETURNS TABLE(criadas integer, sanadas integer, abertas integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_criadas integer := 0;
  v_sanadas integer := 0;
  v_abertas integer := 0;
BEGIN
  IF NOT public.is_staff_ativo(_org) THEN
    RAISE EXCEPTION 'Acesso interno não autorizado.';
  END IF;

  CREATE TEMP TABLE _achados (
    regra_key text, dominio text, severidade text, entidade text, entidade_id uuid,
    case_id uuid, titulo text, detalhe text
  ) ON COMMIT DROP;

  -- CRM / onboarding: caso ativo sem responsável (crítica)
  INSERT INTO _achados
  SELECT 'caso_sem_responsavel','crm','critica','caso',c.id,c.id,
         'Caso ativo sem responsável',
         'O caso '||c.codigo||' está ativo e não possui responsável designado.'
  FROM crm_casos c
  WHERE c.organization_id = _org AND c.archived_at IS NULL
    AND (c.status = 'ativo' OR c.ativo IS TRUE) AND c.responsavel_id IS NULL;

  -- Privacidade: caso ativo sem consentimento ativo (crítica)
  INSERT INTO _achados
  SELECT 'caso_sem_consentimento','privacidade','critica','caso',c.id,c.id,
         'Caso ativo sem consentimento ativo',
         'O caso '||c.codigo||' está ativo sem consentimento vigente nem exceção formal registrada.'
  FROM crm_casos c
  WHERE c.organization_id = _org AND c.archived_at IS NULL
    AND (c.status = 'ativo' OR c.ativo IS TRUE)
    AND NOT EXISTS (
      SELECT 1 FROM consent_records r
      WHERE r.organization_id = _org AND r.archived_at IS NULL
        AND r.status = 'ativo' AND r.revogado_em IS NULL
        AND (r.case_id = c.id OR (r.case_id IS NULL AND r.client_id = c.cliente_id))
    )
    AND NOT EXISTS (
      SELECT 1 FROM consent_exceptions e
      WHERE e.case_id = c.id AND e.archived_at IS NULL
    );

  -- Entrega: caso ativo sem ordem de serviço pronta ou em execução (alta)
  INSERT INTO _achados
  SELECT 'caso_sem_ordem_servico','entrega','alta','caso',c.id,c.id,
         'Caso ativo sem ordem de serviço pronta',
         'O caso '||c.codigo||' está ativo e não possui ordem de serviço pronta ou em execução.'
  FROM crm_casos c
  WHERE c.organization_id = _org AND c.archived_at IS NULL
    AND (c.status = 'ativo' OR c.ativo IS TRUE)
    AND NOT EXISTS (
      SELECT 1 FROM service_orders o
      WHERE o.case_id = c.id AND o.archived_at IS NULL
        AND o.status IN ('approved','active')
    );

  -- Contrato: caso ativo sem contrato assinado (crítica)
  INSERT INTO _achados
  SELECT 'caso_sem_contrato','contrato','critica','caso',c.id,c.id,
         'Caso ativo sem contrato assinado',
         'O caso '||c.codigo||' está ativo sem contrato assinado registrado.'
  FROM crm_casos c
  WHERE c.organization_id = _org AND c.archived_at IS NULL
    AND (c.status = 'ativo' OR c.ativo IS TRUE)
    AND COALESCE(c.contrato_assinado, false) = false;

  -- Pagamento divergente (alta)
  INSERT INTO _achados
  SELECT 'pagamento_divergente','pagamento','alta','pagamento',p.id,i.case_id,
         'Pagamento divergente',
         'Pagamento de '||COALESCE(p.valor::text,'valor não informado')||' está com conciliação divergente.'
  FROM payments p
  LEFT JOIN invoices i ON i.id = p.invoice_id
  WHERE p.organization_id = _org AND p.archived_at IS NULL
    AND p.conciliacao_status = 'divergente';

  INSERT INTO _achados
  SELECT 'fatura_divergente','pagamento','alta','fatura',i.id,i.case_id,
         'Fatura com conciliação divergente',
         'A fatura '||COALESCE(i.numero,'sem número')||' está com conciliação divergente.'
  FROM invoices i
  WHERE i.organization_id = _org AND i.archived_at IS NULL
    AND i.conciliacao_status = 'divergente';

  -- Evidência validada sem fonte (alta)
  INSERT INTO _achados
  SELECT 'evidencia_sem_fonte','evidencia','alta','evidencia',e.id,e.caso_id,
         'Evidência validada sem fonte',
         'A evidência "'||e.titulo||'" está marcada como validada sem fonte registrada.'
  FROM evidencias e
  WHERE e.organization_id = _org AND e.archived_at IS NULL
    AND e.status = 'validada'
    AND (e.fonte IS NULL OR length(btrim(e.fonte)) = 0);

  -- Tarefa vencida (média)
  INSERT INTO _achados
  SELECT 'tarefa_vencida','entrega','media','tarefa',t.id,t.caso_id,
         'Tarefa vencida',
         'A tarefa "'||t.titulo||'" venceu em '||to_char(t.prazo,'DD/MM/YYYY')||' e continua em aberto.'
  FROM tarefas t
  WHERE t.organization_id = _org AND t.archived_at IS NULL
    AND t.prazo IS NOT NULL AND t.prazo < current_date
    AND t.status NOT IN ('concluida','cancelada');

  -- Cliente com dado obrigatório ausente (média)
  INSERT INTO _achados
  SELECT 'cliente_dado_obrigatorio','crm','media','cliente',cl.id,NULL,
         'Cliente com dado obrigatório ausente',
         'Cliente '||cl.nome||' sem: '||array_to_string(ARRAY_REMOVE(ARRAY[
            CASE WHEN cl.email IS NULL OR length(btrim(cl.email))=0 THEN 'e-mail' END,
            CASE WHEN cl.telefone IS NULL OR length(btrim(cl.telefone))=0 THEN 'telefone' END,
            CASE WHEN cl.documento IS NULL OR length(btrim(cl.documento))=0 THEN 'documento' END
         ], NULL), ', ')||'.'
  FROM clientes cl
  WHERE cl.organization_id = _org AND cl.archived_at IS NULL
    AND (cl.email IS NULL OR length(btrim(cl.email))=0
      OR cl.telefone IS NULL OR length(btrim(cl.telefone))=0
      OR cl.documento IS NULL OR length(btrim(cl.documento))=0);

  -- Caso ativo sem próxima ação definida (baixa)
  INSERT INTO _achados
  SELECT 'caso_sem_proxima_acao','crm','baixa','caso',c.id,c.id,
         'Caso ativo sem próxima ação',
         'O caso '||c.codigo||' está ativo sem próxima ação registrada.'
  FROM crm_casos c
  WHERE c.organization_id = _org AND c.archived_at IS NULL
    AND (c.status = 'ativo' OR c.ativo IS TRUE)
    AND (c.proxima_acao IS NULL OR length(btrim(c.proxima_acao)) = 0);

  -- Checklist obrigatório pendente em caso ativo (baixa)
  INSERT INTO _achados
  SELECT DISTINCT 'checklist_pendente','entrega','baixa','caso',c.id,c.id,
         'Checklist obrigatório pendente',
         'O caso '||c.codigo||' possui itens obrigatórios de checklist ainda pendentes.'
  FROM crm_casos c
  JOIN case_checklist_items k ON k.case_id = c.id AND k.archived_at IS NULL
  WHERE c.organization_id = _org AND c.archived_at IS NULL
    AND (c.status = 'ativo' OR c.ativo IS TRUE)
    AND k.obrigatorio AND k.status = 'pendente';

  -- Grava / reabre
  INSERT INTO quality_issues AS q
    (organization_id, regra_key, dominio, severidade, entidade, entidade_id, case_id,
     titulo, detalhe, bloqueia_ativacao, exige_suspensao)
  SELECT _org, a.regra_key, a.dominio, a.severidade, a.entidade, a.entidade_id, a.case_id,
         a.titulo, a.detalhe,
         a.severidade = 'critica',
         a.severidade = 'critica' AND EXISTS (
           SELECT 1 FROM crm_casos c2
           WHERE c2.id = a.case_id AND (c2.status = 'ativo' OR c2.ativo IS TRUE)
         )
  FROM _achados a
  ON CONFLICT (organization_id, regra_key, entidade, entidade_id) DO UPDATE
    SET detalhe = EXCLUDED.detalhe,
        case_id = EXCLUDED.case_id,
        bloqueia_ativacao = EXCLUDED.bloqueia_ativacao,
        exige_suspensao = EXCLUDED.exige_suspensao,
        sanada_em = NULL,
        status = CASE WHEN q.status IN ('sanada','resolvida') THEN 'aberta' ELSE q.status END,
        detectada_em = CASE WHEN q.status IN ('sanada','resolvida') THEN now() ELSE q.detectada_em END,
        updated_at = now();
  GET DIAGNOSTICS v_criadas = ROW_COUNT;

  UPDATE quality_issues q
     SET status = 'sanada', sanada_em = now(), updated_at = now()
   WHERE q.organization_id = _org
     AND q.status IN ('aberta','reconhecida')
     AND NOT EXISTS (
       SELECT 1 FROM _achados a
       WHERE a.regra_key = q.regra_key AND a.entidade = q.entidade AND a.entidade_id = q.entidade_id
     );
  GET DIAGNOSTICS v_sanadas = ROW_COUNT;

  SELECT count(*) INTO v_abertas FROM quality_issues
   WHERE organization_id = _org AND status IN ('aberta','reconhecida');

  RETURN QUERY SELECT v_criadas, v_sanadas, v_abertas;
END; $$;

REVOKE ALL ON FUNCTION public.quality_scan(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.quality_scan(uuid) TO authenticated, service_role;

-- ============ 6. Trava de ativação por inconsistência crítica ============
CREATE OR REPLACE FUNCTION public.fn_quality_guard_ativacao()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_bloqueios text;
BEGIN
  IF (NEW.status = 'ativo' OR NEW.ativo IS TRUE)
     AND (TG_OP = 'INSERT' OR (COALESCE(OLD.status,'') <> 'ativo' AND COALESCE(OLD.ativo,false) = false)) THEN
    SELECT string_agg(titulo, '; ') INTO v_bloqueios
      FROM quality_issues
     WHERE case_id = NEW.id AND severidade = 'critica'
       AND status IN ('aberta','reconhecida');
    IF v_bloqueios IS NOT NULL THEN
      RAISE EXCEPTION 'Ativação bloqueada por inconsistências críticas em aberto: %', v_bloqueios;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_quality_guard_ativacao BEFORE INSERT OR UPDATE ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_quality_guard_ativacao();

-- ============ 7. Relatório operacional semanal ============
CREATE OR REPLACE FUNCTION public.quality_relatorio_semanal(_org uuid, _inicio date DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ini timestamptz;
  fim timestamptz;
  out_json jsonb;
BEGIN
  IF NOT public.is_staff_ativo(_org) THEN
    RAISE EXCEPTION 'Acesso interno não autorizado.';
  END IF;
  ini := date_trunc('week', COALESCE(_inicio, current_date)::timestamptz);
  fim := ini + interval '7 days';

  SELECT jsonb_build_object(
    'inicio', ini,
    'fim', fim,
    'casos_ativos', (SELECT count(*) FROM crm_casos WHERE organization_id=_org AND archived_at IS NULL AND (status='ativo' OR ativo IS TRUE)),
    'casos_ativados_semana', (SELECT count(*) FROM crm_casos WHERE organization_id=_org AND ativado_em >= ini AND ativado_em < fim),
    'casos_suspensos', (SELECT count(*) FROM crm_casos WHERE organization_id=_org AND archived_at IS NULL AND status='suspenso'),
    'tarefas_concluidas_semana', (SELECT count(*) FROM tarefas WHERE organization_id=_org AND concluida_em >= ini AND concluida_em < fim),
    'tarefas_vencidas', (SELECT count(*) FROM tarefas WHERE organization_id=_org AND archived_at IS NULL AND prazo < current_date AND status NOT IN ('concluida','cancelada')),
    'microentregas_pendentes', (SELECT count(*) FROM microentregas m JOIN crm_casos c ON c.id=m.caso_id WHERE c.organization_id=_org AND m.status <> 'concluida'),
    'evidencias_validadas_semana', (SELECT count(*) FROM evidencias WHERE organization_id=_org AND status='validada' AND updated_at >= ini AND updated_at < fim),
    'faturas_emitidas_semana', (SELECT count(*) FROM invoices WHERE organization_id=_org AND emitida_em >= ini AND emitida_em < fim),
    'pagamentos_confirmados_semana', (SELECT count(*) FROM payments WHERE organization_id=_org AND status='confirmado' AND pago_em >= ini AND pago_em < fim),
    'valor_recebido_semana', (SELECT COALESCE(sum(valor),0) FROM payments WHERE organization_id=_org AND status='confirmado' AND pago_em >= ini AND pago_em < fim),
    'inconsistencias', (
      SELECT COALESCE(jsonb_object_agg(severidade, total), '{}'::jsonb) FROM (
        SELECT severidade, count(*) total FROM quality_issues
         WHERE organization_id=_org AND status IN ('aberta','reconhecida') GROUP BY severidade
      ) s),
    'inconsistencias_resolvidas_semana', (SELECT count(*) FROM quality_issues WHERE organization_id=_org AND resolvida_em >= ini AND resolvida_em < fim),
    'carga_por_responsavel', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('responsavel', nome, 'tarefas_abertas', total) ORDER BY total DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.full_name, s.email, 'Sem responsável') nome, count(*) total
          FROM tarefas t LEFT JOIN staff_access s ON s.auth_user_id = t.responsavel_id
         WHERE t.organization_id=_org AND t.archived_at IS NULL AND t.status NOT IN ('concluida','cancelada')
         GROUP BY 1
      ) r)
  ) INTO out_json;

  RETURN out_json;
END; $$;

REVOKE ALL ON FUNCTION public.quality_relatorio_semanal(uuid, date) FROM public;
GRANT EXECUTE ON FUNCTION public.quality_relatorio_semanal(uuid, date) TO authenticated, service_role;

-- ============ 8. Sincronização de checklist por caso ============
CREATE OR REPLACE FUNCTION public.quality_sync_checklist(_case uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_tipo text; v_fase text; v_n integer := 0;
BEGIN
  SELECT organization_id, COALESCE(tipo_servico,'*'), COALESCE(fase,'*')
    INTO v_org, v_tipo, v_fase FROM crm_casos WHERE id = _case;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Caso não encontrado.'; END IF;
  IF NOT public.is_staff_ativo(v_org) THEN RAISE EXCEPTION 'Acesso interno não autorizado.'; END IF;

  INSERT INTO case_checklist_items
    (organization_id, case_id, template_id, item_key, label, fase, tipo_servico, obrigatorio, ordem)
  SELECT v_org, _case, t.id, t.item_key, t.label, t.fase, t.tipo_servico, t.obrigatorio, t.ordem
    FROM quality_checklist_templates t
   WHERE t.organization_id = v_org AND t.archived_at IS NULL
     AND t.tipo_servico IN ('*', v_tipo)
     AND t.fase IN ('*', v_fase)
  ON CONFLICT (case_id, item_key) DO NOTHING;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END; $$;

REVOKE ALL ON FUNCTION public.quality_sync_checklist(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.quality_sync_checklist(uuid) TO authenticated, service_role;

-- ============ 9. Modelos padrão por organização ============
INSERT INTO public.quality_checklist_templates (organization_id, tipo_servico, fase, item_key, label, descricao, obrigatorio, ordem)
SELECT o.id, v.tipo, v.fase, v.item_key, v.label, v.descricao, v.obrig, v.ordem
FROM public.organizations o
CROSS JOIN (VALUES
  ('*','onboarding','identificacao_cliente','Cliente identificado com documento','Nome completo, documento e contato conferidos.',true,10),
  ('*','onboarding','consentimento_registrado','Consentimento de tratamento registrado','Consentimento vigente ou exceção formal.',true,20),
  ('*','onboarding','proposta_aprovada','Proposta aprovada pelo cliente','Versão aprovada única e vigente.',true,30),
  ('*','onboarding','contrato_assinado','Contrato assinado e arquivado','Arquivo da versão assinada anexado.',true,40),
  ('*','onboarding','pagamento_confirmado','Pagamento inicial confirmado','Entrada conciliada no financeiro.',true,50),
  ('*','onboarding','ordem_servico','Ordem de serviço criada','OS pronta e vinculada ao contrato.',true,60),
  ('*','pesquisa','linha_familiar','Linha familiar mapeada','Ascendentes e datas-chave registrados.',true,10),
  ('*','pesquisa','fontes_registradas','Fontes registradas para cada evidência','Toda evidência validada tem fonte e responsável.',true,20),
  ('*','pesquisa','pendencias_documentais','Pendências documentais listadas','Lista de certidões faltantes atualizada.',true,30),
  ('*','entrega','relatorio_revisado','Relatório revisado por segunda pessoa','Revisão humana registrada.',true,10),
  ('*','entrega','devolutiva_agendada','Devolutiva agendada com o cliente','Data combinada e confirmada.',true,20),
  ('*','entrega','arquivos_liberados','Arquivos liberados no portal do cliente','Somente documentos autorizados.',true,30),
  ('*','encerramento','financeiro_quitado','Financeiro quitado','Faturas pagas ou baixadas com justificativa.',true,10),
  ('*','encerramento','acervo_organizado','Acervo do caso organizado','Documentos categorizados e arquivados.',true,20)
) AS v(tipo,fase,item_key,label,descricao,obrig,ordem)
ON CONFLICT (organization_id, tipo_servico, fase, item_key) DO NOTHING;
