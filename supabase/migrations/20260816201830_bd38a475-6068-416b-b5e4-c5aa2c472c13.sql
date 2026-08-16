-- 1. Linha familiar ---------------------------------------------------------
ALTER TABLE public.case_members
  ADD COLUMN IF NOT EXISTS requerente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pai_id uuid REFERENCES public.case_members(id),
  ADD COLUMN IF NOT EXISTS mae_id uuid REFERENCES public.case_members(id),
  ADD COLUMN IF NOT EXISTS nacionalidade text,
  ADD COLUMN IF NOT EXISTS data_obito date,
  ADD COLUMN IF NOT EXISTS local_obito text;

-- 2. Quem pode editar pesquisa de um caso ------------------------------------
CREATE OR REPLACE FUNCTION public.pode_pesquisar_caso(_case uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org uuid;
  _resp uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN true; -- rotinas administrativas e carga inicial
  END IF;
  SELECT organization_id, responsavel_id INTO _org, _resp FROM public.crm_casos WHERE id = _case;
  IF _org IS NULL THEN
    RETURN false;
  END IF;
  IF has_org_role(_org, 'admin') OR has_org_role(_org, 'operacoes') THEN
    RETURN true;
  END IF;
  IF has_org_role(_org, 'pesquisador') THEN
    RETURN _resp = auth.uid();
  END IF;
  RETURN can_write(_org);
END;
$$;

-- 3. Hipóteses de parentesco -------------------------------------------------
CREATE TABLE public.research_hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  person_id uuid REFERENCES public.case_members(id),
  titulo text NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'aberta',
  grau_confianca text NOT NULL DEFAULT 'baixo',
  justificativa text,
  pesquisador_id uuid,
  revisado_em timestamptz,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT research_hypotheses_status_chk
    CHECK (status IN ('aberta','em_investigacao','confirmada','refutada','inconclusiva')),
  CONSTRAINT research_hypotheses_confianca_chk
    CHECK (grau_confianca IN ('baixo','medio','alto'))
);

GRANT SELECT, INSERT, UPDATE ON public.research_hypotheses TO authenticated;
GRANT ALL ON public.research_hypotheses TO service_role;
ALTER TABLE public.research_hypotheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hipoteses_select" ON public.research_hypotheses
  FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "hipoteses_insert" ON public.research_hypotheses
  FOR INSERT TO authenticated WITH CHECK (can_write(organization_id) AND pode_pesquisar_caso(case_id));
CREATE POLICY "hipoteses_update" ON public.research_hypotheses
  FOR UPDATE TO authenticated USING (can_write(organization_id) AND pode_pesquisar_caso(case_id));

-- 4. Linha do tempo ----------------------------------------------------------
CREATE TABLE public.research_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  person_id uuid REFERENCES public.case_members(id),
  evidencia_id uuid REFERENCES public.evidencias(id),
  hypothesis_id uuid REFERENCES public.research_hypotheses(id),
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'outro',
  local text,
  data_inicio date,
  data_fim date,
  periodo_texto text,
  descricao text,
  confirmado boolean NOT NULL DEFAULT false,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

GRANT SELECT, INSERT, UPDATE ON public.research_events TO authenticated;
GRANT ALL ON public.research_events TO service_role;
ALTER TABLE public.research_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventos_pesquisa_select" ON public.research_events
  FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "eventos_pesquisa_insert" ON public.research_events
  FOR INSERT TO authenticated WITH CHECK (can_write(organization_id) AND pode_pesquisar_caso(case_id));
CREATE POLICY "eventos_pesquisa_update" ON public.research_events
  FOR UPDATE TO authenticated USING (can_write(organization_id) AND pode_pesquisar_caso(case_id));

-- 5. Evidências: modelo de pesquisa -----------------------------------------
ALTER TABLE public.evidencias
  ADD COLUMN IF NOT EXISTS hypothesis_id uuid REFERENCES public.research_hypotheses(id),
  ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.case_members(id),
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS data_inicio date,
  ADD COLUMN IF NOT EXISTS data_fim date,
  ADD COLUMN IF NOT EXISTS pesquisador_id uuid,
  ADD COLUMN IF NOT EXISTS revisado_em timestamptz,
  ADD COLUMN IF NOT EXISTS justificativa text,
  ADD COLUMN IF NOT EXISTS relacao_hipotese text;

-- 6. Pendências de pesquisa --------------------------------------------------
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.case_members(id),
  ADD COLUMN IF NOT EXISTS evidencia_id uuid REFERENCES public.evidencias(id),
  ADD COLUMN IF NOT EXISTS hypothesis_id uuid REFERENCES public.research_hypotheses(id);

-- 7. Travas executáveis ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_evidencia_pesquisa_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'validada' THEN
    IF NEW.pesquisador_id IS NULL THEN
      RAISE EXCEPTION 'Evidência validada exige pesquisador responsável.';
    END IF;
    IF coalesce(btrim(NEW.fonte), '') = '' THEN
      RAISE EXCEPTION 'Evidência validada exige fonte ou origem.';
    END IF;
    IF length(coalesce(btrim(NEW.justificativa), '')) < 5 THEN
      RAISE EXCEPTION 'Evidência validada exige justificativa da validação.';
    END IF;
  END IF;

  IF NEW.status = 'descartada' AND length(coalesce(btrim(NEW.justificativa), '')) < 5 THEN
    RAISE EXCEPTION 'Evidência descartada exige motivo do descarte.';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('validada','descartada','inconclusiva') THEN
    NEW.revisado_em := coalesce(NEW.revisado_em, now());
  END IF;

  IF NEW.caso_id IS NOT NULL AND NOT pode_pesquisar_caso(NEW.caso_id) THEN
    RAISE EXCEPTION 'Pesquisadores só editam evidências de casos sob sua responsabilidade.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evidencia_pesquisa_guard ON public.evidencias;
CREATE TRIGGER trg_evidencia_pesquisa_guard
  BEFORE INSERT OR UPDATE ON public.evidencias
  FOR EACH ROW EXECUTE FUNCTION public.fn_evidencia_pesquisa_guard();

CREATE OR REPLACE FUNCTION public.fn_hipotese_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmada' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.evidencias e
      WHERE e.hypothesis_id = NEW.id
        AND e.status = 'validada'
        AND e.archived_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Hipótese só pode ser confirmada com ao menos uma evidência validada vinculada.';
    END IF;
    IF length(coalesce(btrim(NEW.justificativa), '')) < 5 THEN
      RAISE EXCEPTION 'Confirmar hipótese exige justificativa registrada.';
    END IF;
  END IF;

  IF NEW.status = 'refutada' AND length(coalesce(btrim(NEW.justificativa), '')) < 5 THEN
    RAISE EXCEPTION 'Refutar hipótese exige justificativa registrada.';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.revisado_em := now();
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hipotese_guard
  BEFORE INSERT OR UPDATE ON public.research_hypotheses
  FOR EACH ROW EXECUTE FUNCTION public.fn_hipotese_guard();

CREATE TRIGGER trg_eventos_pesquisa_meta
  BEFORE UPDATE ON public.research_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sem exclusão física
CREATE TRIGGER trg_hipoteses_no_delete
  BEFORE DELETE ON public.research_hypotheses
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_eventos_pesquisa_no_delete
  BEFORE DELETE ON public.research_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- Auditoria
CREATE TRIGGER trg_hipoteses_audit
  AFTER INSERT OR UPDATE ON public.research_hypotheses
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
CREATE TRIGGER trg_eventos_pesquisa_audit
  AFTER INSERT OR UPDATE ON public.research_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();

-- 8. Dados DEMO --------------------------------------------------------------
INSERT INTO public.crm_casos (id, organization_id, cliente_id, codigo, titulo, pais, via, status, tipo_servico, fase, prioridade, data_entrada, resumo, proxima_acao, demo)
SELECT
  '3f2b7d10-0000-4000-8000-000000000001',
  '11f32aae-ea08-47e0-8114-f5d8a900c9a1',
  (SELECT id FROM public.clientes WHERE nome = 'Giovanna Prade (demo)' LIMIT 1),
  'CA-DEMO-IT-2026-001',
  'Pesquisa genealógica — família Prade (demo)',
  'Itália',
  'Ascendência paterna',
  'aguardando_documentos',
  'Pesquisa genealógica',
  'pesquisa',
  'media',
  current_date - 20,
  'Caso de demonstração para o módulo de pesquisa genealógica.',
  'Solicitar certidão de nascimento do bisavô no arquivo comunal.',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.crm_casos WHERE codigo = 'CA-DEMO-IT-2026-001');

INSERT INTO public.case_members (id, organization_id, case_id, nome, parentesco, requerente, nacionalidade, data_nascimento, local_nascimento, data_obito, local_obito)
VALUES
  ('3f2b7d10-0000-4000-8000-000000000101','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','Giovanna Prade (demo)','Requerente', true, 'Brasileira','1994-03-12','Curitiba, PR', NULL, NULL),
  ('3f2b7d10-0000-4000-8000-000000000102','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','Aldo Prade (demo)','Pai', false, 'Brasileira','1962-07-04','Londrina, PR', NULL, NULL),
  ('3f2b7d10-0000-4000-8000-000000000103','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','Luigi Prade (demo)','Bisavô paterno', false, 'Italiana','1901-11-22','Comune di Vicenza (a confirmar)','1978-05-30','Londrina, PR');

UPDATE public.case_members SET pai_id = '3f2b7d10-0000-4000-8000-000000000102'
  WHERE id = '3f2b7d10-0000-4000-8000-000000000101';

INSERT INTO public.research_hypotheses (id, organization_id, case_id, person_id, titulo, descricao, status, grau_confianca, demo)
VALUES
  ('3f2b7d10-0000-4000-8000-000000000201','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000103',
   'Luigi Prade nasceu na comuna de Vicenza',
   'Registro de nascimento ainda não localizado no arquivo comunal. Grafia do sobrenome varia entre Prade e Pradè nos documentos brasileiros.',
   'em_investigacao','medio', true),
  ('3f2b7d10-0000-4000-8000-000000000202','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000102',
   'Linha de filiação entre Aldo e Luigi Prade',
   'Filiação indicada em certidão brasileira; aguardando conferência com registro civil complementar.',
   'aberta','baixo', true);

INSERT INTO public.evidencias (id, organization_id, caso_id, hypothesis_id, person_id, titulo, tipo, status, visibilidade, descricao, fonte, origem, url, local_relacionado, pessoa_relacionada, data_inicio, data_fim, periodo, grau_confianca, relacao_hipotese, justificativa, pesquisador_id, revisado_em, demo)
VALUES
  ('3f2b7d10-0000-4000-8000-000000000301','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000202','3f2b7d10-0000-4000-8000-000000000102',
   'Certidão de nascimento de Aldo Prade','certidao','validada','interna',
   'Certidão em inteiro teor com filiação legível.','Cartório de Registro Civil de Londrina/PR','interna',NULL,'Londrina, PR','Aldo Prade (demo)','1962-07-04','1962-07-04','1962','alto',
   'Sustenta a filiação declarada na hipótese','Documento em inteiro teor, dados conferidos com o original digitalizado.', '3f2b7d10-0000-4000-8000-0000000000de', now(), true),
  ('3f2b7d10-0000-4000-8000-000000000302','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000201','3f2b7d10-0000-4000-8000-000000000103',
   'Registro de entrada de imigrantes — porto de Santos','registro','em_revisao','interna',
   'Listagem de passageiros com nome semelhante; grafia divergente.','Arquivo Nacional — acervo digital','interna','https://exemplo.org/acervo/registro-1923','Santos, SP','Luigi Prade (demo)','1923-01-01','1923-12-31','1923','medio',
   'Indício de chegada ao Brasil compatível com a hipótese', NULL, NULL, NULL, true),
  ('3f2b7d10-0000-4000-8000-000000000303','11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000201','3f2b7d10-0000-4000-8000-000000000103',
   'Índice paroquial de Vicenza (1899-1905)','outro','inconclusiva','interna',
   'Índice consultado sem correspondência exata para o período informado.','Paróquia de Vicenza — índice microfilmado','interna',NULL,'Vicenza, Itália','Luigi Prade (demo)','1899-01-01','1905-12-31','1899–1905','baixo',
   'Não confirma nem afasta a hipótese', NULL, NULL, now(), true);

INSERT INTO public.research_events (organization_id, case_id, person_id, evidencia_id, titulo, tipo, local, data_inicio, data_fim, periodo_texto, descricao, confirmado, demo)
VALUES
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000103',NULL,'Nascimento informado de Luigi Prade','nascimento','Vicenza, Itália (a confirmar)','1901-11-22',NULL,'22/11/1901','Data declarada em documento brasileiro, sem registro italiano localizado.', false, true),
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000103','3f2b7d10-0000-4000-8000-000000000302','Possível chegada ao Brasil','imigracao','Porto de Santos, SP',NULL,NULL,'1923','Registro em revisão; grafia do sobrenome diverge.', false, true),
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','3f2b7d10-0000-4000-8000-000000000102','3f2b7d10-0000-4000-8000-000000000301','Nascimento de Aldo Prade','nascimento','Londrina, PR','1962-07-04',NULL,'04/07/1962','Confirmado por certidão em inteiro teor.', true, true);

INSERT INTO public.tarefas (organization_id, caso_id, titulo, descricao, status, prioridade, prazo, person_id, evidencia_id, hypothesis_id, demo)
VALUES
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','Solicitar busca no arquivo comunal de Vicenza','Pedido de pesquisa por variações de grafia do sobrenome.','nao_iniciada','alta', current_date + 14,'3f2b7d10-0000-4000-8000-000000000103',NULL,'3f2b7d10-0000-4000-8000-000000000201', true),
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','3f2b7d10-0000-4000-8000-000000000001','Conferir lista de passageiros com o original','Comparar transcrição com a imagem do acervo digital.','em_andamento','media', current_date + 7,'3f2b7d10-0000-4000-8000-000000000103','3f2b7d10-0000-4000-8000-000000000302',NULL, true);