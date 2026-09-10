# Arquivo — prompt do protótipo visual (agosto 2026)

Este texto era o README raiz. **Não descreve o produto atual.**

O Clube Ancestral em produção tem:

- App Cliente com **7 abas**: Home, Jornada, Radar, Árvore, Documentos, Legado, Conta.
- Desk com **8 grupos** (`GRUPOS_DESK`): Visão Geral, Marketing, Comercial, Casos 360, Pesquisa, Contratos e financeiro, Cliente, Biblioteca Mestre.

Paleta vigente: `src/lib/marca.ts` (navy `#2F4B6E`, dourado `#FCB73A`, creme `#ECDFCD`, terracota `#9A3A2F`). Mockup normativo: PDF de 17 páginas, não este briefing de 6 abas.

---

# Ancestral Canvas

Create a VISUAL-ONLY navigable mockup prototype (no backend, no auth, no real data) for 'Clube Ancestral' — a genealogy and European citizenship consulting service. Brand: navy blue (#1B2B4B), gold (#C9A84C), cream (#F5F0E8), terracotta (#8B4513). Logo: circular seal with a golden tree with visible roots on navy background, script text 'Clube Ancestral' beside it.

> **Nota de 24/08/2026:** o parágrafo acima é o prompt original do projeto,
> preservado como registro histórico — não é mais a paleta vigente. A
> paleta oficial foi atualizada em 23/08/2026 (aceite expresso da
> Proprietária, confirmado contra o PDF `CA - MARCA - Guia de Marca
> Apresentação`): navy `#2F4B6E`, dourado `#FCB73A`, creme `#ECDFCD`,
> terracota `#9A3A2F`, preto `#101010`. Fonte de verdade em código:
> `src/lib/marca.ts` e `src/styles.css`. Detalhe da migração em
> `docs/portal/CA-PORTAL-01_Aplicacao_Guia_de_Marca.md`.

BUILD TWO SEPARATE APPS in one project with a toggle switcher at the top to switch between them:

== APP 1: CLIENTE APP (mobile-first, also works on web) ==

Bottom navigation with 6 tabs: Home, Jornada, Radar, Árvore, Documentos, Biblioteca+Legado

HOME TAB: Status card (case active badge), progress bar (65% complete), 3 next steps cards, 'Pessoas Conectadas' counter showing 12 people found, recent micro-deliveries section with 2 items, upgrade nudge card at bottom.

JORNADA TAB: Dual timeline — left side shows ancestral history markers (1820, 1887, 1923, 1965, 2024), right side shows case progress milestones. Show 2 'union points' where family branches merge, marked with terracotta dots and a tag 'União de Ramos'. Emotional language.

RADAR TAB: Full SVG radar/spider chart with 6 axes: Documentação, Origem, Conexões Familiares, Elegibilidade, Memória, Legado. Show filled polygon in gold. Below the chart show 6 score cards for each axis with percentages.

ÁRVORE TAB: Family tree G1 to G5, simplified visual. G1=client (1 node), G2=parents (2 nodes), G3=grandparents (4 nodes), G4=great-grandparents (4 nodes shown), G5=ancestors (3 nodes). Show connecting lines. Mark 2 nodes as 'conectado' with gold border. Show total: '12 pessoas conectadas recuperadas'.

DOCUMENTOS TAB: List of 6 documents — 3 delivered (green check), 2 pending (orange clock), 1 in review (blue eye). Each with name, date, status badge.

BIBLIOTECA + LEGADO TAB: Two sections. BIBLIOTECA: 3 micro-delivery cards (achado comentado, registro histórico, nota de contexto) — visible. LEGADO: premium locked section with purple lock icon, text 'Desbloqueie sua História Familiar', upgrade button.

== APP 2: DESK INTELLIGENCE (internal team view, sidebar layout for desktop) ==

Left sidebar navigation: Visão Geral, Casos 360, Checklist, Radar Interno, Alertas, Biblioteca Mestre

VISÃO GERAL: KPI cards row — Active Cases (23), Pending Alerts (7), This Month Revenue (R$18.400), Conversion Rate (34%). Below: 'Alertas de Achados Pendentes' table showing 5 alerts not yet sent to clients (client name, alert type, days waiting). Priority checklist preview.

CASOS 360: Table with 6 client cases — columns: Nome, País Alvo, Estágio, Saúde do Caso (colored dot), Próxima Ação, Ticket. Show colored health indicators.

CHECKLIST (PRIORITY): Large checklist view — 3 sections: 'Confirmar' (3 checked items), 'Em Revisão' (4 items), 'Pendente Crítico' (3 items in red). This is the most prominent internal tool.

RADAR INTERNO: Full radar chart showing 4 client cases overlaid as different colored polygons for comparison/balance analysis. Legend showing each client name.

ALERTAS: Alert management table — columns: Cliente, Tipo de Alerta, Descoberta, Dias em Espera, Status (Enviar button). Show 7 pending alerts with different types.

BIBLIOTECA MESTRE: Grid of content cards — dossiês, registros, narrativas — organized by case. Show production status.

Make everything visually polished, clickable between screens, use the brand colors throughout. All text in Portuguese (Brazil). This is purely visual for client approval — no real functionality needed.
