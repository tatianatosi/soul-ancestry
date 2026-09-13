# De-para — mockup aprovado (17 páginas) × auditoria (47 páginas) × grupos do Desk × rotas reais

- Data: 2026-09-13
- Método: leitura somente-visual do mockup normativo (`clube-ancestral-mockup.pdf`/`clube-ancestral-mockup-2.pdf`, 17 páginas) para linguagem/hierarquia; a auditoria de 47 páginas (`clube-ancestral-mockup-auditoria.pdf`) orienta conteúdo/estados/indicadores, sem redesenhar navegação. App Cliente confirmado em **7 abas**; Desk vigente confirmado em **6 grupos**. Código existente não foi tratado como aceite — cada linha foi conferida contra o arquivo/linha real.
- Predecessores usados como base e reconferidos, não copiados às cegas: `docs/arquitetura/2026-09-10_de-para-mockup-17-desk-6-grupos.md`, `/mnt/documents/verificacao-tela-a-tela-mockup17-auditoria47.md`.
- Fonte de navegação do Desk: `src/lib/navegacao-desk.ts:62-77` (`TELAS_DESK_MOCKUP`, 7 nomes) e `src/lib/navegacao-desk.ts:81-206` (`GRUPOS_DESK`, 6 grupos reais). Fonte do App Cliente: `src/components/portal/portal-shell.tsx:26-42` (rótulos/ícones das 7 abas) e `src/components/portal/portal-shell.tsx:83-96` (montagem da barra a partir de `src/lib/portal-mapa-kit.ts`).

## 1. App Cliente — 7 abas do mockup × rota real × cobertura

| Tela mockup (17 pág.) | Rota real | Componentes/indicadores esperados (17+47) | Fonte de dado | Cobertura atual (file:line) | Lacuna |
|---|---|---|---|---|---|
| Home | `/portal` (`src/routes/portal/index.tsx`) | Progresso da jornada, próximos passos (Você/Nós), card "N pessoas conectadas", "recebidos recentemente" | `portal-dados-vivos.ts` (`microentregaPublicada`), `app_projections` | `src/components/portal/portal-shell.tsx:26-42` define aba; conteúdo em `src/routes/portal/index.tsx` | Sem lacuna estrutural identificada nesta rodada |
| Jornada | `/portal/jornada` | Duas colunas história × caso, marcos, selo "União de Ramos", contagem de marcos publicados | `jornada-cliente.functions.ts` | Selo presente: `src/routes/portal/jornada.tsx:177` ("União de Ramos — história e caso se encontram..."); contador: `src/routes/portal/jornada.tsx:80` (`ChipMeta rotulo="Marcos" valor={jornada.marcosPublicados}`) | Gap da auditoria de 2026-09-12 (`D-APP-02`) fechado — reconferir apenas se o dado voltar a ficar mudo |
| Radar | `/portal/radar` | Teia 6 eixos + bloco textual "Rota provável + % de aderência por país" | `radar-seis-eixos.ts` | Radar renderizado em `src/routes/portal/radar.tsx` (rota existe) | `grep -n "Rota provável\|rotaProvavel"` não retorna nada em `src/routes/portal/radar.tsx` — bloco textual **ausente**; mantém `D-APP-02` parcial |
| Árvore | `/portal/arvore` | G1–G5, linha prioritária, painel "conexão-chave / território / o que ainda falta" | Pessoas/relações projetadas, `TETO_ANCESTRAIS_G1_G5` | Árvore renderizada em `src/routes/portal/arvore.tsx` | `grep -n "conexão-chave\|território\|o que ainda falta"` não retorna nada em `src/routes/portal/arvore.tsx` — painel lateral **ausente** |
| Documentos | `/portal/documentos` | Peça de trabalho atual, pendência principal, listas Pendentes/Solicitados/Recebidos | `documentos.functions.ts`, `documentos-solicitacoes.functions.ts` | Rota presente em `src/routes/portal/documentos.tsx` | Rótulo "peça de trabalho atual" não reconferido nesta rodada — reabrir se a Proprietária apontar divergência de rótulo |
| Legado | `/portal/legado` | Biblioteca de achados + cartão "continuidade da jornada — próxima etapa" | Achados publicados projetados | Lista de achados em `src/routes/portal/legado.tsx` | `grep -n "continuidade da jornada\|próxima etapa"` não retorna nada em `src/routes/portal/legado.tsx` — cartão **ausente** |
| Conta | `/portal/conta` | Perfil, plano, alertas pessoais | Dados de acesso do cliente | `src/routes/portal/conta.tsx` + `COPY_TELAS.conta` | Sem lacuna estrutural identificada |

Rotas fora da barra (dívida declarada, não 8ª/9ª/10ª aba): `src/routes/portal/entregas.tsx`, `src/routes/portal/fase-01.tsx`, `src/routes/portal/fase-02.tsx`, `src/routes/portal/faturas.tsx`, `src/routes/portal/proposta.tsx` — confirmado que **não** aparecem na montagem de `nav` em `src/components/portal/portal-shell.tsx:88-94` quando `nivel === "client_workspace"`, só entram no ramo de proposta pré-cliente (`portal-shell.tsx:94`).

## 2. Desk — 7 telas do mockup × grupo (6) × rota real × cobertura

| Tela mockup (17 pág.) | Grupo do Desk | Rota real | Componentes/indicadores esperados | Motor / fonte | Cobertura atual (file:line) | Lacuna |
|---|---|---|---|---|---|---|
| Visão Geral | Hoje (`navegacao-desk.ts:82-92`) | `/painel` | KPIs (teto 5), fila priorizada, cadências vencidas, casos sem próxima ação | `listarAlertasCentrais`, `PainelDia` | `src/routes/_authenticated/painel.tsx:24-30` monta `<CardsAlertasCentrais />` e `<PainelDia />`; cartões centrais em `src/components/painel/cards-alertas-centrais.tsx:7,15` (`listarAlertasCentrais`) | KPI "Receita do mês" e "Conversão 34%" do mockup **não** aparecem no topo do `/painel` (confirmado ausência de qualquer referência a receita/conversão em `painel.tsx`) — decisão vigente é mantê-los fora por falta de cobertura honesta, não é regressão |
| Casos 360 | Pessoas & Casos (`navegacao-desk.ts:107-124`) | `/casos`, `/casos/$caseId` | Carteira em cards, saúde do caso, jornada D0–D365, próxima ação/responsável | `caso-canonico.functions.ts` | Item de menu: `navegacao-desk.ts:111` (`{ to: "/casos", label: "Casos 360" }`); rotas: `src/routes/_authenticated/casos.index.tsx`, `src/routes/_authenticated/casos.$caseId.index.tsx` | Sem lacuna estrutural nesta rodada; ficha e checklist convivem (ver linha Checklist) |
| Checklist | Pessoas & Casos (`navegacao-desk.ts:113-118`) | `/tarefas`, `/ops`, `/plano-acao/$caseId` | Tarefas por prioridade, checklist da semana, SLA em superfície única | `qualidade.functions.ts` (`listarChecklists`) | Itens de menu distintos: `navegacao-desk.ts:114` (`/tarefas`), `:115` (`/ops`), `:116` (`/ops-excecoes`) — três rotas, não uma | Persiste `D-DESK-03`: "Checklist da Semana" continua fragmentado entre `/tarefas`, `/ops` e `plano-acao/$caseId`; nenhuma dessas rotas concentra as três coisas numa view |
| Validação Jurídica | Inteligência & Pesquisa (`navegacao-desk.ts:157`) | `/matriz-juridica` | Elegibilidade, parecer, validações legal | `matriz-juridica.ts`, `validacao-juridica-caso.ts` | Item de menu: `navegacao-desk.ts:157` (`{ to: "/matriz-juridica", label: "Validação Jurídica" }`); rota: `src/routes/_authenticated/matriz-juridica.tsx` | Sem lacuna estrutural identificada nesta rodada |
| Radar Interno | Pessoas & Casos (tela, `navegacao-desk.ts:117`) + Hoje (carteira) | `/qualidade` | Matriz de prioridade × elegibilidade, radar por caso, varredura de inconsistências | `qualidade.functions.ts` (`rodarVarredura`, `listarInconsistencias`) | `src/routes/_authenticated/qualidade.tsx:1-6` importa `PainelQualidade` e `MatrizPrioridadesConectada`; matriz lê `crm_casos` real em `src/components/desk/matriz-prioridades-conectada.tsx:20-21` (`queryKey: ["saas","crm_casos",false]`) | Sem fixture identificado nesta leitura; texto interno em `qualidade.tsx:33-36` já declara "sem campo preenchido, o ponto não é inventado" |
| Alertas | Hoje (`navegacao-desk.ts:84`) | `/alertas` | Cadências vencidas, casos sem próxima ação, leads parados, com origem por tela | `listarAlertasCentrais` (`alertas.functions.ts`) | `src/routes/_authenticated/alertas.tsx:8` importa `listarAlertasCentrais`/`listarAlertas`; consumo em `:59` | Sem lacuna estrutural identificada nesta rodada |
| Biblioteca Mestre | Inteligência & Pesquisa (`navegacao-desk.ts:149-150`) | `/biblioteca`, `/microentregas` | Fila rascunho→revisão→aprovado→publicado, microentrega com dono/prazo/fonte | `biblioteca-evidencias.functions.ts` (`listarFilaMicroentregas`) | Itens de menu: `navegacao-desk.ts:149` (`/biblioteca`), `:150` (`/microentregas`); consumo real em `src/routes/_authenticated/microentregas.tsx:9,27,55` (`listarFilaMicroentregas`) | Sem lacuna estrutural identificada nesta rodada |

## 3. Sétima entrada do mockup que não é 7ª aba do Desk — CA-04/CRM

O card "Fontes de verdade" (`/crm-mestre`) não é uma das 17 páginas do mockup e não deve virar 7ª aba. Confirmado em `navegacao-desk.ts:100-105`: `/crm-mestre` e `/governanca/dicionario-calls-crm` vivem dentro do grupo "Marketing & Comercial" (id `comercial`, `navegacao-desk.ts:97`), junto de `/calls` e `/leads` — não em navegação própria.

## 4. Grupos do Desk sem tela homônima no mockup de 17 (superfície adicional, não lacuna do mockup)

| Grupo (`navegacao-desk.ts`) | Rotas | Observação |
|---|---|---|
| Marketing & Comercial (`:93-106`) | `/marketing`, `/calls`, `/leads`, `/crm-mestre`, `/governanca/dicionario-calls-crm`, `/propostas`, `/conversao`, `/proximas-acoes` | Fora das 17 páginas; convive como sistema comercial único (CA-04 + Calls), não como página do mockup |
| Formalização & Financeiro (`:164-177`) | `/contratos`, `/contrato-parametros`, `/ordens-servico`, `/governanca/contrato-base`, `/governanca/modelo-individual`, `/governanca/modelo-familiar-casal`, `/governanca/modelos-contratuais`, `/catalogo`, `/financeiro` | Fora das 17 páginas; hospeda o financeiro que o KPI "Receita do mês" do mockup deveria expor, mas hoje não sobe ao topo do Hoje |
| Governança & Administração (`:179-198`) | `/configuracoes`, `/equipe`, `/etiquetas`, `/integracoes`, `/importacoes`, `/metricas`, `/privacidade` + 5 rotas explicitamente rotuladas "(legado)" em `:194-198` | Legado citado em `ROTAS_LEGADO_MENU_GOVERNANCA` (`navegacao-desk.ts:203-209`); decisão registrada de 10/09/2026 mantém no menu "por ora", com plano declarado de saída para arquivo GitHub |

## 5. Dívidas remanescentes (reconfirmadas nesta leitura, não fechadas por este documento)

- **D-NAV-01** — `src/routes/portal/entregas.tsx`, `fase-01.tsx`, `fase-02.tsx`, `faturas.tsx`, `proposta.tsx` continuam existindo como arquivo de rota, fora da barra de 7 abas (`portal-shell.tsx:88-94`).
- **D-APP-02 (parcial)** — Jornada fechou o selo "União de Ramos" e o contador de marcos (`jornada.tsx:80,177`); Radar (rota provável/%), Árvore (conexão-chave/território) e Legado (continuidade da jornada) seguem sem o bloco textual da auditoria — confirmado por ausência de string nos três arquivos de rota.
- **D-DESK-03** — Checklist da Semana continua disperso entre `/tarefas`, `/ops`, `/ops-excecoes` e `plano-acao/$caseId` (itens de menu em `navegacao-desk.ts:114-117`); nenhuma rota única concentra tarefa + SLA + checklist semanal.
- **D-GOV-04** — nenhuma leitura deste documento é `COMPROVADO_EM_USO`; carece de prova autenticada da Proprietária por tela, como já exigido em `verificacao-tela-a-tela-mockup17-auditoria47.md` seção 8.

## 6. Regra de leitura aplicada

Rota existir não foi tratado como aderência: cada "cobertura atual" acima cita o `grep`/linha que localizou o dado ou string esperada; onde a busca não retornou nada, a lacuna foi registrada como ausência confirmada, não como suposição.
