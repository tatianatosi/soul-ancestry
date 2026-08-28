# Clube Ancestral — Registro Mestre de Decisões e Implementação

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** consolidado para implementação fase pós-MVP  
**Natureza:** documento canônico de decisões, arquitetura, backlog, ordem de prompts e critérios de aceite  
**Substitui:** decisões dispersas nesta conversa que não estavam registradas em artefato versionado.

---

## Controle de versão

| Versão | Data | Descrição |
|---|---|---|
| 1.0 | 19/08/2026 | Consolidação integral das decisões de CRM, governança, catálogo, jornadas, pesquisa genealógica, biblioteca, IA, navegação e integrações futuras tomadas no dia |

---

## Índice

1. [Objetivo e princípio de implementação](#1-objetivo-e-princípio-de-implementação)
2. [Decisões canônicas do dia](#2-decisões-canônicas-do-dia)
3. [Arquitetura de fontes de verdade](#3-arquitetura-de-fontes-de-verdade)
4. [Navegação e módulos do Desk](#4-navegação-e-módulos-do-desk)
5. [CRM, Discovery e jornada comercial](#5-crm-discovery-e-jornada-comercial)
6. [Produto-pai, trilhas e planejamento](#6-produto-pai-trilhas-e-planejamento)
7. [Formalização e governança contratual](#7-formalização-e-governança-contratual)
8. [Ficha Piloto Genealógica e pesquisa](#8-ficha-piloto-genealógica-e-pesquisa)
9. [Biblioteca Base, fontes e projeções](#9-biblioteca-base-fontes-e-projeções)
10. [Jornada do cliente e micro-entregas](#10-jornada-do-cliente-e-micro-entregas)
11. [Assistente AI e Gems](#11-assistente-ai-e-gems)
12. [Casos de referência](#12-casos-de-referência)
13. [Higiene de dados e legado](#13-higiene-de-dados-e-legado)
14. [Ordem pós-MVP](#14-ordem-pós-mvp)
15. [Prompts faltantes](#15-prompts-faltantes)
16. [Critérios de aceite](#16-critérios-de-aceite)
17. [Proibições e limites](#17-proibições-e-limites)

---

## 1. Objetivo e princípio de implementação

O Desk Intelligence será o sistema operacional canônico do Clube Ancestral. O projeto não deve ser reduzido a um CRM simples, nem fragmentado em centenas de abas. A profundidade pertence aos dados e às relações entre entidades; a navegação deve ser concentrada em módulos principais e contextos de caso.

Regra de execução: uma mudança de dados, schema, interface, RLS, fluxo, automação ou integração deve sempre ter:

1. decisão documentada;
2. versão de artefato;
3. prompt de implementação;
4. testes/critério de aceite;
5. registro de resultado;
6. commit no repositório quando houver alteração de código ou documentação do produto.

---

## 2. Decisões canônicas do dia

1. Desk Intelligence/Supabase é a fonte canônica de operação diária.
2. Planilha Mestre, CRM OPS, Placego e demais planilhas deixam de ser sistemas operacionais; são legado somente leitura/migração.
3. Placego importa apenas contatos e metadados disponíveis via CSV; não é fonte canônica de conversão, investimento ou contexto comercial.
4. Produto-pai + trilha técnica + núcleo familiar + escopo + condição aprovada formam o `case_service`.
5. País/via não é SKU de prateleira.
6. Preço sugerido homologado se torna preço comercial vigente no `product_catalog`; preço anterior vira histórico legado.
7. Proposta Canva é fonte obrigatória de escopo para formalização, mas não substitui contrato, OS, cobrança ou autorização de pesquisa.
8. Asaas é fonte transacional; não define escopo, preço ou elegibilidade.
9. Toda próxima ação gera alerta interno; ações externas criam rascunho e exigem aprovação humana.
10. Etiquetas não substituem campos, eventos, estados ou alertas.
11. Ficha Piloto Genealógica é a origem de árvore, linhagens, relações, eventos e linha do tempo.
12. Pesquisa = processo; fonte = origem; evidência = informação rastreável; documento = tipo de evidência; achado = interpretação operacional; relatório = entrega robusta; micro-entrega = atualização aprovada.
13. Relatórios Fase 1 e Fase 2 são entidades existentes e não devem ser duplicados.
14. Biblioteca de Evidências fica entre fontes/material e Desk; App recebe somente projeções autorizadas.
15. Fonte aberta não é automaticamente automatizável. Scraping é proibido por padrão até validação de termos e decisão humana.
16. Assistente AI é camada transversal de sugestão, conferência e rascunho; não é autoridade jurídica, financeira, contratual ou de comunicação externa.
17. Financeiro e Validação Jurídica são eixos estruturais do Desk e devem estar acessíveis no mobile.
18. Linguagem terapêutica/determinista/promissória é proibida em conteúdo cliente-facing.
19. Dados fictícios devem ser classificados, isolados e removidos da operação produtiva por processo auditável.
20. Toda decisão futura deve virar artefato versionado antes ou junto da implementação.

---

## 3. Arquitetura de fontes de verdade

| Domínio | Fonte canônica | Observação |
|---|---|---|
| Contatos, oportunidades, casos, tarefas | Desk Intelligence/Supabase | Operação diária |
| Calls, WhatsApp, e-mail, reuniões | CRM interactions no Desk | Registro imutável e auditável |
| Proposta | Canva/documento autorizado | Referência de escopo aceita |
| Contrato e anexos | Ambiente documental autorizado | Desk apenas referencia/gateia |
| Pagamento/cobrança | Asaas | Evento transacional |
| Produto/preço vigente | `product_catalog` homologado no Desk | Legado de planilha preservado apenas para auditoria |
| Dossiê/documento/fonte | Drive/ambiente autorizado + Biblioteca de Evidências | Links e metadados no Desk |
| Pesquisa e evidência | Desk/Biblioteca de Evidências | Estado, confiança, fonte e revisão |
| Conteúdo cliente-facing | `app_projections` e `client_deliverables` aprovados | Nunca fonte crua ou hipótese |
| Fontes genealógicas externas | Catálogo de fontes | Modo de uso e termos controlados |

---

## 4. Navegação e módulos do Desk

### Menu principal canônico

1. Visão Geral
2. Casos 360
3. Comercial
4. Pesquisa e Evidências
5. Financeiro e Formalização
6. Jornada do Cliente
7. Biblioteca Base
8. Administração

### Regra de fusão

Uma entidade deve ser armazenada uma vez e referenciada por múltiplos módulos. Não criar aba para cada tabela técnica.

| Módulo | Conteúdos internos |
|---|---|
| Visão Geral | KPIs, urgências, radar, marcos jurídicos, alertas e atalhos |
| Casos 360 | Caso, família, pessoas, trilha, escopo, formalização, onboarding, dossiê e histórico |
| Comercial | Contatos, leads, calls, Discovery, propostas, aceite, follow-up e Placego |
| Pesquisa e Evidências | Ficha Piloto, pessoas/linhagens, fontes, documentos, evidências, achados, relatórios e plano de pesquisa |
| Financeiro e Formalização | Produto, preço, exceção, proposta Canva, despesas, contrato, matriz jurídica, gates e pagamentos referenciados |
| Jornada do Cliente | Entregas, relatórios aprovados, app, comunicação, touchpoints e Meta Agent |
| Biblioteca Base | Dicionários, glossário, linguagem, trilhas, marcos, fontes, modelos e versões |
| Administração | Usuários, RLS, logs, legado, dados fictícios e integrações futuras |

---

## 5. CRM, Discovery e jornada comercial

### Estados

- Eixo Comercial: Novo lead; Triagem; Discovery agendada; Discovery realizada; Diagnóstico em elaboração; Proposta enviada; Negociação; Aceite verbal; Confirmação formal recebida; Nutrição; Perdido; Encerrado sem aderência.
- Eixo Formalização/Operação: Não iniciado; Formalização em preparação; Contrato enviado; Contrato assinado; Pagamento inicial confirmado; Onboarding iniciado; Caso ativo; Arquivado.
- Estado derivado: Pré-onboarding bloqueado; Formalização pendente; Onboarding pendente; Em execução; Aguardando cliente; Aguardando terceiro; Concluído; Arquivado.

### Eventos imutáveis

`lead_created`, `discovery_scheduled`, `discovery_completed`, `proposal_sent`, `verbal_acceptance_confirmed`, `formal_confirmation_received`, `contract_sent`, `contract_signed`, `initial_payment_confirmed`, `onboarding_started`, `case_activated`, `lost`.

### Regra inegociável

Todo lead/caso ativo exige área, responsável nominal, próxima ação e prazo. Call realizada exige resumo, resultado e próxima ação.

---

## 6. Produto-pai, trilhas e planejamento

### Estrutura

```text
Produto-pai
+ trilha técnica por país/via
+ núcleo familiar
+ escopo aprovado
+ condição comercial aprovada
= case_service
```

O Planejador pode produzir checklist, pendências, próxima ação, marco verificável e necessidade de revisão; não produz decisão jurídica, score de elegibilidade cliente-facing, prazo automático, cobrança ou produto automático.

### Top 30

O catálogo Top 30 é composto por produtos-pai de diagnóstico, pesquisa, documentação, protocolo, pós-reconhecimento, memória/legado e continuidade. Nacionalidades são `citizenship_tracks`, não SKUs.

---

## 7. Formalização e governança contratual

### Gatilhos

Contrato/assinatura/financeiro/onboarding são bloqueados sem:

- proposta Canva válida e completa;
- escopo conferido;
- produto/case service e condição homologados;
- cadastro aplicável;
- família/dependentes definidos;
- revisão jurídica exigida resolvida;
- dependentes representados quando aplicável;
- despesas de terceiros aprovadas quando aplicável.

### Despesas de terceiros

Estados: Não aplicável; Estimativa pendente; Estimadas e comunicadas; Aguardando aprovação; Aprovadas; Pagas diretamente pelo cliente; Parcialmente pagas; Pendência do cliente.

Cliente/família paga terceiro diretamente ou antecipa valor aprovado. Nunca tratar como caixa, despesa própria ou reembolso do Clube.

### Matriz jurídica

A matriz jurídica registra temas e decisões, sem gerar texto de cláusula até revisão jurídica humana. Temas pendentes bloqueantes impedem assinatura.

---

## 8. Ficha Piloto Genealógica e pesquisa

### Cadeia canônica

```text
Fonte/material
→ Biblioteca de Evidências
→ Pessoa/Relação/Evento/Linhagem
→ Validação humana e confiança
→ Desk/Pesquisa
→ Projeção autorizada
→ App / One-page / PDF aprovado
```

### Entidades principais

- Pessoa/perfil genealógico
- Variante de nome
- Relação genealógica
- Linhagem
- Evento genealógico
- Fonte
- Evidência
- Documento/solicitação
- Hipótese/lacuna
- Achado genealógico
- Relatório de fase
- Projeção app

### Estados epistemológicos de evidência

- INFORMAÇÃO_COMPARTILHADA_FAMILIA
- DADO_PESQUISA_INICIAL
- EM_VALIDACAO_DOCUMENTAL
- VALIDADO_POR_DOCUMENTO
- PENDENTE_CONFIRMACAO
- NAO_APLICAVEL

### Níveis de confiança

- INICIAL
- BAIXO
- MEDIO
- ALTO

Não permitir salto automático de inicial para alto. Busca negativa é evidência válida.

---

## 9. Biblioteca Base, fontes e projeções

### Submódulos

- Glossário operacional
- Dicionários/listas controladas
- Guia de linguagem
- Trilhas por país/via
- Marcos jurídicos/fontes oficiais
- Catálogo de fontes genealógicas
- Tipos documentais/evidências
- Produtos-pai/jornadas
- Modelos F1/F2
- Templates de comunicação
- Privacidade/acesso/sanitização
- Histórico e versões

### Catálogo de fontes genealógicas

Campos obrigatórios:

- nome
- país/eixo
- tipo de acervo
- cobertura temporal/geográfica
- acesso
- licença/termos
- custo
- modo de uso permitido
- autenticação
- dados pessoais
- risco
- uso recomendado
- prioridade
- última verificação
- status de documentação
- status de integração
- próxima ação

Modo de uso permitido:

- manual
- metadados_linkout
- api_validada
- parceria
- restrito
- nao_validado

### Projeções

App/one-page/PDF não leem entidades de pesquisa diretamente. Devem usar `app_projections` com conteúdo sanitizado, aprovação, destino, escopo de visibilidade e vigência.

---

## 10. Jornada do cliente e micro-entregas

### Gates de onboarding

```text
Contrato assinado
+ pagamento inicial confirmado
+ responsável definido
+ núcleo/família definido quando aplicável
+ dossiê-mãe
+ plano/checklist
= onboarding iniciado
```

### Cadência

- D0: preparação de boas-vindas
- D1–D3: responsável, guia, plano/checklist
- Até D7: primeiro valor verificável
- D10: alerta interno
- D14: alerta crítico + rascunho de atualização

### Entregas

Relatórios F1 e F2 são entregas robustas. Micro-entregas são cards menores aprovados. Não publicar automaticamente.

---

## 11. Assistente AI e Gems

O Assistente do Desk é transversal, contextual e auditável. Pode consultar dados autorizados, explicar, resumir, classificar, sugerir e preparar rascunhos. Não pode decidir juridicamente, confirmar pagamento, criar contrato, cobrar, pesquisar externamente, publicar ou enviar mensagens.

Gems:

- Comercial/Discovery
- Cidadania/Trilhas
- Genealógica
- Evidências/Fontes
- Relatórios/Entregas
- Linguagem/Sanitização
- Formalização/Gates
- Operações/Prioridades
- Meta Agent/Mapeamento

Toda execução deve gerar log de fontes consultadas, dados ausentes, versão de dicionários, sugestão e necessidade de revisão humana.

---

## 12. Casos de referência

### Ana Luiza

- ID: CA-CID-AT-FAM-2026-001
- Alias: CA-AUT-ANALUIZA-FAM-2026-001
- Trilha: Áustria / §58c
- Estado: confirmação formal recebida; formalização em preparação; pré-onboarding bloqueado
- Produto-pai: Diagnóstico Familiar Multipaís
- Condição: R$ 9.600 apenas referência interna; sem cobrança
- Dependente: Felipe, representação pendente, sem participação contratual/App/anexo inicialmente

### João

- Produto-pai: Diagnóstico de Cidadania por Etapas
- Trilha: Portugal / via a confirmar
- Estado: aceite verbal
- Próxima ação: solicitar confirmação formal em D+2
- Sem contrato, cobrança, onboarding ou caso ativo

### Naturalização brasileira

- Produto-pai: Diagnóstico de Cidadania por Etapas
- Trilha: Brasil / naturalização/residência
- Estado: triagem
- Sem conclusão jurídica, caso ativo ou pesquisa externa

---

## 13. Higiene de dados e legado

`data_origin` obrigatório:

- production_real
- migration_legacy
- development_fixture
- sandbox
- unknown_needs_review

Fixtures e sandbox não entram em Cockpit de produção, App, métricas ou comunicação. Legado só leitura. Exclusão real exige backup, lista de IDs e aprovação específica.

---

## 14. Ordem pós-MVP

1. Corrigir navegação mobile e acesso a todos os módulos.
2. Ficha Piloto Genealógica v1.1 + Bloco 5A.
3. Biblioteca de Evidências, dicionários, glossário e Guia de Linguagem.
4. Pesquisa, fontes, documentos, evidências e relatórios F1/F2.
5. Achados, linha dupla e Encontros de Linhagem.
6. Plano de ação de pesquisa, instituições e despesas previstas.
7. Cockpit avançado, Radar e Marcos jurídicos.
8. Assistente AI/Gems no Desk.
9. Importação Placego CSV e higiene de dados.
10. Apenas depois: integrações aprovadas do Bloco 5B, automações externas, Asaas e Meta Agent.

---

## 15. Prompts faltantes

### Prompt A — Navegação Mobile e módulos transversais

```text
IMPLEMENTAR NAVEGAÇÃO RESPONSIVA E AGRUPAMENTO DE MÓDULOS DO DESK.

Não alterar dados, schema, gates, contratos, cobranças, pesquisas, comunicações ou integrações.

No mobile, todas as áreas devem ser acessíveis por menu recolhível sem overflow oculto:
1. Visão Geral
2. Casos 360
3. Comercial
4. Pesquisa e Evidências
5. Financeiro e Formalização
6. Jornada do Cliente
7. Biblioteca Base
8. Administração

Converter subabas horizontais de Caso/Pesquisa em seletor/dropdown/drawer mobile. Garantir acesso a Financeiro, Matriz Jurídica, Preparação Contratual, Pesquisa e Biblioteca. Preservar aviso de alterações não salvas e rotas existentes. Testar 320, 375, 390, 414, tablet e desktop.
```

### Prompt B — Ficha Piloto v1.1 + Bloco 5A

```text
IMPLEMENTAR FICHA PILOTO GENEALÓGICA V1.1 COM GOVERNANÇA DO BLOCO 5A.

Não iniciar APIs, scraping, pesquisa externa, contatos, publicação ou integrações.

Criar Pessoas e Linhagens com Perfil Genealógico, Relações sem limite fixo, Linhagens, Eventos, Árvore e Linha do Tempo derivadas de evidências.

Adicionar estados epistemológicos: INFORMACAO_COMPARTILHADA_FAMILIA, DADO_PESQUISA_INICIAL, EM_VALIDACAO_DOCUMENTAL, VALIDADO_POR_DOCUMENTO, PENDENTE_CONFIRMACAO, NAO_APLICAVEL.

Adicionar confiança: INICIAL, BAIXO, MEDIO, ALTO. Elevação exige revisão humana.

Criar name_variants, genealogical_relationships, lineage_paths, genealogical_events e app_projections.

Busca negativa é evidência válida. Fonte aberta não implica automação. App recebe somente projeção sanitizada aprovada.

Criar testes de pessoa/evidência, relação, linha dupla, evento/timeline, hipótese interna e projeção cliente bloqueada sem aprovação.
```

### Prompt C — Biblioteca Base e Catálogo de Fontes

```text
IMPLEMENTAR BIBLIOTECA BASE VERSIONADA E CATÁLOGO DE FONTES GENEALÓGICAS.

Não integrar API, scraping, fonte externa, comunicação ou pesquisa externa.

Criar submódulos: Glossário, Dicionários, Linguagem, Trilhas, Marcos Jurídicos, Fontes Genealógicas, Tipos Documentais, Produtos-pai, Modelos F1/F2, Templates de Comunicação, Privacidade e Histórico.

Criar catálogo de fontes com nome, país/eixo, acervo, cobertura, termos, custo, modo_de_uso_permitido, autenticação, dados pessoais, risco, uso, prioridade, última verificação, status documental, status integração e próxima ação.

Modo permitido: manual, metadados_linkout, api_validada, parceria, restrito, nao_validado.

Criar guia de linguagem com termos proibidos e substituições, aplicado a rascunhos de entrega/projeção/comunicação sem alterar copy já aprovada automaticamente.
```

### Prompt D — Pesquisa, Evidências, Documentos e Relatórios

```text
IMPLEMENTAR PESQUISA GENEALÓGICA E EVIDÊNCIAS COM RELATÓRIOS DE FASE.

Não iniciar pesquisa externa, pedidos, contatos institucionais, publicação ou comunicação.

Criar pesquisa, pessoas, fontes, documentos/solicitações, evidências, validação, hipóteses/lacunas, relatórios e vínculos relatório-evidência.

Manter Relatório F1 Diagnóstico e Relatório F2 Pesquisa Genealógica e Evidências como entregas robustas existentes; não duplicar relatórios.

Documento é tipo de evidência. Toda evidência precisa de fonte, estado epistemológico, confiança, responsável e visibilidade.

Criar grid de documentos: Geração, Nome Completo, Tipo Documento, Arquivo/Instituição, Data Pedido, Status, Data Recebimento, Observação.

Status relevante gera próxima ação, prazo, alerta interno e rascunho externo quando aplicável, sem envio.
```

### Prompt E — Achados, Encontros e Plano de Ação

```text
IMPLEMENTAR ACHADOS GENEALÓGICOS, ENCONTROS DE LINHAGEM E PLANO DE AÇÃO DE PESQUISA.

Não contatar instituições, criar pedidos, despesas, mensagens ou publicar conteúdo.

Criar achados vinculados a fonte/evidência, com fatos confirmados, itens a confirmar, impacto na árvore, timeline e planejamento.

Criar Encontro de Linhagem com contexto histórico, territórios migratórios, memória familiar, práticas culturais documentadas, encontros no Brasil, repertórios narrativos e disclaimer. Proibir determinismo cultural, psicológico, terapêutico ou espiritual.

Criar plano de ação de pesquisa com prioridades, instituições, rechecagem, rascunhos de contato, aprovação humana, resultado interno e previsão de terceiros sem caixa do Clube.
```

### Prompt F — Radar, Marcos Jurídicos e Cockpit Avançado

```text
IMPLEMENTAR RADAR INTERNO, MARCOS JURÍDICOS E COCKPIT AVANÇADO.

Não calcular elegibilidade final, prazo jurídico automático, cobrança, comunicação ou pesquisa externa.

Criar Radar por caso com eixos: estrutura familiar, linha de transmissão, evidência documental, marco jurídico, via preliminar, risco de ruptura, autorização de pesquisa, formalização, financeiro e jornada.

Estados: Regular, Atenção, Crítico, Pendente, Não aplicável. Todo estado deve apontar campo/fonte e próxima ação.

Criar visão de Marcos Jurídicos: trilha, marco, fonte oficial, status atualização, última verificação, responsável, revisão, casos impactados, urgência e próxima revisão.

Expandir Visão Geral com KPIs comerciais, operacionais, pesquisa, jornada, jurídico, financeiro e qualidade de dados. Todo KPI abre lista filtrada; ausência de dados mostra Sem dado/Pendente de fonte, não zero.
```

### Prompt G — Assistente AI e Gems

```text
IMPLEMENTAR ASSISTENTE TRANSVERSAL DO DESK E GEMS ESPECIALIZADAS.

Não permitir envio, publicação, pesquisa externa, scraping, contrato, cobrança, assinatura ou alteração automática de dados.

Criar painel lateral contextual, registro de Gems e logs de execução. Gems: Comercial/Discovery, Cidadania/Trilhas, Genealógica, Evidências/Fontes, Relatórios/Entregas, Linguagem/Sanitização, Formalização/Gates, Operações/Prioridades, Meta Agent/Mapeamento.

Toda sugestão informa fontes consultadas, dados ausentes, confiança, limites e revisão humana necessária. Conteúdo cliente-facing só vira rascunho aprovado. Respeitar RLS e não expor dados restritos.
```

### Prompt H — Importação Placego e higiene de dados

```text
IMPLEMENTAR IMPORTAÇÃO CSV PLACEGO E HIGIENE DE DADOS.

Não criar API contínua, métricas de mídia, comunicação ou alteração em legados.

Importar apenas contatos/metadados disponíveis com preview, mapeamento, deduplicação, lote, vínculo de origem e fila de exceções. Não tornar Placego fonte de funil/conversão/investimento.

Aplicar data_origin em todas as entidades: production_real, migration_legacy, development_fixture, sandbox, unknown_needs_review. Isolar fixtures de Cockpit/App/métricas. Criar fila e relatório de saneamento sem exclusão automática.
```

---

## 16. Critérios de aceite

- Navegação mobile acessa todos os módulos.
- Dados de Caso persistem e não somem após reload.
- Ana mostra bloqueios corretamente.
- João segue aceite verbal → confirmação formal.
- Naturalização fica em triagem sem conclusão jurídica.
- Ficha Piloto gera árvore/timeline internas com evidência.
- Fonte/estado/confiança/visibilidade são rastreáveis.
- Biblioteca Base controla glossários, fontes, linguagem e marcos.
- Conteúdo cliente-facing exige projeção aprovada.
- Assistente AI só sugere e registra logs.
- Placego importa contatos com rastreabilidade.
- Nenhuma integração externa, contato, cobrança ou publicação é acionada sem aprovação específica.

---

## 17. Proibições e limites

- Não usar termos terapêuticos, deterministas, espirituais ou promissórios em conteúdo cliente-facing.
- Não apresentar hipótese, risco, score ou fonte crua ao cliente.
- Não tratar fonte colaborativa como prova isolada.
- Não tratar busca negativa como ausência de registro; registrar como evidência.
- Não criar SKU por país.
- Não usar planilha como ponte operacional.
- Não criar automação externa antes de validação de fluxo, permissão, termos, RLS e aprovação humana.
- Não criar 5000 abas: dados são transversais, módulos são agrupados.
