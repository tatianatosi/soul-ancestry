# V4-00 — Matriz de cobertura e corte proposto (fechamento da casca V4 no Desk)

Data: 2026-10-18
Fase: V4-00 (HEAD, matriz, referências, primeiro lote) — conforme "Prompt para Claude — concluir a casca V4 em todo o Desk"
Natureza: SOMENTE LEITURA + autoria de documento. Nenhum arquivo de produção foi alterado nesta fase. Nenhum commit foi feito.

## 1. HEAD e branch reais

- Branch de trabalho: `claude/casca-v4-desk-v4-00`
- Criada a partir de `origin/main`, commit `39efeb59` ("Implementou L02 na Biblioteca")
- Este é o HEAD real no momento desta leitura — qualquer SHA citado no texto do prompt da Proprietária é só evidência anterior, não a base usada aqui.

## 2. Plano por fases — ausente

O prompt da Proprietária diz "Leia o plano por fases que acompanha este prompt" e cita `plano-fases-casca-v4-desk-2026-10-18.md`. **Esse arquivo não existe neste repositório** (busca por `find . -iname "*plano-fases-casca*"` retornou zero resultados, em todo o checkout, fora `node_modules`). Este documento foi construído só a partir do texto do prompt em si — nenhum conteúdo do plano por fases foi inventado ou presumido.

## 3. Divergência de estrutura de 3 vias — pergunta em aberto, não resolvida aqui

Três estruturas de primeiro nível coexistem no projeto agora, e nenhuma delas foi escolhida por mim — isso está fora do que este corte autoriza (ver "Limites" do prompt dela: não concede aprovação de merge, deploy ou mudança de schema; a decisão sobre qual estrutura de menu vale é da Proprietária, já registrada como pendente no AGENTS.md).

| Estrutura | Onde vive | Nº de grupos | Grupos |
|---|---|---|---|
| Mockup anexado nesta mensagem | Imagens (Hoje, Comercial/CRM Vivo, Checklist/Kanban, Caso 360, Pessoa 360) | 6 | Hoje · Marketing & Comercial · Pessoas & Casos · Inteligência & Pesquisa · Formalização & Financeiro · Governança & Administração |
| `GRUPOS_DESK` | `src/lib/navegacao-desk.ts:159` | 7 | Hoje · Comercial · Casos · Pessoas & Famílias · Pesquisa · Marketing · Configuração |
| `SETORES_DESK_V5` (o que a lateral realmente renderiza hoje) | `src/lib/navegacao-desk.ts:283` | 8 | Hoje · Comercial · Casos · Pessoas & Famílias · Pesquisa · Marketing · Formalização & Financeiro · Governança & Configuração |

Pontos de atrito concretos entre as três:
- O mockup funde Marketing dentro de "Marketing & Comercial"; as duas estruturas de código mantêm Marketing como grupo próprio.
- O mockup funde Casos com Pessoas em "Pessoas & Casos"; o código separa os dois desde a V4 de 7 grupos.
- O mockup separa "Checklist / Kanban operacional" como aba de primeiro nível; não há equivalente direto disso em nenhuma das duas estruturas de código (ver §6, achado de lacuna).
- `SETORES_DESK_V5` isolou Formalização & Financeiro como oitavo setor — nem o mockup nem `GRUPOS_DESK` fazem essa separação da mesma forma (o mockup tem "Formalização & Financeiro" como grupo próprio, igual ao V5 — isso bate; é `GRUPOS_DESK`, de 7, que funde contratos/financeiro dentro de "Comercial").

**Pergunta para a Proprietária, não decidida aqui:** qual das três estruturas é a fonte de verdade para o corte V4-02 em diante? Recomendo (sem decidir) observar que `SETORES_DESK_V5` já é o que roda em produção — um corte visual que reorganizasse os grupos para bater com o mockup de 6 seria, ele mesmo, uma mudança estrutural de navegação, não um "acabamento" de casca, e o prompt dela pede explicitamente para não reabrir isso agora.

## 4. Inventário recalculado de rotas (HEAD atual)

Contagem recalculada agora, não presumida: **91 arquivos** em `src/routes/_authenticated/` → **90 páginas reais** (um deles, `route.tsx`, é o layout do grupo `_authenticated`, não uma tela). Dentro das 90: **19 rotas `golive.*`**, confirmando que o número histórico citado no prompt ("90 entradas autenticadas... incluindo 19 rotas GoLive") ainda é exato no HEAD de hoje.

Distribuição por setor (usando `setorDaRota()` real de `navegacao-desk.ts`, que já lê de `SETORES_DESK_V5`):

| Setor (`SETORES_DESK_V5`) | Rotas |
|---|---|
| Hoje | 3 |
| Comercial | 6 |
| Casos | 8 |
| Pessoas & Famílias | 5 |
| Pesquisa | 14 |
| Marketing | 2 |
| Formalização & Financeiro | 7 |
| Governança & Configuração | 42 (inclui as 19 `golive.*`, 7 `governanca.*`, catálogo/SKU legado) |
| **Sem setor (achado novo)** | **3** |

**Achado de lacuna real (não é só doc desatualizada — é o código):** três rotas não casam com nenhum prefixo de `SETORES_DESK_V5`, então `setorDaRota()` retorna `undefined` para elas — elas não têm dono de grupo nenhum na estrutura viva:
- `/app-cliente-demo`
- `/biblioteca-evidencias/:caseId`
- `/relatorios-fase/:caseId`

Isso não bloqueia nada hoje (acesso direto por URL continua funcionando), mas é diferente do padrão `ALIMENTO_CONTEXTUAL`/`LEGADO_SEM_MENU` que o resto do saneamento usa — essas três simplesmente não foram classificadas em nenhuma rodada anterior. Registrado aqui para a fase de acabamento resolver (adicionar aos `prefixos` do setor correto, provavelmente Pesquisa e Casos), não corrigido nesta leitura.

## 5. Matriz de cobertura (nível de alinhamento visual por rota)

Com leitura de código, o teto realista de avaliação é **VISUAL_IMPLEMENTADO** (o componente já usa os padrões V4 — `CaCard`/`EstadoVazio` de `@/components/saas/shell`, ou o par `SaasShell` + `@/components/prancha-v4/kit`) ou **sem avaliação de V4 — legado/golive**. Nenhuma linha foi promovida a `VISUAL_HOMOLOGADO`, `FUNCIONAL_INTEGRADO`, `PUBLICADO` ou `COMPROVADO_EM_USO` — essas exigem prova da Proprietária que esta leitura não tem.

Sinal objetivo usado: contagem de `CaCard`/`EstadoVazio` por arquivo (proxy direto de uso do design system V4; não mede fidelidade pixel a pixel).

| Rota | Arquivo | Linhas | CaCard | EstadoVazio | Leitura |
|---|---|---:|---:|---:|---|
| /painel | painel.tsx | 396 | 21 | 5 | V4 forte — ver §6 |
| /pessoas/:clienteId | pessoas.$clienteId.tsx | 1750 | 29 | 9 | V4 forte |
| /casos/:caseId/contrato/preparar | casos.$caseId.contrato.preparar.tsx | 1416 | 29 | 0 | V4 forte |
| /financeiro | financeiro.tsx | 1404 | 22 | 6 | V4 forte |
| /leads | leads.tsx | 1604 | 13 | 0 | V4 parcial — ver §6 |
| /propostas | propostas.tsx | 688 | 13 | 2 | V4 parcial |
| /acessos-portal | acessos-portal.tsx | 886 | 11 | 4 | V4 parcial |
| /contrato-parametros/:id | contrato-parametros.$id.tsx | 402 | 11 | 0 | V4 parcial |
| /ordens-servico | ordens-servico.tsx | 468 | 11 | 2 | V4 parcial |
| /equipe | equipe.tsx | 415 | 9 | 2 | V4 parcial |
| /biblioteca, /calls | biblioteca.tsx, calls.tsx | 985, 587 | 7 cada | 0 | V4 parcial |
| /pesquisa-modulo | pesquisa-modulo.index.tsx | 570 | 7 | 7 | V4 parcial |
| /conciliacao-catalogo, /divergencias-catalogo | — | 168, 233 | 5 cada | 2 cada | V4 parcial |
| /contrato-parametros, /governanca/migracao-onboarding-gate, /ops-excecoes | — | — | 5 cada | 0–varia | V4 parcial |
| /qualidade | qualidade.tsx | 113 | 4 | 2 | V4 parcial |
| /privacidade | privacidade.index.tsx | 104 | 3 | 0 | V4 parcial |
| /escopo-origem | escopo-origem.tsx | 242 | 3 | 2 | V4 parcial |
| **/casos/:caseId** | **casos.\$caseId.index.tsx** | **3718** | **0** | **4** | **Padrão diferente — ver §6, não é "sem V4"** |
| /clientes | clientes.tsx | 822 | 0 | 2 | Padrão SaasShell/EstadoVazio, sem CaCard |
| /configuracoes, /conversao, /crm-mestre, /marketing, /importacoes | — | — | 0 | 1–3 | Padrão SaasShell/EstadoVazio, sem CaCard |
| Demais 19 rotas `golive.*` | golive.\*.tsx | 89–586 | 0 | 0 | Shell próprio (`GoLiveShell`, `@/components/golive/*`) — família separada, fora do escopo deste corte visual por decisão já registrada da Proprietária |
| Restante (~45 rotas: achados, pesquisa-evidencias, onboarding, nucleos, governanca.\*, catálogo, etiquetas, matriz-jurídica, homologação-skus, histórico, app-cliente-demo etc.) | — | — | 0 | 0 | Sem sinal de `CaCard`/`EstadoVazio` — candidatas a V4-03/04/05, não verificadas tela a tela nesta fase |

Leitura honesta: "CaCard=0" não significa necessariamente "tela feia" — `casos.$caseId.index.tsx` e `clientes.tsx` usam `SaasShell` + `EstadoVazio` + os gráficos de `@/components/prancha-v4/kit` (que é, pelo nome, parte do mesmo sistema de design V4, só que pela via de componente de gráfico em vez do wrapper `CaCard`). Tratar isso como "duas implementações paralelas do mesmo sistema V4" é mais preciso do que "metade não é V4" — mas a divergência de padrão (CaCard vs. SaasShell+prancha-v4/kit) é, ela mesma, um candidato natural para o corte V4-01 (padronizar o wrapper, não o conteúdo).

## 6. Comparação detalhada das 5 telas com imagem de referência

### Hoje → `/painel` (painel.tsx)

Praticamente 1:1 com o mockup. Títulos de card no código batem literalmente com os títulos do mockup:

| Bloco no mockup | Bloco no código (`painel.tsx`) | Veredito |
|---|---|---|
| Decisões prioritárias | `titulo="Decisões prioritárias"` (L187) | Implementado |
| Tarefas e microentregas | `titulo="Tarefas e microentregas"` (L230) | Implementado |
| Cadência dos casos | `titulo="Cadência dos casos"` (L257) | Implementado |
| Casos sem próxima ação | `titulo="Casos sem próxima ação"` (L271) | Implementado |
| Microentregas prontas para revisão | `titulo="Microentregas prontas para revisão"` (L285) | Implementado |
| Funil de leads · Visão Geral | `titulo="Funil de leads · Visão Geral"` (L309) | Implementado |
| Alertas centralizados · com origem | `titulo="Alertas centralizados · com origem"` (L325) | Implementado |
| Ritmo operacional · 6 semanas | `titulo="Ritmo operacional · 6 semanas"` (L341) | Implementado |
| Distribuição das prioridades | `titulo="Distribuição das prioridades"` (L357) | Implementado |
| 4 KPIs do topo (Decisões do dia / Cadências vencidas / Casos sem próxima ação / Microentregas para revisão) | `FaixaKpis`/KPIs no topo (L43+) — não conferi rótulo-a-rótulo nesta leitura rápida | Não conferido nesta fase |

Não há corte estrutural pendente aqui. Qualquer diferença que sobrar é de dado (demonstrativo no mockup vs. real no código), não de composição.

### Comercial / CRM Vivo → `/leads` (leads.tsx)

Forte correspondência, com nomes de card levemente diferentes:

| Bloco no mockup | Bloco no código | Veredito |
|---|---|---|
| Aquisição por canal | `titulo="Aquisição por canal"` (L495) | Implementado, nome idêntico |
| Conversão por etapa | `titulo="Conversão por etapa"` (L513) | Implementado, nome idêntico |
| Origem e qualidade | `titulo="Qualidade por canal"` (L528) | Implementado, **nome diverge** — mesmo conceito (barras de progresso por origem), rótulo diferente |
| Funil comercial vivo (Kanban Leads→Discovery→Diagnóstico→Proposta→Contrato) | `titulo="Quadro por etapa"` (L560) | Implementado, **nome diverge** — mesma função |
| 4 KPIs do topo (Leads ativos / Discovery / Conversão / Parados) | Não localizados rótulo-a-rótulo nesta leitura | Não conferido nesta fase |

Nenhum bloco do mockup está ausente na função — a divergência é só de rótulo em 2 dos ~4 blocos. Candidato natural a um micro-ajuste de texto no V4-02, não a reescrita.

### Checklist / Kanban operacional — **sem rota correspondente clara**

Este é o achado mais importante da comparação. O mockup mostra uma tela de primeiro nível com 4 KPIs (Confirmar/Em revisão/Pendente crítico/SLA em risco) e um Kanban de 5 colunas por **status de tarefa** (Não iniciada / Em andamento / Bloqueada / Concluída / Cancelada), com cards trazendo "próximo passo", prioridade, responsável e prazo.

Nenhuma rota atual bate com essa estrutura:
- `/ops.tsx` — 47 linhas, não tem Kanban nem esses KPIs.
- `/tarefas.tsx` — 94 linhas, mesma situação.
- `golive.kanban.tsx` — tem Kanban, mas por **faixa de prazo de um único caso canônico** (Vencida/Hoje/Próximos 7 dias/Aguardando externo), não por status operacional cross-caso.

Não inventei qual rota deveria virar isso — registro como lacuna real para a Proprietária decidir: (a) é uma tela nova que ainda não existe no código, (b) é uma recomposição de `/ops` ou `/tarefas` para esse formato, ou (c) é uessa reaproveitamento do padrão de `golive.kanban.tsx` com colunas por status em vez de prazo. Isso não pode entrar no "primeiro corte" como reescrita silenciosa — é decisão de produto, fora do que este corte visual autoriza.

### Caso 360 → `/casos/:caseId` (`casos.$caseId.index.tsx`)

Arquivo com 3718 linhas — o maior do repositório por larga margem. Usa `SaasShell` + `EstadoVazio` (de `@/components/saas/shell`) e os primitivos gráficos de `@/components/prancha-v4/kit` (`DonutEstados`, `JornadaMarcos`, `LinhaTempoGrafica`, `BarrasHorizontais` etc.) — **não** usa `CaCard`. O mockup mostra blocos "Linha do tempo", "Participantes", "Progresso do caso por frente", "Estados do dossiê" (donut), "Jornada D0–D365" — todos nomes de componente que batem com os primitivos importados (`JornadaMarcos`, `DonutEstados`, `LinhaTempoGrafica`), mas não confirmei bloco a bloco dentro de um arquivo de 3718 linhas nesta leitura — seria necessário um passe dedicado, fora do orçamento desta fase V4-00.

Importante: as 8 `SECOES` do Caso 360 (visão, jornada, pessoas, pesquisa, documentos, formalização, financeiro, histórico) são regra fixa do AGENTS.md (`src/lib/etapas-caso.ts`) e não podem ser tocadas por este corte visual — qualquer proposta de V4-03 aqui precisa preservar as 8 seções como estão, só trocar acabamento.

### Pessoa 360 → `/pessoas/:clienteId` (`pessoas.$clienteId.tsx`)

1750 linhas, 29 `CaCard`, 9 `EstadoVazio` — sinal forte de V4 já aplicado. O mockup mostra "Identidade", "Gráfico de parentesco", "Casos vinculados", "Fontes", "Localização", "Confiança da pessoa", "Completude por dimensão", "Rede de vínculos" — não confirmei título por título nesta leitura (orçamento de tempo), mas o volume de `CaCard` (29) é consistente com uma tela já composta majoritariamente em blocos V4.

## 7. Corte proposto para aprovação (V4-01 / primeiro subcorte V4-02) — NADA APLICADO

Proposta, não implementação. Dois candidatos, do menor risco para o maior:

**Opção A — V4-02 micro-ajuste de rótulos em `/leads` (menor risco, menor valor):**
Trocar apenas o texto de 2 `titulo=`/`eyebrow=` em `leads.tsx` (L528, L560) para bater literalmente com o mockup ("Origem e qualidade" em vez de "Qualidade por canal"; "Funil comercial vivo" em vez de "Quadro por etapa"). Zero mudança de lógica, zero componente novo, 2 linhas. Risco de regressão: nenhum (são apenas as props `titulo`/`eyebrow`, não lidas por nenhum teste localizado nesta leitura — a confirmar antes de aplicar).

**Opção B — V4-01 real: unificar o wrapper de card em `casos.$caseId.index.tsx` e `clientes.tsx` (maior valor, maior escopo):**
Não é reescrita de tela — é trocar o wrapper visual de cada bloco existente de `SaasShell`-interno/`div` avulso para `CaCard`, mantendo o mesmo conteúdo, mesmos leitores/writers, mesmos dados. Como `casos.$caseId.index.tsx` tem 3718 linhas, este corte precisaria ser fatiado por seção (as 8 `SECOES` já existentes são a fatia natural) — um subcorte por seção, não o arquivo inteiro de uma vez, conforme pedido no item 3 do prompt dela ("um subcorte por rota/família").

Recomendo começar pela Opção A nesta aprovação (baixíssimo risco, fecha a divergência de rótulo encontrada em §6) e tratar a Opção B como o verdadeiro primeiro subcorte de V4-03 (Caso 360), não de V4-02 — ela é maior que um "subcorte" e mexe na tela mais crítica do Desk, por isso prefiro trazer para aprovação separada em vez de embutir aqui.

**Nenhuma das duas opções foi aplicada.** Aguardando decisão da Proprietária sobre: (1) qual das 3 estruturas de menu (§3) é a base para os cortes seguintes, e (2) qual das duas opções acima (ou nenhuma, ou outra) autorizar como primeiro corte real.

## 8. O que já é V4 vs. o que é parcial (para evitar retrabalho)

**Já é V4 (confirmado por sinal forte, não precisa de retrabalho):**
`/painel`, `/pessoas/:clienteId`, `/casos/:caseId/contrato/preparar`, `/financeiro` — 4 telas com uso denso de `CaCard`/`EstadoVazio`, incluindo 3 das 5 referências desta mensagem.

**V4 parcial (componente existe, mas não foi conferido bloco a bloco contra um mockup aprovado):**
`/leads`, `/propostas`, `/acessos-portal`, `/contrato-parametros/:id`, `/ordens-servico`, `/equipe`, `/biblioteca`, `/calls`, `/pesquisa-modulo`, `/conciliacao-catalogo`, `/divergencias-catalogo`, `/qualidade`, `/privacidade`, `/escopo-origem` e mais ~5 rotas pequenas — usam `CaCard` mas em volume baixo (3–13 ocorrências); não dá para dizer "pronta" sem mockup de referência para cada uma.

**Padrão V4 alternativo, não "sem V4" (não confundir com as duas listas acima):**
`/casos/:caseId`, `/clientes`, `/configuracoes`, `/conversao`, `/crm-mestre`, `/marketing`, `/importacoes` — usam `SaasShell` + `EstadoVazio` + `@/components/prancha-v4/kit`, não `CaCard`. Candidatas naturais à Opção B do corte (§7), não a uma reescrita.

**Sem sinal de V4 nenhum, não verificadas tela a tela nesta fase:**
Todas as 19 rotas `golive.*` (família separada, fora deste corte por decisão já tomada da Proprietária) + ~26 outras rotas (achados, onboarding, núcleos, governança.\*, catálogo, etiquetas, matriz jurídica, homologação-skus, histórico, app-cliente-demo, biblioteca-evidencias, relatorios-fase, etc.) — candidatas a V4-03/04/05 conforme o plano de fases dela, nenhuma avaliada em detalhe aqui.

**Lacunas de produto, não de acabamento (não entram em nenhum corte visual sem decisão de produto antes):**
- Checklist/Kanban operacional sem rota correspondente (§6).
- 3 rotas sem setor dono em `SETORES_DESK_V5` (§4): `/app-cliente-demo`, `/biblioteca-evidencias/:caseId`, `/relatorios-fase/:caseId`.
