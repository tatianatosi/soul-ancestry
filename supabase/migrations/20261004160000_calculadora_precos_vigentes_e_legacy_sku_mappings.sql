-- Calculadora de orçamento por produto-pai e tabela de preços VIGENTE (v3.0,
-- 04/10/2026), decisão da Proprietária: "os itens que estavam como
-- REFERENCIA_RESGATADA ou PENDENTE_DE_HOMOLOGACAO passam a VIGENTE, e os
-- demais países entram como aprovados".
--
-- Aplicada no banco conectado e registrada em schema_migrations em 04/10/2026.

-- 1) VIGENTE entra no domínio; 'outros' entra como componente (o v3.0 §4 tem
--    a coluna Outros).
ALTER TABLE public.price_catalog_rescued DROP CONSTRAINT IF EXISTS price_catalog_rescued_price_status_check;
ALTER TABLE public.price_catalog_rescued ADD CONSTRAINT price_catalog_rescued_price_status_check
  CHECK (price_status = ANY (ARRAY['VIGENTE','REFERENCIA_RESGATADA','CONDICAO_PARTICULAR_DE_CASO','HOMOLOGADO_CATALOGO','PENDENTE_DE_HOMOLOGACAO','DIVERGENTE','ARQUIVADO']));

ALTER TABLE public.price_catalog_rescued DROP CONSTRAINT IF EXISTS price_catalog_rescued_price_component_check;
ALTER TABLE public.price_catalog_rescued ADD CONSTRAINT price_catalog_rescued_price_component_check
  CHECK (price_component = ANY (ARRAY['honorarios','despesas','taxas','outros','parcelas_padrao']));

-- 2) Promoção dos estados. CONDICAO_PARTICULAR_DE_CASO (a da Ana, R$ 9.600) e
--    ARQUIVADO (o curso) não são tocados, por decisão expressa do v3.0 §1.
UPDATE public.price_catalog_rescued
   SET price_status = 'VIGENTE',
       notes = coalesce(notes || ' | ', '') || 'Promovido a VIGENTE por decisão da Proprietária em 2026-10-04 (v3.0 da calculadora de orçamento).'
 WHERE price_status IN ('REFERENCIA_RESGATADA','PENDENTE_DE_HOMOLOGACAO','DIVERGENTE','HOMOLOGADO_CATALOGO')
   AND archived_at IS NULL;

-- 3) Hungria, Luxemburgo e Irlanda: vigentes como trilha, SEM valor. Só as
--    parcelas entram, e como padrão técnico declarado no próprio v3.0 §4
--    ("as parcelas de HU, LU e IE usam 6 apenas como padrão técnico").
INSERT INTO public.price_catalog_rescued
  (organization_id, item_id, country_code, phase, price_component, amount, currency, source_type, source_reference, source_date, price_status, case_only, notes)
SELECT o.id, 'CA-PROT-001', p.cc, 'F4', 'parcelas_padrao', 6, 'BRL',
       'decisao_proprietaria', 'calculadora-orcamento-produtos-pai-tabela-precos-vigente v3.0 §4', '2026-10-04',
       'VIGENTE', false,
       'Parcelas 6 como padrão técnico declarado no v3.0; honorários, despesas e taxas seguem sem valor (VALOR_NAO_CADASTRADO) até a Proprietária preencher.'
  FROM (VALUES ('HU'),('LU'),('IE')) p(cc)
 CROSS JOIN public.organizations o
 WHERE NOT EXISTS (
   SELECT 1 FROM public.price_catalog_rescued x
    WHERE x.country_code = p.cc AND x.price_component = 'parcelas_padrao' AND x.archived_at IS NULL
 );

-- 4) De-para SKU legado → produto-pai. v3.0 §8.3: "SKU deixa de ser chave de
--    cálculo e existe só em legacy_sku_mappings". Somente leitura no Desk.
CREATE TABLE IF NOT EXISTS public.legacy_sku_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  legacy_sku text NOT NULL,
  produto_pai_codigo text NOT NULL,
  modulo_nome text,
  country_code text,
  amount numeric,
  currency text DEFAULT 'BRL',
  source_reference text NOT NULL,
  decided_at date NOT NULL DEFAULT '2026-10-04',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  archive_motivo text,
  UNIQUE (organization_id, legacy_sku, produto_pai_codigo, country_code)
);

ALTER TABLE public.legacy_sku_mappings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='legacy_sku_mappings' AND policyname='lsm_select_org') THEN
    CREATE POLICY lsm_select_org ON public.legacy_sku_mappings FOR SELECT TO authenticated USING (is_org_member(organization_id));
  END IF;
END $$;

COMMENT ON TABLE public.legacy_sku_mappings IS
  'De-para SKU legado → produto-pai (v3.0 §8.3). O produto-pai rege orçamento, proposta e jornada; o SKU não é chave de cálculo.';

-- As 24 linhas do v3.0 §5 são semeadas pelo canal de dados, com
-- source_reference = 'v3.0 §5'. Nenhum valor foi inventado: todos vêm da
-- coluna "Valor (R$)" daquela tabela.
