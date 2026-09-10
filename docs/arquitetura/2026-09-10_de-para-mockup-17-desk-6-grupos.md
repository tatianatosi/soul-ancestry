# De-para de convivência — mockup de 17 páginas × Desk de 6 grupos

**Status:** rascunho para decisão da Proprietária (10/09/2026), com correção do sistema comercial no mesmo dia.  
**Tipo:** de-para canônico de navegação, layout e domínio, com cotejo factual das fontes atuais.  
**Branch lida:** `cursor/desk-produto-mockup-17-5d7b` após o cockpit de 6 grupos e a correção CA-04.  

**Correção da Proprietária (10/09, após o primeiro de-para):** CA-04 CRM Mestre **não** é legado de Governança. É o mapa de regras do **mesmo sistema** do Painel de Calls. O Dicionário Calls → CRM **não** fica como consulta arquivada: avalia o lead canônico em `/calls`. Planilha Mestre, Top 30, Catálogo 30, conciliação e homologação de SKU legado **saíram do Desk** — arquivo só no GitHub (`archive/github/2026-09-10-legado-catalogo-desk/`). Sem grupo Legado no menu. Sem tabela nova, sem segunda ficha, sem Planilha como preço.

**Fontes visuais (ordem de autoridade):**

1. Decisão explícita desta rodada: Desk opera em **seis grupos**; mockup de 17 páginas preserva linguagem e hierarquia; Radar é camada, não 7ª aba.
2. `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` — nomes das 7+7 telas.
3. `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf` — 17 páginas (capa + divisor App + 7 telas App + divisor Desk + 7 telas Desk), confirmado em CA13 (09/09/2026). Extração textual do PDF nesta sessão não esteve disponível (`pdftotext` vazio); a leitura de páginas usa CA13 + taxonomia + código das rotas reais. O PDF de 47 páginas **não** é normativo.
4. Código atual: `src/lib/navegacao-desk.ts`, rotas `_authenticated` e `portal`, `src/components/painel/painel-dia.tsx`, `src/lib/radar-seis-eixos.ts`, `src/lib/radar-eixos.ts`, `src/routes/_authenticated/qualidade.tsx`.
5. Protótipo visual-only `src/components/mockup/desk-mockup.tsx` — **não** é o PDF de 17 páginas: tem CRM Vivo como 7ª aba e Radar como subaba da Visão Geral. Trata-se de `DEMO_OU_LOCAL`.

**Convívio acordado (não é fusão):**

```text
Mockup aprovado     = linguagem, experiência, composição e prioridades visuais
Desk Simplificado   = seis grupos de navegação e operação diária
Casos + Planejador  = contexto, jornada, marcos, responsáveis e dependências
Radar               = leitura transversal (carteira + caso), explicável e acionável
CA-04 + Calls       = um sistema comercial (mapa de regras + operação na tabela leads)
Governança          = cobertura, auditoria, papéis, Catálogo 30 e arquivo
```

**Vocabulário de realidade:** `DADO_ATUAL_CONFIRMADO` · `DADO_ATUAL_PARCIAL` · `SEM_DADO_SUFICIENTE` · `PENDENTE_DE_TESTE` · `DEMO_OU_LOCAL` · `LEGADO` · `ERRO_DE_FONTE`.

**Predecessor:** `docs/auditorias/2026-09-10_cotejo-cockpit-planejador-6-grupos.md` descrevia a face **antes** do patch de 6 grupos (sidebar ainda nas 7 telas; KPIs de receita/conversão no Hoje; sinais em zero silencioso). Este de-para lê o Desk **depois** desse patch e não o revoga.

---

## 0. Como o mockup convive com os 6 grupos

O PDF mostra **7 itens** na sidebar do Desk. O Desk atual mostra **6 grupos**. Isso não apaga o mockup: as 7 telas viram **linguagem e superfície**, não 7 abas concorrentes.

| Tela do mockup (PDF) | Grupo do Desk (navegação) | Superfície correta | Não vira |
|---|---|---|---|
| Visão Geral | Hoje | Cabeçalho + fila do `/painel` | Segundo CRM |
| Casos 360 | Pessoas & Casos | Lista `/casos` + ficha `/casos/$id` | Dump de contrato ou pesquisa |
| Checklist | Pessoas & Casos | Fila `/tarefas` + bloco do caso | Segunda lista em CA OPS |
| Validação Jurídica | Inteligência & Pesquisa | `/matriz-juridica` + bloco no caso | Form de contrato |
| Radar Interno | Pessoas & Casos (tela) + Hoje (carteira) | Camada: `/qualidade` + cards do Hoje + ficha | 7ª aba global ou score |
| Alertas | Hoje | `/alertas` + recorte no `/painel` | Envio automático |
| Biblioteca Mestre | Inteligência & Pesquisa | `/biblioteca` + pesquisa/evidências | Catálogo Top 30 / Planilha |

App Cliente permanece com as **7 abas do mockup** (`portal-shell.tsx`). Os 6 grupos do Desk **não** entram na barra do cliente.

### 0.1 Sistema comercial CA-04 (não é página do PDF; é o CRM que vai com as Calls)

A tela `/crm-mestre` (cards “Fontes de verdade”) não é uma das 17 páginas do mockup e **não** é arquivo. Convive assim:

| Elemento visual (CA-04) | Intenção | Grupo | Superfície | Equivalente atual | Tipo | Fonte | Realidade | Radar | Visibilidade | Duplicidade | Convivência | Risco |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Card Painel de Calls / CRM Vivo | Entrada, SPIN, Discovery, handoff, próxima ação | Marketing & Comercial | `/calls` + `/leads` | `painel-calls.tsx` + tabela `leads` | Operação | Lead canônico | `DADO_ATUAL_CONFIRMADO` | Comercial em atenção | Interno | `/leads` é a mesma ficha | Manter como um sistema; CA-04 não grava lead | Alto se criar CRM paralelo |
| Card Catálogo homologado | SKU, preço, condição, link | Formalização & Financeiro | `/catalogo` | `product_catalog` | Operação | Catálogo | `DADO_ATUAL_PARCIAL` | Formalização | Interno | Planilha Mestre (texto histórico) | Planilha não volta como fonte viva | Alto se reler Planilha como preço |
| Card Asaas | Evento transacional | Formalização & Financeiro | `/financeiro` | Evento Asaas referenciado | Operação | Transação confirmada | `DADO_ATUAL_PARCIAL` | Financeiro | Interno / admin | CRM não substitui Asaas | Conectar por referência | Alto inferir pagamento |
| Card Desk / dossiê | Caso, evidência, pendência | Pessoas & Casos + Inteligência | Caso 360 + `/pesquisa-modulo` | `crm_casos` + evidências | Operação | Caso / dossiê | `DADO_ATUAL_PARCIAL` | Evidência / Bloqueio | Interno | Não usar Calls como dossiê | Ponte por vínculo | Médio |
| Card App Cliente | Só o aprovado | Pessoas & Casos (projeção) | `/portal/*` | Projeção sanitizada | Projeção | Entrega liberada | `DADO_ATUAL_PARCIAL` | Experiência | Cliente aprovado | Desk cru | Nunca projetar triagem CA-04 | Alto |
| Card CRM legado | Histórico consultável | Governança (arquivo) | Importações / histórico | Sistemas antigos | Legado | Nenhuma fonte nova | `LEGADO` | — | Histórico | CA-04 atual | Não usar para dado novo | Médio se confundir com `/crm-mestre` |
| Dicionário Calls → CRM | Listas e regras de dependência | Marketing & Comercial | `/governanca/dicionario-calls-crm` + bloco no `/calls` | `dicionario-calls-crm.ts` → `pendenciasDicionarioDoLead` | Operação (regra viva) | Lead + CATALOGOS | `DADO_ATUAL_PARCIAL` | Comercial / Formalização | Interno | `validarLead` (slugs) | Conectar; pendência informa, não trava rascunho | Médio se travar rascunho ou reabrir Planilha |

---

## 1. Entregável — matriz das 17 páginas

Campos da seção 4 do prompt. Uma linha por página e por bloco relevante. Fonte operacional vigente = tabelas/rotas atuais. **CA OPS, Planilha Mestre, Matriz Operacional e SKU/Top 30 não são fonte de nenhum card.**

### Páginas 1–2 — moldura

| Página | Elemento | Intenção | Grupo | Superfície | Equivalente atual | Tipo | Fonte | Realidade | Radar | Visibilidade | Duplicidade | Convivência | Risco |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. Capa | Wordmark script + título “Mockup visual para aprovação · App Cliente · Desk Intelligence · protótipo sem dados reais” | Declarar que o PDF é contrato visual, não prova de backend | Governança | Referência visual `/mockup` | `src/routes/_authenticated/mockup.tsx` + PDF | DEMO/local | Nenhuma | `DEMO_OU_LOCAL` | — | Administração / histórico | Nenhum | Preservar como referência visual | Baixo se alguém tratar capa como tela operacional |
| 2. Divisor App Cliente | Folha de seção “App Cliente” | Separar as 7 telas da família das 7 do Desk | — | Projeção cliente | Não é rota | DEMO/local | Nenhuma | `DEMO_OU_LOCAL` | — | Histórico | — | Preservar | Nulo |

### Páginas 3–9 — App Cliente (taxonomia aprovada)

| Página | Elemento | Intenção | Grupo Desk (dono interno) | Superfície | Equivalente atual | Tipo | Fonte | Realidade | Radar | Visibilidade | Duplicidade | Convivência | Risco |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3. Home | Header “Sua jornada” + nome + “Caso ativo” | Porta de entrada humana | Pessoas & Casos | Projeção cliente `/portal` | `portal-shell` + `COPY_TELAS.home` | Operação (projeção) | `app_projections` / portal sanitizado | `DADO_ATUAL_PARCIAL` | Experiência e entrega | Cliente aprovado | Desk `/casos/$id` não deve copiar este layout | Manter linguagem Home; progresso só com projeção | Alto se vazar gate interno |
| 3. Home | Barra “Progresso da jornada” | Sentido de avanço sem score jurídico | Pessoas & Casos | Cabeçalho do Home | Barra no mockup visual; portal usa progresso derivado da jornada publicada | Indicador vivo | Marcos/entregas **liberados** | `DADO_ATUAL_PARCIAL` | Jornada e marco (projeção) | Cliente aprovado | Radar % não pode ser o mesmo número | Conectar à jornada publicada; sem % de elegibilidade | Médio se reusar Radar |
| 3. Home | Lista “Próximos passos” (Você / Nós) | Próxima ação compreensível | Pessoas & Casos | Fila do Home | Pedidos de documento + próxima etapa sanitizada | Fila | `portal_document_requests` + projeção | `DADO_ATUAL_PARCIAL` | Experiência e entrega | Cliente aprovado | Checklist interno `/tarefas` | Contextualizar: cliente vê só o autorizado | Médio |
| 3. Home | Card “N pessoas conectadas” | Valor genealógico visível | Inteligência & Pesquisa (produz) / Pessoas & Casos (exibe) | Home + Árvore | Contagem da árvore publicada | Indicador vivo | Pessoas/relações **liberadas** | `DADO_ATUAL_PARCIAL` | Evidência e pesquisa (projeção) | Cliente aprovado | Árvore (pág. 6) | Badge no Home; detalhe na Árvore | Baixo |
| 3. Home | “Recebidos recentemente” | Achados/microentregas liberados | Inteligência & Pesquisa | Home | Publicações tipo achado | Operação | `app_projections` / deliverables | `DADO_ATUAL_PARCIAL` | Experiência e entrega | Cliente aprovado | Biblioteca interna | Manter; nunca rascunho | Alto se publicar sem revisão |
| 4. Jornada | Duas colunas História × Seu caso | Continuidade familiar + processo | Pessoas & Casos | `/portal/jornada` | `routes/portal/jornada.tsx` | Operação contextual | Timeline publicada + marcos do caso | `DADO_ATUAL_PARCIAL` | Jornada e marco | Cliente aprovado | Planejador interno (não projetar cru) | Preservar visual; dados do caso/projeção, não cronograma fictício | Alto se inventar 1820–2024 |
| 4. Jornada | Marcos “União de Ramos” | Destacar encontro de linhagens | Inteligência & Pesquisa | Detalhe da jornada | Só se houver achado publicado com esse tipo | Inteligência | Evidência liberada | `SEM_DADO_SUFICIENTE` até publicação | Evidência e pesquisa | Cliente aprovado | Radar eixo Conexões | Preservar como referência visual; preencher só com achado | Médio |
| 5. Radar (App) | Teia 6 eixos: Documentação, Origem, Conexões, Elegibilidade, Memória, Legado | Leitura visual da jornada, não parecer | Pessoas & Casos (exibe) / Inteligência (alimenta) | `/portal/radar` | `radar-seis-eixos.ts` + `RadarSeisEixos` | Indicador vivo | Docs liberados + projeções | `DADO_ATUAL_PARCIAL` | Camada Radar de caso (projeção) | Cliente aprovado | `radar-eixos.ts` (4 eixos história/documentos/estratégia/próximos) ainda existe | Manter 6 eixos do mockup; **não** chamar de elegibilidade jurídica | Alto — Elegibilidade hoje é média dos outros 5, não parecer |
| 5. Radar (App) | Cards % por eixo | Explicar cada fator | Idem | `/portal/radar` | Mesmo módulo; eixos sem denominador viram 0/100 | Indicador vivo | Idem | `DADO_ATUAL_PARCIAL` | Radar de caso | Cliente aprovado | Qualidade interna 4 eixos | Sem percentual fino onde não há teto | Médio |
| 6. Árvore | G1–G5, 31 possíveis | Estrutura familiar | Pessoas & Casos + Inteligência | `/portal/arvore` | Portal árvore; teto `TETO_ANCESTRAIS_G1_G5` | Operação | Pessoas/relações publicadas | `DADO_ATUAL_PARCIAL` | Evidência e pesquisa | Cliente aprovado | `/nucleos` interno | Árvore aprovada permanece; Desk vê o núcleo cru | Alto se expor terceiro sem regra |
| 7. Documentos | Lista entregue / pendente / em revisão | Acervo da família | Pessoas & Casos + Inteligência | `/portal/documentos` | Portal documentos + solicitações | Operação | `documents` + pedidos com `liberado_cliente` | `DADO_ATUAL_PARCIAL` | Experiência e entrega | Cliente aprovado | `/evidencias` interno | Separar documento, evidência, achado, liberação | Médio — metadado ≠ upload |
| 8. Legado | Biblioteca de conteúdo / premium | Memória contínua | Inteligência & Pesquisa | `/portal/legado` | Portal legado + publicações | Inteligência | Conteúdo aprovado | `DADO_ATUAL_PARCIAL` | Experiência e entrega | Cliente aprovado | `/biblioteca` Desk | Não promete terapia nem êxito jurídico; SKU só se homologado | Médio |
| 9. Conta | Perfil, plano, alertas pessoais | Área da pessoa | Pessoas & Casos / Governança (acesso) | `/portal/conta` | `COPY_TELAS.conta` + rota conta | Administração (cliente) | Perfil portal / acessos | `DADO_ATUAL_PARCIAL` | — | Cliente aprovado | `/configuracoes` Desk | Não renomear para Acesso | Baixo |

Barra inferior do App (ícone + rótulo, as 7 abas) é o **nível 1 do cliente**. Entregas / Fase 01 / Fase 02 existem como rota mas **saíram da barra** — convivência: detalhe contextual, não aba.

### Páginas 10–17 — Desk Intelligence (taxonomia aprovada)

| Página | Elemento | Intenção | Grupo | Superfície | Equivalente atual | Tipo | Fonte | Realidade | Radar | Visibilidade | Duplicidade | Convivência | Risco |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10. Divisor Desk | Folha “Desk Intelligence” | Separar operação interna | — | — | Não é rota | DEMO/local | Nenhuma | `DEMO_OU_LOCAL` | — | Histórico | — | Preservar | Nulo |
| 11. Visão Geral | Sidebar 7 itens (visual) | Linguagem aprovada do Desk | Os 6 grupos **traduzem** os 7 itens | Nível 1 operacional | `GRUPOS_DESK` (6) + `TELAS_DESK_MOCKUP` (7, só taxonomia) | Navegação | — | `DADO_ATUAL_CONFIRMADO` (6 grupos no menu) | — | Interno | Protótipo `desk-mockup.tsx` (outra IA) | Manter os 7 **nomes** nas telas; menu = 6 grupos | Alto se voltar às 7 abas e perder Comercial/Pesquisa/Formalização |
| 11. Visão Geral | KPI Casos ativos | Ver a carteira viva | Hoje | Cabeçalho `/painel` | `painelCadencia` → `crm_casos` | Indicador vivo | Caso | `DADO_ATUAL_CONFIRMADO` | Casos em bloqueio (agregado) | Interno | `/casos` conta a lista | Manter; abre `/casos` | Baixo |
| 11. Visão Geral | KPI Alertas pendentes | Sinal sem envio automático | Hoje | Cabeçalho `/painel` | `listarAlertas({ status: "pending" })` → `case_alerts` | Indicador vivo | Caso (alertas) | `DADO_ATUAL_CONFIRMADO` (count); lista limitada a 5 no bloco | Carteira / bloqueio | Interno | `/alertas` lista completa | Manter; mesmo escritor | Baixo |
| 11. Visão Geral | KPI Receita do mês (mockup R$ 18.400) | Volume financeiro do período | Formalização & Financeiro (casa) / Governança (fórmula) | **Não** no topo do Hoje | `/financeiro`; removido do cockpit | Métrica agregada | Fatura/pagamento confirmado | `SEM_DADO_SUFICIENTE` no Hoje (honesto) | Financeiro (caso) | Interno | Mockup visual ainda mostra o card | Preservar no mockup; no Desk só com cobertura + drill-down | Alto se recolocar número de proposta |
| 11. Visão Geral | KPI Conversão 34% | Saúde comercial | Marketing & Comercial / Governança (fórmula) | `/conversao` | Funil por `conversion_events` | Métrica agregada | Lead / eventos | `DADO_ATUAL_PARCIAL` na rota; **fora** do topo do Hoje | Comercial em atenção | Interno | Mockup 34% é fixture | Preservar visual no PDF; Desk usa funil real ou SEM_DADOS | Alto se copiar 34% |
| 11. Visão Geral | Cards Vencidos / Vence hoje / Sem responsável / Exceções / SLA | Decisão do dia | Hoje | Cabeçalho + fila | `cardsHoje` + `DESTINO_CARD_HOJE` | Indicador vivo | **Lead** `proxima_acao_em` (vencidos); casos sem dono; filas de bloqueio; SLA = `null` | Vencidos: `DADO_ATUAL_PARCIAL` (não é marco do Planejador). SLA: `SEM_DADO_SUFICIENTE` | Marcos / Comercial / Bloqueio | Interno | `/tarefas` não é mais o destino dos vencidos (agora `/calls`) | Manter cards; **não** fingir que são marcos do `case_plans` | Alto se “corrigir” prazo sem cotejar Planejador |
| 11. Visão Geral | KPI Leads sem próxima ação / Exceções e bloqueios | Cockpit operacional pós-patch | Hoje | Cabeçalho | Filas `leads_sem_proxima_acao` e exceções críticas | Indicador vivo | Lead / filas | `DADO_ATUAL_CONFIRMADO` | Comercial / Bloqueio | Interno | Funil `/conversao` | Manter; abrem Calls e `/ops-excecoes` | Baixo |
| 11. Visão Geral | Tabela “Achados aguardando leitura” (mockup) | Fila humana de achados | Hoje + Inteligência | Fila `/painel` + `/alertas` | `AlertasPrioritariosDoPainel` | Fila | `case_alerts` | `DADO_ATUAL_CONFIRMADO` | Pesquisa em atenção | Interno | Pesquisa módulo | Conectar; não duplicar tarefa | Baixo |
| 11. Visão Geral | “Prioridades de hoje” (mockup) | Lista com dono e urgência | Hoje | Fila priorizada | `filaPriorizada` + RPC no **texto** de casos | Fila | Lead + caso documental; Planejador **não** ordena | `DADO_ATUAL_PARCIAL` | Carteira | Interno | Checklist `/tarefas` | Manter uma fila; Planejador só depois de decisão | Médio |
| 11. Visão Geral | Subabas mockup: Radar / Financeiro / Integrações | Módulos profundos sem 8ª aba | Hoje / Formalização / Governança | Camada / rota própria | Radar → `/qualidade`; Financeiro → `/financeiro`; Integrações → `/integracoes` | Vários | Ver linhas próprias | Parcial | Ver Radar | Interno | `desk-mockup.tsx` empilha tudo em Visão Geral | Não reempilhar no Hoje | Médio |
| 12. Casos 360 | Tabela carteira (país, estágio, saúde, próxima ação, ticket) | Centro da operação | Pessoas & Casos | `/casos` | Lista + RPC `proxima_acao_prioritaria` (nível plano **omitido**) | Operação | `crm_casos` | `DADO_ATUAL_PARCIAL` | Todos os eixos de caso (entrada) | Interno | Ticket financeiro = Formalização | Saúde = Radar de caso, não score; ticket não decide a fila | Alto alterar RPC sem ela |
| 12. Casos 360 | Ficha (país, trilha, estágio, produto-pai, responsável, próxima ação) | Um caso, um contexto | Pessoas & Casos | `/casos/$id` | Ficha + bloco Jornada/`case_plans` | Operação | Caso + Planejador | `DADO_ATUAL_PARCIAL` | Jornada e marco | Interno | Preparar contrato (outra rota) | Planejador grava aqui; contrato só ponte | Médio |
| 12. Casos 360 | Pessoas do núcleo / dependentes | Família do caso | Pessoas & Casos | Ficha + `/nucleos` | `nucleos_familiares`, dependentes | Operação | Pessoa / núcleo | `DADO_ATUAL_CONFIRMADO` | Evidência (contexto) | Interno | Validação jurídica (representação) | Núcleo aqui; pendência legal na Inteligência | Alto merge automático |
| 12. Casos 360 | Linha do tempo do caso | História operacional | Pessoas & Casos | Ficha | Eventos/jornada do caso | Operação | Caso + Planejador | `DADO_ATUAL_PARCIAL` | Jornada | Interno | Jornada do App | Visual do mockup; dado atual, não fixture Ana | Médio |
| 12. Casos 360 | Subaba Pesquisa (mockup) | Prova no contexto do caso | Inteligência & Pesquisa | `/pesquisa-modulo` + âncora na ficha | Módulo vivo de pesquisa | Operação | `research_*` / evidências | `DADO_ATUAL_CONFIRMADO` | Evidência e pesquisa | Interno | Biblioteca | Não copiar a pesquisa para dentro de Casos como 2º módulo | Baixo |
| 12. Casos 360 | Subaba Formalização (mockup) | Ponte para contrato | Formalização & Financeiro | `/casos/$id/contrato/preparar` | Um form de preparação | Operação | Planejador + proposta + params | `DADO_ATUAL_PARCIAL` | Formalização | Interno | `/contratos` lista | Casos aponta; Formalização executa | Alto segundo form |
| 12. Casos 360 | Subaba Go-live (mockup) | Gates de ativação | Pessoas & Casos | `/casos` #jornada + onboarding | `case_activation_checks` / onboarding | Operação | Ativação | `DADO_ATUAL_PARCIAL` | Experiência e entrega | Interno | App Checklist | Não é score de prontidão para o cliente | Médio |
| 13. Checklist | Colunas Confirmar / Em revisão / Pendente crítico | Execução por prioridade | Pessoas & Casos | `/tarefas` | `tarefas` | Fila | Tarefa (deve ter `case_id`) | `DADO_ATUAL_CONFIRMADO` | Bloqueio / entregas | Interno | Fila do Hoje (precedência) | Uma lista; Hoje mostra recorte do dia | Médio se tarefa órfã |
| 13. Checklist | Subaba AppCliente (mockup) | O que o cliente vê | Pessoas & Casos | `/app-cliente-como-pessoa` + `/acessos-portal` | Prévia staff | Operação | `app_projections` | `DADO_ATUAL_CONFIRMADO` (staff) | Experiência | Interno | DEMO `/app-cliente-demo` | Demo só na conta; real aqui | Baixo |
| 13. Checklist | SLA D10/D14 (mockup) | Cadência com dono | Pessoas & Casos | `/ops` + card SLA do Hoje | `ops_microentregas` / cadência; card SLA ainda `null` | Indicador vivo | Microentrega / tarefa | `SEM_DADO_SUFICIENTE` no card; parcial nas filas | Entregas em risco | Interno | Alertas D10/D14 derivados | Não reabrir CA OPS como regra | Médio |
| 14. Validação Jurídica | Matriz 12 temas (mockup) | Revisão humana de cláusula | Inteligência & Pesquisa | `/matriz-juridica` | Matriz jurídica versionada | Inteligência | Regras/temas jurídicos | `DADO_ATUAL_PARCIAL` | Jurídico | Interno | Matrizes **contratuais** em Formalização | Cidadania/trilha aqui; individual/casal/familiar **não** | Alto fundir forms |
| 14. Validação Jurídica | Dependentes / representação (mockup) | Pendência legal da família | Inteligência + Pessoas & Casos | Matriz + ficha | Dependentes do caso | Operação | Caso / pessoa | `DADO_ATUAL_PARCIAL` | Jurídico / bloqueio | **Interno** (não App) | Checklist crítico | Sinal no Radar de caso; edição no caso | Médio |
| 15. Radar Interno | Matriz de prioridade + radares individuais | Carteira e caso exigem decisão | Pessoas & Casos (tela) + Hoje (agregado) | `/qualidade` + camada (proposta) | `MatrizPrioridadesConectada` + `PainelQualidade` | Indicador vivo | `crm_casos` + quality | `DADO_ATUAL_PARCIAL` | Radar de carteira **e** de caso | Interno | 4 eixos canônicos em `radar-eixos.ts` ≠ 6 eixos do App ≠ 7 eixos deste prompt | **Restaurar como camada** (mapa §2); não criar aba Radar | Alto score opaco |
| 16. Alertas | Fila de achados + “Preparar” | Sinal → tela humana | Hoje | `/alertas` | `listarAlertas` / `case_alerts` | Fila | Caso | `DADO_ATUAL_CONFIRMADO` | Pesquisa / entregas | Interno | Bloco do Painel | Uma fonte; Painel = recorte | Baixo |
| 16. Alertas | Rascunhos de comunicação (mockup) | Nada sai sozinho | Hoje / Pessoas & Casos | `/alertas` + `/atendimento` | Fila humana; WhatsApp bloqueado | Operação | Templates / fila | `DADO_ATUAL_PARCIAL` | Experiência | Interno | Biblioteca de Mensagens | Rascunho ≠ envio | Alto WhatsApp |
| 17. Biblioteca Mestre | Acervo, governança de conteúdo, F1/F2 (mockup) | Produção com vínculo a caso | Inteligência & Pesquisa | `/biblioteca` | `master_library_items` + subáreas; Top 30 **fora da face** (`naFace: false`) | Inteligência | Biblioteca + bases + trilhas + regras | `DADO_ATUAL_PARCIAL` | Evidência | Interno | Catálogo homologado (Formalização) | Bases/dicionários/trilhas = Central de Inteligência; admin = Governança | Médio reexibir Top 30 |

---

## 2. Entregável — mapa do Radar

O Radar **não** é a 7ª aba do Desk nem a tela `/qualidade` sozinha. É uma **camada** com dois níveis. O visual do mockup (teia / matriz) permanece; a fonte e o drill-down é que tornam a camada verdadeira.

### 2.1 O que existe hoje (fato)

| Superfície | O que o código faz | Eixos | Fonte | Lacuna frente a este prompt |
|---|---|---|---|---|
| App `/portal/radar` | Teia de **6** dimensões do mockup | Documentação, Origem, Conexões, Elegibilidade, Memória, Legado | Docs liberados + projeções (`radar-seis-eixos.ts`) | Elegibilidade = média dos outros 5 — **não** é eixo jurídico. Sem dono/prazo/ação seguinte |
| Desk `/qualidade` | Matriz de prioridade + qualidade | **4** eixos de `radar-eixos.ts` (história, documentos, estratégia, próximos) | `crm_casos` + quality | Não é o Radar de carteira deste prompt; não lê Planejador como marco |
| Hoje `/painel` | Cards e filas | Sem teia | Leads, alertas, exceções | Agrega parte da carteira, mas **não** se apresenta como Radar |
| Caso 360 | Síntese + próxima ação RPC | Sem eixos nomeados do prompt | Caso + RPC (plano omitido) | Falta o Radar de caso com 7 eixos, fonte, data, responsável e ação |
| `desk-mockup.tsx` | Teia DEMO com % Ana/João/Sophia | 6 eixos do mockup, números fictícios | Nenhuma | `DEMO_OU_LOCAL` — não usar em produção |

### 2.2 Radar de carteira (a restaurar como leitura, sem aba nova)

**Onde aparece:** Hoje (resumo) e, se couber, Marketing & Comercial (recorte comercial). Drill-down obrigatório em lista — nunca só cor.

| Eixo (prompt) | Leitura agregada permitida | Fonte atual possível | Drill-down | Estado hoje | Lacuna |
|---|---|---|---|---|---|
| Casos em bloqueio | Casos com bloqueio ativo por domínio | Filas de bloqueio + exceções + catalogo bloqueado | `/casos` / `/ops-excecoes` | `DADO_ATUAL_PARCIAL` (muito ainda é eixo de **lead**) | Separar bloqueio de caso vs lead |
| Marcos próximos/vencidos | Marcos do **Planejador** na janela | `case_plans` existe; Hoje **não** conta marco | Lista por data/responsável/caso | `ERRO_DE_FONTE` se o card “Vencidos” for lido como marco | Card atual = `leads.proxima_acao_em` |
| Pesquisa em atenção | Lacuna, conflito, pedido vencido | `pesquisa-modulo`, evidências, `case_alerts` | Dossiê / pessoa / solicitação | `DADO_ATUAL_PARCIAL` | Sem agregado único no Hoje |
| Formalização em atenção | Params, revisão, assinatura | `/contratos`, preparar contrato | Caso + etapa | `DADO_ATUAL_PARCIAL` | Não está no Radar; está em Formalização |
| Entregas em risco | Microentrega vencida / sem dono | `ops_microentregas`, tarefas | Entrega + responsável | Card SLA = `SEM_DADO_SUFICIENTE` | Ligar consulta sem inventar zero |
| Comercial em atenção | Lead/Call/proposta sem próxima ação | `/calls`, `/leads`, `/propostas`, KPI do Hoje | Lead/Call/proposta | `DADO_ATUAL_CONFIRMADO` no recorte comercial | Não misturar com marco do caso |

### 2.3 Radar de caso (a restaurar na ficha)

**Onde aparece:** Pessoas & Casos → `/casos/$id`, com pontes para Inteligência e Formalização. Cada sinal: eixo, fonte, data, responsável, ação seguinte. Sem score único.

| Eixo (prompt) | Pergunta | Fontes permitidas (já no repo) | Resultado visível | Estado | Não fazer |
|---|---|---|---|---|---|
| Jornada e marco | Em que etapa está e qual marco vem? | `case_plans` + `crm_casos` | Etapa, marco, prazo, dono | Planejador grava; RPC **omite** nível plano | Inventar cronograma |
| Bloqueio | O que impede agora? | Gates, checklist, exceção, requisito | Motivo, dependência, dono | Parcial na ficha | Gate cerimonial |
| Evidência e pesquisa | Qual lacuna impede confirmação? | Pessoas, fontes, evidências, pedidos | Lacuna + próxima investigação | Módulo de pesquisa vivo | Parecer automático |
| Jurídico | Há revisão/risco? | `matriz-juridica`, regras versionadas | Estado de revisão | Parcial | Elegibilidade automática |
| Formalização | O que falta para proposta/contrato? | Proposta, params, contrato, anexos | Etapa pendente | Ponte `/contrato/preparar` | Segundo form |
| Financeiro | Há confirmação ou despesa com impacto? | `invoices` / `payments` confirmados | Estado + fonte | Parcial | Previsão ou SKU como pagamento |
| Experiência e entrega | O cliente recebeu ou aguarda? | Microentregas, tickets, publicações | Próxima entrega | Portal + atendimento | Push automático |

### 2.4 Visibilidade

| Público | Pode ver | Não pode ver |
|---|---|---|
| Equipe (Radar interno) | Fato, fonte, data, dono, ação | Score de cidadania, hipótese sem marca, senha, dado de outra org |
| App Cliente (Radar da jornada) | 6 eixos do mockup com projeção autorizada, progresso, pendência compreensível | Score jurídico, força probatória, risco interno, log, financeiro sensível, rascunho |
| Governança | Fórmula, cobertura, versão do eixo | Não opera o dia pelo dicionário |

---

## 3. Entregável — mapa de convivência visual

Hierarquia (prompt §6), aplicada ao Desk atual:

```text
Nível 1 — seis grupos (sidebar)
Nível 2 — resumo, fila e ações do grupo
Nível 3 — Lead, Pessoa, Caso, Pesquisa, Proposta ou Contrato
Nível 4 — evidência, auditoria, dicionário, DEMO
```

### 3.1 O que do mockup aparece em cada grupo

| Grupo | Cabeçalho (nível 2) | Fila (nível 2) | Detalhe contextual (nível 3) | Governança (nível 4) |
|---|---|---|---|---|
| **Hoje** | Casos ativos, alertas, leads sem ação, exceções; cards vencidos/hoje/dono/SLA | Fila priorizada, alertas prioritários, 3 sinais do CRM Vivo | Abre caso, Call ou alerta — não edita contrato | Fórmulas de métrica **não** moram aqui |
| **Marketing & Comercial** | Funil/saúde em `/conversao` (não % mágico) | Leads, Calls, propostas, follow-up | Lead / Discovery / proposta; CA-04 + dicionário no mesmo sistema | Origem canônica, CAC/ROI SEM_DADOS |
| **Pessoas & Casos** | Carteira + saúde (matriz em `/qualidade`) | Checklist, exceções, cadência | Caso 360, núcleo, pessoa, App como pessoa, Radar de caso (proposta) | Papéis de portal |
| **Inteligência & Pesquisa** | Biblioteca + bases + trilhas | Pendências de pesquisa / evidência | Dossiê, árvore interna, Validação Jurídica, assistente | Dicionários de termo (não Top 30) |
| **Formalização & Financeiro** | Contratos + catálogo homologado + financeiro | OS, divergências, pendência de cobrança | Preparar contrato do caso; matrizes individual/casal/familiar | Preço/cobertura — sem Planilha como decisão |
| **Governança & Administração** | Config, equipe, métricas | — | Integrações, importações | DEMO e administração — **não** o CA-04; Catálogo 30 só no GitHub |

### 3.2 App Cliente (não é grupo do Desk)

| Aba mockup | Nível | O que preserva do PDF | O que o Desk alimenta |
|---|---|---|---|
| Home | 1 | Status, progresso, próximos passos, pessoas, recebidos | Projeção + pedidos |
| Jornada | 1–3 | Duas linhas História × Caso | Marcos publicados |
| Radar | 1–2 | Teia 6 eixos | Só dado liberado |
| Árvore | 3 | G1–G5 | Pessoas publicadas |
| Documentos | 3 | Checklist da família | Docs/pedidos liberados |
| Legado | 3 | Biblioteca de memória | Conteúdo aprovado |
| Conta | 4 | Perfil e acesso | Sessão portal |

### 3.3 Padrões visuais a preservar vs a corrigir

**Preservar do PDF:** cards de decisão; alerta com texto, não só cor; timeline no caso; Radar como fatores; árvore/pessoas/documentos/achados; separação interno × revisão × liberado; mesma taxonomia desktop/mobile.

**Corrigir na convivência (sem apagar):** números DEMO e 34%/R$ 18.400 do protótipo; dicionários na face operacional; filas duplicadas; CA OPS / Planilha / Top 30 / Pareto como fundamento.

---

## 4. Entregável — regressões (aprovado × atual)

| Elemento aprovado | O que aconteceu | Realidade | Efeito |
|---|---|---|---|
| Sidebar Desk com 7 itens visíveis | Menu passou a 6 grupos; os 7 nomes vivem como telas/rótulos | Convivência **intencional** | Risco de parecer “sumiu o Radar / a Biblioteca” se o rótulo da tela não repetir o mockup |
| KPI Receita e Conversão no topo da Visão Geral | Saíram do Hoje (cockpit 10/09) | `SEM_DADO_SUFICIENTE` no cockpit; funil/financeiro nas casas certas | Visual do PDF não está copiado no topo — correto até haver cobertura |
| Vencidos = marcos do Planejador | Continua sendo `leads.proxima_acao_em` | `DADO_ATUAL_PARCIAL` / risco de `ERRO_DE_FONTE` se lido como marco | Prioridade do prompt anterior **ainda aberta** |
| Radar Interno = matriz + radares individuais com fatores | `/qualidade` é matriz + qualidade; 4 eixos distintos do App | `DADO_ATUAL_PARCIAL` | Camada deste prompt **não implementada** (e não deve ser nesta fase) |
| Radar App = 6 eixos com explicação | Existe teia; Elegibilidade é média, não parecer | `DADO_ATUAL_PARCIAL` | Linguagem “elegibilidade” do PDF é mais forte que a fonte |
| Biblioteca = produção por caso, sem catálogo de SKU | Top 30 escondido da face; subárea ainda no registro | `LEGADO` arquivado | Reabrir a subárea reintroduz SKU na Inteligência |
| Checklist vinculado a `case_id` | Tarefas existem; link ao caso na lista ainda frágil (cotejo anterior) | `DADO_ATUAL_PARCIAL` | Tarefa órfã some do Radar de caso |
| Funil de leads na Visão Geral (taxonomia) | Funil vive em `/conversao` (Comercial) | `DADO_ATUAL_CONFIRMADO` na casa certa | PDF mistura cockpit e CRM — convivência: Comercial, não segundo funil no Hoje |
| Integrações / Financeiro como subaba da Visão Geral (protótipo interativo) | Rotas próprias em Governança e Formalização | Correto operacionalmente | Não recolocar no Hoje |
| Conta no App (7ª aba) | Presente na barra real | `DADO_ATUAL_PARCIAL` | Mockup interativo do App (`cliente-mockup.tsx`) só tem 6 tabs — PDF/taxonomia mandam 7 |
| Números 23 / 7 / 18.400 / 34% do PDF | Fixtures do mockup | `DEMO_OU_LOCAL` | Qualquer tela que os mostre como reais é regressão |

---

## 5. Entregável — mapa de duplicidades

| Função | Superfícies que repetem | Fonte operacional única proposta | O que não apagar |
|---|---|---|---|
| Próxima ação do caso | Ficha, lista, Painel (texto RPC), Planejador, RPC (nível 7 omitido) | RPC + `case_plans` quando a Proprietária autorizar o nível plano | Histórico da RPC |
| Próxima ação do lead | `/calls`, `/leads`, `/proximas-acoes`, cards Vencidos do Hoje | `leads` via Painel de Calls | Não fundir com marco do caso |
| Alertas | `/painel` recorte + `/alertas` completo | `case_alerts` / `listarAlertas` | Nenhum escritor novo |
| Checklist / tarefas do dia | `/tarefas` + fila do Hoje | `tarefas` com `case_id`; Hoje só recorte | CA OPS docs |
| Radar | App 6 eixos, Desk 4 eixos, matriz `/qualidade`, teia DEMO | Camada deste doc: carteira no Hoje + caso na ficha; App = projeção | Não apagar `/qualidade` nem `/portal/radar` |
| Pesquisa | Ficha, `/pesquisa-modulo`, `/pesquisa`, Biblioteca | `/pesquisa-modulo` = trabalho; `/pesquisa` = dossiê Legado; Biblioteca = acervo | Rotas |
| Contrato | Ficha ponte, `/contratos`, preparar, matrizes | Um form `/casos/$id/contrato/preparar` | Matrizes de composição |
| Catálogo / preço | `/catalogo`, homologação, Catálogo 30, Planilha (texto) | `product_catalog` + produto-pai | Planilha e Top 30 só em Governança; dicionário no Comercial só referencia o catálogo |
| CA-04 / CRM / Calls | `/calls`, `/leads`, `/crm-mestre`, `/governanca/dicionario-calls-crm` | Tabela `leads` + regras do dicionário | Não apagar o mapa CA-04; não criar segunda ficha |
| App como pessoa | `/app-cliente-como-pessoa` vs `/app-cliente-demo` | Real = staff + caso; Demo = conta | Demo |
| Métricas | `/metricas` + cards do Hoje + `/conversao` | Hoje = decisão; Conversão = funil; `/metricas` = Governança | Não duas verdades no Hoje |
| Núcleo / árvore | `/nucleos` interno vs `/portal/arvore` | Mesmas pessoas; projeção filtrada | Não merge automático |

---

## 6. Entregável — patch mínimo proposto

P1–P6: só rótulo, agrupamento, visibilidade e drill-down do Radar/mockup — **ainda não aplicados**.  
P7: aplicado nesta correção, com autorização expressa da Proprietária. Sem rota nova, tabela, RPC, merge ou exclusão.

| # | Mudança | Impacto | Risco | Depende de |
|---|---|---|---|---|
| P1 | Na ficha do caso, um bloco “Radar do caso” que **só lista** os 7 eixos com link para a superfície já existente (Planejador, pesquisa, matriz, preparar contrato, financeiro, portal) e o texto `SEM_DADO_SUFICIENTE` quando a fonte faltar | Linguagem do mockup volta sem score | Baixo se for só links | Aprovação |
| P2 | No Hoje, um título “Radar da carteira” sobre os cards **já existentes**, com uma linha de eixo (comercial / bloqueio / alerta) — sem teia nova e sem contar `case_plans` ainda | O mockup “Radar Interno” ganha casa no cockpit | Médio se o título implicar marco do Planejador | Não ligar vencidos a `case_plans` neste patch |
| P3 | Repetir o rótulo aprovado nas cascas: `/painel` pode continuar “Hoje” no menu e “Visão Geral” no título da tela (já há de-para de cabeçalho); `/qualidade` já se chama Radar Interno | Quem busca o PDF acha a palavra | Baixo | Nenhum |
| P4 | Badge de cobertura em qualquer card que ainda possa ser lido como DEMO (prévia App, `/mockup`, fixtures) | Evita número local como realidade | Baixo | Inventário de fixtures |
| P5 | No Checklist, link explícito caso ← tarefa (se ainda faltar na lista) | Fecha a regra `case_id` do mockup | Baixo | Conferir UI atual |
| P6 | Texto de Elegibilidade no App: deixar explícito que o eixo **não** é parecer (já é média) | Alinha PDF × fonte | Baixo / copy | Aprovação de wording |
| P7 | **Aplicado:** CA-04 e dicionário entram em Marketing & Comercial com `/calls`; o dicionário avalia o lead vivo; fontes CA-04 usam catálogo homologado no lugar da Planilha | O CRM deixa de parecer arquivo e a regra aparece na call | Médio se alguém ler pendência do dicionário como trava de gravação | Sem tabela nova; URLs iguais |

**Fora deste patch (precisa de outra decisão):** contar marcos de `case_plans` no Hoje; unificar 4 eixos × 6 eixos × 7 eixos; ligar SLA; recolocar Receita/Conversão no topo. Harmonizar vocabulário restante das listas CA-04 (rótulos) × CATALOGOS (slugs) sem migrar valor persistido.

**Checklist de teste do patch (quando autorizado):** §7, itens 1–8, só nas telas tocadas.

---

## 7. Entregável — roteiro de testes

P1–P6 ainda sem sessão autenticada. P7 coberto pelos testes de navegação, dicionário e Painel de Calls.

| # | O quê | Desktop | Mobile | Passa se |
|---|---|---|---|---|
| 1 | Navegação Desk | 6 grupos na sidebar | Mesmos 6, sem 7ª aba Radar | URLs antigas abrem; nada 404 |
| 2 | Navegação App | — | 7 abas: Home, Jornada, Radar, Árvore, Documentos, Legado, Conta | Sem Entregas/Fase na barra |
| 3 | Filtros Hoje | Responsável / área / etapa | Idem | Não inventa zero |
| 4 | Fonte real | Casos, alertas, leads, calls | — | Número abre lista da mesma tabela |
| 5 | Ausência | Org sem alertas / sem plano | — | `SEM_DADO_SUFICIENTE` ou “nenhum”, nunca 34% / R$ 18.400 |
| 6 | DEMO/local | `/mockup`, `/app-cliente-demo` | — | Selo DEMO; não mistura com `/painel` |
| 7 | Ação contextual | Card → Calls/casos/alertas; ficha → preparar contrato / pesquisa | Tap equivalente | Uma casa por função |
| 8 | Isolamento | Troca de organização / caso | Prévia staff ≠ sessão cliente | Sem dado cruzado; App sem log/financeiro/hipótese |

---

## 8. Critérios de aceite deste documento

| Critério do prompt | Como foi atendido |
|---|---|
| 17 páginas na matriz, sem pulo | Páginas 1–17 na §1 (capa, 2 divisores, 7 App, 7 Desk) |
| Todo elemento em um grupo, contexto ou Governança | Coluna “Grupo” / “Superfície” |
| Radar como camada carteira + caso | §2 — mapa, fontes, drill-down, lacunas; **sem** aba nova |
| Realidade em cada card | Coluna “Realidade” |
| Marketing, Pessoas & Casos, Inteligência explícitos | §0 e §3 — não viram só número |
| Bases, Biblioteca, Dicionários, Trilhas = Inteligência | §0, §1 pág. 17, §3 |
| CA OPS / Planilha / Matriz Operacional / SKU legado ≠ fonte vigente | §1 nota + §5 catálogo |
| Sem alteração de schema/RLS/preço/contrato | Mantido. Código só no recorte CA-04 + Calls + dicionário, após correção da Proprietária |
| Patch mínimo para decisão | §6 P1–P6 ainda à espera; **P7 aplicado** |

P1–P6 do Radar/mockup continuam à espera. A conversão do dicionário em regra viva do Painel de Calls foi a autorização desta rodada.
