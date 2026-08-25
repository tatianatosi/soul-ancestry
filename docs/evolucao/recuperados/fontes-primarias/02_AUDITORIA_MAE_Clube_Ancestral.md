# Auditoria-Mãe do Clube Ancestral
## Auditoria Mestre Ampliada com Automação, Painel de Calls e Checklist Pré-Genealógico

**Data:** 09 de agosto de 2026
**Auditora:** Tatiana Tosi / Perplexity Computer
**Escopo:** Auditoria-mãe completa, crítica e de pente-fino, cobrindo Planejador Universal, Painel Mestre OPS, CRM legado, materiais criados pelo Perplexity Computer, Painel de Calls como ativo central, fluxo comercial por tipo de lead, Meta Agent e automação, esteira de pagamento por etapas, casos vivos no funil e saídas obrigatórias (A-E).

**Princípios de governança aplicados:**
1. Não alterar, criar, excluir, publicar ou desativar nada em Asaas/CRM/Lovable/Vercel/GitHub/Drive/Sheets/Dropbox/WhatsApp/Meta Business.
2. Não criar novos SKUs sem apontar a lacuna, justificar e marcar "PROPOSTA PENDENTE DE APROVAÇÃO".
3. Não tratar links Asaas atuais como fonte de verdade.
4. Não apagar itens históricos — marcar ARQUIVAR/HISTÓRICO.
5. Não inventar preços, links, status, custos, regras jurídicas ou dados ausentes.
6. Conflito/ausência de dados → "PENDENTE DE VALIDAÇÃO" citando a origem do conflito.
7. Não criar planilha paralela se uma existente puder ser saneada.
8. Manter separados: Ancestral Blueprint (proposta/orçamento/simulador), Ancestral Canvas (app cliente + Desk Intelligence), Planilhas oficiais.
9. App, Desk, Blueprint, CRM, Meta Agent e Asaas devem CONSUMIR o catálogo oficial.

**Status de cada item:** validado | parcialmente validado | pendente | conflitante | obsoleto | pendente de validação humana

---

## Seção 1 — Inventário Inicial dos Arquivos Revisados

### Metodologia

Foram revisados em profundidade os seguintes arquivos: 7 anexos enviados pela usuária, 12 abas do Planejador Universal extraídas para CSV, 18 abas do Painel Mestre (OPS) extraídas, catálogo da Planilha Mestre de Produtos (91 SKUs), Nova Tabela de Precificação, Matriz Operacional, Mapa de Materiais Drive-Dropbox (108 arquivos catalogados), site clubeancestral.com.br, 3 relatórios de subagentes (memória, materiais PC, Drive/Dropbox) e o repositório do projeto com a auditoria anterior (01_CATALOGO_E_SKUS/).

### Tabela de Inventário

| # | Arquivo | Tipo | Função | Revistado em profundidade | Nível de confiança | Observação crítica |
|---|---------|------|--------|---------------------------|---------------------|---------------------|
| 1 | CA-FIN-Planilha-Mestre-de-Produtos-OFICIAL.xlsx | Planilha (XLSX) | Catálogo oficial de SKUs, planos de assinatura, reconciliação Asaas, CRM pipeline | Sim — todas as abas extraídas e lidas | **Validado** | Centro oficial de SKUs. 91 SKUs no catálogo. CRM_Pipeline_DADOS_TESTE contém apenas dados de teste. Reconciliacao_Asaas com 30 SKUs mapeados, vários sem link. |
| 2 | CA-OPS-PAINEL-GERAL-MESTRE-OFICIAL-CRM-Pesquisa-Documentos-Contratos-Financeiro.xlsx | Planilha (XLSX) | Painel guarda-chuva operacional: CRM, pipeline, tarefas, documentos, contratos, financeiro | Sim — 18 abas extraídas e lidas | **Parcialmente validado** | CRM_Pipeline_legado VAZIO (apenas cabeçalho). Pipeline_Vendas existe mas com zeros. FLUXO_OPERACIONAL bem desenhado mas teórico. Dashboard mostra MRR R$269. Tarefas com 43 itens, muitos pendentes. |
| 3 | CA_Planejador_Universal.xlsx | Planilha (XLSX) | Módulo universal por caso: casos, lançamentos, pagamentos, simulador, automações, marcos jurídicos | Sim — 12 abas extraídas e lidas | **Parcialmente validado** | IDs de casos duplicados. RESUMO_CASOS com #ERROR! em todas as linhas. SIMULADOR_CASO vazio. PAGAMENTOS com apenas 2 entradas em R$0,00. INSTRUCOES diz: "Planilha Mestre continua sendo o centro de SKUs." |
| 4 | CA_Nova_Tabela_Precificacao_Clube_Ancestral.xlsx | Planilha (XLSX) | Tabela de precificação por cidadania | Sim — lida | **Parcialmente validado** | Contém valores por país mas conflita com Planejador em alguns pontos. |
| 5 | CA-FIN-Planilha-Mestre-de-Produtos-OFICIAL-biblioteca-visual-sku.xlsx | Planilha (XLSX) | Biblioteca visual de SKUs | Não em profundidade | **Pendente** | Inventariado como ART-02 na auditoria anterior. Não foi extraído para CSV nesta rodada. |
| 6 | checklist_final_saneamento_skus_clube_ancestral.docx | Documento (DOCX) | Documento de governança do saneamento de SKUs | Não em profundidade | **Pendente** | Inventariado como ART-06. Conteúdo não lido nesta rodada. |
| 7 | matriz_operacional_clube_ancestral_atualizada.xlsx | Planilha (XLSX) | Matriz operacional | Sim — lida | **Parcialmente validado** | Matriz com 1 aba, estrutura tabular. |
| 8 | CA-INV-Mapa-Mestre-de-Materiais-Drive-Dropbox.xlsx | Planilha (XLSX) | Inventário de 108 materiais no Drive/Dropbox | Sim — lida | **Parcialmente validado** | 9 categorias, 108 arquivos catalogados. Não substitui leitura direta dos arquivos. |
| 9 | Site clubeancestral.com.br | Website | Presença digital, nacionalidades atendidas, processo em 5 etapas | Sim — página inicial lida | **Validado** | 8 nacionalidades confirmadas: Itália, Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria, Áustria. Processo em 5 etapas + AncestralScan. |
| 10 | Roteiro Master Discovery (Google Doc) | Documento Google | Roteiro mestre de call discovery por nacionalidade | Não diretamente (via transcrições) | **Parcialmente validado** | Confirmado como entregue e salvo. 11 seções: dados da call, consentimento, SPIN completo, diagnóstico, documentos por país, objeções, comparativo, valores, fechamento, pós-call, organização Drive. |
| 11 | Painel de Calls Discovery (Google Sheets) | Planilha Google | Painel operacional vivo de calls | Não diretamente (via transcrições) | **Parcialmente validado** | Confirmado como entregue. Abas: Painel Calls, Comparativo Cidadanias, Marcos Jurídicos, Roteiro SPIN, Listas Base. |
| 12 | 01_CATALOGO_E_SKUS_Saneamento_Mestre_SKUs.md | Markdown (322 KB) | Auditoria anterior de SKUs (9 fases) | Sim — referenciado | **Validado** | 91 SKUs catalogados, 24 artefatos inventariados, 6 CSVs de saneamento. Base sólida para esta auditoria-mãe. |
| 13 | audit_memory_findings.md | Markdown (205 linhas) | Achados de memória: casos vivos, CRM legado, esteira de pagamento | Sim — lido na íntegra | **Validado** | Fonte: subagent memory search. Detalha 5 casos, Painel de Calls, CRM legado, onboarding, esteira de pagamento. |
| 14 | audit_pc_materials.md | Markdown (274 linhas) | Inventário de materiais criados pelo Perplexity Computer | Sim — lido na íntegra | **Validado** | Fonte: subagent session transcript analysis. 8 sessões analisadas, 30+ materiais catalogados. |
| 15 | audit_drive_dropbox_findings.md | Markdown (169 linhas) | Achados de busca no Drive/Dropbox | Sim — lido na íntegra | **Validado** | Fonte: subagent files connector search. 33 arquivos encontrados, 28 novos. |

### Resumo de confiança

| Nível de confiança | Quantidade | Arquivos |
|---|---|---|
| Validado | 6 | #1, #9, #12, #13, #14, #15 |
| Parcialmente validado | 7 | #2, #3, #4, #7, #8, #10, #11 |
| Pendente | 2 | #5, #6 |
| Conflitante | 0 | — |
| Obsoleto | 0 | — |

### Mapa de Evidências e Limitações

Para honrar o princípio de não tratar arquivo localizado como arquivo auditado, esta seção discrimina o que foi lido diretamente vs. o que foi apenas localizado.

**Fontes lidas diretamente (auditadas em profundidade):**
- Planilha Mestre de Produtos (91 SKUs, todas as abas extraídas para CSV e lidas)
- Planejador Universal (12 abas extraídas e lidas)
- Painel Mestre OPS (18 abas extraídas e lidas)
- Nova Tabela de Precificação
- Matriz Operacional Atualizada
- Mapa de Materiais Drive-Dropbox (108 arquivos catalogados)
- Site clubeancestral.com.br (página inicial, nacionalidades confirmadas)
- 3 relatórios de subagentes (memória, materiais PC, Drive/Dropbox)
- Auditoria anterior (01_CATALOGO_E_SKUS/)

**Fontes localizadas mas NÃO auditadas célula a célula:**
- Painel de Calls Discovery (Google Sheets) — confirmado como entregue via transcrições, mas não lido diretamente
- Checklist GoLive Consolidado (Google Sheet, ART-21) — spreadsheetId conhecido mas não lido
- CRM Modelo (Google Sheet) — URL conhecida mas não lida
- CA · CRM · Diagnóstico TEMPLATE (Google Form) — download do conteúdo falhou
- Anotações do Gemini das calls (3 Google Docs) — localizados mas não lidos em conteúdo
- Roteiro Master Discovery (Google Doc) — confirmado via transcrições, não lido diretamente
- Propostas PPTX da Ana Luiza e João Marcelo (Dropbox) — localizadas mas não abertas
- CA · Gem de Follow-up (Gemini Gem) — localizada mas conteúdo não inspecionado

**Conflitos principais e origem:**

| Conflito | Origens | Status |
|---|---|---|
| Preços Giovanna (R$4.230/R$4.290/R$4.700/R$8.766) | Múltiplas versões de proposta | Pendente de reconciliação |
| Preços João (fases R$900/R$3.500/R$4.800/R$800 vs pacotes R$700/R$2.800/R$5.300 vs R$10.000) | Propostas por fases vs pacotes | Pendente de reconciliação |
| Preços Ana Luiza (R$5.900 vs R$4.800 no planejador) | Sessão vs Planejador PARAMETROS | Pendente de reconciliação |
| Preços Sophi Etapa 02 (R$1.436 vs R$990) | Configuração app vs alternativa de escopo | Pendente de validação humana |
| Preços Portugal (R$5.300 vs R$3.800) | PARAMETROS vs SKUS_REFERENCIA no próprio Planejador | Pendente de reconciliação |
| CRM vazio vs declarado como fonte única | CRM_Pipeline_legado (OPS) vs histórico de memória | Pendente de validação humana |
| Nacionalidades: site (8) vs Planejador PARAMETROS (11) vs MARCOS_JURIDICOS (8-9) vs OPS dropdown (9) | 4 fontes diferentes | Pendente de validação humana |
| Sophi: caso-modelo do app vs caso de funil comercial | Memória (caso-modelo) vs inclusão em listas de funil | Corrigido nesta auditoria: Sophi = caso-modelo/piloto |
| Contagem de nacionalidades em MARCOS_JURIDICOS (8 no Planejador vs 9 na memória) | Planejador vs histórico de sessão | Pendente de validação humana |

---

## Seção 2 — Planejador Universal / Planejador de Cidadanias

### 2.1 Visão Geral

O Planejador Universal (`CA_Planejador_Universal.xlsx`, ART-09) é um módulo por caso e consolidado financeiro. A aba INSTRUCOES declara expressamente: "Planilha Mestre continua sendo o centro de SKUs, CRM e links. Este arquivo é um módulo universal por caso e consolidado financeiro."

**Status:** Parcialmente validado — estrutura bem desenhada, mas com erros de dados e lacunas.

### 2.2 Estrutura (12 abas)

| Aba | Função | Status | Observações |
|---|---|---|---|
| INSTRUCOES | Guia de uso | Validado | Declara Planilha Mestre como centro de SKUs. |
| PARAMETROS | Parâmetros por nacionalidade (honorários, despesas, taxas, parcelas) | Parcialmente validado | 11 tipos de cidadania. Faltam Luxemburgo e Hungria (presentes em MARCOS_JURIDICOS). |
| SKUS_REFERENCIA | SKUs de referência | Parcialmente validado | 25 SKUs misturando prefixos oficiais (CA-CID-*) e de proposta (PACOTE-*, NAT-BR-*). |
| CASOS | Casos individuais | Conflitante | IDs duplicados: CA-CID-IT-2026-001 usado para 2 clientes; CA-CID-PT-2026-001 idem. Ana Luiza com typo de ano (20026). |
| LANCAMENTOS | Lançamentos financeiros por caso | Parcialmente validado | CASO-007 (Giovanna) bem detalhado: R$247 diagnóstico + R$4.500 assessoria + R$390 pasta + R$530 AIRE + R$1.588 transcrição + R$1.511 registro filhos. |
| PAGAMENTOS | Controle de pagamentos | Pendente | Apenas 2 entradas, ambas R$0,00. |
| RESUMO_CASOS | Resumo consolidado | Conflitante | Todas as linhas com #ERROR! (VLOOKUP quebrado). |
| SIMULADOR_CASO | Simulador de caso | Pendente | Essencialmente vazio. |
| PAINEL | Painel visual | Pendente | Referencia dados de outras abas; não funcional sem RESUMO_CASOS. |
| AUTOMACOES | Automações planejadas | Parcialmente validado | Lista de automações mas sem implementação. |
| CONVENCAO_IDS | Convenção de nomenclatura de IDs | Validado | Define padrão CA-CID-{PAIS}-{ANO}-{SEQ}. |
| MARCOS_JURIDICOS_SYNC | Marcos jurídicos sincronizados via IMPORTRANGE | Parcialmente validado | 8 nacionalidades (Espanhola, Portuguesa, Alemã, Polonesa, Húngara, Áustria, Luxemburguesa, Italiana). Discrepância: memória registra 9 linhas. |

### 2.3 Lacunas de Nacionalidades

| Nacionalidade | Site | Planejador PARAMETROS | Planejador MARCOS_JURIDICOS | Listas_Validacao (OPS) | Status |
|---|---|---|---|---|---|
| Italiana | Sim | Sim | Sim | Sim (Itália) | Validado |
| Portuguesa | Sim | Sim | Sim | Sim (Portugal) | Validado |
| Espanhola | Sim | Sim | Sim | Sim (Espanha) | Validado |
| Alemã | Sim | Sim | Sim | Sim (Alemanha) | Validado |
| Polonesa | Sim | Sim | Sim | Sim (Polônia) | Validado |
| Luxemburguesa | Sim | **NÃO** | Sim | **NÃO** | **Pendente de validação humana** — no site e em marcos jurídicos, mas sem parâmetros de preço e sem dropdown no OPS |
| Húngara | Sim | **NÃO** | Sim | Sim (Hungria) | **Pendente de validação humana** — no site e em marcos jurídicos, mas sem parâmetros de preço |
| Austríaca | Sim | Sim | Sim | Sim (Áustria) | Validado |
| Croata | **NÃO** | Sim | **NÃO** | **NÃO** | **Conflitante** — no Planejador PARAMETROS mas não no site nem em marcos jurídicos |
| Romena | **NÃO** | Sim | **NÃO** | Sim (Romênia) | **Conflitante** — no Planejador e no OPS, mas não no site nem em marcos jurídicos |
| Europeia Geral | **NÃO** | Sim | **NÃO** | **NÃO** | **Pendente** — categoria genérica no Planejador, sem correspondência no site |
| Naturalização Brasileira | **NÃO** | Sim | **NÃO** | **NÃO** (tem "Outro") | **Pendente** — no Planejador mas não no site |
| Naturalização Francesa | **NÃO** | Sim | **NÃO** | **NÃO** | **Pendente** — no Planejador mas não no site |

**Ação recomendada:**
- Adicionar Luxemburgo e Hungria aos PARAMETROS do Planejador (com honorários, despesas e taxas) e ao dropdown Pais_Alvo do OPS — **PENDENTE DE VALIDAÇÃO HUMANA**.
- Decidir se Croata, Romena, Europeia Geral, Naturalização BR/FR são serviços oferecidos ou não. Se sim, adicionar ao site; se não, marcar como "PROPOSTA PENDENTE DE APROVAÇÃO" no Planejador.
- Sincronizar a contagem de nacionalidades entre MARCOS_JURIDICOS (8 no Planejador vs. 9 na memória) — **PENDENTE DE VALIDAÇÃO HUMANA**.

### 2.4 Integridade de Dados — Problemas Encontrados

| Problema | Aba | Gravidade | Ação recomendada |
|---|---|---|---|
| IDs de casos duplicados (CA-CID-IT-2026-001 para "Cliente Modelo Italiana" e "Giovanna Prade"; CA-CID-PT-2026-001 para "Cliente Modelo PT" e "João Marcelo") | CASOS | Alta | Renumerar clientes modelo ou usar prefixo "MODEL-" para distingui-los de casos reais. |
| Typo no ID de Ana Luiza: CA-CID-AT-20026-001 (deveria ser 2026) | CASOS | Alta | Corrigir para CA-CID-AT-2026-001. |
| #ERROR! em todas as linhas do RESUMO_CASOS | RESUMO_CASOS | Alta | Corrigir fórmulas VLOOKUP — provavelmente referência quebrada após renomeação de aba ou mudança de coluna. |
| SIMULADOR_CASO vazio | SIMULADOR_CASO | Média | Preencher ou desativar aba se não for usar. |
| PAGAMENTOS com apenas 2 entradas em R$0,00 | PAGAMENTOS | Média | Preencher com dados reais ou conectar ao LANCAMENTOS. |
| SKUS_REFERENCIA mistura prefixos oficiais e de proposta | SKUS_REFERENCIA | Média | Separar SKUs oficiais (CA-CID-*) de SKUs de proposta (PACOTE-*, NAT-BR-*) em colunas distintas ou abas separadas. |
| 3 cópias duplicadas do Planejador no Dropbox | — | Baixa | Consolidar em uma versão oficial e arquivar as demais. |

### 2.5 Automação no Planejador

A aba AUTOMACOES lista automações planejadas, mas nenhuma está implementada. O IMPORTRANGE para MARCOS_JURIDICOS_SYNC foi configurado (com problema de autorização entre contas resolvido), mas outras automações permanecem como roadmap.

---

## Seção 3 — Painel Mestre / Pesquisa / Documentos / Financeiro / CRM

### 3.1 Visão Geral

O `CA-OPS-PAINEL-GERAL-MESTRE-OFICIAL` (ART-05) é o painel guarda-chuva operacional com 18+ abas cobrindo CRM, pipeline, tarefas, documentos, contratos e financeiro.

**Status:** Parcialmente validado — estrutura bem desenhada, mas muitos componentes vazios ou sem dados.

### 3.2 Status de Cada Aba

| Aba | Função | Status de uso | Dados | Observação crítica |
|---|---|---|---|---|
| CRM_Pipeline_legado | CRM legado consolidado | Em uso (declarado) | **VAZIO** — apenas cabeçalho, sem linhas de dados | Declarado como "fonte única de CRM" mas não contém dados. **PENDENTE DE VALIDAÇÃO HUMANA**: verificar se os dados estão em outro local ou se nunca foram migrados. |
| Pipeline_Vendas | Pipeline de vendas ativo | Em uso (declarado) | Estrutura com 7 stages, mas todos zerados | 7 stages: Lead novo → Qualificação → Reunião agendada → Proposta enviada → Negociação → Ganho → Perdido. Sem dados reais. |
| FLUXO_OPERACIONAL | Fluxo operacional de 10 passos | Teórico | Estrutura bem desenhada, sem dados para validar | 10 passos: lead → triagem → discovery → diagnóstico → proposta → aceite → contrato → pagamento → onboarding → pós-venda. Regras de governança incluídas. |
| CONTROLE_GERAL | Índice das 19 abas | Em uso | Lista de abas com status | Muitas marcadas "Implantar" — apenas CRM_Pipeline_legado, Dashboard, Dashboard_Mensal, Status_Semanal marcados "Em uso". |
| Produtos_Master | Catálogo de produtos no OPS | Em uso | 6 linhas com dados genéricos/placeholder | Links Asaas com "https://asaas.com/c/..." (placeholder). Não deve ser tratado como catálogo oficial. |
| Tarefas | Controle de tarefas (T-001 a T-043) | Em uso | 43 tarefas | Muitas "Pendente" ou "A fazer". Destaques: T-007 CRM Mestre "Crítica/Pendente", T-022 DRE "A fazer", T-029 SKUs "Em andamento", T-002 Asaas links "Em andamento". |
| Servicos_Entregues | Registro de serviços entregues | Em uso | — | — |
| Status_Semanal | Status semanal operacional | Em uso | — | — |
| Listas_Validacao | Listas/dropdowns para validação | Em uso | Dropdowns definidos | Pais_Alvo faltando Luxemburgo. Tem: Itália, Portugal, Espanha, Polônia, Alemanha, Áustria, Hungria, Romênia, Outro. |
| Conexao_Desk_Intelligence | Conexão com Desk Intelligence | — | — | — |
| Reconciliacao_Financeira | Reconciliação financeira | — | — | — |
| Pagamentos_Asaas | Controle de pagamentos Asaas | — | — | — |
| Pesquisa_Operacional | Pesquisa operacional | — | — | — |
| Contratos_Servicos | Contratos de serviços | — | — | — |
| Documentos_Solicitados | Documentos solicitados | — | — | — |
| Documentos_Arquivo | Documentos arquivados | — | — | — |
| Dashboard | Dashboard principal | Em uso | MRR R$269, zero leads, zero oportunidades, zero casos | Dashboard mostra dados mínimos. MRR de R$269 pode corresponder a 1 plano de assinatura ativo. |
| Dashboard_Mensal | Dashboard mensal | Em uso | — | — |

### 3.3 Sobreposição e Padronização

| Problema | Detalhe | Ação recomendada |
|---|---|---|
| CRM_Pipeline_legado vazio vs. Pipeline_Vendas com zeros | Dois locais para CRM, nenhum com dados reais | Definir um único CRM ativo e migrar dados. Recomendado: Pipeline_Vendas como ativo, CRM_Pipeline_legado como histórico. |
| Produtos_Master com placeholders | Links Asaas genéricos "https://asaas.com/c/..." | Substituir por links reais da Reconciliacao_Asaas da Planilha Mestre ou marcar como PENDENTE. |
| Listas_Validacao desatualizada | Faltando Luxemburgo no dropdown Pais_Alvo | Adicionar Luxemburgo. |
| Dashboard com dados mínimos | MRR R$269, zero de tudo else | Conectar Dashboard a Pipeline_Vendas e LANCAMENTOS para alimentar dados reais. |
| 43 tarefas, muitas pendentes | T-007 CRM Mestre Crítica/Pendente | Priorizar T-007 como bloqueador — sem CRM funcionando, todo o pipeline fica cego. |

### 3.4 Automação no Painel Mestre

O FLUXO_OPERACIONAL define um processo de 10 passos bem estruturado, mas é teórico. A automação real depende de:
1. CRM ativo com dados (bloqueado por T-007).
2. Pipeline_Vendas populado.
3. Conexão entre Painel Mestre e Planejador (IMPORTRANGE ou similar).
4. Conexão entre Painel Mestre e Asaas (Reconciliacao_Financeira).

**Status de automação:** Pendente — nenhuma automação ativa confirmada.

---

## Seção 4 — CRM Antigo Template e Materiais Legados

### 4.1 CRM Legado

O CRM legado foi consolidado na aba `CRM_Pipeline_legado` do Painel Mestre (CA-OPS), marcado como "fonte única de CRM". No entanto, esta aba está **completamente vazia** — apenas cabeçalho, sem linhas de dados.

**Status:** Conflitante — declarado como fonte única, mas sem dados.

**Histórico (via memória):**
- O CRM legado consolidado foi identificado e movido para o painel mestre em sessão anterior (`0797e035`).
- `Pipeline_Vendas` existe como estrutura operacional (7 stages definidos).
- Abas antigas foram marcadas/removidas como legado.
- Dropdowns listados: `Status_Lead`, `Etapas_CRM`, `Prioridade`, `Tipo_Tarefa`, `Status_Caso`, `Fase_Pesquisa`.

### 4.2 CRM Modelo (Google Sheets legado)

Um Google Sheet identificado como "CA · OP · CRM Modelo.xlsx" está catalogado no Mapa de Materiais Drive-Dropbox:
- URL: https://docs.google.com/spreadsheets/d/1R04iIqSuWM7sTLa890Y_2b70AW30qAfL2J9tXYdmpLM/edit
- **Status:** Pendente de validação humana — não foi lido diretamente nesta auditoria. Pode conter o CRM legado original que deveria estar em CRM_Pipeline_legado.

### 4.3 CRM Diagnóstico (Google Form)

Um Google Form "CA · CRM · Diagnóstico TEMPLATE" foi encontrado no Drive:
- File ID: `1_qX-FshEsU9WrHsZ-Z5CHWVXGnsh6Sw0yNrNVTVy4ZQ`
- **Status:** Pendente — o download do conteúdo falhou. Estrutura e campos não verificados.

### 4.4 Tentativa de CRM Placego

Registrado na memória como CRM proprietário com SDR/closer e entrada de leads do diagnóstico no CRM mestre via Sheets. Depois o fluxo prático migrou para destacar Meta Agent no WhatsApp, não um GEM de SDR.

**Status:** Obsoleto — substituído pela abordagem Meta Agent.

### 4.5 Etiquetas/Taxonomia WhatsApp + CRM

Dois CSVs foram entregues pelo Perplexity Computer definindo o pipeline de status do CRM/WhatsApp:

1. **EtiquetaWhatsApp-Tipomanual-statuswhatsappCRM-Obse.csv** (ART-15): mapeamento etiqueta WhatsApp ↔ status_whatsapp (CRM) ↔ observação. Tags: lead_novo, aguardando_resposta_inicial, interessado, proposta_enviada, pausado, nao_tem_interesse, lead_descartado, cliente_ativo, pagamento_pendente.

2. **Etiquetasugerida-Tipoeixo-Quandousarexatamente-Exe.csv** (ART-15): taxonomia detalhada por eixo (Estágio do funil, Origem, Identificação, Rota/jornada, Situação especial) com "quando usar exatamente" e exemplo prático de lead.

**Status:** Validado — entregues e catalogados, mas não confirmados como aplicados no WhatsApp Business.

### 4.6 Status de Case (pós-proposta)

Definidos na memória e no prompt de go-live do Ancestral Canvas:

| Status | Descrição |
|---|---|
| Proposta enviada | Proposta entregue ao lead, aguardando resposta |
| Proposta aceita | Lead aceitou a proposta |
| Contrato pendente | Aceite dado, contrato ainda não enviado/assinado |
| Contrato assinado | Contrato formalizado |
| Pagamento pendente | Contrato assinado, pagamento inicial pendente |
| Pagamento confirmado | Pagamento inicial recebido |
| Onboarding iniciado | Cliente convidado no app, checklist go-live ativado |
| Documentos solicitados | Checklist documental em andamento |
| Pesquisa em andamento | Fase 01 de pesquisa em execução |
| Fase 01 entregue | Diagnóstico/leitura inicial entregue ao cliente |
| Fase 02 prevista | Próxima fase planejada |
| Fase 02 em produção | Fase 02 em execução |
| Fase 02 entregue | Fase 02 concluída |
| Pausado | Caso pausado pelo cliente ou operação |
| Concluído/Legado | Caso finalizado |

### 4.7 Resumo de Materiais Legados

| Material | Status | Ação recomendada |
|---|---|---|
| CRM_Pipeline_legado (OPS) | Conflitante — vazio | Verificar se dados existem no CRM Modelo (Google Sheet) e migrar. |
| CRM Modelo (Google Sheet) | Pendente | Ler diretamente para verificar se contém dados de clientes. |
| CRM Diagnóstico (Google Form) | Pendente | Recuperar conteúdo (tentar novamente o download). |
| Placego CRM | Obsoleto | Arquivar/HISTÓRICO. |
| Etiquetas WhatsApp + CRM | Validado | Confirmar aplicação no WhatsApp Business. |
| Status de case (15 estados) | Validado | Sincronizar com Pipeline_Vendas do OPS. |

---

## Seção 5 — Materiais Já Criados pelo Perplexity Computer

### 5.1 Visão Geral

Foram analisadas 8 sessões do Perplexity Computer, resultando em 30+ materiais criados. O inventário de artefatos da auditoria anterior (ART-01 a ART-24) é o índice-mãe mais confiável; esta seção o expande com o contexto das sessões de origem.

### 5.2 Inventário Completo de Materiais PC

#### 5.2.1 Checklists e Roteiros de Discovery

| Material | Status | Sessão | Localização | Observação |
|---|---|---|---|---|
| Roteiro Master — Checklist de Call Discovery por Nacionalidade (Google Doc) | **Entregue** | `e2e146ff` | https://docs.google.com/document/d/1xopM9XIAjPvMiFSZB0drp5jS9HhE3rgjFjXyhTQIHFY/edit | 11 seções: dados da call, consentimento, SPIN completo (S→P→I→N com checkbox), diagnóstico ao vivo, documentos por país, banco de objeções, comparativo de 8 cidadanias, produtos/valores, fechamento suave, registro pós-call, organização Drive. |
| Checklist/Roteiro específico para Ana Luiza (Austríaca) (Google Doc) | **Entregue** | `d74d47b7` | Google Doc (não linkado diretamente) | Modelo mestre por cliente. Distingue §58c (reparação histórica) de descendência direta. |
| Roteiro Discovery — Ana Luiza v2 (Google Doc) | **Entregue** | — | `1qpzFmnY5-UBlJcebf4hckKoFE-8VZGSDyrmLovFj6S8` | Segunda versão do roteiro da Ana Luiza. |
| Tabela-checklist de prova de perseguição nazista (§58c) | **Entregue (chat)** | `adf48a57` | Em chat, pronto para colar em aba do Sheets/CRM | 7 linhas-modelo (deportação/campo, listas de vítimas, emigração, registros comunitários, documentos civis com discriminação, entrada como refugiado, declarações/testemunhos). Dropdowns de status/qualidade. |

#### 5.2.2 Painel de Calls

| Material | Status | Sessão | Localização | Observação |
|---|---|---|---|---|
| Clube Ancestral — Painel de Calls Discovery (Google Sheets) | **Entregue** | `e2e146ff` | https://docs.google.com/spreadsheets/d/1iq61cjwZkd6dQ8b3fqiPBwKGQPRh7g_0npCHchR0_10/edit | 5 abas: Painel Calls, Comparativo Cidadanias, Marcos Jurídicos, Roteiro SPIN, Listas Base. Dropdowns, checkboxes, formatação condicional. Inventariado como ART-22. |

#### 5.2.3 Templates de Proposta

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Template Mestre Proposta (Markdown) | **Entregue** | `391ffe5b` | 10 slides: capa, clube, diagnóstico, 5 etapas, radar, timeline, escopo, investimento, próximos passos, aprovação. Recomendação: um template-mãe, não HTML customizado por cliente. |
| Proposta Ana Luiza (PPTX) | **Parcialmente entregue** | `adf48a57` | Gerada via create_text_file, mas arquivo físico perdido pós-reinício do sandbox. **Ação: regenerar.** |
| Proposta Ana Luiza (PPTX/PDF no Dropbox) | **Entregue** | — | 9 cópias no Dropbox (5 PPTX + 3 PDF + 1 sem extensão). Modificadas 2026-08-08. |
| Proposta João Marcelo (PPTX no Dropbox) | **Entregue** | — | 2 cópias PPTX no Dropbox. Modificadas 2026-08-08. |
| Copys de slides de proposta (Ana Luiza, Lara, João, Giovanna) | **Entregue** | `5fe64800` | Textos de todos os slides preparados para 4 leads. |

#### 5.2.4 Sequências de Follow-up

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Mensagens WhatsApp SPIN/follow-up para Ana Luiza | **Entregue** | `d74d47b7` | 3 versões: SPIN closer, versão curta, follow-up pós-proposta. |
| Mensagens + link de calendário para Lara e João | **Entregue** | `5fe64800` | Textos com link de agendamento (https://calendar.app.google/eu6CnYEsz946ieWh6). Ajuste: não reforçar agenda no mensagem do João. |
| CA · Gem de Follow-up (Gemini Gem) | **Entregue** | — | Google Drive ID: `1O44rU5IK_2lSceiHEej4xUsx8RTYZy4F`. Configurada para follow-up. Modificada 2026-06-23. |

#### 5.2.5 Fluxo Sem Reunião

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Módulo "Entrega Consultiva" no App Cliente (com CTA de pagamento) | **Entregue (Lovable)** | `5fe64800` | Aba "Entrega" + card na Home: Leitura Inicial, Elegibilidade Sintética, Checklist Mínimo, CTA "Quero avançar para a Etapa 02" → modal + link de pagamento. Template parametrizável por país em `src/data/entrega-consultiva.ts`. Caso-modelo: Sophi Piccoli. |

#### 5.2.6 Templates e Taxonomia WhatsApp

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Tabela de etiquetas/taxonomia WhatsApp + CRM (2 CSVs) | **Entregue** | CSVs no repo | ART-15. Mapeamento etiqueta ↔ status_whatsapp ↔ observação + taxonomia por eixo. |
| Planos WhatsApp (SKUs familiares) no Desk | **Entregue** | `5fe64800` | Card interno "Plano WhatsApp sugerido" no Desk. CA-WPP-001 (R$79→59), CA-WPP-002 (R$149→119), CA-FAM-001 (R$280→290), CA-FAM-002 (R$490). |
| Template criativo WhatsApp vertical 9x16 (PDF + JSON) | **Entregue (Drive)** | `eb3d89e9` | ART-24. `clube-ancestral-whatsapp-vertical-9x16-marca-v3-campos-editaveis.pdf` + `mapa-de-campos.json`. |
| Texto-base de WhatsApp copiável (Entrega Consultiva) | **Entregue** | `5fe64800` | Embutido no módulo Entrega Consultiva. |

#### 5.2.7 Pipeline CRM / Status Padronizados

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Painel operacional CRM guarda-chuva (CA-OPS) | **Entregue** | `eb3d89e9` | ART-05. 18 abas. |
| Dropdowns/status padronizados do Painel de Calls | **Entregue** | `e2e146ff` | Status da call, elegibilidade, via jurídica, complexidade, resultado. |
| Marcos Jurídicos sincronizados (IMPORTRANGE) | **Entregue** | `e2e146ff` | Aba MARCOS_JURIDICOS_SYNC no planejador. 8-9 nacionalidades. |

#### 5.2.8 Fluxo de Onboarding

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Fluxo de onboarding WhatsApp → diagnóstico → checklist → Desk → Asaas | **Parcial** | `5fe64800` | Mapeado, falta amarrar pré-check operacional com fluxo real. |
| Módulos de onboarding no App Cliente (Ancestral Canvas via Lovable) | **Entregue** | `5fe64800` | Jornada 1820–2024, aba Documentos, funil de leads, BrandLogo, switcher, Relatório Visual, Entrega Consultiva. |
| Checklist GoLive Consolidado (Google Sheet) | **Pendente** | — | spreadsheetId `1kNUznTCI3w2cL0YSTa4iHSec0IXGmtS7IhCi-ok1ZMQ` (ART-21). Não foi lido diretamente. Tarefas T-029/T-002/T-022 não encontradas na memória. |

#### 5.2.9 App / Produto

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Clube Ancestral Intelligence Desk (app interno) | **Em produção (GitHub/Vercel)** | `bd5bc6c0` | GitHub: github.com/tatianatosi/clube-ancestral-intelligence-desk. Arquitetura funcional implementada. |
| Ancestral Canvas (app cliente) + Ancestral Blueprint (proposta) | **Entregue** | `5fe64800` | Via Lovable. Cards em `src/components/AncestralCards.tsx`, dados em `src/data/casos.ts`. Distinção: Blueprint = proposta; Canvas = app. |
| Repositório Intelligence Desk (GitHub) | **Planejado** | `65a0a093` | Estrutura de pastas desenhada mas não totalmente populada. |

#### 5.2.10 Catálogo / Auditoria de SKUs

| Material | Status | Sessão | Observação |
|---|---|---|---|
| Pasta `01_CATALOGO_E_SKUS/` (7 arquivos) | **Entregue** | `eb3d89e9` | MD (322 KB) + 6 CSVs: DICIONARIO_DE_SKUS, INVENTARIO_DE_ARTEFATOS (24 itens), MAPA_DE_RECONCILIACAO_ASAAS, PARETO_E_PRIORIDADE, SANEAMENTO_DE_SKUS, SKU_PARA_JORNADA_E_ENTREGA. |

### 5.3 Resumo de Status dos Materiais PC

| Categoria | Entregue | Parcial | Pendente | Total |
|---|---|---|---|---|
| Checklists/roteiros Discovery | 3 | 0 | 0 | 3 |
| Painel de Calls | 1 | 0 | 0 | 1 |
| Templates de proposta | 4 | 1 | 0 | 5 |
| Sequências de follow-up | 3 | 0 | 0 | 3 |
| Fluxo sem reunião | 1 | 0 | 0 | 1 |
| Templates/taxonomia WhatsApp | 4 | 0 | 0 | 4 |
| Pipeline CRM / status | 3 | 0 | 0 | 3 |
| Fluxo de onboarding | 2 | 1 | 1 | 4 |
| App / produto | 2 | 0 | 1 | 3 |
| Catálogo / SKUs | 1 | 0 | 0 | 1 |
| **Total** | **24** | **2** | **2** | **28** |

---

## Seção 6 — Painel de Calls e Checklist como Ativos Centrais

### 6.1 Conceito Estratégico

O Painel de Calls Discovery não é apenas um registro de chamadas — é o **ativo central operacional** que conecta discovery, diagnóstico, proposta, follow-up e onboarding. Funciona como a ponte entre o primeiro contato (WhatsApp) e a formalização (contrato/Asaas).

### 6.2 Estrutura do Painel de Calls

O Painel de Calls Discovery (Google Sheets, ART-22) tem 5 abas:

| Aba | Função | Campos principais | Status |
|---|---|---|---|
| Painel Calls | Log de cada lead/call | Nome, data, nacionalidade (dropdown 8 países), checkboxes (gravação ativa, consentimento, SPIN-S/P/I/N OK, diagnóstico), status de elegibilidade (✅/⚠️) | Entregue e formatado |
| Comparativo Cidadanias | Quadro comparativo lado a lado | Via Principal, Geração Limite, Status, Tempo Médio, Complexidade Documental, idioma/entrevista, Fonte Oficial | Entregue |
| Marcos Jurídicos | Marcos legais por nacionalidade | 8 nacionalidades: Via Principal, Marco/Lei, data/prazo, requisito central, geração limite, documento-chave, observação, fonte oficial, status de elegibilidade | Entregue (sincronizado via IMPORTRANGE) |
| Roteiro SPIN | Lógica SPIN aplicada | S—Situação, P—Problema, I—Implicação, N—Need-payoff; dropdowns para Status da Call, elegibilidade, via jurídica, complexidade, resultado | Entregue |
| Listas Base | Listas fechadas/dropdowns | Status da Call (7 valores), Elegibilidade (4), Via Jurídica (6), Complexidade (3), Resultado (5) | Entregue |

### 6.3 Dropdowns e Listas Padronizados

**Status da Call:** Agendada | Confirmada | Realizada | Remarcada | No-show | Convertida | Perdida

**Elegibilidade Inicial:** Forte | Média | Fraca | Inconclusiva

**Via Jurídica:** Descendência direta | Memória Democrática | Reparação histórica | Linha materna 1948 | Naturalização/residência | Outra

**Complexidade:** Baixa | Média | Alta

**Resultado:** Avançou diagnóstico | Pediu documentos | Proposta enviada | Em follow-up | Sem aderência

### 6.4 Roteiro Master Discovery como Ativo Complementar

O Roteiro Master (Google Doc, 11 seções) é o **documento operacional** que preenche o Painel de Calls durante cada call. Cada seção tem função específica:

1. **Dados da call** — nome, data, nacionalidade, origem do lead
2. **Consentimento de gravação** — checkbox Sim/Não
3. **SPIN completo** — S→P→I→N com checkbox por pergunta
4. **Diagnóstico ao vivo** — via jurídica, complexidade, riscos
5. **Documentos por país** — checklist documental específico
6. **Banco de objeções** — respostas prontas
7. **Comparativo das 8 cidadanias** — tabela de referência
8. **Produtos/valores** — escopo e investimento
9. **Fechamento suave** — CTA sem pressão
10. **Registro pós-call** — resumo, via recomendada, documentos pendentes, próxima ação
11. **Organização no Drive** — onde arquivar gravação/transcrição/documentos

### 6.5 Fluxo: Discovery → Pré-análise Genealógica → Proposta → Onboarding

```
WhatsApp (triagem)
    ↓
Painel de Calls (registro + SPIN ao vivo)
    ↓
Roteiro Master (preenchido por cliente)
    ↓
Pré-análise genealógica (diagnóstico de via, complexidade, riscos)
    ↓
Proposta (Template Mestre + Ancestral Blueprint)
    ↓
Follow-up (D0-D14, tom acolhedor)
    ↓
Aceite → Contrato → Pagamento → Onboarding (Checklist GoLive)
    ↓
App Cliente (Ancestral Canvas) + Desk Intelligence
```

### 6.6 Anotações do Gemini (Transcrições de Discovery)

Encontradas no Google Drive (3 arquivos novos):

| Lead | Data da call | Arquivo | Status |
|---|---|---|---|
| Ana Luiza Gomes Silveira | 03/08/2026 16:05 | `1u2xjzJwyhGbC-jz2U3cXQExlNG0C0BScHp3q-_6Rbbs` | Validado (encontrado) |
| Giovanna Prade | 31/07/2026 13:59 | `1O8cpR-eexoDfJQj-0EKdLUsv2LGYCZtPX57ufdQ4gf8` | Validado (encontrado) |
| João Marcelo Faria Moraes | 03/08/2026 17:03 | `11L4KCsG7cXW2Ot1pO1Ogbdrw8JfpIi_BvlHP174jM3Y` | Validado (encontrado) |

**Observação:** A transcrição da call do João Marcelo **não foi encontrada** na busca de memória anterior, mas o arquivo Google Doc com anotações do Gemini foi localizado no Drive nesta auditoria. **PENDENTE DE VALIDAÇÃO HUMANA**: confirmar se este Google Doc contém a transcrição completa ou apenas anotações parciais.

### 6.7 Lacunas do Painel de Calls

| Lacuna | Impacto | Ação |
|---|---|---|
| Não foi possível ler diretamente a planilha Google atual nesta auditoria | Achados baseados em histórico de execução, não verificação célula a célula | Ler diretamente o Google Sheet para confirmar abas atuais e dados. |
| Lara não tem transcrição de call confirmada | Discovery por WhatsApp, não call ao vivo | Confirmar se houve call ou apenas triagem por WhatsApp. |
| João: transcrição localizada agora no Drive, mas não validada em conteúdo | Não é possível afirmar tudo que foi discutido | Ler o Google Doc diretamente. |
| Sophi não aparece no Painel de Calls | Caso-modelo do app, não lead de funil | Decidir se Sophi entra no Painel como caso-modelo/demo ou permanece fora do funil comercial. |

---

## Seção 7 — Fluxo Comercial por Tipo de Lead

### 7.1 Cenário 1: Lead com Reunião Discovery

**Fluxo:** WhatsApp → triagem → convite para Discovery → call gravada/transcrita → Roteiro Master preenchido ao vivo → pré-análise genealógica → proposta → reunião de proposta → follow-up → aceite → contrato → pagamento → onboarding

**Casos atuais:**
- **Ana Luiza** (Austríaca §58c): Discovery realizada 03/08. Proposta preparada. Reunião de proposta remarcada (mãe hospitalizada). Próximo passo: remarcar apresentação.
- **Giovanna** (Italiana administrativa): Discovery realizada 31/07. Proposta enviada. Aguardando resposta. Follow-up recomendado segunda-feira pela manhã.
- **João Marcelo** (Portuguesa): Discovery realizada 03/08. Proposta apresentada 09/08. Aguardando retorno na próxima semana.

**Status:** Validado para Giovanna e João; parcialmente validado para Ana Luiza (proposta não apresentada).

### 7.2 Cenário 2: Lead com Reunião de Proposta (sem Discovery prévia)

**Fluxo:** WhatsApp → triagem com dados suficientes → proposta preparada → reunião de proposta → follow-up → aceite → onboarding

**Casos atuais:**
- **Lara** (Italiana): Discovery por WhatsApp (não call ao vivo confirmada). Confirmau interesse e disse "Já agendei a reunião". Status: **aguardando apresentação da proposta**. Próximo passo: confirmar dados genealógicos básicos (nome de solteira da avó, datas/locais) e apresentar proposta.

**Status:** Parcialmente validado — não está claro se Lara teve call de discovery ou apenas troca de mensagens.

### 7.3 Cenário 3: Lead sem Reunião de Proposta (fluxo sem reunião)

**Fluxo:** WhatsApp → triagem → primeira entrega consultiva (leitura inicial + checklist) → CTA "Quero avançar para a Etapa 02" → pagamento → continuidade

**Material:** Módulo "Entrega Consultiva" no App Cliente (Ancestral Canvas via Lovable), com:
- Leitura Inicial
- Elegibilidade Sintética
- Checklist Mínimo
- CTA "Quero avançar para a Etapa 02" → modal de resumo + link de pagamento
- Texto-base de WhatsApp copiável

**Casos atuais:**
- **Sophi Piccoli** (Italiana): Caso-modelo deste fluxo. Fase 01 (diagnóstico inicial) em revisão, não confirmada como entregue. Fase 02 prevista/condicionada. Não há evidência de contratação ou pagamento.

**Status:** Parcialmente validado — fluxo desenhado e implementado no app, mas sem caso real concluído.

### 7.4 Cenário 4: Modelo Sophi/Piccoli — Etapas Detalhadas

**Linha genealógica:** Giovanni Piccoli + Benedetta Bresolin → Ângelo Piccoli (n. 30/08/1872, Noventa Vicentina, Vicenza) → João Picoli → Orlando Picoli → Juliana Picoli → Sophia Piccoli Santiago (n. 18/05/2006)

**Estrutura de etapas:**
- **Etapa 01:** Leitura inicial + síntese de elegibilidade + checklist. Diagnóstico disponível/em revisão. **Não deve ser rotulada como "entregue" até anexar fontes e revisar conteúdo.**
- **Etapa 02:** Estudo aprofundado + organização inicial da pasta italiana. SKU CA-CID-002 configurado com R$1.436 (provisório). Escopo exclui protocolo judicial, advogado, certidões, traduções, apostilas, retificações, taxas e acompanhamento completo. **R$1.436 não deve ser tratado como preço definitivo sem validação humana.**

**Status:** Parcialmente validado — modelo desenhado, Etapa 01 em revisão, Etapa 02 não iniciada. O Lovable aplicou a oferta da Sophi globalmente (corrigido: stage2Offer por caso, sem fallback global, com Sophi isolada como demo/privada).

### 7.5 Cenário 5: Lead sem Reunião desde o Início

**Fluxo:** WhatsApp → triagem → entrega consultiva via app → CTA de pagamento → continuidade (sem nenhuma call)

**Diferença do Cenário 3:** No Cenário 3, há uma primeira entrega consultiva que educa e prova valor antes do CTA. No Cenário 5, o lead entra direto no app sem nenhuma interação de discovery — a entrega consultiva é o primeiro contato.

**Status:** Pendente — fluxo desenhado mas não validado com casos reais. A usuária reconheceu: "vamos ter que convencer com a primeira entrega e lá já com link para pagamento do próximo passo pois não são todas que estão abertas a conversas e reuniões."

### 7.6 Matriz de Fluxo Comercial

| Cenário | Discovery | Proposta | Reunião de proposta | Follow-up | Onboarding | Caso atual |
|---|---|---|---|---|---|---|
| 1. Com reunião Discovery | Sim (call) | Sim | Sim | D0-D14 | App + Desk | Giovanna, João (completo até proposta) |
| 2. Com reunião de proposta (sem discovery) | Não (WhatsApp) | Sim | Sim | D0-D14 | App + Desk | Lara (pendente proposta) |
| 3. Sem reunião de proposta | Não | Não (app) | Não | App CTA | App + Desk | Sophi (modelo, não concluído) |
| 4. Modelo Sophi/Piccoli | Não (app) | Não (app) | Não | App CTA | App + Desk | Sophi (caso-modelo) |
| 5. Sem reunião desde o início | Não | Não (app) | Não | App CTA | App | Pendente de validação |

---

## Seção 8 — Meta Agent e Automação

### 8.1 Critérios de Automação

A regra de governança estabelece: Meta Agent e automação só entram quando houver:
1. Repetição operacional
2. Escopo claro
3. Baixo risco jurídico
4. Baixa dependência de interpretação humana
5. Boa previsibilidade de entrada e saída

### 8.2 Matriz de Automação

| Processo | Repetição? | Escopo claro? | Risco jurídico? | Depende de interpretação humana? | Previsível? | Automatizar? | Meta Agent? |
|---|---|---|---|---|---|---|---|
| Triagem inicial de leads (WhatsApp) | Alta | Sim | Baixo | Baixa | Alta | **AGORA** | **AGORA** — responder perguntas frequentes, coletar dados básicos (nome, objetivo, sobrenomes, país) |
| Agendamento de discovery | Alta | Sim | Baixo | Baixa | Alta | **AGORA** — link de calendário enviado automaticamente após triagem |
| Preenchimento do Roteiro Master | Média | Sim | Baixo | Média | Média | **DEPOIS** — requer transcrição da call + extração de dados |
| Pré-análise genealógica | Média | Parcial | Alto | Alta | Média | **NÃO AUTOMATIZAR** — requer genealogista humano |
| Geração de proposta | Alta | Sim | Médio | Média | Alta | **DEPOIS** — template existe, mas valores/escopo precisam validação humana |
| Follow-up pós-proposta | Alta | Sim | Baixo | Baixa | Alta | **AGORA** — sequência D0-D14 com tom acolhedor |
| Envio de documentos/checklist | Alta | Sim | Baixo | Baixa | Alta | **AGORA** — checklist por país |
| Onboarding (convite app, checklist go-live) | Alta | Sim | Baixo | Baixa | Alta | **DEPOIS** — requer aceite/contrato/pagamento confirmados |
| Gestão de pagamentos (Asaas) | Alta | Sim | Médio | Baixa | Alta | **NÃO AUTOMATIZAR** (manter controle humano) — links devem ser consumidos do catálogo oficial |
| Atualização de CRM/ pipeline | Alta | Sim | Baixo | Baixa | Alta | **DEPOIS** — requer CRM ativo com dados |
| Análise de elegibilidade §58c | Baixa | Não | Alto | Alta | Baixa | **NÃO AUTOMATIZAR** — requer especialista jurídico |
| Tradução/apostilamento | Baixa | Sim | Médio | Média | Média | **NÃO AUTOMATIZAR** — processo jurídico/burocrático |
| Organização de documentos no Drive | Alta | Sim | Baixo | Baixa | Alta | **DEPOIS** — estrutura de pastas por cliente |
| Relatório visual de jornada | Média | Parcial | Baixo | Média | Média | **DEPOIS** — template existe (Ancestral Canvas), mas dados precisam validação |
| Sincronização de marcos jurídicos | Alta | Sim | Baixo | Baixa | Alta | **AGORA** — IMPORTRANGE já configurado |

### 8.3 Classificação Meta Agent

| Função do Meta Agent | Quando | Justificativa |
|---|---|---|
| Responder perguntas frequentes no WhatsApp (horário, processo, valores base) | **AGORA** | Repetição alta, escopo claro, baixo risco |
| Coletar dados iniciais do lead (nome, objetivo, sobrenomes, país) | **AGORA** | Repetição alta, escopo claro, baixo risco |
| Enviar link de calendário para agendamento | **AGORA** | Repetição alta, escopo claro, baixo risco |
| Enviar checklist documental por país | **AGORA** | Repetição alta, escopo claro, baixo risco |
| Follow-up pós-proposta (D0-D14) | **AGORA** | Repetição alta, escopo claro, baixo risco |
| Preenchimento automático do Roteiro Master | **DEPOIS** | Requer transcrição confiável + extração precisa |
| Geração de proposta a partir do template | **DEPOIS** | Requer validação humana de valores/escopo |
| Atualização automática do CRM/pipeline | **DEPOIS** | Requer CRM ativo com dados |
| Pré-análise genealógica | **NUNCA** | Alto risco jurídico, alta dependência de interpretação humana |
| Análise de elegibilidade §58c | **NUNCA** | Alto risco jurídico, requer especialista |
| Gestão de pagamentos Asaas | **NUNCA** | Controle financeiro deve permanecer humano |
| Decisão sobre aceitação/rejeição de lead | **NUNCA** | Requer julgamento humano |

### 8.4 CA · Gem de Follow-up (Gemini Gem)

Uma Gemini Gem já configurada para follow-up foi encontrada no Google Drive (ID: `1O44rU5IK_2lSceiHEej4xUsx8RTYZy4F`, modificada 2026-06-23).

**Status:** Parcialmente validado — existe mas conteúdo não foi inspecionado. **PENDENTE DE VALIDAÇÃO HUMANA**: verificar se a Gem está ativa e se o conteúdo está alinhado com o tom acolhedor definido nas notas de follow-up.

---

## Seção 9 — Esteira de Pagamento por Etapas

### 9.1 Diagnóstico Atual

**Não foi encontrada uma esteira oficial, universal e reconciliada com valores subsequentes a R$1.290.** Existem exemplos de proposta e ofertas provisórias, mas eles conflitam entre si e entre Planejador, Planilha Mestre, Asaas e propostas individuais.

### 9.2 Tronco Operacional Comum (estrutura clara, preço pendente)

O tronco operacional é claro e consistente em todos os materiais:

```
Diagnóstico inicial (R$247 — CA-CID-001)
    ↓
Pesquisa e organização documental
    ↓
Montagem de pasta / estratégia
    ↓
Protocolo / assessoria
    ↓
Pós-reconhecimento (AIRE, transcrição, registro filhos)
```

### 9.3 Valores Documentados por Caso

| Caso | Nacionalidade | Valores documentados | Fonte | Status |
|---|---|---|---|---|
| Diagnóstico individual (padrão) | Todas | R$247 (CA-CID-001) | Planilha Mestre | Validado |
| Giovanna | Italiana | "Por etapas — a partir de R$1.290" (valores subsequentes não listados nesta versão) | Proposta | Parcialmente validado |
| Giovanna (versão detalhada) | Italiana | R$247 diagnóstico + R$4.500 assessoria + R$390 pasta + R$530 AIRE + R$1.588 transcrição + R$1.511 registro filhos | LANCAMENTOS CASO-007 | Parcialmente validado |
| Giovanna (versões alternativas) | Italiana | À vista R$4.230 / 10×R$470 / por etapas R$1.290+; ou R$4.290 / 12×R$397; ou ampliado R$8.766 | Propostas | Conflitante |
| Sophi Etapa 02 | Italiana | CA-CID-002 / R$1.436 (provisório); alternativa R$990 se escopo for só montagem de pasta | Configuração no app | Pendente de validação humana |
| Ana Luiza Fase 1 | Austríaca | R$5.900 (valor final da usuária); teto de despesas Fase 1: R$3.000–4.000 | Sessão `adf48a57` / `d74d47b7` | Parcialmente validado |
| Ana Luiza (evolução) | Austríaca | Evolução: R$5.000–30.000+ → R$11.900/R$19.900 → R$5.900/R$8.900/R$11.900 → R$3.760/R$6.960 → R$5.900 final | Múltiplas sessões | Conflitante (vários valores históricos) |
| João Marcelo (fases) | Portuguesa | Fase 1 R$900 / Fase 2 R$3.500 / Fase 3 R$4.800 / Fase 4 R$800 | Proposta 04/08 | Parcialmente validado |
| João Marcelo (pacotes) | Portuguesa | Diagnóstico R$700 / Documental R$2.800 / Completo R$5.300 | Planilha de proposta | Conflitante com valores por fases |
| João Marcelo (completo) | Portuguesa | R$10.000 (posteriormente considerado alto demais) | Histórico | Obsoleto |
| Alemã | Alemã | CA-CID-DE-002 = R$1.290 (Pesquisa e Montagem Documental) | Planilha Mestre | Validado |
| Austríaca (planejador) | Austríaca | Honorários R$4.800, Despesas R$1.800, Taxas R$600, 6 parcelas; SKU PACOTE-AT-01 | Planejador PARAMETROS | Parcialmente validado |
| Portuguesa (planejador) | Portuguesa | PARAMETROS: honorários R$5.300; SKUS_REFERENCIA: PACOTE-PT-01 R$3.800 | Planejador | Conflitante |

### 9.4 Modelo Sophi Piccoli como Referência de Esteira por Etapas

O caso Sophi é o modelo de esteira por etapas, mas os valores não são definitivos:

| Etapa | Conteúdo | SKU | Valor | Status |
|---|---|---|---|---|
| Diagnóstico | Leitura inicial + síntese de elegibilidade + checklist | CA-CID-001 | R$247 | Validado (padrão) |
| Etapa 02 | Estudo aprofundado + organização inicial da pasta italiana | CA-CID-002 | R$1.436 (provisório) | Pendente de validação humana |
| Etapa 03+ | Protocolo, advogado, certidões, traduções, apostilas | — | Não definido | Pendente |

### 9.5 Estrutura Proposta de Esteira-Padrão

Com base no tronco comum e nos valores documentados, a estrutura proposta (NÃO oficial, sujeita a validação humana):

| Etapa | Descrição | Valor base | Varia por país? | Status |
|---|---|---|---|---|
| 0. Diagnóstico | Leitura inicial + síntese de elegibilidade + checklist mínimo | R$247 | Não (padrão) | Validado |
| 1. Pesquisa e organização documental | Reconstrução da árvore, identificação de elos, coleta de certidões | A partir de R$1.290 | Sim (por país/complexidade) | Parcialmente validado |
| 2. Montagem de pasta / estratégia | Organização documental, estratégia de via (administrativa vs judicial) | A definir | Sim | Pendente de validação humana |
| 3. Protocolo / assessoria | Protocolo do processo, acompanhamento jurídico | A definir | Sim (significativamente) | Pendente de validação humana |
| 4. Pós-reconhecimento | AIRE, transcrição, registro de filhos | A definir (Giovanna: R$530 AIRE + R$1.588 transcrição + R$1.511 registro filhos) | Sim | Parcialmente validado |

**Regra de governança:** Uma linha da fonte oficial = um SKU = uma lógica de preço. Links à vista, recorrente ou por etapa são derivados, não novos SKUs paralelos.

### 9.6 Pendências de Reconciliação

| Pendência | Origem do conflito | Ação |
|---|---|---|
| Giovanna: R$4.230 vs R$4.290 vs R$4.700 vs R$8.766 | Múltiplas versões de proposta | Definir valor final e congelar na Planilha Mestre. |
| João: R$900/R$3.500/R$4.800/R$800 vs R$700/R$2.800/R$5.300 vs R$10.000 | Fases vs pacotes vs completo | Escolher modelo (fases ou pacotes) e congelar. |
| Ana Luiza: R$5.900 vs R$4.800 (planejador) | Sessão vs Planejador PARAMETROS | Reconciliar — R$5.900 é o valor final da usuária, mas o planejador tem R$4.800. |
| Portuguesa: R$5.300 vs R$3.800 | PARAMETROS vs SKUS_REFERENCIA | Reconciliar dentro do próprio Planejador. |
| Sophi Etapa 02: R$1.436 vs R$990 | Configuração no app vs alternativa | Decidir escopo (estudo aprofundado vs só montagem de pasta) e fixar valor. |
| Esteira geral após R$1.290 | Não existe | Criar tabela oficial de etapas subsequentes por país/complexidade. |

---

## Seção 10 — Casos Vivos no Funil

### 10.1 Visão Geral do Funil

4 leads comerciais vivos, 1 caso-modelo/piloto e 1 caso operacional adicional. Nenhum com contrato assinado ou pagamento confirmado.

| Caso | Tipo | Nacionalidade | Origem | Discovery | Proposta | Status atual | Próximo passo |
|---|---|---|---|---|---|---|---|
| Giovanna Prade | Lead comercial | Italiana (administrativa) | — | 31/07/2026 | Enviada | Aguardando decisão/aceite | Follow-up leve segunda-feira |
| João Marcelo | Lead comercial | Portuguesa | — | 03/08/2026 | Apresentada 09/08 | Aguardando retorno próxima semana | Follow-up no prazo combinado |
| Ana Luiza | Lead comercial | Austríaca (§58c) | WhatsApp | 03/08/2026 | Preparada, não apresentada | Reunião remarcada (mãe hospitalizada) | Acolher situação, remarcar |
| Lara | Lead comercial | Italiana (judicial) | WhatsApp | Por WhatsApp (sem call confirmada) | Pendente | Aguardando apresentação da proposta | Confirmar dados e apresentar |
| Sophi Piccoli | Caso-modelo/piloto | Italiana | — | Não (caso-modelo do app) | Não (fluxo sem reunião) | Fase 01 em revisão, Fase 02 não iniciada | Validar Fase 01, decidir Etapa 02 |
| Danilo Kluyber | Caso operacional | Croata | — | — | — | Em andamento (desde 27/07/2026) | Validar se cidadania croata é serviço oficial |

### 10.2 Caso Detalhado: Giovanna da Veiga Prade

**Nacionalidade:** Italiana (via administrativa — pai italiano reconhecido desde 1980)
**Linha familiar:** Pai Péricles Luiz Medeiros Prade seria cidadão italiano reconhecido; bisavô teria vivido em Belluno.

**Documentos pendentes (7 itens):**
1. Certidão de nascimento de Giovanna — presumida, não verificada
2. Certidão/reconhecimento italiano do pai Péricles — pendente; possível homônimo sem prova de ligação com Belluno
3. Nascimento/óbito do avô Ervin/Erwin — não localizado
4. Nascimento do bisavô de Belluno — nome não identificado
5. **CNN do bisavô — faltante e crítica**
6. Casamentos de cada elo — não verificados
7. Traduções/apostilas — não iniciadas

**Proposta (conflitante):**
- Referência: R$4.700
- Versões: à vista R$4.230 / 10×R$470 / por etapas a partir de R$1.290
- Versões anteriores: R$4.290 / 12×R$397 / ampliado R$8.766
- LANCAMENTOS: R$247 + R$4.500 + R$390 + R$530 + R$1.588 + R$1.511

**Status:** Proposta enviada; aguardando decisão/aceite. Não marcar procurações como enviadas/assinadas/recebidas.

**Ação:** Follow-up leve na segunda-feira pela manhã. Não reapresentar tudo nem pressionar.

### 10.3 Caso Detalhado: João Marcelo de Faria Moraes

**Nacionalidade:** Portuguesa (hipótese posterior a Itália, via materna)
**Nascimento:** 17/01/1984
**Sobrenomes:** Faria/Moraes/Silva/Pinto/Coelho

**Árvore discutida:**
- Pai: Adelson da Silva Moraes
- Mãe: Sônia de Deus Faria
- Avós: Hudson Roberto de Moraes, Araci da Silva Moraes, José de Deus Faria, Nair Gomes Faria
- Bisavós: Artur da Silva Pinto, Elvira Amélia Gomes Pinto, Printice de Faria (esposa faltante), Lincon/Leopoldina de Moraes, Durvalino/Petrina da Silva
- Hipótese portuguesa: linha materna Faria/Gomes/Pinto

**Proposta (conflitante):**
- Fases: R$900 / R$3.500 / R$4.800 / R$800
- Pacotes: R$700 / R$2.800 / R$5.300
- Completo: R$10.000 (considerado alto demais)
- Preferência geral: pacote máximo R$6.000

**Transcrição da call:** Anotações do Gemini encontradas no Google Drive (`11L4KCsG7cXW2Ot1pO1Ogbdrw8JfpIi_BvlHP174jM3Y`), mas **não validadas em conteúdo** nesta auditoria. A memória não continha a transcrição.

**Status:** Proposta apresentada 09/08; aguardando retorno na próxima semana.

**Ação:** Follow-up leve no prazo combinado. Antes do contrato: fechar Portugal vs. Itália e escopo/preço final.

### 10.4 Caso Detalhado: Ana Luiza Gomes Silveira Rodrigues

**Nacionalidade:** Austríaca (via §58c StbG — reparação histórica nazista)
**Discovery:** 03/08/2026, 16:05, Google Meet

**Linha familiar:**
Ana Luiza → Adair Pinto Silveira Júnior → Cleusa Lúcia Fragola Silveira → Ana Maria Reimer → Lotte Friedmann/Otto Reimer → Rudolf Friedmann/Heinrich Friedmann

**Dados genealógicos:**
- Heinrich Friedmann: Boskowitz/Mähren, 15/05/1837
- Rudolf Friedmann: Iglu/Morávia, 21/09/1873
- Lotte Friedmann: Stefansrueh/Galícia, 16/05/1902
- Otto Reimer: Graz, 1895
- Imigração: 1920

**Análise:** Via §58c (reparação histórica) é hipótese forte, mas documentalmente dependente. Família judaica; Lotte e Otto provavelmente não se naturalizaram brasileiros. Faltam certidões de casamento anteriores a Ana Maria.

**Filho Felipe** deve ser contemplado. Cidadania do marido Adriel é assunto separado.

**Anexos importantes** (passaporte de Lotte, transcrições, registro APESP, fotos) estão apenas no WhatsApp Business, ainda não arquivados no Drive.

**Proposta:** R$5.900 (Fase 1, valor final da usuária). Teto de despesas Fase 1: R$3.000–4.000.
- Evolução: R$5.000–30.000+ → R$11.900/R$19.900 → R$5.900/R$8.900/R$11.900 → R$5.900 final
- Planejador: Honorários R$4.800, Despesas R$1.800, Taxas R$600, SKU PACOTE-AT-01

**Status:** Proposta aguardando apresentação/remarcação. Reunião remarcada porque a mãe de Ana Luiza foi para o hospital (09/08).

**Ação:** Acolher a situação familiar, remarcar a apresentação, arquivar anexos do WhatsApp e fechar a checagem documental antes de fixar escopo/preço definitivo.

### 10.5 Caso Detalhado: Lara Cardoso Ribeiro

**Nacionalidade:** Italiana (caso judicial — diferente da Giovanna que é administrativa)
**Origem:** WhatsApp. Única pista inicial: memória da avó paterna sobre descendência italiana.

**Dados coletados:**
- Avó paterna: Maria Marcondes Ribeiro (nome de casada)
- Pai: Carlos Roberto Ribeiro
- Avô paterno: Vicente Ribeiro
- Bisavós: Conceição Inez de Oliveira e José Marcondes de Oliveira

**Discovery:** Por WhatsApp (triagem), não call ao vivo confirmada. Lara confirmou interesse e disse "Já agendei a reunião".

**Próximos passos definidos:** Confirmar nome de solteira da Maria, cidades/datas, documentos antigos, familiares vivos, se Marcondes é sobrenome de nascimento ou casamento. Não presumir origem italiana pelo sobrenome.

**Upsell potencial:** Marido e depois filho.

**Status:** Aguardando apresentação da proposta.

**Ação:** Confirmar dados genealógicos básicos e apresentar a proposta/recomendar pesquisa documental inicial.

### 10.6 Caso Detalhado: Sophi Piccoli (Sophia Piccoli Santiago)

**Nacionalidade:** Italiana
**Nascimento:** 18/05/2006
**Função:** Caso-modelo do app (Ancestral Canvas) e do fluxo sem reunião (Entrega Consultiva)

**Linha genealógica:**
Giovanni Piccoli (aprox. 1868, Istrana, Treviso) + Benedetta Bresolin (aprox. 1866, Padernello/Paese, Treviso) → Ângelo Piccoli (30/08/1872, Noventa Vicentina, Vicenza) → João Picoli → Orlando Picoli → Juliana Picoli → Sophia Piccoli Santiago

**Análise:** Ângelo identificado como trisavô. Pais italianos identificados. Pendentes: elos intermediários, certidões, naturalização, grafias e coerência documental. Via administrativa direta restrita; via judicial é hipótese dependente da documentação.

**Status das fases:**
- Fase 01: diagnóstico inicial disponível/em revisão. **Não deve ser rotulada como "entregue" até anexar fontes e revisar o conteúdo.**
- Fase 02: prevista/condicionada, não iniciada. SKU CA-CID-002 / R$1.436 (provisional). Instrução mais recente: deixar preço, SKU e link dependentes da definição humana após a Fase 01 real.
- Proposta/pagamento: proposta a preparar/enviar e pagamento não aplicável. **Não há evidência de contratação ou pagamento.**

**Documentos:** Nenhum documento deve ser marcado como recebido sem anexo real. A procuração italiana **não foi entregue**.

**Correção Lovable:** O Lovable aplicou a oferta da Sophi globalmente e apagou/ocultou perfis de outros casos. Correção: stage2Offer por caso, sem fallback global, com Sophi isolada como demo/privada.

**Status:** Não está no Planejador CASOS (não é um caso de funil comercial ativo). É caso-modelo do app.

**Ação:** Localizar a fonte da primeira versão do relatório, anexar evidências reais, corrigir o status Fase 01 e decidir se a Etapa 02 é CA-CID-002, SKU novo ou outra categoria.

### 10.7 Caso Extra: Danilo Kluyber de Souza

**Nacionalidade:** Croata
**ID:** CA-CID-HR-2026-001
**Status no Planejador:** Em andamento (desde 27/07/2026)

**Observação:** Único caso com status "Em andamento" no Planejador CASOS (os outros estão em "Proposta"). Croata é uma nacionalidade que aparece no Planejador PARAMETROS mas **não no site**. **PENDENTE DE VALIDAÇÃO HUMANA**: verificar se cidadania croata é um serviço oferecido oficialmente.

### 10.8 Dashboard Atual

O Dashboard do Painel Mestre mostra: MRR R$269, zero leads, zero oportunidades, zero casos.

**Observação crítica:** O Dashboard não reflete a realidade do funil — há 4 leads comerciais ativos (Giovanna, João, Ana Luiza, Lara), 1 caso-modelo (Sophi) e 1 caso operacional (Danilo), mas o Dashboard mostra zero. O MRR de R$269 pode corresponder a 1 plano de assinatura ativo (CA-WPP-001: R$79/mês × 3 ou similar).

---

## Seção 11 — Saídas Obrigatórias

### A) Diagnóstico Executivo

#### Pontos Fortes

1. **Catálogo oficial sólido:** A Planilha Mestre de Produtos (91 SKUs, ART-01) é o centro oficial bem estruturado.
2. **Roteiro Master Discovery entregue:** Google Doc com 11 seções completas, SPIN, diagnóstico ao vivo, documentos por país, objeções e pós-call.
3. **Painel de Calls Discovery funcional:** Google Sheets com 5 abas, dropdowns, checkboxes, formatação condicional e sincronização IMPORTRANGE.
4. **Template Mestre de Proposta:** 10 slides padronizados, reutilizável para todos os leads.
5. **Fluxo sem reunião implementado:** Módulo Entrega Consultiva no App Cliente com CTA de pagamento.
6. **Intelligence Desk em produção:** App interno no GitHub/Vercel.
7. **Ancestral Canvas/Blueprint:** App cliente e proposta distinguindo claramente as funções.
8. **Auditoria anterior completa:** Pasta 01_CATALOGO_E_SKUS/ com 7 artefatos de saneamento.

#### Pontos Críticos

1. **CRM_Pipeline_legado vazio:** Declarado como fonte única de CRM, mas sem nenhuma linha de dados. O Dashboard mostra zero leads/oportunidades/casos enquanto há 4 leads comerciais ativos (Giovanna, João, Ana Luiza, Lara), 1 caso-modelo (Sophi) e 1 caso operacional (Danilo).
2. **IDs de casos duplicados no Planejador:** CA-CID-IT-2026-001 e CA-CID-PT-2026-001 usados para 2 clientes cada. Typo no ID de Ana Luiza (20026 em vez de 2026).
3. **RESUMO_CASOS com #ERROR! em todas as linhas:** Fórmulas VLOOKUP quebradas.
4. **Esteira de pagamento não reconciliada:** Múltiplos valores conflitantes para cada caso. Não existe tabela oficial de etapas subsequentes a R$1.290.
5. **Lacunas de nacionalidades:** Luxemburgo e Hungria no site e em marcos jurídicos, mas sem parâmetros de preço no Planejador. Croata e Romena no Planejador mas não no site.
6. **Sophi Fase 01 não validada:** Diagnóstico em revisão, não deve ser rotulado como entregue. Fase 02 com valor provisório (R$1.436).
7. **Documentos de Ana Luiza no WhatsApp:** Anexos importantes (passaporte de Lotte, registros) não arquivados no Drive.
8. **Proposta PPTX da Ana Luiza perdida:** Arquivo gerado mas perdido pós-reinício do sandbox.
9. **9 cópias da proposta da Ana Luiza no Dropbox:** Higiene de arquivos comprometida.
10. **Dashboard desatualizado:** MRR R$269, zero de tudo else — não reflete a realidade do funil.

#### Riscos Imediatos

1. **Próxima semana (respostas de propostas):** Giovanna e João podem responder. Se a esteira de pagamento não estiver reconciliada, não há como fechar contrato com valores consistentes.
2. **Ana Luiza:** Mãe hospitalizada, proposta não apresentada. Risco de perda de momentum.
3. **Lara:** Aguardando proposta há mais tempo. Risco de esfriamento.
4. **Sophi:** Caso-modelo do app com Fase 01 não validada. Se usada como demo, pode mostrar dados incorretos.

### B) Matriz de Ação Priorizada

| # | Ação | Prioridade | Esforço | Impacto | Bloqueador? | Status |
|---|---|---|---|---|---|---|
| 1 | Reconcilar esteira de pagamento: definir valores por etapa/país e congelar na Planilha Mestre | **Crítica** | Médio | Alto | Sim — bloqueia fechamento de contratos | Pendente de validação humana |
| 2 | Popular CRM_Pipeline_legado (ou Pipeline_Vendas) com os 4 leads comerciais + 1 caso operacional (Danilo) + 1 caso-modelo (Sophi, marcado como piloto) | **Crítica** | Baixo | Alto | Sim — Dashboard cego sem CRM | Pendente |
| 3 | Corrigir IDs duplicados no Planejador CASOS | **Alta** | Baixo | Médio | Não | Pendente |
| 4 | Corrigir #ERROR! no RESUMO_CASOS do Planejador | **Alta** | Baixo | Médio | Não | Pendente |
| 5 | Adicionar Luxemburgo e Hungria aos PARAMETROS do Planejador e ao dropdown do OPS | **Alta** | Baixo | Médio | Não | Pendente de validação humana |
| 6 | Decidir status de Croata, Romena, Europeia Geral, Nat. BR/FR (serviço oficial ou não) | **Alta** | Baixo | Médio | Não | Pendente de validação humana |
| 7 | Follow-up Giovanna (segunda-feira pela manhã) | **Alta** | Baixo | Alto | Não | Pendente |
| 8 | Remarcar apresentação de proposta da Ana Luiza | **Alta** | Baixo | Alto | Não | Pendente |
| 9 | Confirmar dados de Lara e apresentar proposta | **Alta** | Médio | Alto | Não | Pendente |
| 10 | Follow-up João Marcelo (prazo combinado) | **Alta** | Baixo | Médio | Não | Pendente |
| 11 | Validar Fase 01 da Sophi (anexar fontes, revisar conteúdo) | **Média** | Médio | Médio | Não | Pendente |
| 12 | Arquivar anexos de Ana Luiza do WhatsApp para o Drive | **Média** | Baixo | Médio | Não | Pendente |
| 13 | Regenerar proposta PPTX da Ana Luiza | **Média** | Médio | Baixo | Não | Pendente |
| 14 | Consolidar 9 cópias da proposta da Ana Luiza em 1 versão oficial | **Baixa** | Baixo | Baixo | Não | Pendente |
| 15 | Consolidar 3 cópias do Planejador no Dropbox em 1 versão oficial | **Baixa** | Baixo | Baixo | Não | Pendente |
| 16 | Ler diretamente o Google Sheet do Painel de Calls para validar abas atuais | **Média** | Baixo | Médio | Não | Pendente |
| 17 | Ler diretamente o CRM Modelo (Google Sheet) para verificar se contém dados | **Média** | Baixo | Médio | Não | Pendente |
| 18 | Ler o Google Doc de anotações do Gemini da call do João Marcelo | **Média** | Baixo | Médio | Não | Pendente |
| 19 | Configurar Meta Agent para triagem de WhatsApp, agendamento e follow-up | **Média** | Alto | Alto | Não | Pendente |
| 20 | Conectar Dashboard a Pipeline_Vendas e LANCAMENTOS | **Média** | Médio | Médio | Bloqueado por #2 | Pendente |

### C) Arquitetura Operacional Unificada

```
CLUBE ANCESTRAL — ARQUITETURA OPERACIONAL UNIFICADA

CAMADA 1: ENTRADA / TRIAGEM
├── WhatsApp Business (Meta Agent — automatizar AGORA)
├── AncestralScan™ (site — 5 min, 10 países, gratuito)
└── Google Calendar (agendamento — link compartilhado)

CAMADA 2: DESCOBERTA / DIAGNÓSTICO
├── Painel de Calls Discovery (Google Sheets — ART-22)
│   ├── Painel Calls (log + SPIN)
│   ├── Comparativo Cidadanias
│   ├── Marcos Jurídicos (IMPORTRANGE)
│   ├── Roteiro SPIN
│   └── Listas Base
├── Roteiro Master Discovery (Google Doc)
├── Anotações do Gemini (transcrições por cliente)
└── Pré-análise genealógica (HUMANO — não automatizar)

CAMADA 3: PROPOSTA / NEGOCIAÇÃO
├── Template Mestre Proposta (Markdown → Canva/Slides/PPT)
├── Ancestral Blueprint (proposta no Lovable)
├── Google Calendar (reunião de proposta)
└── Propostas individuais (PPTX por cliente)

CAMADA 4: FOLLOW-UP
├── Sequência D0-D14 (tom acolhedor, sem cobrança)
├── CA · Gem de Follow-up (Gemini Gem)
└── Meta Agent (automatizar AGORA)

CAMADA 5: ACEITE / CONTRATO / PAGAMENTO
├── Estados: proposta aceita → contrato pendente → assinado → pagamento pendente → confirmado
├── Asaas (links de pagamento — consumir do catálogo oficial, NÃO criar novos)
└── Reconciliacao_Asaas (Planilha Mestre)

CAMADA 6: ONBOARDING / OPERAÇÃO
├── Ancestral Canvas (App Cliente — Lovable)
│   ├── Jornada do país
│   ├── Documentos (upload + checklist + entregas)
│   ├── Entrega Consultiva (fluxo sem reunião)
│   └── Relatório Visual
├── Desk Intelligence (interno)
│   ├── Jornada/entregas
│   ├── Documentos e pendências
│   ├── Comercial/financeiro
│   └── Operação (responsável, prazo, alertas)
├── Checklist GoLive Consolidado (Google Sheet — ART-21)
└── Tarefas (OPS — T-001 a T-043)

CAMADA 7: CATÁLOGO / FONTE DE VERDADE
├── Planilha Mestre de Produtos (ART-01) — FONTE OFICIAL
│   ├── Catálogo_Produtos (91 SKUs)
│   ├── Planos_Assinatura
│   ├── Reconciliacao_Asaas
│   └── CRM_Pipeline (a ser populado)
├── Planejador Universal (ART-09) — módulo por caso
└── Painel Mestre OPS (ART-05) — guarda-chuva operacional

CAMADA 8: INTELIGÊNCIA / PRODUTO
├── Intelligence Desk (GitHub/Vercel — app interno)
├── Repositório GitHub (estrutura de bases)
└── Memória do projeto (knowledge wiki)
```

**Princípios da arquitetura:**
- Tudo consome o catálogo oficial (Planilha Mestre).
- Blueprint = proposta; Canvas = app. Não misturar.
- Meta Agent e automação só entram onde há repetição, escopo claro, baixo risco jurídico e baixa dependência de interpretação humana.
- Pré-análise genealógica e elegibilidade jurídica são sempre humanas.

### D) Esteira-Padrão de Onboarding e Pagamento por Etapas

#### Gatilho
Mover caso para "Proposta aceita" no CRM/Pipeline_Vendas.

#### Checklist GoLive (após aceite)

| # | Item | Responsável | Status |
|---|---|---|---|
| 1 | Confirmar cadastro/nome do cliente | Desk | Pendente |
| 2 | Confirmar ID único do caso (CA-CID-{PAIS}-{ANO}-{SEQ}) | Desk | Pendente |
| 3 | Confirmar escopo/produto | Desk | Pendente |
| 4 | Enviar/confirmar contrato | Desk | Pendente |
| 5 | Confirmar pagamento/condição inicial | Desk | Pendente |
| 6 | Convidar cliente no App (Ancestral Canvas) com link/PIN individual | Desk | Pendente |
| 7 | Configurar jornada do país no App | Desk | Pendente |
| 8 | Enviar checklist documental por país | Desk/Meta Agent | Pendente |
| 9 | Iniciar Fase 01 (pesquisa) | Pesquisadora | Pendente |
| 10 | Confirmar responsável e próxima ação | Desk | Pendente |
| 11 | Enviar mensagem de boas-vindas no WhatsApp | Meta Agent | Pendente |
| 12 | Definir primeiro marco da jornada | Desk | Pendente |
| 13 | Definir Fase 02 (escopo, preço, prazo) | Desk | Pendente |
| 14 | Arquivar proposta/escopo no Drive | Desk | Pendente |

#### Esteira de Pagamento por Etapas (estrutura proposta, NÃO oficial)

| Etapa | Descrição | Valor base | Varia por país? | SKU padrão | Status |
|---|---|---|---|---|---|
| 0 | Diagnóstico inicial | R$247 | Não | CA-CID-001 | Validado |
| 1 | Pesquisa e organização documental | A partir de R$1.290 | Sim | CA-CID-002 (ou por país) | Parcialmente validado |
| 2 | Montagem de pasta / estratégia | A definir | Sim | A definir | Pendente de validação humana |
| 3 | Protocolo / assessoria jurídica | A definir | Sim (significativamente) | A definir | Pendente de validação humana |
| 4 | Pós-reconhecimento (AIRE, transcrição, registro filhos) | A definir | Sim | A definir | Parcialmente validado |

**Modelos de pagamento por etapa (3 caminhos, derivados da fonte oficial):**
1. **À vista:** valor total com desconto (ex: Giovanna R$4.230 vs R$4.700 referência)
2. **Recorrência:** parcelas mensais (ex: Giovanna 10×R$470)
3. **Por etapas:** pagamento conforme conclusão de cada etapa (ex: R$247 → R$1.290+ → ...)

**Regra de governança:** Uma linha da fonte oficial = um SKU = uma lógica de preço. Links à vista, recorrente ou por etapa são derivados, não novos SKUs paralelos.

### E) Matriz de Automação

| Processo | Automatizar | Quando | Meta Agent | Justificativa |
|---|---|---|---|---|
| Triagem inicial de leads (WhatsApp) | Sim | AGORA | Sim | Repetição alta, escopo claro, baixo risco |
| Agendamento de discovery | Sim | AGORA | Sim | Repetição alta, escopo claro, baixo risco |
| Envio de checklist documental por país | Sim | AGORA | Sim | Repetição alta, escopo claro, baixo risco |
| Follow-up pós-proposta (D0-D14) | Sim | AGORA | Sim | Repetição alta, escopo claro, baixo risco |
| Sincronização de marcos jurídicos (IMPORTRANGE) | Sim | AGORA (já configurado) | Não | Automação de planilha, não WhatsApp |
| Preenchimento do Roteiro Master | Parcial | DEPOIS | Depois | Requer transcrição confiável + extração |
| Geração de proposta | Parcial | DEPOIS | Depois | Template existe, valores precisam validação |
| Atualização de CRM/pipeline | Sim | DEPOIS | Não | Requer CRM ativo com dados |
| Onboarding (convite app, checklist) | Sim | DEPOIS | Depois | Requer aceite/contrato/pagamento confirmados |
| Organização de documentos no Drive | Sim | DEPOIS | Não | Estrutura de pastas por cliente |
| Relatório visual de jornada | Parcial | DEPOIS | Não | Template existe, dados precisam validação |
| Pré-análise genealógica | Não | NUNCA | Nunca | Alto risco jurídico, alta interpretação humana |
| Análise de elegibilidade §58c | Não | NUNCA | Nunca | Alto risco jurídico, requer especialista |
| Gestão de pagamentos Asaas | Não | NUNCA | Nunca | Controle financeiro humano |
| Decisão de aceitação/rejeição de lead | Não | NUNCA | Nunca | Requer julgamento humano |
| Tradução/apostilamento | Não | NUNCA | Nunca | Processo jurídico/burocrático |

---

## Recomendação Final: O Que Corrigir Antes da Próxima Revisão do Drive

### Antes da próxima revisão do Drive compartilhado, corrigir nesta ordem:

1. **Reconciliar a esteira de pagamento** (Crítica) — Definir valores por etapa/país, congelar na Planilha Mestre e eliminar versões conflitantes. Sem isso, qualquer resposta de proposta na próxima semana não poderá ser fechada com valores consistentes.

2. **Popular o CRM/Pipeline com os 4 leads comerciais + 1 caso operacional (Danilo) + 1 caso-modelo (Sophi, marcado como piloto)** (Crítica) — Giovanna, João, Ana Luiza, Lara, Danilo e Sophi. Sem CRM ativo, o Dashboard está cego e o funil não é gerenciável.

3. **Corrigir IDs duplicados e typo no Planejador CASOS** (Alta) — Renumerar clientes modelo, corrigir ano de Ana Luiza, eliminar duplicações.

4. **Corrigir #ERROR! no RESUMO_CASOS** (Alta) — Recriar fórmulas VLOOKUP.

5. **Adicionar Luxemburgo e Hungria aos PARAMETROS e dropdowns** (Alta) — São nacionalidades no site e em marcos jurídicos, mas sem preço no Planejador.

6. **Consolidar cópias duplicadas** (Baixa) — 9 cópias da proposta da Ana Luiza, 3 cópias do Planejador, 2 cópias da proposta do João. Deixar 1 versão oficial e arquivar as demais.

7. **Arquivar anexos de Ana Luiza do WhatsApp para o Drive** (Média) — Passaporte de Lotte, transcrições, registro APESP, fotos.

8. **Configurar Meta Agent para triagem, agendamento e follow-up** (Média) — Automatizações de baixo risco que aliviam carga operacional imediatamente.

9. **Validar Fase 01 da Sophi** (Média) — Anexar fontes, revisar conteúdo, decidir se Etapa 02 é CA-CID-002 ou SKU novo.

10. **Ler diretamente Google Sheets e Google Docs não validados** (Média) — Painel de Calls, CRM Modelo, Checklist GoLive, anotações do Gemini do João.

---

**Fim da Auditoria-Mãe**

*Documento gerado em 09/08/2026 por Perplexity Computer para o projeto Clube Ancestral. Todos os itens marcados como "Pendente de validação humana" requerem ação direta da usuária antes de serem promovidos a "Validado".*
