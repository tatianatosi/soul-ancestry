# Auditoria das PRs do Desk V4: o que está no código × o que o Desk executa

Data: 2026-10-23
Base: GitHub `main` `41ce1f73`, que é a versão publicada hoje no Lovable (`soul-ancestry.lovable.app`)
Escopo: as 18 PRs da V4 mescladas entre 13/10 e 22/10, as 38 telas do menu atual e as telas de detalhe (Caso 360, Pessoa 360, contrato etc.)

## Método

1. **No ar:** os textos que cada PR acrescentou foram procurados nos arquivos do site publicado. Todas as PRs mescladas estão no ar.
2. **Ligado no Desk:** montei o mapa de importações do código e segui, a partir das 38 telas do menu, tudo o que abre por clique. Um código que nenhuma tela do Desk alcança "existe, mas não roda".
3. **Antigo × V4:** usando o histórico de cada linha no git, medi quanto de cada tela foi escrito antes de 13/10 (antes da V4) e quanto depois.
4. **Sobreposição:** procurei blocos antigos mantidos embaixo do bloco V4 (`<details>`, "ficha completa abaixo") e links que levam para o Desk antigo `golive`.

Limite: é uma análise do código, sem login no Desk. Para confirmar na tela, é preciso entrar com a conta da Proprietária.

---

## 1. Conclusão: por que o Desk "segue como no passado"

Quase nenhum código das PRs ficou solto: tudo está ligado a telas do Desk. O problema é outro, e tem quatro causas.

### Causa A: o Desk antigo `golive` continua vivo, e a Hoje V4 leva até ele
- São 19 telas `/golive/*`, somando 5.679 linhas, com **menu lateral próprio** (`components/golive/shell.tsx`): Painel, Leads, Comercial, Pessoas, Pessoa, Caso, Painel do caso, Kanban, Microentregas, Aprovações, Pesquisa, Radar, Prontidão, Formalização, Jurídico, Financeiro, Portal, App e Configurações.
- A PR #168 diz que o `golive-*` foi "arquivado como legado". Mas a própria Hoje V4 (`painel.tsx`) tem **7 links** para ele:
  - "Decisões do dia" e "Abrir" → `/golive/aprovacoes`
  - "Cadências vencidas" e "Casos sem próxima ação" → `/golive`
  - "Microentregas" e "Abrir" → `/golive/microentregas`
- Quem clica nesses cartões sai do Desk V4 e cai no Desk antigo, com outro menu. Essa é a sobreposição mais visível.

### Causa B: a V4 foi posta por cima, e a tela antiga ficou inteira embaixo
Várias PRs puseram o bloco da prancha V4 no topo e deixaram a tela antiga logo abaixo, inteira ou recolhida:
- #148 Linhagens: "a tela antiga continua inteira".
- #150, #163 e #165 Pessoa 360: "a ficha completa continua inteira, logo abaixo".
- #154, #156, #163 e #171 usam blocos recolhidos (`<details>`).
- Resultado: **28 telas** alcançáveis têm blocos recolhidos ou marcados como antigos. As mais carregadas são Caso 360 (6), Perfil institucional/Configurações (6), contrato (4) e Leads (3 recolhidos e 7 marcadores).

### Causa C: a #171 ("casca V4 em todo o Desk") só mudou a casca, não o conteúdo
A própria PR diz: "casca visual V4 aplicada em todo o Desk […] **sem mudar lógica**". Por fora (topo, cartões, cores) a tela é V4. Por dentro, as listas, os formulários e os blocos continuam os de antes.

### Causa D: telas que nenhuma PR da V4 refez
Nas telas de detalhe, onde o trabalho acontece, quase todo o código é anterior a 13/10:

| Tela de detalhe | Linhas | Código anterior à V4 |
|---|---|---|
| Pessoa 360 (`/pessoas/$id`), abaixo do topo V4 | 1.758 | 98% |
| Contrato (`/contratos/$id`) | 1.523 | 93% |
| Onboarding (`/onboarding/$id`) | 668 | 95% |
| Linhagens do caso (`/pessoas-linhagens/$caseId`) | 1.554 | 98% |
| Evidências do caso (`/pesquisa-evidencias/$caseId`) | 1.251 | 99% |
| Preparar contrato (`/casos/$id/contrato/preparar`) | 1.428 | 99% |
| Achados, Biblioteca de evidências, Relatórios de fase, Plano de ação | 368 a 903 | 87% a 93% |
| Caso 360 (`/casos/$caseId`) | 4.269 | 76% |

Telas do menu que nenhuma PR da V4 tocou de fato, com 74% a 99% de código anterior a 13/10:
- Alertas
- Próximas ações
- Propostas
- Conversão e origem
- **Todos os casos**
- **Operação (`/ops`)**: a #160 só refez o componente do Kanban, e o resto da tela é antigo.
- Participantes e duplicidades
- Acessos ao App
- Visão administrativa do App
- Solicitações documentais
- Marketing
- Métricas
- Modelos e templates
- Decisões

---

## 2. PR por PR

Legenda: **No ar** = está no site publicado. **Mantido** = parte do que a PR escreveu que ainda está no código hoje.

| PR | O que prometia | No ar | Mantido | Como está no Desk V4 |
|---|---|---|---|---|
| #147 | Paridade com o mockup: Home e Jornada do App, estrutura do Desk V4, Caso 360 | Sim | Caso 360 53%, App 80–93% | O Caso 360 foi refeito depois (#162, #171, #174). A tela de exceções que ela pôs no menu saiu de lá. |
| #148 | Pessoas & Linhagens (G1–G10) em `/nucleos` + gráficos do Caso | Sim | 96–100% | **Sobreposição:** composição V4 em cima e a tela antiga inteira embaixo. |
| #150 | Pessoa 360 na prancha V4 | Sim | 66% | **Sobreposição:** V4 só no topo de `/pessoas/$id`; a ficha antiga completa vem abaixo. |
| #153 | Lista de pessoas na V4 (`/clientes`) | Sim | 97% | Ok. |
| #154 | Hoje com gráficos sempre desenhados | Sim | 82% | Refeita depois pela #168. |
| #155 | Hoje: funil e cadências | Sim | 27% | Substituída de propósito (#168 e o commit `446c722b`). |
| #156 | Financeiro: gráfico circular das faturas + fluxo do contrato | Sim | 86% | V4 em cima, 1 bloco recolhido. Existe também um Financeiro paralelo em `/golive/financeiro`. |
| #157 | Comercial: 6 blocos V4 em `/leads` | Sim | 83% | **Sobreposição:** `/leads` tem 3.364 linhas, com a V4 por cima e o antigo embaixo (3 recolhidos, 7 marcadores). |
| #158 | Discovery (`/calls`) na V4 | Sim | 90% | Metade da tela é anterior à V4. |
| #160 | Kanban de `/ops` na V4 | Sim | 100% | Só o Kanban mudou; o resto de `/ops` é 82% anterior. |
| #162 | Acabamento do Caso 360 | Sim | 79% | Ok, mas o Caso 360 ainda tem 6 blocos recolhidos. |
| #163 / #165 | Pessoa 360: árvore em SVG, CPF, refinamentos | Sim | 53–59% (refeito pela #171 e #174) | Mesma sobreposição da #150. |
| #164 | Qualidade: 4 indicadores de prontidão | Sim | 60% | Foi para Configuração → Radar e matrizes. |
| #166 / #167 | Dossiê de pesquisa | Sim | 55–73% | Ok, refinado depois. |
| #168 | Hoje reconstruída na grade V4, `golive` arquivado | Sim | 60% | **Contradição:** a tela leva para o `golive` por 7 links. |
| #169 | Menu do Desk V4 | Sim | 24% | Substituída pela decisão dos 8 grupos (ver o comparativo do menu). |
| #171 | Casca V4 lotes 02–05 em todo o Desk | Sim | 100% | Casca por fora, "sem mudar lógica" por dentro (Causa C). |
| #174 | Acabamento do Desk e do App | Sim | 100% | Ok. |

---

## 3. Telas do menu: quanto ainda é anterior à V4

Inclui o arquivo da tela e os componentes próprios que ela usa diretamente. A estrutura comum do Desk entra na conta de todas.

| Grupo | Tela | Antes da V4 | Recolhidos | Leitura |
|---|---|---|---|---|
| Hoje | Visão Geral `/painel` | 25% | 0 | V4, mas com **7 links para o `golive`** |
| Hoje | Alertas | 86% | 0 | Antiga |
| Hoje | Próximas ações | 74% | 0 | Antiga |
| Hoje | Tarefas | 57% | 0 | Mista |
| Comercial | Leads e oportunidades | 66% | 3 | **Sobreposta** |
| Comercial | Discovery | 52% | 0 | Mista |
| Comercial | Propostas | 87% | 1 | Antiga |
| Comercial | Contratos e condições | 56% | 1 | Mista |
| Comercial | Conversão e origem | 77% | 1 | Antiga |
| Casos | Todos os casos | 89% | 1 | **Antiga** |
| Casos | Ordens de serviço | 57% | 0 | Mista |
| Casos | Entregas e validações | 54% | 0 | Mista |
| Casos | Operação `/ops` | 82% | 0 | **Antiga, exceto o Kanban** |
| Pessoas | Pessoa 360 `/clientes` | 59% | 0 | Lista ok; o detalhe está sobreposto |
| Pessoas | Núcleos familiares | 36% | 1 | **Sobreposta** (V4 em cima e antiga embaixo) |
| Pessoas | Participantes e duplicidades | 80% | 0 | Antiga |
| Pessoas | Acessos ao App | 77% | 1 | Antiga |
| Pessoas | Visão administrativa do App | 99% | 0 | Antiga |
| Pesquisa | Painel de pesquisa | 44% | 0 | V4 |
| Pesquisa | Evidências | 60% | 0 | Mista |
| Pesquisa | Solicitações documentais | 89% | 0 | Antiga |
| Pesquisa | Biblioteca de documentos | 70% | 3 | Sobreposta |
| Pesquisa | Bases e repositórios | 63% | 0 | Mista |
| Pesquisa | Relatórios | 37% | 0 | V4 |
| Marketing | Dashboard | 80% | 3 | Antiga e sobreposta |
| Marketing | Biblioteca de mensagens | 66% | 0 | Mista |
| Marketing | Métricas de campanha | 76% | 1 | Antiga |
| Financeiro | Financeiro de casos | 55% | 1 | Mista; há um paralelo em `/golive/financeiro` |
| Configuração | Perfil institucional | 52% | 6 | Sobreposta |
| Configuração | Catálogo e preços | 65% | 0 | Mista |
| Configuração | Equipe e acessos | 60% | 0 | Mista |
| Configuração | Integrações | 51% | 0 | Mista |
| Configuração | Modelos e templates | 75% | 0 | Antiga |
| Configuração | Decisões | 78% | 0 | Antiga |
| Configuração | Dados históricos | 48% | 0 | Mista |
| Configuração | Radar e matrizes | 69% | 1 | Mista |
| Configuração | Validação jurídica | 46% | 2 | Sobreposta |
| Configuração | Privacidade e consentimento | 49% | 0 | Mista |

Telas que existem mas não abrem por nenhum clique no Desk: `/studio-devolutivas` (Devolutivas, sem aba), `/pesquisa` e `/pesquisa/$id` (o módulo de pesquisa antigo), `/devolutiva`, `/etiquetas`, `/escopo-origem`, `/homologacao-skus`, `/conciliacao-catalogo`, `/divergencias-catalogo` e `/contrato-parametros`, além de 4 telas `/governanca/*` de modelo e migração.

---

## 4. Proposta de unificação (para aprovação)

Uma PR por fase, nesta ordem. Cada uma fica no ar depois do merge e do Publish no Lovable.

1. **U1: cortar o Desk antigo.** Trocar os 7 links da Hoje que levam ao `golive` pelos equivalentes da V4: Aprovações vira Hoje → Decisões, Microentregas vira Casos → Entregas e validações, e Cadências e Casos sem próxima ação vão para os alertas do Hoje. Depois, fazer as 19 telas `/golive/*` redirecionarem para a tela V4 correspondente, sem apagar dados nem as funções de carga que a Hoje ainda usa. Devolver "Devolutivas" como aba em Pesquisa.
2. **U2: tirar a sobreposição.** Nas telas com V4 por cima e antiga embaixo (Pessoa 360, Núcleos, Leads, Caso 360, Configurações, Biblioteca, Marketing, Validação jurídica, contrato), manter só a composição V4. O que da tela antiga ainda for necessário (edição, consentimentos, propostas) entra como aba ou seção V4, não como bloco recolhido.
3. **U3: refazer as telas antigas na V4.** Na ordem de uso: Todos os casos, Operação, Propostas, Alertas, Próximas ações, Onboarding, contrato, Linhagens do caso, Evidências do caso. Depois: Duplicidades, Acessos ao App, Solicitações, Marketing, Métricas, Modelos e Decisões.
4. **U4: trava automática.** Um teste que falha se: alguma tela do menu levar a `/golive`; aparecer um novo bloco recolhido com conteúdo antigo; ou existir uma tela sem aba no menu.

Antes da U1, a Proprietária precisa confirmar duas coisas: as telas `/golive` podem redirecionar (sim/não), e o menu fica em 8 grupos ou volta para os 6 da prancha (ver o comparativo do menu).
