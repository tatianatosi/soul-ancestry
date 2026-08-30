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

| Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Função | Tabela | Regra de estado | UI existe | Persistência confirmada | Tarefa/próxima ação | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Leads | `leads` | ✓ | ✓ | ✓ | ✓ | `salvarLeadDesk`/`arquivarLeadDesk` (`crm-desk.functions.ts`) | `leads` | edição só bloqueada se já arquivado (esperado) | sim | usa `gravarComVerificacao` — padrão correto | campo `proxima_acao`/`proxima_acao_em` existe na entidade | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Propostas | `proposals` | ✓ | ✓ | ✓ | ✓ (+ restaurar) | `salvarProposta`/`mudarStatusProposta`/`renovarValidadeProposta`/`criarVersaoAjusteProposta`/`restaurarProposta`/`arquivarComercial` (`comercial.functions.ts`) | `proposals` | `validarFluxo` trava transição de status inválida (máquina de estado, não bloqueio arbitrário) | sim | ver Achado 1 abaixo — **nenhuma dessas funções usa `gravarComVerificacao`** | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` (função ligada à UI); risco de persistência no Achado 1 | prova manual + fechar lacuna de verificação |
| Clientes | `clientes` | ✓ | ✓ | — (ver Achado 3) | ✓ | `criarRegistro`/`arquivarRegistro` (`saas.functions.ts`); `ativarCliente`/`reclassificarPessoa` (`clientes.functions.ts`) | `clientes` | — | criar/arquivar/ativar/reclassificar têm UI; **editar campos gerais do cliente não tem UI nesta tela** | `ativarCliente`/`reclassificarPessoa` usam `gravarComVerificacao` | não | `SEM_UI_PARA_FUNCAO_EXISTENTE` (editar cliente) | ver Achado 3 |
| Financeiro (faturas, pagamentos, conciliação) | `invoices`, `payments`, `invoice_adjustments` | ✓ | ✓ | ✓ | ✓ | `salvarFatura`/`salvarPagamento`/`conciliarPagamento`/`registrarAjusteFatura`/`arquivarComercial` (`comercial.functions.ts`) | idem | fatura `paga` não edita `valor` direto — força passar por ajuste registrado | sim | mesmo padrão não verificado do Achado 1 | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual + fechar lacuna de verificação |
| Ordens de serviço | `service_orders` | ✓ | ✓ | ✓ (`atualizarObservacaoOrdem`) | — | `criarOrdemServico`/`atualizarObservacaoOrdem`/`mudarStatusOrdem` (`comercial.functions.ts`) | `service_orders` | `validarFluxo` na mudança de status | sim | **estas duas usam `gravarComVerificacao`** — únicas do arquivo | não | `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | prova manual |
| Conversão (funil/atribuição/marketing) | 7 tabelas em leitura agregada | ✓ | — | — | — | `carregarConversao` (`conversao.functions.ts`) | `conversion_events`, `marketing_investments`, `marketing_campaigns`, `lead_sources`, `attribution_records`, `leads`, `crm_casos` | — | sim | leitura direta | não aplicável | `SOMENTE_LEITURA_DELIBERADA` | — |
| Fluxo comercial canônico (histórico) | `contacts`, `opportunities` | ✓ | — | — | — | `FluxoComercialCanonico`/`PainelCanonicoCrm` | `contacts`, `opportunities` | — | sim, preservada em `/historico/fluxo-comercial-canonico` | o próprio código documenta 0 registros gravados — confirmado contra o banco | não aplicável | `SOMENTE_LEITURA_DELIBERADA` (deliberadamente arquivada — CRM real já é `/leads`) | nenhum |

### Achado 1: lacuna de verificação de gravação em Comercial e Financeiro

De ~14 funções de escrita em `comercial.functions.ts`, só duas (`atualizarObservacaoOrdem`, `mudarStatusOrdem`) usam `gravarComVerificacao`. `salvarProposta`, `mudarStatusProposta`, `renovarValidadeProposta`, `criarVersaoAjusteProposta`, `restaurarProposta`, `salvarFatura`, `salvarPagamento`, `conciliarPagamento`, `registrarAjusteFatura` e `arquivarComercial` seguem o padrão antigo de `.update()`/`.insert()` checando só `error`, sem reler e confirmar a linha afetada — a mesma classe de risco já corrigida em Contratos nesta sessão.

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

## Ainda não auditado nesta rodada

Sem evidência real levantada nesta sessão — não classificar por inferência:

- **Marketing** (todas as 12 áreas do inventário)
- **Configuração** (Perfil institucional, Catálogo, Equipe, Integrações, Modelos, Parâmetros, Dados técnicos, Qualidade)
- **App Cliente**, as 7 telas inteiras (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta)
- Auditoria linha-a-linha de `pesquisa-cadeia.functions.ts`/`documentos-solicitacoes.functions.ts` (Sistema C de Pesquisa) — confirmada ausência de `gravarComVerificacao`, mas gates/papéis não foram rastreados função a função como nos demais sistemas
- Handler da rota de API `src/routes/api/pesquisa-assistente.ts` em si (só o componente cliente foi lido)

## Próximo passo deste documento

Prioridade combinada com a proprietária em 30/08: Configuração/App Cliente/Marketing ficam para depois da política unificada de casos, já que a fragmentação de identidade encontrada nesta rodada torna qualquer auditoria dessas áreas prematura sem antes saber qual vai ser a fonte canônica de pessoa. Próxima atualização deste documento vem junto com a Fase 1 (mapear sem modificar) da política unificada, assim que o acesso ao Supabase estiver liberado.
