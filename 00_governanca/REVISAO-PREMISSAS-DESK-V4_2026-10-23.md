# Revisão das premissas do Desk V4

Data: 2026-10-23
Base: GitHub `main` `41ce1f73` (publicado no Lovable) e os documentos de decisão do repositório
Motivo: a Proprietária esclareceu hoje que **as telas GoLive servem para ver o caso individual de cada cliente, e o Caso 360 é a visão macro de todos os clientes**. A unificação (U1–U4) foi **suspensa** antes de qualquer alteração no código, porque o plano tratava o GoLive como um Desk antigo a ser desligado.

---

## 1. Premissa nova (23/10, Proprietária)

| Camada | Para que serve | Onde está hoje no código |
|---|---|---|
| **GoLive** (`/golive/*`, 19 telas) | Visão **individual**: o caso de **cada cliente**, do lead ao App | Só abre **um** caso, o da Ana Luiza (`CA-CID-AT-FAM-2026-001`). Nenhuma das 19 telas recebe o caso pelo endereço, e **todas as gravações estão fixas nesse caso** (`golive-escritores.functions.ts`, função `contexto`). |
| **Caso 360 / Desk V4** | Visão **macro**: todos os clientes juntos | "Caso 360" é hoje o nome da tela **de um caso** (`/casos/$caseId`). A visão macro está espalhada entre Hoje (`/painel`) e Todos os casos (`/casos`). |

Consequência: a premissa só se cumpre se o GoLive passar a abrir qualquer caso e se o Caso 360 for a visão de todos. Hoje acontece o contrário nos dois pontos.

---

## 2. Matriz de premissas

Situação: ✅ cumprida · ⚠️ parcial · ❌ violada · ⚔️ em conflito com outra premissa

| # | Premissa | Fonte (data) | O que o código faz hoje | Situação |
|---|---|---|---|---|
| P1 | GoLive = caso individual de **cada** cliente | Proprietária (23/10) | Só o caso da Ana; as gravações vão sempre para o caso dela | ❌ |
| P2 | Caso 360 = visão macro de todos os clientes | Proprietária (23/10) | Caso 360 é a ficha de **um** caso (8 seções + Visão Concreta + 4 lotes) | ⚔️ com P4 |
| P3 | GoLive é camada **transitória**, a ser absorvida pelas telas V4; redirecionar só depois de paridade funcional | `plano-consolidacao-app-golive-desk.md` (07/10, homologado 13/10) | As 19 telas existem e não foram absorvidas | ⚔️ com P1 e P5 |
| P4 | Caso 360 = **Ficha Guiada de 4 lotes (A–D) de um caso**; as 3 colunas estão vetadas | `2026-10-13-reparacao-caso-360-padrao-golive-4-lotes.md` | `/casos/$caseId` lê os 4 lotes do caso aberto (PR #171) | ✅ ⚔️ com P2 |
| P5 | Preservar as **19 rotas GoLive**; o Lovable não pode sobrepor | `2026-10-13-blindagem-golive-e-app-minimo.md` | Rotas preservadas | ✅ |
| P6 | Arquivos `golive-*` intocados; as composições podem ser **reaproveitadas** nas rotas V4 | `AGENTS.md` (19/10) | Respeitado; o Caso 360 reaproveita os 4 lotes | ✅ |
| P7 | Desk V4 sem blocos recolhidos ou "3 colunas" com caixas embaixo | Reparação Caso 360 (13/10) | 28 telas com blocos antigos recolhidos (`<details>`), entre elas o Caso 360 (6) | ❌ |
| P8 | Nenhum cartão ou gráfico da prancha V4 some por falta de dado | `matriz-sanitizacao-e-absorcao-golive-desk-v4.md` (13/10) | O kit V4 desenha o estado zero ("Sem dado registrado ainda") | ✅ |
| P9 | Menu: **6 grupos**, com Financeiro dentro de Formalização | `AGENTS-MEMORIA-COMPLETA` (11/10) e decisão de 11/09 | **8 grupos**, com Financeiro separado | ⚔️ com P10 |
| P10 | Menu: **7 grupos da V4 + Financeiro = 8**; uma só lista de menu | `AGENTS.md` (18/10, mantida em 19/10) | 8 grupos | ✅ ⚔️ com P9 |
| P11 | **Kanban é o dono do trabalho**; OPS e exceções só em **leitura** | Plano de consolidação (07/10) | Invertido: `/ops` **grava** (salvar/mover/arquivar tarefa, salvar microentrega, regra de SLA) e `/tarefas` **só lê** | ❌ |
| P12 | **Lead único**: o CRM Vivo é o funil, as Calls fazem o Discovery, o CRM Mestre é só dicionário | Plano de consolidação; `AGENTS.md` | CRM Mestre fora do menu (link dentro de Discovery) ✅. Ainda existem `/golive/leads` e `/golive/comercial` gravando leads só no contexto do piloto | ⚠️ |
| P13 | App Cliente com **7 abas** congeladas (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta) | Blindagem (13/10); `AGENTS.md` | Rotas `/portal` com as 7 abas; há telas extras fora do menu (`/portal/faturas`, `/portal/proposta`, `/portal/casos/$id`) | ⚠️ |
| P14 | O admin vê o App só pela Visão administrativa (`/app-cliente-como-pessoa?casoId=`) | `AGENTS.md` (19/10) | Existe; e `/golive/app` é um segundo espelho do App (só da Ana) | ⚠️ |
| P15 | As 5 etapas do caso vêm só de `etapas-caso.ts` | `AGENTS.md` | Não verificado nesta revisão | — |
| P16 | Nada é arquivado sem `COMPROVADO_EM_USO` (prints autenticados da Proprietária) | Adendo de 10/09 | Nenhum arquivamento feito; a unificação foi suspensa | ✅ |
| P17 | Sem migração, publicação, merge ou deploy sem autorização explícita | `AGENTS.md` | Respeitado | ✅ |
| P18 | Uma única produção: o Lovable | Decisão de 23/10 | A Vercel foi desligada | ✅ |

---

## 3. Conflitos que só a Proprietária pode resolver

1. **O que é o "Caso 360" (P2 × P4).** Em 13/10 ficou registrado que o Caso 360 é a ficha de 4 lotes **de um caso**. Hoje a regra é que ele seja a visão **macro de todos**.
   - Opção A: "Caso 360" passa a ser a tela macro, que hoje se chama "Todos os casos" (`/casos`), e a ficha de um caso vive no GoLive.
   - Opção B: "Caso 360" continua sendo a ficha de um caso (`/casos/$caseId`), e o macro fica em Todos os casos / Hoje.
2. **O GoLive é permanente ou transitório (P1 × P3).** O plano de 07/10 manda absorver o GoLive nas telas V4. A regra de hoje o torna a visão individual permanente.
   - Se for permanente, o plano de 07/10 (Fase 6, "absorção das 19 rotas") precisa ser revogado formalmente.
3. **Duas fichas de um mesmo caso.** Hoje existem duas: `/golive/caso` (só a Ana, com gravação) e `/casos/$caseId` (qualquer caso, que lê os 4 lotes do GoLive). Decidir qual é a ficha oficial do caso individual, para que não fiquem as duas.
4. **Menu de 6 ou de 8 grupos (P9 × P10).** O próprio repositório registra isso como dívida declarada.
5. **OPS × Kanban (P11).** O código faz o contrário do que foi decidido. É preciso confirmar se vale a regra de 07/10 (Kanban grava, OPS só lê).

---

## 4. O que muda no plano de unificação

- **Cancelado:** redirecionar as telas `/golive` para as telas V4 (era o item U1). Isso contrariaria P1 e P5.
- **Mantido:** trocar os 7 links da Hoje que levam para `/golive` genérico. Esses links passam a abrir o GoLive **do caso escolhido** (`/golive/...?casoId=`), não sempre o da Ana.
- **Novo e prioritário (se P1 for confirmada):** **GoLive por cliente.**
  1. As 19 telas `/golive/*` passam a receber `?casoId=`.
  2. Leitura: `carregarGoLive({ casoId })` já aceita o caso (PR #171); falta as telas repassarem o parâmetro.
  3. Gravação: a função `contexto()` de `golive-escritores.functions.ts` passa a receber o caso escolhido, validado por organização e RLS, em vez do código fixo `CODIGO_CASO_GO_LIVE`. Sem caso, mantém o piloto, para não quebrar o que funciona hoje.
  4. A tela macro (Caso 360 ou Todos os casos, conforme o conflito 1) ganha em cada linha o botão "Abrir caso no GoLive".
  5. Testes: uma gravação feita no caso X nunca cai no caso da Ana.
  - Observação: isso altera arquivos `golive-*`, que o `AGENTS.md` (19/10) manda manter intocados. Vai exigir uma nova decisão registrada.
- **Mantidos, depois das decisões acima:**
  - U2: tirar os blocos antigos empilhados nas telas V4 macro.
  - U3: refazer as telas antigas.
  - U4: trava automática.

---

## 5. Decisões pedidas à Proprietária

1. Conflito 1: Opção A ou B para o nome "Caso 360".
2. Conflito 2: o GoLive é permanente (visão individual), e a Fase 6 do plano de 07/10 fica revogada?
3. Autoriza alterar os arquivos `golive-*` para o GoLive abrir e gravar em qualquer caso (exceção à regra de 19/10)?
4. Menu: 6 ou 8 grupos?
5. OPS × Kanban: vale a regra de 07/10?
