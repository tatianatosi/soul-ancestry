# De-para — Correção de `product_parent` em `planner_catalog_feed` (P6, 25/09/2026)

## Contexto

A Proprietária pediu para reconciliar a taxonomia de Produto-Pai contra os
documentos de 04/09 (matriz PP-01–PP08, reconciliação PP-01–PP14, motor
canônico PP-01–09) porque sentia que "temos poucos produtos no
planejador". Antes de qualquer decisão de taxonomia, investiguei o estado
real do banco (`mcp__Lovable__query_database`, projeto
`1a628b61-ec68-454f-85e1-671d6f297370`).

## Achado

A decisão de 07/09/2026 (PP-01–09, já confirmada e nunca reaberta) **já
estava aplicada** em `planner_catalog_feed` desde a migration original
(`20260904180000_planner_catalog_feed_price_catalog_rescued.sql`) — 75 dos
78 itens já carregavam o nome exato de um dos 9 produtos-pai canônicos.

Mas a própria migration original tinha 2 erros de texto, nunca notados
porque `agruparPorProdutoPai()` (`src/lib/planejador-produtos-pai.ts`)
agrupa por **igualdade exata de string**, sem normalização:

- `CA-GEN-MULTI-003`/`004`: `product_parent = 'Pesquisa Genealógica por
  Ramo'` (faltava "Familiar" no fim) — canônico é "Pesquisa Genealógica
  por Ramo Familiar" (PP-03).
- `CA-GEN-MULTI-005`: `product_parent = 'História, Memória e Legado
  Familiar'` — canônico é "História de Família, Memória e Legado" (PP-08).

Consequência visível na tela `/catalogo` (componente
`PlanejadorProdutosPai`): esses 3 itens caíam no grupo "Fora da lista
canônica de 9" em vez do produto-pai real, fazendo PP-03 e PP-08
parecerem ter menos itens do que realmente têm — a origem provável do
"temos poucos produtos no planejador".

**Achado à parte, não corrigido aqui**: `product_catalog.produto_pai_id`
(coluna real do catálogo comercial, distinta de
`planner_catalog_feed.product_parent`, a lista-alimento de referência)
está `null` em 100% das ~40 linhas comerciais ativas. A classificação por
produto-pai vive hoje só na lista-alimento (referência/orquestração), não
no catálogo comercial em si — confirmado consistente com o comentário de
`planner_catalog_feed`: "Produtos-pai são valores internos de
orquestração... não uma tabela/taxonomia nova". Não é um bug — é a
arquitetura decidida — mas registro aqui para não ser redescoberto como
"achado novo" numa próxima rodada.

**Achado que ainda pede decisão da Proprietária, não resolvido aqui**:
PP-05 ("Estratégia de Via e Composição Familiar") não tem **nenhum** item
em `planner_catalog_feed` — nem no seed original de 04/09, nem hoje.
Nenhum dos SKUs reais (`CA-CID-023`, candidato natural pela matriz
PP-01-08, que o consolidado PP-01-09 já reclassificou para PP-06
"Acompanhamento Familiar de Nacionalidade") foi atribuído a essa
categoria. Diferente do erro de texto acima, decidir o que (se algo)
pertence a PP-05 é conteúdo de produto, não bug — fica para a Proprietária.

## O que foi feito

Migration aditiva `supabase/migrations/20260925140000_planner_catalog_feed_corrige_product_parent.sql`:
2 `UPDATE`s, escopados por `item_id` + valor antigo exato, corrigindo só
o texto de 3 linhas já existentes para o nome canônico exato. Nenhuma
tabela nova, nenhum schema novo, nenhuma migração de taxonomia.

## Não tocado

- `product_catalog.produto_pai_id` (achado à parte, acima).
- PP-05 vazio (achado que pede decisão, acima).
- Qualquer conteúdo de SKU, preço ou status de homologação.
- A taxonomia em si (PP-01–09 continua a mesma, decidida em 07/09).

## Prova Lovable pós-push

Abrir `/catalogo`, seção "Planejador Universal · Produtos-pai e
multipaís" → conferir que "Pesquisa Genealógica por Ramo Familiar"
(PP-03) agora lista `CA-GEN-MULTI-003`/`004` e "História de Família,
Memória e Legado" (PP-08) lista `CA-GEN-MULTI-005` → conferir que o grupo
"Fora da lista canônica de 9" não contém mais esses 3 itens.
