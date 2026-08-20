-- G-08 / Bloco 5B-PRE — Catálogo e governança de bases e fontes genealógicas.
-- Nenhum scraping, API, consulta externa, credencial ou publicação no App Cliente.

CREATE TABLE public.genealogical_sources_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  nome text NOT NULL,
  pais_eixo text NOT NULL,
  citizenship_track_id uuid REFERENCES public.citizenship_tracks(id),
  tipo_de_acervo text NOT NULL DEFAULT 'nao_classificado',
  cobertura_temporal text,
  cobertura_geografica text,
  nivel_de_fonte text NOT NULL DEFAULT 'indice',
  acesso text NOT NULL DEFAULT 'restrito',
  licenca_termos text,
  url_referencia_interna text,
  custo text NOT NULL DEFAULT 'nao_avaliado',
  autenticacao_necessaria boolean NOT NULL DEFAULT false,
  trata_dados_pessoais boolean NOT NULL DEFAULT true,
  risco text NOT NULL DEFAULT 'nao_avaliado',
  uso_recomendado text,
  prioridade text NOT NULL DEFAULT 'media',
  modo_de_uso_permitido text NOT NULL DEFAULT 'nao_validado',
  scraping_status text NOT NULL DEFAULT 'proibido_por_padrao',
  ultima_verificacao date,
  status_documentacao text NOT NULL DEFAULT 'nao_documentada',
  status_integracao text NOT NULL DEFAULT 'sem_integracao',
  proxima_acao text,
  observacao_risco text,
  responsavel_revisao text,
  estagio_maturidade text NOT NULL DEFAULT 'CATALOGADA',
  data_origin text NOT NULL DEFAULT 'registro_interno',
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT gsc_nivel_chk CHECK (nivel_de_fonte IN ('primaria','secundaria','colaborativa','indice','institucional')),
  CONSTRAINT gsc_acesso_chk CHECK (acesso IN ('publico','login','pago','parceria','restrito')),
  CONSTRAINT gsc_modo_chk CHECK (modo_de_uso_permitido IN ('manual','metadados_linkout','api_validada','parceria','restrito','nao_validado')),
  CONSTRAINT gsc_scraping_chk CHECK (scraping_status IN ('proibido_por_padrao','exige_validacao_juridica_tecnica','nao_aplicavel')),
  CONSTRAINT gsc_estagio_chk CHECK (estagio_maturidade IN ('CATALOGADA','DOCUMENTADA','TERMOS_A_CONFIRMAR','ELEGIVEL_PARA_PILOTO','PILOTO_INTERNO','HOMOLOGADA_MANUAL','HOMOLOGADA_API','RESTRITA','DESCONTINUADA')),
  CONSTRAINT gsc_prioridade_chk CHECK (prioridade IN ('critica','alta','media','baixa')),
  CONSTRAINT gsc_risco_chk CHECK (risco IN ('nao_avaliado','baixo','medio','alto','critico')),
  CONSTRAINT gsc_status_doc_chk CHECK (status_documentacao IN ('nao_documentada','parcial','completa','termos_a_confirmar')),
  CONSTRAINT gsc_status_int_chk CHECK (status_integracao IN ('sem_integracao','uso_manual','piloto_interno','homologada_manual','homologada_api','bloqueada'))
);

GRANT SELECT, INSERT, UPDATE ON public.genealogical_sources_catalog TO authenticated;
GRANT ALL ON public.genealogical_sources_catalog TO service_role;
ALTER TABLE public.genealogical_sources_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY gsc_sel ON public.genealogical_sources_catalog FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY gsc_ins ON public.genealogical_sources_catalog FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY gsc_upd ON public.genealogical_sources_catalog FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE TABLE public.source_evaluation_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  source_id uuid NOT NULL REFERENCES public.genealogical_sources_catalog(id),
  criterio text NOT NULL,
  nota integer,
  parecer_interno text,
  evidencia_interna text,
  avaliado_em date,
  avaliado_por text,
  bloqueante boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT sem_criterio_chk CHECK (criterio IN ('juridico','tecnico','risco','custo','valor_probatorio','cobertura','estabilidade')),
  CONSTRAINT sem_nota_chk CHECK (nota IS NULL OR (nota >= 0 AND nota <= 5))
);

GRANT SELECT, INSERT, UPDATE ON public.source_evaluation_matrix TO authenticated;
GRANT ALL ON public.source_evaluation_matrix TO service_role;
ALTER TABLE public.source_evaluation_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY sem_sel ON public.source_evaluation_matrix FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY sem_ins ON public.source_evaluation_matrix FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY sem_upd ON public.source_evaluation_matrix FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE TABLE public.sources_activation_backlog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  source_id uuid NOT NULL REFERENCES public.genealogical_sources_catalog(id),
  acao_interna text NOT NULL,
  motivo text NOT NULL,
  prioridade text NOT NULL DEFAULT 'media',
  status text NOT NULL DEFAULT 'planejada',
  responsavel text,
  prazo date,
  bloqueio_atual text,
  resultado_interno text,
  requires_human_approval boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT sab_prioridade_chk CHECK (prioridade IN ('critica','alta','media','baixa')),
  CONSTRAINT sab_status_chk CHECK (status IN ('planejada','em_analise','aguardando_juridico','aguardando_tecnico','bloqueada','concluida','cancelada'))
);

GRANT SELECT, INSERT, UPDATE ON public.sources_activation_backlog TO authenticated;
GRANT ALL ON public.sources_activation_backlog TO service_role;
ALTER TABLE public.sources_activation_backlog ENABLE ROW LEVEL SECURITY;
CREATE POLICY sab_sel ON public.sources_activation_backlog FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY sab_ins ON public.sources_activation_backlog FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY sab_upd ON public.sources_activation_backlog FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- Estrutura futura: nenhum log real é gerado neste corte.
CREATE TABLE public.source_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  source_id uuid NOT NULL REFERENCES public.genealogical_sources_catalog(id),
  case_id uuid,
  acesso_tipo text NOT NULL DEFAULT 'manual_interno',
  resumo_interno text,
  registrado_em timestamptz NOT NULL DEFAULT now(),
  registrado_por uuid,
  estrutura_futura boolean NOT NULL DEFAULT true,
  CONSTRAINT sal_tipo_chk CHECK (acesso_tipo IN ('manual_interno','consulta_presencial','linkout_metadados'))
);

GRANT SELECT ON public.source_access_logs TO authenticated;
GRANT ALL ON public.source_access_logs TO service_role;
ALTER TABLE public.source_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sal_sel ON public.source_access_logs FOR SELECT TO authenticated USING (is_org_member(organization_id));

-- Guarda do catálogo: catalogada não é integração; termos a confirmar não avança.
CREATE OR REPLACE FUNCTION public.fn_g08_source_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.estagio_maturidade = 'CATALOGADA'
     AND NEW.status_integracao NOT IN ('sem_integracao','bloqueada') THEN
    RAISE EXCEPTION 'Fonte apenas catalogada não é integração: documente e avalie antes de mudar a situação de integração.';
  END IF;

  IF (NEW.estagio_maturidade = 'TERMOS_A_CONFIRMAR' OR NEW.status_documentacao = 'termos_a_confirmar')
     AND NEW.estagio_maturidade IN ('ELEGIVEL_PARA_PILOTO','PILOTO_INTERNO','HOMOLOGADA_MANUAL','HOMOLOGADA_API') THEN
    RAISE EXCEPTION 'Fonte com termos a confirmar não avança para piloto nem homologação.';
  END IF;

  IF NEW.estagio_maturidade IN ('ELEGIVEL_PARA_PILOTO','PILOTO_INTERNO','HOMOLOGADA_MANUAL','HOMOLOGADA_API')
     AND NEW.status_documentacao <> 'completa' THEN
    RAISE EXCEPTION 'Avanço de maturidade exige documentação completa da fonte.';
  END IF;

  IF NEW.estagio_maturidade = 'HOMOLOGADA_API' AND NEW.modo_de_uso_permitido <> 'api_validada' THEN
    RAISE EXCEPTION 'Homologação por API exige modo de uso permitido api_validada. Fonte manual não equivale a API homologada.';
  END IF;

  IF NEW.estagio_maturidade = 'HOMOLOGADA_MANUAL' AND NEW.modo_de_uso_permitido NOT IN ('manual','metadados_linkout','parceria') THEN
    RAISE EXCEPTION 'Homologação manual exige modo de uso manual, metadados/linkout ou parceria.';
  END IF;

  IF NEW.scraping_status = 'nao_aplicavel' AND NEW.modo_de_uso_permitido = 'api_validada' AND NEW.status_documentacao <> 'completa' THEN
    RAISE EXCEPTION 'Modo API validada exige documentação completa e parecer registrado.';
  END IF;

  IF NEW.estagio_maturidade IN ('RESTRITA','DESCONTINUADA') AND NEW.status_integracao NOT IN ('bloqueada','sem_integracao') THEN
    RAISE EXCEPTION 'Fonte restrita ou descontinuada não pode permanecer com integração ativa.';
  END IF;

  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_g08_source_guard
BEFORE INSERT OR UPDATE ON public.genealogical_sources_catalog
FOR EACH ROW EXECUTE FUNCTION public.fn_g08_source_guard();

-- Sem exclusão física em nenhuma das estruturas do módulo.
CREATE TRIGGER trg_g08_no_delete_catalog
BEFORE DELETE ON public.genealogical_sources_catalog
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_g08_no_delete_matrix
BEFORE DELETE ON public.source_evaluation_matrix
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_g08_no_delete_backlog
BEFORE DELETE ON public.sources_activation_backlog
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_g08_no_delete_logs
BEFORE DELETE ON public.source_access_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- Logs futuros: nunca aceitam token, credencial ou payload bruto.
CREATE OR REPLACE FUNCTION public.fn_g08_access_log_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  txt text := lower(coalesce(NEW.resumo_interno, ''));
BEGIN
  IF txt ~ '(token|bearer |api[_ -]?key|senha|password|secret|authorization|payload|"?access_token"?)' THEN
    RAISE EXCEPTION 'Registro de acesso não aceita token, credencial ou payload bruto.';
  END IF;
  IF length(coalesce(NEW.resumo_interno,'')) > 500 THEN
    RAISE EXCEPTION 'Registro de acesso aceita apenas resumo interno curto, nunca resposta bruta da fonte.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_g08_access_log_guard
BEFORE INSERT OR UPDATE ON public.source_access_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_g08_access_log_guard();

CREATE TRIGGER trg_g08_matrix_meta
BEFORE UPDATE ON public.source_evaluation_matrix
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_g08_backlog_meta
BEFORE UPDATE ON public.sources_activation_backlog
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_g08_catalog_org ON public.genealogical_sources_catalog(organization_id, estagio_maturidade);
CREATE INDEX idx_g08_matrix_source ON public.source_evaluation_matrix(source_id);
CREATE INDEX idx_g08_backlog_source ON public.sources_activation_backlog(source_id, status);