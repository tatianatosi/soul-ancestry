-- Condição comercial versionada do caso (04/10/2026).
--
-- A entidade `case_commercial_condition` estava no MODELO DE DADOS do Prompt
-- Canônico v2.1 desde 04/09, com a regra "Proposta deve ler exclusivamente
-- case_commercial_condition e approved_offer_items da versão aprovada" — e
-- nunca foi criada. Consequência medida em 04/10: as 7 páginas do Canva da Ana
-- estavam extraídas (`proposal_canva_pages.extracao_status = extraida`) e nada
-- lia aquilo; o preço continuava atravessando o gate de homologação de SKU do
-- `product_catalog`, que é legado e nunca se aplicou ao caso dela.
--
-- Aplicada no banco conectado e registrada em schema_migrations em 04/10/2026.

CREATE TABLE IF NOT EXISTS public.case_commercial_condition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL,
  proposal_id uuid,
  proposal_reference text,
  versao integer NOT NULL DEFAULT 1,
  approved_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  fees numeric,
  third_party_costs text,
  official_fees text,
  payment_terms text,
  responsaveis_financeiros jsonb NOT NULL DEFAULT '[]'::jsonb,
  parcelas integer,
  valor_parcela numeric,
  moeda text NOT NULL DEFAULT 'BRL',
  validity date,
  approval_status text NOT NULL DEFAULT 'rascunho',
  aprovado_por uuid,
  aprovado_em timestamptz,
  origem text NOT NULL,
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archive_motivo text,
  CONSTRAINT ccc_approval_status_chk CHECK (approval_status IN ('rascunho','em_revisao','aprovada','substituida','arquivada')),
  CONSTRAINT ccc_origem_chk CHECK (origem IN ('proposta_canva','planejador','condicao_particular','contrato','importacao_legado'))
);

-- Uma versão por número, por caso: alterar cria versão nova, nunca reescreve.
CREATE UNIQUE INDEX IF NOT EXISTS ccc_versao_unica
  ON public.case_commercial_condition (organization_id, case_id, versao)
  WHERE archived_at IS NULL;

ALTER TABLE public.case_commercial_condition ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='case_commercial_condition' AND policyname='ccc_select_org') THEN
    CREATE POLICY ccc_select_org ON public.case_commercial_condition FOR SELECT TO authenticated USING (is_org_member(organization_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='case_commercial_condition' AND policyname='ccc_write_org') THEN
    CREATE POLICY ccc_write_org ON public.case_commercial_condition FOR ALL TO authenticated
      USING (is_org_member(organization_id)) WITH CHECK (is_org_member(organization_id));
  END IF;
END $$;

COMMENT ON TABLE public.case_commercial_condition IS
  'Condição comercial versionada do caso (v2.1). A proposta e o contrato leem DAQUI, nunca de Planilha Mestre, PARAMETROS ou SKU legado. A condição de um caso nunca vira preço de catálogo nem vale para outro caso.';

-- A versão 1 da Ana é semeada pelo canal de dados a partir das páginas 4 e 6
-- do Canva já extraídas (R$ 4.800 + R$ 2.400 + R$ 2.400 = R$ 9.600; 3
-- assinaturas de R$ 320 × 10 meses; validade 19/08/2026). Nenhum valor foi
-- inferido.
