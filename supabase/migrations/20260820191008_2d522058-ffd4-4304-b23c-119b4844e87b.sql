-- G-06 — Achados Genealógicos e Encontros de Linhagem
-- Fonte -> Evidência -> Validação interna -> Achado -> Árvore/Timeline -> Micro-entrega/Relatório (se aprovado)

CREATE TABLE public.genealogical_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  family_id uuid REFERENCES public.nucleos_familiares(id),
  research_item_id uuid REFERENCES public.research_cases(id),
  primary_research_person_id uuid REFERENCES public.research_people(id),
  title text NOT NULL,
  generation text,
  finding_type text NOT NULL,
  internal_summary text,
  confirmed_facts text,
  facts_to_confirm text,
  period_start date,
  period_end date,
  locality text,
  family_relationship text,
  relevance text NOT NULL DEFAULT 'media',
  validation_status text NOT NULL DEFAULT 'rascunho',
  evidence_links uuid[] NOT NULL DEFAULT '{}',
  source_links uuid[] NOT NULL DEFAULT '{}',
  negative_source_consulted_at date,
  negative_next_action text,
  tree_impact text NOT NULL DEFAULT 'nenhum',
  timeline_impact text NOT NULL DEFAULT 'nenhum',
  planning_impact text,
  eligible_for_client_deliverable boolean NOT NULL DEFAULT false,
  client_deliverable_id uuid REFERENCES public.client_deliverables(id),
  responsible_user_id uuid,
  found_at date NOT NULL DEFAULT current_date,
  validated_at timestamptz,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT gf_tipo_chk CHECK (finding_type IN (
    'registro_civil','registro_religioso','registro_militar','migracao',
    'naturalizacao_nacionalidade','patrimonio_notarial','correspondencia_familiar',
    'foto_acervo_visual','estrutura_familiar','linha_do_tempo','localidade',
    'documento_divergente','resultado_negativo_pesquisa','hipotese_pesquisa','outro')),
  CONSTRAINT gf_relev_chk CHECK (relevance IN ('baixa','media','alta','critica')),
  CONSTRAINT gf_valid_chk CHECK (validation_status IN ('rascunho','em_revisao','validado_internamente','divergente','arquivado')),
  CONSTRAINT gf_tree_chk CHECK (tree_impact IN ('nenhum','proposto','aplicado')),
  CONSTRAINT gf_timeline_chk CHECK (timeline_impact IN ('nenhum','proposto','aplicado')),
  CONSTRAINT gf_periodo_chk CHECK (period_end IS NULL OR period_start IS NULL OR period_end >= period_start),
  CONSTRAINT gf_outro_chk CHECK (finding_type <> 'outro' OR coalesce(btrim(internal_summary),'') <> '')
);

GRANT SELECT, INSERT, UPDATE ON public.genealogical_findings TO authenticated;
GRANT ALL ON public.genealogical_findings TO service_role;
ALTER TABLE public.genealogical_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY genealogical_findings_sel ON public.genealogical_findings
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY genealogical_findings_ins ON public.genealogical_findings
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY genealogical_findings_upd ON public.genealogical_findings
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE TABLE public.lineage_encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  family_id uuid REFERENCES public.nucleos_familiares(id),
  lineage_path_a_id uuid,
  lineage_path_b_id uuid,
  encounter_type text NOT NULL,
  title_internal text NOT NULL,
  title_client text,
  contexto_historico text,
  territorios_migratorios text,
  memoria_familiar text,
  praticas_culturais_documentadas text,
  encontros_no_brasil text,
  repertorios_narrativos text,
  resumo_interno text,
  resumo_aprovado_cliente text,
  evidence_links_a uuid[] NOT NULL DEFAULT '{}',
  evidence_links_b uuid[] NOT NULL DEFAULT '{}',
  evidence_links uuid[] GENERATED ALWAYS AS (evidence_links_a || evidence_links_b) STORED,
  confidence_internal text NOT NULL DEFAULT 'hipotese',
  validation_status text NOT NULL DEFAULT 'rascunho',
  disclaimer_obrigatorio boolean NOT NULL DEFAULT false,
  tree_impact text NOT NULL DEFAULT 'nenhum',
  timeline_impact text NOT NULL DEFAULT 'nenhum',
  approval_status text NOT NULL DEFAULT 'nao_submetido',
  client_deliverable_id uuid REFERENCES public.client_deliverables(id),
  responsible_user_id uuid,
  data_marco date,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT le_tipo_chk CHECK (encounter_type IN (
    'conexao_confirmada','convergencia_documental','separacao_de_ramos',
    'linha_paralela_relevante','dupla_linhagem_familiar','marco_de_origem')),
  CONSTRAINT le_conf_chk CHECK (confidence_internal IN ('hipotese','indicio','consistente','documentado')),
  CONSTRAINT le_valid_chk CHECK (validation_status IN ('rascunho','em_revisao','validado_internamente','divergente','arquivado')),
  CONSTRAINT le_aprov_chk CHECK (approval_status IN ('nao_submetido','em_aprovacao','aprovado','recusado')),
  CONSTRAINT le_tree_chk CHECK (tree_impact IN ('nenhum','proposto','aplicado')),
  CONSTRAINT le_timeline_chk CHECK (timeline_impact IN ('nenhum','proposto','aplicado'))
);

GRANT SELECT, INSERT, UPDATE ON public.lineage_encounters TO authenticated;
GRANT ALL ON public.lineage_encounters TO service_role;
ALTER TABLE public.lineage_encounters ENABLE ROW LEVEL SECURITY;

CREATE POLICY lineage_encounters_sel ON public.lineage_encounters
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY lineage_encounters_ins ON public.lineage_encounters
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY lineage_encounters_upd ON public.lineage_encounters
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- Linguagem proibida em texto cliente-facing (determinista/terapêutica/traço psicológico)
CREATE OR REPLACE FUNCTION public.fn_linguagem_proibida(_txt text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE t text; termo text;
BEGIN
  IF _txt IS NULL OR btrim(_txt) = '' THEN RETURN NULL; END IF;
  t := lower(unaccent_imutavel(_txt));
  FOREACH termo IN ARRAY ARRAY[
    'garantido','garantia de','com certeza','certamente','sem duvida','prova definitiva',
    'voce tem direito','direito garantido','cidadania garantida','aprovacao garantida',
    'cura','curar','trauma ancestral','ferida ancestral','energia ancestral','karma',
    'destino','missao de alma','alma da familia','herdou a forca','herdou a coragem',
    'sangue guerreiro','dna de','temperamento herdado','traco de personalidade ancestral',
    'espirito de superacao herdado'
  ] LOOP
    IF position(termo in t) > 0 THEN RETURN termo; END IF;
  END LOOP;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.unaccent_imutavel(_t text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT translate($1,
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
    'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')
$$;

REVOKE ALL ON FUNCTION public.fn_linguagem_proibida(text) FROM public, anon;
REVOKE ALL ON FUNCTION public.unaccent_imutavel(text) FROM public, anon;

CREATE OR REPLACE FUNCTION public.fn_gf_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_termo text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_BLOQUEADA: achados genealógicos só podem ser arquivados.';
  END IF;

  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL OR v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'CASO_FORA_DA_ORGANIZACAO: achado precisa pertencer ao caso da mesma organização.';
  END IF;

  -- Regra 1: achado exige ao menos uma fonte ou evidência.
  IF coalesce(array_length(NEW.evidence_links, 1), 0) = 0
     AND coalesce(array_length(NEW.source_links, 1), 0) = 0 THEN
    RAISE EXCEPTION 'ACHADO_SEM_EVIDENCIA: informe ao menos uma evidência ou fonte antes de gravar o achado.';
  END IF;

  -- Regra 2: resultado negativo exige fonte consultada, data e próxima ação alternativa.
  IF NEW.finding_type = 'resultado_negativo_pesquisa' THEN
    IF coalesce(array_length(NEW.source_links, 1), 0) = 0
       OR NEW.negative_source_consulted_at IS NULL
       OR coalesce(btrim(NEW.negative_next_action), '') = '' THEN
      RAISE EXCEPTION 'RESULTADO_NEGATIVO_INCOMPLETO: registre fonte consultada, data da consulta e próxima ação alternativa.';
    END IF;
  END IF;

  -- Regra 3: validado internamente ≠ conclusão jurídica. Elegibilidade só após validação humana.
  IF NEW.eligible_for_client_deliverable AND NEW.validation_status <> 'validado_internamente' THEN
    RAISE EXCEPTION 'ELEGIBILIDADE_SEM_VALIDACAO: só achado validado internamente pode ser elegível para entrega ao cliente.';
  END IF;
  IF NEW.client_deliverable_id IS NOT NULL AND NOT NEW.eligible_for_client_deliverable THEN
    RAISE EXCEPTION 'ENTREGA_SEM_ELEGIBILIDADE: vincule a entrega apenas após marcar o achado como elegível.';
  END IF;

  -- Regra: atualização de árvore/timeline exige revisão interna concluída.
  IF (NEW.tree_impact = 'aplicado' OR NEW.timeline_impact = 'aplicado')
     AND NEW.validation_status <> 'validado_internamente' THEN
    RAISE EXCEPTION 'IMPACTO_SEM_REVISAO: árvore e linha do tempo só recebem impacto aplicado após validação interna.';
  END IF;

  -- Hipótese nunca se apresenta como fato confirmado.
  IF NEW.finding_type = 'hipotese_pesquisa' AND NEW.validation_status = 'validado_internamente' THEN
    RAISE EXCEPTION 'HIPOTESE_NAO_VALIDAVEL: hipótese de pesquisa não pode ser marcada como validada; converta o tipo quando houver documento.';
  END IF;

  IF NEW.validation_status = 'validado_internamente' AND NEW.validated_at IS NULL THEN
    NEW.validated_at := now();
  END IF;
  IF NEW.validation_status <> 'validado_internamente' THEN
    NEW.validated_at := NULL;
  END IF;

  v_termo := public.fn_linguagem_proibida(NEW.planning_impact);
  IF v_termo IS NOT NULL THEN
    RAISE EXCEPTION 'LINGUAGEM_PROIBIDA: expressão "%" não é aceita (determinista/terapêutica).', v_termo;
  END IF;

  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  IF TG_OP = 'INSERT' THEN NEW.created_by := auth.uid(); END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    IF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
      NEW.archived_by := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_gf_guard BEFORE INSERT OR UPDATE OR DELETE ON public.genealogical_findings
  FOR EACH ROW EXECUTE FUNCTION public.fn_gf_guard();

CREATE OR REPLACE FUNCTION public.fn_le_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; v_termo text; v_campo text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'EXCLUSAO_FISICA_BLOQUEADA: encontros de linhagem só podem ser arquivados.';
  END IF;

  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL OR v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'CASO_FORA_DA_ORGANIZACAO: encontro precisa pertencer ao caso da mesma organização.';
  END IF;

  -- Regra: duas linhas e evidência de cada lado, salvo marco de origem.
  IF NEW.encounter_type <> 'marco_de_origem' THEN
    IF NEW.lineage_path_a_id IS NULL OR NEW.lineage_path_b_id IS NULL THEN
      RAISE EXCEPTION 'ENCONTRO_SEM_DUAS_LINHAS: informe as duas linhas de linhagem envolvidas.';
    END IF;
    IF NEW.lineage_path_a_id = NEW.lineage_path_b_id THEN
      RAISE EXCEPTION 'ENCONTRO_LINHAS_IGUAIS: as duas linhas precisam ser distintas.';
    END IF;
    IF coalesce(array_length(NEW.evidence_links_a, 1), 0) = 0
       OR coalesce(array_length(NEW.evidence_links_b, 1), 0) = 0 THEN
      RAISE EXCEPTION 'ENCONTRO_SEM_EVIDENCIA_POR_LADO: cada linha precisa de ao menos uma evidência.';
    END IF;
  ELSIF coalesce(array_length(NEW.evidence_links_a, 1), 0) = 0 THEN
    RAISE EXCEPTION 'MARCO_SEM_EVIDENCIA: marco de origem exige ao menos uma evidência.';
  END IF;

  -- Hipótese não se apresenta como conexão confirmada.
  IF NEW.encounter_type = 'conexao_confirmada'
     AND (NEW.confidence_internal IN ('hipotese', 'indicio') OR NEW.validation_status <> 'validado_internamente') THEN
    RAISE EXCEPTION 'CONEXAO_NAO_COMPROVADA: conexão confirmada exige validação interna e confiança documental; registre como hipótese/convergência.';
  END IF;

  -- Aprovação exige disclaimer, resumo aprovado e validação interna.
  IF NEW.approval_status = 'aprovado' THEN
    IF NOT NEW.disclaimer_obrigatorio THEN
      RAISE EXCEPTION 'ENCONTRO_SEM_DISCLAIMER: aprovação exige disclaimer obrigatório marcado.';
    END IF;
    IF coalesce(btrim(NEW.resumo_aprovado_cliente), '') = '' THEN
      RAISE EXCEPTION 'ENCONTRO_SEM_RESUMO_APROVADO: escreva o resumo sanitizado antes de aprovar.';
    END IF;
    IF NEW.validation_status <> 'validado_internamente' THEN
      RAISE EXCEPTION 'APROVACAO_SEM_VALIDACAO: valide internamente antes de aprovar.';
    END IF;
  END IF;

  IF NEW.client_deliverable_id IS NOT NULL AND NEW.approval_status <> 'aprovado' THEN
    RAISE EXCEPTION 'PROJECAO_SEM_APROVACAO: encontro sem aprovação não cria projeção para o cliente.';
  END IF;

  IF (NEW.tree_impact = 'aplicado' OR NEW.timeline_impact = 'aplicado')
     AND NEW.validation_status <> 'validado_internamente' THEN
    RAISE EXCEPTION 'IMPACTO_SEM_REVISAO: árvore e linha do tempo só recebem impacto aplicado após validação interna.';
  END IF;

  FOREACH v_campo IN ARRAY ARRAY[
    coalesce(NEW.title_client, ''), coalesce(NEW.resumo_aprovado_cliente, ''),
    coalesce(NEW.repertorios_narrativos, ''), coalesce(NEW.memoria_familiar, '')
  ] LOOP
    v_termo := public.fn_linguagem_proibida(v_campo);
    IF v_termo IS NOT NULL THEN
      RAISE EXCEPTION 'LINGUAGEM_PROIBIDA: expressão "%" não é aceita em texto do cliente (determinista/terapêutica/traço psicológico).', v_termo;
    END IF;
  END LOOP;

  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  IF TG_OP = 'INSERT' THEN NEW.created_by := auth.uid(); END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    IF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
      NEW.archived_by := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_le_guard BEFORE INSERT OR UPDATE OR DELETE ON public.lineage_encounters
  FOR EACH ROW EXECUTE FUNCTION public.fn_le_guard();

CREATE INDEX idx_gf_caso ON public.genealogical_findings(case_id, validation_status);
CREATE INDEX idx_le_caso ON public.lineage_encounters(case_id, approval_status);