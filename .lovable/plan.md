# Revisão do Desk contra a prancha de 13 quadros — somente leitura e wireframes

Nenhuma implementação, publicação, alteração de dados, migration, RLS ou deploy. A rodada termina com material de revisão e wireframes, seguida de parada para aprovação.

## O que já foi confirmado antes deste plano

- A navegação vigente tem 6 grupos em `src/lib/navegacao-desk.ts`: `hoje`, `comercial`, `casos`, `pesquisa`, `contratos`, `governanca`, mais o menu da conta.
- Existem as duas famílias de rotas lado a lado: operacionais (`/painel`, `/marketing`, `/leads`, `/calls`, `/casos`, `/contratos`, `/financeiro`, `/pesquisa`, `/biblioteca`, `/biblioteca-mensagens`, `/configuracoes`) e prévias `/golive/*`.
- Os módulos citados existem: `indicadores-marketing.ts`, `marketing-aquisicao.ts`, `fontes-canonicas-indicadores.ts`, `indicadores-governanca.ts`, `conversao.functions.ts`, `message-library.functions.ts`, `escopo-proposta.ts`, `cadeia-formalizacao.server.ts`, `contrato-preparar.functions.ts`, `planejador-parametros.ts`, `biblioteca-mestre.ts`.
- O documento `docs/auditorias/trava-sku-planejador-corrigida-08-09.md` **não existe** no repositório com esse nome. A leitura usará as fontes equivalentes encontradas (`planejador-parametros.ts`, `planejador-produtos-pai.ts`, `homologacao-skus.tsx`, `conciliacao-catalogo.tsx`, `divergencias-catalogo.tsx`) e registrará a divergência documental em vez de presumir a regra.
- A prancha mais recente disponível é `03-prancha-desk-v6.pdf` (capa + 15 superfícies). A prancha "de 13 quadros" será conciliada com ela: 13 quadros serão tratados como o recorte pedido e as superfícies excedentes ficarão listadas à parte, sem sumirem.

## Leitura antes de qualquer proposta

Leitura dirigida, sem alteração, de: navegação e rotas autenticadas; módulos de indicadores e marketing; cadeia de proposta/escopo/contrato/formalização; Planejador e jornada; Biblioteca Mestre e biblioteca de mensagens; App Cliente (`src/components/portal/*`, `src/routes/portal/*`); planos recentes em `.lovable/plan/`. Consultas de leitura ao banco apenas para confirmar o estado real da Ana (`CA-CID-AT-FAM-2026-001`), incluindo referência/URL da proposta Canva, completude de páginas extraídas, contrato, anexos, OS e perfil da contratada.

## Decisões canônicas aplicadas na revisão

- Catálogo e SKU saem do fluxo visual: nada de SKU em card, KPI, filtro, título, CTA ou bloqueio; resíduo técnico só como histórico recolhido.
- Planejador é a origem do planejamento; para a Ana a origem permitida é `proposta_aprovada_conferida`.
- Proposta Canva com CTA primário `Abrir proposta no Canva` usando o link já gravado; linha curta com versão, situação, validade e completude. Sem link real: `Link do Canva não registrado`.
- Contrato em superfície única e contínua, com âncoras internas e um CTA principal por estado.
- "Auditoria jurídica" vira `Validação jurídica da trilha`, ligada a marcos de país/via, sem exigir nova revisão jurídica do contrato.
- Marketing, Campanhas, Conteúdo e Biblioteca Mestre permanecem explícitos, com fronteira Marketing/Comercial/Conteúdo declarada.
- Máximo de 4 KPIs por tela, cada um com pergunta, fonte, filtro, fórmula, vazio e drill-down. Sem fonte: `Dados insuficientes`.

## Entregáveis

1. `revisao-desk-13-quadros.md` — matriz quadro a quadro: prancha, rota/aba atual, dados/função leitora, KPI/CTA exigido, estado (aderente, parcial, ausente, não aplicável), lacuna, duplicação, decisão de wireframe e prioridade.
2. Mapa de KPIs por aba (Hoje, Marketing & Comercial, Pessoas & Casos, Inteligência & Pesquisa, Formalização & Financeiro, Cliente/Portal, Biblioteca Mestre, Governança).
3. Mapa de Marketing, Campanhas, Google Ads, Conteúdo e Biblioteca Mestre: o que existe hoje, o que é gap real, o que depende de atribuição registrada.
4. De-para de nomenclatura: remoção de SKU/catálogo do fluxo e substituição de Auditoria Jurídica por Validação Jurídica da Trilha.
5. Wireframe da tela única de contrato, com os oito blocos pedidos, perfil da contratada (valor real, `não registrado` ou origem) e CTA único por estado.
6. Wireframe da ficha da Ana com a proposta Canva vinculada e CTA direto, sem bloqueio redundante.
7. Previews desktop e 375 px de: Marketing & Comercial, Planejador/Jornada de Vida da Cidadania, Caso da Ana e Contrato.
8. Lista de arquivos e rotas que seriam alterados depois, separando mudança apenas visual de mudança de dado/regra.
9. Matriz de riscos: fonte homologada ausente, dado inexistente, decisão humana pendente e prova de UI autenticada pendente.

Saída em Markdown mais PNG/PDF por tela e ZIP consolidado, com conferência página a página antes da entrega.

## Fora de escopo

Código de produto, banco, migrations, RLS, funções, integrações, secrets, publicação, envio, convite, Canva, commit, merge e deploy. Nada é preenchido por dedução.
