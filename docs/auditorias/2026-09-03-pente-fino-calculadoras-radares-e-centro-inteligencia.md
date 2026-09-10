---
status: em revisão
versão: "1.0"
data: 2026-09-03
projeto: Clube Ancestral
classificação: auditoria, de-para e especificação de motores
responsável pela decisão: Proprietária do Clube Ancestral
fontes: [código (repo tatianatosi/soul-ancestry, branch de trabalho da sessão), tabelas/views (Supabase zsxpdbhdvbuulwpepemd, leitura), consultas somente leitura, testes, mockups e documentos]
escopo: [calculadoras, radares, cadência, motor jurídico e centro de inteligência]
premissas: [reuso do core existente, cadência geral (não recalculada aqui), sem novos códigos/tabelas por suposição]
limites: [sem migration, merge, deploy, ação externa ou dados fabricados; contagens de linhas lidas por SELECT agregado, sem expor conteúdo sensível]
próximos passos: [PRs pequenas listadas na seção 11]
critério de aceite: [cada motor citado tem path/tabela real, regra, consumidor e, quando existente, teste]
---

# Pente-fino de calculadoras, radares, cadência e Centro de Inteligência

## Nota de escopo desta rodada

Esta auditoria complementa, sem repetir, três trabalhos já fechados nesta mesma sessão:

- **Cadência D0–D365**: já mapeada em profundidade (`src/lib/orquestracao-jornada.ts`, `src/lib/onboarding-jornada.ts`, `src/lib/jornada-cliente.ts`, `fechamento-caso.ts`). PRs #75, #79. Achados: motor real mas não wireado automaticamente a casos (único consumidor de tela usa `case_id` digitado à mão em `/biblioteca-mensagens`); `catalogo-top30.functions.ts` já lê `crm_casos.ultimo_touchpoint_em` como fallback real (confirmado presente no branch atual: `plano?.dias_sem_touchpoint ?? diasDesde(c.ultimo_touchpoint_em)`), corrigindo a fila que antes dependia da coluna morta `case_plans.dias_sem_touchpoint`. **Correção verificada nesta rodada**: a unificação dos limiares 10/14 dias num módulo único (`src/lib/cadencia-limiares.ts`) **existe apenas na branch `refactor/cadencia-limiares-unicos-2026-09-04` (commit `96cfdb6`), ainda não mesclada** — não está em `origin/main` nem na branch de trabalho desta sessão. Enquanto isso não for mesclado, os limiares 10/14 continuam definidos de forma independente em pelo menos 3 lugares (`onboarding-jornada.ts`, `jornada-cliente.ts` e, como esta rodada confirmou na seção 7, também em `prioridade-matriz.ts`) — ver achado novo na seção 7/11. `fechamento-caso.ts` (gate 8) lê `onboarding_planos` (1 linha teste) enquanto o Planejador real escreve em `case_plans` (0 linhas) — duas tabelas paralelas de "plano do caso", nenhuma com dado real hoje; direção dada pela Proprietária em 04/09 (seguir com `onboarding_planos`) ainda não executada em código. **Não refeito aqui.**
- **Produtos/SKU**: de-para SKU × produto-pai (P01–P09) em andamento em paralelo (PR #82 e varredura do corpus histórico). **Não refeito aqui** — a linha 13 da Fase 2 aponta para esse trabalho.
- **Motores/Núcleos Unificados, CRM caso, micro-entrega, Operação Viva**: mapeados no PR #81 (`docs/arquitetura/2026-09-03_DE-PARA-CRM-CASO-MICROENTREGA-ONBOARDING-OPERACAO-VIVA-MOTORES-NUCLEOS.md`). **Citado, não repetido.**

Esta rodada varreu especificamente: calculadora/diagnóstico de elegibilidade, motor jurídico/cidadania por país-rota, radar de elegibilidade, radar de prioridade/urgência (micro/macro, distinto de cadência), radar de documentação/completude, Centro de Inteligência e Assistente de Pesquisa, e o mapa de conexão com as superfícies (Fase 2 — segunda matriz).

---

## 1. Resumo executivo

O Clube Ancestral tem **mais motores reais e vivos do que a hipótese inicial de "muita lista, pouco motor" previa** nesta área específica — mas a duplicação de mecanismo continua sendo o problema central, agora com um caso concreto e grave: **existem três tabelas paralelas para "evidência de pesquisa"** (`evidencias`, `evidences`, `research_evidence_items`), com nove pontos de consumo diferentes no código, e o Assistente de Pesquisa (IA) lê exatamente a tabela que está vazia.

Vivos e reais, com dado de banco e regra nomeada (não score oculto):
- **Radar de elegibilidade preliminar** (`src/lib/radar-elegibilidade.ts`) — 12 fatores, faixas explicáveis, usado em `/leads`.
- **Matriz de prioridade × urgência** (`src/lib/prioridade-matriz.ts` + `src/lib/matriz-posicionamento.ts`) — motor de regras nomeadas (R0–R5), sem soma nem score opaco, com camada macro (portfólio, `/casos`) já conectada a `crm_casos` real via `MatrizPrioridadesConectada`.
- **Motor jurídico por país/rota** (`citizenship_tracks` + `legal_reference_milestones`, servidos por `src/lib/trilhas-juridicas.functions.ts`) — 46 trilhas reais cobrindo 11 países + "Multipaís" + "Em investigação", consumidas em `/leads` (Discovery) e associadas a `crm_casos.citizenship_track_id`.
- **Centro de Inteligência / Pesquisa** (`research_cases`, `research_hypotheses`/`research_case_hypotheses`, `research_evidence_items`, `research_people`, `research_sources`, `research_pending_items`, `genealogical_findings` etc., servidos por `pesquisa-modulo.functions.ts`, `pesquisa-cadeia.functions.ts`, `achados-genealogicos.functions.ts`) — módulo real, com papéis de acesso (RG), gate de autorização de pesquisa externa (`research_cases.external_research_gate_status`), e volume pequeno mas real (3 pesquisas, 5 hipóteses, 5 evidências em `research_evidence_items`, 9 pessoas, 6 fontes).
- **Assistente de Pesquisa (IA)** (`src/routes/api/pesquisa-assistente.ts` + `src/lib/pesquisa-ia.server.ts`) — endpoint real, autenticado, com gates duros (autorização de pesquisa no caso, confirmação de `case_id`, bloqueio de demo, checagem de suficiência de dados, streaming via Lovable AI Gateway), que **nunca escreve no banco** e recusa rodar sem dado mínimo. Único ponto fraco: lê de `evidencias`/`research_hypotheses` (modelo "achatado" direto por `case_id`), não do modelo `research_cases`/`research_evidence_items` que é onde o dado real está hoje.
- **Biblioteca Mestre** (`src/lib/biblioteca-mestre.functions.ts`) — camada de agregação real sobre `master_library_items`, `genealogical_sources_catalog`, `controlled_taxonomies`, `citizenship_tracks`, `versioned_legal_rules`, `product_catalog`.

Mock/estático/documento, sem motor vivo genérico por trás:
- **`varredura-completude.ts`** — não é um radar de documentação recalculável por caso; é um **relatório estático hardcoded** (data fixa 22/08/2026, 15 pendências nomeadas do caso da Ana Luiza) exposto em `/governanca/varredura-completude`. Serve como auditoria pontual, não como motor de "radar de documentação e bloqueios" aplicável a qualquer caso.
- **`portal-elegibilidade.ts`** — apesar do nome, não é elegibilidade jurídica: é gate de **acesso ao portal** (contrato/pagamento/documentos mínimos). Nome colidindo com o conceito de elegibilidade de rota, risco de confusão para quem procurar "elegibilidade" no repo.
- **Radar de documentação/completude "puro"** (item 7 do prompt, no sentido documental por dimensão como o radar de elegibilidade) **não existe como motor dedicado**; o mais próximo é `nucleo-completude.ts` (completude do núcleo familiar, 5 critérios) e os campos `documentos_localizados/pendentes/em_validacao` dentro de `CaseData`, consumidos por `radar-eixos.ts` (eixo "documentos", cliente-facing, 4 estados apenas).

Duplicidades reais confirmadas por leitura de schema + grep de consumidores (não por suposição):
1. **Evidência de pesquisa em 3 tabelas**: `evidencias` (PT, `caso_id`, 0 linhas, 3 consumidores incl. o Assistente de IA), `evidences` (EN, `case_id`, 0 linhas, **7 consumidores** incl. `biblioteca-evidencias.functions.ts` e `pesquisa-cadeia.functions.ts`), `research_evidence_items` (`research_case_id`, **5 linhas reais**, 3 consumidores). O dado real está na tabela menos consumida; o Assistente de IA e a "cadeia de pesquisa" leem tabelas vazias.
2. **Hipótese em 2 tabelas**: `research_hypotheses` (`case_id` direto, 5 linhas, usado pelo Assistente de IA e por `ficha-piloto-genealogica.functions.ts`) × `research_case_hypotheses` (`research_case_id`, 2 linhas, usado só por `pesquisa-modulo.functions.ts`/`.server.ts`). Já estava anotado como pendência de decisão em `inventario-recuperacao.ts` (16/08/2026), nunca resolvido.
3. **Duas entradas de menu para o mesmo domínio de pesquisa** (`/pesquisa` × `/pesquisa-modulo`) — já documentado em `inventario-recuperacao.ts`, ainda presente no `routeTree.gen.ts` atual.
4. **`elegibilidade_preliminar`/`hipotese_elegibilidade` como dois pontos de captura do mesmo julgamento** em estágios diferentes do funil: em `LeadDesk` (pré-caso, alimenta `radar-elegibilidade.ts`) e em `crm_casos.hipotese_elegibilidade` (pós-caso, alimenta `prioridade-matriz.ts`). Não é duplicidade indevida por si (são estágios diferentes), mas não há transição documentada de um para o outro — de-para pendente de decisão.

P0/P1/P2 recomendados na seção 11. Perguntas de decisão na seção 12.

---

## 2. Inventário completo de calculadoras/radares/motores

Convenção de status: **vivo** (lê/grava tabela real, consumido por tela real) · **parcial** (motor real, mas não wireado a todos os consumidores esperados, ou dado real insuficiente) · **mock/estático** (dado hardcoded ou fixo por desenho) · **órfão** (existe, sem consumidor de tela) · **duplicado** (mais de um mecanismo para o mesmo domínio) · **ausente** (não localizado).

| # | Nome/símbolo | Path | Finalidade declarada | Entradas | Fonte real de dados | Cálculo/regra | Saída | Consumidores | Testes | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Radar de elegibilidade preliminar | `src/lib/radar-elegibilidade.ts` (`calcularRadar`) | Leitura interna, auditável, de sinal de elegibilidade a partir da ficha de Discovery do lead — nunca parecer jurídico | `LeadDesk` (12 fatores F01–F12) + `status_marco`/`status_via` | tabela `leads` (via `crm-desk.functions.ts`) + `citizenship_tracks`/`legal_reference_milestones` (via `trilhas-juridicas.functions.ts`) | Regras nomeadas por faixa (`forte/provável/possível_com_pesquisa/baixa/inconclusiva/sem_aderência`), completude = % de fatores preenchidos, sem score oculto | `ResultadoRadar` (faixa, completude, favoráveis, pendentes, bloqueios_externos) | `/leads` (`src/routes/_authenticated/leads.tsx`) | `src/lib/__tests__/indicadores-sinais.test.ts` | **vivo** |
| 2 | Radar da jornada (4 eixos cliente-facing) | `src/lib/radar-eixos.ts` | Leitura sanitizada para o App Cliente: história, documentos, estratégia, próximos passos | `CaseData` (árvore, documentos, rota, jornada) | `CaseData` vindo de `portal-dados-vivos.ts` (projeções e documentos reais do caso) | Estados fixos (`identificado/em_confirmação/próxima_etapa`) por eixo, guarda `garantirEixosCanonicos` impede eixo extra | `EixoRadar[]` | `/portal/radar` (`src/routes/portal/radar.tsx`) | `src/lib/__tests__/radar-eixos-canonicos.test.ts` | **vivo** (mas é radar de jornada cliente, não de elegibilidade jurídica — nome pode confundir) |
| 3 | Motor jurídico/cidadania por país-rota | `citizenship_tracks` + `legal_reference_milestones` (tabelas) servidas por `src/lib/trilhas-juridicas.functions.ts` (`listarTrilhasJuridicas`) | Trilhas jurídicas internas (país, via preliminar, status, referência legal, fonte oficial) e marcos de referência | — | Supabase: `citizenship_tracks` (46 linhas, 11 países + Multipaís + Brasil + "Em investigação") e `legal_reference_milestones` (32 linhas) | Nenhum cálculo — catálogo de referência, com `status_via`/`lifecycle_status`/`revisao_humana_juridica` explícitos | Lista de trilhas/marcos | `/leads` (seleção de trilha e marco no Discovery), `Biblioteca Mestre` (`FONTES_BIBLIOTECA.trilhas`), `crm_casos.citizenship_track_id` | não localizado teste dedicado | **vivo** |
| 4 | Matriz de temas jurídicos do contrato | `src/lib/matriz-juridica.ts` | Decisão sobre TEMAS pendentes de revisão jurídica de cláusulas contratuais (não rota de cidadania) | `LinhaMatriz[]`, `TEMAS_JURIDICOS` (12 temas fixos) | Tabela não confirmada nesta rodada (função pura recebe `LinhaMatriz[]`) | Regras: `podeGerarClausula`, `avaliarAssinaturaPelaMatriz` (bloqueio por tema sem decisão) | Bloqueios de assinatura por tema | `/matriz-juridica`, fila de revisão jurídica (`fila-revisao-juridica.tsx`) | `src/lib/__tests__/matriz-juridica.test.ts` | **vivo**, mas é motor de **cláusula contratual**, não de rota de cidadania — nome "jurídico" colide com #3 |
| 5 | Matriz de prioridade × urgência | `src/lib/prioridade-matriz.ts` (`calcularPrioridade`) | Sinal derivado de prioridade operacional, nunca altera status de caso | `elegibilidade`, `prazo`, `diasSemTouchpoint`, `esperaExternaAtiva`, `bloqueios`, `slaStatus`, `responsavel`, `origem` | `crm_casos` (`hipotese_elegibilidade`, `prazo_proxima_acao`, `ultimo_touchpoint_em` via cadência unificada, `aguardando_instituicao_externa`, `proxima_acao_responsavel`) | 6 regras nomeadas (R0–R5) avaliadas em ordem, primeira que bate decide; sem soma nem peso oculto | `SinalPrioridade` (crítica/atenção/acompanhada/sem_dados) + fatores explicáveis + faltantes + exceções | `MatrizPrioridadesConectada` → `/casos` (macro/portfólio); `matriz-posicionamento.ts` (quadrantes elegibilidade×urgência) | `src/lib/__tests__/prioridade-matriz.test.ts` | **vivo** |
| 6 | Posicionamento na matriz (quadrantes) | `src/lib/matriz-posicionamento.ts` (`posicionar`) | Dá coordenada visual ao sinal de `prioridade-matriz.ts`, sem recalcular nada | `ResultadoPrioridade` | idem #5 | Tradução determinística de regra→coluna/linha (`ELEGIBILIDADE_ORDEM` × `FAIXAS_URGENCIA`) | `CasoPosicionado` | `src/components/desk/matriz-prioridades.tsx` (visual) via `matriz-prioridades-conectada.tsx`, montado em `/casos` | `src/lib/__tests__/matriz-posicionamento.test.ts` | **vivo** |
| 7 | Completude do núcleo familiar | `src/lib/nucleo-completude.ts` (`avaliarNucleo`) | 5 critérios verificáveis de completude do núcleo/representação, cada um com motivo explícito | `nucleo`, `membros`, `dependentes` | Espelha função de banco `public.nucleo_completude` | Todos os 5 critérios `ok` ⇒ completo; cada item tem `motivo` quando falha | `NucleoCompletude` | não confirmado nesta rodada (não há grep de tela consumidora localizada) | não localizado nesta rodada | **parcial/possível órfão** — motor existe e espelha função de banco, consumidor de tela não confirmado aqui |
| 8 | Varredura de completude (Anexos + Matriz de pendências) | `src/lib/varredura-completude.ts` | Consolidação SOMENTE-LEITURA de pendências contratuais/operacionais/técnicas do piloto | — (dado embutido no arquivo) | **Hardcoded** — 15 linhas (`PEND-01`…`PEND-15`) nomeando o caso "Ana Luiza" e data fixa `2026-08-22` | Nenhum cálculo dinâmico; é um relatório estático de uma varredura pontual | `MATRIZ_PENDENCIAS`, `ANEXOS_VARREDURA`, `COBERTURA_TESTES` | `/governanca/varredura-completude` | `src/lib/__tests__/varredura-completude.test.ts` (testa a estrutura estática, não recálculo) | **estático por desenho** — não é radar de documentação genérico, é auditoria pontual travada no tempo |
| 9 | Radar de documentação/completude/bloqueios (genérico, por caso, dimensão a dimensão como pede o item 7 do prompt) | — | — | — | — | — | — | — | — | **não localizado como motor dedicado**. O mais próximo cobre só um pedaço cada: `nucleo-completude.ts` (núcleo familiar), eixo "documentos" de `radar-eixos.ts` (4 estados, cliente-facing, sem dimensão por bloqueio), e a lista estática #8 |
| 10 | Assistente de Pesquisa (IA) | `src/routes/api/pesquisa-assistente.ts` + `src/lib/pesquisa-ia.server.ts` | Relatório de pesquisa genealógica gerado por IA, com trava de suficiência e trava de autorização; nunca escreve no banco | `casoId`, `complemento` opcional, flags `verificar`/`casoIdConfirmado`/`executarDemonstracao` | `crm_casos`, `case_members`, `research_hypotheses` (case_id), `evidencias` (caso_id — **vazia**), `research_events` (case_id), `tarefas` | Gate 1: `estado_de_autorizacao_pesquisa==='autorizada'` (senão 409 inerte). Gate 2: confirmação de `case_id`. Gate 3: bloqueio de demo sem seleção explícita. Gate 4: `avaliarSuficiencia` (lacunas por campo obrigatório/placeholder) — sem dado mínimo, bloqueia com 422 e grava em `audit_logs` | Stream de texto (relatório em markdown, formato fixo) via Lovable AI Gateway (`google/gemini-2.5-pro`) | `src/components/pesquisa/assistente.tsx` | não localizado teste de integração do endpoint (lógica pura de `avaliarSuficiencia`/`montarDossie` é testável mas teste não encontrado nesta rodada) | **vivo**, mas lê tabelas de evidência/hipótese que **não são as que têm dado real** (ver duplicidade #1 da seção 1) |
| 11 | Centro de Inteligência / Módulo de Pesquisa | `src/lib/pesquisa-modulo.functions.ts`, `.server.ts`, `src/lib/pesquisa-cadeia.functions.ts` | Painel de pesquisas da organização com contadores de pendência/evidência/qualidade; dossiê completo por caso com gate externo e auditoria | `research_cases`, `research_pending_items`, `research_evidence_items`, `quality_issues` (domínio pesquisa), `research_people`, `research_name_variants`, `research_relationships`, `research_events`, `lineage_paths`, `research_sources`, `evidences` (**vazia**), `genealogical_findings`, `research_reports` | Todas as tabelas acima, filtradas por `organization_id` e papel RG (`PAPEIS_LE_RESUMO`/`PAPEIS_LE_DETALHE`/`PAPEIS_EDITA`) | Agregação de contadores (pendências críticas/altas/vencidas, evidências em revisão); sem score — listas e contadores nomeados | Painel de pesquisas + dossiê por caso | `/pesquisa-modulo`, `/pesquisa-modulo/:id` | teste de vocabulário (`pesquisa-vocabulario-banco.test.ts`), `pesquisa-cadeia.test.ts` | **vivo** |
| 12 | Achados genealógicos | `src/lib/achados-genealogicos.functions.ts` | CRUD auditado de achados (`genealogical_findings`) e "encontros de linhagem" | `CAMPOS_ACHADO` (28 campos) | `genealogical_findings` (0 linhas hoje), `research_evidence_items` | Nenhum cálculo — registro estruturado fato-confirmado/a-confirmar/impacto | Achado registrado, ligável a `client_deliverable_id` | `/achados/:caseId` | `src/lib/__tests__/achados-genealogicos.test.ts` | **vivo (schema/rota), sem dado real ainda (0 linhas)** |
| 13 | Biblioteca Mestre | `src/lib/biblioteca-mestre.functions.ts` | Agregador de referências internas (acervo, bases genealógicas, dicionários, trilhas, jurídico, top30) | — | `master_library_items` (6), `genealogical_sources_catalog` (0), `controlled_taxonomies` (61), `citizenship_tracks` (46), `versioned_legal_rules` (1), `product_catalog` (90) | Leitura/gravação auditada por fonte, com arquivamento lógico e homologação (`itemElegivelParaProposta`, `regraAplicavelACaso`) | Itens catalogados por fonte | `/biblioteca` | não localizado nesta rodada | **vivo, mas com bases genealógicas externas ainda vazias (catálogo de referência sem conteúdo)** |
| 14 | Calculadora de cadência D0–D365 | `src/lib/orquestracao-jornada.ts`, `onboarding-jornada.ts`, `jornada-cliente.ts`, `cadencia-limiares.ts` | Já mapeada em rodada anterior desta sessão | — | — | — | — | `/biblioteca-mensagens` (manual), `fechamento-caso.ts` (gate 8, via `onboarding_planos`) | ver PRs #75/#79/#80 | **vivo, parcial (não wireado automaticamente a todos os casos)** — ver Nota de escopo |
| 15 | Calculadora de proposta/SKU/produto | `product_catalog` + PRs #79/#82 | Já mapeada em paralelo nesta sessão | — | — | — | — | — | — | ver PRs #79/#82 — **não reaberto aqui** |
| 16 | Gates de acesso ao portal ("elegibilidade" de acesso, não jurídica) | `src/lib/portal-elegibilidade.ts` | Espelha as travas de banco (`fn_portal_access_autorizacao_guard`, `fn_portal_case_access_guard`) para o seletor mostrar motivo do bloqueio antes do envio | `CasoPortal`, `PessoaPortal`, `AutorizacaoEmail`, `PropostaPortal` | Tabelas de acesso ao portal (não detalhadas nesta rodada) | `bloqueioDoCaso`/`bloqueioDaPessoa` — regras nomeadas de contrato/pagamento/documentos/autorização | `Bloqueio` (motivos) | `/acessos-portal` | não localizado nesta rodada | **vivo**, mas nome "elegibilidade" é enganoso — é gate de acesso, não de elegibilidade de rota |

---

## 3. Matriz de-para de domínios e superfícies

### 3.1 — de-para de domínio pretendido × artefato real (obrigatório da Fase 2)

| Domínio pretendido | Artefato atual | Path/tabela real | Entrada | Regra/cálculo | Saída | Consumidor | Estado | Decisão de reuso | Lacuna/ação |
|---|---|---|---|---|---|---|---|---|---|
| Calculadora de elegibilidade | Radar de elegibilidade preliminar | `src/lib/radar-elegibilidade.ts` | `LeadDesk` (12 fatores) | 12 fatores, faixas nomeadas | `ResultadoRadar` | `/leads` | vivo | **reusar** — não criar nova calculadora | Não existe equivalente pós-caso (após virar `crm_casos`); a leitura para no lead |
| Radar de elegibilidade | (mesmo motor acima, reaproveitado como "radar") | `src/lib/radar-elegibilidade.ts` | idem | idem | idem | `/leads` (não há tela visual tipo "radar" gráfico, é lista com faixa) | vivo/parcial | **reusar**; se quiser visual de radar (aranha/polígono), é camada de apresentação nova sobre o motor existente | Especificar se a Proprietária quer visual gráfico ou lista continua servindo |
| Motor jurídico/cidadania | Trilhas jurídicas + marcos | `citizenship_tracks`, `legal_reference_milestones`, `src/lib/trilhas-juridicas.functions.ts` | — | catálogo, sem cálculo | Lista de trilhas/marcos | `/leads`, Biblioteca Mestre | vivo | **reusar** como núcleo de parâmetro por país | Nenhuma calculadora consome `status_via`/`revisao_humana_juridica` para travar decisão automaticamente fora do radar de elegibilidade |
| Rota/via jurídica | Campo `via_preliminar`/`status_via` dentro de `citizenship_tracks` + `VIAS_JURIDICAS` (lista fechada em `crm-desk.ts`) | `citizenship_tracks.via_preliminar`, `crm_casos.via_juridica_preliminar` | — | — | — | `/leads`, `crm_casos` | vivo | **reusar** | Nenhuma tabela de "rota" separada de "trilha" — são o mesmo conceito com dois nomes (`via` × `track`); de-para de nomenclatura pendente |
| Hipóteses/evidências | Três pares concorrentes (ver seção 1, duplicidade #1 e #2) | `research_hypotheses`/`research_case_hypotheses`; `evidencias`/`evidences`/`research_evidence_items` | — | — | — | Assistente de IA, `/pesquisa-modulo`, `/achados`, `/biblioteca-evidencias` | **duplicado** | **reuso do modelo `research_cases`/`research_evidence_items`/`research_case_hypotheses` como canônico** (é onde há RG, gate externo e mais consumidores de escrita), com plano de migração dos 3 consumidores da tabela `evidencias` e dos 7 da tabela `evidences` — **decisão da Proprietária necessária antes de qualquer migração de dado** | Nenhuma migração nesta rodada; só leitura |
| Completude documental | Núcleo: `nucleo-completude.ts`. Documental: eixo "documentos" de `radar-eixos.ts` (4 estados) + campos soltos em `CaseData.documentos` | `src/lib/nucleo-completude.ts`; `CaseData.documentos.*` | — | 5 critérios (núcleo); contagem localizados/pendentes/em_validação (documentos) | `NucleoCompletude`; `EixoRadar` | Não confirmado (núcleo); `/portal/radar` (documentos) | parcial | **estender** o eixo "documentos" existente com dimensão de bloqueio explícita, em vez de criar radar novo | Falta radar de completude **interno** (Desk), o eixo atual é cliente-facing e sanitizado |
| Calculadora de cadência D0–D365 | `orquestracao-jornada.ts` + dependências | ver Nota de escopo | — | — | — | `/biblioteca-mensagens`, `fechamento-caso.ts` | vivo/parcial | **reusar**, não recalcular | ver PRs #75/#79/#80 |
| Motor de onboarding/micro-entregas | idem cadência (mesma cadeia) | idem | — | — | — | idem | vivo/parcial | **reusar** | idem |
| Prioridade macro de carteira/fila | Matriz de prioridade × urgência (portfólio) | `prioridade-matriz.ts` + `matriz-posicionamento.ts` via `MatrizPrioridadesConectada` | `crm_casos` (lista) | 6 regras nomeadas | Quadrante + sinal | `/casos` | vivo | **reusar** | Nenhuma — já entrega exatamente o que o item 4 do prompt pede para macro |
| Prioridade micro por caso | Mesmo motor (`calcularPrioridade`), aplicado a 1 registro | idem | 1 `crm_casos` | idem | idem | Uso confirmado em coluna/etiqueta (histórico documentado no cabeçalho de `matriz-posicionamento.ts`: "era consumido só como etiqueta numa coluna de tabela e como sinal no caso em destaque") | vivo/parcial | **reusar** dentro de Caso 360 como painel dedicado (hoje é etiqueta, não painel) | Falta um "por que" e "próxima ação com responsável e prazo" expostos dentro da tela de Caso 360 (o motor já produz `explicacao`/`faltantes`/`excecoes` — falta consumo visual dedicado) |
| Urgência/SLA/bloqueios | Fatores `sla`, `bloqueios`, `prazo` dentro do mesmo `prioridade-matriz.ts` | idem | `tarefas.sla_status`/`ops_microentregas.prazo_status`, `case_activation_checks` | idem | idem | idem | vivo | **reusar** — não é motor separado, é fator do mesmo motor de prioridade | Nenhuma |
| Radar de cliente/app e produto | Radar de 4 eixos | `radar-eixos.ts` | `CaseData` | 4 estados fixos | `EixoRadar[]` | `/portal/radar` | vivo | **reusar** | Nenhuma — já é a superfície sanitizada correta |
| Calculadora de proposta/condições/SKU | `product_catalog` | ver PRs #79/#82 | — | — | — | — | (não reaberto) | **reusar** — apontar aqui, não recalcular | — |
| Centro de Inteligência | Módulo de Pesquisa | `pesquisa-modulo.functions.ts`/`.server.ts`, `pesquisa-cadeia.functions.ts` | — | agregação por RG/papel | Painel + dossiê | `/pesquisa-modulo` | vivo | **reusar como núcleo único** — não criar "Centro de Inteligência" como conceito de produto separado; é este módulo, hoje espalhado em 2 rotas (`/pesquisa` × `/pesquisa-modulo`) | Unificar entrada única, decisão pendente da Proprietária (já registrada como duplicidade em `inventario-recuperacao.ts` de 16/08, nunca resolvida) |
| Assistente de Pesquisa e varredura de bases | Assistente de Pesquisa (IA) | `src/routes/api/pesquisa-assistente.ts` | `casoId` + dossiê do caso | gates de autorização/suficiência, sem escrita | Relatório em streaming | `src/components/pesquisa/assistente.tsx` | vivo | **reusar**, corrigindo a fonte de evidência/hipótese lida (ver duplicidade #1) | Reapontar `montarDossie`/query do endpoint para `research_evidence_items`/`research_case_hypotheses` OU decidir formalmente que `evidencias`/`research_hypotheses` são as canônicas |

### 3.2 — de-para de superfícies (regra/motor × onde aparece)

Marcação: **direto** (mesmo dado, sem filtro) · **sanitizado** (versão filtrada/cliente-facing) · **interno** (só Desk/equipe) · **não aplicável** · **inexistente**.

| Regra/motor | Caso 360 | Painel Hoje | Desk Cliente (portal) | Comercial | Pesquisa/Inteligência | Planejador | Contrato | App Cliente | Indicadores |
|---|---|---|---|---|---|---|---|---|---|
| Radar de elegibilidade preliminar (`radar-elegibilidade.ts`) | inexistente (motor não é chamado em Caso 360, só em `/leads`) | inexistente | não aplicável | **interno** (`/leads`) | não aplicável | inexistente | não aplicável | **não aplicável** (nunca projetado — `leituraSanitizada` existe mas não achei consumidor de tela) | inexistente |
| Motor jurídico/trilhas (`citizenship_tracks`) | **interno** (via `crm_casos.citizenship_track_id`, leitura indireta) | inexistente | não aplicável | **interno** (`/leads`) | **interno** (`research_cases.citizenship_track_id`) | inexistente (não confirmado nesta rodada) | não aplicável | não aplicável | inexistente |
| Matriz prioridade×urgência (macro) | inexistente como painel dedicado (só etiqueta) | inexistente (não confirmado consumo em Painel Hoje nesta rodada) | não aplicável | inexistente | não aplicável | não aplicável | não aplicável | **não aplicável** (`prioridadeVisivelParaCliente` retorna sempre `null` por desenho) | inexistente |
| Matriz prioridade×urgência (Desk/portfólio) | não aplicável (é view de lista, não de caso único) | inexistente | não aplicável | inexistente | não aplicável | não aplicável | não aplicável | não aplicável | inexistente |
| Radar de 4 eixos (`radar-eixos.ts`) | inexistente (não confirmado uso dentro de Caso 360 interno) | inexistente | **sanitizado** (`/portal/radar`) | não aplicável | não aplicável | não aplicável | não aplicável | **sanitizado** (é a própria superfície App Cliente) | inexistente |
| Núcleo/completude (`nucleo-completude.ts`) | não confirmado nesta rodada | inexistente | não aplicável | não confirmado | não aplicável | não confirmado | não confirmado | não aplicável | inexistente |
| Varredura de completude estática | não aplicável (é doc pontual, não tela de caso) | não aplicável | não aplicável | não aplicável | não aplicável | não aplicável | não aplicável | não aplicável | **interno** (`/governanca/varredura-completude`) |
| Módulo de Pesquisa / Centro de Inteligência | inexistente como aba dedicada dentro de Caso 360 (existe rota irmã `/pesquisa-modulo/:id`, não embutida) | inexistente | não aplicável | não aplicável | **direto/interno** (`/pesquisa-modulo`) | não confirmado | não aplicável | **não aplicável** (`client_summary_status` existe no schema, mas publicação sanitizada não confirmada como implementada nesta rodada) | inexistente |
| Assistente de Pesquisa (IA) | inexistente como botão dentro de Caso 360 | inexistente | não aplicável | não aplicável | **interno** (`src/components/pesquisa/assistente.tsx`) | não aplicável | não aplicável | não aplicável (nunca publica) | inexistente |
| Biblioteca Mestre | não aplicável | não aplicável | não aplicável | não confirmado | **interno** (`/biblioteca`) | não confirmado | não aplicável | não aplicável | não aplicável |
| Cadência D0–D365 (`orquestracao-jornada.ts`) | não confirmado (não wireado automaticamente — ver Nota de escopo) | link manual "Ver cadência e onboarding em risco" → `/ops` | não aplicável | não aplicável | não aplicável | ligação com `case_plans` não fechada (0 linhas) | não aplicável | não aplicável | não confirmado |
| Gates de acesso ao portal (`portal-elegibilidade.ts`) | não aplicável | não aplicável | **interno** (usado para prever o motivo do bloqueio antes do convite) | não aplicável | não aplicável | não aplicável | não aplicável | trava, não exibida | não aplicável |

---

## 4. Mapa do núcleo universal multi-país (o que já existe, não o que falta inventar)

```
Núcleo universal de decisão
  = FATORES_RADAR (12 fatores, radar-elegibilidade.ts)      [existe, vivo]
  + REGRAS_SINAL (6 regras, prioridade-matriz.ts)            [existe, vivo]
  + orquestracao-jornada.ts / cadencia-limiares.ts           [existe, vivo/parcial — ver PRs #75/79/80]

+ parâmetros por país
  = citizenship_tracks (46 linhas, 11 países + Multipaís)    [existe, vivo]
  + legal_reference_milestones (32 linhas)                   [existe, vivo]

+ rota/via jurídica normalizada
  = citizenship_tracks.via_preliminar / status_via           [existe, vivo]
  ~ VIAS_JURIDICAS (lista fechada em crm-desk.ts)            [existe, vivo — checar se é a MESMA lista de valores
                                                                que status_via/via_preliminar ou uma 3ª nomenclatura]

+ hipótese e evidência por caso
  = research_cases + research_hypotheses/research_case_hypotheses  [existe, DUPLICADO — ver seção 1]
  + research_evidence_items / evidencias / evidences               [existe, TRIPLICADO — ver seção 1]

+ produto/SKU vivo
  = product_catalog (90 linhas)                              [existe — não reaberto, ver PRs #79/#82]

+ cadência transversal
  = orquestracao-jornada.ts + cadencia-limiares.ts           [existe — ver Nota de escopo]

+ projeção segura para Desk e App Cliente
  = radar-eixos.ts (garantirEixosCanonicos, sanitização)     [existe, vivo]
  + prioridadeVisivelParaCliente() → sempre null por desenho [existe, vivo — barreira correta]
```

Leitura: **o núcleo já existe e já é multi-país por parâmetro** (não há calculadora por país — `citizenship_tracks` é uma tabela paramétrica única consumida pelo mesmo motor de radar/prioridade para qualquer país). O problema não é "faltam motores", é que **o pedaço "hipótese e evidência por caso" está fragmentado em 2–3 tabelas concorrentes**, quebrando a promessa do núcleo único.

---

## 5. Especificação do radar de elegibilidade (estados de evidência, sem score fictício)

O motor que já cumpre essa especificação é `src/lib/radar-elegibilidade.ts`. Ele já:
- não devolve percentual de "chance de êxito" (a `completude` é explicitamente documentada como "NÃO é chance de êxito", linha 62-63 do arquivo);
- expressa evidência por dimensão: os 12 `FATORES_RADAR` cobrem exatamente as dimensões pedidas pelo prompt (vínculo de descendência — F01/F02; rota/hipótese — F07; evidência documental — F03/F04; lacunas — `pendentes`; coerência temporal/geográfica — F06; necessidade de validação humana — `exige_revisao_humana`/`bloqueios_externos`);
- para cada fator sem dado, produz uma ação nomeada (`Registrar X na ficha de Discovery`) em vez de preencher por suposição;
- quando não há dados mínimos, devolve explicitamente `faixa: "inconclusiva"` com "Nenhum sinal é atribuído" — que é o equivalente funcional a "sem evidência suficiente" pedido pelo prompt.

O que falta para casar 100% com a especificação da Fase 3 do prompt:
1. **Fonte e nível de evidência por dimensão** — hoje o radar sabe se o fator está `disponivel` (booleano), mas não carrega "fonte" (quem preencheu, quando) nem "nível de evidência" (documento visto vs. relato) por fator individual — só existe `confianca` (alta/média/baixa) como campo único, derivado de `confianca_triagem`. **Extensão mínima**, não motor novo: acrescentar `fonte`/`nivel_evidencia` por `FatorRadar`.
2. **Aplicação pós-caso** — o radar roda sobre `LeadDesk` (pré-caso). Depois que o lead vira `crm_casos`, não há recálculo/leitura equivalente — a elegibilidade "congela" no valor do lead (`hipotese_elegibilidade` em `crm_casos` parece ser herdado manualmente, não recalculado pelo mesmo motor). **Pergunta de decisão da Proprietária na seção 12.**
3. **Visual de radar (gráfico)** — hoje é lista/tabela com faixa, não um gráfico tipo aranha. Se o mockup aprovado do Desk previa visual gráfico, é camada de apresentação nova sobre dado que já existe — não recálculo.

---

## 6. Especificação de prioridade macro/micro e urgência explicável

Já implementado e vivo, sem score opaco: `src/lib/prioridade-matriz.ts`.

- **Macro (carteira/fila)**: `MatrizPrioridadesConectada` (`src/components/desk/matriz-prioridades-conectada.tsx`) chama `listarRegistros({entidade: "crm_casos"})`, aplica `posicionar()` por caso e desenha `MatrizPrioridades`, montada em `/casos`. Cobre bloqueio (`bloqueios`), prazo/SLA conhecido (`prazo`, `slaStatus`), cliente ativo sem próxima ação (implícito via `R0_dados_insuficientes`), dependência externa (`esperaExternaAtiva`). Não cobre explicitamente "entrega publicada sem consumo" nem "risco de acesso/segurança" como fatores — não localizados nesta rodada como fator do motor.
- **Micro (ação do caso)**: o mesmo `calcularPrioridade()` já devolve `explicacao` (o "por quê"), `faltantes` (o que falta preencher) e `excecoes` (quem precisa ser dono) — que é exatamente "por que" + "qual próxima ação" + responsável pedido no prompt. O que falta é **consumo visual dedicado dentro de Caso 360**: hoje esse resultado, segundo o próprio comentário de `matriz-posicionamento.ts` (linha 7-8), "era consumido só como etiqueta numa coluna de tabela e como sinal no caso em destaque" — não há um painel de Caso 360 que renderize `fatores`/`faltantes`/`excecoes` por extenso.
- **Urgência/SLA/bloqueios**: não é motor separado — são 3 dos 7 fatores (`prazo`, `sla`, `bloqueios`) do mesmo `calcularPrioridade()`. Está correto não separar em motor paralelo (a especificação do prompt já pede isso: "duas camadas, sem transformar tudo em score único" — e de fato não há soma, é decisão por regra nomeada em ordem).

Lacuna concreta e pequena (P1): expor `explicacao`/`fatores`/`faltantes`/`excecoes` de `calcularPrioridade()` num bloco de Caso 360, em vez de só etiqueta — isso é **extensão de UI sobre motor já pronto**, não motor novo.

---

## 7. Cadência D0–D365 como configuração do motor existente

Não recalculado nesta rodada. Ver Nota de escopo e PRs #75, #79. Achados relevantes já registrados, mais um achado novo confirmado nesta rodada:
- Motor real (`orquestracao-jornada.ts`), consumidor único de tela hoje é manual (`case_id` digitado à mão em `/biblioteca-mensagens`).
- `catalogo-top30.functions.ts` já lê `crm_casos.ultimo_touchpoint_em` como fonte real de dias sem contato, com fallback correto — confirmado presente na branch atual.
- **Achado novo desta rodada**: `src/lib/prioridade-matriz.ts` define `CADENCIA_ATENCAO_DIAS = 10` e `CADENCIA_CRITICA_DIAS = 14` como **constantes locais próprias** (linhas 99-100), não importadas de nenhum módulo de cadência. A tentativa de unificação desses limiares num módulo único (`src/lib/cadencia-limiares.ts`) existe **apenas na branch não mesclada `refactor/cadencia-limiares-unicos-2026-09-04`** e, mesmo quando mesclada, essa branch une `onboarding-jornada.ts`/`jornada-cliente.ts` — **não inclui `prioridade-matriz.ts`** (verificado: esse arquivo não foi tocado por esse commit). Ou seja: mesmo depois da fusão prevista, o valor 10/14 continuaria existindo em **3 lugares independentes** (2 unificados + 1 no motor de prioridade), com o mesmo número por coincidência de digitação, não por importação. Isso é exatamente o padrão "muita lista, pouco motor" que a Proprietária pediu para eliminar — registrado como P0 na seção 11.
- `fechamento-caso.ts` (gate 8) × Planejador real (`case_plans`) seguem em tabelas diferentes (`onboarding_planos` vs `case_plans`), decisão dada (seguir com `onboarding_planos`) mas não executada em código.

---

## 8. Matriz de expansão por país/linha

| País/linha | Está no site? | Está no catálogo? | Tem parâmetros (`citizenship_tracks`)? | Tem rota jurídica (`via_preliminar`/`status_via`)? | Tem base documental (`legal_reference_milestones`)? | Tem produto homologado (`product_catalog`)? | Estado |
|---|---|---|---|---|---|---|---|
| Itália | não verificado nesta rodada | não verificado nesta rodada (ver PR #82) | **sim** (4 trilhas) | sim (campo presente) | sim (subset de 32) | não verificado aqui (ver PR #82) | pendente de decisão da proprietária para consolidar com #82 |
| Portugal | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Espanha | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Alemanha | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Polônia | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Luxemburgo | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Hungria | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Áustria | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Croácia | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Romênia | não verificado | não verificado (ver PR #82) | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Multipaís | não verificado | não verificado | **sim** (4 trilhas) | sim | sim | não verificado aqui | idem |
| Brasil | não verificado | não verificado | sim (1 trilha) | sim | não verificado por linha | não verificado aqui | pendente |
| "Em investigação" (linha explícita no banco) | não aplicável | não aplicável | sim (1 trilha) | sim | não verificado por linha | não aplicável | confirma que o schema já trata país indefinido como estado válido, não como erro |

Nota: as 4 trilhas por país (padrão consistente: exatamente 4 para 11 dos 12 países reais) sugerem um template aplicado uniformemente a todos os países — **consistente com a regra desejada do prompt** ("não criar calculadora nova por país, parametrizar"). Não verificado nesta rodada: se as 4 trilhas por país têm o MESMO significado semântico (ex.: "via principal", "via alternativa", "naturalização", "reparação histórica") em todos os países, ou se são heterogêneas — checagem de conteúdo (não só contagem) fica para uma rodada de leitura de conteúdo específica, com cuidado de não expor dado sensível.

Cruzamento com catálogo/site/produto homologado **não foi feito nesta rodada** porque é exatamente o escopo do de-para SKU × produto-pai já em andamento em paralelo (PR #82) — cruzar aqui duplicaria esforço e criaria dois de-paras concorrentes sobre o mesmo dado, o que a regra "muita lista, pouco motor" da Proprietária proíbe. Recomenda-se que o PR #82, ao concluir, adicione as 3 colunas que faltam nesta tabela (site/catálogo/produto homologado) em vez de esta auditoria antecipar esse cruzamento sem a mesma fonte.

---

## 9. Mapa do Centro de Inteligência e Assistente de Pesquisa

Resposta às 6 perguntas do prompt, com evidência:

**1. Qual é a entrada do assistente de pesquisa?**
`casoId` (obrigatório) + `complemento` de texto opcional. Sempre por caso — nunca por pessoa/objetivo solto, nunca por país/rota isolados. Ver `src/routes/api/pesquisa-assistente.ts` linhas 16-26.

**2. O que ele consegue fazer hoje?**
Buscar (lê `crm_casos`, `case_members`, `research_hypotheses`, `evidencias`, `research_events`, `tarefas` do próprio caso — nenhuma outra fonte), organizar (monta dossiê estruturado em `montarDossie()`), e gerar rascunho (relatório em markdown com seções fixas: Objetivo, Dados recebidos, Linha do tempo, Linha genealógica, Matriz de evidências, Conflitos, Plano de pesquisa, Próximos passos — `PROMPT_MESTRE` em `pesquisa-ia.server.ts`). Não recomenda base ativamente (o prompt mestre não lista fontes por país/época automaticamente — ele instrui o modelo a considerar tipos de acervo genericamente, mas isso não é uma consulta a `research_sources`/`genealogical_sources_catalog` real).

**3. O que ele não pode fazer?**
Confirmado por código: nunca escreve no banco (comentário explícito "Nenhuma escrita no banco" no cabeçalho da rota); recusa rodar sem `estado_de_autorizacao_pesquisa === 'autorizada'` no caso (409 + mensagem "permanece inerte"); recusa sem confirmação exata do `case_id` exibido; recusa caso demo sem seleção explícita de "Executar demonstração"; recusa com dado insuficiente (422) e **audita a tentativa bloqueada** em `audit_logs` com `acao: "analysis_blocked_insufficient_case_data"`. O prompt mestre também instrui explicitamente (regra 10 do `PROMPT_MESTRE`): "Não prometa obtenção de documentos, cidadania, elegibilidade jurídica ou resultado de pesquisa sem evidência suficiente."

**4. Como achados viram evidência e tarefa dentro do caso?**
Cadeia real existe em `pesquisa-cadeia.functions.ts`: `genealogical_findings` tem colunas `eligible_for_client_deliverable` e `client_deliverable_id` — ou seja, o schema já modela achado → elegível para entrega → vínculo a uma entrega concreta. `research_pending_items` é a tabela de pendências/tarefas internas de pesquisa (severidade, status, `due_at`), consumida no painel (`painelPesquisaModulo`). O Assistente de IA em si **não cria** nem achado nem tarefa automaticamente — ele só produz texto para revisão humana (consistente com a regra 10 do prompt original da Proprietária: "cria/atualiza somente tarefas internas quando autorizado").

**5. Como uma micro-entrega pode ser preparada com base em achados sem expor dados internos no App Cliente?**
`genealogical_findings.client_projection_status` e `eligible_for_client_deliverable` sugerem que existe um campo de controle de projeção — mas **o pipeline de sanitização achado→App Cliente não foi confirmado como implementado nesta rodada** (não localizei código que leia `client_projection_status` para decidir o que aparece no portal). O padrão de sanitização que EXISTE e está provado é o de `radar-eixos.ts` (`limparCopy`/`limparLista`, nunca IDs internos/SKU/URLs) — se a micro-entrega de pesquisa for projetada ao cliente, o padrão a reaproveitar é esse, não um novo.

**6. Quais bases genealógicas/externas aparecem apenas como referência e quais estão realmente integradas?**
`genealogical_sources_catalog` (catálogo de bases, parte da Biblioteca Mestre) tem **0 linhas** — ou seja, hoje **nenhuma base está sequer catalogada como referência**, muito menos integrada. `research_sources` (fontes específicas por pesquisa, não catálogo geral) tem 6 linhas reais, ligadas a `research_case_id` — essas são referências registradas manualmente por pesquisa, não integração automática com nenhum acervo externo (não há indício de scraping/API externa no código lido). Confirma a regra 10 do prompt original ("não executa pesquisa externa sem autorização") — não há mecanismo de busca automática, só registro manual do que já foi consultado.

Limites de autonomia e publicação já implementados corretamente (não precisam ser recriados): gate de autorização por caso, trava de confirmação de identidade do caso, trava de demo, trava de suficiência de dado, ausência total de escrita automática, ausência de qualquer chamada de pesquisa externa automatizada.

---

## 10. Mockup aprovado × implementação real (Desk visual)

Esta rodada não teve acesso a um arquivo de mockup do Desk especificamente rotulado como "aprovado" para radar de elegibilidade/prioridade — a busca localizou `archive/mockups/componentes/mockup/radar.tsx`, que é um componente estático de exemplo, não um documento de aprovação. Classificação honesta por item, baseada apenas no que foi comparável:

| Item do mockup/documento | Classificação |
|---|---|
| Radar de elegibilidade | **implementado parcialmente** — motor vivo (`radar-elegibilidade.ts`) existe e roda em `/leads`, mas não há visual de radar gráfico confirmado, e não há aplicação pós-caso |
| Radar de prioridades/urgência micro e macro | **implementado com dado vivo** para macro (`/casos`, `MatrizPrioridadesConectada`); **implementado parcialmente** para micro (motor calcula, mas resultado hoje só vira etiqueta, não painel dedicado em Caso 360) |
| Cards de Caso 360 | não avaliado nesta rodada (fora do escopo desta varredura específica; ver PR #81 para o que já foi mapeado de Caso 360/Operação Viva) |
| Painel Hoje | não confirmado nesta rodada se consome `prioridade-matriz.ts` — **investigar antes de declarar qualquer coisa** |
| Área Cliente | **implementado com dado vivo** — `radar-eixos.ts` em `/portal/radar`, com sanitização confirmada em código |
| Painel/Indicadores (`/governanca/indicadores`) | conforme a regra do próprio prompt da Proprietária, **não tratado como dashboard vivo** nesta auditoria; arquivo tem 223 linhas com `DETALHE_INDICADOR`/`MANIFESTACAO_INDICADOR` — não confirmado se os indicadores de origem são hardcoded ou lidos de tabela; **investigação adicional necessária, não concluída aqui** |
| Pesquisa e Centro de Inteligência | **implementado com dado vivo** — `/pesquisa-modulo`, com RG, gate externo e dado real (pequeno volume) |

---

## 11. Backlog P0/P1/P2 (uma intenção por PR, com dependências)

**P0**
1. **Registrar a decisão de fonte canônica de evidência de pesquisa** (`evidencias` × `evidences` × `research_evidence_items`) — nenhuma PR de código antes dessa decisão; hoje o Assistente de IA e a "cadeia de pesquisa" leem tabelas vazias enquanto o dado real (5 itens) está em `research_evidence_items`. Depende de: decisão da Proprietária (pergunta 1 da seção 12).
2. **Registrar a decisão de fonte canônica de hipótese** (`research_hypotheses` × `research_case_hypotheses`) — mesma lógica, dependente de decisão (pergunta 2).
3. Depois das duas decisões acima: **PR pequena** para reapontar `src/lib/pesquisa-ia.server.ts`/`pesquisa-assistente.ts` para as tabelas decididas como canônicas, sem mudar o comportamento de gates.
4. **Confirmado nesta rodada**: `CADENCIA_ATENCAO_DIAS`/`CADENCIA_CRITICA_DIAS` em `prioridade-matriz.ts` são uma 3ª cópia independente dos limiares 10/14, não coberta pela unificação em curso na branch `refactor/cadencia-limiares-unicos-2026-09-04`. PR pequena: depois que essa branch for mesclada, importar `CADENCIA_ATENCAO_DIAS`/`CADENCIA_CRITICA_DIAS` de `cadencia-limiares.ts` dentro de `prioridade-matriz.ts` em vez de redeclarar — sem mudança de comportamento (mesmos valores hoje).

**P1**
5. Expor `explicacao`/`fatores`/`faltantes`/`excecoes` de `calcularPrioridade()` como painel dedicado dentro de Caso 360 (hoje só etiqueta) — reaproveita motor existente, é PR de UI.
6. Confirmar/implementar consumo de `prioridade-matriz.ts` no Painel Hoje (não confirmado nesta rodada se já existe) — se não existir, é PR pequena de leitura, sem novo cálculo.
7. Unificar a entrada de menu `/pesquisa` × `/pesquisa-modulo` — depende de decisão de qual fica como canônica (pergunta 3).
8. Estender `radar-elegibilidade.ts` com `fonte`/`nivel_evidencia` por fator (hoje só tem `disponivel` booleano) — PR pequena e localizada, sem tocar em regra de faixa.
9. Investigar e documentar `/governanca/indicadores` — confirmar se é hardcoded (violaria a regra 9 do prompt da Proprietária) antes de qualquer decisão de reuso.

**P2**
10. Especificar se a Proprietária quer visual gráfico de radar (tipo aranha) para `radar-elegibilidade.ts` — hoje é lista.
11. Especificar pipeline achado → micro-entrega sanitizada (pergunta 4) — schema já tem os campos (`eligible_for_client_deliverable`, `client_projection_status`), falta confirmar/implementar o consumo.
12. Popular `genealogical_sources_catalog` (0 linhas) como catálogo de referência de bases genealógicas — decisão de conteúdo, não de código.

---

## 12. Perguntas de decisão que só a Proprietária pode responder

1. **Evidência canônica**: entre `evidencias` (PT, 3 consumidores, 0 linhas), `evidences` (EN, 7 consumidores, 0 linhas) e `research_evidence_items` (research_case_id, 3 consumidores, 5 linhas reais) — qual é a fonte final? A que tem mais consumidores de escrita (`evidences`, via `biblioteca-evidencias.functions.ts`) não é a que tem dado real hoje.
2. **Hipótese canônica**: `research_hypotheses` (case_id direto, 5 linhas, usada pelo Assistente de IA) ou `research_case_hypotheses` (research_case_id, 2 linhas, usada pelo Painel de Pesquisa)?
3. **Entrada única de Pesquisa**: manter `/pesquisa` e `/pesquisa-modulo` como coisas diferentes (e então nomeá-las diferente) ou consolidar em uma?
4. **Elegibilidade pós-caso**: depois que um lead com `elegibilidade_preliminar` vira `crm_casos`, o campo `hipotese_elegibilidade` do caso deve ser recalculado pelo MESMO motor (`radar-elegibilidade.ts`) ou é intencionalmente um julgamento humano separado, feito de novo no caso? Hoje não há ligação de código entre os dois.
5. **Nome "elegibilidade" duplicado em conceitos diferentes**: `portal-elegibilidade.ts` (gate de acesso ao portal) e `radar-elegibilidade.ts` (elegibilidade de rota jurídica) usam a mesma palavra para coisas diferentes. Renomear algum deles para reduzir risco de confusão futura?
6. **Visual de radar**: a Proprietária quer um gráfico tipo radar/aranha para elegibilidade e prioridade, ou a lista/etiqueta atual (já viva, já real) é suficiente como entrega?
7. **`genealogical_sources_catalog` vazio**: quem é responsável por popular o catálogo de bases genealógicas de referência — Pesquisa, ou é aguardado por decisão de produto?
8. **Cruzamento país × site × catálogo × produto homologado** (seção 8, colunas em branco): confirmar se isso deve ser feito dentro do PR #82 (SKU × produto-pai) já em andamento, para não duplicar esforço de leitura do mesmo dado em duas frentes paralelas.

---

## 13. Limites de acesso, evidência não disponível e riscos de dados/RLS

- Todas as tabelas centrais consultadas (`citizenship_tracks`, `legal_reference_milestones`, `research_cases`, `research_hypotheses`, `research_case_hypotheses`, `research_evidence_items`, `evidencias`, `evidences`, `genealogical_findings`, `research_people`, `research_sources`, `crm_casos`, `product_catalog`) têm **RLS habilitado** e 3–5 policies cada, confirmado por leitura de `pg_class`/`pg_policies` nesta rodada. Conteúdo das policies (regras exatas) não foi lido linha a linha — apenas confirmada a presença e contagem, por serem tabelas de dado de cliente/pesquisa.
- Nenhum conteúdo de pessoa, CPF, documento ou texto de pesquisa foi lido ou exposto nesta auditoria — apenas contagens agregadas (`count(*)`) e nomes de colunas/tabelas.
- **Não investigado nesta rodada** (fora do escopo focal desta sessão, listado para transparência): consumo real de `prioridade-matriz.ts` dentro de Painel Hoje; conteúdo de `/governanca/indicadores` (hardcoded ou vivo); pipeline de sanitização achado→micro-entrega→App Cliente; conteúdo semântico das 4 trilhas por país (só a contagem foi confirmada); cruzamento site×catálogo×produto por país (deliberadamente deixado para o PR #82 em andamento, para não duplicar).
- Testes: cobertura confirmada para `radar-elegibilidade` (indireto, via `indicadores-sinais.test.ts`), `radar-eixos-canonicos`, `prioridade-matriz`, `matriz-posicionamento`, `matriz-juridica`, `varredura-completude`, `pesquisa-cadeia`, `achados-genealogicos`, `plano-acao-pesquisa`. Sem teste localizado nesta rodada: `nucleo-completude.ts`, `trilhas-juridicas.functions.ts`, `biblioteca-mestre.functions.ts`, o endpoint `pesquisa-assistente.ts` e `pesquisa-ia.server.ts` (`avaliarSuficiencia`/`montarDossie` são funções puras e testáveis, mas teste não encontrado).

---

## 14. Adendo (04/09) — por que a duplicidade de evidência aparece como abas que se contradizem

A Proprietária apontou, depois desta auditoria, que não via necessidade de 3 tabelas de evidência e suspeitava que o problema nascia de duas telas contraditórias — uma "operacional", outra de "pesquisa genealógica" — tratando pedido, encontrado e requerido como coisas diferentes quando deveriam ser estados de **uma única evidência**. Esta rodada seguiu a pista até o código e código confirma a suspeita, com um detalhe mais grave do que a seção 1 havia registrado.

### 14.1 — As duas telas de evidência não leem tabelas diferentes entre si — leem a MESMA tabela com DOIS vocabulários de status que não batem

`/biblioteca-evidencias/$caseId` (rótulo "G-03 · Uso interno", a tela "operacional") e `/pesquisa-evidencias/$caseId` (rótulo "Pesquisa Genealógica e Evidências") **não são as duas pontas da duplicidade de tabela** — as duas leem e escrevem a mesma coluna, `evidences.workflow_status`:
- `/biblioteca-evidencias` grava evidência nova via `salvarEvidencia` (`src/lib/biblioteca-evidencias.functions.ts`) → `.from("evidences")`.
- `/pesquisa-evidencias` muda o status da mesma evidência via `mudarEstadoEvidencia` (`src/lib/pesquisa-cadeia.functions.ts:218-233`) → também `.from("evidences")`, mesma coluna `workflow_status`.

O problema é que cada tela usa uma lista de rótulos **escrita à mão, de forma independente**, para os mesmos valores dessa coluna:

| Conceito | `FLUXO_EVIDENCIA` (`src/lib/biblioteca-evidencias.ts:22-34`, usado por `/biblioteca-evidencias`) | `STATUS_EVIDENCIA` (`src/lib/pesquisa-cadeia.ts:39-52`, usado por `/pesquisa-evidencias`) |
|---|---|---|
| Requer tradução/apostila | `requer_traducao_apostila` | `requer_traducao_ou_apostila` |
| Rejeitada/inaplicável | `rejeitada_inaplicavel` | `rejeitada_ou_inaplicavel` |
| Aprovada para entrega | `aprovada_para_entrega` | `aprovada_para_entrega_cliente` |
| Publicada | `publicada` | `publicada_ao_cliente` |
| Validada internamente | **não existe nesta lista** | `validada_internamente` |

Os dois componentes resolvem o rótulo do mesmo jeito — `lista.find(x => x.id === valor)?.rotulo ?? String(valor)` — ou seja, quando o valor gravado por uma tela não existe na lista da outra, a outra tela não erra silenciosamente: **mostra o id técnico em texto cru** (ex.: `validada_internamente`) em vez de um rótulo em português. Isso é, ao vivo, exatamente a "contradição entre abas" que a Proprietária descreveu: a mesma evidência muda de aparência (e, em 4 dos 11 estados, de identidade) dependendo de qual tela a editou por último.

### 14.2 — A tela "Pesquisa Genealógica" mistura duas tabelas diferentes dentro da MESMA aba, o que explica o "pedido/encontrado/requerido"

Em `src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx`, a aba `"evidencias"` do seletor renderiza **dois blocos com fontes de dado diferentes**, um logo depois do outro (linhas 540 e 639 do arquivo, ambos sob `secao === "evidencias"`):
1. "Evidências e validação" — lê `evidences` (a mesma tabela da seção 14.1).
2. "Documentos e Solicitações" — lê `document_requests` (`src/lib/documentos-solicitacoes.functions.ts:61`), com seu próprio vocabulário de status (`STATUS_SOLICITACAO`, `src/lib/documentos-solicitacoes.ts:89-100`): `nao_solicitado → a_preparar → solicitado → aguardando_pagamento_cliente → aguardando_cliente → aguardando_instituicao → recebido → em_revisao → validado_internamente → divergente → insuficiente → requer_complemento → ...`.

Note que a cauda desse vocabulário (`recebido`, `em_revisao`, `validado_internamente`, `divergente`, `insuficiente`, `requer_complemento`) **repete quase palavra por palavra** a cauda de `STATUS_EVIDENCIA`/`FLUXO_EVIDENCIA` da seção 14.1 — é o mesmo ciclo de vida modelado duas vezes, uma vez com a etapa de "pedido" na frente (`document_requests`) e outra sem ela (`evidences`). Isto é exatamente o que a Proprietária descreveu: pedido, encontrado e requerido não são conceitos diferentes — são **pontos do mesmo ciclo de vida**, hoje partido em duas tabelas com vocabulário redundante, apresentadas lado a lado na mesma aba como se fossem seções distintas.

O schema já antecipava a costura: `document_requests` tem uma coluna `evidence_id` (confirmada em `src/lib/documentos-solicitacoes.functions.ts:14` e `src/lib/documentos-solicitacoes.ts:259`, esta última na lista de campos nunca expostos ao App Cliente). Mas **nenhum formulário da tela usa esse campo** — o formulário de "Nova solicitação documental" (linhas 736-891 do arquivo) não tem campo para vincular a solicitação à evidência que ela eventualmente produz. Na prática, hoje, uma solicitação e a evidência que deveria fechá-la são dois registros criados e mantidos à mão, sem vínculo — mesmo a coluna que faria esse vínculo já existindo no banco, sem uso.

### 14.3 — A terceira tabela é a única com dado real, e fica isolada numa terceira tela

A seção 1 já havia contado 5 linhas reais em `research_evidence_items` contra 0 em `evidencias`/`evidences`. Esta rodada confirma onde essas 5 linhas aparecem: **só em `/achados/$caseId`** (`src/lib/achados-genealogicos.functions.ts:87-94`, função `painelAchados`), como uma lista de seleção múltipla ("Evidências vinculadas") para linkar a um achado genealógico. Resultado prático e verificável hoje: abrir `/biblioteca-evidencias/$caseId` ou `/pesquisa-evidencias/$caseId` de um caso mostra "Nenhuma evidência registrada"; abrir `/achados/$caseId` do MESMO caso mostra uma lista de evidências para escolher. Três telas, três impressões diferentes do que existe, para o mesmo caso.

(Ressalva de leitura, já registrada na seção 5.4 de outro documento desta sessão: a consulta de `painelAchados` a `research_evidence_items` filtra só por `organization_id`, sem filtro por `case_id`/`research_case_id` — outro ponto a revisar quando a tabela canônica for decidida, não coberto por esta rodada.)

### 14.4 — Confirmação: é 1 evidência, não 3

Código confirma a leitura da Proprietária. Não há três tipos de evidência — há um único ciclo de vida (solicitada → recebida → registrada → em revisão/validação → aprovada para entrega → publicada) que hoje está:
- fisicamente espalhado em `document_requests` (front do ciclo, "pedido") + `evidences` (miolo do ciclo, "encontrado/validado") + `research_evidence_items` (onde o dado real efetivamente foi parar, com uso em `/achados` e no Assistente de Pesquisa de IA — este último lendo `evidencias`, a terceira grafia, vazia, por engano, conforme já registrado na seção 1);
- e, mesmo nos dois pontos que já compartilham `evidences.workflow_status`, exibido com dois vocabulários de rótulo divergentes que fazem a mesma evidência parecer mudar de identidade conforme a tela usada por último.

Isso não muda a recomendação P0 já registrada na seção 11 (decidir fonte canônica antes de qualquer PR de código) — reforça-a com um motivo concreto a mais para a decisão não esperar: enquanto ela não for tomada, editar evidência em uma tela pode produzir um estado que a outra tela não sabe rotular. Nenhum código foi alterado nesta rodada; este adendo é só leitura adicional, seguindo o mesmo limite do restante do documento.
