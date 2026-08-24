# 2026-08-24 — CA-LOVABLE-P2 — Identidade visual do Desk Intelligence (etapas 1–4)

- **Shell autenticado**: `BrandLogo` oficial na sidebar (`client-dark`, 34px, com subtítulo "Gestão de pesquisa") e no cabeçalho mobile (`client-light`, 30px). Sem fallback genérico.
- **Tokens semânticos** em `src/styles.css`: `--critico`, `--atencao`, `--sucesso`, `--bloqueio` (mais variantes suaves), expostos em `@theme inline` como `text-critico`, `bg-atencao-suave`, etc. Âmbar escurecido (#8A5A08) no lugar do dourado puro para atingir contraste AA em texto.
- **Componentes compartilhados** em `src/components/desk/ui-desk.tsx`: `PageHeader`, `SectionHeader`, `CardIndicador` (sem dado → "Sem dados suficientes"), `AlertaDesk`, `BadgeDesk`, `BarraFiltros`, `TabelaDesk` (Inter + tabular-nums + rolagem segura), `VazioDesk` e `CarregandoDesk` (skeleton com `aria-busy`).
- **Áreas prioritárias**: `/pesquisa` e `/evidencias` com subtítulo canônico "Fontes, evidências e próximos passos do caso — uso interno" e hierarquia explícita caso → hipótese → fonte → evidência → estado de validação. Carregamento, erro e vazio padronizados; foco visível dourado nos itens navegáveis.
- Tipografia: Cormorant em títulos/navegação, Inter em tabelas e dados densos.

Pendente: propagação dos componentes às demais áreas do briefing, capturas autenticadas e revisão de microcopy fora de Pesquisa.

Nenhuma alteração de dados, regra, RLS, gate, indicador, migration ou deploy. Nenhuma ação externa.
