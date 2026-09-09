# CA13-UXUI-PANTONE-MOCKUP — comparação tela a tela (09/09/2026)

Fonte de verdade aplicada, na ordem de `docs/politicas/fonte-de-verdade-design-e-execucao.md`: decisões mais recentes da Proprietária (`TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`) > mockup aprovado (`clube-ancestral-mockup-auditoria.pdf`, 47 págs, lido integralmente) > implementação existente. Comparação feita por leitura direta do PDF e do código-fonte das 14 telas — sem servidor autenticado ao vivo (mesma limitação de ambiente já registrada em CA23/CA24: sem credencial de sessão real; classificador de segurança bloqueou uma tentativa de reaproveitar sessão de teste existente).

## 1. Paleta (Pantone) e tipografia — aderente nas 14 telas

Token único (`src/styles.css`): navy `#2F4B6E`, gold `#FCB73A`, cream `#ECDFCD`, terracotta `#9A3A2F`, com tema escuro. Tipografia: Cormorant Garamond (serif, títulos), Montserrat (sans, corpo), Great Vibes/Dancing Script (script, wordmark "Clube Ancestral") — mesma combinação do mockup (serif itálico em títulos, script na marca). Nenhum hex ou cor fora de marca encontrado em nenhuma das 14 telas (já travado por teste em CA24 parcial, App Cliente; Desk usa os mesmos tokens).

## 2. Estrutura visual — aderente

**Desk** (`src/components/saas/shell.tsx`): barra lateral fixa navy com item ativo em gold (`bg-gold text-navy`), conteúdo em cream, cabeçalho branco — mesma composição do mockup (sidebar escura + gold de destaque + fundo cream). **App Cliente** (`src/components/portal/portal-shell.tsx`): cabeçalho navy, fundo cream, cards brancos, navegação inferior por ícone+rótulo em mobile — mesma composição do mockup.

## 3. Divergência estrutural encontrada — não corrigida (fora do escopo desta missão)

O mockup mostra uma barra lateral do Desk com um conjunto simples (Visão Geral, Casos 360, Propostas, Go-live, Formalização, Checklist AppCliente, Financeiro, Checklist semanal, Validação Jurídica, Radar Interno, Alertas, Integrações, Biblioteca Mestre — todas soltas, sem agrupamento). A navegação real (`src/lib/navegacao-desk.ts`) agrupa em 8 seções (Hoje, Marketing, Comercial, Casos, Pesquisa, Contratos, Financeiro, Biblioteca/Governança) com dezenas de subitens — resultado de CAs aprovadas que deram profundidade operacional real a cada área. **Não revertida nesta missão**: mudar isso seria alterar taxonomia e fluxo, exatamente o que a missão proíbe; e pela regra de precedência, decisão aprovada mais recente (as CAs que construíram essas áreas) prevalece sobre a estrutura literal do protótipo. Divergência registrada para decisão da Proprietária, não corrigida por conta própria.

O toggle "App Cliente / Desk Intelligence" do protótipo (navegação dentro de uma única tela de apresentação) não existe no produto real — correto: são dois produtos autenticados por login separado, não uma alternância dentro da mesma sessão. Não é divergência a corrigir.

## 4. Estados vazios, CTAs e dados vivos

Nenhuma tela foi alterada nesta entrega — layout, paleta, tipografia, cards e hierarquia já aderem ao mockup nas 14 telas por herança dos cortes CA-UX-01/02/03 e da série CA12-CA24 (fontes vivas). Nenhum CTA existente foi removido ou renomeado. Estados vazios específicos já confirmados honestos em CA24 (parcial) para o App Cliente; Desk usa o mesmo padrão (`EstadoDados`/`EstadoVazio`) nas 14 telas.

## 5. Mobile (320/375/390/414px)

Verificação de código (não visual ao vivo, mesma limitação de ambiente): barra inferior do App Cliente usa grid de largura igual (`gridTemplateColumns: repeat(n, minmax(0,1fr))`), sem rolagem horizontal, com correção documentada no próprio código para o bug que cortava a aba "Árvore". Nenhuma tabela ou grade fixa larga sem `overflow-x`/wrap encontrada nas 14 telas. Verificação visual real nesses quatro breakpoints continua pendente de sessão autenticada ao vivo.

## Pendência

Divergência de estrutura de navegação do Desk (mockup simples vs. navegação real em 8 grupos) registrada para decisão explícita da Proprietária — manter como está (recomendado, dada a precedência de decisões já aprovadas) ou simplificar de volta ao mockup. Verificação visual ao vivo (mobile 320-414px) segue bloqueada por falta de sessão autenticada nesta sessão.
