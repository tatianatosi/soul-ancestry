# CA-PORTAL-01 — Aplicação do Guia de Marca no App Cliente

Registro da aplicação do Guia de Marca oficial (aceite da Proprietária Administradora em 23/08/2026) às superfícies do cliente: portal, tela de acesso, e-mails transacionais, contrato gerado e exports.

Matriz detalhada por tela: `docs/portal/CA-PORTAL-01_Matriz_Copy_e_Marca.csv`.

## 1. Localização da fonte oficial de marca

| Fonte | Caminho | Papel |
| --- | --- | --- |
| Valores de marca (código) | `src/lib/marca.ts` | Fonte de verdade única: `MARCA_CORES`, `AZUIS_RETIRADOS`, `MARCA_TIPOGRAFIA`, `TIPO_CLIENTE`. Usada onde não existe token CSS (e-mail, PDF, SVG gerado). |
| Tokens de tela | `src/styles.css` | Tokens Tailwind v4 (`--navy`, `--gold`, `--cream`, `--fundo`, `--border`, `--terracotta`). Em tela usa-se sempre o token, nunca hex literal. |
| Asset de logo | `src/lib/brand-asset.ts` → `src/assets/clube-ancestral-logo.svg.asset.json` | Referência única do arquivo oficial. Proibida cópia local ou import direto de imagem em tela. |
| Componente de logo | `src/components/brand.tsx` (`<BrandLogo />`) | Única forma autorizada de renderizar a marca. |
| Guia impresso | Apresentação de marca aprovada em 23/08/2026 | Resolve qualquer conflito entre CSS, mockup e código. |

Regra de precedência registrada em memória de projeto: **conflito entre CSS, mockup e Guia resolve-se pelo Guia**.

## 2. Logo efetivamente aplicado

- Componente único `<BrandLogo />` com três variantes: `client-light` (fundo claro), `client-dark` (cabeçalho azul do app) e `internal-minimal` (Desk).
- Aplicado em `src/components/portal/portal-shell.tsx` (`size=36`, `variant="client-dark"`), na tela de acesso do cliente e no cabeçalho dos e-mails transacionais.
- Nenhuma tela importa arquivo de imagem de logo diretamente; trocar o asset em `brand-asset.ts` atualiza todas as superfícies.
- Sem asset oficial disponível, o componente renderiza texto neutro com `data-brand-pending="ASSET_DE_MARCA_OFICIAL_PENDENTE"` — nunca um logo improvisado.

## 3. Tipografia efetivamente aplicada

- **Títulos:** Cormorant Garamond. **Corpo:** Montserrat (24/08/2026 —
  troca confirmada pela Proprietária, revertendo a recusa anterior).
  Carregadas por `<link>` no `src/routes/__root.tsx` (Google Fonts,
  `display=swap`), nunca por `@import` de URL em CSS.
- Expostas como `--font-serif` / `--font-sans` em `src/styles.css`.
- Hierarquia única do App Cliente em `TIPO_CLIENTE` (`titulo`, `subtitulo`, `secao`, `corpo`, `legenda`, `etiqueta`, `botao`, `botaoDiscreto`, `cartao`, `aviso`), usada por todas as telas do portal.
- Fallbacks fora do navegador: Georgia (títulos) e Arial (corpo) em e-mail; Georgia no contrato em PDF.
- **Histórico:** Montserrat, presente no guia impresso, tinha sido
  **recusada** por decisão explícita em favor de Inter — decisão revertida
  em 24/08/2026, ver `docs/evolucao/recuperados/CA-MARCA_Resolucao_Paleta.md`.

## 4. Token azul incorreto encontrado × token correto aplicado

| Token/valor encontrado | Onde | Token/valor aplicado |
| --- | --- | --- |
| `#1B2B4B` (azul retirado) | tokens de tela, shell do portal, 6 e-mails transacionais, contrato HTML/PDF | `--navy` = `#2F4B6E` |
| `#2A3D63` (azul "aproximado") | variações locais de componentes | `--navy-soft` / `#40628B` |
| `#C9A84C` (dourado antigo) | destaques e bordas | `--gold` = `#FCB73A` |
| `#F5F0E8` (creme antigo) | fundos e export one-page | `--cream` = `#ECDFCD` / fundo `#F7F1E7` |
| `#8B4513` (terracota antiga) | estados de indisponibilidade e selos | `--terracotta` = `#9A3A2F` |

Os valores retirados sobrevivem apenas em dois lugares legítimos: a lista de proibidos `AZUIS_RETIRADOS` em `src/lib/marca.ts` e o escopo isolado de comparação histórica `[data-paleta="anterior"]` em `src/styles.css`.

## 5. Arquivos e componentes corrigidos

- `src/lib/marca.ts` — criação da fonte de verdade visual e da lista de azuis retirados.
- `src/styles.css` — tokens oficiais; paleta antiga confinada a `[data-paleta="anterior"]`.
- `src/routes/__root.tsx` — carregamento das webfonts oficiais por `<link>`.
- `src/components/brand.tsx` e `src/lib/brand-asset.ts` — variantes de logo e referência única de asset.
- `src/components/portal/portal-shell.tsx` — logo, tipografia, foco visível dourado, navegação em linguagem de cliente.
- 14 rotas em `src/routes/portal/` — títulos, descrições, CTAs e estados vazios vindos de `src/lib/portal-copy.ts`.
- `src/lib/portal-copy.ts` — copy canônica do cliente e lista de termos proibidos (SLA, gate, SKU, pipeline, mockup, seed, placeholder, upsell).
- `src/components/portal/BlocoVisibilidade` — 7 estados de visibilidade com texto de preparo em linguagem de cliente.
- 6 templates de e-mail transacional — paleta e fallback tipográfico oficiais.
- `src/lib/contratos.server.ts` — contrato HTML/PDF em `#2F4B6E` / `#9A3A2F` / `#FCB73A`.
- `src/components/client-research-one-page.tsx` — fundo do export em `#F7F1E7`.
- Guardas automatizadas: `src/lib/__tests__/ca-portal-03-branding-cliente.test.ts` e `src/lib/__tests__/portal-marca-copy.test.ts` (15 testes) impedem o retorno de hex retirado ou de jargão nas superfícies do cliente.

## 6. Pontos que permanecem pendentes

| Pendência | Motivo | Efeito atual | O que destrava |
| --- | --- | --- | --- |
| Asset vetorial oficial definitivo do logo | Ausência de arquivo homologado pela Proprietária | `<BrandLogo />` marca `data-brand-pending` e usa texto neutro; nenhuma marca improvisada é exibida | Substituir o asset referenciado em `src/lib/brand-asset.ts` |
| Verificação visual autenticada de Home, Jornada, Radar, Entregas, Fase 02 e Conta | Ambiente de verificação sem sessão de cliente; `/portal` redireciona para `/acesso` | Verificado apenas por código e testes; capturas desktop/mobile feitas somente da tela de acesso | Login de cliente no preview, sem qualquer bypass de autenticação |
| ~~Montserrat do guia impresso~~ | ~~Decisão explícita de recusa registrada em memória~~ | **Resolvido 24/08/2026** — Proprietária confirmou a troca; corpo do texto agora usa Montserrat (ver seção 3) | — |
| Paleta institucional anterior | Decisão explícita de preservação histórica | Confinada a `[data-paleta="anterior"]`, sem alcance no App Cliente | Decisão expressa de remoção |

Nenhuma ação externa, migração, alteração de RLS ou envio ao cliente foi executada nesta etapa.
