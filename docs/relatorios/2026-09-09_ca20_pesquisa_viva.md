# CA20-PESQUISA-VIVA — execução (09/09/2026)

## Achado

O card "Pesquisa/entregas" do Caso 360 (`casos.$caseId.index.tsx`) só continha 7 links de saída (Achados, Biblioteca de evidências, Pesquisa e documentos, Pessoas e linhagens, Plano de ação, Relatórios de fase, Fontes e integrações) — nenhum resumo real do que já existia para o caso. A leitura completa (evidência, hipótese/achado, lacuna/pendência, diligência, documento, entrega) já existe e já está em produção em `cadeiaPesquisaDoCaso` (pesquisa-cadeia.functions.ts), a mesma função que alimenta `/pesquisa-evidencias/$caseId`.

## Alterado

`src/routes/_authenticated/casos.$caseId.index.tsx`: importa `cadeiaPesquisaDoCaso`; nova query `qPesquisa` (mesma função, mesmo `caseId`, sem tabela/rota nova); o card "Pesquisa/entregas" ganhou uma linha de resumo acima dos 7 links — total de evidências, quantas comprovadas (`workflow_status === "validada_internamente"`), pendências/lacunas abertas (`status !== "resolvido"`) e achados — com estados de carregamento e erro. Os 7 links pré-existentes não foram tocados.

## Preservado

Nenhuma leitura nova/paralela: reaproveita exatamente a função que já serve `/pesquisa-evidencias/$caseId`, sem copiar a cadeia de pesquisa para dentro do Caso 360. Nenhuma conclusão automática de cidadania ou linhagem é exibida — o resumo é só contagem (comprovado/pendente), nunca um veredito. Nenhuma lista genérica fixa foi adicionada; os 7 links continuam levando ao contexto real de cada subtela.

## Testes

`ca20-pesquisa-viva.test.ts` (6): import e uso de `cadeiaPesquisaDoCaso`; confirma que `/pesquisa-evidencias/$caseId` usa a mesma função (fonte compartilhada); resumo calcula evidências/comprovadas/pendências/achados; ausência de texto de conclusão de cidadania/linhagem; os 7 links originais continuam presentes; query usa o mesmo `id` do caso e `retry: false`, como as demais queries da ficha. `npx tsc --noEmit` limpo. `npx vitest run --exclude '**/.claude/**'` — 204 arquivos, 1958 testes, todos passando. `npx vite build` — limpo.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma que bloqueie CA21.
