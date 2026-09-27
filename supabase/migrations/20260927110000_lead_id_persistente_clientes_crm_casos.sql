-- Corte A (27/09/2026) — "lead_id persistente": a Proprietária pediu que o
-- vínculo lead → cliente/caso deixe de ser só unidirecional
-- (`leads.case_id`). Adiciona `lead_id` nullable a `clientes` e
-- `crm_casos`, gravado só no momento da criação pelo handoff Discovery
-- (`handoff-discovery.functions.ts`) — nunca sobrescreve pessoa/caso já
-- existente reaproveitado. Aditiva, sem backfill: casos/clientes já
-- criados antes desta migration continuam com `lead_id` nulo (histórico,
-- não é inventado retroativamente).

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id);

ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id);

COMMENT ON COLUMN public.clientes.lead_id IS
  'Corte A (27/09/2026): lead de origem, gravado só na criação via handoff Discovery — nunca sobrescrito em reuso de pessoa existente.';
COMMENT ON COLUMN public.crm_casos.lead_id IS
  'Corte A (27/09/2026): lead de origem, gravado só na criação do caso via handoff Discovery.';
