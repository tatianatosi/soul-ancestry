-- Cadeia operacional: ligações ausentes entre elos já existentes (aditivo)

ALTER TABLE public.case_plans
  ADD COLUMN IF NOT EXISTS objetivo text,
  ADD COLUMN IF NOT EXISTS etapa text,
  ADD COLUMN IF NOT EXISTS composicao text,
  ADD COLUMN IF NOT EXISTS rota_confirmada text,
  ADD COLUMN IF NOT EXISTS perguntas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS marcos text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS entregas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS microentregas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dependencias_cliente text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dependencias_terceiros text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fontes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS regras_anexos text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS revisao_humana text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS versao integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plano_hash text,
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.case_plans(id),
  ADD COLUMN IF NOT EXISTS escopo_estruturado jsonb,
  ADD COLUMN IF NOT EXISTS product_catalog_id uuid REFERENCES public.product_catalog(id),
  ADD COLUMN IF NOT EXISTS responsavel_comercial text,
  ADD COLUMN IF NOT EXISTS responsavel_operacional text,
  ADD COLUMN IF NOT EXISTS preco_fonte_referencia text,
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;

ALTER TABLE public.commercial_conditions
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id),
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id),
  ADD COLUMN IF NOT EXISTS versao integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS conteudo_hash text,
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;

ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS service_orders_proposal_hash_uidx
  ON public.service_orders (proposal_id, conteudo_hash)
  WHERE proposal_id IS NOT NULL AND conteudo_hash IS NOT NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS proposals_plan_idx ON public.proposals (plan_id);
CREATE INDEX IF NOT EXISTS commercial_conditions_proposal_idx ON public.commercial_conditions (proposal_id);