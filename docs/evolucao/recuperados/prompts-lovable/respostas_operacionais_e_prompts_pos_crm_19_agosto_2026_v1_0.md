# Clube Ancestral — Respostas Operacionais e Prompts Pós-CRM

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** documento canônico de decisão e implementação  
**Complementa:** CA-IMPL-CRM-01, Registro Mestre de Decisões e Implementação, Ficha Piloto Genealógica, Biblioteca de Evidências, Catálogo de Bases e Jornada Ana.

---

## Sumário

1. [Objetivo](#1-objetivo)
2. [Onde responder perguntas](#2-onde-responder-perguntas)
3. [Matriz pergunta → destino](#3-matriz-pergunta--destino)
4. [Decisões consolidadas](#4-decisões-consolidadas)
5. [Ordem de implementação](#5-ordem-de-implementação)
6. [Prompt 01 — Navegação mobile](#6-prompt-01--navegação-mobile)
7. [Prompt 02 — Biblioteca de Evidências](#7-prompt-02--biblioteca-de-evidências)
8. [Prompt 03 — Catálogo de fontes 5B-Pre](#8-prompt-03--catálogo-de-fontes-5b-pre)
9. [Prompt 04 — Ficha Piloto Genealógica v1.1](#9-prompt-04--ficha-piloto-genealógica-v11)
10. [Prompt 05 — Encontros de Linhagem](#10-prompt-05--encontros-de-linhagem)
11. [Prompt 06 — Blueprint, catálogo e Drive futuro](#11-prompt-06--blueprint-catálogo-e-drive-futuro)
12. [Prompt 07 — Biblioteca Base e Guia de Linguagem](#12-prompt-07--biblioteca-base-e-guia-de-linguagem)
13. [Prompt 08 — Assistente AI e Gems](#13-prompt-08--assistente-ai-e-gems)
14. [Critérios de aceite](#14-critérios-de-aceite)

---

## 1. Objetivo

Este artefato resolve dois problemas:

1. Definir onde Tatiana responde, registra e valida perguntas operacionais, comerciais, documentais e genealógicas sem espalhar decisões em observações soltas.
2. Consolidar os prompts pós-CRM em um único documento versionado, com ordem de aplicação e limites claros.

---

## 2. Onde responder perguntas

A regra é: **cada pergunta deve ser respondida no menor contexto que preserva sua reutilização e auditoria**. Não usar uma única caixa de observações para tudo.

### Camadas de resposta

| Camada | Onde responder | Exemplos |
|---|---|---|
| Dado de pessoa | Pessoa/Participante ou Perfil Genealógico | Nome, CPF, profissão, data/local de nascimento |
| Dado de família | Núcleo familiar | Quem participa, vínculo, dependente, representação |
| Dado comercial | Oportunidade/Discovery/Proposta | Objetivo, objeção, aceite, condição, próxima ação |
| Dado de caso | Caso 360 | Trilha, responsável, bloqueio, próxima ação, fase |
| Pergunta de Discovery | Brief de Discovery | Perguntas prioritárias, lacunas, respostas narrativas |
| Pergunta documental | Documentos e Solicitações | Qual documento falta, de quem, para qual instituição |
| Pergunta genealógica | Pesquisa → Hipóteses e Lacunas | Relação a confirmar, variante de nome, localidade, geração |
| Pergunta jurídica | Matriz Jurídica / marco jurídico | Revisão necessária, regra aplicável, fonte oficial |
| Pergunta de fonte | Catálogo de Fontes / avaliação | Termos, modo de uso, cobertura, prioridade |
| Pergunta de formalização | Preparação contratual | Campo faltante, dependente, escopo, case service, condição |
| Pergunta de entrega ao cliente | Entrega/Micro-entrega/Projeção | O que pode ser mostrado, texto sanitizado, aprovação |
| Pergunta de gestão | Próxima ação/Tarefa/Plano de Ação | Quem faz, quando, risco e alerta |
| Pergunta reutilizável | Biblioteca Base / dicionário | Definição de termo, regra, template, trilha ou fonte |

---

## 3. Matriz pergunta → destino

### 3.1 Na Discovery

| Pergunta | Campo estruturado | Narrativa complementar |
|---|---|---|
| Qual o objetivo? | `objetivo_principal` | Brief de Discovery |
| Qual país/linha? | `pais_linha_prioritaria`, `nationality_interest` | Brief |
| Quem participa? | Núcleo/Família + Pessoa | Estrutura familiar resumida |
| Qual ascendente? | Geração, linha e pessoa | Hipóteses e lacunas |
| Quais documentos existem? | Estado documental inicial | Lista de documentos/links no Brief |
| Qual dor/objeção? | Objeção predominante | SPIN e resumo |
| O que foi combinado? | Próxima ação e prazo | Interação imutável |

### 3.2 Na formalização

| Pergunta | Destino |
|---|---|
| A proposta está completa? | Conferência Canva / preparação contratual |
| Quem assina? | Pessoa/Participante + contrato, quando aplicável |
| Há dependente? | `case_dependents` |
| Há representação legal? | `case_dependents.status_representacao` |
| Qual produto e escopo? | `case_service` |
| Qual preço/condição? | `product_catalog` + exceção aprovada, se houver |
| Há despesas externas? | Tabela de despesas de terceiros |
| Quais temas jurídicos faltam? | Matriz Jurídica |

### 3.3 Na pesquisa

| Pergunta | Destino |
|---|---|
| O que sabemos? | Perfil Genealógico / evidências |
| O que falta confirmar? | Hipóteses e lacunas |
| Que documento buscar? | Documentos e Solicitações |
| Onde buscar? | Catálogo de Fontes + Plano de Ação |
| Qual variante de nome usar? | `name_variants` |
| A relação é confirmada? | Relação genealógica + evidência/validação |
| O que mudou na árvore? | Achado Genealógico + árvore/timeline |
| O que o cliente pode saber? | App projection/client deliverable aprovado |

---

## 4. Decisões consolidadas

1. Toda resposta narrativa de Discovery fica no Brief; somente classificação e decisão operacional vão para campos estruturados.
2. Toda resposta genealógica deve ter estado: confirmado, provável, hipótese, pendente ou refutado, com evidência quando confirmada.
3. Perguntas repetíveis e normativas viram Biblioteca Base/dicionário; perguntas particulares permanecem no caso, pessoa ou pesquisa.
4. Roteiro Master não é duplicado em proposta ou contrato. Ele orienta Discovery e Brief; o Desk preenche Blueprint/escopo com dados aprovados.
5. Produto-pai/trilha/escopo/condição formam `case_service`.
6. Preço vem de `product_catalog` homologado ou exceção aprovada, nunca de campo manual.
7. Despesas de terceiros ficam em Financeiro/Formalização, fora do preço de serviço, com aprovação e pagador.
8. Drive é automação futura por gate, nunca cria dossiê operacional somente porque uma oportunidade existe.
9. Pacotes WhatsApp e Familiar Conectado entram como complementos contextuais no catálogo; não ativam comunicação ou família automaticamente.
10. Encontro de Linhagem nasce no Desk e só aparece no App como projeção aprovada.
11. IA sugere e explica, mas não confirma elegibilidade, cria contrato, cobra, pesquisa externamente, publica ou envia mensagem.

---

## 5. Ordem de implementação

| Ordem | Prompt | Gate antes de avançar |
|---:|---|---|
| 01 | Navegação mobile | Financeiro, Biblioteca, Pesquisa e Matriz Jurídica acessíveis no celular |
| 02 | Biblioteca de Evidências | Evidência não chega ao App sem projeção aprovada |
| 03 | Catálogo Fontes 5B-Pre | Fonte catalogada não consulta nada externamente |
| 04 | Ficha Piloto Genealógica | Árvore/timeline derivadas de pessoa, relação e evidência |
| 05 | Encontros de Linhagem | Não publica sem evidência, disclaimer e aprovação |
| 06 | Blueprint/Catálogo/Drive futuro | Preço vem do catálogo; Drive não executa |
| 07 | Biblioteca Base/Linguagem | Termos proibidos bloqueiam rascunhos cliente-facing |
| 08 | Assistente AI/Gems | IA só sugere e registra auditoria |

---

## 6. Prompt 01 — Navegação mobile

```text
IMPLEMENTAR NAVEGAÇÃO MOBILE E AGRUPAMENTO DE MÓDULOS DO DESK.

NÃO ALTERAR DADOS, SCHEMA, GATES, CONTRATOS, COBRANÇAS, PESQUISAS, COMUNICAÇÕES OU INTEGRAÇÕES.

No desktop, manter navegação existente.
No mobile, substituir abas horizontais escondidas por menu recolhível acessível.

Ordem do menu:
1. Visão Geral
2. Casos 360
3. Comercial
4. Pesquisa e Evidências
5. Financeiro e Formalização
6. Jornada do Cliente
7. Biblioteca Base
8. Administração

Converter subabas de Caso e Pesquisa em seletor/dropdown/drawer no mobile.
Garantir acesso a Financeiro, Matriz Jurídica, Preparação Contratual, Pesquisa, Biblioteca e Administração.

Não usar overflow oculto ou depender de gesto lateral.
Preservar alterações não salvas ao navegar.
Testar 320px, 375px, 390px, 414px, tablet e desktop.
Mostrar rotas acessíveis e nenhuma alteração de dados.
```

---

## 7. Prompt 02 — Biblioteca de Evidências

```text
IMPLEMENTAR BIBLIOTECA DE EVIDÊNCIAS E PROJEÇÕES AUTORIZADAS.

NÃO INICIAR API, SCRAPING, PESQUISA EXTERNA, PEDIDOS, CONTATOS, MENSAGENS, PUBLICAÇÃO AUTOMÁTICA, COBRANÇAS OU CONTRATOS.

Arquitetura:
Fonte/material → Biblioteca de Evidências → Desk/Pesquisa → Projeção autorizada → App/One-page/PDF aprovado.

Criar/ajustar:
- research_sources
- evidences
- evidence_validations
- name_variants
- app_projections
- report_evidence_links

Estados epistemológicos:
INFORMACAO_COMPARTILHADA_FAMILIA
DADO_PESQUISA_INICIAL
EM_VALIDACAO_DOCUMENTAL
VALIDADO_POR_DOCUMENTO
PENDENTE_CONFIRMACAO
NAO_APLICAVEL

Confiança:
INICIAL, BAIXO, MEDIO, ALTO.

Não permitir salto automático de INICIAL para ALTO.
Busca negativa é evidência válida.

App só recebe `app_projections` aprovadas, com conteúdo sanitizado.
Fonte crua, URL interna, documento bruto, hipótese, risco, score e dados de terceiros nunca chegam ao App.
Criar testes de estado, confiança, busca negativa e projeção bloqueada sem aprovação.
```

---

## 8. Prompt 03 — Catálogo de fontes 5B-Pre

```text
IMPLEMENTAR BLOCO 5B-PRE — FONTES E INTEGRAÇÕES GENEALÓGICAS EM MODO DE GOVERNANÇA.

NÃO IMPLEMENTAR SCRAPING, API, CREDENCIAL, CONSULTA EXTERNA, PESQUISA EXTERNA, CONTATO INSTITUCIONAL, COMUNICAÇÃO OU PUBLICAÇÃO.

Criar módulo Fontes e Integrações Genealógicas.

Criar genealogical_sources_catalog com cobertura, acesso, termos, custo, risco, dados pessoais, uso recomendado, modo de uso, maturidade, última verificação, responsável e próxima ação.

Modo permitido:
manual, metadados_linkout, api_validada, parceria, restrito, nao_validado.

Scraping somente como vedação interna:
proibido_por_padrao, exige_validacao_juridica_tecnica, nao_aplicavel.

Maturidade:
CATALOGADA, DOCUMENTADA, TERMOS_A_CONFIRMAR, ELEGIVEL_PARA_PILOTO, PILOTO_INTERNO, HOMOLOGADA_MANUAL, HOMOLOGADA_API, RESTRITA, DESCONTINUADA.

Criar matriz de avaliação, backlog de ativação e logs futuros vazios.
Permitir vínculo da fonte a pesquisa sem consultar a fonte.
Testar que fonte catalogada não habilita acesso externo.
```

---

## 9. Prompt 04 — Ficha Piloto Genealógica v1.1

```text
IMPLEMENTAR FICHA PILOTO GENEALÓGICA V1.1 E ÁRVORE DERIVADA DE EVIDÊNCIAS.

NÃO INICIAR PESQUISA EXTERNA, PEDIDO, CONTATO, PUBLICAÇÃO OU ALTERAÇÃO EXTERNA.

Criar em Pesquisa e Evidências → Pessoas e Linhagens:
- Perfil Genealógico 360°
- Relações e Árvore
- Linhagens
- Linha do Tempo
- Documentos e Evidências
- Eventos e Contexto
- Lacunas e Próximas Pesquisas

Criar/ajustar research_people, genealogical_person_profiles, genealogical_relationships, lineage_paths, genealogical_events e módulos históricos opcionais.

Toda relação é registro independente; nunca Filho 1/2 ou Irmão 1/2.
Relação confirmada exige evidência.
Árvore interna mostra confirmado, provável, hipótese e pendente.
App mostra somente fatos/relações sanitizados e aprovados.

Criar name_variants para grafia, tradução, italianização, aportuguesamento, apelido, erro documental, nome religioso e outro.
Linha dupla não duplica pessoa/caso.
Eventos alimentam timeline interna apenas quando vinculados a evidência.
Criar testes de pessoa, relação, linha dupla, variante e bloqueio de hipótese no App.
```

---

## 10. Prompt 05 — Encontros de Linhagem

```text
IMPLEMENTAR ENCONTROS DE LINHAGEM NO DESK E PROJEÇÃO APROVADA NO APP.

NÃO PUBLICAR AUTOMATICAMENTE, NÃO ENVIAR MENSAGEM, NÃO AFIRMAR VÍNCULO SEM EVIDÊNCIA, NÃO USAR LINGUAGEM TERAPÊUTICA, DETERMINISTA OU ESPIRITUAL.

Desk:
Pesquisa e Evidências → Pessoas e Linhagens → Encontros de Linhagem.

Criar lineage_encounters com duas linhagens, evidências, contexto histórico, territórios migratórios, memória familiar, práticas culturais documentadas, encontros no Brasil, repertórios narrativos, impacto, disclaimer e aprovação.

Tipos:
Conexão confirmada; Convergência documental; Separação de ramos; Linha paralela relevante; Dupla linhagem familiar; Marco de origem.

App:
Jornada do Cliente → Entregas da Jornada → História e Linhagens → Encontro de Linhagem.

Só exibir por app_projection/client_deliverable publicada.
Nunca exibir fontes, hipóteses, confiança interna, URLs ou dados de terceiros.
Criar teste de bloqueio sem evidência/disclaimer/aprovação.
```

---

## 11. Prompt 06 — Blueprint, catálogo e Drive futuro

```text
IMPLEMENTAR COMPLEMENTO DE CATÁLOGO, BLUEPRINT PARAMÉTRICO, LINHA DO TEMPO OPERACIONAL E PREPARAÇÃO DE AUTOMAÇÃO DRIVE.

NÃO CRIAR PASTAS, ARQUIVOS, PROPOSTAS CANVA, CONTRATOS, COBRANÇAS ASAAS, LINKS, GRUPOS, MENSAGENS OU AUTOMAÇÕES EXTERNAS.

A. CATÁLOGO
Garantir no product_catalog os produtos-pai, continuidade e complementos contextuais:
- CA-WPP-001 Pacote WhatsApp Essencial
- CA-WPP-002 Pacote WhatsApp Premium
- CA-FAM-001 Familiar Conectado
- CA-FAM-002 Familiar Conectado Plus
- CA-CID-025 Acompanhamento Familiar — Processo Compartilhado
- CA-ASS-001 a CA-ASS-005

Regras:
- produto contextual exige case_service e justificativa;
- pacote WhatsApp não envia mensagens automaticamente;
- Familiar Conectado não cria núcleo/dossiê automaticamente;
- sem preço livre.

B. BLUEPRINT
Criar blueprint_parameters vinculados a case_service e proposta:
case_service_id, product_catalog_id, track_id, family_id, proposta_version, escopo, fases, entregas, critérios de aceite, preço vigente, condição, parcelas, vigência, origem de preço, exceção, despesas, link interno e status.

Preço vem só de product_catalog homologado ou exceção aprovada.
Roteiro Master não é duplicado: alimenta Discovery/Brief; Blueprint recebe apenas campos aprovados.

C. TIMELINE
Criar case_timeline_events para Discovery, Proposta, Aceite, Conferência Canva, Case service, Formalização, Contrato, Pagamento, Onboarding, Dossiê, Pesquisa, Documento, Evidência, Achado, F1/F2, Micro-entrega, Protocolo e Arquivamento.

D. DRIVE FUTURO
Criar drive_provisioning_queue sem executar Drive.
Oportunidade não cria dossiê operacional.
Fila só fica elegível após contrato assinado + pagamento + onboarding aprovado + confirmação humana futura.

Criar testes de preço, pacote contextual, timeline e Drive bloqueado.
```

---

## 12. Prompt 07 — Biblioteca Base e Guia de Linguagem

```text
IMPLEMENTAR BIBLIOTECA BASE, GLOSSÁRIO, DICIONÁRIOS E GUIA DE LINGUAGEM.

NÃO REDESENHAR APP CLIENTE, NÃO ALTERAR COPY APROVADA, NÃO CRIAR COMUNICAÇÕES OU AÇÕES EXTERNAS.

Criar Biblioteca Base:
- Glossário operacional
- Dicionários e listas controladas
- Guia de Linguagem e Termos
- Trilhas por país/via
- Marcos jurídicos e fontes oficiais
- Catálogo de fontes
- Tipos documentais/evidências
- Produtos-pai e jornadas
- Modelos F1/F2
- Templates de comunicação
- Privacidade e sanitização
- Histórico e versões

Criar language_rules para bloquear termos proibidos em rascunhos cliente-facing, incluindo Cura ancestral, Cura da linhagem, Terapia genealógica, Destino familiar, Karma ancestral, promessa de cidadania, prazo garantido e elegibilidade confirmada sem revisão.

Usar substituições aprovadas: pesquisa de história familiar, memória familiar, reconstrução documental, contexto histórico documentado, via em validação, marcos operacionais e documento em validação.

Não alterar texto aprovado automaticamente; apenas bloquear e sugerir revisão.
```

---

## 13. Prompt 08 — Assistente AI e Gems

```text
IMPLEMENTAR ASSISTENTE TRANSVERSAL DO DESK E GEMS ESPECIALIZADAS.

NÃO PERMITIR ENVIO, PUBLICAÇÃO, PESQUISA EXTERNA, SCRAPING, CONTRATO, COBRANÇA, ASSINATURA OU ALTERAÇÃO AUTOMÁTICA DE DADOS.

Criar painel lateral contextual e Gems:
- Comercial/Discovery
- Cidadania/Trilhas
- Genealógica
- Evidências/Fontes
- Relatórios/Entregas
- Linguagem/Sanitização
- Formalização/Gates
- Operações/Prioridades
- Meta Agent/Mapeamento

Toda sugestão deve informar fontes internas consultadas, dados ausentes, confiança, limite, revisão humana e efeito externo.

Criar ai_assistant_runs sem tokens, documento bruto ou transcrição integral.
Respeitar RLS.
Cliente nunca acessa assistente interno ou logs.
Criar testes com Ana, João, naturalização, linguagem proibida, evidência e permissões.
```

---

## 14. Critérios de aceite

- Usuária sabe exatamente onde responder cada pergunta.
- Perguntas narrativas não poluem campos estruturados.
- Financeiro e Biblioteca são acessíveis no mobile.
- Evidência não é exibida ao cliente sem projeção.
- Fonte catalogada não dispara consulta.
- Árvore nasce da Ficha Piloto e não de texto livre.
- Encontro de Linhagem só publica após revisão.
- Blueprint puxa preço homologado e não duplica Roteiro Master.
- Pacotes WhatsApp e Familiar Conectado aparecem no catálogo sem automatizar comportamento.
- Drive fica apenas em fila de provisionamento até gates completos e confirmação futura.
- IA só sugere e mantém auditoria.
