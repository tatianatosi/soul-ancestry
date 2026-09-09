# Clube Ancestral — Decisões Canônicas: CRM, Catálogo, Planejador e Jornada

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Estado:** decisão operacional consolidada; implementação pendente de commit e validação técnica  
**Escopo:** Desk Intelligence, CRM proprietário, Planejador, catálogo por jornada, importação legada, onboarding e higiene de dados de demonstração.

---

## Sumário

1. [Objetivo](#1-objetivo)
2. [Decisões já tomadas](#2-decisões-já-tomadas)
3. [Arquitetura e fontes de verdade](#3-arquitetura-e-fontes-de-verdade)
4. [Sistemas legados e migração](#4-sistemas-legados-e-migração)
5. [Modelo CRM proprietário](#5-modelo-crm-proprietário)
6. [Painel de Calls e Discovery](#6-painel-de-calls-e-discovery)
7. [Planejador e trilhas de cidadania](#7-planejador-e-trilhas-de-cidadania)
8. [Catálogo comercial Top 30 por jornada](#8-catálogo-comercial-top-30-por-jornada)
9. [Produtos contratados por caso](#9-produtos-contratados-por-caso)
10. [Onboarding padrão e ciclo do cliente](#10-onboarding-padrão-e-ciclo-do-cliente)
11. [Micro-entregas e App Cliente](#11-micro-entregas-e-app-cliente)
12. [Caso-piloto Ana Luiza](#12-caso-piloto-ana-luiza)
13. [Fluxo João](#13-fluxo-joão)
14. [Naturalização brasileira](#14-naturalização-brasileira)
15. [Higiene de dados e fim dos fictícios](#15-higiene-de-dados-e-fim-dos-fictícios)
16. [MVP, backlog e ordem de implementação](#16-mvp-backlog-e-ordem-de-implementação)
17. [Critérios de aceite](#17-critérios-de-aceite)
18. [Anti-padrões proibidos](#18-anti-padrões-proibidos)

---

## 1. Objetivo

Transformar o Desk Intelligence no sistema operacional canônico do Clube Ancestral, com um modelo único de contatos, conversas, oportunidades, famílias, casos, planejamento e entregas ao cliente.

O sistema deve substituir a operação distribuída em planilhas e evitar uma arquitetura fragmentada. O foco do primeiro corte funcional é executar corretamente um fluxo real completo — usando Ana Luiza como caso-piloto e João como primeiro fluxo novo de aceite verbal para confirmação formal — antes de automações, dashboards amplos e integrações financeiras externas.

---

## 2. Decisões já tomadas

1. Planilha Mestre de Produtos, CRM OPS e demais planilhas de CRM deixam de ser sistemas operacionais.
2. Esses materiais passam a ser legado somente leitura, servindo a inventário, migração, reconciliação e auditoria histórica.
3. Nenhum webhook novo deve usar planilha como etapa intermediária.
4. Desk Intelligence/Supabase é a fonte canônica de novos registros operacionais.
5. Placego será usado apenas para exportar contatos e metadados mínimos disponíveis; não será fonte de verdade de conversão, investimento, contexto comercial ou etapa.
6. WhatsApp, transcrições e reuniões são evidências de conversa e devem ser registradas internamente em interações imutáveis.
7. O funil comercial será modelado por eventos imutáveis; não por um único campo de status que substitui toda a história.
8. O catálogo comercial será reduzido a produtos-pai e módulos de jornada Top 30; país não será SKU.
9. Preço sugerido homologado torna-se preço comercial vigente. Preço antigo torna-se histórico legado.
10. O Planejador usa trilhas por país/via como configuração interna, sem emitir decisão jurídica, score de elegibilidade ou prazo institucional automático.
11. Onboarding exige contrato assinado, pagamento inicial confirmado, responsável, núcleo/dossiê e plano inicial.
12. App Cliente mostra somente conteúdo aprovado e sanitizado; não mostra score, hipótese, documento bruto, fonte, preço, SKU ou dados internos.
13. WhatsApp automático, webhook de micro-entrega, dashboard de ROI/CAC e automações financeiras ficam fora do MVP.
14. Dados fictícios devem ser identificados, isolados e removidos/substituídos por fixtures de desenvolvimento não produtivas antes do go-live.

---

## 3. Arquitetura e fontes de verdade

| Domínio | Fonte canônica | Responsabilidade |
|---|---|---|
| Contatos, oportunidades, famílias, casos e tarefas | Desk Intelligence / Supabase | Operação diária |
| Conversas, calls, WhatsApp, e-mails e reuniões | Desk Intelligence / Supabase | Registro imutável de evidência operacional |
| Proposta aprovada | Ambiente documental autorizado | Referência comercial e versão aceita |
| Contrato e Ordem de Serviço | Ambiente documental autorizado | Instrumentos e assinaturas |
| Cobrança e pagamento | Asaas | Evento e status transacional |
| Dossiê, documentos e evidências | Drive/ambiente autorizado | Fonte documental restrita |
| Jornada e conteúdo ao cliente | App Cliente | Conteúdo aprovado, sanitizado e autorizado |
| Catálogo comercial | Desk Intelligence / `product_catalog` | Produto-pai, preço vigente, condição e status de homologação |
| Trilha técnica de cidadania | Desk Intelligence / `citizenship_tracks` | País, via preliminar, requisitos, riscos, revisão e documentos |
| Planilhas antigas | Legado somente leitura | Migração e auditoria; sem operação nova |

### Princípio de precedência

- O Asaas não define escopo, preço ou elegibilidade.
- O Drive não define etapa comercial ou pagamento.
- O Planejador não define direito, prazo jurídico ou oferta automática.
- O App não recebe dados internos ou evidência bruta.
- O Desk indexa dossiês, mas não substitui o repositório documental.

---

## 4. Sistemas legados e migração

### 4.1 Sistemas legados

| Sistema/base | Novo estado | Uso permitido |
|---|---|---|
| Planilha Mestre de Produtos | Legado controlado | Extração inicial de catálogo, preços históricos, escopo e links antigos |
| CRM OPS | Legado controlado | Migração de contatos, responsáveis, observações e histórico verificável |
| Outra planilha de CRM | Legado controlado | Deduplicação e consulta histórica |
| Placego | Origem de importação mínima | Exportação de contatos e atributos disponíveis |

### 4.2 Importação Placego

A primeira importação será por CSV. Não haverá API, sincronização contínua ou webhook antes de existir um conjunto validado de contatos e regras de deduplicação.

Campos mínimos aceitos:

- `placego_contact_id`
- nome
- e-mail
- telefone/WhatsApp
- data de entrada
- origem, se disponível
- campanha, se disponível
- observação legada, se disponível

Campos de origem Placego não devem ser tratados como prova de conversão, custo, campanha ativa, aceite, proposta ou pagamento.

### 4.3 Regras de deduplicação

1. Telefone normalizado é a primeira chave.
2. E-mail válido é segunda chave.
3. Nome + telefone parcial é sinal de possível duplicidade, exigindo revisão humana.
4. Todo registro importado preserva `source_system`, `source_record_id`, lote e data de importação.
5. Registro ambíguo entra em exceção de migração; não é fundido automaticamente.

---

## 5. Modelo CRM proprietário

### 5.1 Entidades mínimas

- `contacts`
- `opportunities`
- `crm_interactions`
- `discovery_assessments`
- `conversion_events`
- `families`
- `family_members`
- `cases`
- `case_plans`
- `client_deliverables`
- `communication_queue`
- `legacy_import_batches`
- `legacy_record_links`
- `migration_exceptions`
- `product_catalog`
- `citizenship_tracks`
- `case_services`

### 5.2 Etapas por evento

| Evento | Significado | Efeito permitido |
|---|---|---|
| `lead_created` | Contato criado/importado | Triagem |
| `discovery_scheduled` | Call marcada | Preparação de Discovery |
| `discovery_completed` | Call registrada | Próxima ação comercial |
| `proposal_sent` | Proposta vigente enviada | Follow-up datado |
| `verbal_acceptance_confirmed` | Intenção verbal registrada | Solicitar confirmação formal |
| `formal_confirmation_received` | Evidência escrita recebida | Preparar formalização |
| `contract_sent` | Documento enviado | Acompanhar assinatura |
| `contract_signed` | Assinatura comprovada | Preparar cobrança autorizada |
| `initial_payment_confirmed` | Evento Asaas confirmado | Iniciar onboarding |
| `onboarding_started` | Gates de onboarding atendidos | Criar plano de caso |
| `case_activated` | Caso operacional iniciado | Executar jornada |
| `lost` | Oportunidade encerrada | Registrar motivo |

### 5.3 Regra de lead ativo

Nenhum lead ativo pode permanecer sem:

- área responsável;
- responsável nominal;
- próxima ação;
- prazo de próxima ação.

---

## 6. Painel de Calls e Discovery

O Painel de Calls é uma interface do Desk e grava diretamente no Supabase. Não é uma planilha e não é uma fonte paralela.

### 6.1 `crm_interactions`

Campos principais:

- id
- opportunity_id
- case_id opcional
- contact_id
- interaction_type: `call`, `whatsapp`, `email`, `meeting`, `internal_note`
- direction: `inbound`, `outbound`, `internal`
- occurred_at
- status
- consent_status
- recording_url_internal
- summary_validated
- next_action
- next_action_due_at
- responsible_area
- responsible_user_id
- event_source
- `supersedes_interaction_id`
- created_at

Interações são imutáveis. Correções geram nova interação, ligada à anterior quando aplicável.

### 6.2 `discovery_assessments`

Campos estruturados:

- objetivo principal;
- nacionalidade de interesse;
- país/linha prioritária;
- estrutura familiar;
- geração do ascendente;
- linha de transmissão;
- via jurídica preliminar;
- sinal de aderência preliminar;
- confiança da triagem;
- complexidade documental;
- estado documental inicial;
- risco de ruptura;
- SPIN situação, problema, implicação e necessidade/valor;
- observações internas.

### 6.3 Validações

- Call realizada exige resumo validado, resultado e próxima ação datada.
- Gravação exige consentimento concedido, data/hora, canal e aviso aplicável.
- SPIN concluído exige registro correspondente no resumo ou brief.
- Sinal de aderência e via são dados internos preliminares; não constituem parecer, direito, prazo ou resultado.

---

## 7. Planejador e trilhas de cidadania

### 7.1 Separação estrutural

O Planejador não é catálogo. Ele combina:

1. produto/serviço contratado;
2. trilha técnica por país/via;
3. estado documental e familiar;
4. gates operacionais;
5. revisão humana/jurídica quando aplicável.

### 7.2 `citizenship_tracks`

Campos mínimos:

- país;
- via preliminar;
- marco jurídico de referência;
- status da via;
- requisitos de entrada;
- riscos comuns;
- documentos prioritários;
- pesquisa externa aplicável;
- autorização necessária;
- idioma/entrevista;
- revisão humana/jurídica;
- status de atualização;
- última revisão;
- responsável pela revisão;
- conteúdo sanitizado permitido ao cliente.

### 7.3 Países/trilhas iniciais

- Itália
- Portugal
- Espanha
- Alemanha
- Áustria
- Polônia
- Hungria
- Luxemburgo
- Croácia
- Romênia
- Brasil — naturalização
- Multipaís
- Em investigação

### 7.4 Limites do Planejador

O Planejador pode gerar:

- checklist inicial;
- perguntas prioritárias;
- dependências do cliente;
- pendências internas;
- próxima ação;
- próximo marco verificável;
- entrega robusta prevista;
- micro-entrega possível;
- necessidade de revisão humana/jurídica.

O Planejador não pode:

- determinar direito à cidadania;
- calcular score de elegibilidade para cliente;
- prometer prazo jurídico, consular ou institucional;
- gerar contrato automático por país;
- recomendar/contratar SKU automaticamente;
- iniciar pesquisa externa sem autorização;
- exibir risco, score ou hipótese interna no App Cliente.

---

## 8. Catálogo comercial Top 30 por jornada

### 8.1 Política de preço

- `preco_historico_legado`: valor antigo preservado apenas para auditoria.
- `preco_comercial_vigente`: deriva do antigo preço sugerido após homologação.
- Apenas produto homologado pode aparecer em proposta.
- Exceção comercial exige justificativa, aprovador e validade; não altera o catálogo.
- App Cliente não exibe SKU, preço, ranking ou link técnico.

### 8.2 Produtos-pai por jornada

#### Descoberta e diagnóstico

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-DIAG-001 | Diagnóstico de Cidadania por Etapas | Top 10 |
| CA-DIAG-002 | Diagnóstico Familiar Multipaís | Top 30 |
| CA-DIAG-003 | Diagnóstico de Pesquisa de Origem | Top 30 |
| CA-DIAG-004 | AncestralScan / Discovery gratuita | Funil, sem cobrança |

#### Pesquisa e estratégia

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-PESQ-001 | Pesquisa Genealógica de Base | Top 10 |
| CA-PESQ-002 | Pesquisa Genealógica Familiar Ampliada | Top 10 |
| CA-PESQ-003 | Pesquisa Documental Direcionada | Top 30 |
| CA-PESQ-004 | Pesquisa de Linha Alternativa/Multipaís | Top 30 |

#### Documentação e prontidão

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-DOC-001 | Plano Documental e Checklist de Prontidão | Top 30 |
| CA-DOC-002 | Montagem de Pasta para Cidadania | Top 10 |
| CA-DOC-003 | Revisão ou Atualização de Pasta | Top 30 |
| CA-DOC-004 | Retificação Documental Assistida | Sob demanda |
| CA-DOC-005 | Coordenação de Tradução e Apostilamento | Top 30 |
| CA-DOC-006 | Solicitação de Certidões e Registros | Sob demanda |

#### Protocolo e acompanhamento

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-PROT-001 | Assessoria de Protocolo e Acompanhamento | Top 10 |
| CA-PROT-002 | Estratégia de Via Jurídica com Parceiro | Sob demanda / revisão obrigatória |
| CA-PROT-003 | Acompanhamento Familiar de Processo Compartilhado | Top 30 |
| CA-PROT-004 | Preparação de Reunião ou Entrevista Consular | Top 30 |

#### Pós-reconhecimento

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-POS-001 | Regularização Pós-Reconhecimento | Top 30 |
| CA-POS-002 | Registros Familiares Derivados | Top 30 |
| CA-POS-003 | Passaporte e Registros Consulares | Top 30 |
| CA-POS-004 | Continuidade Cidadão | Top 30 |

#### Memória e legado

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-MEM-001 | Entrevista de Memória Guiada | Top 30 |
| CA-MEM-002 | Livro de História Familiar | Top 10 |
| CA-MEM-003 | Livro de Memórias Premium | Top 30 |
| CA-MEM-004 | Mapa Ancestral Ilustrado | Top 30 |
| CA-MEM-005 | Legado em Vídeo | Sob demanda |
| CA-MEM-006 | Acervo Digital Familiar | Top 30 |

#### Continuidade

| Código de produto | Produto | Classificação |
|---|---|---|
| CA-ASS-001 | Plano Essência | Top 30 |
| CA-ASS-002 | Plano Memórias | Top 10 |
| CA-ASS-003 | Plano Legado | Top 30 |
| CA-ASS-004 | Plano Anual Memórias | Top 30 |
| CA-ASS-005 | Assinatura Pós-Reconhecimento | Top 30 |

### 8.3 Mapeamento de legado

Os SKUs antigos não devem ser apagados. Devem ser ligados ao produto-pai correspondente por uma tabela `legacy_sku_mappings`.

A criação de um novo SKU comercial, link Asaas ou preço só ocorre após:

1. escopo aprovado;
2. preço comercial homologado;
3. condição de cobrança definida;
4. responsável comercial definido;
5. validação humana;
6. ação externa especificamente aprovada.

---

## 9. Produtos contratados por caso

A ausência de uma nacionalidade no Top 30 não é falha: nacionalidade é uma trilha técnica, não um SKU de prateleira.

A relação correta é:

```text
Produto-pai comercial
+ trilha por nacionalidade/via
+ composição familiar
+ escopo e condição aprovados
= serviço contratado do caso
```

### 9.1 `case_services`

Campos mínimos:

- id;
- case_id;
- product_catalog_id;
- citizenship_track_id;
- escopo_aprovado;
- condição_comercial_aprovada;
- preço_acordado;
- exceção_comercial_id, se houver;
- status: `draft`, `approved`, `contracted`, `active`, `completed`, `cancelled`;
- contrato_referencia;
- responsável;
- created_at;
- updated_at.

### 9.2 Produto da Ana Luiza

**Não criar um SKU de prateleira "Áustria familiar" automaticamente.**

A Ana usa um `case_service` composto:

| Campo | Definição |
|---|---|
| Produto-pai | CA-DIAG-002 — Diagnóstico Familiar Multipaís, para a fase contratada de análise/estruturação; ou CA-PROT-003 apenas se o escopo assinado incluir acompanhamento familiar de processo |
| Trilha técnica | Áustria — §58c StbG |
| Núcleo | Ana Luiza, Adair, Alice e Felipe como dependente vinculado |
| Escopo | Dossiê-base compartilhado, análise de enquadramento, declarações individuais, relatório e acompanhamento coordenado, conforme instrumento aprovado |
| Estado | `formalization_in_preparation` / `NO_GO` |
| Preço | R$ 9.600 apenas como condição particular de proposta aceita, não como preço de catálogo, até contrato/OS e reconciliação |
| Cobrança | Bloqueada até contrato, OS, dados e condição reconciliados |

O produto é uma composição de caso, não um SKU nacional genérico. Caso esse pacote se repita e seja homologado comercialmente, poderá nascer depois um produto-pai familiar específico, com nome, escopo e preço revisados.

### 9.3 Produto do João

| Campo | Definição |
|---|---|
| Produto-pai | CA-DIAG-001 — Diagnóstico de Cidadania por Etapas |
| Trilha técnica | Portugal — via a confirmar |
| Condição conversada | R$ 1.290; Pix via Asaas previsto para 03/09/2026, pendente de formalização |
| Estado atual | Aceite verbal; confirmação formal pendente |
| Próxima ação | Solicitar confirmação escrita do aceite |
| Regra | Não criar cobrança, contrato ou onboarding antes de confirmação formal, dados, instrumento e confirmação específica |

### 9.4 Naturalização brasileira

A naturalização brasileira não precisa virar um SKU por nacionalidade no MVP.

| Campo | Definição |
|---|---|
| Produto-pai inicial | CA-DIAG-001 — Diagnóstico de Cidadania por Etapas |
| Trilha técnica | Brasil — Naturalização/residência |
| Caso de origem | Amigo do Danilo; indicação |
| Estado inicial | Lead em triagem / via em confirmação |
| Próxima ação | Call ou checklist inicial, com responsável e data |
| Produto seguinte | CA-PROT-001 apenas após diagnóstico, escopo, elegibilidade preliminar e revisão humana aplicável |

---

## 10. Onboarding padrão e ciclo do cliente

### 10.1 Gates de onboarding

```text
Contrato assinado
+ pagamento inicial confirmado
+ responsável definido
+ núcleo familiar definido quando aplicável
+ dossiê-mãe vinculado
+ plano inicial e checklist criados
= onboarding iniciado
```

Magic Link não é gatilho de onboarding. É consequência de onboarding aprovado e conteúdo cliente disponível.

### 10.2 Fases

1. Aceite e formalização
2. Onboarding
3. Pesquisa inicial
4. Pesquisa e validação
5. Preparação documental
6. Protocolo e acompanhamento
7. Reconhecimento
8. Pós-reconhecimento

### 10.3 Cadência MVP

| Momento | Ação interna | Entrega/ação ao cliente, se aprovada |
|---|---|---|
| D0 | Criar checklist e responsável | Boas-vindas preparada para aprovação |
| D1–D3 | Revisar plano inicial | Guia, responsável e próximos passos |
| Até D7 | Registrar primeiro valor verificável | Plano, checklist, confirmação de documento ou achado aprovado |
| D10 | Alerta interno de ausência de touchpoint | Revisar atualização contextualizada |
| D14 | Alerta crítico | Preparar comunicação contextualizada |
| D30 | Tarefa de check-in humano | NPS somente se aprovado |

---

## 11. Micro-entregas e App Cliente

### 11.1 `client_deliverables`

Campos:

- id;
- case_id;
- family_id;
- recipient_contact_id;
- deliverable_type;
- journey_phase;
- title_client;
- summary_approved;
- approval_status: `draft`, `in_review`, `approved`, `published`, `archived`;
- priority;
- deep_link;
- notification_channel: `none`, `app`, `whatsapp`, `email`;
- available_at;
- viewed_at;
- whatsapp_fallback_sent_at;
- internal_reference;
- responsible_user_id;
- created_at;
- updated_at.

### 11.2 Tipos MVP

- Boas-vindas;
- plano de ação;
- checklist documental;
- confirmação de documento recebido;
- documento localizado;
- documento validado;
- pendência contextualizada;
- atualização sem ação necessária;
- árvore inicial;
- relatório parcial;
- próximo passo personalizado.

### 11.3 Visibilidade

Somente entregas `published` chegam ao App Cliente. Nunca publicar automaticamente documento cru, evidência, fonte, hipótese jurídica, score, gravação, transcrição, URL interna, preço técnico ou dado de terceiro.

---

## 12. Caso-piloto Ana Luiza

### 12.1 Identificação

| Campo | Valor |
|---|---|
| Case ID canônico | CA-CID-AT-FAM-2026-001 |
| Alias histórico | CA-AUT-ANALUIZA-FAM-2026-001 |
| Responsável | Tatiana Tosi |
| Trilha | Áustria — §58c StbG |
| Aceite formal | Confirmado em 14/08/2026 |
| Estado | Formalização em preparação |
| Go-live | NO_GO |

### 12.2 Participantes

- Ana Luiza Gomes Silveira Rodrigues — contratante e titular.
- Adair Pinto Silveira Júnior — pai e participante.
- Alice Gomes Silveira — irmã e participante; dados ainda pendentes de confirmação final.
- Felipe Silveira Rodrigues — dependente menor vinculado à Ana; representação legal pendente.
- Adriel Felipe — fora do escopo deste caso; processo separado de naturalização por casamento.

### 12.3 Bloqueios ativos

1. CPF, RG, profissão, estado civil e endereço da contratante pendentes.
2. Dados oficiais da contratada ainda não confirmados contra fonte societária vigente.
3. Contrato específico pendente.
4. Anexo I/OS e critérios de aceite pendentes.
5. Revisão jurídica aplicável pendente.
6. Método de assinatura pendente.
7. Dados completos da Alice pendentes.
8. Representação legal do Felipe pendente.
9. Produto/escopo/condição familiar precisam ser formalizados no `case_service`.
10. Asaas bloqueado até conclusão dos gates anteriores.

### 12.4 Regra de implementação

A Ana deve ser carregada inicialmente apenas como caso interno bloqueado, sem criar cobrança, contrato, pesquisa externa, comunicação automática ou acesso ativo de cliente.

---

## 13. Fluxo João

| Estado | Evidência | Próxima ação |
|---|---|---|
| Aceite verbal | Registro de conversa/call | Solicitar confirmação escrita |
| Confirmação formal | WhatsApp, e-mail ou print registrado | Preparar formalização |
| Formalização | Cadastro e escopo definidos | Preparar contrato e OS |
| Contrato assinado | Instrumento assinado | Preparar cobrança aprovada |
| Pagamento confirmado | Evento Asaas | Iniciar onboarding |
| Onboarding iniciado | Núcleo/dossiê/plano/checklist | Planejar primeira entrega |

Mensagem-base para confirmação formal:

> João, fico feliz que tenha decidido avançar no processo de cidadania portuguesa por etapas, começando pelo Diagnóstico no valor de R$ 1.290. Para formalizarmos o próximo passo, poderia confirmar por escrito, por aqui mesmo, que está de acordo com o início do Diagnóstico nas condições que conversamos? Assim que receber sua confirmação, organizo a preparação do contrato e as orientações para o pagamento via Pix pelo Asaas, previsto para 03 de setembro. Depois da formalização e da confirmação do pagamento, seguimos com onboarding, checklist inicial e plano de trabalho.

---

## 14. Naturalização brasileira

O percurso de naturalização brasileira deve ser suportado pela trilha técnica `Brasil — Naturalização/residência`, sem criar produto por país no catálogo inicial.

### Regras

- Entrada por Diagnóstico de Cidadania por Etapas.
- Via jurídica preliminar: naturalização/residência.
- Status da via: em confirmação.
- Não fazer afirmação de elegibilidade, prazo ou resultado.
- Não criar caso ativo ou pesquisa externa sem autorização e gates aplicáveis.
- Próxima ação sempre datada: call de triagem ou envio de checklist.

---

## 15. Higiene de dados e fim dos fictícios

### 15.1 Objetivo

Eliminar a mistura entre dados de demonstração, exemplos de tela e dados reais de clientes no Lovable/Desk.

### 15.2 Classificação obrigatória

Todo registro deve ter `data_origin`:

- `production_real`
- `migration_legacy`
- `development_fixture`
- `sandbox`
- `unknown_needs_review`

### 15.3 Regras

1. Dados fictícios não podem aparecer em produção, métricas, filas operacionais, App Cliente ou pesquisa.
2. Fixtures devem usar nomes claramente fictícios, sem telefone, e-mail ou documento real.
3. Dados reais de Ana e João só entram após validação de campos mínimos e conforme controles de acesso.
4. Registros existentes sem origem devem ser classificados como `unknown_needs_review` e aparecer em fila de saneamento.
5. A limpeza deve gerar relatório com: registros preservados, migrados, arquivados, removidos e exceções.
6. Exclusões em ambiente produtivo requerem backup, lista de IDs e confirmação específica.

---

## 16. MVP, backlog e ordem de implementação

### MVP

1. Artefato de decisões canônicas no repositório.
2. Migration concentrada com entidades mínimas.
3. Estrutura interna de contatos, oportunidades e conversas.
4. Painel de Calls e Discovery.
5. Eventos imutáveis de conversão.
6. Famílias, casos e planejador nativo.
7. Catálogo Top 30 e trilhas técnicas.
8. `case_services` para composições como Ana, João e naturalização brasileira.
9. Fila de comunicação humana.
10. Importador Placego CSV de contatos.
11. Classificação e saneamento de dados fictícios.
12. Caso Ana bloqueado como piloto interno.

### Backlog posterior

- Integração API contínua Placego.
- Integração Asaas de criação/atualização.
- Automação WhatsApp.
- Webhooks de micro-entregas.
- Deep links e fallback automático.
- Dashboard avançado de investimento, CAC, ROI e atribuição.
- NPS automatizado.
- Gamificação.
- Recomendação automatizada de produto.
- Simulador jurídico automatizado.

---

## 17. Critérios de aceite

A implementação será aceita quando:

1. Planilhas legadas não receberem dados novos por fluxos do Desk.
2. O sistema importar contatos Placego via CSV com rastreabilidade e deduplicação.
3. Uma conversa de WhatsApp/call/reunião puder ser registrada de modo imutável.
4. Discovery puder registrar campos estruturados e próxima ação obrigatória.
5. Aceite verbal e confirmação formal forem eventos separados.
6. Contrato, pagamento, onboarding e caso ativo forem estados separados com gates.
7. O Planejador gerar checklist e próximos passos sem decisão jurídica automática.
8. A Ana existir como caso piloto bloqueado, com ID canônico e bloqueios reais visíveis.
9. João puder seguir fluxo verbal → formal → contrato → pagamento → onboarding.
10. Naturalização brasileira estiver disponível como trilha, não SKU específico de país.
11. O catálogo Top 30 estiver separado de trilhas técnicas.
12. Dados fictícios estiverem classificados e não aparecerem em produção operacional.
13. Comunicação ficar em fila humana, sem envio automático.
14. App Cliente só puder visualizar entregas publicadas e sanitizadas.

---

## 18. Anti-padrões proibidos

- Usar planilhas como ponte obrigatória para dados novos.
- Criar SKU para cada país ou via jurídica.
- Criar SKU automático para caso específico antes de repetição e homologação comercial.
- Usar um único status para substituir eventos de funil.
- Tratar aceite verbal como contrato, pagamento ou cliente ativo.
- Iniciar onboarding por Magic Link sem contrato e pagamento.
- Calcular ou prometer prazo jurídico/institucional automaticamente.
- Publicar score de elegibilidade, hipóteses ou risco jurídico ao cliente.
- Notificar cliente automaticamente sem conteúdo aprovado.
- Criar cobranças/links Asaas por sugestão de Planejador.
- Misturar dados reais e fictícios no ambiente produtivo.
- Apagar legado sem migração, rastreabilidade e confirmação.

---

## Controle de versão

| Versão | Data | Decisão |
|---|---|---|
| 1.0 | 19/08/2026 | Consolidação inicial das decisões de CRM, legado, Placego, Top 30, Planejador, Ana, João, naturalização brasileira e higiene de dados |
