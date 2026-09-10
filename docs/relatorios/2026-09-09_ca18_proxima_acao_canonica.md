# CA18-PROXIMA-ACAO-CANONICA — execução (09/09/2026)

## Achado

Painel Hoje (fila `casos_pendencia_documental`), Lista de Casos e Caso 360 já usavam a mesma RPC canônica (`proxima_acao_prioritaria`/`_lote`) via `obterProximaAcaoCanonica` (corte anterior desta mesma sessão). O painel "Onboarding e jornada" (`/ops`, `onboarding-jornada.functions.ts`) calculava sua própria "próxima ação" via `diagnosticarOnboarding` — uma segunda narrativa que podia mostrar texto e prazo diferentes para o mesmo caso.

## Alterado

`onboarding-jornada.functions.ts`: `obterPainelJornada` passa a chamar `proxima_acao_prioritaria_lote` (mesma RPC, mesmo lote) e empacotar cada resultado com `obterProximaAcaoCanonica` (mesma função de Caso 360/Lista de Casos). O texto e o prazo exibidos (`detalhes[].proxima_acao`/`prazo`) vêm da leitura canônica; o campo manual (`crm_casos.proxima_acao`) continua funcionando como fallback — mas dentro da própria regra da RPC (nível 8), nunca como segunda fonte concorrente.

## Preservado

`diagnosticarOnboarding` não foi removido nem alterado: continua calculando estado, status e bloqueios do onboarding — só deixou de narrar a "próxima ação" exibida, que passou a ser 100% canônica. Nenhuma tabela, checklist ou regra jurídica nova.

## Testes

`ca18-proxima-acao-canonica.test.ts` (6): a RPC em lote é chamada; o empacotamento usa `obterProximaAcaoCanonica`; o texto exibido vem da leitura canônica; `diagnosticarOnboarding` continua vivo para o resto do diagnóstico; nenhum vínculo novo é criado; as três superfícies originais (Painel Hoje, Lista de Casos, Caso 360) continuam usando a mesma função, sem regressão. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (202 arquivos, 1947 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma que bloqueie CA19.
