# Prompt de Implementação — Motores Unificados, CRM Vivo, Onboarding Único, Cadências e Indicadores Reais

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio + Vercel + GitHub  
**Pré-requisito:** acesso da proprietária restaurado e CRUD básico funcional no Supabase próprio  
**Objetivo:** substituir abas isoladas, listas estáticas, cenários desconectados e cards sem efeito por uma operação unificada, com dados persistidos, eventos reais, próxima ação, cadência e indicadores calculados.

---

## 0. Regra de entrada

Não implementar esta tarefa se a proprietária ainda não conseguir:

```text
Entrar no Desk
→ criar cliente
→ criar caso
→ salvar atualização
→ criar proposta em rascunho
→ criar contrato em rascunho
→ registrar pagamento manual
→ recarregar e ver os dados persistidos
```

Se esse núcleo falhar, corrigir o acesso e o CRUD antes. Não criar mais listas, cards, cenários, telas, dashboards ou automações simuladas.

---

## 1. Problema a resolver

Hoje, os conteúdos e fluxos estão espalhados em grupos/abas diferentes: CRM, Marketing, Onboarding, Planejador, Pesquisa, Documentos, Propostas, Contratos, Financeiro, App Cliente e Cadências. Cada área pode exibir listas ou cenários, mas isso não significa que uma ação em uma área atualize outra.

O produto precisa operar como uma única cadeia:

```text
Entrada de lead
→ Cliente
→ Caso
→ Discovery
→ Diagnóstico
→ Proposta
→ Aceite
→ Contrato
→ Financeiro
→ Onboarding único
→ Jornada/Planejador
→ Pesquisa e documentos
→ Micro-entregas
→ Atualizações e cadências
→ Protocolo
→ Pós-reconhecimento e legado
→ Retenção e indicação
```

A fonte de verdade é o **caso**. Cada módulo deve ler e gravar no mesmo contexto de cliente/caso, sem exigir que a proprietária lembre qual aba ou cenário usar.

---

## 2. Resultado obrigatório

Criar um sistema em que, ao abrir um caso, a proprietária veja uma única ficha operacional: **Caso 360**.

```text
CLIENTE
CASO
FASE ATUAL
PRÓXIMA AÇÃO
RESPONSÁVEL
STATUS COMERCIAL
PROPOSTA
CONTRATO
FINANCEIRO
ONBOARDING
CADÊNCIA ATIVA
DOCUMENTOS
PESQUISA
MICRO-ENTREGAS
MILESTONES
ÚLTIMA ATUALIZAÇÃO
VISÃO DO CLIENTE
```

A proprietária não deve depender de memória, de lista externa ou de múltiplas abas para saber o que fazer a seguir.

---

## 3. Princípios obrigatórios

### 3.1 Dados reais, não listas

Não considerar uma função pronta se existir apenas:

```text
Lista estática
Card visual
Mock
Array local
JSON hardcoded
localStorage
Botão sem INSERT/UPDATE
Status sem dado de banco
Dashboard com número fictício
Rota sem persistência
```

Só considerar pronta se:

```text
Ação do usuário
→ grava no Supabase
→ aparece no Caso 360
→ atualiza módulo relacionado
→ persiste após refresh
→ gera próxima ação/evento quando aplicável
```

### 3.2 Um onboarding, parametrizado

Não criar uma aba ou cenário isolado por produto, país ou caso.

Criar **um único motor de onboarding**, com templates configuráveis por:

```text
service_type / SKU
country_code
route
case_type
family_scope
current_phase
```

O motor deve carregar o template correto quando houver contexto, mas todos os clientes devem ser acompanhados no mesmo local: **Caso 360 → Onboarding**.

### 3.3 Uma cadência, orientada por evento

Não criar sequências soltas de D+0/D+1/D+15 como se fossem o sistema inteiro.

Cadência deve funcionar assim:

```text
Evento real
→ regras aplicáveis ao caso
→ cria tarefas/rascunhos/marcos persistidos
→ aparece em Hoje e Caso 360
→ é concluída, pausada ou reprogramada
→ próximo passo é recalculado
```

### 3.4 Uma próxima ação

Todo caso ativo precisa ter exatamente uma **próxima ação prioritária** calculada ou definida manualmente.

Ordem de prioridade:

```text
1. Pendência bloqueante vencida ou sem responsável
2. Tarefa vencida
3. Tarefa com vencimento hoje
4. Documento solicitado ao cliente
5. Proposta/contrato aguardando resposta
6. Pagamento pendente/vencido
7. Milestone planejado mais próximo
8. Próxima ação manual definida pela proprietária
9. “Definir próximo passo” se não houver dados suficientes
```

A próxima ação deve aparecer em:

```text
Painel Hoje
Caso 360
Lista de Casos
Visão de Cliente quando apropriado
```

---

## 4. Núcleo de entidades

Usar tabelas existentes quando compatíveis. Criar migration apenas se não houver entidade equivalente. Não criar duplicatas com nomes diferentes.

### Entidades centrais

```text
leads
clients
citizenship_cases / cases
case_updates
tasks
proposals
proposal_items
contracts
financial_plans
receivables
financial_transactions
products
product_skus
case_products
onboarding_templates
onboarding_runs
onboarding_steps
onboarding_actions
cadence_templates
cadence_runs
cadence_actions
communication_templates
communication_actions
case_requirements
documents
research_people
research_relationships
research_sources
research_document_requests
research_documents
research_evidence
research_hypotheses
micro_deliveries
case_milestones
case_phase_history
case_alerts
content_calendar_items
marketing_sources
marketing_campaigns
lead_activities
```

### Campos mínimos compartilhados

```text
id
organization_id
client_id quando houver cliente
case_id quando houver caso
status
created_at
updated_at
created_by / assigned_to quando aplicável
```

Todas as relações precisam usar o mesmo `case_id` para permitir que o Caso 360 consolide informações reais.

---

## 5. CRM Vivo

### Objetivo

O CRM precisa aceitar leads de qualquer origem externa e transformar interesse em cliente/caso sem perder o contexto de atendimento.

```text
WhatsApp / indicação / LinkedIn / Instagram / site / e-mail / parceiro / evento
→ Lead
→ Atividade e próximo contato
→ Qualificação
→ Discovery
→ Proposta
→ Cliente e Caso
```

### Funções obrigatórias

#### Lead

Campos mínimos:

```text
nome
telefone ou e-mail opcional
origem
interesse/objetivo
país opcional
responsável
estágio
próximo contato
observação
```

Estágios canônicos:

```text
new
contacted
qualified
discovery_scheduled
discovery_completed
proposal_sent
negotiation
won
lost
nurture
```

#### Conversão

Ao converter um lead:

```text
lead
→ client
→ case
→ cria case_update de origem
→ preserva atividades do lead
→ cria próxima ação
```

Não exigir contrato, pagamento, SKU, país, rota ou checklist para converter lead em cliente/caso.

### Discovery como roteiro vivo

Criar uma visão dentro do caso:

```text
Caso 360 → Discovery
```

Campos/ações:

```text
Objetivo do cliente
Origem do lead
País(es) de interesse
Linha familiar conhecida
Ascendente(s) citados
Documentos já existentes
Dúvidas e riscos iniciais
Resumo da reunião
Gravação/transcrição/link opcional
Próximo passo da discovery
Data de retorno
```

Ao salvar a Discovery:

```text
criar case_update
criar/atualizar avaliação diagnóstica
criar pendências iniciais
criar próxima ação
criar tarefa de proposta/devolutiva se aplicável
```

---

## 6. Caso 360: única mesa de trabalho

### Rota

```text
/casos/:caseId
```

### Cabeçalho obrigatório

```text
Cliente
Código/nome do caso
País / rota / objetivo
Fase atual
Status do caso
Responsável
Próxima ação
Prazo da próxima ação
Botão: Registrar atualização
Botão: Criar tarefa
Botão: Mover fase
Botão: Abrir visão do cliente
```

### Resumo operacional acima da dobra

| Bloco | Informação real exigida | Ação |
|---|---|---|
| Comercial | Lead/origem, proposta, status de aceite | Abrir/criar proposta |
| Contrato | Status, versão e arquivo quando existir | Criar/abrir contrato |
| Financeiro | Total, recebido, saldo, próxima parcela | Abrir/registrar pagamento |
| Onboarding | Template, andamento, próxima etapa | Iniciar/pausar/continuar |
| Documentos | Pendências críticas, recebidos, validados | Adicionar documento |
| Pesquisa | Pessoas, fontes, achados e hipóteses | Abrir pesquisa |
| Planejador | Fase, milestone, previsão e próximo passo | Ver jornada |
| Comunicação | Última mensagem, próxima cadência, rascunho | Criar mensagem |

### Abas/Seções obrigatórias

```text
Visão geral
Discovery e diagnóstico
Jornada e Planejador
Onboarding e cadências
Documentos
Pesquisa
Propostas
Contratos
Financeiro
Atualizações e comunicação
Produtos/SKUs
Visão do cliente
```

As abas não podem ser bases independentes. Todas devem consultar e gravar registros vinculados ao mesmo `case_id`.

---

## 7. Onboarding unificado

### Objetivo

Criar uma jornada operacional única que se adapta ao serviço, mas não força a proprietária a procurar “uma aba por cenário”.

### Templates de entrada

```text
DIAG_CIDADANIA
PESQUISA_GENEALOGICA
CERTIDAO_AVULSA
COMBO_CERTIDOES
MONTAGEM_PASTA
ASSESSORIA_COMPLETA
PROTOCOLO_CONSULAR
PROTOCOLO_JUDICIAL
POS_RECONHECIMENTO
REGISTRO_FAMILIAR
ASSINATURA_ESSENCIA
ASSINATURA_MEMORIAS
ASSINATURA_LEGADO
```

### Estrutura única do onboarding

```text
1. Entrada e boas-vindas
2. Dados e documentos iniciais
3. Primeira entrega / leitura inicial
4. Pendências do cliente
5. Execução interna
6. Atualização recorrente
7. Preparação de etapa seguinte
8. Conclusão do escopo
9. Continuidade / pós-venda / legado
```

Cada template ativa somente as etapas necessárias e pode alterar tarefas, requisitos, micro-entregas e mensagens. Mas a interface será sempre uma única timeline no Caso 360.

### Tabelas mínimas

```sql
create table onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  name text not null,
  service_type text,
  country_code text,
  route text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table onboarding_template_steps (
  id uuid primary key default gen_random_uuid(),
  onboarding_template_id uuid not null references onboarding_templates(id) on delete cascade,
  step_order integer not null,
  phase text,
  title text not null,
  description text,
  action_type text not null,
  default_offset_days integer,
  creates_requirement boolean not null default false,
  creates_task boolean not null default true,
  creates_micro_delivery boolean not null default false,
  created_at timestamptz not null default now(),
  unique (onboarding_template_id, step_order)
);

create table onboarding_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  onboarding_template_id uuid not null references onboarding_templates(id),
  status text not null default 'active',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table onboarding_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  onboarding_run_id uuid not null references onboarding_runs(id) on delete cascade,
  case_id uuid not null,
  template_step_id uuid references onboarding_template_steps(id),
  title text not null,
  status text not null default 'pending',
  due_date date,
  task_id uuid,
  requirement_id uuid,
  micro_delivery_id uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Função obrigatória

```text
iniciarOnboarding(caseId, templateCode | templateId)
```

Deve:

1. Encontrar o template adequado por `service_type`, `country_code`, `route` ou escolha manual.
2. Criar um `onboarding_run`.
3. Criar ações/tarefas/requisitos reais.
4. Atualizar `case.next_action` ou permitir cálculo automático.
5. Exibir tudo no Caso 360 e no Painel Hoje.

---

## 8. Cadências unificadas

### Objetivo

Cadências não são listas de mensagens; são reações a eventos reais que criam uma próxima ação e podem ser pausadas, concluídas ou reprogramadas.

### Eventos iniciais

```text
lead_created
lead_qualified
discovery_completed
diagnostic_completed
proposal_created
proposal_sent
proposal_accepted
proposal_declined
contract_created
contract_sent
contract_signed
payment_registered
payment_overdue
onboarding_started
document_requested
document_received
document_validated
document_requires_action
research_finding_created
case_phase_changed
milestone_completed
filing_completed
recognition_confirmed
subscription_started
subscription_renewal_due
```

### Cadências iniciais obrigatórias

| Código | Evento | Resultado esperado |
|---|---|---|
| `CAD-LEAD-PRIMEIRO-CONTATO` | `lead_created` | Tarefa de primeiro contato e rascunho de mensagem |
| `CAD-DISCOVERY-DEVOLUTIVA` | `discovery_completed` | Tarefa de organizar devolutiva/proposta |
| `CAD-PROPOSTA-FOLLOW-UP` | `proposal_sent` | Follow-ups até aceite, recusa ou pausa |
| `CAD-CONTRATO-ASSINATURA` | `contract_sent` | Lembrete até assinatura/cancelamento |
| `CAD-ONBOARDING` | `onboarding_started` | Tarefas de coleta, primeira entrega e acompanhamento |
| `CAD-DOCUMENTO-PENDENTE` | `document_requested` | Solicitação, lembrete e tarefa interna |
| `CAD-ATUALIZACAO-CASO` | caso ativo sem atualização | Tarefa de atualização periódica |
| `CAD-PAGAMENTO-ATRASO` | `payment_overdue` | Tarefa financeira e rascunho de contato |
| `CAD-POS-RECONHECIMENTO` | `recognition_confirmed` | Próximos passos de AIRE, passaporte e família |
| `CAD-RENOVACAO-LEGADO` | `subscription_renewal_due` | Tarefa de retenção e continuidade |

### Regras de parada

```text
Cliente respondeu → encerrar lembrete equivalente.
Documento recebido → encerrar solicitação daquele documento.
Proposta aceita/recusada/pausada → encerrar follow-up da proposta.
Contrato assinado/cancelado → encerrar lembretes de assinatura.
Pagamento registrado → encerrar cobrança correspondente.
Caso pausado/concluído → pausar cadências operacionais não essenciais.
```

---

## 9. Micro-entregas e atualizações reais

### Definição

Micro-entrega é uma unidade percebida de valor. Não é um card vazio nem uma tarefa interna.

Exemplos:

```text
Radar concluído
Resumo de elegibilidade
Plano de ação
Linha ancestral inicial
Checklist documental qualificado
Certidão localizada
Documento validado
Diagnóstico de divergência
Pasta pronta para revisão
Contrato gerado
Protocolo realizado
Linha do tempo familiar liberada
Relatório de pesquisa liberado
```

### Tabela mínima

```sql
create table micro_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  code text not null,
  title text not null,
  description text,
  status text not null default 'planned',
  delivered_at timestamptz,
  visible_to_client boolean not null default false,
  related_product_sku_id uuid,
  source_type text,
  source_id uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Regras

- A proprietária pode criar micro-entrega manualmente.
- Documento validado, achado de pesquisa, proposta, contrato e milestone podem gerar micro-entrega por regra configurada.
- Micro-entrega visível ao cliente cria atualização no portal/app quando liberada.
- Toda micro-entrega deve ser vinculada a `case_id`.

---

## 10. Planejador de cidadania integrado

O Planejador não pode ser uma aba de cenários isolada. Ele deve ler casos, documentos, tarefas, micro-entregas, contratos e financeiro reais.

### Fases canônicas

```text
discovery
diagnosis
research
legal_preparation
filing
post_recognition
```

### O Planejador deve mostrar

```text
Fase atual
Próxima ação
Pendências críticas
Tarefas abertas
Documentos por status
Milestones concluídos e futuros
Micro-entregas
Estimativa em faixa
Responsável
Produtos/escopo ativo
Contrato e financeiro resumidos
```

### O Planejador deve atualizar

```text
case.current_phase
case.next_action
case.next_action_due_date
case_milestones
case_requirements
tasks
case_updates
micro_deliveries
```

### Regras

- Owner/admin pode avançar, recuar ou pular fase manualmente.
- Checklist e estimativa orientam; nunca bloqueiam salvamento ou operação.
- Previsão é faixa e premissa, não promessa de resultado.
- Alteração de fase deve criar `case_phase_history`, mas não depender de auditoria/gate para acontecer.

---

## 11. Pesquisa documental e genealógica integrada

Pesquisa não pode ser uma área de formulários isolados. Cada pessoa, fonte, pedido, documento, evidência e hipótese deve ser visível dentro do Caso 360 e alimentar Planejador, documentos e atualizações do cliente.

### Fluxo

```text
Caso
→ pessoa
→ relação
→ evento
→ fonte
→ pedido documental
→ documento
→ evidência
→ hipótese
→ pendência/tarefa
→ micro-entrega/atualização
```

### Integrações internas obrigatórias

| Evento de pesquisa | Atualização necessária |
|---|---|
| Novo pedido documental | Criar requisito e tarefa no caso |
| Documento recebido | Atualizar requisito e criar tarefa de revisão |
| Documento validado | Atualizar checklist/progresso e criar micro-entrega quando aplicável |
| Documento precisa tradução/apostila/retificação | Criar pendência e tarefa correspondente |
| Achado histórico relevante | Permitir criar micro-entrega e atualização liberável ao cliente |
| Hipótese confirmada/refutada | Atualizar leitura do caso/Planejador quando relevante |

---

## 12. Propostas, contratos e financeiro integrados

### Fluxo único

```text
Caso
→ proposta
→ aceite escrito
→ contrato
→ plano financeiro
→ parcelas/pagamentos
→ onboarding
→ execução
```

### Regras obrigatórias

- Proposta pode ser salva em rascunho sem SKU, pagamento, link Asaas ou contrato.
- Contrato pode ser criado em rascunho a partir de proposta ou diretamente de caso.
- Financeiro manual deve funcionar antes de integração Asaas.
- Aceite escrito deve ser um evento/atualização, não uma trava invisível.
- Pagamento confirmado deve criar/atualizar próximo passo e permitir iniciar onboarding.
- Nenhum desses passos pode depender de Modo Proprietária, auditoria, reconfirmação ou gate institucional.

### Cards no Caso 360

```text
Proposta: rascunho / enviada / aceita / recusada
Contrato: rascunho / enviado / assinado / ativo
Financeiro: contratado / recebido / saldo / próxima parcela
Onboarding: não iniciado / ativo / pausado / concluído
```

---

## 13. Indicadores reais

### Regra

Indicador só pode aparecer se houver dado persistido que permita calculá-lo. Se não houver base, exibir **“Sem dados suficientes”**. Não inventar valores, porcentagens, metas, receitas ou conversões.

### Painel Hoje

| Indicador | Fonte real |
|---|---|
| Tarefas vencidas | `tasks` com vencimento anterior e status aberto |
| Tarefas de hoje | `tasks` com vencimento hoje |
| Casos sem próxima ação | `cases` ativos com `next_action` vazio |
| Documentos críticos pendentes | `case_requirements` pendentes e bloqueantes |
| Propostas aguardando resposta | `proposals` em `sent` sem aceite/recusa |
| Contratos aguardando assinatura | `contracts` em `sent` |
| Recebíveis vencidos | `receivables` em atraso |
| Cadências em atraso | `cadence_actions` agendadas e não concluídas |

### Dashboard comercial

| Indicador | Fórmula / fonte |
|---|---|
| Leads por origem | `leads` agrupados por `source_id` |
| Conversão lead → proposta | propostas / leads qualificados |
| Conversão proposta → aceite | propostas aceitas / propostas enviadas |
| Conversão aceite → contrato | contratos ativos / propostas aceitas |
| Receita contratada | soma de propostas/contratos aceitos |
| Receita recebida | soma de transações de pagamento |
| Saldo aberto | recebíveis − pagamentos |
| Ticket médio | receita contratada / clientes ou casos contratados |
| Produtos/SKUs vendidos | `case_products` e itens de proposta/contrato |
| Origem atribuída | lead/origem preservada até cliente/caso/receita |

### Dashboard operacional

| Indicador | Fórmula / fonte |
|---|---|
| Casos por fase | `cases.current_phase` |
| Casos bloqueados | status/pedência crítica real |
| Tempo até primeira micro-entrega | primeira micro-entrega − início/contratação |
| SLA de análise documental | documento recebido → documento revisado |
| SLA de pedido documental | pedido criado → recebido/localizado |
| Progresso de requisitos | concluídos / requisitos relevantes |
| Casos sem atualização | data atual − última `case_update` |
| Cadências concluídas | ações concluídas / ações programadas |

### Dashboard de comunicação/marketing

| Indicador | Fonte |
|---|---|
| Mensagens enviadas | `communication_actions` status enviado |
| Respostas | ações com `replied_at` |
| Tempo de resposta | `replied_at − sent_at` |
| Origem de leads | marketing source/campaign |
| Conteúdo publicado | `content_calendar_items` status publicado |
| Cliques/CTAs | eventos reais quando instrumentados |
| Diagnósticos originados | leads/clientes com origem de campanha/newsletter |

---

## 14. Painel Hoje: deixar de ser lista estática

O Painel Hoje deve ser uma leitura consolidada e acionável de tudo que exige sua atenção.

### Blocos obrigatórios

```text
Sua próxima ação principal
Tarefas vencidas
Tarefas de hoje
Propostas aguardando resposta
Contratos aguardando assinatura
Pagamentos pendentes/vencidos
Documentos críticos
Casos sem atualização
Cadências prontas para revisar/enviar
Micro-entregas prontas para liberar
```

Cada item deve ter:

```text
Cliente
Caso
Motivo
Prazo
Responsável
Ação direta
```

Ação direta deve abrir o contexto correto no Caso 360, não uma nova lista desconectada.

---

## 15. App cliente e visão de cliente

O portal não pode ser uma experiência isolada. Ele consome dados liberados do mesmo caso:

```text
Fase/jornada
Próximo passo
Documentos solicitados e liberados
Atualizações liberadas
Micro-entregas/descobertas
Proposta/contrato quando liberados
Informações financeiras quando liberadas
Ajuda/contato
```

Owner/admin deve poder abrir a visão do cliente pelo Caso 360 sem logout, sem trocar de conta e sem se tornar cliente.

---

## 16. Ordem de implementação

Não fazer tudo por lista sem integração. Implementar e demonstrar cada bloco funcionando antes do próximo.

```text
1. Acesso da proprietária + CRUD básico estável
2. Caso 360 com dados existentes de cliente/caso/tarefa/atualização
3. CRM vivo: lead → cliente → caso → discovery
4. Proposta → contrato → financeiro manual
5. Onboarding unificado por template
6. Cadências por evento e Painel Hoje
7. Planejador integrado ao caso
8. Pesquisa/documentos integrados
9. Micro-entregas + atualizações de cliente
10. Indicadores reais: comercial, operacional e comunicação
11. Portal/app cliente + preview administrativo
12. Integrações externas: Asaas, e-mail, WhatsApp, calendário, fontes genealógicas
```

---

## 17. Critérios de aceite ponta a ponta

Executar com dados reais de teste no Supabase próprio.

### Fluxo comercial e operacional

1. Criar lead vindo de WhatsApp, LinkedIn, indicação ou entrada manual.
2. Registrar origem, interesse, responsável e próxima ação.
3. Registrar uma discovery no lead/caso.
4. Converter em cliente e criar caso.
5. Abrir Caso 360 e confirmar que mostra dados reais.
6. Criar proposta em rascunho e enviar/marcar enviada.
7. Registrar aceite escrito.
8. Criar contrato em rascunho a partir da proposta.
9. Criar plano financeiro, entrada e parcelas.
10. Registrar pagamento manual.
11. Iniciar onboarding por template adequado.
12. Confirmar que onboarding cria tarefas/requisitos reais.
13. Confirmar que a próxima ação aparece no Painel Hoje.
14. Criar pessoa/fonte/pedido documental no caso.
15. Receber/validar documento e confirmar atualização de requisito/micro-entrega.
16. Mover fase do Planejador e confirmar timeline/histórico.
17. Criar atualização liberada ao cliente.
18. Abrir visão de cliente como owner/admin sem logout.
19. Confirmar que a visão mostra somente dados liberados.
20. Recarregar todas as telas e confirmar persistência.

### Resultado aceito somente se

```text
Cada ação executa INSERT/UPDATE real no Supabase.
Cada registro aparece no Caso 360.
Cada próximo passo/tarefa aparece no Painel Hoje quando aplicável.
Nenhum módulo depende de lista local, mock ou estado de demonstração.
Nenhuma etapa exige Modo Proprietária, reconfirmação, auditoria ou gate.
Nenhuma falha de integração externa impede o fluxo interno.
```

---

## 18. Proibições

Não fazer nesta implementação:

- Não criar uma aba nova por cenário, país, produto ou caso.
- Não duplicar tabelas que já têm equivalentes no banco.
- Não criar listas decorativas, mocks, dados fictícios ou dashboards sem cálculo real.
- Não criar novos gates, modo proprietária, reconfirmação, auditoria bloqueante, aprovação em lote ou override.
- Não bloquear rascunho por checklist, fase, pagamento, contrato, SKU, link Asaas ou integração externa.
- Não apagar dados, tabelas, documentos, contratos, pagamentos ou clientes.
- Não executar migrations destrutivas.
- Não publicar integração de WhatsApp, e-mail, Asaas ou redes sociais sem ação explícita e configuração validada.
- Não declarar motor pronto por ter rota, componente, mock, teste unitário ou lista de requisitos.

---

## 19. Entrega esperada

1. Branch: `feat/motores-unificados-crm-vivo`.
2. Migrations não destrutivas apenas quando inevitáveis.
3. Caso 360 real e funcional como centro do sistema.
4. Onboarding único parametrizado por template/contexto.
5. Cadências baseadas em eventos reais e tarefas persistidas.
6. Painel Hoje com dados reais e ações diretas.
7. Indicadores calculados somente com dados persistidos.
8. Preview Vercel conectado ao Supabase próprio.
9. Relatório curto de execução, contendo:
   - blocos implementados;
   - tabelas reutilizadas/criadas;
   - eventos e integrações reais;
   - resultado dos 20 critérios de aceite;
   - URLs do preview;
   - falhas reais remanescentes, se houver.
10. Não fazer merge em `main` sem validação explícita da proprietária.

---

## Regra final

> O Clube Ancestral precisa funcionar como uma operação única, não como coleções de abas, cenários, listas e cards desconectados.
>
> Todo dado nasce ou termina em um cliente e em um caso.
>
> Todo caso tem uma próxima ação.
>
> Toda ação relevante atualiza outro ponto do sistema.
>
> Toda informação necessária para trabalhar deve estar disponível no Caso 360.
