# Mapa de Autoridade Admin — Desk e App Cliente

**Data:** 30 de agosto de 2026
**Projeto:** `tatianatosi/soul-ancestry`
**Pedido de origem:** "Prompt para Claude — Autoridade Admin, Mapa Desk e App Cliente", marcado como alta prioridade pela proprietária.

## Como este documento foi construído

Cada linha abaixo vem de leitura direta do código desta sessão — rota → componente → handler → server function → tabela/RPC — nunca de inferência sobre o que "provavelmente" existe. Onde a sessão não tinha esse rastreamento feito, a linha não aparece: a alternativa seria inventar uma classificação, o que o próprio pedido de origem proíbe explicitamente ("nunca chamar de bloqueio algo que seja apenas tela de leitura... não responder por inferência").

**Este é o primeiro corte, não o mapa inteiro.** Ele cobre as áreas em que esta sessão fez trabalho real e verificável hoje: Pessoas & Famílias (G-02), Caso 360, Contratos, Onboarding e Piloto Real. As áreas fora dessa lista — Comercial, Pesquisa, Marketing, Configuração, e as 8 telas do App Cliente — ainda não foram auditadas com este rigor e estão listadas na seção final como pendência explícita, não como "sem problema".

### Classificações usadas (idênticas às do pedido de origem)

`HABILITADA_E_VALIDADA` · `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` · `PARCIAL` · `BLOQUEADA_POR_REGRA_DE_ESTADO` · `ACAO_EXTERNA_NAO_IMPLEMENTADA` · `SOMENTE_LEITURA_DELIBERADA` · `SEM_UI_PARA_FUNCAO_EXISTENTE` · `SEM_FUNCAO_OU_SCHEMA` · `COM_ERRO_OU_RISCO_CONHECIDO`

Nenhum item abaixo usa `HABILITADA_E_VALIDADA` — essa classificação exige a proprietária ter confirmado salvar → reler → refresh no preview com o Supabase real, e isso ainda não aconteceu para nenhuma das PRs que criaram ou corrigiram estas capacidades hoje (#31, #32, #33). Onde o código está correto e testado (tsc/vitest/build) mas aguardando esse teste manual, a classificação é `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE`.

---

## Pessoas & Famílias — G-02 (ficha genealógica interna)

Rota: `/pessoas-linhagens/$caseId` · Componente: `pessoas-linhagens.$caseId.tsx` · Server: `pessoas-linhagens.functions.ts`

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Perfil 360° | `genealogical_person_profiles` | ✓ | ✓ | ✓ | ✓ | `criarPessoaComPerfil` / `salvarRegistroG02` / `arquivarRegistroG02` | `genealogical_person_profiles` | papel precisa estar em `PAPEIS_EDITA` (admin/operações/pesquisador) | sim | corrigido hoje (PR #32): confirma linha, relê por ID, compara campo a campo antes de dizer sucesso | sim — decisão criar tarefa / sem ação necessária, só nesta aba | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual: editar "Local de nascimento", refresh, reabrir |
| Variantes de nome | `name_variants` | ✓ | ✓ | ✓ | ✓ | `salvarRegistroG02` (genérica) | `name_variants` | mesmo papel de escrita | sim | mesmo padrão de releitura da função genérica, nunca testado manualmente nesta aba | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | replicar decisão de tarefa (hoje só existe no Perfil) |
| Relações | `genealogical_relationships` | ✓ | ✓ | ✓ | ✓ | `salvarRegistroG02` | `genealogical_relationships` | idem | sim | idem | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | idem |
| Eventos | `genealogical_events` | ✓ | ✓ | ✓ | ✓ | `salvarRegistroG02` | `genealogical_events` | idem | sim | idem | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | idem |
| Linhagens | `lineage_paths` | ✓ | ✓ | ✓ | ✓ | `salvarRegistroG02` | `lineage_paths` | idem | sim | idem | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | idem |
| 13 módulos históricos (residências, ofícios, militar etc.) | tabelas em `MODULOS_HISTORICOS` | ✓ | ✓ | ✓ | ✓ | `salvarRegistroG02` | 13 tabelas | idem | sim | idem | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | idem |
| Árvore / Timeline / Lacunas / Projeção ao cliente | derivado de perfis+relações+eventos | ✓ | — | — | — | funções puras (`montarArvore`, `montarTimeline`, `calcularLacunas`) | leitura das tabelas acima | — | sim | leitura sempre correta se a origem estiver correta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |

---

## Casos — Caso 360

Rota: `/casos/$caseId` · Componente: `casos.$caseId.index.tsx`

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ficha do caso (visão geral) | `crm_casos` | ✓ | — | ✓ | — | `atualizarRegistro`/`criarRegistro` (`saas.functions.ts`) | `crm_casos` | nenhum gate bloqueia edição de rascunho | sim | corrigida em sweep anterior desta sessão (padrão verificado) | parcial — próxima ação é campo do caso, não motor de tarefa | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Tarefas do caso (novo hoje) | `tarefas` | ✓ | ✓ | — | — | `listarFilaOps` / `salvarTarefa` (`ops.functions.ts`) | `tarefas` | nenhuma | sim, componente `TarefasDoCaso` novo (PR #32) | releitura via `listarFilaOps` após criar; nunca testado manualmente | sim — é a própria capacidade | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual + expandir concluir/reprogramar (hoje só cria e lista) |
| Ponte para contrato rascunho (novo hoje) | `contracts` | — | ✓ (find-or-create) | — | — | `abrirContratoDoCaso` (`contratos.functions.ts`) | `contracts` | não cria duplicata: reaproveita `contract_base` existente do mesmo `case_id` | sim, botão novo (PR #32) | find-or-create testado em código (tsc/vitest), não testado manualmente | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Onboarding (aba embutida) | `onboarding_planos`, `onboarding_checklist` | ✓ | não — sem botão de criar plano | ✓ (itens do checklist quando já existem) | — | `carregarPlanoOnboarding`/`atualizarItemOnboarding` | `onboarding_planos` | ver achado abaixo | sim, mas painel fica vazio ("Nenhum plano de onboarding preparado") quando não há linha | não aplicável quando vazio | não | `SEM_UI_PARA_FUNCAO_EXISTENTE` (falta criar plano) | ver seção "Achado: três sistemas de onboarding" |

### Achado: três sistemas de onboarding paralelos, nenhum integrado

Rastreamento desta sessão encontrou três modelos de dados e três conjuntos de server functions para "onboarding", nenhum ciente dos outros dois:

| Sistema | Tabelas | Server functions | Onde a UI vive | Cria tarefa? | Gate de início |
|---|---|---|---|---|---|
| A — Ativação com checks | `case_activation_checks` | `onboarding.functions.ts` (`obterOnboarding`, `ativarCasoComChecks`) | rota `/onboarding/$id`, linkada do Piloto Real e do Caso 360 | não | 14 requisitos obrigatórios, via RPC `case_activacao_bloqueios` |
| B — Checklist/plano por jornada | `onboarding_checklist`, `case_plans` | `onboarding-jornada.functions.ts` (`iniciarOnboarding`, `criarChecklistOnboarding`, `salvarPlanoCaso`) | **nenhuma** — `iniciarOnboarding` não é chamada por nenhum componente no repositório | não (a função em si não cria tarefas) | `podeIniciarOnboarding` exige **zero** gates pendentes, incluindo `contrato_assinado` e `pagamento_inicial` — viola diretamente a regra pedida de "não depender de contrato assinado/pagamento para iniciar onboarding interno" |
| C — Plano de onboarding (embutido em Caso 360) | `onboarding_planos` | `onboarding-plano.functions.ts` (`carregarPlanoOnboarding`, `recalcularPlanoOnboarding`) | painel `PainelPlanoOnboarding`, dentro da aba Onboarding do Caso 360 | não | `recalcularPlanoOnboarding` **exige que o plano já exista** — não há função de criação; se não existir linha, o painel só mostra texto vazio, sem botão |

**Classificação: `COM_ERRO_OU_RISCO_CONHECIDO`.** Os três sistemas escrevem em tabelas diferentes e nenhuma tela lê das três ao mesmo tempo — uma pessoa pode preencher o sistema B e nunca ver esse dado refletido no painel que a Ana veria em C. Escolher um para consolidar é decisão de arquitetura, não correção pontual: **não decidida ainda**, aguardando validação de Ana em #32/#33 primeiro, por instrução explícita da proprietária.

---

## Contratos

Rota: `/contratos/$id` · Componente: `contratos.$id.tsx` · Server: `contratos.functions.ts`

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Resumo | `contracts` | ✓ | — | ✓ | ✓ | `atualizarContrato`/`arquivarContrato` | `contracts` | financeiro/jurídico exigem papel específico por campo | sim; campo "Observações internas" adicionado hoje (existia na função, faltava na tela) | `gravarComVerificacao` já em uso — padrão correto desde antes desta sessão | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Partes | `contract_parties` | ✓ | ✓ | — (só arquivar; sem editar linha existente) | ✓ | `salvarItemContrato`/`arquivarItemContrato` | `contract_parties` | papel em `PAPEIS_FILHO.contract_parties` | sim; virou cards empilhados no mobile hoje (PR #32) | insert corrigido hoje (`inserirComVerificacao`, antes só checava `error`) | não | `PARCIAL` — falta editar parte existente | construir edição em linha (hoje é criar+arquivar, não editar) |
| Escopo / Cláusulas / Anexos | `contract_scope_items`/`contract_clause_overrides`/`contract_annexes` | ✓ | ✓ | — (idem Partes) | ✓ | `salvarItemContrato`/`arquivarItemContrato` | idem | idem | sim | mesma correção de insert de hoje | não | `PARCIAL` — mesma lacuna de edição em linha | idem |
| "Enviar ao cliente" | — | — | — | — | — | `tentarEtapaExterna` (ainda existe, só não é mais chamada pela UI) | — | sempre bloqueado, sem fluxo de convite real por trás | removido da barra principal hoje (PR #32) — não havia ação real, só um bloqueio sempre-igual | não aplicável | não aplicável | `ACAO_EXTERNA_NAO_IMPLEMENTADA` | correto como está: não simular fluxo que não existe |

**Conflito não resolvido:** a PR #28 (aberta antes desta sessão, ainda não mesclada) também reorganiza `contratos.$id.tsx` — move Versões/Revisão para "Dados técnicos" e adiciona uma barra de 5 ações no topo. A PR #32 desta sessão mexeu na mesma tela por outro ângulo (Partes em cards, campo Observações, remoção do botão de envio). As duas branches partem de bases diferentes (#28 de `main`, #32 de cima da #29) e não foram reconciliadas — **quem for mesclar primeiro precisa revisar a outra antes**, ou uma delas vai reverter o trabalho da outra silenciosamente.

---

## Piloto Real (Ana Luiza)

Rota: `/piloto-ana`

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pendências reais | `crm_casos`, `nucleo_membros`, `contracts`, `service_orders` | ✓ | — | — | — | `derivarPendenciasPiloto` (em `carregarPilotoAna`) | leitura de 4 tabelas | — | sim; substituiu hoje a lista fixa de 11 itens (PR #33) | leitura corrigida; teste automatizado prova que zera quando o caso está completo (não zerava antes) | tem campo `tarefaVinculada`, mas hoje sempre `null` — não há vínculo real ainda entre pendência e tarefa | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual no preview |
| Decisão do ID canônico | `crm_casos` | ✓ | — | ✓ | — | `definirIdCanonicoPiloto` | `crm_casos` | só aceita um dos IDs históricos preservados | sim | usa `gravarComVerificacao`, padrão correto desde antes | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |

---

## Painel Hoje

Rota: `/painel` → `painel.tsx` → `PainelDia` (`src/components/painel/painel-dia.tsx`, 992 linhas, orquestrador único da tela).

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Métricas de decisão (5 cards) + Abertura | derivado de leads/casos | ✓ | — | — | — | `painelHojeDesk` (`crm-desk.functions.ts`) + `cardsHoje`/`consolidarDia` (funções puras, `painel-dia.ts`) | `leads`, `crm_casos` (+ pendências de `cadeia-operacional.server`) | — | sim | leitura direta, sem gravação | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Caso em destaque | derivado dos mesmos itens | ✓ | — | — | — | `escolherCasoDestaque` (`painel-caso-destaque.ts`) | idem acima | — | sim | idem | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Jornada dos casos | `crm_casos` | ✓ | — | — | — | `painelCadencia` (`jornada-cliente.functions.ts`) | `crm_casos` | — | sim | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Minha fila priorizada | `leads`, `crm_casos`, `tarefas`, `opportunities` | ✓ | — | ✓ (oculto, sob "Ações rápidas da proprietária") | — | `corrigirFilaCanonica`/`registrarOverrideProprietaria` (`painel-hoje-acoes.functions.ts`) | `leads`/`crm_casos`/`opportunities`/`tarefas` (campo editado) + `owner_override_events` (auditoria) | só aparece se `ehPapelProprietaria(papel)` for verdadeiro — nenhum outro papel interno vê o formulário | sim, botão "Ações rápidas da proprietária" em cada linha | `corrigirFilaCanonica` faz `.update().select("id").maybeSingle()` e só confirma sucesso se a linha voltou — equivalente manual ao padrão `gravarComVerificacao`, mas sem chamar a função genérica | grava responsável/prazo/próxima ação por registro — ver Achado 1 | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual: editar responsável/prazo/próxima ação e conferir releitura |
| Exceções que exigem dono (+ filas de revisão jurídica/SLA embutidas) | `leads`, `crm_casos`, `contracts`, `v_ops_tarefas` | ✓ | — | mesma ação oculta acima | — | `excecoesQueExigemDono` + `panoramaChecklistJuridico` (`contratos.functions.ts`) + `alertasOps` (`ops.functions.ts`) | `contracts`, `v_ops_tarefas` (view) | — | sim | leitura direta nos blocos embutidos; escrita usa o mesmo caminho da linha acima | idem | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` (escrita) / `SOMENTE_LEITURA_DELIBERADA` (blocos embutidos) | idem |
| Comercial hoje (resumo) / Cadência / Encontrar no Desk / Sinais de atenção | derivado | ✓ | — | — | — | `comercialHoje`, `derivarCadenciaDoPainel`, `sinaisMarketing` e afins (funções puras) | leitura das filas já carregadas | — | sim | leitura direta; comentário no código confirma explicitamente "continuam somente leitura — não criam tarefa, prazo nem comunicação" | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |

### Achado 1: o que existe hoje não é o "próxima ação por caso, com responsável e prazo" pedido no prompt do Cockpit

A única escrita real do Painel Hoje é o formulário oculto "Ações rápidas da proprietária". Ele grava `responsável`/`prazo`/`próxima_ação` direto na entidade canônica, mas é estruturalmente diferente do motor pedido no Cockpit:
- Restrito ao papel proprietária/admin — não aparece para os demais papéis internos.
- É correção manual pontual por registro (um de cada vez), não um campo "próxima ação" editável por padrão em cada linha da fila. O que aparece por padrão em cada linha é o **motivo de a linha estar na fila** (rótulo fixo por tipo de fila), não uma próxima ação editável.
- Não existe entidade "tarefa" com ciclo de vida por trás dessa edição — é edição direta de coluna, sem histórico de conclusão.
- O botão irmão "Assumir pendência e avançar" só grava um evento em `owner_override_events` (auditoria); não altera o campo de bloqueio na tabela de origem — por desenho, "o gate nunca desaparece". A pendência continua igual na fila depois do clique.

Conclusão: existe uma correção auditada de campo, não o motor de próxima ação por caso/pessoa com responsável, prazo e motivo do Cockpit — que continua não implementado.

### Achado 2: componente órfão

`src/components/painel/botao-testar-cliente.tsx` não é importado por nenhuma rota do repositório — código morto, sem efeito na tela.

---

## Comercial

Rotas: `leads.tsx`, `propostas.tsx`, `clientes.tsx`, `conversao.tsx`, `financeiro.tsx`, `historico.fluxo-comercial-canonico.tsx`. Não existem rotas próprias de "discovery" ou "condições comerciais" — esses campos vivem dentro de `leads.tsx`/`crm-desk.functions.ts`.

**Painel de Calls (`/calls`, componente `painel-calls.tsx`):** segunda superfície sobre a mesma tabela `leads` e as mesmas funções `listarLeadsDesk`/`salvarLeadDesk` da linha abaixo — não é um sistema paralelo. Adiciona lógica pura de apoio (`src/lib/painel-calls.ts`): `estadoCall`, `bloqueiosRegistroCall`, `bloqueiosQualificacao`, `avaliarHandoffCall` (deriva `destino: proposta/nutrição/encerrar/indefinido` a partir de `discovery_resultado`, sem gravar evento próprio) e `filasCalls`/`resumoCalls` (filas recalculadas em memória sobre os mesmos leads relidos do banco, sem tabela de fila separada). O roteiro de perguntas (`discovery-roteiro.ts`) e o dicionário de campos/listas/regras (`dicionario-calls-crm.ts`, exposto em leitura na rota `/governanca/dicionario-calls-crm`) são referência/validação, não gravam nada. `VarreduraWhatsApp` (`varredura-whatsapp.tsx`) processa o dump colado localmente e não persiste — confirmado pelo próprio comentário do arquivo. Detalhamento completo em `docs/politicas/ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`.

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Leads | `leads` | ✓ | ✓ | ✓ | ✓ | `salvarLeadDesk`/`arquivarLeadDesk` (`crm-desk.functions.ts`) | `leads` | edição só bloqueada se já arquivado (esperado) | sim | usa `gravarComVerificacao` no update; **insert de lead novo é `.insert()` direto com checagem só de `error`, sem releitura de verificação** | campo `proxima_acao`/`proxima_acao_em` existe na entidade | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual + fechar lacuna de verificação no insert |
| Propostas | `proposals` | ✓ | ✓ | ✓ | ✓ (+ restaurar) | `salvarProposta`/`mudarStatusProposta`/`renovarValidadeProposta`/`criarVersaoAjusteProposta`/`restaurarProposta`/`arquivarComercial` (`comercial.functions.ts`) | `proposals` | `validarFluxo` trava transição de status inválida (máquina de estado, não bloqueio arbitrário) | sim | corrigido na PR #39 — todas as seis agora usam `gravarComVerificacao`/`inserirComVerificacao` (ver Achado 1) | não | edição/salvamento (`salvarProposta`, update): `HABILITADA_E_VALIDADA` — proprietária testou em preview em 31/08/2026 (editar proposta existente, salvar, F5, valor confirmado); demais capacidades (criação, mudança de status, renovação, versão de ajuste, restaurar): `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual das demais capacidades em preview |
| Clientes | `clientes` | ✓ | ✓ | — (ver Achado 3) | ✓ | `criarRegistro`/`arquivarRegistro` (`saas.functions.ts`); `ativarCliente`/`reclassificarPessoa` (`clientes.functions.ts`) | `clientes` | — | criar/arquivar/ativar/reclassificar têm UI; **editar campos gerais do cliente não tem UI nesta tela** | `ativarCliente`/`reclassificarPessoa` usam `gravarComVerificacao` | não | `SEM_UI_PARA_FUNCAO_EXISTENTE` (editar cliente) | ver Achado 3 |
| Financeiro (faturas, pagamentos, conciliação) | `invoices`, `payments`, `invoice_adjustments` | ✓ | ✓ | ✓ | ✓ | `salvarFatura`/`salvarPagamento`/`conciliarPagamento`/`registrarAjusteFatura`/`arquivarComercial` (`comercial.functions.ts`) | idem | fatura `paga` não edita `valor` direto — força passar por ajuste registrado | sim | corrigido na PR #39 — usa `gravarComVerificacao`/`inserirComVerificacao` (ver Achado 1) | não | edição/salvamento de fatura (`salvarFatura`, update): `HABILITADA_E_VALIDADA` — proprietária testou em preview em 31/08/2026 (editar fatura existente, salvar, F5, valor confirmado); demais capacidades (pagamento, conciliação, ajuste, criação): `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual das demais capacidades em preview |
| Ordens de serviço | `service_orders` | ✓ | ✓ | ✓ (`atualizarObservacaoOrdem`) | — | `criarOrdemServico`/`atualizarObservacaoOrdem`/`mudarStatusOrdem` (`comercial.functions.ts`) | `service_orders` | `validarFluxo` na mudança de status | sim | **estas duas usam `gravarComVerificacao`** — únicas do arquivo | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Conversão (funil/atribuição/marketing) | 7 tabelas em leitura agregada | ✓ | — | — | — | `carregarConversao` (`conversao.functions.ts`) | `conversion_events`, `marketing_investments`, `marketing_campaigns`, `lead_sources`, `attribution_records`, `leads`, `crm_casos` | — | sim | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Fluxo comercial canônico (histórico) | `contacts`, `opportunities` | ✓ | — | — | — | `FluxoComercialCanonico`/`PainelCanonicoCrm` | `contacts`, `opportunities` | — | sim, preservada em `/historico/fluxo-comercial-canonico` | o próprio código documenta 0 registros gravados — confirmado contra o banco | não aplicável | `SOMENTE_LEITURA_DELIBERADA` (deliberadamente arquivada — CRM real já é `/leads`) | nenhum |

### Achado 1: lacuna de verificação de gravação em Comercial e Financeiro

**Corrigido na PR #39 (`fix/p0-persistencia-comercial-financeiro`), ainda sem homologação manual em preview.** Registro original mantido abaixo para histórico.

De ~14 funções de escrita em `comercial.functions.ts`, só duas (`atualizarObservacaoOrdem`, `mudarStatusOrdem`) usavam `gravarComVerificacao`. `salvarProposta`, `mudarStatusProposta`, `renovarValidadeProposta`, `criarVersaoAjusteProposta`, `restaurarProposta`, `salvarFatura`, `salvarPagamento`, `conciliarPagamento`, `registrarAjusteFatura` e `arquivarComercial` seguiam o padrão antigo de `.update()`/`.insert()` checando só `error`, sem reler e confirmar a linha afetada — a mesma classe de risco já corrigida em Contratos nesta sessão. A PR #39 converteu todas as onze para `gravarComVerificacao`/`inserirComVerificacao`; a tabela acima ainda descreve o estado anterior à correção e deve ser tratada como registro histórico do achado, não como estado atual do código.

### Achado 2: PR #28 reverteria a correção de persistência já aplicada em Ordens de Serviço

Comparação direta (`git diff` desta branch contra `origin/frontend/contratos-tela-simplificada`) mostra que a PR #28 ainda tem uma versão anterior de `atualizarObservacaoOrdem`/`mudarStatusOrdem` **sem** `gravarComVerificacao`. Se essa PR for mesclada por cima sem revisão cuidadosa, reverte silenciosamente essa correção.

### Achado 3: Clientes sem UI de edição de campos gerais

`atualizarRegistro` (`saas.functions.ts`) já suporta a entidade `clientes` com campos reais (nome, e-mail, telefone, documento, origem, status…) e já faz releitura/verificação. Mas `clientes.tsx` nunca chama `atualizarRegistro` — não há botão "editar" para os campos gerais de um cliente já cadastrado.

---

## Pesquisa

Rotas: `pesquisa.$id.tsx`, `pesquisa.index.tsx`, `pesquisa-modulo.$id.tsx`, `pesquisa-modulo.index.tsx`, `pesquisa-evidencias.$caseId.tsx`, `achados.$caseId.tsx` — todas no mesmo grupo "Pesquisa" da navegação lateral.

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/pesquisa/$id` — Pessoas/Hipóteses/Evidências/Linha do tempo | `case_members`, `research_hypotheses`, `evidencias`, `research_events` | ✓ | ✓ | ✓ | ✓ | `salvarPesquisa`/`arquivarPesquisa` (`pesquisa.functions.ts`) | idem | sim | usa `gravarComVerificacao` | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| `/pesquisa/$id` — Tarefas (pendências) | `tarefas` | ✓ | ✓ | ✓ | ✓ | idem | `tarefas` | sim | idem | sim — único bloco com `prazo`/`prioridade` reais | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | idem |
| `/pesquisa/$id` — Relatório | derivado | ✓ | — | — | — | `gerarRelatorioPesquisa` (pura) | leitura dos blocos acima | sim | leitura direta; texto confirma "não é enviado ao cliente automaticamente" | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| `/pesquisa/$id` — Assistente IA | — | ✓ | — | — | — | rota de API `src/routes/api/pesquisa-assistente.ts` | leitura do dossiê | sim | não grava nada de volta | texto na tela cita "salvar rascunho" **mas não existe botão nem função que salve** | `SEM_UI_PARA_FUNCAO_EXISTENTE` | esclarecer o texto ou implementar o salvamento |
| `/pesquisa-modulo` — módulo completo (Sistema B) | `research_cases`, `research_evidence_items`, `research_pending_items`, `research_evidence_links`, `research_name_variants`, `research_reports` | ✓ | ✓ | ✓ | ✓ | `carregarPesquisaModulo`/`salvarBlocoPesquisa`/`resolverPendenciaPesquisa`/`criarTarefaDaPendencia`/`rodarScanPesquisa` (`pesquisa-modulo.functions.ts`) | idem | sim, tela própria completa | usa `gravarComVerificacao` | `criarTarefaDaPendencia` cria tarefa real vinculada | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| `/pesquisa-modulo` — Liberação de pesquisa externa | `research_cases` | — | — | ✓ (flag de gate) | — | `registrarLiberacaoExterna` | `research_cases.external_research_gate_status` + `research_audit_events` | sim | usa `gravarComVerificacao`; não dispara pesquisa externa real, só grava a decisão | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| `/pesquisa-evidencias/$caseId` (Sistema C) | `document_requests`, `evidences`, `research_people`, `research_sources` + tabelas do Sistema B | ✓ | ✓ | ✓ | ✓ | `salvarSolicitacaoDocumental`/`prepararAreaPesquisa`/`mudarEstadoEvidencia` | idem | sim | **nenhuma dessas usa `gravarComVerificacao`** | não verificado a fundo | `PARCIAL` | fechar lacuna de verificação; auditoria mais profunda |
| `/achados/$caseId` (G06) | `genealogical_findings`, `lineage_encounters` | ✓ | ✓ | ✓ | ✓ | `salvarAchado`/`salvarEncontro`/`arquivarRegistroG06` (`achados-genealogicos.functions.ts`) | idem | sim | usa `gravarComVerificacao` | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |

### Achado: pelo menos três sistemas de pesquisa/evidência paralelos, no mesmo grupo de navegação

| Sistema | Rota | Tabelas centrais |
|---|---|---|
| A — Ficha genealógica de pesquisa | `/pesquisa/$id` | `case_members`, `research_hypotheses`, `evidencias`, `research_events`, `tarefas` |
| B — Módulo de pesquisa e evidências | `/pesquisa-modulo/$id`, `/pesquisa-modulo` | `research_cases`, `research_evidence_items`, `research_pending_items`, `research_evidence_links`, `research_name_variants`, `research_reports` |
| C — Documentos, solicitações e cadeia | `/pesquisa-evidencias/$caseId` | `document_requests`, `evidences`, `research_people`, `research_sources` + parte das tabelas de B |

Existem três nomes de tabela para "evidência" no código — `evidencias` (A), `evidences` (C) e `research_evidence_items` (B) — não há um único modelo de evidência hoje. B e C compartilham `research_cases`/`research_pending_items`, sugerindo origem comum e divergência posterior; A é independente (usa `crm_casos.id` direto). Como no achado de onboarding já registrado, esta sessão não decide qual sistema é canônico, só registra a evidência de que os três existem e gravam em conjuntos de tabelas diferentes.

---

## Achado transversal: identidade de pessoa fragmentada em pelo menos 4 tabelas sem ID comum

Levantado a partir de um bloqueio real reportado pela proprietária em 30/08 (não conseguia atualizar CNPJ da contratante nem encontrar com facilidade a ficha de uma pessoa). Confirmado por leitura direta de código, não inferência:

| Tabela | Onde vive | Campo de nome | Referencia outra das 4? |
|---|---|---|---|
| `clientes` | Comercial (`clientes.tsx`) | `nome` | — |
| `nucleo_membros` | Núcleo familiar do caso (`nucleo-familiar.functions.ts`, `nucleos.tsx`) | `nome` | `cliente_id` opcional, só quando o membro também é cliente cadastrado |
| `genealogical_person_profiles` | Pessoas e Linhagens / G-02 (`pessoas-linhagens.functions.ts`) | campo próprio de nome | nenhuma — tabela não referencia `clientes` nem `nucleo_membros` |
| `contract_parties` | Partes do contrato (`contratos.functions.ts`) | `person_name` (texto livre) | `client_id` opcional; nenhuma referência a `nucleo_membros` ou `genealogical_person_profiles` |

Nenhuma das quatro tem uma coluna `person_id`/`pessoa_canonica_id` comum. Uma pessoa real pode ter até 4 registros de nome digitados separadamente, cada edição feita em um deles não aparece nos outros três.

**Bug concreto encontrado e corrigido nesta sessão, ligado a este achado:** a criação automática da parte "contratante" no instrumento (dentro de `enviarParaAssinatura`, `contrato-parametros.functions.ts`) gravava `role: "contratante"` — valor fora da constraint `CHECK` da coluna `role` de `contract_parties` (só aceita `'contracting_client'` entre os valores válidos). O insert falhava silenciosamente, porque o resultado nunca era checado: o contrato era criado, mas a parte contratante nunca existia — por isso o CNPJ "nunca aparecia em lugar nenhum". Corrigido nesta sessão (`role` ajustada + erro agora lançado), mais uma função `ressincronizarContratanteDaMatriz` que permite puxar de novo nome/documento/endereço da matriz de Parâmetros para dentro do contrato sob demanda — porque essa cópia, mesmo corrigida, só acontece automaticamente uma vez, na criação do instrumento.

**Classificação: `COM_ERRO_OU_RISCO_CONHECIDO`.** A correção pontual do bug de constraint foi feita. A fragmentação estrutural de identidade **não foi corrigida nem decidida** — é exatamente o problema que o documento `docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` (já arquivado, prioridade confirmada pela proprietária em 30/08) resolve via `case_participants` com `person_id` único. Início da Fase 1 desse documento depende de acesso ao Supabase real desta sessão, pendente de autorização da proprietária no momento em que esta seção foi escrita.

---

## Marketing

Rota: `/marketing` · Componente: `marketing.tsx` · Lê de `carregarConversao` (`conversao.functions.ts`, já documentada na seção Comercial) e processa tudo em funções puras client-side (`marketing-aquisicao.ts`, `marketing-filtros-csv.ts` — confirmado por grep: nenhuma das duas chama `.insert(`, `.update(` ou `createServerFn` de método POST). A própria tela declara: "Somente leitura — nenhuma campanha, link ou envio é executado aqui."

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Indicadores / Visão geral / Canais e campanhas / Atribuição / Funil / Aprendizados | `leads`, `crm_casos`, `conversion_events`, `marketing_campaigns`, `marketing_investments`, `lead_sources`, `attribution_records` | ✓ | — | — | — | `carregarConversao` + funções puras de `marketing-aquisicao.ts`/`marketing-filtros-csv.ts` | leitura agregada de 7 tabelas | — | sim | leitura direta; nenhuma gravação em todo o arquivo | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Exportar CSV de indicadores | derivado | ✓ | — | — | — | `baixarCsvMarketing` (gera arquivo local no navegador) | leitura acima | — | sim | não persiste nada — arquivo local | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Biblioteca de Mensagens — Modelos (`message_templates`) | `message_templates` | ✓ | função existe, sem botão na tela | função existe, sem botão na tela | ✓ (via mudança de status) | `salvarTemplate` (`message-library.functions.ts`) — edita corpo/assunto/variáveis, usa `gravarComVerificacao` | `message_templates` | arquivar exige motivo ≥5 caracteres; substituir exige sucessor | `biblioteca-mensagens.tsx` importa `definirStatusTemplate` mas **nunca importa `salvarTemplate`** (confirmado por grep no repositório inteiro) | função pronta, nunca chamada por nenhuma tela | não | `SEM_UI_PARA_FUNCAO_EXISTENTE` (criar/editar texto do modelo) | ligar `salvarTemplate` a um formulário real |
| Biblioteca de Mensagens — Ciclo de vigência (status) | `message_templates.status` | ✓ | — | ✓ | ✓ | `definirStatusTemplate` | `message_templates` | só admin muda para vigente/suspenso/substituído/arquivado | sim, botões "Marcar como…"/"Arquivar modelo" | usa `gravarComVerificacao` | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Biblioteca de Mensagens — Uso manual (copiar e registrar) | `message_template_usage` | ✓ | ✓ (log de uso, nunca envia) | — | — | `validarUsoTemplate` (RPC) / `registrarUsoTemplate` | `message_template_usage` | gates de etapa validados no banco | sim | insert simples com checagem de erro | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Conteúdos editoriais | `editorial_content_items` | ✓ | — | — | — | `listarBibliotecaMensagens` | `editorial_content_items` | — | sim, só lista | leitura direta; nenhuma função de criar/editar/publicar pauta existe | não | `SEM_UI_PARA_FUNCAO_EXISTENTE` (nem função server, não só UI) | decidir se cabe a este módulo |

### Achado: requisito P8 do Prompt Mestre (edição real de texto na Biblioteca de Mensagens) não está cumprido na tela, apesar de estar pronto na função

`salvarTemplate` já suporta edição real do corpo/assunto/variáveis do modelo, grava com `gravarComVerificacao` e valida contra termos vetados. Mas `biblioteca-mensagens.tsx` nunca a importa — a única ação editorial exposta hoje é o toggle de status. Ou seja: **hoje só é possível mudar o estado do modelo, nunca o texto** — o requisito P8 ("edição real de texto, não apenas toggle de status") não está atendido na interface, mesmo com a capacidade pronta uma camada abaixo.

---

## Configuração

Rotas: `configuracoes.tsx`, `equipe.tsx`, `integracoes.tsx`, `catalogo.tsx`, `divergencias-catalogo.tsx`, `conciliacao-catalogo.tsx`, `governanca.catalogo-operacional-30.tsx`, `contrato-parametros.$id.tsx`/`.index.tsx`.

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Perfil institucional (razão social/CNPJ/endereço da contratada) | constante `PERFIL_INSTITUCIONAL` | ✓ | não | não | não | leitura direta da constante (`contrato-base-consolidado.ts`) | nenhuma — hardcoded no código | — | `configuracoes.tsx` **não expõe** este perfil — é a tela "Usuários e papéis" | não aplicável — não há UI | não aplicável | `SEM_FUNCAO_OU_SCHEMA` (para edição via UI) | ver achado abaixo |
| Usuários e papéis (`/configuracoes`) | `user_roles`, `organization_members` | ✓ | ✓ (concede papel) | — | ✓ (remove papel, soft) | `definirPapel`/`listarUsuarios` (`saas.functions.ts`) | `user_roles` | — | sim | checa `error`, trata duplicata, grava `audit_logs`; não usa `gravarComVerificacao` explicitamente | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Equipe (`/equipe`) | `staff_access` | ✓ | ✓ (convite) | ✓ (papel, status) | ✓ (com motivo) | `convidarMembroEquipe`/`alterarPapelMembro`/`alterarStatusMembro`/`arquivarMembroEquipe` (`equipe.functions.ts`) | `staff_access` | admin não suspende/revoga/arquiva o próprio acesso; toda mudança audita | sim — convite, papel, suspender/reativar, revogar, arquivar, todos com motivo | checa erro e linha manualmente (mesmo princípio de `gravarComVerificacao`, não o helper) | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Catálogo comercial (`/catalogo`) | catálogo importado da planilha mestre | ✓ | — | — | — | `lerCatalogoImportado` | leitura de tabelas do catálogo | — | sim | leitura direta; texto: "Nada é recriado, reprecificado ou homologado novamente aqui" | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Divergências de catálogo (`/divergencias-catalogo`) | `catalog_source_divergences` | ✓ | — | ✓ (só observação de resolução) | — | `anotarResolucaoDivergencia` (`divergencias-catalogo.server.ts`) | `catalog_source_divergences` | não aprova/corrige/desbloqueia — só anota | sim | update checa linha afetada — mesmo padrão do PR #31 já registrado | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Conciliação de catálogo (`/conciliacao-catalogo`) | propostas × catálogo homologado | ✓ | — | — | — | `varreduraConciliacaoCatalogo` | leitura agregada | — | sim | leitura direta; texto: "nada é aprovado, corrigido ou enviado aqui" | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Catálogo Operacional 30 / Governança | dados hardcoded em `ca06-catalogo-operacional.ts` | ✓ | — | — | — | nenhuma — client-side sobre constantes | nenhuma tabela | — | sim | não há chamada a servidor | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Integrações (`/integracoes`) | `integrations`, `integration_runs`, `integration_review_queue` | ✓ | — | ✓ (responsável, mapa de campos, retry) | — (pausa, não arquiva) | `salvarIntegracao`/`alterarSituacaoIntegracao`/`ativarIntegracao`/`resolverRevisaoIntegracao` | `integrations` | ativar exige admin + digitar "ATIVAR" + campos obrigatórios + responsável | sim, painel completo | usa `gravarComVerificacao` em todas as gravações | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | ver achado abaixo |
| Integrações — teste/execução | `integration_runs`, `leads` (só demo) | ✓ | ✓ (roda demo) | — | — | `testarIntegracao`/`executarDemoFormLead` | `integration_runs` | comentário no código: "Nenhuma função aqui faz chamada externa" | sim | insert simples com checagem de erro | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Parâmetros contratuais por caso (`/contrato-parametros/$id`) | `contract_case_parameters` | ✓ | ✓ (`garantirParametros`) | ✓ | — | `salvarParametro`/`definirStatusParametro` | tabela de parâmetros do contrato | — | sim | usa `gravarComVerificacao` | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual — é motor por caso, sobreposto conceitualmente à seção Contratos, não configuração global |

### Achado: perfil institucional segue hardcoded, e agora tem uma camada de "persistência" paralela órfã, nunca chamada por nenhuma tela

Confirma e estende o achado do CNPJ institucional já registrado nesta sessão: `configuracoes.tsx` não é a tela de perfil institucional — é "Usuários e papéis" sobre `user_roles`, sem campo de razão social/CNPJ/endereço. O CNPJ/razão social continua vindo só da constante `PERFIL_INSTITUCIONAL`, sem UI de edição em lugar nenhum.

Esta auditoria encontrou uma camada de persistência versionada que **não existia** no corte anterior do Mapa: `perfil-institucional-persistido.ts`/`.server.ts`/`.functions.ts`, com tabela real `institutional_profiles` (confirmada em produção com 0 linhas na consulta real do Supabase feita nesta sessão) e `institutional_profile_events` para snapshot. Confirmado por grep: nenhuma rota ou componente importa `lerPerfilInstitucionalPersistido`, `registrarPerfilInstitucional` ou `registrarSnapshotInstitucional` — código órfão, nunca invocado. Mesmo se fosse ligado a uma tela, `montarPayloadInstitucional` lê os campos direto da mesma constante hardcoded — versionaria o mesmo texto fixo, não abriria edição real vinda de input do usuário. **Classificação: `SEM_FUNCAO_OU_SCHEMA`** para o objetivo real (deixar a proprietária editar CNPJ/razão social pela interface).

### Achado: dois sistemas paralelos de "Usuários e papéis", mesmo título, tabelas diferentes

`/configuracoes` (`user_roles`) e `/equipe` (`staff_access`) são duas telas distintas, **ambas literalmente tituladas "Usuários e papéis"**, gerenciando conceitos sobrepostos em tabelas diferentes, sem referência cruzada entre si. `/equipe` parece ser a autorização real de login (`confirmarSessaoEquipe` valida contra `staff_access`); `/configuracoes` parece remanescente, só concede/remove `role` em `user_roles`, sem controlar login. Mesmo padrão de fragmentação já visto em onboarding (3 sistemas) e pesquisa (3 sistemas) — não decidido aqui, só registrado.

### Achado: Integrações confirma o esperado pelo Prompt Mestre P10 — nenhuma conexão externa real ainda existe

Comentário no código: "Nenhuma função aqui faz chamada externa. Testes rodam com dados DEMO." A tela tem fluxo completo e funcional, mas "ativar" só grava `status: "ativa"` — não existe client OAuth, chave de API real ou chamada HTTP de saída em nenhuma função lida. Alinhado ao P10: simulação completa e deliberada, não lacuna escondida.

---

## App Cliente

Rotas no Desk: `app-cliente-demo.tsx` (sessão demo), `app-cliente-como-pessoa.tsx` (acesso master), `acessos-portal.tsx` (administração de convites). App real: diretório `src/routes/portal/` — mais telas do que as 7 nomeadas originalmente: `index.tsx` (Home), `jornada.tsx`, `radar.tsx`, `arvore.tsx`, `documentos.tsx`, `legado.tsx`, `conta.tsx` — as 7 pedidas — **mais** `entregas.tsx`, `fase-01.tsx`, `fase-02.tsx`, `faturas.tsx`, `casos.$id.tsx`, `mensagens.$id.tsx`, `proposta.tsx`.

**Achado positivo confirmado por schema:** `portal_casos` é uma **VIEW** direta sobre `crm_casos` (`create view public.portal_casos ... from public.crm_casos c where archived_at is null and portal_caso_permitido(id)`), não tabela duplicada. `portal_document_requests`/`portal_tickets`/`documents` carregam FK para `crm_casos(id)`. A regra de "nunca duplicar dado de caso" está respeitada estruturalmente — é projeção/view da mesma linha canônica.

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home (`/portal/`) | `portal_casos` (view) | ✓ | — | — | — | `meusCasos` | view `portal_casos` + `portal_document_requests` | RLS via `portal_caso_permitido` | sim | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Meu caso (`/portal/casos/$id`) | `crm_casos` + `documents` + `portal_document_requests` + `portal_tickets` | ✓ | ✓ (upload real, abrir ticket) | — | — | `meuCaso`/`prepararEnvioDocumento`+`confirmarEnvioDocumento`/`abrirTicket` | `documents`, `portal_document_requests`, `portal_tickets` | upload exige caso autorizado; documento entra sempre `pendente_de_revisao` | sim — upload real de arquivo | insert em `documents` checa erro; update em `portal_document_requests` checa linha afetada | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Jornada / Radar / Árvore | projeções do caso | ✓ | — | — | — | `usePortalVivo` (mesma fonte do "ver como" do Desk) | `portal_projecoes` | — | sim (3 telas) | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Documentos (`/portal/documentos`) | `documents` | ✓ | — | — | — | `minhasEntregas`/`baixarEntrega` (URL assinada 120s, auditado) | `documents` | download só se `liberado_cliente === true` | sim | leitura direta + `audit_logs` no download | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` (download) | prova manual |
| Faturas / Proposta | faturas/proposta do cliente | ✓ | — | — | — | `minhasFaturas`/`portalProposta` | `invoices`/`proposals` | nível de acesso `proposal_portal` | sim | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Mensagens/ticket (`/portal/mensagens/$id`) | `portal_tickets`, `portal_ticket_messages` | ✓ | ✓ (responder) | — | — | `meuTicket`/`responderTicketCliente` | `portal_ticket_messages` | — | sim | insert simples checando erro; dispara alerta interno | não aplicável | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Legado / Entregas da Jornada / Fase 01 / Fase 02 | — | — | — | — | — | nenhuma — `useVisibilidade(<tela>)` só checa gate de fase contratada | nenhuma | — | sim, mas texto fixo sempre igual ("Nenhum … publicado") | não há query de conteúdo em nenhum dos 4 arquivos | não aplicável | `SEM_FUNCAO_OU_SCHEMA` (as 4) | ver achado abaixo |
| Conta (`/portal/conta`) | dados do cliente | ✓ | — | não — sem autoedição | — | `usePortal()` | dados do cliente autenticado | — | sim, só exibe nome + links | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Acessos ao portal (`/acessos-portal`, Desk) | `client_portal_access`, `client_portal_case_access` | ✓ | ✓ (autorizar e-mail, convite) | ✓ (suspender/reativar/revogar, liberar/bloquear caso) | ✓ (revogar) | `registrarEmailAutorizado`/`criarConvitePortal`/`alterarStatusAcessoPortal`/`definirCasoDoAcesso`/`definirLiberacaoCaso` (`portal.functions.ts`) | `client_portal_access`, `client_portal_case_access` | login só por link mágico único (24h, reenvio 20min) | sim, painel completo | mistura `gravarComVerificacao` (3 ocorrências) e updates manuais não uniformemente verificados | não | `PARCIAL` | fechar lacuna de verificação, como já feito em Contratos/Divergências |
| "Ver como" cliente/família (`/app-cliente-como-pessoa`, Desk) | mesma projeção sanitizada do cliente | ✓ | — | — | — | `dadosVivosDoPortalComoAdmin` | `portal_projecoes.content_sanitized` + `documents` | acesso por papel de staff, não sessão de cliente | sim — **só 3 das 10+ telas reais**: Jornada, Árvore, Radar | leitura direta | comentário no código admite a lacuna | `PARCIAL` | ver achado abaixo |

### Achado: "ver como cliente/família sem logout" está parcialmente implementado, não integralmente

`app-cliente-como-pessoa.tsx` implementa exatamente o mecanismo pedido pela Política Unificada — visão real, autorizada por papel de staff, sem logout, somente leitura por desenho. Mas o próprio comentário no código documenta a lacuna: cobre hoje só Jornada/Árvore/Radar, porque só essas exportam componente reutilizável fora da própria rota. Faltam Documentos, Entregas, Fase 01/02, Legado, Conta e Faturas — a proprietária não consegue hoje abrir o upload de documento, o ticket ou a fatura de um cliente por este mecanismo. **Classificação: `PARCIAL`** — mecanismo correto, cobertura incompleta.

### Achado: 4 telas do App Cliente são stubs estáticos, nunca buscam dado real

`legado.tsx`, `entregas.tsx`, `fase-01.tsx` e `fase-02.tsx` só checam se a tela deveria estar visível (gate de fase contratada), mas nunca buscam conteúdo — nenhum `useQuery`/`useServerFn` de dado nesses 4 arquivos. O texto fixo aparece sempre, mesmo que existisse publicação real em alguma tabela — não há código para lê-la. "Entregas da Jornada" é redundante em conceito com "Documentos" (que já lê entregas reais). Reforça o padrão de telas paralelas/fragmentadas já visto em Configuração e no restante do Mapa.

---

## Mapa completo — cobertura final

Com esta fatia, todas as áreas do pedido original (8 grupos do Desk + App Cliente) têm pelo menos um corte de evidência real: Pessoas & Famílias, Caso 360, Contratos, Piloto Real, Painel Hoje, Comercial, Pesquisa, Marketing, Configuração e App Cliente. Isso não significa auditoria exaustiva de cada função — os itens abaixo em "Ainda não auditado" continuam reais — significa que nenhuma área ficou sem nenhuma linha de evidência.

## Ainda não auditado nesta rodada

Sem evidência real levantada — não classificar por inferência:

- Auditoria linha-a-linha de `pesquisa-cadeia.functions.ts`/`documentos-solicitacoes.functions.ts` (Sistema C de Pesquisa) — confirmada ausência de `gravarComVerificacao`, gates/papéis não rastreados função a função
- Handler da rota de API `src/routes/api/pesquisa-assistente.ts` em si (só o componente cliente foi lido)
- `matriz-modelos-contratuais.ts`/`matriz-clausulas.ts`/`governanca.contrato-base.tsx` (Modelos contratuais) — identificados, conteúdo não lido linha a linha
- "Dados técnicos" e "Qualidade" nomeados no pedido original de Configuração — nenhuma rota dedicada com esse nome localizada; pode estar disperso em `governanca.*` ou não existir como área própria — não afirmado nenhum dos dois sem checar
- `portal.functions.ts` — padrão de persistência não contado função a função (mistura confirmada de `gravarComVerificacao` e updates manuais)
- `usePortalVivo`/função server por trás dela — não lida linha a linha
- Catálogo completo de conectores de Integrações (`CATEGORIAS_INTEGRACAO`, `CAMPOS_DESTINO`) — confirmado que nenhuma chamada externa existe, mas conectores individuais não enumerados
- RLS/policies por trás de `portal_caso_permitido`/`portal_minha_org`/`portal_meu_cliente` — só os nomes vistos via grep no SQL de migração, não lidas por completo

## Próximo passo deste documento

Prioridade combinada com a proprietária em 30/08: Configuração/App Cliente/Marketing ficam para depois da política unificada de casos, já que a fragmentação de identidade encontrada nesta rodada torna qualquer auditoria dessas áreas prematura sem antes saber qual vai ser a fonte canônica de pessoa. Próxima atualização deste documento vem junto com a Fase 1 (mapear sem modificar) da política unificada, assim que o acesso ao Supabase estiver liberado.

---

## Atualização 2026-09-01 — pedido direto da proprietária: "ainda há lugares e bugs onde não persiste minha autoridade?"

Resposta curta: sim, achado um padrão novo (abaixo), além dos três bugs concretos já corrigidos nesta rodada. Nenhum item aqui foi testado manualmente em preview ainda — classificação segue a mesma regra do resto do documento (`HABILITADA_EM_CODIGO_AGUARDANDO_TESTE`, nunca `HABILITADA_E_VALIDADA`, até a proprietária confirmar).

### Três bugs de "não persiste" corrigidos hoje (PR #44, ainda não mesclada)

| Onde | O que quebrava | Correção |
|---|---|---|
| Documentos → Consentimento (`registrarConsentimento`) | Gravava `status: "ativo"`, valor fora do `CHECK` real (`pendente/coletado/revogado/expirado`) — a gravação falhava ou ficava em estado impossível de ler depois | Passa a gravar `status: "coletado"` |
| Pesquisa → bloco "pedidos" (`salvarBlocoPesquisa`) | `requested_document_type` é `NOT NULL` no banco, mas a tela deixava criar pedido sem tipo — quebrava no insert sem mensagem clara | Valida antes de gravar, na criação e quando o campo é explicitamente limpo numa edição |
| Contratos → Resumo, "Responsável pela revisão" | Campo de texto livre gravando direto em `review_owner_user_id` (UUID) — qualquer nome digitado por uma pessoa quebrava a gravação | Virou seletor com a equipe real (`listarEquipe`) |

### Achado novo: mesmo padrão do "lead novo sem verificação" (já registrado no Mapa) se repete em mais 3 tabelas

O Mapa já registrava que `salvarLeadDesk`/criação de lead grava com `.insert()` simples, sem a releitura de confirmação que `gravarComVerificacao` faz. Rastreando o mesmo padrão em `crm-desk.functions.ts` hoje, encontrei o idêntico em mais três pontos — todos usam `gravarComVerificacao` corretamente **na edição**, mas caem para `.insert()` cru **na criação**:

| Função | Tabela | Linha | Update usa o padrão seguro? | Create usa o padrão seguro? |
|---|---|---|---|---|
| `salvarDependenteCaso` | `case_dependents` | crm-desk.functions.ts:302 | sim (`gravarComVerificacao`) | não — só checa `error`, não relê a linha criada |
| `salvarTemaMatrizJuridica` | `legal_clause_matrix` | crm-desk.functions.ts:396 | sim | não — mesma lacuna |
| `salvarPaginaCanva` | `proposal_canva_pages` | crm-desk.functions.ts:475 | sim | não — mesma lacuna |
| criação de lead (fluxo de detecção de duplicidade) | `leads` | crm-desk.functions.ts:700 | — (é sempre criação) | parcial — usa `.select("*").maybeSingle()` após o insert, então pelo menos confirma que uma linha voltou com os dados, mas não é o helper padrão |

**Por que isto importa agora, especificamente:** `proposal_canva_pages` é a tabela que a Proposta real do Caso 360 (item 2 do pedido de hoje, PR #44) passou a depender para decidir se mostra a seção de proposta. Se uma extração de página nova falhar silenciosamente no insert (sem lançar erro real, só um `error` mal formado que passa despercebido), a Completude Canva mostrada no Caso 360 fica desatualizada sem aviso.

**Classificação: `COM_ERRO_OU_RISCO_CONHECIDO`** para os 3 pontos de criação sem releitura (`case_dependents`, `legal_clause_matrix`, `proposal_canva_pages`); risco menor, mas ainda `PARCIAL`, para a criação de lead com `.select()`.

**Não corrigido neste commit** — fora do escopo do pedido de hoje (que era os 3 bugs já mapeados + aposentar o campo livre de proposta), fica registrado aqui para decisão: aplicar `inserirComVerificacao` nos 3 pontos de criação é uma correção pequena e mecânica, mesmo padrão já usado em outras 15+ funções nesta sessão — posso fazer como próximo passo se a proprietária confirmar.

### Itens já conhecidos que continuam sem persistência real de autoridade (não novos, só reconfirmados nesta revisão)

- Sistema C de Pesquisa (`pesquisa-cadeia.functions.ts`, `documentos-solicitacoes.functions.ts`) — 0 usos de `gravarComVerificacao`/`inserirComVerificacao` em ambos os arquivos, confirmado de novo hoje.
- `portal.functions.ts` — mistura confirmada de novo: 4 usos do padrão seguro contra 12 chamadas `.insert()`/`.update()` no total.
- Biblioteca de Mensagens: `salvarTemplate` pronta e segura, mas `biblioteca-mensagens.tsx` continua sem importá-la — só o toggle de status é gravável pela tela.
- Clientes: segue sem UI de edição dos campos gerais (nome, e-mail, telefone, documento) apesar de `atualizarRegistro` já suportar a entidade com verificação.

### Atualizações de status desde 30/08

- PR #39 (11 funções de Comercial/Financeiro convertidas para `gravarComVerificacao`/`inserirComVerificacao`) foi mesclada hoje — o Achado 1 da seção Comercial deixa de ser "corrigido, aguardando merge" e passa a "corrigido, aguardando teste manual em preview".
- Caso 360 → "Proposta (referência interna)": os seis campos de texto livre (`proposta_referencia_interna` e demais) foram aposentados desta tela (PR #44) — a seção agora só aparece quando existe proposta Canva real vinculada ao cliente, em modo somente leitura. `leads.tsx` mantém um campo equivalente (`proposta_link_interno`) no fluxo de lead, ainda não decidido.
- Leads: `listarLeadsDesk` não filtrava `archived_at` — leads arquivados como demo continuavam na lista principal, sem forma de ocultá-los (PR #47). Corrigido com o mesmo padrão `incluirArquivados` já usado no resto do repositório.
- Varredura de WhatsApp: passa a permitir usar o sinal normalizado de um achado (nunca o trecho da conversa) no rascunho do lead, por clique explícito (PR #48) — atende ao pedido da proprietária de 02/09 de aproveitar os sinais já extraídos sem persistir dado pessoal de terceiro.

### Atualização 2026-09-02 — dois pontos levantados pela proprietária, com decisão registrada

**Acesso master ao App Cliente (`/app-cliente-como-pessoa`) segue cobrindo só 3 de 10 telas.** A proprietária relatou ficar bloqueada pelo fluxo de magic link (que exige e-mail do cliente) ao tentar abrir o acesso agora. Confirmado por código: o acesso master (sem magic link, papel de staff) só cobre Jornada/Árvore/Radar porque só essas telas já buscam dado através de uma fonte trocável (`FontePortalProvider`/`usePortalVivo`) em vez de direto da sessão do cliente logado. Documentos (`minhasEntregas`), Conta e Faturas continuam presas à sessão do cliente — por isso, para vê-las hoje, só resta o convite/magic link real. **Decisão da proprietária: não estender agora — fica para quando a aba cliente do Desk for tratada como frente própria**, junto com os cards de visão do cliente como um todo (já combinado anteriormente). Classificação: `PARCIAL`, sem mudança de escopo por enquanto.

**Visão de uso do App Cliente ("o que o cliente mais gosta") não existe.** Confirmado: nenhuma tabela ou evento registra visualização de tela, tempo de permanência ou interação do cliente dentro do App Cliente hoje — nenhuma pergunta a mais era necessária para confirmar isso, é ausência total de instrumentação. Consistente com a regra já registrada no pacote de redesenho ("indicadores de uso apenas se eventos reais existirem"): não dá para mostrar isso sem antes decidir o que rastrear. **Decisão da proprietária: registrar como pendência de especificação** — um documento próprio, propondo o que rastrear (visualização de tela, tempo, cliques em achados/documentos) para aprovação antes de qualquer schema novo, ainda não escrito. Classificação: `SEM_FUNCAO_OU_SCHEMA`.

**Esclarecimento correlato, não é achado novo:** as abas "Entrega/Fase 01/Fase 02" vistas na versão auditoria do mockup (46 telas) não são telas novas do App Cliente — são estados liberados condicionalmente pela proprietária via Desk, só após onboarding e cliente ativo. Não conflitam com a Taxonomia Canônica de 7 telas. Detalhe completo em `docs/prompts/PACOTE-REDESENHO-UNIFICADO-DESK-APP-PESSOAS-FAMILIAS-2026-08-31.md`.
