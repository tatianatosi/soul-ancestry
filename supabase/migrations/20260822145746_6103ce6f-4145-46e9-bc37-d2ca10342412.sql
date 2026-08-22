CREATE TABLE public.institutional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  versao text NOT NULL,
  status text NOT NULL DEFAULT 'under_legal_review',
  campos jsonb NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_configurado boolean NOT NULL DEFAULT false,
  observacao_governanca text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (organization_id, versao)
);

GRANT SELECT, INSERT, UPDATE ON public.institutional_profiles TO authenticated;
GRANT ALL ON public.institutional_profiles TO service_role;
ALTER TABLE public.institutional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY institutional_profiles_sel ON public.institutional_profiles
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY institutional_profiles_ins ON public.institutional_profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, 'admin'::public.app_role));
CREATE POLICY institutional_profiles_upd ON public.institutional_profiles
  FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, 'admin'::public.app_role))
  WITH CHECK (public.has_org_role(organization_id, 'admin'::public.app_role));

CREATE TRIGGER trg_institutional_profiles_updated_at
  BEFORE UPDATE ON public.institutional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_institutional_profiles_no_delete
  BEFORE DELETE ON public.institutional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TABLE public.institutional_profile_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  profile_id uuid NOT NULL REFERENCES public.institutional_profiles(id) ON DELETE RESTRICT,
  evento text NOT NULL,
  detalhe text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

GRANT SELECT, INSERT ON public.institutional_profile_events TO authenticated;
GRANT ALL ON public.institutional_profile_events TO service_role;
ALTER TABLE public.institutional_profile_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY institutional_profile_events_sel ON public.institutional_profile_events
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY institutional_profile_events_ins ON public.institutional_profile_events
  FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, 'admin'::public.app_role));

CREATE TRIGGER trg_institutional_profile_events_no_delete
  BEFORE DELETE ON public.institutional_profile_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE OR REPLACE FUNCTION public.fn_institutional_profile_events_imutavel()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Eventos do perfil institucional são append-only.';
END;
$$;

CREATE TRIGGER trg_institutional_profile_events_imutavel
  BEFORE UPDATE ON public.institutional_profile_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_institutional_profile_events_imutavel();

ALTER TABLE public.contract_versions
  ADD COLUMN IF NOT EXISTS institutional_profile_id uuid REFERENCES public.institutional_profiles(id),
  ADD COLUMN IF NOT EXISTS institutional_profile_snapshot jsonb;