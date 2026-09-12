# Verificação tela a tela — mockup aprovado (17 páginas) × auditoria (47 páginas) × produto no ar

- Data: 2026-09-12
- Fontes: `clube-ancestral-mockup-2.pdf` (17 páginas, contrato visual), `clube-ancestral-mockup-auditoria.pdf` (47 páginas, conteúdo/estados/indicadores), código em `src/`, publicação em GitHub + Vercel próprio.
- Natureza: conferência somente leitura. Nenhuma migration, RLS, integração, aba ou entidade nova foi criada por este documento.
- Regra aplicada: rota existir **não** é aderência. Só conta como aderente quando há conteúdo real, indicador derivado de fonte canônica e motor (server function/RPC) por trás.

## 1. Taxonomia conferida

| Camada | Mockup 17 | Produto hoje | Veredito |
|---|---|---|---|
| App Cliente | 7 telas: Home · Jornada · Radar · Árvore · Documentos · Legado · Conta | 7 abas em `portal-shell.tsx`, derivadas de `src/lib/portal-mapa-kit.ts` | Aderente na barra |
| Desk | 7 telas: Visão Geral · Casos 360 · Checklist · Validação Jurídica · Radar Interno · Alertas · Biblioteca Mestre | 6 grupos em `GRUPOS_DESK`, com as 7 telas distribuídas dentro deles | Aderente por decisão vigente (6 grupos), sem nona aba |

Auditoria de 47 páginas mostra, no protótipo antigo, uma barra do cliente com 10 itens (Home, Jornada, Entrega, Fase 01, Fase 02, Radar, Árvore, Documentos, Legado, Conta). **Isso é o estado antigo, não o alvo.** Rotas `/portal/entregas`, `/portal/fase-01`, `/portal/fase-02`, `/portal/faturas`, `/portal/proposta` ainda existem no código — dívida declarada (D-NAV-01), fora da barra de primeiro nível.

## 2. App Cliente — 7 telas

| # | Tela mockup | Rota real | Conteúdo esperado (17 + 47) | Motor / fonte | Estado |
|---|---|---|---|---|---|
| 1 | Home | `/portal` | Etapa atual, progresso, próxima ação, achados recentes, microentrega publicada | `portal-dados-vivos.ts` (`microentregaPublicada`), projeções `app_projections` | Aderente |
| 2 | Jornada | `/portal/jornada` | Duas linhas: história da família 1820–2024 × jornada do caso; marcos; "momentos de encontro"; etapa atual com CTA | `jornada-cliente.functions.ts`, timeline do caso | Aderente em estrutura; **falta** o selo "União de Ramos" e a contagem de marcos/atualizações publicadas como indicadores no topo (auditoria p. 03, 26) |
| 3 | Radar | `/portal/radar` | Radar de origem em 6 eixos, rota provável, resumo da leitura, selo "em validação documental" | Projeção sanitizada do radar do caso | Aderente em gráfico; **falta** o bloco "Rota provável + % de aderência por país" em texto (auditoria p. 07, 30) |
| 4 | Árvore | `/portal/arvore` | G1–G5, linha prioritária destacada, conexão-chave, territórios, "o que ainda falta" | Pessoas/linhagens projetadas | Parcial: árvore presente; **falta** o painel lateral "conexão-chave / território / o que ainda falta" (auditoria p. 31) |
| 5 | Documentos | `/portal/documentos` | Peça de trabalho atual, pendência principal, listas Pendentes/Solicitados/Recebidos, upload até 10 MB | `documentos.functions.ts`, `documentos-solicitacoes.functions.ts` | Aderente; conferir rótulo "peça de trabalho atual" |
| 6 | Legado | `/portal/legado` | Biblioteca da jornada: achados com pessoa relacionada e estágio da evidência; continuidade da jornada | Achados publicados (`genealogical_findings` projetados) | Parcial: lista existe; **falta** o cartão "continuidade da jornada — próxima etapa" (auditoria p. 10, 33) |
| 7 | Conta | `/portal/conta` | Perfil, plano, alertas do cliente, histórico | Dados do acesso do cliente | Aderente |

Regra mantida em todas: nenhum alerta interno, nenhum juízo de mérito, nenhuma nota interna. Confirmado por leitura das projeções sanitizadas.

## 3. Desk — 7 telas do mockup dentro dos 6 grupos

| # | Tela mockup | Rota real | Indicadores esperados | Motor | Estado |
|---|---|---|---|---|---|
| 1 | Visão Geral | `/painel` | KPIs (teto 5), funil de leads, cadências vencidas, casos sem próxima ação, leads parados | `alertas.functions.ts` → `listarAlertasCentrais`; RPC `proxima_acao_prioritaria_lote`; `montarFilasHoje` | Aderente — os três cartões já leem dado real |
| 2 | Casos 360 | `/casos`, `/casos/$caseId` | Carteira em cards, saúde do caso, participantes, jornada D0–D365, próxima ação/responsável/prazo | `caso-canonico.functions.ts`, `caso-ficha.functions.ts`, `cadeia-operacional.functions.ts` | Aderente |
| 3 | Checklist | `/tarefas`, `/ops`, `/plano-acao/$caseId` | Tarefas por prioridade, checklist da semana, SLA | `qualidade.functions.ts` (`listarChecklists`), planner | Parcial: existe checklist e SLA; **falta** a visão semanal consolidada da auditoria (p. 19) em uma única superfície |
| 4 | Validação Jurídica | `/matriz-juridica` | Elegibilidade, parecer, validações legal/consistência com estados | `matriz-juridica.ts`, `validacao-juridica-caso.ts`, `trilhas-juridicas.functions.ts` | Aderente; alertas restritos ao contrato/ato formal |
| 5 | Radar Interno | `/qualidade` | Matriz de prioridade × elegibilidade, radares individuais, varredura de inconsistências | `qualidade.functions.ts` (`rodarVarredura`, `listarInconsistencias`) | Aderente |
| 6 | Alertas | `/alertas` | Cadências vencidas, casos sem próxima ação, leads parados, com origem (Jornada / Caso 360 / CRM) | `listarAlertasCentrais` — derivação somente leitura, escopo de organização, sem fixtures | Aderente |
| 7 | Biblioteca Mestre | `/biblioteca`, `/microentregas` | Fila rascunho → revisão → aprovado → publicado; microentrega com descrição, fonte, evidência, achado, dono, prazo | `biblioteca-evidencias.functions.ts` → `listarFilaMicroentregas` sobre `app_projections` | Aderente |

## 4. Telas novas conferidas (não estavam no mockup de 17)

| Tela | Rota | Papel | Motor | Situação |
|---|---|---|---|---|
| Central de Alertas | `/alertas` | Reúne as três filas com origem por tela | `listarAlertasCentrais` | Real, sem gravação |
| Microentregas | `/microentregas` | Fila editorial ligada ao App Cliente | `listarFilaMicroentregas` | Real, com dono, prazo e status |
| Prévia visual do Desk | `/previa-desk` | 15 superfícies demonstrativas para aceite visual | Sem leitura de dado real | Demonstrativa, rotulada |
| Mesa de Discovery | `/calls` | Entrada comercial | `crm-desk.functions.ts`, `crm-mestre` | Real |

## 5. Dívidas declaradas (não corrigidas por este documento)

- **D-NAV-01** — rotas `entregas`, `fase-01`, `fase-02`, `faturas`, `proposta` continuam existindo sob `/portal`; fora da barra de 7 abas, aguardando arquivamento explícito.
- **D-APP-02** — Jornada, Radar, Árvore e Legado do App Cliente ainda não expõem todos os indicadores textuais da auditoria (marcos publicados, rota provável em texto, conexão-chave/territórios, continuidade da jornada).
- **D-DESK-03** — "Checklist da Semana" da auditoria (p. 19) está distribuído entre `/tarefas`, `/ops` e plano de ação; sem superfície semanal única.
- **D-GOV-04** — memória permanente cita 8 grupos; runtime opera 6 (`GRUPOS_DESK`). Nenhuma das leituras se arquiva até `COMPROVADO_EM_USO`.

## 6. Publicação

- Código publicado no GitHub do projeto e servido pelo Vercel próprio; o mesmo build responde pelas rotas do Desk e do App Cliente.
- Merge em `main` / produção continua exigindo autorização explícita da Proprietária, com branch e SHA informados.

## 7. O que ainda falta para prova de aceite

Este documento é conferência estrutural. Para virar aceite, falta prova autenticada da Proprietária (`tati@pluggedresearch.com`) com prints **inicial, ação, confirmação, releitura e integração** por tela, registrados em `docs/relatorios/2026-09-11_registro-prova-autenticada.md`. Até lá, cada linha "Aderente" acima vale como **verificado em código**, não como `COMPROVADO_EM_USO`.
