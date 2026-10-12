# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Atualizado em:** 2026-09-11

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build, DEMO, preview ou declaração de agente **não** alteram essa certificação.

**Circuito operacional mínimo (Abas → Mesa → KPIs):** relatórios manhã/fim do dia em `docs/relatorios/circuito-operacional-minimo/` (ex.: `2026-09-11_fim-do-dia.md`). Não substitui este registro de prova.

## Ambientes tentados

### A. Vite local no Cloud Agent

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:34 UTC |
| Ambiente | `http://127.0.0.1:5173/equipe/entrar` e `http://127.0.0.1:8080/equipe/entrar` |
| Motor | Sessão da proprietária (pré-requisito) |
| Resultado | `BLOQUEADO_POR_DADO` |
| Evidência | Tela de login; mensagem genérica “Não foi possível entrar. Verifique os dados e tente novamente.” Sem Painel autenticado. |
| Causa | `prepararLoginEquipe` → `estadoLimite` exige `SUPABASE_SERVICE_ROLE_KEY` no servidor. A variável não está no Cloud Agent. A chave **não** entra em chat, git ou artefato. |
| Limitação | Esse ambiente local **não** serve para a matriz da seção 4 do adendo. Não repetir até o servidor ter a chave. |

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
| Certificação dona (leitura) | **feita** via ambiente D (espelho master `/app-cliente-como-pessoa`): 7 abas sem recursão/`42P17` — ver prints |
| `COMPROVADO_EM_USO` | **não** — falta publicar conteúdo → F5 → releitura → integração Desk→portal |

### D. App Cliente master — proprietária (produção Vercel)

| Campo | Valor |
|---|---|
| Data | 2026-09-11 |
| Quem | Proprietária (`tati@pluggedresearch.com`), autenticada |
| URL | `https://soul-ancestry.vercel.app/app-cliente-como-pessoa` |
| Caso | `CA-CID-AT-FAM-2026-001` — Projeto familiar — Ana Luiza (fixture) |
| Selo | ACESSO MASTER — VISÃO REAL DO APP CLIENTE |
| Abas percorridas | Home · Jornada · Radar · Árvore · Documentos · Legado · Conta (7/7) |
| Resultado leitura | `PASSOU` — empty states específicos; **sem** toast/`42P17` / “infinite recursion” |
| Prints | `docs/relatorios/provas/2026-09-11-app-cliente-master/` (`01-home` … `07-conta`) |
| Mockup (referência P11, sem redesign agora) | 17 págs: `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf` · 47 págs: mesmo dir + `…/auditoria-mockup-2026-09-11/` · autoridade: `docs/politicas/ADENDO-MEMORIA-AUDITORIA-MOCKUP-CANVAS-2026-09-11.md` |
| Backlog visual | `docs/relatorios/2026-09-11_backlog-p11-app-cliente-vs-mockup.md` |
| `COMPROVADO_EM_USO` | **não** — só leitura/empty; sem protocolo publicar + F5 |

### E. Prévia Vercel do Desk de 6 grupos — sessão autenticada (navegação)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:39–00:48 UTC |
| Ambiente | `https://soul-ancestry-git-cursor-desk-produt-c233f7-tati-6134s-projects.vercel.app` |
| Conta | `tati@pluggedresearch.com` · Clube Ancestral · Admin |
| Motor | Sessão + taxonomia + leitura de face |
| Ação | Login em `/equipe/entrar` → `/painel` → `/calls` → `/contratos` → `/catalogo` → `/biblioteca` → `/configuracoes` → `/crm-mestre` → `/app-cliente-demo` → `/painel` |
| Resultado da **sessão** | `PASSOU` |
| Prints | `docs/provas/2026-09-11-preview-desk-6-grupos/` |
| Limitação | Sem escrita persistida neste passe. DEMO do App Cliente não é projeção de cliente real. Releitura = retorno a `/painel`, não F5 de um save. Integração Discovery → Pessoa → Caso → Hoje **não** executada. Distinto do ambiente B (Mesa PR #98). |

## Matriz por motor

Resultados permitidos: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE`, `NAO_LOCALIZADO`.  
`COMPROVADO_EM_USO` só depois de prints inicial + ação + confirmação + releitura (+ integração quando houver cadeia), **executados pela proprietária**.

| Motor | Resultado | Prints (inicial / ação / confirmação / releitura / integração) | Observação |
|---|---|---|---|
| Sessão da proprietária (Vite local) | `BLOQUEADO_POR_DADO` | não / tentada / erro genérico / não / não | Ambiente A. |
| Sessão no preview Mesa (agente) | evidência de agente — **não** `PASSOU` do protocolo | sim / — / sessão no Desk / não / não | Ambiente B. |
| Sessão na prévia Desk 6 grupos | `PASSOU` | sim / login / `/painel` com Admin / retorno a `/painel` / N/A | Ambiente E. `sessao_autenticada_tati_admin.png`. |
| Mesa Discovery / CRM | não `PASSOU` | sim / chip Problema / card mudou / não / não | Ambiente B: uma pergunta SPIN por vez; sem F5; sem próxima ação no Hoje. Ambiente E: `/calls` aberto, sem gravar SPIN. |
| Pessoa 360 | `NAO_LOCALIZADO` | — | Mesa ainda não grava na Pessoa 360. |
| Varredura de dossiê por palavra-chave | `NAO_LOCALIZADO` | — | Peça inexistente no `src/`. |
| Pesquisa e evidências | `NAO_LOCALIZADO` | leitura Biblioteca (E) / sem gravar lacuna / — / — / — | Sem prova autenticada da dona com save+F5. |
| Contexto de países / jurídico | `NAO_LOCALIZADO` | — | Trilha/marco na Mesa são dropdown interno, não parecer. |
| Proposta / formalização | `NAO_LOCALIZADO` | leitura Contratos (E) / sem parâmetro gravado / — / — / — | Sem Top 30 na face da prévia E. |
| Financeiro | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. Catálogo homologado lido em E (não é caixa). |
| Entregas / App Cliente | `PASSOU` (leitura master) / `NAO_LOCALIZADO` (DEMO e publicar→F5) | sim×7 (D) / — / empty por aba / — / não | Ambiente D. Sem `42P17`. DEMO em E **não** conta como motor. **não** `COMPROVADO_EM_USO`. |
| KPIs e Hoje | `PASSOU` (leitura na prévia E) / `NAO_LOCALIZADO` (escrever item / integração Mesa) | inicial `/painel` (E) / navegação / cards visíveis / retorno `/painel` / sem fila por ação | Casos ativos visíveis; sem Receita/Conversão no topo. Sem print de integração da próxima ação da Mesa. |
| Abas / taxonomia | `PASSOU` (navegação) / parcial (decisão 7+6) | sim (E: 6 grupos Desk; D: 7 abas App) / sidebar + rotas / páginas carregaram / retorno `/painel` / — | Prévia E ainda 6-face; decisão 2026-09-11 recomenda **7 telas + 6 grupos internos** (`00_governanca/DECISAO-NAV-…`); 8-grupos = histórico — **não** `COMPROVADO_EM_USO`. |
| Catálogo SKU / Planilha face | `BLOQUEADO_POR_DECISAO` | — | Legado (PR #97). Sync: `00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md`. |
| Link Asaas / checkout | `BLOQUEADO_POR_DECISAO` | — | Só quando automações estiverem ativas e tudo funcionando. Matriz `08_dados_e_integracoes/…`. |

## Cadeia transversal

```text
Entrada comercial → Mesa Discovery → Pessoa/Dossiê → Caso/Jornada
→ Pesquisa/Evidência → Proposta/Formalização → Financeiro
→ Entrega/App Cliente → Hoje/Radar
```

| Fluxo | Resultado | Prints de integração |
|---|---|---|
| Cadeia ponta a ponta autenticada | `NAO_LOCALIZADO` | nenhum (não houve save de Discovery → Hoje) |

## Prints da prévia Desk de 6 grupos (ambiente E)

| Arquivo | Rota | O que mostra |
|---|---|---|
| `docs/provas/2026-09-11-preview-desk-6-grupos/sessao_autenticada_tati_admin.png` | `/configuracoes` | Rodapé: `tati@pluggedresearch.com`, Clube Ancestral, Admin. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/painel_hoje_6_grupos_kpis.png` | `/painel` | 6 grupos; KPIs vivos; sem Receita/Conversão no topo. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/painel_calls_comercial.png` | `/calls` | Painel de Calls no grupo Marketing & Comercial. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/contratos_sem_top30.png` | `/contratos` | Formalização; sem Top 30 na face. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/catalogo_homologado.png` | `/catalogo` | Catálogo homologado; Planilha Mestre como origem histórica. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/biblioteca_mestre.png` | `/biblioteca` | Centro de Inteligência; Top 30 fora da face. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/app_cliente_demo_7_abas.png` | `/app-cliente-demo` | 7 abas; faixa DEMO. |

## O que este registro recusa como prova

- Homepage pública e formulário `/equipe/entrar` sem Painel autenticado.
- Vite local sem chave de servidor.
- Vitest, `tsc`, ESLint, build, PR verde.
- DEMO do App Cliente como se fosse entrega ao cliente real.
- Preview com lead `dados_teste` executado por agente.
- Toast sem releitura após salvar.
- Declaração de agente de que o ambiente “está funcionando”.
- Leitura de face como `COMPROVADO_EM_USO` de motor.

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

## 2026-10-12 — Ficha civil × Hero CaseHealth em /app-cliente-como-pessoa

- Caso: Ana Luiza (a11a0000-0000-4000-8000-000000000002)
- Rota pedida: `/app-cliente-como-pessoa?casoId=a11a0000-0000-4000-8000-000000000002`
- Verificação (agente, inspeção de código — não é prova de uso): `CaseHealthHero`
  é usado apenas em `src/routes/_authenticated/casos.$caseId.index.tsx` (Caso 360 do Desk).
  A rota pedida renderiza somente as 7 abas sanitizadas do App, que por regra
  nunca exibem CPF/RG/endereço; não há ficha civil nem Hero ali.
- Resultado: **NAO_LOCALIZADO** — comparação impossível na rota indicada;
  nenhum dado foi introduzido para satisfazer o pedido.
- Caminho válido para nova prova (pela Proprietária): Desk → `/casos/a11a0000-0000-4000-8000-000000000002`
  → Hero, conferindo o mascaramento contra a ficha civil.

## 2026-10-12 — Mensagem de suporte: envio com falha de rede (opção "Só simule")

- Parecer da Proprietária (12/10/2026): "Só simule" — validar aviso, botão
  [Reenviar] e preservação de assunto/texto, sem gravar mensagem no banco.
- Tentativa na tela real (inspeção do agente, sessão de
  tati@pluggedresearch.com): `/portal/casos/a11a0000-0000-4000-8000-000000000002`
  respondeu "Este caso não está disponível para o seu acesso." O formulário de
  mensagem só existe dentro do detalhe do caso, que pertence ao acesso da própria
  cliente. Nenhuma mensagem foi enviada e nada foi gravado.
- Resultado na tela real: **BLOQUEADO_POR_DECISAO** — a prova visual desta jornada
  só pode ocorrer no acesso real da Ana Luiza (ou em acesso de cliente autorizado
  pela Proprietária), não na visão administrativa.
- Verificação de código (checagem de desenvolvedor, NÃO é prova de uso):
  `src/components/portal/__tests__/mensagem-suporte-falha.test.tsx` monta o
  componente real da tela, faz o envio falhar e confirma:
  1. aparece o aviso "Não foi possível enviar agora. Sua mensagem continua aqui.";
  2. assunto e texto permanecem preenchidos;
  3. [Reenviar] dispara novo envio com o mesmo conteúdo.
  1 teste executado, aprovado em 12/10/2026.
