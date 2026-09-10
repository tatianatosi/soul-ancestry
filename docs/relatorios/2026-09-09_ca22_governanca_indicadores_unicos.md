# CA22-GOVERNANCA-E-INDICADORES-UNICOS — execução (09/09/2026)

## Achado

Auditoria dos conceitos citados no objetivo (casos ativos, conversão, follow-up vencido, período financeiro, CAC/ROI, próxima ação, parâmetros) mostrou que a maioria já tinha fonte única de cortes anteriores desta sessão e de rodadas passadas:

- **Casos ativos**: um único contador (`eixo_operacao === "caso_ativo"`), lido igualmente por `onboarding-jornada.functions.ts`, `desk-operacional.tsx` e `painel-onboarding-jornada.tsx`.
- **Conversão/funil e follow-up vencido**: únicos em `conversao-funil.ts`, já com correção de bug documentada em 07/09/2026.
- **CAC/ROI**: fórmula única em `indicadores-marketing.ts` (`cac`/`roi`); `marketing-aquisicao.ts` reusa por alias (`cac as calcularCac`), nunca reimplementa.
- **Próxima ação**: unificada nesta série (CA18).

A lacuna real estava no próprio registro que deveria ser a fonte única de nomenclatura: `indicadores-governanca.ts` declarava `periodo: "Mês corrente"` para `IND-FIN-01` (Financeiro) e `IND-MKT-01/02/03` (Marketing) — mas nenhuma das duas telas usa mês calendário. `/financeiro` soma o acumulado sem filtro de período (achado de auditoria de 07/09/2026, já corrigido no texto da própria tela, mas nunca replicado no registro central). `/marketing` usa um recorte selecionável (`7d`/`30d`/`90d`/`365d`/`tudo`), com `tudo` como padrão — nunca mês calendário. O registro de indicadores mentia sobre o recorte real de dois domínios inteiros.

## Alterado

`src/lib/indicadores-governanca.ts`: campo `periodo` de `IND-FIN-01`, `IND-MKT-01`, `IND-MKT-02` e `IND-MKT-03` corrigido para descrever o recorte real de cada tela, em vez de "Mês corrente".

## Preservado

Nenhuma fórmula, tabela ou tela alterada — só a nomenclatura do registro de governança, para bater com o que as telas já fazem. As fontes únicas já existentes (casos ativos, funil/follow-up, CAC/ROI, próxima ação) foram verificadas e travadas por teste de regressão, sem duplicação.

## Testes

`ca22-governanca-indicadores-unicos.test.ts` (7): período declarado em `IND-FIN-01`/`IND-MKT-01/02/03` bate com o texto real de `financeiro.tsx` e `marketing-filtros-csv.ts`; fontes únicas pré-existentes (casos ativos, CAC/ROI, próxima ação) seguem intactas, sem duplicação. `npx tsc --noEmit` limpo. `npx vitest run --exclude '**/.claude/**'` — 206 arquivos, 1972 testes, todos passando. `npx vite build` — limpo.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma que bloqueie CA23.
