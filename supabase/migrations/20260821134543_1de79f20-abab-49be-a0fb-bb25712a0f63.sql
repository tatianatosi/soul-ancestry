ALTER TABLE public.case_plans
  ADD COLUMN IF NOT EXISTS product_catalog_id uuid REFERENCES public.product_catalog(id);

CREATE INDEX IF NOT EXISTS idx_case_plans_product ON public.case_plans(product_catalog_id);

INSERT INTO public.product_catalog (organization_id, code, nome_comercial, familia_comercial, tipo_oferta, prioridade_catalogo, status_homologacao, elegivel_para_proposta, requer_fechamento_humano, observacao_de_governanca)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, v.code, v.nome, v.familia, 'complemento', 'TOP_30', 'em_revisao', false, true,
       'Importado no corte Top 30. Em revisão até homologação de preço, escopo e condição no Desk.'
FROM (VALUES
  ('CA-ASS-001','Assessoria — item 001','assessoria'),
  ('CA-ASS-002','Assessoria — item 002','assessoria'),
  ('CA-ASS-003','Assessoria — item 003','assessoria'),
  ('CA-ASS-004','Assessoria — item 004','assessoria'),
  ('CA-ASS-005','Assessoria — item 005','assessoria'),
  ('CA-CID-025','Cidadania — item 025','cidadania'),
  ('CA-FAM-002','Família — item 002','familia')
) AS v(code, nome, familia)
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_catalog p
  WHERE p.code = v.code AND p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid
);

UPDATE public.product_catalog
SET prioridade_catalogo = 'TOP_10', updated_at = now()
WHERE organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid
  AND code IN ('CA-CID-001','CA-CID-002','CA-CID-003','CA-CID-023','CA-HIST-001','CA-HIST-004','CA-MEM-003','CA-MEM-004','CA-ASS-002','CA-IND-005');

UPDATE public.product_catalog
SET prioridade_catalogo = 'TOP_30', updated_at = now()
WHERE organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid
  AND code IN ('CA-ASS-001','CA-ASS-003','CA-ASS-004','CA-ASS-005','CA-CID-006','CA-CID-009','CA-CID-016','CA-CID-018','CA-CID-019','CA-CID-020','CA-CID-021','CA-CID-025','CA-HIST-005','CA-HIST-006','CA-IND-001','CA-IND-002','CA-IND-006','CA-MEM-008','CA-COMBO-001','CA-FAM-002');