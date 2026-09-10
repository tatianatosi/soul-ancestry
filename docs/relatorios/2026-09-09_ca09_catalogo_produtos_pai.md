# CA09-CATALOGO-PRODUTOS-PAI — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0. Nenhum produto, país, SKU, preço ou taxonomia criado — só consolidação de leitura já existente.

## Achado

O Caso (`AbaProdutoTrilha`, via `carregarCanonico`) já lia corretamente produto-pai (`planner_catalog_feed.product_parent`) desde 07/09. O Catálogo (`/catalogo`) não: sua tabela principal listava **SKU cru como primeira coluna e como decisão** ("Selecionável"/motivo), calculada por `selecionavelEmProposta` — um gate **paralelo**, baseado nos campos importados da Planilha Mestre (`status_fonte`/`status_produto`), diferente do gate real já usado no Caso (`product_catalog.status_homologacao`/`elegivel_para_proposta`). A cópia da tela e de `catalogo-referencia.ts`/`.tsx` também descrevia a Planilha Mestre como "fonte canônica" — invertendo a hierarquia real (o catálogo homologado é canônico; a planilha é só origem histórica).

## Consolidação feita

Extraído `construirMapaProdutoPaiPorCodigo`/`produtoPaiDoCodigo` (`planejador-produtos-pai.ts`) do código que já existia em `caso-canonico.functions.ts` — agora **a mesma função** é usada por Caso e por Catálogo (`catalogo-importacao.functions.ts`), nunca dois cálculos. `lerCatalogoImportado` passou a trazer também `tipo_oferta`, `status_homologacao`, `elegivel_para_proposta` (já existentes em `product_catalog`, sem coluna nova) e o produto-pai via o mesmo enriquecimento.

## Catálogo e Caso mostram o mesmo contexto

`/catalogo`: tabela reagrupada por **produto-pai**; colunas passam a ser Produto, **Contexto** (tipo_oferta), **Status de condição** (gate real via nova `elegivelParaPropostaReal`), **Origem** (Planilha Mestre, rotulada como rastreabilidade) e **SKU (técnico)** — SKU vira coluna secundária em fonte monoespaçada, nunca mais a chave de decisão. `selecionavelEmProposta` (Planilha Mestre) foi mantida como função pura testada — só não é mais o que a tela exibe como decisão.

## SKU e Planilha Mestre não bloqueiam

`salvarCaseService`/`payloadServico` nunca exigiram `product_catalog_id`: um `case_service` rascunho sem produto selecionado continua salvando normalmente. `catalogo-fonte-mestre.ts` (o snapshot da Planilha Mestre) segue importado só por `catalogo-importacao.ts` — dados estáticos, nenhuma chamada `.from(...)` de banco no mesmo arquivo; nenhum leitor operacional (`lerCatalogoImportado`, `caso-canonico.functions.ts`) o importa como fallback.

## Testes

`planejador-produtos-pai-enriquecimento.test.ts` (3): mapeamento por `item_id` e `legacy_aliases`; código fora da lista-alimento nunca é inventado. `ca09-catalogo-produtos-pai.test.ts` (11): gate real (`elegivelParaPropostaReal`) correto; Catálogo agrupa por produto-pai e mostra contexto/status/origem, SKU é coluna técnica; gate paralelo (`selecionavelEmProposta(i)`) não é mais usado na tela; Planilha Mestre rotulada como rastreabilidade; nenhuma tabela nova; nenhum leitor operacional da Planilha Mestre; Caso e Catálogo compartilham o mesmo enriquecimento; `case_service` sem SKU funciona. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (193 arquivos, 1858 testes) e `npx vite build` — todos limpos.

## Pendência (0 de até 5)

`catalogo-referencia.ts`/`.tsx` (fila de reconciliação Asaas) ainda organiza sua PRÓPRIA tabela por SKU com bloqueios comerciais — fora do escopo desta missão (não é sobre Produto-Pai/Planejador, é sobre reconciliação Asaas). Só a cópia foi corrigida para não chamar a Planilha Mestre de canônica. Reestruturar essa tela, se desejado, é corte à parte.

Commit: branch temporária → main → recovery.
