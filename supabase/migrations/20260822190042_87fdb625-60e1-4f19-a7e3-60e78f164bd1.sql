ALTER TABLE public.owner_override_events
  ADD COLUMN IF NOT EXISTS modulo text,
  ADD COLUMN IF NOT EXISTS operacao text;

CREATE INDEX IF NOT EXISTS owner_override_events_modulo_idx
  ON public.owner_override_events (organization_id, modulo, created_at DESC);