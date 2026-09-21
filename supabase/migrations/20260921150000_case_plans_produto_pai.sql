-- Produto-Pai canônico no plano do caso (Planejador Universal).
--
-- Decisão da Proprietária, 21/09/2026, regra de autoridade nº 2: "Planejador
-- de Cidadania + Produtos-Pai PP-01–PP-09 governam jornada, produto, marcos e
-- ligação multipaís. Eles não são catálogo decorativo."
--
-- Situação que esta migration corrige: os 9 produtos-pai existiam APENAS como
-- constante TypeScript (`src/lib/planejador-produtos-pai.ts`). Não havia
-- coluna alguma — nem em `case_plans`, nem em `crm_casos` — onde registrar o
-- produto-pai de um caso. A única ligação era um match por string do NOME
-- contra `planner_catalog_feed.product_parent`, calculado em tempo de leitura
-- para agrupar um <select> e descartado em seguida.
--
-- Esse caminho é justamente o que a regra de autoridade nº 4 proíbe usar para
-- definir produto, jornada, elegibilidade ou escopo (catálogo/SKU legado só
-- como histórico técnico). Daí a coluna própria, com o código canônico.
--
-- Aditiva e reversível: coluna nullable, nenhum dado existente é alterado,
-- nenhuma coluna existente é removida ou renomeada, sem backfill. Caso já
-- gravado sem produto-pai permanece válido e aparece como "sem produto-pai
-- definido" — estado explícito, nunca inventado.
--
-- O CHECK espelha `PRODUTOS_PAI_CANONICOS`. Um teste
-- (`bloco-d-produto-pai-contrato.test.ts`) lê este arquivo e falha se a lista
-- do TypeScript e este CHECK divergirem — o mesmo laço que já pegou drift
-- real em `fase_jornada` (um fixture gravava "fase_2", valor recusado).

ALTER TABLE public.case_plans
  ADD COLUMN IF NOT EXISTS produto_pai_id text;

DO $$ BEGIN
  ALTER TABLE public.case_plans
    ADD CONSTRAINT case_plans_produto_pai_chk
    CHECK (
      produto_pai_id IS NULL
      OR produto_pai_id IN (
        'PP-01',
        'PP-02',
        'PP-03',
        'PP-04',
        'PP-05',
        'PP-06',
        'PP-07',
        'PP-08',
        'PP-09'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.case_plans.produto_pai_id IS
  'Produto-Pai canônico do caso (PP-01..PP-09), fonte: PRODUTOS_PAI_CANONICOS em src/lib/planejador-produtos-pai.ts. Governa jornada, marcos e ligação multipaís (regra de autoridade 2, 21/09/2026). Não deriva do catálogo/SKU legado.';

CREATE INDEX IF NOT EXISTS case_plans_produto_pai_idx
  ON public.case_plans (produto_pai_id)
  WHERE produto_pai_id IS NOT NULL;
