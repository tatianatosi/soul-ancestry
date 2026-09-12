# De-para backend — Desk do Clube Ancestral

**Status:** rascunho  
**Versão:** v1.0  
**Data:** 2026-09-11  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte(s) de evidência:** imagens de referência e mockup visual revisado fornecidos na conversa; repositório `tatianatosi/recriacao-do-clube-ancestral` (estrutura e módulos existentes); `CA-CONN-01_base_existente_desk.md`; `04_TOP_SKUS_CANDIDATOS_Clube_Ancestral.md`; `05_CA06_Catalogo_Operacional_30_Clube_Ancestral.md`; `docs/auditorias/registro-canva-paginas-3-a-7-06-09.md`.  
**Escopo:** definição de de-para do **backend e Desk interno**, a partir do mockup visual revisado. O App Cliente em front-end é preservado como está.  
**Premissas:** um `caseId` estável é a âncora de dados; Desk e App Cliente consomem o mesmo registro canônico; conteúdo demonstrativo não pode ser apresentado como dado vivo; valores, links e preços só podem ser expostos quando conciliados.  
**Limites:** esta matriz não implementa banco, migrações, permissões, integrações de pagamento, CRM ou deploy; não homologa códigos Pantone sem o manual de marca oficial; não cria nem remove registros.  
**Próximos passos:** validar esta matriz; auditar schema/rotas reais; criar migration e camada de leitura compartilhada; implementar por blocos sem alterar o App Cliente.  
**Critério de aceite:** cada tela do Desk deve ler apenas entidades canônicas, preservar o `caseId`, declarar estado vazio/fonte dos KPIs, não duplicar CRM/financeiro/jurídico e não expor dados internos no App Cliente.

---

## 1. Decisão de produto

O mockup revisado não deve virar 11 bases nem 11 microprodutos. Ele deve operar como **um Desk unificado**, com páginas orientadas por domínio e dados conectados por `case_id`, `person_id`, `family_id`, `opportunity_id` e `contract_id`.

O principal ajuste em relação à versão que perdeu a “vida do Clube” é este:

- **Pesquisa volta a ser domínio central**, não card decorativo ou subaba residual.
- **Caso 360 é o ponto de convergência** de pesquisa, pessoas, documentos, proposta, contrato, financeiro, jurídico, tarefas e visão sanitizada do cliente.
- **Pessoa 360 e Família 360** são entidades próprias, ligadas ao caso, e não campos soltos.
- **Radar e matrizes** recebem dados derivados de evidências, gates e validações — jamais notas manuais sem fonte.
- **CRM vivo, Marketing e Financeiro** compartilham o mesmo funil econômico: origem → lead → discovery → oportunidade → proposta → contrato → cobrança → receita realizada/previsão.
- **App Cliente permanece visualmente como está**. O trabalho é criar o contrato de dados e a sanitização no backend, sem redesenho do front-end do cliente.

---

## 2. O que retirar

Estas remoções são de **composição e duplicação no Desk**, não autorização para apagar dados, rotas ou componentes existentes.

| Elemento atual/recente | Ação | Destino correto | Justificativa |
|---|---|---|---|
| Subabas genéricas repetidas em várias páginas | Retirar da navegação primária | Abas contextuais do Caso 360 ou filtros de tela | Evita 11 áreas que não conversam com o Desk simplificado |
| Cards sem fonte, dono ou ação seguinte | Retirar como KPI operacional | Estado vazio, fila de exceção ou card com fonte | Indicador sem definição gera falsa operação |
| “Pesquisa” reduzida a links, hipóteses ou biblioteca passiva | Retirar essa redução | Workspace de Pesquisa, evidências e dossiê do Caso 360 | Pesquisa é a essência do produto e precisa produzir evidência rastreável |
| Financeiro isolado do contrato/proposta/caso | Retirar visão desconectada | Financeiro por contrato e consolidação de receita | Cobrança e receita precisam ter origem contratual verificável |
| Jurídico isolado e sem vínculo com pessoas/documentos | Retirar | Validação jurídica ligada a `case_id`, pessoa, documento e contrato | O risco jurídico depende do caso concreto e de suas provas |
| Kanban comercial separado de origem de lead e receita | Retirar CRM de aparência | CRM vivo com eventos, etapas e vínculo financeiro | Marketing, vendas e receita devem fechar o mesmo ciclo |
| Radar puramente gráfico/decorativo | Retirar nota sem evidência | Radar derivado de matrizes e gates | A visualização deve explicar decisão, risco e bloqueio |
| Duplicações entre Caso 360, Pessoas & Famílias e Pesquisa | Retirar cópias locais de dados | Entidades canônicas com relacionamentos | Uma mudança deve refletir em toda a plataforma |
| KPIs de conversão, receita ou produtividade com dados demonstrativos não rotulados | Retirar da visão decisória | Tag “Dados demonstrativos” ou estados vazios | Não induzir decisão com número fictício |
| Logo improvisado, marca textual inconsistente ou azul dessaturado | Retirar do Desk | Ativo oficial de marca e token `navy` elevado | O produto deve usar a assinatura visual aprovada, não aproximações |

---

## 3. De-para tela a tela

### 3.1 Hoje — cockpit operacional

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Decisões prioritárias, tarefas de hoje, cadências atrasadas, casos sem próxima ação, atualizações prontas para revisão | Resumos duplicados de CRM, jurídico e financeiro sem ação | `tasks`, `case_next_actions`, `case_alerts`, `case_events`, `cases`, `users` | Casos sem próxima ação; tarefas vencidas; decisões pendentes; atualizações aguardando revisão. Cada linha exige `case_id`, responsável, prazo e ação seguinte |

### 3.2 Comercial / CRM Vivo

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Funil Leads → Discovery → Diagnóstico → Proposta → Contrato; origem; responsável; próxima ação; objeções; valor estimado; vínculo com família/pessoa/caso quando existir | Pipeline sem histórico de mudança, lead convertido em cópia separada de cliente/caso, valores sem proposta | `leads`, `lead_sources`, `crm_stage_history`, `opportunities`, `discovery_records`, `proposals`, `cases`, `people`, `families`, `tasks` | Leads por origem; conversão por etapa; tempo por etapa; taxa de discovery agendado/realizado; propostas emitidas/aceitas; pipeline ponderado. Nunca declarar receita realizada a partir de oportunidade |

### 3.3 Caso 360 — centralizador

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Resumo, jornada, participantes, linha do tempo, pesquisa, documentos, proposta/contrato, financeiro, jurídico, tarefas, próxima ação, visão cliente | Subtelas desconectadas que repetem o mesmo dado ou tabs vazias só para aumentar navegação | `cases`, `case_people`, `case_services`, `case_events`, `research_projects`, `documents`, `proposals`, `contracts`, `invoices`, `payments`, `legal_validations`, `tasks`, `client_portal_projection` | Saúde do caso; próxima ação; progresso por fase; documentos pendentes; gates jurídicos; saldo financeiro; nível de evidência. Tudo deve apontar para o mesmo `case_id` |

### 3.4 Pessoa 360

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Identidade, nomes históricos, eventos vitais, relações, casos ligados, documentos, fontes, confiança, pendências individuais | Dados de pessoa replicados manualmente dentro do caso ou no grafo | `people`, `person_names`, `person_events`, `relationships`, `person_documents`, `evidence_items`, `case_people` | Pessoas com identidade incompleta; fontes conflitantes; eventos sem documento; confiança de evidência por atributo. Confiança precisa registrar método e evidências de origem |

### 3.5 Pessoas & Famílias

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Núcleos familiares, grafo de parentesco, papéis no processo, agrupamento por família, vínculos com casos | Árvore apenas ilustrativa ou família como campo de texto sem relações | `families`, `family_members`, `people`, `relationships`, `case_people`, `cases` | Núcleos incompletos; vínculos a confirmar; participantes por caso; dependências entre processos. O grafo lê relações, não grava desenho como fonte de verdade |

### 3.6 Pesquisa — núcleo vivo

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Perguntas de pesquisa, hipóteses, plano, fontes, achados, evidências, citações arquivísticas, dossiê, lacunas, qualidade/confiança | Pesquisa tratada como biblioteca de links, caixa de notas ou atividade lateral | `research_projects`, `research_questions`, `research_hypotheses`, `research_tasks`, `sources`, `source_citations`, `evidence_items`, `findings`, `repositories`, `documents`, `case_research_links`, `person_research_links` | Cobertura de perguntas; evidências verificadas; hipóteses abertas/confirmadas/refutadas; fontes por repositório; documentos pendentes; confiança. Não usar “progresso” sem unidade definida |

### 3.7 Radar & Matrizes

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Radar de elegibilidade, evidência documental, risco consular, prioridade operacional e prontidão contratual; matrizes e gates explicáveis | Pontuações soltas, notas sem peso, sem fonte ou sem data de cálculo | `assessment_runs`, `assessment_dimensions`, `assessment_evidence_links`, `decision_gates`, `legal_validations`, `evidence_items`, `documents`, `case_alerts` | Score por dimensão, tendência, bloqueios, evidências faltantes, data de cálculo e responsável. O radar é sempre uma projeção do `assessment_run` vigente |

### 3.8 Jurídico & Contrato

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Escopo aprovado, participantes, responsabilidades, integridade das páginas Canva, assinaturas, itens de validação jurídica, divergências e gates | Contrato sem vínculo com proposta, verificação jurídica desconectada do caso, status manual sem evidência | `proposals`, `proposal_canva_pages`, `contract_scope_items`, `contracts`, `contract_parties`, `contract_signatures`, `legal_validations`, `legal_validation_items`, `documents`, `cases` | Propostas válidas; contrato pronto/não pronto; assinaturas pendentes; bloqueios jurídicos; completude do deck; divergência de escopo. Há evidência registrada de `proposal_canva_pages` para a proposta da Ana Luiza; ela não substitui conferência literal do Canva |

### 3.9 Financeiro — caso e operação

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Valor contratado, parcelas, recebido, em aberto, vencido, despesas externas, receita prevista, receita realizada, conciliação, previsão mensal e vínculo com lead/origem | Receita declarada por proposta não paga, cobrança desvinculada de contrato, custo misturado a despesa do cliente sem classificação | `commercial_conditions`, `contracts`, `contract_scope_items`, `billing_schedules`, `invoices`, `payments`, `payment_reconciliations`, `external_expenses`, `financial_events`, `opportunities`, `lead_sources` | Receita contratada; receita prevista; receita recebida; inadimplência; contas a vencer; contas vencidas; ticket médio pago; receita por origem/serviço. Cada número precisa de competência, moeda, status e fonte |

### 3.10 Marketing — funil entre leads e receita

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Campanhas, conteúdos, origem, UTMs, leads atribuídos, discovery, propostas, contratos, receita prevista e recebida; funil visual de marketing | Métricas de vaidade sem ligação a lead; “receita de campanha” sem regra de atribuição | `marketing_campaigns`, `marketing_content`, `tracking_attributions`, `lead_sources`, `leads`, `opportunities`, `proposals`, `contracts`, `payments`, `financial_events` | Leads; MQL/SQL se houver definição aprovada; discovery; propostas; contratos; receita prevista; receita recebida; conversão por origem. A regra de atribuição deve ser explícita: primeiro toque, último toque ou multi-toque — escolher uma antes de comparar campanhas |

### 3.11 Configuração & Acesso Master

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| Usuários, papéis, permissões, taxonomias, parâmetros de score, políticas, logs de auditoria e integração de dados | Acesso master como papel sem escopo, permissões por tela sem política, alteração de matriz sem trilha | `users`, `roles`, `permissions`, `role_permissions`, `policy_versions`, `taxonomy_versions`, `assessment_rules`, `audit_logs`, `integration_connections` | Usuários por papel; acessos privilegiados; mudanças em parâmetros; eventos de auditoria. Só acesso master altera taxonomia, pesos e políticas; toda alteração gera log |

### 3.12 App Cliente — preservar o front-end

| Manter/entrar na tela | Retirar/evitar | Backend canônico | KPIs e regras |
|---|---|---|---|
| A interface atual aprovada: jornada, entregas, documentos solicitados, mensagens, próximos passos e progresso sanitizado | Qualquer redesign visual agora; exposição de preço provisório, score interno, notas jurídicas, matriz de risco, dados de outros familiares ou decisões internas | `client_portal_projection`, `case_client_access`, `client_visible_updates`, `client_visible_documents`, `client_visible_tasks`, `client_messages`, derivados de `cases`, `documents`, `checklist`, `reports` | Atualização publicada; pendências do cliente; documentos solicitados/enviados; próxima ação compartilhável. A projeção é leitura controlada, não cópia manual; RLS deve restringir por usuário/cliente/caso |

---

## 4. KPIs identificados e correção

A imagem revisada apresenta, de forma visual, quatro grupos de indicadores: operação, CRM, radar/matrizes e financeiro. Abaixo está o de-para para que cada um tenha definição de backend antes de aparecer como KPI real.

| Grupo | KPI visual a preservar | Fórmula/definição operacional | Fonte de dados | Não fazer |
|---|---|---|---|---|
| Operação | Casos sem próxima ação | Casos ativos cujo `next_action_at` está nulo ou vencido conforme SLA definido | `cases`, `case_next_actions` | Contar caso encerrado, arquivado ou aguardando cliente sem classificação |
| Operação | Cadências atrasadas | Tarefas/cadências com vencimento anterior ao agora e status diferente de concluída/cancelada | `tasks`, `case_cadences` | Mostrar número sem responsável e prazo |
| Operação | Decisões prioritárias | Alertas/gates abertos com impacto `alto` ou prioridade acima do limiar aprovado | `case_alerts`, `decision_gates`, `assessment_runs` | Criar prioridade por cor manual sem regra |
| CRM | Leads por origem | Contagem de leads com origem canônica no período | `leads`, `lead_sources`, `tracking_attributions` | Misturar contatos importados com leads qualificados sem segmentação |
| CRM | Conversão por etapa | Entradas na etapa seguinte ÷ entradas na etapa anterior no mesmo recorte | `crm_stage_history`, `opportunities` | Usar status atual sem histórico de transição |
| CRM | Pipeline ponderado | Soma de `valor_estimado × probabilidade_da_etapa` para oportunidades abertas | `opportunities`, `crm_stages` | Chamar isso de receita ou caixa |
| Marketing | Funil campanha → receita | Campanha/origem → lead → discovery → proposta → contrato → pagamento, pela regra de atribuição escolhida | `marketing_campaigns`, `tracking_attributions`, CRM, `payments` | Atribuir toda receita a qualquer campanha tocada sem regra |
| Financeiro | Receita contratada | Soma de contratos ativos assinados, por competência/regra de reconhecimento definida | `contracts`, `commercial_conditions`, `billing_schedules` | Somar propostas aceitas sem assinatura ou faturamento |
| Financeiro | Receita prevista | Parcelas previstas e não recebidas no período, por status válido | `billing_schedules`, `invoices` | Confundir previsão com valor total vitalício do contrato |
| Financeiro | Receita recebida | Pagamentos conciliados com data de liquidação no período | `payments`, `payment_reconciliations`, `financial_events` | Contar boleto emitido como pagamento |
| Financeiro | Inadimplência | Valor vencido e não conciliado ÷ valor vencido total, com recorte definido | `invoices`, `payments` | Somar despesas externas do cliente ao saldo da empresa |
| Pesquisa | Cobertura de pesquisa | Perguntas com status respondida/validada ÷ perguntas ativas do projeto | `research_questions`, `findings`, `evidence_items` | Usar quantidade de links como qualidade de pesquisa |
| Pesquisa | Confiança de evidência | Agregado explicável por evidência e regra versionada; nunca média informal | `evidence_items`, `assessment_rules`, `assessment_runs` | Produzir score sem citar as evidências |
| Jurídico | Prontidão contratual | Gates obrigatórios concluídos ÷ gates obrigatórios aplicáveis, com lista de bloqueios | `decision_gates`, `legal_validations`, `contracts`, `proposal_canva_pages` | Declarar pronto só porque a proposta existe |
| Radar | Risco/eligibilidade | Dimensões derivadas de regras versionadas, fonte e data de cálculo | `assessment_runs`, vínculos de evidência e jurídico | Guardar apenas o valor final do radar |

### Regra para dados demonstrativos

Enquanto não houver histórico operacional real e conciliado, a UI deve usar uma destas três opções, nunca uma quarta:

1. `Dados demonstrativos` — para composição visual aprovada.
2. `Sem dados suficientes` — quando a métrica depende de integração ou histórico inexistente.
3. `Em conciliação` — quando há dados, porém com conflito de preço, escopo, pagamento ou atribuição.

A auditoria dos catálogos registra explicitamente que não há série consolidada confiável de volume, conversão, margem ou demanda por SKU; portanto, o funil e o financeiro devem nascer com contratos de dados e estados honestos, não com KPIs inventados.

---

## 5. Modelo de dados mínimo

### Chaves e relações

```text
family 1 ── N people
person N ── N cases                  via case_people
case 1 ── N research_projects
case 1 ── N documents
case 1 ── N tasks / alerts / events
case 1 ── N proposals ── 0..N contracts
contract 1 ── N billing_schedules ── N invoices ── N payments
case 1 ── N legal_validations
case 1 ── N assessment_runs
lead 0..1 ── N opportunities ── 0..N proposals
lead/opportunity/proposal/contract/payment ── 0..N campaign attributions
case 1 ── 1 client_portal_projection (derivada e sanitizada)
```

### Entidades que não devem ser fundidas

| Entidade | Papel | Regra de integridade |
|---|---|---|
| `case` | Contêiner operacional de uma jornada | `case_id` estável; não duplicar para cada tela |
| `person` | Pessoa civil/genealógica | Uma pessoa pode participar de vários casos |
| `family` | Núcleo/agrupamento de relações | Não substitui relações individuais |
| `research_project` | Trabalho investigativo com perguntas e evidências | Pode pertencer a caso, pessoa e família, mantendo links explícitos |
| `opportunity` | Possibilidade comercial antes/ao redor do contrato | Não é receita e não substitui contrato |
| `contract` | Compromisso formal de escopo/partes | Deve derivar de proposta validada e vincular-se a caso |
| `payment` | Liquidação financeira | Só é receita recebida quando conciliado |
| `legal_validation` | Controle jurídico por requisito | Exige caso, tipo, estado, evidência e responsável |
| `assessment_run` | Fotografia versionada do radar/matriz | Guarda regras, evidências e data, não somente o score |
| `client_portal_projection` | Visão segura para o cliente | É derivada do caso e filtrada por política/RLS |

---

## 6. Taxonomia operacional

### Estados canônicos

| Domínio | Estados mínimos |
|---|---|
| Lead | novo, qualificado, discovery_agendada, discovery_realizada, descartado, convertido |
| Oportunidade | discovery, diagnóstico, proposta_em_preparo, proposta_enviada, negociação, ganha, perdida, pausada |
| Caso | pré-caso, onboarding, pesquisa, documentação, validação_jurídica, pronto_para_protocolo, protocolo, acompanhamento, pós-reconhecimento, concluído, pausado, arquivado |
| Pesquisa | planejada, em_andamento, aguardando_fonte, em_revisão, validada, encerrada |
| Evidência | capturada, em_verificação, verificada, contestada, insuficiente, substituída |
| Documento | solicitado, recebido, em_análise, válido, pendente_correção, vencido, dispensado |
| Contrato | rascunho, aguardando_validação, pronto_para_assinatura, assinado, recusado, substituído, encerrado |
| Validação jurídica | não_iniciada, em_análise, pendente_evidência, aprovada_com_ressalvas, aprovada, bloqueada |
| Cobrança | prevista, emitida, paga, vencida, cancelada, renegociada, conciliada |
| Acesso | proprietário_master, administrativo, comercial, pesquisa, jurídico, financeiro, operação, cliente |

### Navegação do Desk

A quantidade de abas é livre, mas a taxonomia recomenda estes domínios no menu principal, porque cada um possui objeto próprio e ação operacional distinta:

1. Hoje
2. Comercial / CRM Vivo
3. Casos
4. Pessoas & Famílias
5. Pesquisa
6. Radar & Matrizes
7. Financeiro
8. Jurídico & Contratos
9. Marketing
10. Configuração & Acesso Master

`Caso 360` e `Pessoa 360` são **páginas de detalhe**, acessadas por contexto e não obrigatoriamente itens adicionais no menu. `App Cliente` é superfície externa, preservada, alimentada pela projeção segura do backend.

---

## 7. Guia visual a aplicar

### Direção de marca

- Usar o **logo oficial em arquivo de ativo de marca**. Não redesenhar o emblema por IA, texto ou ícone aproximado.
- Elevar o navy: sidebar, CTAs principais, cabeçalhos de blocos decisórios e estados ativos devem usar um azul-marinho de alta presença, mantendo contraste adequado com o fundo quente.
- Preservar fundo marfim/quente, bordas areia, acentos dourados e alertas terracota já reconhecidos nos mockups aprovados.
- Tipografia editorial serifada apenas para títulos e assinatura de marca; interface, tabelas, cards e números em sans-serif legível.
- Radar deve usar preenchimento azul translúcido e grades discretas; alertas jurídicos/financeiros em terracota e âmbar, nunca com excesso de vermelho.
- KPIs financeiros e funis usam azul navy como série principal, dourado como destaque/forecast e terracota somente para risco, atraso, perda ou exceção.

### Tokens provisórios de implementação

> Os valores abaixo são **tokens técnicos provisórios**, inferidos das referências visuais enviadas. Eles não substituem Pantones oficiais. Ao receber o manual de marca, substituí-los pelos valores RGB/CMYK/HEX fornecidos pela fonte oficial e versionar a alteração.

| Token | Uso | Valor provisório |
|---|---|---|
| `--ca-navy-900` | Sidebar, CTA principal, título de bloco | `#17365F` |
| `--ca-navy-800` | Hover/seleção secundária | `#244A78` |
| `--ca-ivory-50` | Fundo global | `#F8F2E7` |
| `--ca-sand-200` | Bordas, fundos de tabela e separadores | `#E7D8C1` |
| `--ca-gold-500` | Destaque de marca, badges positivos | `#B58A3C` |
| `--ca-amber-500` | Atenção e previsão | `#D79B2A` |
| `--ca-terracotta-600` | Risco, pendência crítica, vencimento | `#A6523B` |
| `--ca-ink-900` | Texto principal | `#1E1B18` |
| `--ca-success-600` | Concluído/conciliado | `#2F8F57` |

### Pantone

Não foi encontrada, nas fontes verificadas nesta etapa, uma especificação oficial de Pantone do Clube Ancestral. Portanto:

- não declarar equivalência Pantone como oficial;
- guardar tokens hex provisórios em `brand_tokens` ou arquivo de design system;
- criar campo `pantone_official` somente depois que a proprietária fornecer o guia de marca homologado;
- aplicar o logo correto via `brand_assets` versionado, com `asset_id`, versão, uso permitido e arquivo de origem.

---

## 8. Ordem de implementação

1. **Congelar o App Cliente visual.** Não alterar layout, rotas ou componentes aprovados.
2. **Auditar a base real.** Localizar a fonte atual de `cases`, as tabelas Supabase e o mecanismo de consumo do App/Desk, como exige `CA-CONN-01`.
3. **Criar/adaptar a camada canônica.** Primeiro `case`, `person`, `family`, vínculos e eventos; preservar campos existentes e `caseId` estável.
4. **Implementar o Caso 360.** Ele é a primeira leitura composta e prova se os domínios conversam.
5. **Reinstituir Pesquisa.** Projetos, perguntas, fontes, evidências, achados e confiança ligados ao Caso 360/Pessoa 360.
6. **Implementar CRM vivo e Marketing.** Histórico de estágio, origem/atribuição, discovery, proposta e contrato — ainda sem chamar pipeline de receita.
7. **Implementar Financeiro.** Condições comerciais, contrato, agenda de cobrança, pagamentos e conciliação; depois o funil receita-leads.
8. **Implementar Jurídico e Radar.** Validações, gates e `assessment_runs` versionados; radar como visualização derivada.
9. **Criar projeção segura do App Cliente.** RLS por usuário/caso e whitelists de campos visíveis; manter o front-end atual.
10. **Aplicar design tokens e logo oficial.** Só após inclusão do arquivo oficial de marca e validação do mapeamento visual.

---

## 9. Evidência de estado atual

- O repositório `tatianatosi/recriacao-do-clube-ancestral` contém estrutura Next/TypeScript e módulos como `visao-360.tsx`, `risco-consular.tsx`, `dossie-documental.tsx`, `memoria-italiana.tsx`, `authority-audit.tsx` e `objecoes-conversao.tsx`. Isto sustenta uma evolução incremental — não uma reconstrução descartável.
- O documento de conexão determina que App Cliente e Desk usem a mesma camada de dados, preservando `caseId`, e que nenhuma tela, rota, card ou estilo existente seja removido nessa conexão.
- A taxonomia comercial disponível vincula catálogo, planejador, CRM, Desk e visibilidade do App; simultaneamente registra que preço/link, receita, conversão e demanda não estão suficientemente conciliados para virar KPI factual sem regras e evidência.
- A auditoria de proposta da Ana Luiza confirma que `proposal_canva_pages`, condições comerciais e escopo contratual são domínios reais a conectar ao jurídico/financeiro do caso; a conferência literal do deck Canva ainda permanece uma verificação humana necessária.

---

## 10. Decisões pendentes da proprietária

1. Entregar o **manual de marca oficial**, logo correto em formato vetorial/PNG e os Pantones homologados.
2. Definir a regra de atribuição de marketing: primeiro toque, último toque ou multi-toque.
3. Definir a regra contábil/gerencial de competência para receita contratada e receita prevista.
4. Validar pesos, faixas e dimensões das matrizes antes de ativar o Radar como dado real.
5. Confirmar quais papéis internos podem ver valores, validações jurídicas, evidências e logs.
6. Confirmar se a implementação começa como evolução do repositório `recriacao-do-clube-ancestral` ou de outro repositório/branch ativo do produto.
