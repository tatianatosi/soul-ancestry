-- ============ integrations ============
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  chave text NOT NULL,
  nome text NOT NULL,
  categoria text NOT NULL,
  provedor text,
  descricao text,
  status text NOT NULL DEFAULT 'desligada',
  modo_simulado boolean NOT NULL DEFAULT true,
  owner_user_id uuid,
  owner_nome text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  campos_obrigatorios text[] NOT NULL DEFAULT '{}'::text[],
  field_map jsonb NOT NULL DEFAULT '{}'::jsonb,
  retry_max integer NOT NULL DEFAULT 3,
  retry_backoff_seg integer NOT NULL DEFAULT 60,
  falhas_consecutivas integer NOT NULL DEFAULT 0,
  ultima_execucao_em timestamptz,
  ultima_execucao_status text,
  ativada_em timestamptz,
  ativada_por uuid,
  ativacao_confirmacao text,
  pausa_motivo text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT integrations_chave_org_uk UNIQUE (organization_id, chave),
  CONSTRAINT integrations_status_chk CHECK (status IN ('desligada','teste','ativa','com_erro','pausada')),
  CONSTRAINT integrations_categoria_chk CHECK (categoria IN ('crm','pre_onboarding','calls','mensageria','financeiro','armazenamento','demo')),
  CONSTRAINT integrations_retry_chk CHECK (retry_max BETWEEN 1 AND 10 AND retry_backoff_seg BETWEEN 5 AND 3600)
);

GRANT SELECT, INSERT, UPDATE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select" ON public.integrations FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id));
CREATE POLICY "integrations_insert" ON public.integrations FOR INSERT TO authenticated
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) IN ('admin','operacoes'));
CREATE POLICY "integrations_update" ON public.integrations FOR UPDATE TO authenticated
  USING (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) IN ('admin','operacoes'))
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) IN ('admin','operacoes'));

-- ============ integration_runs (logs) ============
CREATE TABLE public.integration_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  integration_id uuid NOT NULL REFERENCES public.integrations(id),
  operacao text NOT NULL,
  ambiente text NOT NULL DEFAULT 'simulado',
  resultado text NOT NULL,
  tentativa integer NOT NULL DEFAULT 1,
  duracao_ms integer,
  mensagem text,
  payload_mascarado jsonb NOT NULL DEFAULT '{}'::jsonb,
  resposta_mascarada jsonb NOT NULL DEFAULT '{}'::jsonb,
  efeito_local text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT integration_runs_ambiente_chk CHECK (ambiente IN ('simulado','producao')),
  CONSTRAINT integration_runs_resultado_chk CHECK (resultado IN ('ok','erro','bloqueado'))
);

GRANT SELECT, INSERT ON public.integration_runs TO authenticated;
GRANT ALL ON public.integration_runs TO service_role;
ALTER TABLE public.integration_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_runs_select" ON public.integration_runs FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id));
CREATE POLICY "integration_runs_insert" ON public.integration_runs FOR INSERT TO authenticated
  WITH CHECK (is_staff_ativo(organization_id));

-- ============ fila de revisão ============
CREATE TABLE public.integration_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  integration_id uuid NOT NULL REFERENCES public.integrations(id),
  run_id uuid REFERENCES public.integration_runs(id),
  motivo text NOT NULL,
  tentativas integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'aberto',
  resolucao text,
  resolvido_por uuid,
  resolvido_em timestamptz,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integration_review_status_chk CHECK (status IN ('aberto','em_analise','resolvido'))
);

GRANT SELECT, INSERT, UPDATE ON public.integration_review_queue TO authenticated;
GRANT ALL ON public.integration_review_queue TO service_role;
ALTER TABLE public.integration_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_review_select" ON public.integration_review_queue FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id));
CREATE POLICY "integration_review_insert" ON public.integration_review_queue FOR INSERT TO authenticated
  WITH CHECK (is_staff_ativo(organization_id));
CREATE POLICY "integration_review_update" ON public.integration_review_queue FOR UPDATE TO authenticated
  USING (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) IN ('admin','operacoes'))
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) IN ('admin','operacoes'));

-- ============ travas ============
CREATE OR REPLACE FUNCTION public.fn_integracao_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  faltando text[];
BEGIN
  NEW.updated_at := now();

  -- Ativação: exige admin, confirmação explícita, responsável e mapeamento completo.
  IF NEW.status = 'ativa' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'ativa') THEN
    IF staff_meu_papel(NEW.organization_id) IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Somente admin pode ativar uma integração.';
    END IF;
    IF NEW.ativacao_confirmacao IS NULL OR upper(btrim(NEW.ativacao_confirmacao)) <> 'ATIVAR' THEN
      RAISE EXCEPTION 'Ativação exige confirmação explícita do admin.';
    END IF;
    IF NEW.owner_user_id IS NULL THEN
      RAISE EXCEPTION 'Defina o responsável interno antes de ativar.';
    END IF;
    SELECT array_agg(c) INTO faltando
    FROM unnest(NEW.campos_obrigatorios) AS c
    WHERE COALESCE(btrim(NEW.field_map ->> c), '') = '';
    IF faltando IS NOT NULL THEN
      RAISE EXCEPTION 'Campos obrigatórios sem mapeamento: %', array_to_string(faltando, ', ');
    END IF;
    NEW.modo_simulado := false;
    NEW.ativada_em := now();
    NEW.ativada_por := auth.uid();
  END IF;

  -- Fora de "ativa" nunca sai do modo simulado.
  IF NEW.status <> 'ativa' THEN
    NEW.modo_simulado := true;
    NEW.ativacao_confirmacao := NULL;
  END IF;

  IF NEW.status = 'pausada' AND COALESCE(btrim(NEW.pausa_motivo), '') = '' THEN
    RAISE EXCEPTION 'Pausar exige motivo.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_integracao_guard
BEFORE INSERT OR UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.fn_integracao_guard();

CREATE TRIGGER trg_integrations_block_delete
BEFORE DELETE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_integration_runs_block_delete
BEFORE DELETE ON public.integration_runs
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_integration_review_block_delete
BEFORE DELETE ON public.integration_review_queue
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- Execução: produção só com integração ativa; falhas acima do limite param a integração.
CREATE OR REPLACE FUNCTION public.fn_integration_run_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  integ public.integrations%ROWTYPE;
  novas integer;
BEGIN
  SELECT * INTO integ FROM public.integrations WHERE id = NEW.integration_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Integração inexistente.';
  END IF;
  IF integ.organization_id <> NEW.organization_id THEN
    RAISE EXCEPTION 'Integração de outra organização.';
  END IF;

  IF NEW.ambiente = 'producao' AND (integ.status <> 'ativa' OR integ.modo_simulado) THEN
    RAISE EXCEPTION 'Integração desligada, em teste ou pausada: chamada externa bloqueada.';
  END IF;

  IF NEW.tentativa > integ.retry_max THEN
    RAISE EXCEPTION 'Limite de tentativas da integração excedido.';
  END IF;

  IF NEW.resultado = 'erro' THEN
    novas := integ.falhas_consecutivas + 1;
    UPDATE public.integrations
       SET falhas_consecutivas = novas,
           ultima_execucao_em = now(),
           ultima_execucao_status = 'erro',
           status = CASE WHEN novas >= integ.retry_max AND status IN ('ativa','teste') THEN 'com_erro' ELSE status END,
           modo_simulado = CASE WHEN novas >= integ.retry_max THEN true ELSE modo_simulado END,
           updated_at = now()
     WHERE id = integ.id;

    IF novas >= integ.retry_max THEN
      INSERT INTO public.integration_review_queue (organization_id, integration_id, run_id, motivo, tentativas)
      VALUES (NEW.organization_id, NEW.integration_id, NEW.id,
              COALESCE(NEW.mensagem, 'Falhas consecutivas acima do limite.'), novas);
    END IF;
  ELSIF NEW.resultado = 'ok' THEN
    UPDATE public.integrations
       SET falhas_consecutivas = 0,
           ultima_execucao_em = now(),
           ultima_execucao_status = 'ok',
           updated_at = now()
     WHERE id = integ.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_integration_run_guard
AFTER INSERT ON public.integration_runs
FOR EACH ROW EXECUTE FUNCTION public.fn_integration_run_guard();

-- Bloqueio antes do insert para produção indevida (falha rápida, sem gravar log falso).
CREATE OR REPLACE FUNCTION public.fn_integration_run_pre()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ok boolean;
BEGIN
  SELECT (status = 'ativa' AND NOT modo_simulado) INTO ok
  FROM public.integrations WHERE id = NEW.integration_id;
  IF NEW.ambiente = 'producao' AND COALESCE(ok, false) = false THEN
    RAISE EXCEPTION 'Execução em produção bloqueada: integração não está ativa.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_integration_run_pre
BEFORE INSERT ON public.integration_runs
FOR EACH ROW EXECUTE FUNCTION public.fn_integration_run_pre();

-- ============ catálogo inicial (tudo desligado) ============
INSERT INTO public.integrations (organization_id, chave, nome, categoria, provedor, descricao, campos_obrigatorios, field_map)
SELECT o.id, v.chave, v.nome, v.categoria, v.provedor, v.descricao, v.campos, '{}'::jsonb
FROM public.organizations o
CROSS JOIN (VALUES
  ('crm_externo','CRM externo','crm','Genérico (HTTP)','Sincroniza leads e casos com o CRM da operação.', ARRAY['nome','email','origem','estagio']),
  ('form_pre_onboarding','Formulário de pré-onboarding','pre_onboarding','Formulário web','Recebe respostas do formulário e cria o lead correspondente.', ARRAY['nome','email','pais_interesse']),
  ('painel_calls','Painel de calls','calls','Agenda de reuniões','Traz agendamentos e resultados de calls comerciais.', ARRAY['cliente','horario','responsavel']),
  ('whatsapp_meta','WhatsApp / Meta','mensageria','Meta Cloud API','Envio de mensagens transacionais ao cliente.', ARRAY['telefone','template','idioma']),
  ('gateway_financeiro','Gateway financeiro','financeiro','Gateway de cobrança','Emissão e conciliação de cobranças.', ARRAY['fatura','valor','vencimento','documento']),
  ('armazenamento_documentos','Armazenamento de documentos','armazenamento','Storage externo','Espelho de documentos em armazenamento externo.', ARRAY['caminho','categoria']),
  ('demo_form_lead','DEMO — Formulário para lead','demo','Simulador interno','Integração de demonstração: transforma uma resposta de formulário em lead, sem chamada externa.', ARRAY['nome','email','pais_interesse'])
) AS v(chave, nome, categoria, provedor, descricao, campos)
WHERE o.archived_at IS NULL;