# CA17-MARKETING-E-INDICADORES-VIVOS — execução (09/09/2026)

## Achado

Campanha, canal, período, investimento, origem de lead e conversão já estavam ligados a dados reais desde o corte CA10 (mesma sessão): filtro de período/canal já se aplicava a leads/eventos/investimentos/atribuições antes de qualquer cálculo; leads por origem, casos por origem e desempenho por canal já eram honestos ("Sem dados suficientes" nunca estimativa); nenhuma atribuição automática existe (achado confirmado por leitura, não alterado). A lacuna real e específica: os 5 indicadores principais (leads por origem, conversões por canal, investimento por canal, CAC, ROI) já tinham fonte e confiança declaradas, mas nenhum abria o detalhe correspondente — "fonte, período e drill-down" exige as três partes juntas.

## Alterado

`marketing.tsx`: cada card de indicador principal agora é um link (`ANCORA_DRILLDOWN`) para a seção real da própria página — leads por origem → Atribuição e origem, conversões → Funil de aquisição, investimento por canal → Canais e campanhas, CAC/ROI → tabela "Desempenho por canal" (que ganhou `id="desempenho-canal"`). Nenhuma consulta nova, nenhuma rota nova: só âncoras dentro da mesma tela já filtrada.

## Preservado

`filtrarEntrada`, `desempenhoAgregado`, `casosPorOrigem`, `leituraMetricas` (todos de CA10) não foram alterados — só confirmados por teste como já corretamente escopados por período/canal antes de qualquer indicador ser calculado.

## Testes

`ca17-marketing-indicadores-vivos.test.ts` (5): as 5 âncoras existem; o nome do indicador é link, não texto morto; CAC/ROI apontam para a tabela real; leads/conversão/investimento apontam para seções já existentes; período/canal já filtram a entrada antes do cálculo dos indicadores. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (201 arquivos, 1941 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma que bloqueie CA18.
