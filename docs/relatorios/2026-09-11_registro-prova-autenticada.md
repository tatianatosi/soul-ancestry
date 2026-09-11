# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Atualizado em:** 2026-09-11

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build, preview ou declaração de agente **não** alteram essa certificação.

**Circuito operacional mínimo (Abas → Mesa → KPIs):** relatórios manhã/fim do dia em `docs/relatorios/circuito-operacional-minimo/` (ex.: `2026-09-11_fim-do-dia.md`). Não substitui este registro de prova.

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
| Ambiente | `https://soul-ancestry-git-cursor-desk-sistem-e65597-tati-6134s-projects.vercel.app` |
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
| Certificação dona (leitura) | **feita** via ambiente D (espelho master `/app-cliente-como-pessoa`): 7 abas sem recursão/`42P17` — ver prints |
| `COMPROVADO_EM_USO` | **não** — falta publicar conteúdo → F5 → releitura → integração Desk→portal |

### D. App Cliente master — proprietária (produção Vercel)

| Campo | Valor |
|---|---|
| Data | 2026-09-11 |
| Quem | Proprietária (`tati@pluggedresearch.com`), autenticada |
| URL | `https://soul-ancestry-git-cursor-desk-sistem-e65597-tati-6134s-projects.vercel.app/app-cliente-como-pessoa` |
| Caso | `CA-CID-AT-FAM-2026-001` — Projeto familiar — Ana Luiza (fixture) |
| Selo | ACESSO MASTER — VISÃO REAL DO APP CLIENTE |
| Abas percorridas | Home · Jornada · Radar · Árvore · Documentos · Legado · Conta (7/7) |
| Resultado leitura | `PASSOU` — empty states específicos; **sem** toast/`42P17` / “infinite recursion” |
| Prints | `docs/relatorios/provas/2026-09-11-app-cliente-master/` (`01-home` … `07-conta`) |
| Mockup (referência P11, sem redesign agora) | 17 págs: `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf` · 47 págs: mesmo dir + `…/auditoria-mockup-2026-09-11/` · autoridade: `docs/politicas/ADENDO-MEMORIA-AUDITORIA-MOCKUP-CANVAS-2026-09-11.md` |
| Backlog visual | `docs/relatorios/2026-09-11_backlog-p11-app-cliente-vs-mockup.md` |
| `COMPROVADO_EM_USO` | **não** — só leitura/empty; sem protocolo publicar + F5 |

### E. Pacote de prints do dia — Planejador v2.1 / Desk sistema do dia (PR #111)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~18:00–18:15 UTC |
| Quem preparou | Agente (Cloud) — **não** é certificação da dona |
| Preview | `https://soul-ancestry-git-cursor-desk-sistem-e65597-tati-6134s-projects.vercel.app` |
| SHA | `ce3c7576` |
| Pasta | `docs/relatorios/provas/2026-09-11-planejador-v21/` |
| Conteúdo agente | fixtures 01–06 (cadeia, cenários, matriz, 91 SKUs, roteiro, vitest) + preview 07–09 (landing, `/equipe/entrar`, `/painel` → login) |
| `/painel` autenticado | **não** — sem sessão da proprietária neste pacote |
| Resultado do protocolo | **não** `PASSOU`; **não** `COMPROVADO_EM_USO` |
| Próximo passo dona | Colar `dona-01`…`dona-05` no README da pasta (inicial → ação → confirmação → releitura → integração) |

Essa linha **prepara** a certificação; não a substitui. Vitest/preview sem Painel logado **não** movem motor para `COMPROVADO_EM_USO`.

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
| Entregas / App Cliente | `PASSOU` (leitura master) | sim×7 / — / empty por aba / — / não | Ambiente D. Sem `42P17`. **não** `COMPROVADO_EM_USO` (falta publicar→F5). Prints em `provas/2026-09-11-app-cliente-master/`. |
| KPIs e Hoje | `NAO_LOCALIZADO` | — | Sem print de integração da próxima ação da Mesa. Pacote E só prepara slots; sem sessão dona no `/painel`. |
| Planejador / preços resgatados / 91 SKUs (v2.1) | evidência de agente — **não** `PASSOU` | fixture 01–06 / — / — / — / — | Ambiente E. Sem homologar preço. Sem `COMPROVADO_EM_USO`. |
| Abas / taxonomia | parcial | sim (7 abas App) / — / — / — / — | App Cliente: 7 abas confirmadas pela dona (ambiente D). Desk: código desta linha ainda diverge da memória de 8 grupos — dívida declarada. |

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
