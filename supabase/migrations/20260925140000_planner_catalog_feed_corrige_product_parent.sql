-- Corrige 3 valores de `product_parent` em `planner_catalog_feed` que nunca
-- bateram com o nome exato dos 9 produtos-pai canônicos
-- (`src/lib/planejador-produtos-pai.ts`, confirmados pela Proprietária em
-- 07/09/2026). O erro vem do próprio seed original
-- (20260904180000_planner_catalog_feed_price_catalog_rescued.sql): dois dos
-- 6 itens `CA-GEN-MULTI-*` carregam um nome de produto-pai com texto
-- ligeiramente diferente do canônico. Como `agruparPorProdutoPai`
-- (src/lib/planejador-produtos-pai.ts) agrupa por igualdade exata de texto,
-- esses 3 itens sempre caíram no grupo "fora da lista canônica de 9" na
-- tela /catalogo, em vez do produto-pai real — e, como consequência visível,
-- "Pesquisa Genealógica por Ramo Familiar" (PP-03) e "História de Família,
-- Memória e Legado" (PP-08) sempre pareceram ter menos itens do que
-- realmente têm.
--
-- Aditiva: só corrige o texto de 3 linhas já existentes, mesmos valores de
-- todas as outras colunas. Nenhuma tabela nova, nenhum schema novo.
update public.planner_catalog_feed
set product_parent = 'Pesquisa Genealógica por Ramo Familiar'
where item_id in ('CA-GEN-MULTI-003', 'CA-GEN-MULTI-004')
  and product_parent = 'Pesquisa Genealógica por Ramo';

update public.planner_catalog_feed
set product_parent = 'História de Família, Memória e Legado'
where item_id = 'CA-GEN-MULTI-005'
  and product_parent = 'História, Memória e Legado Familiar';
