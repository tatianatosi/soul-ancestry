-- A. Taxonomias controladas
CREATE TABLE public.controlled_taxonomies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  dominio text NOT NULL,
  codigo text NOT NULL,
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  versao text NOT NULL DEFAULT 'v1',
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  UNIQUE (organization_id, dominio, codigo, versao)
);

GRANT SELECT, INSERT, UPDATE ON public.controlled_taxonomies TO authenticated;
GRANT ALL ON public.controlled_taxonomies TO service_role;
ALTER TABLE public.controlled_taxonomies ENABLE ROW LEVEL SECURITY;

CREATE POLICY controlled_taxonomies_sel ON public.controlled_taxonomies
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY controlled_taxonomies_ins ON public.controlled_taxonomies
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY controlled_taxonomies_upd ON public.controlled_taxonomies
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- B. Regras jurídicas versionadas
CREATE TABLE public.versioned_legal_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  track_id uuid REFERENCES public.citizenship_tracks(id),
  tema text NOT NULL,
  versao text NOT NULL DEFAULT 'v1',
  vigencia_inicio date,
  vigencia_fim date,
  fonte_referencia text,
  escopo text,
  excecoes text,
  dados_necessarios text,
  status text NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','em_revisao','aprovado','arquivado')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  UNIQUE (organization_id, tema, versao)
);

GRANT SELECT, INSERT, UPDATE ON public.versioned_legal_rules TO authenticated;
GRANT ALL ON public.versioned_legal_rules TO service_role;
ALTER TABLE public.versioned_legal_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY versioned_legal_rules_sel ON public.versioned_legal_rules
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY versioned_legal_rules_ins ON public.versioned_legal_rules
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY versioned_legal_rules_upd ON public.versioned_legal_rules
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- C. Itens da Biblioteca Mestre
CREATE TABLE public.master_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  categoria text NOT NULL CHECK (categoria IN (
    'acervo','bases','dicionarios','trilhas','juridico',
    'governanca','modelos','top30','mapas','arquivo')),
  titulo text NOT NULL,
  descricao_interna text,
  versao text NOT NULL DEFAULT 'v1',
  status text NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','em_revisao','aprovado','arquivado')),
  owner text,
  referencia_interna text,
  arquivo_ou_url_interna text,
  substitui_item_id uuid REFERENCES public.master_library_items(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

GRANT SELECT, INSERT, UPDATE ON public.master_library_items TO authenticated;
GRANT ALL ON public.master_library_items TO service_role;
ALTER TABLE public.master_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY master_library_items_sel ON public.master_library_items
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY master_library_items_ins ON public.master_library_items
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY master_library_items_upd ON public.master_library_items
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- Guarda comum: sem exclusão física, arquivamento exige motivo, updated_at automático
CREATE OR REPLACE FUNCTION public.fn_biblioteca_mestre_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    NEW.updated_by := auth.uid();
    IF NEW.archived_at IS NOT NULL AND COALESCE(btrim(NEW.archive_motivo), '') = '' THEN
      RAISE EXCEPTION 'Arquivamento exige motivo registrado.';
    END IF;
    IF NEW.archived_at IS NOT NULL AND NEW.archived_by IS NULL THEN
      NEW.archived_by := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_controlled_taxonomies_guard
  BEFORE UPDATE ON public.controlled_taxonomies
  FOR EACH ROW EXECUTE FUNCTION public.fn_biblioteca_mestre_guard();
CREATE TRIGGER trg_versioned_legal_rules_guard
  BEFORE UPDATE ON public.versioned_legal_rules
  FOR EACH ROW EXECUTE FUNCTION public.fn_biblioteca_mestre_guard();
CREATE TRIGGER trg_master_library_items_guard
  BEFORE UPDATE ON public.master_library_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_biblioteca_mestre_guard();

CREATE TRIGGER trg_controlled_taxonomies_no_delete
  BEFORE DELETE ON public.controlled_taxonomies
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_versioned_legal_rules_no_delete
  BEFORE DELETE ON public.versioned_legal_rules
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_master_library_items_no_delete
  BEFORE DELETE ON public.master_library_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_controlled_taxonomies_audit
  AFTER INSERT OR UPDATE ON public.controlled_taxonomies
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
CREATE TRIGGER trg_versioned_legal_rules_audit
  AFTER INSERT OR UPDATE ON public.versioned_legal_rules
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
CREATE TRIGGER trg_master_library_items_audit
  AFTER INSERT OR UPDATE ON public.master_library_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();

CREATE INDEX idx_controlled_taxonomies_dominio ON public.controlled_taxonomies (organization_id, dominio, ativo);
CREATE INDEX idx_versioned_legal_rules_track ON public.versioned_legal_rules (organization_id, track_id, status);
CREATE INDEX idx_master_library_items_cat ON public.master_library_items (organization_id, categoria, status);