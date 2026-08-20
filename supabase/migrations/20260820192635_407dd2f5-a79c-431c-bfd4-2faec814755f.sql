-- =====================================================================
-- G-02 — FICHA PILOTO GENEALÓGICA COMO ORIGEM CANÔNICA
-- Pessoas + relações + linhagens + eventos + evidências = árvore e timeline internas.
-- Nenhuma pesquisa externa, documento, contrato, cobrança ou publicação é tocada aqui.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. genealogical_person_profiles
-- ---------------------------------------------------------------------
CREATE TABLE public.genealogical_person_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  research_person_id uuid NOT NULL REFERENCES public.research_people(id),
  nome_completo text NOT NULL,
  nome_nascimento text,
  sexo text CHECK (sexo IS NULL OR sexo IN ('feminino','masculino','nao_informado','a_confirmar')),
  nascimento_data date,
  nascimento_data_aproximada text,
  nascimento_localidade text,
  morte_data date,
  morte_data_aproximada text,
  morte_localidade text,
  causa_morte text,
  sepultamento_localidade text,
  status_verificacao text NOT NULL DEFAULT 'pendente'
    CHECK (status_verificacao IN ('confirmado','provavel','hipotese','pendente','nao_aplicavel')),
  evidence_id uuid REFERENCES public.research_evidence_items(id),
  verified_at timestamptz,
  verified_by uuid,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
CREATE UNIQUE INDEX genealogical_person_profiles_person_uk
  ON public.genealogical_person_profiles (research_person_id);
CREATE INDEX genealogical_person_profiles_case_ix
  ON public.genealogical_person_profiles (case_id);

GRANT SELECT, INSERT, UPDATE ON public.genealogical_person_profiles TO authenticated;
GRANT ALL ON public.genealogical_person_profiles TO service_role;
ALTER TABLE public.genealogical_person_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY gpp_sel ON public.genealogical_person_profiles FOR SELECT TO authenticated
  USING (is_org_member(organization_id));
CREATE POLICY gpp_ins ON public.genealogical_person_profiles FOR INSERT TO authenticated
  WITH CHECK (can_write(organization_id));
CREATE POLICY gpp_upd ON public.genealogical_person_profiles FOR UPDATE TO authenticated
  USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- ---------------------------------------------------------------------
-- 2. name_variants
-- ---------------------------------------------------------------------
CREATE TABLE public.name_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  person_id uuid NOT NULL REFERENCES public.research_people(id),
  variante text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN (
    'grafia','traducao','italianizacao','aportuguesamento','apelido',
    'erro_documental','nome_religioso','outro')),
  periodo text,
  localidade text,
  estado_validacao text NOT NULL DEFAULT 'a_confirmar'
    CHECK (estado_validacao IN ('a_confirmar','em_analise','validada','descartada')),
  nivel_confianca text NOT NULL DEFAULT 'baixo'
    CHECK (nivel_confianca IN ('baixo','medio','alto')),
  evidence_id uuid REFERENCES public.research_evidence_items(id),
  source_id uuid REFERENCES public.research_sources(id),
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
CREATE UNIQUE INDEX name_variants_person_variante_uk
  ON public.name_variants (person_id, lower(btrim(variante)));

GRANT SELECT, INSERT, UPDATE ON public.name_variants TO authenticated;
GRANT ALL ON public.name_variants TO service_role;
ALTER TABLE public.name_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY nv_sel ON public.name_variants FOR SELECT TO authenticated
  USING (is_org_member(organization_id));
CREATE POLICY nv_ins ON public.name_variants FOR INSERT TO authenticated
  WITH CHECK (can_write(organization_id));
CREATE POLICY nv_upd ON public.name_variants FOR UPDATE TO authenticated
  USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- ---------------------------------------------------------------------
-- 3. genealogical_relationships
-- ---------------------------------------------------------------------
CREATE TABLE public.genealogical_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  person_from_id uuid NOT NULL REFERENCES public.research_people(id),
  person_to_id uuid NOT NULL REFERENCES public.research_people(id),
  relation_type text NOT NULL CHECK (relation_type IN (
    'pai_mae','filho','conjuge','irmao','tutor_representante',
    'padrinho_madrinha','colateral','a_confirmar')),
  relation_date date,
  relation_date_aproximada text,
  locality text,
  status_pesquisa text NOT NULL DEFAULT 'a_confirmar'
    CHECK (status_pesquisa IN ('a_confirmar','em_pesquisa','com_suporte','confirmado','descartado')),
  evidence_id uuid REFERENCES public.research_evidence_items(id),
  source_id uuid REFERENCES public.research_sources(id),
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  CONSTRAINT genealogical_relationships_nao_reflexiva CHECK (person_from_id <> person_to_id)
);
CREATE INDEX genealogical_relationships_from_ix ON public.genealogical_relationships (person_from_id);
CREATE INDEX genealogical_relationships_to_ix ON public.genealogical_relationships (person_to_id);
CREATE INDEX genealogical_relationships_case_ix ON public.genealogical_relationships (case_id);

GRANT SELECT, INSERT, UPDATE ON public.genealogical_relationships TO authenticated;
GRANT ALL ON public.genealogical_relationships TO service_role;
ALTER TABLE public.genealogical_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY gr_sel ON public.genealogical_relationships FOR SELECT TO authenticated
  USING (is_org_member(organization_id));
CREATE POLICY gr_ins ON public.genealogical_relationships FOR INSERT TO authenticated
  WITH CHECK (can_write(organization_id));
CREATE POLICY gr_upd ON public.genealogical_relationships FOR UPDATE TO authenticated
  USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- ---------------------------------------------------------------------
-- 4. genealogical_events
-- ---------------------------------------------------------------------
CREATE TABLE public.genealogical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  person_id uuid NOT NULL REFERENCES public.research_people(id),
  event_type text NOT NULL CHECK (event_type IN (
    'nascimento','batismo','casamento','morte','sepultamento','residencia',
    'migracao','servico_militar','patrimonio','outro')),
  start_date date,
  end_date date,
  approximate_date text,
  locality text,
  description_internal text,
  validation_status text NOT NULL DEFAULT 'pendente'
    CHECK (validation_status IN ('pendente','em_revisao','confirmado','descartado')),
  evidence_id uuid REFERENCES public.research_evidence_items(id),
  source_id uuid REFERENCES public.research_sources(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
CREATE INDEX genealogical_events_person_ix ON public.genealogical_events (person_id);
CREATE INDEX genealogical_events_case_ix ON public.genealogical_events (case_id);

GRANT SELECT, INSERT, UPDATE ON public.genealogical_events TO authenticated;
GRANT ALL ON public.genealogical_events TO service_role;
ALTER TABLE public.genealogical_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY ge_sel ON public.genealogical_events FOR SELECT TO authenticated
  USING (is_org_member(organization_id));
CREATE POLICY ge_ins ON public.genealogical_events FOR INSERT TO authenticated
  WITH CHECK (can_write(organization_id));
CREATE POLICY ge_upd ON public.genealogical_events FOR UPDATE TO authenticated
  USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- ---------------------------------------------------------------------
-- 5. lineage_paths
-- ---------------------------------------------------------------------
CREATE TABLE public.lineage_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  family_id uuid REFERENCES public.nucleos_familiares(id),
  nome_da_linha text NOT NULL,
  pessoa_ancora_id uuid REFERENCES public.research_people(id),
  tipo_da_linha text NOT NULL DEFAULT 'a_confirmar' CHECK (tipo_da_linha IN (
    'paterna','materna','direta','colateral','cidadania',
    'memoria_legado','dupla_familiar','alternativa','a_confirmar')),
  citizenship_track_id uuid REFERENCES public.citizenship_tracks(id),
  objetivo text,
  geracao_alvo text,
  status text NOT NULL DEFAULT 'em_estruturacao'
    CHECK (status IN ('em_estruturacao','em_pesquisa','com_suporte','bloqueada','concluida','descartada')),
  evidencias_chave text[] NOT NULL DEFAULT '{}',
  risco_principal text,
  proximo_marco text,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text
);
-- linha dupla: várias linhagens por caso, desde que com nomes distintos
CREATE UNIQUE INDEX lineage_paths_caso_nome_uk
  ON public.lineage_paths (case_id, lower(btrim(nome_da_linha)));

GRANT SELECT, INSERT, UPDATE ON public.lineage_paths TO authenticated;
GRANT ALL ON public.lineage_paths TO service_role;
ALTER TABLE public.lineage_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY lp_sel ON public.lineage_paths FOR SELECT TO authenticated
  USING (is_org_member(organization_id));
CREATE POLICY lp_ins ON public.lineage_paths FOR INSERT TO authenticated
  WITH CHECK (can_write(organization_id));
CREATE POLICY lp_upd ON public.lineage_paths FOR UPDATE TO authenticated
  USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

-- ---------------------------------------------------------------------
-- Guardas de integridade (G-02)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_g02_meta()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := coalesce(NEW.created_by, auth.uid());
    NEW.updated_by := coalesce(NEW.updated_by, auth.uid());
  ELSE
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    NEW.updated_at := now();
    NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
    IF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
      IF NEW.archive_reason IS NULL OR length(btrim(NEW.archive_reason)) < 5 THEN
        RAISE EXCEPTION 'Arquivamento exige motivo (archive_reason) com pelo menos 5 caracteres.';
      END IF;
      NEW.archived_by := coalesce(NEW.archived_by, auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- perfil: confirmado exige evidência
CREATE OR REPLACE FUNCTION public.fn_g02_perfil_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status_verificacao = 'confirmado' AND NEW.evidence_id IS NULL THEN
    RAISE EXCEPTION 'Perfil genealógico só pode ser confirmado com evidência vinculada (evidence_id).';
  END IF;
  IF NEW.status_verificacao = 'confirmado' THEN
    NEW.verified_at := coalesce(NEW.verified_at, now());
    NEW.verified_by := coalesce(NEW.verified_by, auth.uid());
  ELSE
    NEW.verified_at := NULL;
    NEW.verified_by := NULL;
  END IF;
  IF NEW.nascimento_data IS NOT NULL AND NEW.morte_data IS NOT NULL
     AND NEW.morte_data < NEW.nascimento_data THEN
    RAISE EXCEPTION 'Data de morte não pode ser anterior à data de nascimento.';
  END IF;
  RETURN NEW;
END $$;

-- variante: exige pessoa existente (FK) e não pode virar pessoa nova
CREATE OR REPLACE FUNCTION public.fn_g02_variante_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF length(btrim(coalesce(NEW.variante,''))) < 2 THEN
    RAISE EXCEPTION 'Variante de nome exige texto com pelo menos 2 caracteres.';
  END IF;
  IF NEW.estado_validacao = 'validada' AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Variante validada exige evidência ou fonte vinculada.';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.person_id <> OLD.person_id THEN
    RAISE EXCEPTION 'Variante de nome não pode ser transferida para outra pessoa.';
  END IF;
  RETURN NEW;
END $$;

-- relação: sem evidência permanece "a confirmar"
CREATE OR REPLACE FUNCTION public.fn_g02_relacao_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status_pesquisa IN ('com_suporte','confirmado')
     AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Relação só sai de "a confirmar" com evidência ou fonte vinculada.';
  END IF;
  RETURN NEW;
END $$;

-- evento: confirmado exige evidência ou fonte
CREATE OR REPLACE FUNCTION public.fn_g02_evento_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.validation_status = 'confirmado'
     AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Evento confirmado exige evidência ou fonte vinculada.';
  END IF;
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'Data final do evento não pode ser anterior à data inicial.';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_gpp_meta BEFORE INSERT OR UPDATE ON public.genealogical_person_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_meta();
CREATE TRIGGER trg_gpp_guard BEFORE INSERT OR UPDATE ON public.genealogical_person_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_perfil_guard();
CREATE TRIGGER trg_gpp_nodel BEFORE DELETE ON public.genealogical_person_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_nv_meta BEFORE INSERT OR UPDATE ON public.name_variants
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_meta();
CREATE TRIGGER trg_nv_guard BEFORE INSERT OR UPDATE ON public.name_variants
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_variante_guard();
CREATE TRIGGER trg_nv_nodel BEFORE DELETE ON public.name_variants
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_gr_meta BEFORE INSERT OR UPDATE ON public.genealogical_relationships
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_meta();
CREATE TRIGGER trg_gr_guard BEFORE INSERT OR UPDATE ON public.genealogical_relationships
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_relacao_guard();
CREATE TRIGGER trg_gr_nodel BEFORE DELETE ON public.genealogical_relationships
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_ge_meta BEFORE INSERT OR UPDATE ON public.genealogical_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_meta();
CREATE TRIGGER trg_ge_guard BEFORE INSERT OR UPDATE ON public.genealogical_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_evento_guard();
CREATE TRIGGER trg_ge_nodel BEFORE DELETE ON public.genealogical_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_lp_meta BEFORE INSERT OR UPDATE ON public.lineage_paths
  FOR EACH ROW EXECUTE FUNCTION public.fn_g02_meta();
CREATE TRIGGER trg_lp_nodel BEFORE DELETE ON public.lineage_paths
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();