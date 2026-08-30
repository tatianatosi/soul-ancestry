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

## Ainda não auditado nesta rodada

Sem evidência real levantada nesta sessão — não classificar por inferência:

- **Comercial** (Leads, Discovery, Propostas, Clientes, Condições comerciais, Financeiro do caso, Conversão)
- **Pesquisa** (Painel de pesquisa, Achados, Hipóteses, Evidências, Solicitações documentais, Bibliotecas, Fontes, Bases, Integrações, Relatórios) — exceto o que já se sabe pela varredura de persistência (`fontes-genealogicas.functions.ts` corrigido na PR #31)
- **Marketing** (todas as 12 áreas do inventário)
- **Configuração** (Perfil institucional, Catálogo, Equipe, Integrações, Modelos, Parâmetros, Dados técnicos, Qualidade)
- **App Cliente**, as 7 telas inteiras (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta)
- **Painel Hoje** como tela própria (a capacidade de tarefas foi verificada via Ops, mas o painel Hoje em si — `painel.tsx`/`painel-dia.tsx` — não foi rastreado linha a linha)

## Próximo passo deste documento

Continuar em fatias, na mesma ordem de prioridade operacional já em curso: Painel Hoje (por já ter indicadores acionáveis pedidos no prompt do Cockpit) e Comercial/Pesquisa em seguida. Cada fatia nova é um commit separado neste mesmo arquivo, nunca uma reescrita silenciosa do que já foi verificado.
