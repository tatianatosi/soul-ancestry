# Tokens — aprovado × atual × legado

Fonte canônica: `src/styles/tokens-clube-ancestral.css`.

## A. Marca — aprovado vs. atual

| Papel | Token canônico | Aprovado | `src/styles.css` | `src/lib/marca.ts` | `kit/tokens.css` | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| Navy estrutural | `--ca-navy` | `#13294B` | `--navy: #13294B` | `MARCA_CORES.azul` | `--ca-navy-950` | alinhado (hex duplicado em 3 lugares) |
| Navy topo/hero | `--ca-navy-hero` | `#1B365D` | `--navy-800: #1B365D` | `MARCA_CORES.azulHero` | `--ca-navy-800` | alinhado (duplicado) |
| Dourado | `--ca-gold` | `#C2A84D` | `--gold: #C2A84D` | `MARCA_CORES.dourado` | `--ca-gold` | alinhado (duplicado) |
| Texto/ícones | `--ca-ink` | `#28334A` | `--preto: #28334A` | `MARCA_CORES.preto` | `--ca-ink` | alinhado; nome `--preto` é enganoso |
| Fundo | `--ca-cream` | `#F0EEE9` | `--cream: #F0EEE9` | `MARCA_CORES.creme/fundo` | `--ca-cream` | alinhado (duplicado) |
| Terracota/alerta | `--ca-terracotta` | `#9A3A2F` | `--terracotta`, `--destructive`, `--critico` | `MARCA_CORES.terracota` | — | alinhado; repetido 3× como literal |
| Branco | `--ca-white` | `#FFFFFF` | `--card`, `--popover` | `MARCA_CORES.branco` | `--ca-white` | alinhado |

## B. Estados semânticos

| Estado | Token | Valor | Onde já existe hoje |
| --- | --- | --- | --- |
| Em andamento | `--ca-estado-andamento` | `#1B365D` | não havia token próprio (usava navy) |
| Aguardando | `--ca-estado-aguardando` | `#8A5A08` | `--atencao` em `styles.css` |
| Concluído | `--ca-estado-concluido` | `#3F5A34` | `--sucesso` em `styles.css` |
| Vencido/atenção | `--ca-estado-vencido` | `#9A3A2F` | `--critico` em `styles.css` |
| Ausente | `--ca-estado-ausente` | `#6B6558` | aproximado por `--bloqueio: #4A4438` |

Cada estado tem par suave (`-suave`) para fundo de selo. Dourado puro
(`#C2A84D`) **não** atinge AA em texto: aguardando usa o âmbar escurecido.

## C. Tipografia, escala, espaçamento, raio, sombra, breakpoints

Ver o próprio arquivo de tokens — blocos TIPOGRAFIA, ESPAÇAMENTO,
RAIO/BORDA/SOMBRA, BREAKPOINTS e ÁREA SEGURA. Títulos: Cormorant Garamond.
Corpo: Montserrat. Piso mobile: 375 px, uma coluna, `--ca-touch-target: 44px`.

## D. Valores legados encontrados (não removidos neste corte)

| Valor | Onde aparece | Classificação |
| --- | --- | --- |
| `#2F4B6E` (azul OKI) | e-mail transacional, PDF, contratos; comentários em `styles.css`/`marca.ts` | **manter apenas em documento histórico/PDF/e-mail** |
| `#FCB73A` (dourado OKI) | mesmas superfícies de saída | **manter apenas em documento histórico/PDF/e-mail** |
| `#F7F1E7` (fundo OKI) | e-mail/PDF e Project Knowledge antigo | **manter apenas em documento histórico/PDF/e-mail** |
| `#ECDFCD` (areia OKI) | `[data-paleta="anterior"]` em `styles.css` | **revisar em corte futuro** (escopo isolado, só comparação) |
| `#1B2B4B`, `#2A3D63`, `#C9A84C`, `#F5F0E8`, `#8B4513` | `[data-paleta="anterior"]`; `AZUIS_RETIRADOS` | **revisar em corte futuro** |
| `#101010` (preto OKI) | citado em comentário | **histórico** |
| Cores manuais de cadência (D0–D365) | componentes de cadência | **usar token agora** (Corte 5) |
| Cores manuais de gráficos | `golive/graficos.tsx` | **usar token agora** (Corte 5) |
| Cores manuais de fichas/linhagens | fichas de pessoa/pesquisa | **usar token agora** (Corte 5) |
| `--sage`, `--plum` | `styles.css` | **revisar em corte futuro** — sem papel semântico declarado |

Nada acima foi apagado no Corte 1.
