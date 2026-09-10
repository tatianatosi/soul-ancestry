# CA13-UXUI-PANTONE-MOCKUP — comparação tela a tela (09/09/2026)

> **Correção de referência (09/09/2026, mesma data):** este relatório citava originalmente `clube-ancestral-mockup-auditoria.pdf` (47 páginas) como "o mockup aprovado". Está errado. Por decisão vinculante da Proprietária, **o mockup aprovado de referência para UX/UI é o documento de 17 páginas** (`clube-ancestral-mockup.pdf`, citado como fonte visual primária em `docs/evolucao/recuperados/prompts-lovable/ca_ux_01_1_decisoes_mockup_17_telas_e_prompt_reconciliacao_v1_1.md`). O PDF de 47 páginas é **material de auditoria/referência complementar** (conteúdo, estados, fluxos e exemplos) — **sem força normativa de design**. O arquivo de 17 páginas não está presente neste repositório; a comparação abaixo foi feita contra o PDF de 47 páginas (a única fonte visual disponível nesta sessão) e contra o código-fonte das 14 telas, o que a torna uma leitura de apoio, não uma verificação de conformidade contra o mockup aprovado propriamente dito. Texto original preservado abaixo, com esta ressalva no topo.

Fonte de verdade aplicada, na ordem de `docs/politicas/fonte-de-verdade-design-e-execucao.md`: decisões mais recentes da Proprietária (`TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`) > mockup aprovado (17 páginas — não disponível neste repositório) > PDF de auditoria de 47 páginas (referência complementar, sem força normativa) > implementação existente. Comparação feita por leitura direta do PDF de auditoria e do código-fonte das 14 telas — sem servidor autenticado ao vivo (mesma limitação de ambiente já registrada em CA23/CA24: sem credencial de sessão real; classificador de segurança bloqueou uma tentativa de reaproveitar sessão de teste existente).

## 1. Paleta (Pantone) e tipografia — aderente nas 14 telas

Token único (`src/styles.css`): navy `#2F4B6E`, gold `#FCB73A`, cream `#ECDFCD`, terracotta `#9A3A2F`, com tema escuro. Tipografia: Cormorant Garamond (serif, títulos), Montserrat (sans, corpo), Great Vibes/Dancing Script (script, wordmark "Clube Ancestral") — mesma combinação do PDF de auditoria (serif itálico em títulos, script na marca). Nenhum hex ou cor fora de marca encontrado em nenhuma das 14 telas (já travado por teste em CA24 parcial, App Cliente; Desk usa os mesmos tokens).

## 2. Estrutura visual — aderente

**Desk** (`src/components/saas/shell.tsx`): barra lateral fixa navy com item ativo em gold (`bg-gold text-navy`), conteúdo em cream, cabeçalho branco — mesma composição do PDF de auditoria (sidebar escura + gold de destaque + fundo cream). **App Cliente** (`src/components/portal/portal-shell.tsx`): cabeçalho navy, fundo cream, cards brancos, navegação inferior por ícone+rótulo em mobile — mesma composição do PDF de auditoria.

## 3. Divergência estrutural encontrada — não corrigida (fora do escopo desta missão)

O PDF de auditoria (47 páginas, referência complementar) mostra uma barra lateral do Desk com um conjunto simples (Visão Geral, Casos 360, Propostas, Go-live, Formalização, Checklist AppCliente, Financeiro, Checklist semanal, Validação Jurídica, Radar Interno, Alertas, Integrações, Biblioteca Mestre — todas soltas, sem agrupamento). A navegação real (`src/lib/navegacao-desk.ts`) agrupa em 8 seções (Hoje, Marketing, Comercial, Casos, Pesquisa, Contratos, Financeiro, Biblioteca/Governança) com dezenas de subitens — resultado de CAs aprovadas que deram profundidade operacional real a cada área.

**Decisão vinculante da Proprietária (09/09/2026, mesma data desta correção): os 8 grupos operacionais reais do Desk são mantidos.** Não reduzir, remover, fundir ou esconder domínios operacionais para imitar a navegação simples do protótipo/auditoria. Mudar isso seria alterar taxonomia e fluxo — fora do escopo de qualquer missão de UX/UI visual. Trabalho futuro de clareza visual desses 8 grupos (ordem, rótulo humano, ícone, agrupamento, hierarquia) fica para uma CA própria, sem criar aba, tabela, formulário, checklist, dado de demonstração ou regra de negócio nova.

O toggle "App Cliente / Desk Intelligence" do protótipo (navegação dentro de uma única tela de apresentação) não existe no produto real — correto: são dois produtos autenticados por login separado, não uma alternância dentro da mesma sessão. Não é divergência a corrigir.

## 4. Estados vazios, CTAs e dados vivos

Nenhuma tela foi alterada nesta entrega — layout, paleta, tipografia, cards e hierarquia já aderem ao PDF de auditoria nas 14 telas por herança dos cortes CA-UX-01/02/03 e da série CA12-CA24 (fontes vivas). Nenhum CTA existente foi removido ou renomeado. Estados vazios específicos já confirmados honestos em CA24 (parcial) para o App Cliente; Desk usa o mesmo padrão (`EstadoDados`/`EstadoVazio`) nas 14 telas.

## 5. Mobile (320/375/390/414px)

Verificação de código (não visual ao vivo, mesma limitação de ambiente): barra inferior do App Cliente usa grid de largura igual (`gridTemplateColumns: repeat(n, minmax(0,1fr))`), sem rolagem horizontal, com correção documentada no próprio código para o bug que cortava a aba "Árvore". Nenhuma tabela ou grade fixa larga sem `overflow-x`/wrap encontrada nas 14 telas. Verificação visual real nesses quatro breakpoints continua pendente de sessão autenticada ao vivo.

## Pendência

Estrutura de navegação do Desk: decidido — mantidos os 8 grupos operacionais reais (não simplificar de volta ao protótipo). Verificação visual ao vivo (mobile 320-414px) segue bloqueada por falta de sessão autenticada nesta sessão. Comparação visual direta contra o mockup aprovado de 17 páginas ainda não foi feita, por falta do arquivo neste repositório.
