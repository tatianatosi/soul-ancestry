# CA14-MATRIZES-DE-COMPOSICAO — execução (09/09/2026)

## Achado

As matrizes individual, casal e núcleo familiar (`MODELOS_CONTRATUAIS`, `matriz-modelos-contratuais.ts`) já existiam completas — regras de composição, anexos por modelo, gates — mas só eram exibidas como rascunho TESTE abstrato em `/governanca/modelos-contratuais`. Nenhuma tela as aplicava à composição real de um caso: a tela de preparação de contrato (`casos.$caseId.contrato.preparar.tsx`) já lê `d.membros` (via `pessoasDoCasoComFallbackNucleo`, com `titular`/`dependente` já resolvidos), mas só os listava em texto — nunca escolhia a matriz correspondente.

## Alterado

`matriz-modelos-contratuais.ts`: novas `classificarComposicaoCaso` e `modeloAplicavelAoCaso` — leem os papéis já resolvidos (titular/dependente) e escolhem individual/casal/núcleo (1 titular → individual; 2 titulares sem dependente → casal; dependente presente ou 3+ titulares → núcleo); sem titular confirmado, devolvem "sem_dados" em vez de supor. `casos.$caseId.contrato.preparar.tsx`: nova linha "Composição contratual (matriz aplicável)" mostrando a matriz escolhida, o motivo e os anexos aplicáveis daquele modelo — ou "Sem dados suficientes" quando o caso ainda não tem titular confirmado.

## Preservado

`MODELOS_CONTRATUAIS` (regras de composição, anexos, gates dos 3 modelos) não foi alterado — só passou a ser consultado por um novo classificador puro. `pessoasDoCasoComFallbackNucleo` não foi tocado: nenhuma fusão de pessoas de fontes diferentes, nenhum checklist jurídico novo criado.

## Testes

`ca14-matrizes-de-composicao.test.ts` (10): classificação honesta (sem pessoa/sem titular = sem_dados; 1 titular = individual; 2 = casal; dependente ou 3+ titulares = núcleo); `modeloAplicavelAoCaso` reaproveita regras/anexos existentes; a tela consome a função com os membros reais do caso e mostra composição + anexos aplicáveis + pendência honesta. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (198 arquivos, 1920 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma que bloqueie CA15. `governanca.modelos-contratuais.tsx` continua mostrando só o rascunho TESTE abstrato (não o caso real) — ficou fora de escopo por já cumprir seu propósito de referência jurídica.
