ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS ultima_atualizacao_material_em timestamptz,
  ADD COLUMN IF NOT EXISTS proximo_marco_verificavel text,
  ADD COLUMN IF NOT EXISTS aguardando_instituicao_externa boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS motivo_espera_externa text,
  ADD COLUMN IF NOT EXISTS proxima_atualizacao_limite_em date;

ALTER TABLE public.crm_interactions
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'outro',
  ADD COLUMN IF NOT EXISTS resultado text,
  ADD COLUMN IF NOT EXISTS proxima_acao text,
  ADD COLUMN IF NOT EXISTS prazo_proxima_acao date,
  ADD COLUMN IF NOT EXISTS visibilidade text NOT NULL DEFAULT 'interna',
  ADD COLUMN IF NOT EXISTS corrige_interacao_id uuid REFERENCES public.crm_interactions(id);

DO $$ BEGIN
  ALTER TABLE public.crm_interactions
    ADD CONSTRAINT crm_interactions_tipo_chk
    CHECK (tipo IN ('call','whatsapp','email','reuniao','sistema','outro'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.crm_interactions
    ADD CONSTRAINT crm_interactions_visibilidade_chk
    CHECK (visibilidade IN ('interna','cliente_aprovado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.client_deliverables
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS fallback_whatsapp_enviado boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.caso_saude_cadencia(_case uuid)
RETURNS TABLE(dias_sem_touchpoint integer, status_cadencia text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    GREATEST(0, (current_date - COALESCE(c.ultimo_touchpoint_em, c.created_at)::date))::int AS dias_sem_touchpoint,
    CASE
      WHEN c.aguardando_instituicao_externa AND COALESCE(c.motivo_espera_externa,'') <> '' THEN 'regular'
      WHEN (current_date - COALESCE(c.ultimo_touchpoint_em, c.created_at)::date) >= 14 THEN 'critico'
      WHEN (current_date - COALESCE(c.ultimo_touchpoint_em, c.created_at)::date) >= 10 THEN 'atencao'
      ELSE 'regular'
    END AS status_cadencia
  FROM public.crm_casos c
  WHERE c.id = _case;
$$;

GRANT EXECUTE ON FUNCTION public.caso_saude_cadencia(uuid) TO authenticated;