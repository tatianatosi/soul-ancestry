# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Atualizado em:** 2026-09-11

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build, preview ou declaração de agente **não** alteram essa certificação.

## Ambientes tentados

### A. Vite local no Cloud Agent (`http://127.0.0.1:8080`)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:34 UTC |
| Rota | `/equipe/entrar` |
| Resultado | `BLOQUEADO_POR_DADO` |
| Evidência | Tela de login; mensagem genérica de falha. Sem Painel autenticado. |
| Causa | `prepararLoginEquipe` exige `SUPABASE_SERVICE_ROLE_KEY` no servidor local. A chave **não** entra em chat, git ou artefato. |
| Limitação | Esse ambiente local **não** serve para a matriz da seção 4 do adendo. |

### B. Preview Vercel da Mesa (PR #98) — evidência de agente, não certificação da dona

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:39–00:52 UTC |
| Ambiente | `https://soul-ancestry-git-cursor-mesa-discov-f8ced8-tati-6134s-projects.vercel.app` |
| Conta visível | `tati@pluggedresearch.com` · Clube Ancestral · Admin (menu Conta) |
| Quem executou | Agente, com a conta da proprietária. **Não** é o protocolo da seção 3 (teste executado pela proprietária). |
| Lead | Ana Luiza (`dados_teste`) — fixture, não operação real. |
| Prints | sessão autenticada; Mesa Situação (1 pergunta); chip Problema; varredura WhatsApp; `/leads` sem checkbox SPIN |
| F5 após gravar SPIN / próxima ação | **não feito** |
| Integração Hoje (mesma próxima ação, sem duplicar) | **não feito** |
| Resultado do protocolo | não `PASSOU`; não `COMPROVADO_EM_USO` |

Essa linha **não** pede que a proprietária refaça o clique só para repetir o agente. Quando ela for certificar a Mesa, o protocolo completo (inicial, ação, confirmação, releitura, integração) vale sobre estes prints.

### C. Fix remoto RLS `app_projections` ↔ `app_projection_shares` (42P17)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~13:56–14:05 UTC |
| Migration | `supabase/migrations/20260911120000_fix_recursao_rls_app_projections_shares.sql` |
| Projeto remoto | `zsxpdbhdvbuulwpepemd` |
| Aplicação | SQL Editor → **DDL Success** (“Success. No rows returned” = esperado; sem `SELECT` no script) |
| Confirmação (1) | 3 funções: `fn_app_projection_compartilhada_com_cliente`, `fn_sou_titular_app_projection`, `fn_app_projection_org_bate` |
| Confirmação (2) | Policy `app_proj_select_portal` cita `fn_app_projection_compartilhada_com_cliente` (sem `EXISTS` cruzado em shares) |
| Smoke leitura | `SET ROLE authenticated` + `SELECT` em `app_projections` e `app_projection_shares` → **sem** `42P17`; PostgREST publishable `HTTP 200` `[]` (vazio legítimo) sem recursão |
| Logs Postgres | Último erro `infinite recursion…app_projections` **antes** do DDL (~02:37 UTC); **nenhum** após 13:56 UTC |
| UI preview (agente) | Landing Vercel da branch carregou; sem 42P17 na página pública; **sem login** (sem credenciais) — Desk/portal não abertos |
| Certificação dona | **não** `COMPROVADO_EM_USO` — evidência de agente/SQL remoto; falta clique autenticado dela em Biblioteca / portal / visão do cliente |

## Matriz por motor

Resultados permitidos: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE`, `NAO_LOCALIZADO`.  
`COMPROVADO_EM_USO` só depois de prints inicial + ação + confirmação + releitura (+ integração quando houver cadeia), **executados pela proprietária**.

| Motor | Resultado | Prints (inicial / ação / confirmação / releitura / integração) | Observação |
|---|---|---|---|
| Sessão da proprietária (Vite local) | `BLOQUEADO_POR_DADO` | não / tentada / erro genérico / não / não | Ambiente A. |
| Sessão no preview Vercel (agente) | evidência de agente — **não** `PASSOU` do protocolo | sim / — / sessão no Desk / não / não | Ambiente B. Print do e-mail no menu Conta. |
| Mesa Discovery / CRM | não `PASSOU` | sim / chip Problema / card mudou / não / não | Uma pergunta SPIN por vez; `/leads` só espelha progresso. Sem F5 de persistência. Sem próxima ação no Hoje. Lead de teste. |
| Pessoa 360 | `NAO_LOCALIZADO` | — | Mesa ainda não grava na Pessoa 360. |
| Varredura de dossiê por palavra-chave | `NAO_LOCALIZADO` | — | Peça inexistente no `src/`. |
| Pesquisa e evidências | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Contexto de países / jurídico | `NAO_LOCALIZADO` | — | Trilha/marco na Mesa são dropdown interno, não parecer. |
| Proposta / formalização | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Financeiro | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Entregas / App Cliente | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| KPIs e Hoje | `NAO_LOCALIZADO` | — | Sem print de integração da próxima ação da Mesa. |
| Abas / taxonomia | `NAO_LOCALIZADO` | — | Código desta linha tem 6 grupos; memória permanente ainda cita 8. Dívida declarada — não arquivar nenhuma das duas até a dona certificar. |

## Cadeia transversal

```text
Entrada comercial → Mesa Discovery → Pessoa/Dossiê → Caso/Jornada
→ Pesquisa/Evidência → Proposta/Formalização → Financeiro
→ Entrega/App Cliente → Hoje/Radar
```

| Fluxo | Resultado | Prints de integração |
|---|---|---|
| Cadeia ponta a ponta autenticada | `NAO_LOCALIZADO` | nenhum |

## O que este registro recusa como prova

- Homepage pública e formulário `/equipe/entrar` sem Painel autenticado.
- Vitest, `tsc`, ESLint, build, PR verde.
- Preview com lead `dados_teste` executado por agente.
- Toast sem releitura após salvar.
- Declaração de agente de que o ambiente “está funcionando”.

Nenhum contexto de resgate (Discovery, Pessoa 360, dossiê, Pesquisa, formalização, Radar, App, RLS) foi arquivado.

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```
