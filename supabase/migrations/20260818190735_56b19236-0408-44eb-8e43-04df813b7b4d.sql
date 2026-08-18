ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_status_check CHECK (status = ANY (ARRAY['rascunho','em_revisao','enviada','em_negociacao','aprovada','recusada','expirada','substituida']));
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS derivada_de_id uuid REFERENCES public.proposals(id);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS restaurado_em timestamptz;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS restaurado_por uuid;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS restauracao_motivo text;