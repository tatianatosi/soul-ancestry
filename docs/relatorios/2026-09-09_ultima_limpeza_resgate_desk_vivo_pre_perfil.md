# CA-ÚLTIMA-LIMPEZA-E-RESGATE-DESK-VIVO-PRÉ-PERFIL — execução (09/09/2026)

## 1. Cabeçalho

- **Missão:** CA-ÚLTIMA-LIMPEZA-E-RESGATE-DESK-VIVO-PRÉ-PERFIL-2026-09-09.
- **Objetivo:** fechar a última rodada de convergência do Desk (Cortes A–E) antes de autorizar Perfil 360 em Cards / UX-UI Pantone / Caso 360 simplificado.
- **Método:** 4 auditorias independentes (agentes de investigação, somente leitura) cobrindo Corte A (gates/marco jurídico), Corte B (idempotência de alerta/tarefa), Corte C (onboarding_planos + achado/App) e Corte D (rotas/cards mortos ou duplicados) — cada uma reportando achado por achado com arquivo:linha, não impressão. Achados reais viraram correção mínima nesta mesma rodada; achados sem risco viraram registro/decisão.
- **Apoio:** esta rodada não reabre o que já foi decidido/corrigido em `2026-09-09_decisoes_proprietaria_limpeza_pre_uxui_execucao.md` e `2026-09-09_lgpd_documento_individual_titular_e_achado_compartilhavel_execucao.md` — só verifica o que ainda não tinha sido confirmado e corrige o que apareceu de novo.

## 2. Placar

| Contador | Valor |
|---|---|
| Rotas/cards/formulários auditados (Corte D, 7 categorias) | 7 categorias, 9 achados concretos |
| Duplicações classificadas com o vocabulário da missão | 9 |
| Duplicações corrigidas nesta rodada (código) | 6 |
| Duplicações registradas como decisão pendente (não corrigidas agora) | 2 |
| Writers de `case_alerts`/`tarefas` auditados nesta rodada | 6 (4 já confirmados antes + 2 novos: `criarRegistro`/tarefas, `salvarPesquisa`/pendências) |
| Gaps de idempotência corrigidos nesta rodada | 2 |
| Conceitos com fonte única confirmada nesta rodada (gate ativação, gate formalização, marco jurídico, onboarding_planos) | 4 de 4 — sem violação encontrada |
| Gap de sanitização (achado App) corrigido nesta rodada | 1 (`salvarProjecao`/`aprovarProjecao` sem checagem server-side) |
| Premissa anterior corrigida (não é bug, é fato novo) | 1 — `client_deliverables` tem escritor ativo, não está morta |

## 3. Matriz uma-fonte-por-conceito (Corte A)

| Conceito | Escritor canônico | Leitura canônica | Legado/compatibilidade | Consumidor de ação | Duplicidade restante | Correção executada |
|---|---|---|---|---|---|---|
| Próxima ação | RPC `proxima_acao_prioritaria(_case)` / `..._lote` | `obterProximaAcaoCanonica()` (`caso-ficha.ts`) | Campo manual (`proxima_acao_*`) só quando origem=manual, nível 8 | Painel Hoje, Ficha 360, Lista de Casos | Nenhuma | Já convergido em rodada anterior; reconfirmado nesta (`casos.index.tsx` usa a mesma função) |
| Tarefa | `salvarTarefa` (ops.functions.ts) | leitura direta de `tarefas` | — | Painel de tarefas, ações de caso | 2 writers sem dedup (`criarRegistro`/tarefas, `salvarPesquisa`/pendências) | **Corrigido nesta rodada** — mesmo padrão de dedup aplicado aos dois |
| Alerta | 4 writers já deduplicados (`prepararAlertaProjecao`, `registrarProximaAcao`, `alertaInternoTicket`, `registrarRevalidacaoProposta`) | leitura direta de `case_alerts` | `tipo="plano_acao_critico"` só lido, nunca inserido pela app (possível trigger de banco — fora do escopo desta rodada, listado em decisões pendentes) | Painel Hoje, Alertas | Nenhum writer novo encontrado | Sem ação necessária — auditoria confirmou que não há writer sem proteção |
| Checklist/requisito de ativação | `case_ativacao_bloqueios_reais(_case)` (RPC, `STABLE`, puro cálculo) | mesma RPC | Colunas antigas de `case_activation_checks.obrigatorio` documentadas como cache não confiável, não usadas | Ficha 360, Lista de Casos | Nenhuma — função é pura, sem estado persistido que possa duplicar | Sem ação necessária |
| Gate de ativação/formalização | Ativação: `case_ativacao_bloqueios_reais` (case-level). Formalização: `exigirGate`/`gates-formalizacao.ts` + `tentarEtapaExterna` (ação externa específica) | mesmos | — | Ficha 360, Contrato | Nenhuma — são dois escopos de decisão diferentes (intake do caso vs. ato externo do contrato), não competem | Sem ação necessária — auditoria confirmou não-sobreposição |
| Documento e solicitação documental | `fn_documents_guard` (trigger) + `salvarDocumento` | RLS `documents_sel_portal` | — | Painel de privacidade, Portal do cliente | Nenhuma nova (LGPD já corrigida na rodada anterior) | Sem ação necessária nesta rodada |
| Proposta | `materializarProposta` | leitura por caso | `blueprint_parameters` (zero writers) vs `case_plans` (writer único) | Ficha 360 | Nenhuma nova | Sem ação necessária |
| Condição comercial | `commercial_conditions` (case-service-consolidacao.functions.ts) | mesma tabela | — | Ficha 360, Financeiro | Nenhuma | Sem ação necessária |
| Contrato | `contratos.functions.ts` (`gerarRascunhoInterno`, `atualizarContrato`) | mesmo módulo | — | Tela de contrato | UI: 3 botões que só trocavam de aba, mesma fileira de botões que mutam | **Corrigido nesta rodada** — removidos, nav de abas já cobre |
| OS (ordem de serviço) | `emitirOuRecuperarOS` (idempotente por hash) | mesma função | — | Ficha 360, Contrato | Nenhuma | Sem ação necessária |
| Planejamento/jornada | `sincronizarPlanejador` (`case_plans`) | `entradaDoPlano()` | `blueprint_parameters` legado, zero writers | Ficha 360 | Nenhuma nova | Sem ação necessária |
| Onboarding | `recalcularPlanoOnboarding` (`onboarding_planos`) — execução pura, nunca decide produto/preço/proposta/condição comercial | leitura em `case-service-consolidacao`, `fechamento-caso` | — | Aba de Jornada/Onboarding | Nenhuma | Confirmado nesta rodada — auditoria não achou nenhum campo comercial gravado por este módulo |
| Microentrega | `criarMicroentregaCliente`/`transicionarMicroentrega` (`client_deliverables`) | Aba Jornada (`AbaJornadaCliente`, `casos.$caseId.index.tsx`) | **Correção de premissa**: esta tabela tinha sido registrada como "zero escritores ativos" em relatório anterior — **isso estava errado**; há escritor ativo e alcançável pela UI de produção. Ver seção 10 | Aba Jornada do caso | Coexiste com `app_projections`/achados como via de entrega ao cliente — não é a mesma coisa (achado é síntese sanitizada; microentrega é entrega formal), mas o limite entre as duas não está documentado | Não corrigido nesta rodada (ver decisão pendente #1) |
| Atualização/projeção para App | `salvarProjecao`/`aprovarProjecao`/`publicarProjecaoApp` (`app_projections`) | `app_proj_select_portal` (RLS, já reescrita na rodada LGPD) | — | Portal do cliente, App Cliente como pessoa | `salvarProjecao`/`aprovarProjecao` não repetiam a checagem de conteúdo sanitizado no servidor (só client-side) | **Corrigido nesta rodada** — `conteudoProjetavel` agora roda no servidor nas duas funções |
| Marco jurídico | `homologarTrilhaOuRegra` (`versioned_legal_rules.status`) | `marcoJuridicoProjetavel()` | `legal_reference_milestones` é só citação, sem status próprio | Biblioteca de evidências | Nenhuma | Confirmado nesta rodada — único escritor, único leitor de gate |
| Pessoa/cliente/participante | `case_members`/`clientes` (rodada LGPD já unificou titular) | Ficha 360, Portal | — | Painel de privacidade | Nenhuma nova | Sem ação necessária |

## 4. Matriz sinal → ação → tarefa/alerta → próxima ação → projeção App

| Sinal de origem | Ação disparada | Vira tarefa? | Vira alerta? | Atualiza próxima ação canônica? | Pode gerar projeção ao App? |
|---|---|---|---|---|---|
| Microentrega pendente detectada | `prepararAlertaProjecao` | Não | Sim, dedup por `case_id+tipo` | Não diretamente | Não — só cria o alerta interno |
| Registro de próxima ação manual | `registrarProximaAcao` | Não | Sim, dedup | Sim — é a própria fonte quando origem=manual | Não |
| Ticket de atendimento do cliente (portal) | `alertaInternoTicket` | Não | Sim, dedup por `case_id+tipo+detalhe ilike` | Não | Não |
| Revalidação de proposta necessária | `registrarRevalidacaoProposta` | Não | Sim, dedup (padrão original) | Não diretamente | Não |
| "Adicionar pendência" na pesquisa do caso | `salvarPesquisa` (bloco `pendencias`) | Sim, em `tarefas` | Não | Não | Não |
| CRUD genérico da tela `/tarefas` | `criarRegistro` (entidade `tarefas`) | Sim, em `tarefas` | Não | Não | Não |
| Marco jurídico homologado + evidência aprovada | `salvarProjecao` → `aprovarProjecao` → `publicarProjecaoApp` | Não | Não | Não | Sim — só depois de `conteudoProjetavel` (agora também no servidor) |
| Achado autorizado a compartilhar (LGPD, rodada anterior) | `autorizarCompartilhamentoAchado` | Não | Não | Não | Sim, para o destinatário autorizado — nunca automático |

## 5. Matriz de rotas/cards/formulários simplificados (Corte D)

| # | Achado | Classificação (vocabulário da missão) | Ação nesta rodada |
|---|---|---|---|
| 1 | Formulário duplicado: `responsavel_principal`/`eixo_comercial`/`eixo_formalizacao` editáveis tanto no CRUD genérico da Lista de Casos (`casos.index.tsx`) quanto na Ficha 360 | Resumir/ligar à ação canônica | **Executado** — removidos os 3 campos do formulário CRUD genérico; Ficha 360 continua sendo o único lugar para editá-los |
| 2 | Card "Integridade" do Painel Dia aponta para `/auditoria`, rota removida (CTA morto, 404) | Remover rota/atalho preservando componente | **Executado** — repontado para `/qualidade` (Radar Interno já absorveu este conteúdo) |
| 3 | Barra de ação do contrato mistura 3 botões que só trocam de aba ("Editar contrato", "Adicionar anexo", "Adicionar cláusula") com botões que mutam de fato | Remover rota/atalho preservando componente | **Executado** — os 3 removidos; a nav de abas logo abaixo já cobre a mesma navegação |
| 4 | Tabelas técnicas cruas no topo de `governanca.catalogo-operacional-30.tsx` e `governanca.decisoes.tsx` | Recolher em Dados técnicos | **Não executado nesta rodada** — registrado como decisão pendente #2 (mudança de layout maior, sem risco de dado ou de correção; melhor tratada junto do trabalho de UX-UI já que reaproveita o padrão "Dados técnicos ▾" de `contratos.$id.tsx`) |
| 5 | 4 componentes de painel órfãos (`PainelHoje`, `PainelDeskHoje`, `BotaoTestarComoCiente`, `FaixaHistorica`) sem nenhum import — sobraram da remoção correta das rotas duplicadas de Painel Hoje em 08/09/2026 | Declarar legado sem consumidor | **Executado (documentação)** — declarados aqui como legado sem consumidor; nenhum dado ou tabela envolvida, arquivos preservados para referência histórica, sem exclusão |
| 6 | `app-cliente-como-pessoa.tsx` cobre 3 das 10 telas do App Cliente sem avisar isso na interface (só em comentário de código) | Resumir/ligar à ação canônica | **Executado** — aviso visível adicionado na própria tela |
| 7 | Rotas `/mockup` e `/studio-devolutivas` fora de `_authenticated`, sem nenhum guard, alcançáveis por qualquer visitante sem login pela URL | Remover rota/atalho preservando componente | **Executado** — movidas para dentro de `_authenticated` (herdam o guard de autenticação); componentes (`ClienteMockup`, `DeskMockup`, `StudioDevolutivas`) preservados sem alteração |
| 8 | Tela/rota que só repete Painel Hoje/Caso 360/Checklist/Alertas/Biblioteca | Manter como ação canônica | Nenhuma rota viva duplicada encontrada — já corrigido em 08/09/2026; nenhuma ação nova necessária |
| 9 | Componente de piloto/demo ainda alcançável pelo usuário real | Remover rota/atalho preservando componente | Coberto pelo item 7 (mesmos dois achados) |

## 6. Estado do Desk Vivo

- **Visão Geral (Painel Hoje):** acionável — próxima ação, alertas e indicadores usam fonte única confirmada nesta rodada; o único CTA morto encontrado (`/auditoria`) foi corrigido.
- **Caso 360:** campo por campo continua de fonte única — a única exceção viva encontrada (campos comerciais editáveis em dois lugares na Lista de Casos) foi corrigida nesta rodada.
- **Checklist:** não duplica gate — é leitura pura de uma função `STABLE`, sem estado que possa divergir.
- **Biblioteca Mestre/Alertas:** continuam sendo a origem, não um segundo CRM — nenhum writer novo de alerta/tarefa fora do padrão de dedup foi encontrado sem correção ao final desta rodada.

## 7. Fronteira Desk → App (Corte E)

- Nenhum vazamento de conteúdo interno (hipótese, risco, transcrição, parecer jurídico, URL/arquivo) para `app_projections.content_sanitized` foi encontrado nos dados — os dois writers já usam texto composto pelo staff, nunca copiado de campo interno.
- **Gap real encontrado e corrigido:** a checagem de conteúdo (`conteudoProjetavel`) só rodava no cliente (UI) e em teste — nunca no servidor. Uma chamada direta a `salvarProjecao`/`aprovarProjecao` (fora da tela) podia salvar e publicar conteúdo não sanitizado sem barreira nenhuma. Corrigido: as duas funções agora recusam no servidor.
- `client_deliverables` **não está morta** (correção de premissa de relatório anterior — ver seção 10) e não reapareceu como fonte concorrente de `app_projections`: são vias diferentes (entrega formal vs. achado sintetizado), mas a linha entre as duas não está documentada — decisão pendente #1.
- Home/Jornada/Legado do App Cliente: não foram expandidos nesta rodada (fora de escopo, conforme proibição da missão).

## 8. Testes técnicos, UI e reload

**Executado:**
- `npx tsc --noEmit` — limpo, sem erros, após ajuste de tipagem em `saas.functions.ts` e regeneração de `routeTree.gen.ts`.
- `npx vitest run --exclude '**/.claude/**'` — 180 arquivos, 1708 testes, todos passando (1 teste pré-existente ajustado: verificava `src/routes/mockup.tsx`, atualizado para `src/routes/_authenticated/mockup.tsx` após o guard de autenticação).
- `npx vite build` — build completo sem erros, rodado duas vezes (antes e depois do ajuste de teste) para confirmar que a regeneração da árvore de rotas não introduziu regressão.

**Pendente (não coberto nesta rodada, requer navegador real):**
- Verificação manual em navegador de que reabrir a tela `/tarefas` ou o modal de "Adicionar pendência" duas vezes não duplica registro (a proteção é a mesma já testada em `salvarTarefa`, mas não foi exercitada em UI real nesta rodada — só por leitura de código).
- Verificação visual de que a barra de ação do contrato ficou legível após a remoção dos 3 botões.

## 9. Commits, PRs, migrations, reversão

- **Migrations:** nenhuma nova migration nesta rodada — nenhuma alteração de schema foi necessária (Corte C confirmou que nenhuma correção de dado further era necessária além da já autorizada/executada na rodada anterior).
- **Commits nesta rodada** (branch `tmp/corte-a-e-limpeza-pre-perfil` a partir de `origin/main`, depois `main` e `recovery/operational-authority-all-areas-2026-09-05`):
  - Correção de sanitização server-side em `salvarProjecao`/`aprovarProjecao`.
  - Idempotência em `criarRegistro` (entidade `tarefas`) e `salvarPesquisa` (bloco `pendencias`).
  - Correção do link morto `/auditoria` → `/qualidade` no Painel Dia.
  - Remoção dos 3 botões de troca de aba disfarçados de ação em `contratos.$id.tsx`.
  - Remoção dos campos duplicados (`responsavel_principal`/`eixo_comercial`/`eixo_formalizacao`) do CRUD genérico de `casos.index.tsx`.
  - Proteção de `/mockup` e `/studio-devolutivas` com autenticação (movidas para `_authenticated`).
  - Aviso de cobertura parcial em `app-cliente-como-pessoa.tsx`.
  - Ajuste do diagnóstico de rotas (`equipe.diagnostico-rotas.tsx`) para refletir as mudanças acima.
  - Ajuste do teste pré-existente que verificava o caminho antigo de `mockup.tsx`.
- **Reversão:** qualquer item pode ser revertido individualmente por `git revert` do commit correspondente — nenhuma migration irreversível foi aplicada nesta rodada.

## 10. Decisões restantes da Proprietária (até 5)

1. **`client_deliverables` tem escritor ativo — a linha entre "microentrega" e "achado" precisa de decisão.** A auditoria desta rodada corrigiu a premissa de um relatório anterior: `criarMicroentregaCliente`/`transicionarMicroentrega` são reais e estão em uso na aba Jornada do caso. Isso não é um bug, mas cria duas vias paralelas para levar conteúdo ao cliente (microentrega formal vs. achado sanitizado via `app_projections`). Pergunta para a Proprietária: as duas vias devem continuar coexistindo com papéis diferentes (e, se sim, qual é a diferença de uso pretendida), ou uma deveria ser o único caminho?
2. **Tabelas técnicas em `governanca.catalogo-operacional-30.tsx` e `governanca.decisoes.tsx`** — classificadas como "recolher em Dados técnicos", mas não recolhidas nesta rodada por ser mudança de layout maior sem risco de dado. Autoriza tratar isso na mesma leva do trabalho de UX-UI que já vem a seguir, ou prefere uma correção isolada antes?
3. **Alerta `tipo="plano_acao_critico"`** aparece sendo lido em duas telas mas nenhum writer de aplicação foi encontrado — o insert provavelmente vem de trigger de banco não mapeado nesta rodada (fora do escopo dos 4 writers já auditados). Autoriza uma investigação específica desse alerta numa próxima rodada, já que hoje ele não representa risco de duplicação (só de origem não documentada)?
4. **`salvarPesquisa`/`criarRegistro`** agora reaproveitam tarefa existente em vez de duplicar, mas o retorno não sinaliza "reaproveitada" para a UI (ao contrário de `salvarTarefa`, que já tem esse retorno) — não foi corrigido nesta rodada por ser mudança de UI, não de dado. Deseja que a UI dessas duas telas também avise quando reaproveitar em vez de criar?
5. Confirmado: nenhum outro item bloqueia o início de Perfil 360 em Cards / UX-UI Pantone / Caso 360 simplificado — as decisões 1–4 acima são refinamentos, não bloqueios.
