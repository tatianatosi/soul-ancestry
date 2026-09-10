# PRs #30–#84: arquitetura e prompts que não foram aplicados

Inventário revisado em 2026-09-10 para Tatiana (tati@pluggedresearch.com). Substitui a leitura anterior que tratava #30–#84 como “docs-only / de-para para fechar”.

**Correção da proprietária:** PRs **#30 a #84 são arquitetura e prompts que não foram implementados.** Não são ruído documental. Mesmo quando o GitHub mostra draft só com `docs/`, o corpo pede um motor, tela, tabela ou cadeia — e esse pedido **não entrou em `main` como operação**.

Conferido ao vivo com `gh pr view N --json title,state,mergedAt,body,files,commits,url` (#30–#84) + busca em `origin/main` (`18e33a7b`) e nesta branch. A série Claude CA02–CA24B de 09/09 é **outra leva**: não assume que #30–#84 morreram porque CA02–CA24 mesclou.

Branch: `cursor/pesquisa-alinhamento-busca-5d7b` (PR draft **#91**). Sem force-push / rebase / amend (Lovable).

---

## Como ler a coluna “aplicação”

| Selo | Significado |
|---|---|
| **aplicado** | O que o prompt pedia construir está em `main` (merge da PR **ou** absorção posterior com o mesmo efeito). |
| **parcial** | Parte do prompt está em `main`; o restante da arquitetura não. |
| **não aplicado** | O motor / tela / fiação que o prompt descreve **não opera** em `main`. Markdown no repositório não conta como implementação. |

GitHub “OPEN / draft” ≠ “só documentação”. Vários drafts já tiveram o `.md` copiado para `main` por commits posteriores; o **código do motor** continua ausente.

Tabelas-alvo são as de `src/integrations/supabase/types.ts` + migrations. **Não criar** `case_participants`, `citizenship_cases`, `onboarding_runs`, `cadence_runs`, `journey_instance`, `catalog_product`. Trilhas jurídicas reais = `citizenship_tracks` (não inventar `trilhas_juridicas` como tabela nova).

---

## Tabela #30–#84

| PR | Título (curto) | Estado GitHub | Prompt pediu construir | Em `main`? |
|---|---|---|---|---|
| **30** | Detecção de núcleos duplicados (Fase 1) | draft | Motor de unificação de núcleos, 6 fases; esta PR = só detecção sugestiva | **parcial** — Fase 1 (`nucleo-duplicidade.ts`, `/nucleos-duplicidades`) está em `main` sem merge desta PR. Fases 2–6 (comparar, plano, confirmar, merge atômico, validar) **não**. Tabelas: `nucleos_familiares`, `nucleo_membros`. Sem colunas novas (`nucleo_canonico_id`). |
| **31** | P0: gravação sem confirmar linha | closed (sem merge) | `gravarComVerificacao` / `inserirComVerificacao` em escritas | **aplicado** — absorvido por #34 / #39. |
| **32** | Pessoa: releitura real + decisão de tarefa | draft | Após salvar pessoa: criar tarefa / próxima ação / “sem nova ação”; mobile contrato | **não aplicado** — P3 do prompt-mestre. Arquivos alvo: `pessoas-linhagens`, Caso 360, `tarefas`. Outro agente no visual de contrato: aplicar depois. |
| **33** | Piloto: pendências vivas | **merged** 01/09 | Trocar lista fixa de 11 bloqueios por pendências reais | **aplicado** |
| **34** | Mapa de autoridade admin 10/10 | **merged** 01/09 | Auditoria rota→tabela + cadeia de persistência verificada | **aplicado** (código + mapa) |
| **35** | Reconciliação `contratos.$id` (#28 × #32) | draft | Barra de 6 ações reais no contrato (CRM = contratante) | **não aplicado** — visual de contrato; **depois** (agente pente-fino Ana). |
| **36** | Política unificada de casos — Fase 1 mapear | draft | Mapa da política de casos familiares, sem mudar código | **não aplicado** — o mapa é o briefing da unificação; o motor (P1) não rodou. |
| **37** | Política de artefatos e versionamento | **merged** 01/09 | Política obrigatória de artefato no GitHub | **aplicado** (política) |
| **38** | Prompt diário artefato primeiro | **merged** 01/09 | Prompt operacional diário | **aplicado** (prompt) |
| **39** | P0 Comercial/Financeiro verificado | **merged** 01/09 | Todas as escritas de `comercial.functions.ts` com linha afetada + releitura | **aplicado** |
| **40** | Contrato: tira botões que só mudam de aba | draft | Barra só com ações que gravam | **não aplicado** — visual de contrato; **depois**. |
| **41** | Revisa Motor Contratual e Pessoa Canônica | **merged** 05/09 | Achados reais (resync, Canva, 5 cadastros) | **parcial** — o diagnóstico entrou; resync automático vs manual **não decidido/implementado**. |
| **42** | `caseDataGiovanna` é demo | draft | Cabeçalho alinhado à classificação `demo` | **parcial nesta branch** — cabeçalho corrigido aqui; PR GitHub segue aberta. |
| **43** | Arquiva decisões canônicas 19/08 | **merged** 05/09 | Ficha piloto / CRM / Ana Luiza vs schema | **parcial** — arquivo em `main`; enum de verificação e `families` do documento **não** existem (usar `nucleos_familiares`). |
| **44** | Bugs de persistência + proposta Canva no Caso 360 | **merged** 05/09 | CHECK de consentimento, pedidos NOT NULL, proposta real | **aplicado** |
| **45** | Atualiza Mapa de Autoridade (01/09) | **merged** 05/09 | Registrar `insert` cru em 3 tabelas | **parcial** — mapa em `main`; `inserirComVerificacao` nesses 3 pontos **não** em `main`. |
| **46** | Ficha Giovanna + pacote de redesenho | **merged** 05/09 | Cruzar 54 campos da ficha com Pessoa Canônica | **não aplicado** como motor — heatmap/genograma/trilhas por caso **não** gravam. Pacote dizia “não implemente ainda”. |
| **47** | Leads arquivados na lista | closed (sem merge) | Filtrar `archived_at` em `/leads` | **aplicado** — absorvido em `main`. |
| **48** | WhatsApp: sinal extraído no rascunho do lead | draft | De-para achado → código controlado do `leads` (sem persistir a conversa) | **parcial nesta branch** — `codigoLeadDoAchado` + Confirmar no Painel Calls grava código (`bisavo`, não o rótulo). CA02 já mostrava o achado; faltava o vocabulário do lead. |
| **49** | Artefato de resgate (skills / varredura / dossiê) | **merged** 05/09 | Arquivar prompt + 6 decisões da proprietária | **não aplicado** — decisões da seção 13 seguem abertas. |
| **50** | Decisões canônicas Catálogo/Planejador | draft | Planilha Mestre = layer, não fonte viva; catálogo/`citizenship_tracks` operam | **parcial** — CA09 produtos-pai + `product_catalog` / `planner_catalog_feed` existem. A PR em si (rótulos/premissas na UI) **não** mesclou. |
| **51** | Pessoa Canônica via extensão de `clientes` | **merged** 09/09 | 21 colunas em `clientes` + de-para lead→cliente | **aplicado** (schema). Superfície Pessoa 360 ainda incompleta (ver #64). |
| **52** | Artefato mestre de resgate + adendo de PRs | draft | Fila P0/P1/P2 e PRs interrompidas | **não aplicado** — o artefato *é* a fila; a fila não foi executada. |
| **53** | Perfil institucional: gate lê status persistido | draft | Gate do contrato usa perfil versionado da org, não valor fixo | **parcial** — CA12 lê perfil persistido; o gate em `casos.$caseId.contrato.preparar.tsx` ainda chama `perfilInstitucionalRenderizado()`. **Depois** (arquivo visual de contrato). |
| **54** | Cadastro rápido de lead na call | draft | Salvar com menos campos; validação junta os erros | **não aplicado** — `NovoLeadDialog` segue exigindo o bloco canônico. |
| **55** | Cotejo 6 abas + relatórios de jornada de vida | draft | Indicadores vivos por aba; modelos G07 | **não aplicado** — Desk real tem **8 grupos**, não 6. Relatórios de jornada de vida não são motor. |
| **56** | Pré-análise Nadia (WhatsApp / Discovery) | draft | Caso de referência para varredura + roteiro | **não aplicado** — dado de prospect, não motor. Usa quando #48/#58 operarem de ponta a ponta. |
| **57** | Artefato do dia 02/09 | draft | Índice do dia | **parcial** — relatório existe em `docs/relatorios/`; não é motor. |
| **58** | Adendo roteiro de conversa (Nadia) | draft | Card “Roteiro da conversa” (pergunta + premissa + resposta + fonte) no Discovery | **não aplicado** — CA02 tem roteiro; o card especificado aqui não. |
| **59** | Revisão Final do Planejador Universal | draft | 11 entidades novas **rejeitadas**; reusar tabelas | **não aplicado** como motor. O de-para está em `docs/arquitetura/`; o planejador vivo ainda é convenção hardcoded + `case_plans`. |
| **60** | Contexto regional/jurídico do Motor Planejador | draft | Duas versões de contexto jurídico multi-país | **não aplicado** — contexto para o motor de #61, que não rodou. Docs em `main`. |
| **61** | Instruções do Motor Planejador de Cidadania | draft | Fases 0–8, modelo de dados, aceite | **não aplicado** — `docs/prompts/instrucoes-motor-cidadania-v1.0.md` em `main`; **nenhuma fase 0–8 implementada** como motor. Mapear a `crm_casos`, `citizenship_tracks`, `case_plans`, `product_catalog`. |
| **62** | De-para entidades do Motor × tabelas reais | draft | 12 entidades propostas → tabelas existentes | **não aplicado** — o de-para *é* a planta; a reorganização do core (#63) não executou. |
| **63** | Plano de reorganização do core (sem tabelas novas) | draft | Ligar `genealogical_relationships` / `decisions` mortas vs tabelas vivas | **não aplicado** |
| **64** | Pessoa 360 — 5 camadas unificadas | draft | Identidade + vínculo + ficha piloto + App + CRM num conjunto | **parcial** — #51/#86 cobrem identidade; as 5 camadas **não** estão unificadas no App. |
| **65** | Levantamento histórico ficha/CRM vivo | draft | Varredura de prompts antigos | **não aplicado** como execução — o próprio texto diz que muita coisa “já existe”; a unificação pedida em #64/#81 não. |
| **66** | “Abrir visão do cliente” no caso e na pessoa | draft | Link admin → `/app-cliente-como-pessoa` | **aplicado** — absorvido em `main` (Caso 360 e ficha da pessoa). |
| **67** | De-para Motores Unificados CRM Vivo | draft | ~39 entidades do prompt CRM Vivo × schema real | **parcial** — RPC `proxima_acao_prioritaria` + CA18 existem. Onboarding único parametrizado, cadência por evento e Caso 360 completo do prompt **não**. |
| **68** | `produto_sku` confirma `product_catalog` | draft | SKU do planejador só entra se o catálogo homologado confirmar | **parcial nesta branch** — `parametrosDoPlanejador(codigo, skuHomologado)`. Fiação em `contrato-parametros.functions.ts` **depois** (agente no contrato). |
| **69** | Máscara CPF/CEP/UF/telefone | **merged** 09/09 | Validador reutilizável Brasil/exterior | **aplicado** (`validacao-pessoa.ts`) |
| **70** | Artefato do dia 03/09 | draft | Fechamento diário | relatório; não é motor |
| **71** | De-para “piloto” Ana × realidade | draft | Aposentar trilha piloto; `fechamento-caso.ts` como regra geral | **parcial** — `/piloto` e `/piloto-ana` saíram do menu (`navegacao-desk`). Rotas e nomenclatura “piloto” **ainda existem**. **Não** tocar `navegacao-desk.ts` agora (outro agente). |
| **72** | Varredura go-live App Cliente | draft | P0 do portal (Conta, Faturas, Jornada) | **parcial** — #73/#78 cobriram Proposta/Faturas. Resto do pente-fino: **depois** (agente no portal). |
| **73** | Remove Proposta da Conta do portal | **merged** 04/09 | Conta alinhada às 7 abas | **aplicado** |
| **74** | Converge nomenclatura piloto → fechamento | draft | Remover `/piloto`; usar `fechamento-caso` | **não aplicado** (só `navegacao-desk` no diff da PR). **Depois.** |
| **75** | De-para onboarding / cadência / jornada de vida | draft | 7 mecanismos A–H; um onboarding por `case_id` | **não aplicado** — `onboarding_planos` existe; não há motor P4 (iniciar → reutilizar → tarefas → micro-entrega). Não criar `onboarding_runs`. |
| **76** | De-para cadência D0–D365 / micro-entregas / planejador | draft | 4 “planejadores” no código; ligar ao mapa D0–D365 | **parcial nesta branch** — limiares D7/D10/D14 unificados (#80). Micro-entrega automática e planejador=jornada **não**. |
| **77** | Retira painel “ciclo completo” de `/piloto` | **merged** 04/09 | Menos decoração no piloto | **aplicado** |
| **78** | Faturas na Conta só com pagamento real | **merged** 04/09 | Não prometer fatura vazia | **aplicado** |
| **79** | De-para planejador cidadania × produto-pai × motores | draft | Ligar planejador, produto-pai, Pessoa 360, cadência, micro-entrega | **não aplicado** — CA09 ligou produto-pai ao catálogo; **não** ao motor de cidadania de #61 nem à cadência. |
| **80** | Unifica limiares D10/D14 + fila TOP 30 viva | draft | Uma fonte de cadência; `case_plans.dias_sem_touchpoint` é dado morto | **parcial nesta branch** — `cadencia-limiares.ts` + TOP 30 lê touchpoint real de `crm_casos`. |
| **81** | De-para CRM caso / micro-entrega / onboarding / Operação Viva | draft | `client_deliverables.case_id` na cadeia lead→caso→entrega | **não aplicado** — tabelas existem (`crm_casos`, `client_deliverables`, `onboarding_planos`); a cadeia ponta a ponta do prompt **não**. |
| **82** | De-para SKUs × produtos-pai × países (PP-01–PP-08) | draft | Taxonomia por fase da vida, não por país | **parcial** — `planner_catalog_feed` + CA09. Matriz PP e 91 SKUs **não** viraram motor. |
| **83** | TOP 30 mostra erro em vez de sumir | closed (sem merge) | Erro visível no painel | **aplicado** via #85. |
| **84** | Pente-fino calculadoras, radares, cadência, Centro de Inteligência | draft | Inventário de motores de decisão vivos vs lista | **não aplicado** — o pente-fino lista radares reais (`radar-elegibilidade`, matriz de prioridade); não os unifica num Centro. **Depois** se o outro agente já estiver no visual de pesquisa. |

---

## A série CA02–CA24 não substitui #30–#84

`origin/main` tem CA03 pessoa, CA04 Caso 360, CA05 cadência/micro-entregas, CA09 produtos-pai, CA12 perfil, CA18 próxima ação, CA20 pesquisa no Caso 360, etc. Isso **liga o que já existia**. Não executa:

- Motor Planejador de Cidadania fases 0–8 (#61)
- Unificação de núcleos fases 2–6 (#30)
- Onboarding real persistente P4 (#75)
- Cadência por evento do CRM Vivo (#67 / prompt unificado)
- SKU vivo na pré-carga de contrato (#68)
- Roteiro Discovery no formato #58
- Pessoa 360 em 5 camadas (#64)

Tratar CA02–CA24 como “já fez #30–#84” é o erro que este inventário corrige.

---

## Apply-now vs later (mapeado a tabelas existentes)

### Apply-now (não luta com portal / contrato / pesquisa visual)

| Prompt | Motor | Tabelas | Nesta branch |
|---|---|---|---|
| #80 + P3 | Limiares únicos D7/D10/D14 | `crm_casos.ultimo_touchpoint_em`, `case_plans` (não usar `dias_sem_touchpoint` morto) | **feito** — `cadencia-limiares.ts` |
| #48 + P8 | Sinal WhatsApp → código de `leads` | `leads` | **feito** — `codigoLeadDoAchado` + Painel Calls |
| #68 + P7 (módulo puro) | SKU só com catálogo vivo | `product_catalog` | **feito** o helper; fiação de contrato **depois** |
| #42 | Giovanna = demo | nenhum | **feito** o cabeçalho |
| P0–P11 mapa | Grafo de motores → tabelas reais | ver `motores-tabelas.ts` | **feito** o mapa, sem engine paralelo |

### Later (depende de decisão, schema ou do outro agente)

| Prompt | Por que depois | Tabelas quando for |
|---|---|---|
| #32, #35, #40, #53 | Visual / `contratos.$id` e preparar contrato | `contracts`, `tarefas`, perfil institucional |
| #72 portal restante, jornada App | Agente pente-fino no portal | `client_deliverables`, `document_requests` |
| #30 fases 2–6 | Precisa colunas ou fluxo humano sem schema novo | `nucleos_familiares` |
| #54 | Mudar validação canônica de lead (responsável/prazo) | `leads` |
| #61 / #63 / #79 | Motor cidadania 0–8 — maior superfície | `crm_casos`, `citizenship_tracks`, `case_plans`, `product_catalog`, `planner_catalog_feed` |
| #64 / #81 | Pessoa 360 + cadeia micro-entrega | `clientes`, `nucleo_membros`, `client_deliverables`, `onboarding_planos` |
| #75 P4 onboarding real | Um plano por `case_id`, não `onboarding_runs` | `onboarding_planos`, `tarefas` |
| #74 / `navegacao-desk.ts` | Outro agente na navegação | — |
| #84 Centro de Inteligência | Pesquisa visual | radares já existentes, sem tabela nova |

---

## 5–10 prompts de maior valor ainda não aplicados

1. **#61 + #62 + #63** — Motor Planejador de Cidadania sobre tabelas já existentes (`citizenship_tracks`, `case_plans`, `product_catalog`). Sem as 11 entidades novas de #59.
2. **#75 / P4** — Onboarding real: um `onboarding_planos` por `crm_casos.id`, tarefas e primeira micro-entrega.
3. **#67 resto / CRM Vivo** — Caso 360 com cadência por evento (não só RPC de próxima ação).
4. **#32** — Decisão de tarefa após salvar pessoa (P3).
5. **#79 + #82** — Planejador × produto-pai × jornada/cadência (CA09 não fecha isso).
6. **#30 fases 2–6** — Unificação controlada de núcleos (Fase 1 já detecta).
7. **#64** — Pessoa 360 em 5 camadas projetada no App.
8. **#68 fiação contrato** — `preencherDeOrigens` consultar `product_catalog` (depois do pente-fino).
9. **#58** — Card de roteiro Discovery com estado/encaminhamento.
10. **#81** — `client_deliverables.case_id` na cadeia operacional, sem tabela paralela.

---

## O que esta revisão aplicou em código (PR #91)

- `src/lib/cadencia-limiares.ts` — fonte única D7/D10/D14 (P3 / #80).
- Consumidores: `onboarding-jornada.ts`, `jornada-cliente.ts`, `catalogo-top30.functions.ts`, `caso-ficha.ts`, `formalizacao-painel.functions.ts`.
- `src/lib/varredura-whatsapp.ts` — `CAMPO_LEAD_POR_VARREDURA` / `codigoLeadDoAchado` (#48).
- `src/components/crm/painel-calls.tsx` — Confirmar grava código controlado.
- `src/lib/planejador-parametros.ts` — SKU vivo opcional (#68); chamadores de contrato intocados.
- `src/lib/motores-tabelas.ts` — mapa P0–P9 → tabelas reais.
- `src/data/caseDataGiovanna.ts` — demo (#42).

**Não tocados de propósito:** `navegacao-desk.ts`, rotas de portal, `contratos.$id`, `casos.$caseId.contrato.preparar.tsx`, telas de pesquisa — outro agente (pente-fino Ana / mockup).

---

## Sobra

- Fiação #68 em `contrato-parametros.functions.ts` / `coerencia-caso.server.ts`.
- PRs #32, #35, #40, #53, #54, #58, #61, #63, #64, #74, #75 (P4), #79, #81.
- Fechar ou mesclar no GitHub as drafts cujo código já foi absorvido (#30 Fase 1, #66, #47, #83) — decisão humana, não desta branch.
- Homologação autenticada no browser (Supabase MCP desta sessão sem auth).
