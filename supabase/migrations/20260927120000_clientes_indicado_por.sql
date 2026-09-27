-- Fase B (27/09/2026) — "cadeia canônica executável": handoff Discovery
-- deve copiar, uma vez, nome/email/telefone/origem/indicado_por/
-- pais_interesse. `indicado_por` já existe em `leads` desde
-- 20260821140549, mas nunca existiu em `clientes` — Pessoa Canônica
-- perdia esse dado no momento da conversão. Aditiva, nullable, sem
-- backfill (histórico não é inventado retroativamente).

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS indicado_por text;

COMMENT ON COLUMN public.clientes.indicado_por IS
  'Fase B (27/09/2026): copiado uma vez de leads.indicado_por no handoff Discovery — nunca sincronizado depois.';
