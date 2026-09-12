# Entrega 1 — Sistema visual e App Home

**Status:** concluída, sem merge (aguardando aprovação de marca/layout)
**Data:** 2026-09-12
**Objetivo:** demonstrar fidelidade real em uma única tela pública (`/previa-app-cliente`).

## Fontes de verdade

- Guia de marca oficial: `docs/evolucao/recuperados/marca-oficial-2026-09-11/Apresentacao-Clube-Ancestral-OKI.pdf` (hex exatos: navy `#2F4B6E`, preto/tinta `#101010`, creme/marfim `#ECDFCD`, dourado `#FCB73A`, terracota `#9A3A2F`).
- Mockup aprovado de 17 páginas (Home do App Cliente, pág. 3).
- Imagem de referência enviada em 12/09 (paleta e composição do Desk + App).
- Logo vetorial oficial já presente em `public/marca/` e `public/clube-ancestral-logo.svg`, servido por `<BrandLogo />` — nenhum wordmark improvisado (o texto "Clube Ancestral" é tipografia, não logo).

## Achado que motivou parte do trabalho

`src/styles.css` dizia, em comentário, que a paleta OKI foi "aplicada globalmente em 23/08/2026" — mas `--background`/`--card` (o que `body`/cartões realmente usam) ficaram na paleta SaaS antiga (`#F7F1E7`/`#FFFFFF`) desde esse mesmo commit. Bug de dia zero, não regressão. Corrigido nesta entrega (ver também PR #125, aberto antes desta e com o mesmo achado, para o `main` puro).

## O que foi implementado

- **Tokens**: `--background`/`--card`/`--popover` corrigidos para o creme OKI aprovado em `:root` e no bloco isolado `[data-marca="guia"]`; `MARCA_CORES.fundo` idem. Navy/dourado/terracota/preto já estavam certos.
- **Logo**: confirmado — já é o asset vetorial oficial (`<BrandLogo />`), sem wordmark improvisado.
- **Topbar do App Cliente** (`portal-shell.tsx`): duas faixas navy como no mockup — marca no topo, "Bem-vinda [nome]" com avatar embaixo. Wordmark em itálico serifado.
- **Cards**: sombra suave (`box-shadow`) em vez de só borda, escopo restrito ao shell do portal (`[data-marca-guia="oki"] .bg-card`).
- **Home do App Cliente** (`src/routes/portal/index.tsx`): o card "Seu caso" virou hero navy com barra de progresso e stepper de 5 fases (Diagnóstico → Pesquisa → Reconstrução → Validação → Entrega), replicando a composição do mockup. Cards de "Progresso publicado" e "Próxima ação" migraram para dentro do hero, em tom navy mais claro. "Achados recentes" continua abaixo, sem alteração de conteúdo.

## Limite respeitado: sem dado = sem dado

Não existe policy de portal para uma fase real do caso hoje (`case_plans.fase_jornada` não tem RLS de cliente) — não toquei RLS/schema para viabilizar isso. Por isso:

- O stepper de 5 fases e o percentual (65%) **só aparecem na demo pública** (`/previa-app-cliente`, fixture `Sophia Piccoli`, claramente rotulada `DEMO — DADOS FICTÍCIOS`).
- O caminho do cliente real (`/portal`, dados de `meusCasos`) **não recebe `fase`** — continua mostrando só o que já era honesto antes (marcos publicados, sem % inventado). Testado explicitamente (ver testes).

## Testes

- Novo arquivo `src/lib/__tests__/entrega-1-sistema-visual-app-home.test.ts`: 7 testes (tokens corretos, hero navy, fase só na demo, cliente real sem fase inventada). Todos passando.
- Full suite: 233 arquivos / 2189 testes — 2186 passando; os 3 que falham (`onboarding-jornada.test.ts` e um segundo arquivo) são pré-existentes, introduzidos pelo merge da PR #122, confirmados via `git stash` antes de qualquer mudança minha.
- `tsc --noEmit`: 0 erros novos (os 25 erros pré-existentes de `pessoas.$clienteId.tsx`, também da PR #122, continuam — não fazem parte desta entrega).
- `vite build`: limpo.

## Prints de aceite

1. Home do App em desktop — `/previa-app-cliente`, 1440×900.
2. Home do App em mobile — `/previa-app-cliente`, 390×844.
3. Comparação lado a lado com a referência (mockup pág. 3 vs. entrega).

## Não incluído nesta entrega

- Sidebar/topbar/componentes-base do **Desk** (só o App Cliente foi trabalhado — Entrega 1 pede "uma única tela pública").
- Badge/tabela/status genéricos como componentes reutilizáveis formais — hoje usam classes Tailwind ad-hoc consistentes com os tokens corrigidos; não foi criado um design-system formal separado.
- Os 25 erros de `tsc` e os 3 testes falhando da PR #122 (pré-existentes, não relacionados a visual).

## Sem merge

Por instrução explícita: PR #123 permanece não aprovada, sem pedido de novo aceite de marca com base nos prints anteriores, e sem deploy de produção. Esta entrega vai em branch/PR própria, também sem merge, aguardando decisão.
