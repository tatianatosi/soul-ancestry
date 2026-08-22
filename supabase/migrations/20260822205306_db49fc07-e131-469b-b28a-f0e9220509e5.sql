-- ---------------------------------------------------------------------
-- G-02b — Ficha Piloto Genealógica: visibilidade e módulos históricos
-- Nada aqui cria pesquisa externa, documento, contato ou publicação.
-- ---------------------------------------------------------------------

ALTER TABLE public.genealogical_person_profiles
  ADD COLUMN IF NOT EXISTS nascimento_precisao text NOT NULL DEFAULT 'desconhecida'
    CHECK (nascimento_precisao IN ('exata','aproximada','estimada','desconhecida')),
  ADD COLUMN IF NOT EXISTS morte_precisao text NOT NULL DEFAULT 'desconhecida'
    CHECK (morte_precisao IN ('exata','aproximada','estimada','desconhecida')),
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.research_sources(id),
  ADD COLUMN IF NOT EXISTS responsible_user_id uuid,
  ADD COLUMN IF NOT EXISTS client_visibility text NOT NULL DEFAULT 'interna'
    CHECK (client_visibility IN ('interna','sanitizada','aprovada'));

ALTER TABLE public.genealogical_relationships
  ADD COLUMN IF NOT EXISTS client_visibility text NOT NULL DEFAULT 'interna'
    CHECK (client_visibility IN ('interna','sanitizada','aprovada'));

ALTER TABLE public.genealogical_events
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES public.nucleos_familiares(id),
  ADD COLUMN IF NOT EXISTS impact_type text
    CHECK (impact_type IN ('familiar','patrimonial','migratorio','documental','juridico','memoria')),
  ADD COLUMN IF NOT EXISTS data_precisao text NOT NULL DEFAULT 'desconhecida'
    CHECK (data_precisao IN ('exata','aproximada','estimada','desconhecida')),
  ADD COLUMN IF NOT EXISTS client_visibility text NOT NULL DEFAULT 'interna'
    CHECK (client_visibility IN ('interna','sanitizada','aprovada'));

-- relação refutada continua no histórico de pesquisa, fora da árvore ativa
ALTER TABLE public.genealogical_relationships
  DROP CONSTRAINT IF EXISTS genealogical_relationships_status_pesquisa_check;
ALTER TABLE public.genealogical_relationships
  ADD CONSTRAINT genealogical_relationships_status_pesquisa_check
  CHECK (status_pesquisa IN ('a_confirmar','pendente','hipotese','provavel','com_suporte','confirmado','refutado'));

-- ---------------------------------------------------------------------
-- Guarda comum dos módulos históricos
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_g02_modulo_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status_verificacao = 'confirmado'
     AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Registro histórico confirmado exige evidência ou fonte vinculada.';
  END IF;
  IF NEW.periodo_inicio IS NOT NULL AND NEW.periodo_fim IS NOT NULL
     AND NEW.periodo_fim < NEW.periodo_inicio THEN
    RAISE EXCEPTION 'Período final não pode ser anterior ao inicial.';
  END IF;
  RETURN NEW;
END $$;

DO $modulos$
DECLARE
  t text;
  tabelas text[] := ARRAY[
    'residences_migrations','occupations_assets','military_records','notarial_records',
    'cadastral_records','education_records','cultural_records','religious_records',
    'correspondence_records','social_political_records','audiovisual_records',
    'preserved_objects','historical_context_events'];
BEGIN
  FOREACH t IN ARRAY tabelas LOOP
    EXECUTE format($f$
      CREATE TABLE IF NOT EXISTS public.%I (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL REFERENCES public.organizations(id),
        case_id uuid NOT NULL REFERENCES public.crm_casos(id),
        family_id uuid REFERENCES public.nucleos_familiares(id),
        person_id uuid REFERENCES public.research_people(id),
        titulo text NOT NULL,
        subtipo text,
        periodo_inicio date,
        periodo_fim date,
        data_precisao text NOT NULL DEFAULT 'desconhecida'
          CHECK (data_precisao IN ('exata','aproximada','estimada','desconhecida')),
        localidade text,
        descricao_interna text,
        dados jsonb NOT NULL DEFAULT '{}'::jsonb,
        evidence_id uuid REFERENCES public.research_evidence_items(id),
        source_id uuid REFERENCES public.research_sources(id),
        institution_id uuid REFERENCES public.institutions(id),
        status_verificacao text NOT NULL DEFAULT 'pendente'
          CHECK (status_verificacao IN ('confirmado','provavel','hipotese','pendente','nao_aplicavel','refutado')),
        client_visibility text NOT NULL DEFAULT 'interna'
          CHECK (client_visibility IN ('interna','sanitizada','aprovada')),
        responsible_user_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        created_by uuid,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by uuid,
        archived_at timestamptz,
        archived_by uuid,
        archive_reason text
      )$f$, t);

    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
      USING (is_org_member(organization_id))$p$, t || '_sel', t);
    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR INSERT TO authenticated
      WITH CHECK (can_write(organization_id))$p$, t || '_ins', t);
    EXECUTE format($p$CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated
      USING (can_write(organization_id)) WITH CHECK (can_write(organization_id))$p$, t || '_upd', t);

    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (case_id, person_id)', t || '_caso_pessoa_idx', t);

    EXECUTE format($g$CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.fn_g02_meta()$g$, 'trg_' || t || '_meta', t);
    EXECUTE format($g$CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.fn_g02_modulo_guard()$g$, 'trg_' || t || '_guard', t);
    EXECUTE format($g$CREATE TRIGGER %I BEFORE DELETE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete()$g$, 'trg_' || t || '_nodel', t);
    EXECUTE format($g$CREATE TRIGGER %I AFTER INSERT OR UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit()$g$, 'trg_' || t || '_audit', t);
  END LOOP;
END $modulos$;