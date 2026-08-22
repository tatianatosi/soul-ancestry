ALTER TABLE public.product_catalog
  ADD COLUMN IF NOT EXISTS estado_catalogo text NOT NULL DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS prioridade_portfolio text NOT NULL DEFAULT 'cauda_longa',
  ADD COLUMN IF NOT EXISTS responsavel_comercial text,
  ADD COLUMN IF NOT EXISTS responsavel_operacional text,
  ADD COLUMN IF NOT EXISTS tipo_cobranca text NOT NULL DEFAULT 'sob_consulta',
  ADD COLUMN IF NOT EXISTS entregaveis jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS inclusoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exclusoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pre_requisitos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dependencias_externas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS escopo_aplicavel jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS regras_anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prazo_fonte_formal text,
  ADD COLUMN IF NOT EXISTS preco_estado_homologacao text NOT NULL DEFAULT 'nao_homologado',
  ADD COLUMN IF NOT EXISTS preco_fonte text,
  ADD COLUMN IF NOT EXISTS versao_catalogo text NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS planilha_mestre_versao text,
  ADD COLUMN IF NOT EXISTS planilha_mestre_identificador text,
  ADD COLUMN IF NOT EXISTS responsavel_validacao_fonte text,
  ADD COLUMN IF NOT EXISTS estado_reconciliacao text NOT NULL DEFAULT 'nao_reconciliado',
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS substituido_por uuid REFERENCES public.product_catalog(id);

ALTER TABLE public.product_catalog
  DROP CONSTRAINT IF EXISTS product_catalog_estado_catalogo_chk,
  DROP CONSTRAINT IF EXISTS product_catalog_prioridade_portfolio_chk,
  DROP CONSTRAINT IF EXISTS product_catalog_tipo_cobranca_chk,
  DROP CONSTRAINT IF EXISTS product_catalog_preco_estado_chk,
  DROP CONSTRAINT IF EXISTS product_catalog_estado_reconciliacao_chk;

ALTER TABLE public.product_catalog
  ADD CONSTRAINT product_catalog_estado_catalogo_chk CHECK (estado_catalogo = ANY (ARRAY['rascunho','em_revisao','homologado_ativo','pausado','arquivado','substituido'])),
  ADD CONSTRAINT product_catalog_prioridade_portfolio_chk CHECK (prioridade_portfolio = ANY (ARRAY['top_10','top_30','cauda_longa','fora_do_portfolio'])),
  ADD CONSTRAINT product_catalog_tipo_cobranca_chk CHECK (tipo_cobranca = ANY (ARRAY['avulsa','parcelada','recorrente','sob_consulta','nao_cobravel_diretamente'])),
  ADD CONSTRAINT product_catalog_preco_estado_chk CHECK (preco_estado_homologacao = ANY (ARRAY['nao_homologado','em_revisao','homologado','sob_consulta'])),
  ADD CONSTRAINT product_catalog_estado_reconciliacao_chk CHECK (estado_reconciliacao = ANY (ARRAY['nao_reconciliado','em_reconciliacao','reconciliado','divergente']));

CREATE UNIQUE INDEX IF NOT EXISTS product_catalog_org_code_uk ON public.product_catalog (organization_id, code);

COMMENT ON TABLE public.sku_catalog IS 'LEGADO: modelo substituído por public.product_catalog (modelo canônico de SKU/produto/preço). Não criar novos registros aqui.';

CREATE TABLE IF NOT EXISTS public.catalog_payment_link_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.product_catalog(id) ON DELETE RESTRICT,
  sku_codigo text NOT NULL,
  estado_link text NOT NULL DEFAULT 'nao_criado',
  tipo_link text NOT NULL DEFAULT 'nao_aplicavel',
  referencia_url text,
  valor_validado numeric,
  moeda text NOT NULL DEFAULT 'BRL',
  validado_em date,
  validado_por text,
  versao_sku_associada text,
  versao_preco_associada text,
  divergencia text,
  observacao_interna text,
  dados_teste boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT catalog_payment_link_estado_chk CHECK (estado_link = ANY (ARRAY['nao_criado','pendente_revisao','ativo_validado','ativo_em_uso','duplicado_sobreposto','desatualizado','pausado','arquivado','quebrado','nao_aplicavel'])),
  CONSTRAINT catalog_payment_link_tipo_chk CHECK (tipo_link = ANY (ARRAY['avulso','parcelado','recorrente','sob_consulta','nao_aplicavel']))
);

GRANT SELECT, INSERT, UPDATE ON public.catalog_payment_link_refs TO authenticated;
GRANT ALL ON public.catalog_payment_link_refs TO service_role;
ALTER TABLE public.catalog_payment_link_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY cplr_select ON public.catalog_payment_link_refs FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY cplr_insert ON public.catalog_payment_link_refs FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY cplr_update ON public.catalog_payment_link_refs FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE TRIGGER trg_cplr_updated
  BEFORE UPDATE ON public.catalog_payment_link_refs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.catalog_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  product_id uuid REFERENCES public.product_catalog(id) ON DELETE RESTRICT,
  sku_codigo text NOT NULL,
  evento text NOT NULL,
  campo text,
  valor_anterior text,
  valor_novo text,
  motivo text,
  ator uuid,
  ator_papel text,
  origem text NOT NULL DEFAULT 'desk',
  dados_teste boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.catalog_audit_events TO authenticated;
GRANT ALL ON public.catalog_audit_events TO service_role;
ALTER TABLE public.catalog_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY cae_select ON public.catalog_audit_events FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY cae_insert ON public.catalog_audit_events FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_catalog_audit_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Auditoria de catálogo é append-only: alteração ou exclusão não permitida.';
END;
$$;

CREATE TRIGGER trg_cae_append_only
  BEFORE UPDATE OR DELETE ON public.catalog_audit_events
  FOR EACH ROW EXECUTE FUNCTION public.fn_catalog_audit_append_only();