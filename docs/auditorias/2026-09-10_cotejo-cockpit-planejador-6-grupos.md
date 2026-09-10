# Cotejo 2026-09-10 — Cockpit, Planejador Universal e Desk de 6 grupos

**Status:** rascunho de leitura (P0.1). Nenhuma rota foi movida, fundida ou apagada.  
**Decisão:** Proprietária do Clube Ancestral, 10/09/2026.  
**Prompt executado:** revisão do Cockpit Hoje / Planejador / Casos atuais — *sem* patch de navegação.  
**Branch lida:** `cursor/desk-produto-mockup-17-5d7b` em `e4e98c4d` (sidebar = 7 telas do mockup).  
**Predecessor:** `docs/auditorias/COTEJO-TELA-A-TELA-DESK-6-ABAS-INDICADORES-VIVOS-2026-09-02.md` (desatualizado: PRs citados, `/governanca/indicadores` já removido, planner e RPC de próxima ação mudaram).

**Método:** rota → componente → função → tabela. Sem login no Desk nesta sessão. Git ≠ banco ≠ produção.

**Vocabulário de cobertura (prompt §6):**  
`DADO_ATUAL_CONFIRMADO` · `DADO_ATUAL_PARCIAL` · `SEM_DADO_SUFICIENTE` · `PENDENTE_DE_TESTE` · `DEMO_OU_LOCAL` · `LEGADO` · `ERRO_DE_FONTE`.

**Fora de escopo (não feito):** migration, RLS, sessão, permissões, auditoria, integração, contrato vivo, cobrança, preço, catálogo, ação externa, exclusão de tela.

---

## 0. Achado central

O Desk **já tem** Planejador (`case_plans` + `salvarPlanejadorOperacional`) e Caso (`crm_casos`) como eixos. O Cockpit **não opera a partir deles**.

| O que o prompt pede no Hoje | O que o código faz hoje |
|---|---|
| Itens vencidos = marcos/tarefas/entregas do Planejador | Card “Vencidos” conta `leads.proxima_acao_em` (`montarFilasHoje`) |
| Próximos marcos = Planejador com data | Não há card de marco; `case_plans` só entra na fila `cadeia_operacional`, fora dos 5 cards |
| Próxima ação com dono, prazo e vínculo | Lista de casos e ficha usam RPC `proxima_acao_prioritaria` — **nível 7 (milestones/plano) omitido de propósito** |
| Sem SKU/Planilha/Top 30/Pareto como decisão | `/catalogo` ainda mostra totais da Planilha Mestre (`catalogo-fonte-mestre.ts`); `RegraComercial` ainda se intitula “Planilha Mestre”; Biblioteca tem subárea Top 30 |

A face atual (7 telas do mockup) **reproduz sobreposição**: Marketing, Calls, contratos, portal e matrizes de composição aparecem como submenu da tela “errada”. A proprietária já disse que 8 grupos está bem se não houver form eterno. Este prompt fecha em **exatamente 6**. A proposta de patch (seção 5) **não foi aplicada**.

---

## 1. Face atual (o que existe agora)

Sete grupos em `src/lib/navegacao-desk.ts`:

| # | Grupo atual | Entrada | O que está empilhado (sobreposição) |
|---|---|---|---|
| 1 | Visão Geral | `/painel` | Cockpit **e** Calls, leads, propostas, conversão, marketing, métricas, relatórios |
| 2 | Casos 360 | `/casos` | Carteira **e** contratos, catálogo, financeiro, portal, App como pessoa |
| 3 | Checklist | `/tarefas` | Tarefas, próximas ações, ops, exceções |
| 4 | Validação Jurídica | `/matriz-juridica` | Só cidadania (correto); matrizes de *contrato* não estão aqui |
| 5 | Radar Interno | `/qualidade` | Matriz + quality |
| 6 | Alertas | `/alertas` | `case_alerts` |
| 7 | Biblioteca Mestre | `/biblioteca` | Pesquisa e bases **e** contrato-base + modelos individual/casal/familiar |

Conta (não é aba): equipe, config, etiquetas, demo, CRM Mestre, dicionário Calls, **Catálogo operacional 30**.

---

## 2. Matriz tela a tela

Tipo: operação · fila · indicador vivo · métrica · dicionário · inteligência · administração · legado · DEMO/local.

### 2.1 Destino proposto: Hoje

| Nome e rota | Tipo | Fonte atual | Cobertura | Ação real | Drill-down | Legado? | Tratamento | Risco |
|---|---|---|---|---|---|---|---|---|
| Painel Hoje `/painel` — KPI Casos ativos | indicador vivo | `painelCadencia` → `crm_casos` | `DADO_ATUAL_CONFIRMADO` | Abre lista | `/casos` | Não | Manter | Baixo |
| `/painel` — KPI Alertas pendentes | métrica oca | `valor={null}` hardcoded em `painel-dia.tsx` | `SEM_DADO_SUFICIENTE` (honesto no texto; **não lê** `listarAlertas` que a mesma tela já carrega abaixo) | Só navega | `/alertas` | Não | Substituir pelo count de `case_alerts` pending **após aprovação** | Baixo — a lista já existe na mesma página |
| `/painel` — KPI Receita do mês | métrica oca | `null` hardcoded | `SEM_DADO_SUFICIENTE` | Navega | `/financeiro` | Não | Manter declaração até haver fatura do mês filtrada; **não** inventar | Médio se alguém “completar” com proposta |
| `/painel` — KPI Taxa de conversão | métrica oca | `null` hardcoded | `SEM_DADO_SUFICIENTE` | Navega | `/leads` | Não | Manter declaração; funil vivo está em `/conversao` | Baixo |
| `/painel` — Vencidos / Vence hoje | indicador vivo **desalinhado** | `leads.proxima_acao_em` via `montarFilasHoje` | `DADO_ATUAL_PARCIAL` (é lead, não marco do Planejador) | Abre `/tarefas` (destino **errado**: a fonte é lead) | `/tarefas` | Não | Reclassificar: compromisso comercial. Novos cards de marco só com `case_plans` | Alto se “corrigir” sem cotejo de prazo |
| `/painel` — Sem responsável | indicador vivo | `consolidarDia` sem `responsavel` | `DADO_ATUAL_CONFIRMADO` | Atribuir na ficha | `/casos` | Não | Manter; incluir casos sem dono do Planejador quando houver | Baixo |
| `/painel` — Exceções críticas | indicador vivo | Union filas bloqueio (eixos do **lead**, não do caso) | `DADO_ATUAL_PARCIAL` | Abre ops | `/ops-excecoes` | Não | Contextualizar: é formalização do lead | Médio |
| `/painel` — SLA em risco | indicador vivo | `sla_em_risco: null` em `cardsHoje` | `SEM_DADO_SUFICIENTE` (correto — não mente zero) | `/ops` | `/ops` | Não | Ligar a `tarefas`/`ops_microentregas` só com consulta | Baixo |
| `/painel` — Faixa cockpit (cadência, docs, calls, leads, propostas, contratos) | indicador vivo | Filas + `painelCadencia` + RPC só no **texto** documental | `DADO_ATUAL_PARCIAL` | Links reais | `/casos` `/calls` `/propostas` `/contratos` `/evidencias` | Não | Manter; não promover a 2º CRM | Baixo |
| `/painel` — Fila priorizada | fila | Leads + casos documentais + RPC | `DADO_ATUAL_PARCIAL` | Abre caso ou Calls | `/casos/$id` `/calls` | Não | Manter; Planejador ainda não ordena | Médio |
| `/painel` — Alertas prioritários (bloco) | fila | `listarAlertas` → `case_alerts` | `DADO_ATUAL_CONFIRMADO` | Enviar/revisar humano | `/alertas` `/casos/$id` | Não | Manter como recorte; aba Alertas do mockup mora aqui | Baixo |
| `/painel` — Sinais `leads_sem_origem`, `discoveries_sem_desdobramento`, `aceites_sem_confirmacao` | indicador **falso-zero** | `qtd(...)` de filas **inexistentes** em `montarFilasHoje` | `ERRO_DE_FONTE` disfarçado de 0 | — | `/qualidade` etc. | Não | **Retirar do fluxo** ou criar a fila de verdade | Alto — 0 silencioso |
| `/alertas` | operação | `case_alerts` | `DADO_ATUAL_CONFIRMADO` | Lista + link ao caso | `/casos/$id` | Não | Manter sob Hoje | Baixo |
| `/metricas` | métrica | Reusa `painelHojeDesk` | `DADO_ATUAL_PARCIAL` | Leitura | — | Não | Decidir se some da face (duplica Hoje) | Médio (duas verdades) |
| `/relatorios` | operação/leitura | `case_reports` / research (parcial no código) | `DADO_ATUAL_PARCIAL` | Exportações | — | Não | Inteligência se for F1/F2; senão Hoje | Baixo |

### 2.2 Destino proposto: Marketing & Comercial

| Nome e rota | Tipo | Fonte atual | Cobertura | Ação real | Drill-down | Legado? | Tratamento | Risco |
|---|---|---|---|---|---|---|---|---|
| `/calls` Painel de Calls | operação | `leads` (mesma tabela) | `DADO_ATUAL_CONFIRMADO` | Grava lead, recarrega Hoje | ficha lead | Não | **Casa canônica** do Calls | Alto se esconder de novo |
| `/leads` | operação | `leads` | `DADO_ATUAL_CONFIRMADO` | CRUD / triagem | lead | Campo “Referência de SKU (Planilha Mestre)” | Relabel + não usar como preço | Médio |
| `/propostas` | operação | `proposals` | `DADO_ATUAL_CONFIRMADO` | Lista / abrir | proposta | Não | Manter | Baixo |
| `/conversao` | indicador vivo | `conversion_events` + `montarFunil` / `montarSaude` | `DADO_ATUAL_CONFIRMADO` | Abre lead da etapa | `/leads` | Não | Manter | Baixo |
| `/marketing` | métrica | `leads.origem`, campanhas, investimentos, atribuição | `DADO_ATUAL_PARCIAL` / `SEM_DADO_SUFICIENTE` (CAC/ROI/WhatsApp) | Links para Comercial; **não** cria lead | `/leads` `/conversao` | Não | Manter honestidade SEM_DADOS; sem Pareto | Baixo |
| `/proximas-acoes` | fila | derivado tarefas+leads | `DADO_ATUAL_PARCIAL` | Lista | — | Não | Comercial se for lead; Pessoas & Casos se for caso | Baixo |

### 2.3 Destino proposto: Pessoas & Casos

| Nome e rota | Tipo | Fonte atual | Cobertura | Ação real | Drill-down | Legado? | Tratamento | Risco |
|---|---|---|---|---|---|---|---|---|
| `/casos` carteira | operação | `crm_casos` + RPC próxima ação + `calcularPrioridade` | `DADO_ATUAL_PARCIAL` (próxima ação **não** lê `case_plans`) | Abrir ficha | `/casos/$id` | Não | Manter; planner na ficha já grava | Alto alterar RPC sem ela |
| `/casos/$id` ficha | operação | `crm_casos`, `case_members`, `case_plans` (bloco Jornada), financeiro, pesquisa, portal | `DADO_ATUAL_PARCIAL` | Planejador grava; preparar contrato **abre** (não copia form) | `/contrato/preparar`, pesquisa, portal | SKU no planejador (produto-pai) | Manter ponte; produto-pai contextual, não catálogo legado | Médio |
| `/nucleos` `/nucleos-duplicidades` | operação | `nucleos_familiares` | `DADO_ATUAL_CONFIRMADO` | Revisão humana; sem merge automático | núcleo | Não | Manter | Alto se unificar sozinho |
| `/clientes` `/pessoas/$id` | operação | `clientes` | `DADO_ATUAL_CONFIRMADO` | Pessoa 360 | pessoa | Não | Manter neste grupo | Baixo |
| `/tarefas` Checklist | operação | `tarefas` | `DADO_ATUAL_CONFIRMADO` | CRUD; **não** abre ficha do caso | — | Não | Acrescentar link ao caso (patch futuro) | Baixo |
| `/qualidade` Radar Interno | indicador vivo | `crm_casos` + `quality_*` | `DADO_ATUAL_PARCIAL` | Matriz; selo de código sem Link | `/qualidade` | Não | Manter tela; morar neste grupo | Baixo |
| `/ops` `/ops-excecoes` `/onboarding/$id` | operação | ops / activation | `DADO_ATUAL_PARCIAL` | Exceções / ativação | caso | Comentários CA-OPS-02 | Relabel legado; não usar CA OPS como regra | Médio |
| `/app-cliente-como-pessoa` | operação | `app_projections` (staff) | `DADO_ATUAL_CONFIRMADO` | Ver App como pessoa | portal | Não | Cliente/Governança se for admin; senão Pessoas & Casos | Baixo |

### 2.4 Destino proposto: Inteligência & Pesquisa

| Nome e rota | Tipo | Fonte atual | Cobertura | Ação real | Drill-down | Legado? | Tratamento | Risco |
|---|---|---|---|---|---|---|---|---|
| `/biblioteca` | inteligência | `master_library_items`, `genealogical_sources_catalog`, `controlled_taxonomies`, `citizenship_tracks`, `versioned_legal_rules` | `DADO_ATUAL_PARCIAL` | Curadoria + subáreas | bases, trilhas | Subárea **top30** de `product_catalog` | Tirar Top 30 da face; catálogo vai a Formalização | Médio |
| `/pesquisa-modulo` | operação | `research_cases`, evidências, pendências | `DADO_ATUAL_CONFIRMADO` | Plano, pendência → tarefa | caso | Não | **Casa** da pesquisa viva | Baixo |
| `/pesquisa` | operação (dossiê Legado) | `crm_casos` + `pesquisa` / events | `DADO_ATUAL_PARCIAL` | Repositório Legado | `/pesquisa-modulo` | Não | Manter neste grupo (não na conta) | Baixo |
| `/fontes-genealogicas` | inteligência | `genealogical_sources_catalog` | `DADO_ATUAL_CONFIRMADO` | Abrir base, não card de ranking | fonte | Não | Manter | Baixo |
| `/evidencias` `/biblioteca-evidencias/$id` | operação | `evidencias` / evidence items | `DADO_ATUAL_CONFIRMADO` | Cadeia de custódia | evidência | Não | Manter | Baixo |
| `/privacidade` | administração/caso | `consent_records` | `DADO_ATUAL_PARCIAL` | Consentimento | — | Não | Caso ou Governança; uma casa | Baixo |
| `/matriz-juridica` | inteligência | trilhas / matriz jurídica | `DADO_ATUAL_PARCIAL` | Parecer humano; não bloqueia rascunho | caso | Não | **Não** misturar com matrizes de contrato | Alto se fundir forms |
| `/achados/$id` `/plano-acao/$id` `/relatorios-fase/$id` | operação | research / reports | `DADO_ATUAL_PARCIAL` | Trabalho do caso | caso | Não | Contextual na ficha | Baixo |

### 2.5 Destino proposto: Formalização & Financeiro

| Nome e rota | Tipo | Fonte atual | Cobertura | Ação real | Drill-down | Legado? | Tratamento | Risco |
|---|---|---|---|---|---|---|---|---|
| `/contratos` | operação | `contracts`, versões, OS | `DADO_ATUAL_CONFIRMADO` | Lista; cartões usam `?? 0` se painel falha | `/contratos/$id` | Embute `PainelTop30` | Tirar Top 30 da face desta lista | Médio |
| `/casos/$id/contrato/preparar` | operação | planejador + proposta + parâmetros | `DADO_ATUAL_PARCIAL` | Gera prévia; **um** form | — | `RegraComercial` título Planilha Mestre; `precos-sku` + `preco-canonico` **ambos** | Uma fonte: `product_catalog` / produto-pai | Alto (preço) |
| `/governanca/contrato-base` | dicionário | constantes | `DEMO_OU_LOCAL` (rascunho TESTE) | Leitura | — | Não | Fica neste grupo, **uma** vez | Baixo |
| `/governanca/modelo-individual` | dicionário + evento | constantes + registro | `DADO_ATUAL_PARCIAL` | Referência individual | — | Não | Matriz de **composição contratual** — só aqui | Baixo |
| `/governanca/modelo-familiar-casal` | dicionário + evento | constantes + registro | `DADO_ATUAL_PARCIAL` | Referência casal | — | Não | Só aqui | Baixo |
| `/governanca/modelos-contratuais` | dicionário | `MODELOS_CONTRATUAIS` | `DEMO_OU_LOCAL` | Leitura da matriz 3 modelos | — | Não | Só aqui; aplicação = preparar no caso | Baixo |
| `/financeiro` | operação | `invoices`, `payments` | `DADO_ATUAL_PARCIAL` | Listas; CAC/ROI SEM_DADOS sem mídia | — | Não | Não usar proposta como comprovante | Médio |
| `/catalogo` `/homologacao-skus` `/conciliacao-catalogo` `/divergencias-catalogo` | operação + legado | `product_catalog` **e** `mapaFonteMestre()` (85/32 hardcoded) | `DADO_ATUAL_PARCIAL` + `LEGADO` no snapshot | Homologar / divergência | SKU | Planilha Mestre, Top Pareto | Snapshot só em Governança | Médio |
| `/contrato-parametros` `/ordens-servico` `/escopo-origem` | operação | parâmetros, OS, CSV | `DADO_ATUAL_PARCIAL` | Leitura / params | — | Não | Manter neste grupo | Baixo |

### 2.6 Destino proposto: Governança & Administração

| Nome e rota | Tipo | Fonte atual | Cobertura | Ação real | Drill-down | Legado? | Tratamento | Risco |
|---|---|---|---|---|---|---|---|---|
| `/equipe` `/configuracoes` `/etiquetas` | administração | `staff_access`, org, `label_taxonomy` | `DADO_ATUAL_CONFIRMADO` | Papéis / prefs | — | Não | Primeiro nível deste grupo (hoje estão na conta) | Baixo |
| `/crm-mestre` | dicionário | constantes | `LEGADO` / `DEMO_OU_LOCAL` | Consulta | — | CRM histórico | Manter como legado | Baixo |
| `/governanca/dicionario-calls-crm` | dicionário | constantes | `LEGADO` (ainda cita Planilha em regras internas) | Consulta | — | Planilha Mestre no texto de regra | Relabel | Baixo |
| `/governanca/catalogo-operacional-30` | dicionário | `CATALOGO_OPERACIONAL_30` | `LEGADO` (`ANALISE_HISTORICA`) | CSV | — | Top 30 / Planilha | Só Governança, nunca Hoje | Baixo |
| `/integracoes` `/importacoes` | administração | integrations | `PENDENTE_DE_TESTE` / `a_confirmar` | Estado real | — | Não | Aqui | Baixo |
| `/app-cliente-demo` | DEMO | fixtures | `DEMO_OU_LOCAL` | Preview fictício | — | Demo | Nunca no Hoje | Baixo |
| `/governanca/decisoes` | administração | log de decisões | `DADO_ATUAL_PARCIAL` | Leitura | — | Não | Aqui | Baixo |
| `/mockup` `/studio-devolutivas` `/historico/fluxo-comercial-canonico` | DEMO / histórico | estático / 0 rows | `DEMO_OU_LOCAL` / `LEGADO` | Referência | — | Não | Fora da face | Baixo |

Rotas cerimoniais (`/governanca/indicadores`, matriz-conformidade, auditoria estática) **já foram apagadas** (06/09). Não recriar.

---

## 3. Referências legadas encontradas × substituição

| Legado | Onde aparece hoje (código vivo) | Classificação | Pode permanecer | Não pode | Substituição vigente |
|---|---|---|---|---|---|
| **CA OPS** | Quase ausente na UI. Comentários CA-OPS-02 em `/ops`, mensagens, `painel-dia.tsx` | `INVENTARIO_HISTORICO` | Docs / Governança | Hoje, prioridade, saúde do caso | `crm_casos` + `case_plans` + RPC próxima ação |
| **Matriz Operacional** | **Zero** hits em `src/routes` e `src/components` | `LEGADO_DE_REFERENCIA` | Docs | Fila, indicadores | Planejador (marcos, dono, prazo) |
| **Planilha Mestre** | Copy + campo em `/leads`; snapshot `src/data/catalogo-fonte-mestre.ts` em `/catalogo`; título de `RegraComercial`; `precos-sku.ts`; dicionário Calls | `FONTE_HISTORICA_A_CONCILIAR` | Governança / rastreio de linha | Preço, escopo, proposta, contrato, financeiro | `product_catalog` + `preco-canonico.ts` + produto-pai do Planejador |
| **SKUs legados / Top 10 / Top 30 / Pareto** | `/catalogo` totais 85/32; `PainelTop30` em contratos; subárea top30 na Biblioteca; `CATALOGO_OPERACIONAL_30` na conta | `CATALOGO_LEGADO` / `ANALISE_HISTORICA` | Governança com data | Cards de demanda, ranking no Marketing, recomendação automática | Produto-pai / serviço contextual no caso (`planejador-produtos-pai`) |
| **CRM Mestre / Catálogo 30** | Menu da conta | `LEGADO` | Conta / Governança | Face operacional | `leads` + `product_catalog` |
| **Dados DEMO** | `/app-cliente-demo`; filtro `eDemo` no painel | `DEMO_OU_LOCAL` | Teste | Hoje, carteira, conversão, financeiro | Casos reais + `app_projections` |

`precos-sku.ts` ainda declara Planilha como “única fonte oficial”. `preco-canonico.ts` declara `product_catalog`. A tela Preparar contrato chama **os dois**. Isso é a sobreposição de preço — não criar terceira tabela.

---

## 4. Mapa de indicadores vivos (6 grupos)

Regra do prompt: vivo = fonte atual + filtro org/caso + regra + data + lista + ação. Sem isso, não é KPI operacional.

### 4.1 Hoje

| Indicador pedido | Fonte permitida | Fonte no código | Filtro | Atualização | Detalhe | Ação | Estado |
|---|---|---|---|---|---|---|---|
| Itens vencidos | Marcos/tarefas/entregas com prazo < hoje | `leads.proxima_acao_em` | lead ativo, não arquivado | A cada load `painelHojeDesk` | `/tarefas` (errado) | Replanejar | `DADO_ATUAL_PARCIAL` — **trocar fonte após aprovação** |
| Sem dono | Registro ativo sem responsável | `consolidarDia.semResponsavel` | filas do dia | Load | `/casos` | Atribuir | `DADO_ATUAL_CONFIRMADO` |
| Próximos marcos | `case_plans` com data | **Não existe card** | — | — | — | — | `SEM_DADO_SUFICIENTE` (lacuna) |
| Bloqueios ativos | Gate/pendência/decisão do **caso** | Filas de eixo do **lead** | lead | Load | `/ops-excecoes` | Abrir motivo | `DADO_ATUAL_PARCIAL` |
| Entregas em revisão | Microentrega/achado | Não no topo; cadência/docs usam `documentos_minimos_ok` | caso | Load + RPC texto | `/evidencias` | Revisar | `DADO_ATUAL_PARCIAL` |
| Compromissos comerciais | Lead/proposta/editorial com prazo | Faixa: calls hoje, leads sem ação, propostas sem follow-up | lead | Load | `/calls` `/propostas` | Abrir registro | `DADO_ATUAL_CONFIRMADO` |

### 4.2 Marketing & Comercial

| Indicador pedido | Fonte código | Não usar | Ação | Estado |
|---|---|---|---|---|
| Leads sem próxima ação | Fila `leads_sem_proxima_acao` + higiene `/conversao` | CRM/OPS histórico | Abrir lead | `DADO_ATUAL_CONFIRMADO` |
| Calls/Discovery sem desfecho | `/calls` `resumoCalls` | Volume genérico | Abrir Call | `DADO_ATUAL_CONFIRMADO` |
| Propostas sem retorno | Fila `propostas_sem_followup` + `proposals` | Links/SKU antigos | Follow-up humano | `DADO_ATUAL_CONFIRMADO` |
| Editorial pendente | `/marketing` conteúdo → aponta Biblioteca de Mensagens | Calendário morto | Abrir template | `DADO_ATUAL_PARCIAL` |
| Origem de demanda | `leads.origem` classificado | CAC/ROI sem fonte | Recorte por canal | `DADO_ATUAL_PARCIAL` |
| Oportunidades por produto-pai | **Não há card**; SKU no lead é texto | Top 10/30/Pareto | — | `SEM_DADO_SUFICIENTE` |

### 4.3 Pessoas & Casos

| Indicador pedido | Fonte código | Ação | Estado |
|---|---|---|---|
| Caso sem próximo marco | RPC próxima ação **ignora** plano (nível 7) | Abrir ficha / Planejador | `DADO_ATUAL_PARCIAL` |
| Pessoa com dados pendentes | Sem card agregado; ficha/núcleo | Pessoa 360 | `SEM_DADO_SUFICIENTE` no cockpit |
| Duplicidade | `/nucleos-duplicidades` | Revisão humana | `DADO_ATUAL_CONFIRMADO` (tela) |
| Bloqueio núcleo/caso | Ativação / qualidade | Abrir cadeia | `DADO_ATUAL_PARCIAL` |
| Entrega sem destino | Sem card Hoje | Completar fluxo | `SEM_DADO_SUFICIENTE` no cockpit |

### 4.4 Inteligência & Pesquisa

| Indicador pedido | Fonte código | Ação | Estado |
|---|---|---|---|
| Lacuna sem plano | `research_pending_items` no módulo | Abrir dossiê | `DADO_ATUAL_PARCIAL` (não no Hoje) |
| Conflito identidade | quality_issues domínio pesquisa | Matriz evidências | `DADO_ATUAL_PARCIAL` |
| Pedido documental vencido | solicitações / evidências | Abrir pedido | `DADO_ATUAL_PARCIAL` |
| Evidência em revisão | `research_evidence_items` | Abrir análise | `DADO_ATUAL_CONFIRMADO` no módulo |
| Base a revisar | `genealogical_sources_catalog` | Abrir **registro**, não count | `DADO_ATUAL_CONFIRMADO` |
| Trilha sem cobertura | `citizenship_tracks` na Biblioteca | Registrar necessidade | `DADO_ATUAL_PARCIAL` |

### 4.5 Formalização & Financeiro

| Indicador pedido | Fonte código | Não usar | Ação | Estado |
|---|---|---|---|---|
| Caso sem proposta | `proposals` / cadeia operacional | Link legado | Abrir comercial | `DADO_ATUAL_PARCIAL` (fila cadeia) |
| Parâmetros pendentes | `contract_case_parameters` | Autofill SKU legado | Ficha parâmetros | `DADO_ATUAL_PARCIAL` |
| Contrato aguardando etapa | `contracts` + eixos lead | Texto histórico | Preparar / revisar | `DADO_ATUAL_PARCIAL` |
| Financeiro pendente | `invoices`/`payments` | Estimativa/proposta como pago | Abrir evidência | `DADO_ATUAL_PARCIAL` |
| Despesa externa | `third_party_expenses` no resumo da ficha | Matriz OPS | Aprovar | `DADO_ATUAL_PARCIAL` |

### 4.6 Governança

Não cria segunda operação. Indicadores aqui são **dicionário** (`fontes-canonicas-indicadores.ts` — arrays, não query). Correto desde que ninguém os leia como dashboard.

---

## 5. Cards ocos, dicionários e métricas sem drill-down útil

| Superfície | Por que não é indicador vivo | Tratamento proposto (não executado) |
|---|---|---|
| KPI Alertas / Receita / Conversão no topo do mockup | `null` fixo; Alertas **ignora** a query já carregada | Alertas: ligar a `case_alerts`. Outros: manter SEM_DADOS |
| SLA em risco | `null` declarado | Manter até carregar `sla_status` |
| Sinais origem/discovery/aceite | Filas fantasma → 0 | Remover ou implementar fila |
| `/governanca/catalogo-operacional-30` | 30 linhas TS | Só Governança, rótulo `ANALISE_HISTORICA` |
| `/crm-mestre` | Constantes | Só Governança |
| `/governanca/dicionario-calls-crm` | Constantes | Relabel Planilha |
| `/governanca/modelos-contratuais` + contrato-base | Constantes / rascunho TESTE | Formalização, uma vez, sem segundo reader na Biblioteca |
| Snapshot 85/32 em `/catalogo` | `catalogo-fonte-mestre.ts` | Mover para Governança |
| `PainelTop30` na lista de contratos | Ranking comercial na formalização | Recolher; produto-pai no caso |
| Subárea top30 da Biblioteca | Catálogo no centro de inteligência | Sair da Biblioteca |
| `/metricas` | Segunda contagem do Hoje | Decidir fusão |
| `/tarefas` sem link ao caso | Operação sem drill-down de eixo | Link `caso_id` |

---

## 6. Proposta de patch mínimo — **não executada**

Aprovação humana obrigatória antes de qualquer `navegacao-desk.ts`.

### 6.1 Seis grupos (primeiro nível)

| # | Grupo | Entrada | O que entra | O que **não** entra |
|---|---|---|---|---|
| 1 | **Hoje** | `/painel` | Fila, alertas, bloqueios, atalhos. `/alertas` como tela do grupo | Segundo CRM, segundo Calls, marketing, contratos |
| 2 | **Marketing & Comercial** | `/leads` | `/marketing`, `/calls`, `/propostas`, `/conversao`, próximas ações de lead | Matriz jurídica, pessoa 360, catálogo Top 30 |
| 3 | **Pessoas & Casos** | `/casos` | Núcleos, pessoa, checklist `/tarefas`, radar `/qualidade`, ops, onboarding | Dump de contratos, catálogo, portal financeiro, pesquisa CRUD |
| 4 | **Inteligência & Pesquisa** | `/biblioteca` | Pesquisa, bases, evidências, dossiê Legado, dicionários, trilhas, `/matriz-juridica` | Modelos de contrato, Top 30, preço |
| 5 | **Formalização & Financeiro** | `/contratos` | OS, parâmetros, financeiro, catálogo vivo, **matrizes individual / casal / familiar**, contrato-base. Aplicação = `/casos/$id/contrato/preparar` | Segundo form jurídico; Planilha como decisão |
| 6 | **Governança & Administração** | `/configuracoes` | Equipe, etiquetas, integrações, decisões, CRM Mestre, Catálogo 30, demo, snapshot Planilha | Fila do dia |

Checklist, Radar Interno e Alertas **continuam as telas** (`/tarefas`, `/qualidade`, `/alertas`) — só mudam de dono. Nenhuma URL muda. Nenhuma tela some.

### 6.2 Rótulos / visibilidade (mínimo, se aprovado)

1. Relabel “Referência de SKU (Planilha Mestre)” → “Referência de produto (catálogo homologado)”.
2. Relabel `RegraComercial` para `product_catalog` (já é o RPC).
3. Esconder da **face** (não apagar rota): `PainelTop30` em `/contratos`, subárea top30 da Biblioteca, totais 85/32 em `/catalogo`.
4. Remover sinais de filas fantasma do Hoje **ou** implementá-las de verdade (escolher um).
5. KPI Alertas: passar a contar `case_alerts` pending (a query já existe na página).

### 6.3 Explicitamente fora deste patch

- Não alterar RPC `proxima_acao_prioritaria` (incluir nível 7) sem desenho à parte.
- Não criar tabela, KPI engine, CRM, planilha ou SKU universal.
- Não mergear PRs #32 #35 #40.
- Não aplicar SQL de timeline sem a proprietária ver efeito e reversibilidade.

---

## 7. Roteiro de testes (leitura e persistência)

Homologação logada: `https://soul-ancestry.vercel.app` (não Lovable). Commit verde ≠ produção.

### 7.1 Leitura — Hoje

1. Abrir `/painel`. Anotar os 4 KPIs do mockup: Casos ativos deve ser número da carteira; Alertas/Receita/Conversão devem dizer ausência — **não** um zero inventado.
2. Abrir o bloco Alertas da mesma página e `/alertas`: a lista deve ser a mesma fonte (`case_alerts`). Se o KPI do topo for `null` e a lista tiver itens, o cotejo está confirmado na UI.
3. Clicar Vencidos: hoje cai em `/tarefas`. Conferir se os itens do card são **leads** (não marcos). Se a lista de tarefas não bater, o desalinhamento está visível.
4. Procurar sinais “lead sem origem / discovery / aceite”: se mostrarem 0 com leads sem origem no CRM, é o falso-zero.
5. Gravar uma call em `/calls` (lead da org). F5 em `/painel`: o lead deve reaparecer na faixa/fila. Sem isso o Calls não está vivo.

### 7.2 Persistência — Planejador e Caso

1. Abrir um caso real (Ana ou outro da org). Bloco Planejador: gravar um marco com dono e prazo.
2. Recarregar a ficha: o marco permanece (`case_plans`).
3. Voltar ao `/painel`: o marco **não** deve aparecer nos 5 cards atuais (lacuna documentada). A próxima ação da **lista** `/casos` continua vindo da RPC, não do marco.
4. Em `/casos/$id/contrato/preparar`, abrir composição: o modelo (individual/casal/familiar) aplica-se **aqui**, não num segundo form em Validação Jurídica nem na Biblioteca.

### 7.3 Pesquisa e bases

1. `/biblioteca` → Bases Genealógicas: abrir um registro de `genealogical_sources_catalog`, não um ranking.
2. `/pesquisa-modulo`: pendência existente abre o caso; criar tarefa da pendência sobrevive ao F5.
3. `/pesquisa` (dossiê): continua sendo repositório do Legado, não “sistema anterior” na conta.

### 7.4 Legado não decide

1. `/catalogo`: anotar se os totais 85/32 mudam ao filtrar `product_catalog`. Se não mudam, são snapshot.
2. `/governanca/catalogo-operacional-30`: confirma 30 linhas estáticas; nenhuma deve alterar prioridade do Hoje.
3. `/marketing`: CAC/ROI sem investimento = “Sem dados suficientes”, nunca 0.

### 7.5 Isolamento

1. App Cliente (7 abas) não ganha Entregas/Fase na barra.
2. Staff em App como pessoa lê `app_projections`, não a view RLS do cliente.

---

## 8. Critério de aceite deste artefato (o que já está cumprido)

- [x] Matriz tela a tela com os 10 campos do prompt §7.
- [x] Tabela de legado + substituição (sem apagar arquivo).
- [x] Mapa de indicadores por uma das 6 abas, com fonte/ação/cobertura.
- [x] Lista de cards ocos / dicionário / DEMO / métrica sem drill-down útil.
- [x] Proposta de patch de 6 grupos + rótulos, **sem executar**.
- [x] Roteiro de leitura e persistência.
- [ ] Patch aplicado — **bloqueado** até aprovação explícita.
- [ ] Cockpit lendo marcos do Planejador — **não feito** (seria mudança de regra, não só menu).

---

## 9. Relação com a conversa do mesmo dia

A proprietária pediu: pesquisa e bases na Biblioteca Mestre; matrizes individual/familiar/casal no endereço de contrato; 8 grupos ok se não houver sobreposição.

Este prompt **unifica** isso em 6:

- Inteligência & Pesquisa = Biblioteca + bases + pesquisa + Validação Jurídica de cidadania.
- Formalização & Financeiro = instrumentos + as três matrizes de composição.
- Marketing & Comercial juntos (sem segundo CRM no Hoje).
- Pessoas & Casos = carteira sem dump financeiro.
- Governança segura o legado (Planilha, Top 30, CA OPS, demo).

Não compete com o App Cliente de 7 abas. Não reabre 14 abas. Não cria `case_participants` / `citizenship_cases` / `onboarding_runs`.
