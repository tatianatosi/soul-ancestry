CREATE TABLE public.owner_override_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL DEFAULT auth.uid(),
  actor_papel text NOT NULL DEFAULT 'admin',
  categoria text NOT NULL CHECK (categoria IN ('override_interno','confirmacao_externa')),
  acao text NOT NULL,
  entidade text NOT NULL,
  entidade_id text,
  campo text,
  valor_anterior jsonb,
  valor_novo jsonb,
  motivo text NOT NULL CHECK (length(btrim(motivo)) >= 10),
  fonte text,
  impacto text,
  destinatario text,
  conteudo_resumo text,
  valor_financeiro numeric,
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  dados_enviados jsonb,
  acao_externa boolean NOT NULL DEFAULT false,
  irreversivel boolean NOT NULL DEFAULT false,
  confirmacao_manual boolean NOT NULL DEFAULT false,
  executado boolean NOT NULL DEFAULT false,
  pendencias_assumidas jsonb NOT NULL DEFAULT '[]'::jsonb,
  dados_teste boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.owner_override_events TO authenticated;
GRANT ALL ON public.owner_override_events TO service_role;

ALTER TABLE public.owner_override_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizacao le suas decisoes de proprietaria"
ON public.owner_override_events FOR SELECT TO authenticated
USING (organization_id IN (
  SELECT om.organization_id FROM public.organization_members om
  WHERE om.user_id = auth.uid() AND om.archived_at IS NULL
));

CREATE POLICY "Somente admin registra decisao de proprietaria"
ON public.owner_override_events FOR INSERT TO authenticated
WITH CHECK (
  actor_user_id = auth.uid()
  AND public.has_org_role(organization_id, 'admin'::public.app_role)
);

CREATE OR REPLACE FUNCTION public.fn_owner_override_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'owner_override_events e append-only: alteracao ou exclusao nao permitida';
END;
$$;

CREATE TRIGGER trg_owner_override_append_only
BEFORE UPDATE OR DELETE ON public.owner_override_events
FOR EACH ROW EXECUTE FUNCTION public.fn_owner_override_append_only();

CREATE INDEX idx_owner_override_org_data ON public.owner_override_events (organization_id, created_at DESC);
