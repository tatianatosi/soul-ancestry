# CA15-COMERCIAL-E-FONTE-VIVA — execução (09/09/2026)

## Achado

`RegraComercial` (usada em `/propostas`) já mostrava SKU + origem + preço homologado + fonte + exceção comercial — mas duas peças prontas nunca eram chamadas: `conflitoPlanejadorProposta` (perfil-institucional.ts, testada, zero consumidores em produção) e o enriquecimento de produto-pai do CA09 (`planejador-produtos-pai.ts`, usado só em Caso e Catálogo). Resultado: o preço homologado do SKU e o valor declarado na proposta do mesmo caso podiam divergir sem nenhum aviso, e a tela mostrava SKU técnico sem o produto-pai (a decisão real, por regra do CA09).

## Alterado

`regra-comercial.functions.ts`: `conferirRegraComercial` passa a buscar `planner_catalog_feed` (produto-pai do SKU) e a proposta ativa do caso (`proposals`, mesmo `case_id`, versão mais recente), e a calcular `conflitoValor` via `conflitoPlanejadorProposta` (preço homologado × valor da proposta) — nenhum valor é sobrescrito. `regra-comercial.tsx`: mostra "Produto-pai" antes do "SKU do caso (técnico)", e um bloco de conciliação quando há divergência real, com o motivo da própria função existente.

## Preservado

Planilha Mestre não ganhou leitor novo — nenhuma referência a `catalogo-fonte-mestre.ts` foi adicionada. `sku_preco_homologado` (RPC), `sku_price_exceptions` e o fluxo de exceção comercial continuam exatamente como estavam.

## Testes

`ca15-comercial-fonte-viva.test.ts` (8): produto-pai e conflito reaproveitam funções já existentes (não inventam regra nova); proposta lida é do mesmo caso; nenhuma leitura da Planilha Mestre; payload retorna os três campos novos; componente mostra produto-pai/SKU/conciliação sem campo editável de preço. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (199 arquivos, 1928 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Parcelas e vencimentos (quantidade_parcelas/valor_mensal_total, já existentes em `CAMPOS_COMPLEMENTAVEIS_PELA_PROPOSTA`) ainda não entram nesta conciliação — só valor total. Não bloqueia CA16.
