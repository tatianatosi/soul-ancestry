-- ========== knowledge_items ==========
CREATE TABLE public.knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  titulo text NOT NULL,
  tipo text NOT NULL DEFAULT 'documento',
  dominio text NOT NULL DEFAULT 'operacao',
  status text NOT NULL DEFAULT 'rascunho',
  versao integer NOT NULL DEFAULT 1,
  owner_user_id uuid,
  owner_nome text,
  fonte text,
  link_url text,
  storage_path text,
  resumo text,
  case_id uuid REFERENCES public.crm_casos(id),
  processo text,
  nivel_acesso text NOT NULL DEFAULT 'equipe',
  ultima_revisao_em timestamptz,
  change_resumo text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT knowledge_tipo_chk CHECK (tipo IN ('documento','playbook','especificacao','relatorio','manual','modelo','registro','outro')),
  CONSTRAINT knowledge_status_chk CHECK (status IN ('rascunho','em_revisao','publicado','obsoleto','arquivado')),
  CONSTRAINT knowledge_acesso_chk CHECK (nivel_acesso IN ('interno_restrito','equipe','lideranca','cliente_quando_liberado'))
);

GRANT SELECT, INSERT, UPDATE ON public.knowledge_items TO authenticated;
GRANT ALL ON public.knowledge_items TO service_role;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_select" ON public.knowledge_items FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id)
    AND (nivel_acesso <> 'interno_restrito' OR staff_meu_papel(organization_id) IN ('admin','operacoes')));
CREATE POLICY "knowledge_insert" ON public.knowledge_items FOR INSERT TO authenticated
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura');
CREATE POLICY "knowledge_update" ON public.knowledge_items FOR UPDATE TO authenticated
  USING (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura')
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura');

-- ========== decisions ==========
CREATE TABLE public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  titulo text NOT NULL,
  dominio text NOT NULL DEFAULT 'operacao',
  status text NOT NULL DEFAULT 'rascunho',
  versao integer NOT NULL DEFAULT 1,
  contexto text,
  decisao text,
  alternativas text,
  impacto text,
  responsavel_user_id uuid,
  responsavel_nome text,
  data_decisao date,
  vigencia_inicio date,
  vigencia_fim date,
  substitui_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  substituida_por uuid REFERENCES public.decisions(id),
  evidencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  case_id uuid REFERENCES public.crm_casos(id),
  nivel_acesso text NOT NULL DEFAULT 'equipe',
  change_resumo text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT decisions_status_chk CHECK (status IN ('rascunho','em_revisao','publicada','substituida','revogada','arquivada')),
  CONSTRAINT decisions_acesso_chk CHECK (nivel_acesso IN ('interno_restrito','equipe','lideranca','cliente_quando_liberado'))
);

GRANT SELECT, INSERT, UPDATE ON public.decisions TO authenticated;
GRANT ALL ON public.decisions TO service_role;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decisions_select" ON public.decisions FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id)
    AND (nivel_acesso <> 'interno_restrito' OR staff_meu_papel(organization_id) IN ('admin','operacoes')));
CREATE POLICY "decisions_insert" ON public.decisions FOR INSERT TO authenticated
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura');
CREATE POLICY "decisions_update" ON public.decisions FOR UPDATE TO authenticated
  USING (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura')
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura');

-- ========== artifact_register ==========
CREATE TABLE public.artifact_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  nome_original text NOT NULL,
  localizacao text,
  origem text,
  classificacao text NOT NULL DEFAULT 'operacional',
  status_recuperacao text NOT NULL DEFAULT 'NAO_LOCALIZADO',
  fonte_primaria text,
  backup_historico text,
  relacao_operacional text,
  proxima_acao text,
  lacuna text,
  dominio text NOT NULL DEFAULT 'operacao',
  responsavel_user_id uuid,
  responsavel_nome text,
  versao integer NOT NULL DEFAULT 1,
  sucessor_id uuid REFERENCES public.artifact_register(id),
  knowledge_item_id uuid REFERENCES public.knowledge_items(id),
  case_id uuid REFERENCES public.crm_casos(id),
  nivel_acesso text NOT NULL DEFAULT 'equipe',
  demo boolean NOT NULL DEFAULT false,
  change_resumo text,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT artifact_status_chk CHECK (status_recuperacao IN (
    'LOCALIZADO_E_USAVEL','LOCALIZADO_MAS_DOCUMENTAL','LOCALIZADO_COM_CONFLITO','HISTORICO_OU_BACKUP','NAO_LOCALIZADO')),
  CONSTRAINT artifact_acesso_chk CHECK (nivel_acesso IN ('interno_restrito','equipe','lideranca','cliente_quando_liberado'))
);

GRANT SELECT, INSERT, UPDATE ON public.artifact_register TO authenticated;
GRANT ALL ON public.artifact_register TO service_role;
ALTER TABLE public.artifact_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artifact_select" ON public.artifact_register FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id)
    AND (nivel_acesso <> 'interno_restrito' OR staff_meu_papel(organization_id) IN ('admin','operacoes')));
CREATE POLICY "artifact_insert" ON public.artifact_register FOR INSERT TO authenticated
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura');
CREATE POLICY "artifact_update" ON public.artifact_register FOR UPDATE TO authenticated
  USING (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura')
  WITH CHECK (is_staff_ativo(organization_id) AND staff_meu_papel(organization_id) <> 'leitura');

-- ========== change_log ==========
CREATE TABLE public.change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  entidade text NOT NULL,
  entidade_id uuid NOT NULL,
  titulo text,
  versao_anterior integer,
  versao_nova integer,
  resumo text,
  snapshot_anterior jsonb NOT NULL DEFAULT '{}'::jsonb,
  autor_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT change_log_entidade_chk CHECK (entidade IN ('knowledge_items','decisions','artifact_register'))
);

GRANT SELECT ON public.change_log TO authenticated;
GRANT ALL ON public.change_log TO service_role;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "change_log_select" ON public.change_log FOR SELECT TO authenticated
  USING (is_staff_ativo(organization_id));

CREATE INDEX change_log_entidade_idx ON public.change_log (entidade, entidade_id, created_at DESC);

-- ========== travas ==========

-- Versionamento: toda alteração preserva a versão anterior inteira no changelog.
CREATE OR REPLACE FUNCTION public.fn_governanca_versao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  anterior jsonb;
  atual jsonb;
  titulo_item text;
BEGIN
  anterior := to_jsonb(OLD) - 'updated_at' - 'versao' - 'change_resumo';
  atual := to_jsonb(NEW) - 'updated_at' - 'versao' - 'change_resumo';

  IF anterior IS DISTINCT FROM atual THEN
    NEW.versao := OLD.versao + 1;
    NEW.updated_at := now();

    titulo_item := CASE TG_TABLE_NAME
      WHEN 'artifact_register' THEN (to_jsonb(NEW) ->> 'nome_original')
      ELSE (to_jsonb(NEW) ->> 'titulo')
    END;

    INSERT INTO public.change_log (
      organization_id, entidade, entidade_id, titulo, versao_anterior, versao_nova, resumo, snapshot_anterior, autor_user_id
    ) VALUES (
      NEW.organization_id, TG_TABLE_NAME, NEW.id, titulo_item, OLD.versao, NEW.versao,
      COALESCE(NULLIF(btrim(NEW.change_resumo), ''), 'Alteração registrada automaticamente.'),
      to_jsonb(OLD), auth.uid()
    );
    NEW.change_resumo := NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_versao BEFORE UPDATE ON public.knowledge_items
FOR EACH ROW EXECUTE FUNCTION public.fn_governanca_versao();
CREATE TRIGGER trg_decisions_versao BEFORE UPDATE ON public.decisions
FOR EACH ROW EXECUTE FUNCTION public.fn_governanca_versao();
CREATE TRIGGER trg_artifact_versao BEFORE UPDATE ON public.artifact_register
FOR EACH ROW EXECUTE FUNCTION public.fn_governanca_versao();

-- Decisão publicada exige responsável, data, contexto e impacto.
CREATE OR REPLACE FUNCTION public.fn_decisao_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IN ('publicada','substituida') THEN
    IF COALESCE(btrim(NEW.contexto), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige contexto.';
    END IF;
    IF COALESCE(btrim(NEW.decisao), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige a decisão tomada.';
    END IF;
    IF COALESCE(btrim(NEW.impacto), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige o impacto esperado.';
    END IF;
    IF NEW.responsavel_user_id IS NULL AND COALESCE(btrim(NEW.responsavel_nome), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige responsável.';
    END IF;
    IF NEW.data_decisao IS NULL THEN
      RAISE EXCEPTION 'Publicar decisão exige a data da decisão.';
    END IF;
  END IF;

  IF NEW.archived_at IS NOT NULL AND COALESCE(btrim(NEW.archive_motivo), '') = '' THEN
    RAISE EXCEPTION 'Arquivar decisão exige motivo.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_decisao_guard BEFORE INSERT OR UPDATE ON public.decisions
FOR EACH ROW EXECUTE FUNCTION public.fn_decisao_guard();

-- Artefato: substituir/arquivar exige sucessor ou motivo; não localizado só sai com admin.
CREATE OR REPLACE FUNCTION public.fn_artifact_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.archived_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.archived_at IS NULL) THEN
    IF NEW.sucessor_id IS NULL AND COALESCE(btrim(NEW.archive_motivo), '') = '' THEN
      RAISE EXCEPTION 'Arquivar artefato exige sucessor ou motivo.';
    END IF;
    IF NEW.status_recuperacao = 'NAO_LOCALIZADO' THEN
      IF staff_meu_papel(NEW.organization_id) IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Artefato não localizado só pode ser arquivado por admin.';
      END IF;
      IF length(COALESCE(btrim(NEW.archive_motivo), '')) < 15 THEN
        RAISE EXCEPTION 'Arquivar artefato não localizado exige justificativa detalhada do admin.';
      END IF;
    END IF;
  END IF;

  IF NEW.sucessor_id IS NOT NULL AND NEW.sucessor_id = NEW.id THEN
    RAISE EXCEPTION 'Um artefato não pode substituir a si mesmo.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_artifact_guard BEFORE INSERT OR UPDATE ON public.artifact_register
FOR EACH ROW EXECUTE FUNCTION public.fn_artifact_guard();

CREATE TRIGGER trg_knowledge_block_delete BEFORE DELETE ON public.knowledge_items
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_decisions_block_delete BEFORE DELETE ON public.decisions
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_artifact_block_delete BEFORE DELETE ON public.artifact_register
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_change_log_block_delete BEFORE DELETE ON public.change_log
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- ========== seed DEMO: manifesto de resgate ==========
INSERT INTO public.artifact_register (
  organization_id, nome_original, localizacao, origem, classificacao, status_recuperacao,
  fonte_primaria, backup_historico, relacao_operacional, proxima_acao, lacuna, dominio, demo
)
SELECT o.id, v.nome, v.local, v.origem, v.classe, v.status, v.fonte, v.backup, v.relacao, v.acao, v.lacuna, v.dominio, true
FROM public.organizations o
CROSS JOIN (VALUES
  ('Auditoria-Mãe','Histórico de conversas do projeto','Diagnóstico inicial','governanca','LOCALIZADO_MAS_DOCUMENTAL',
   'Registro da auditoria original','Resumos por bloco','Base das regras de qualidade e das travas',
   'Consolidar em item de biblioteca publicado','Sem versão única consolidada','governanca'),
  ('CA-RESET','Notas de reestruturação','Reset do escopo','governanca','LOCALIZADO_COM_CONFLITO',
   'Documento de reset','Versões parciais divergentes','Define o recorte atual do produto',
   'Reconciliar versões e publicar decisão de vigência','Duas versões conflitantes','governanca'),
  ('Catálogo Operacional 30','Planilha operacional','Operação','operacional','LOCALIZADO_E_USAVEL',
   'Catálogo de 30 serviços','Cópia por versão','Alimenta propostas e ordens de serviço',
   'Vincular cada item ao motor contratual','Sem vínculo formal com contratos','operacao'),
  ('Planejador Universal','Modelo de planejamento','Operação','operacional','LOCALIZADO_MAS_DOCUMENTAL',
   'Modelo de plano por caso','Versões antigas','Origem do Desk Operacional e das micro-entregas',
   'Transformar em template de checklist por fase','Não executável no sistema','operacao'),
  ('Motor Contratual Modular','Módulo implementado no sistema','Engenharia','sistema','LOCALIZADO_E_USAVEL',
   'Tabelas de contratos e versões','Migrações aplicadas','Trava cobrança e pesquisa externa',
   'Documentar cláusulas-padrão na biblioteca','Documentação de cláusulas incompleta','contratos'),
  ('Bloco 5A','Especificação de bloco','Planejamento','governanca','NAO_LOCALIZADO',
   NULL,NULL,'Referenciado por decisões de escopo',
   'Reconstituir a partir das decisões relacionadas','Documento não encontrado','governanca'),
  ('Painel OPS','Módulo implementado no sistema','Engenharia','sistema','LOCALIZADO_E_USAVEL',
   'Desk Operacional','Histórico de SLA','Fila de trabalho, kanban e micro-entregas',
   'Publicar manual de uso para a equipe','Sem manual publicado','operacao'),
  ('CRM Vivo','Módulo implementado no sistema','Engenharia','sistema','HISTORICO_OU_BACKUP',
   'CRM de casos e leads','Dados de demonstração','Entrada de leads e casos',
   'Revisar campos herdados do protótipo','Campos legados do protótipo','comercial')
) AS v(nome, local, origem, classe, status, fonte, backup, relacao, acao, lacuna, dominio)
WHERE o.archived_at IS NULL;

INSERT INTO public.knowledge_items (organization_id, titulo, tipo, dominio, status, fonte, resumo, nivel_acesso)
SELECT o.id, v.titulo, v.tipo, v.dominio, 'em_revisao', v.fonte, v.resumo, 'equipe'
FROM public.organizations o
CROSS JOIN (VALUES
  ('Manifesto de Resgate — visão geral','registro','governanca','Registro de artefatos','Panorama do que foi localizado, do que é apenas documental e do que segue em falta.'),
  ('Catálogo Operacional 30 — referência','modelo','operacao','Catálogo operacional','Lista de serviços usada em propostas e ordens de serviço.'),
  ('Motor Contratual Modular — especificação','especificacao','contratos','Engenharia','Regras de contrato, versões, escopo e travas de cobrança.')
) AS v(titulo, tipo, dominio, fonte, resumo)
WHERE o.archived_at IS NULL;