# Clube Ancestral — Especificações Executáveis dos Motores Operacionais

**Versão:** 1.0  
**Data:** 28 de agosto de 2026  
**Destino:** Claude Code / equipe de desenvolvimento — repositório `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio (Auth + PostgreSQL + Storage) e Vercel (preview + produção)  
**Objetivo:** implementar cinco motores reais, persistidos e testáveis: **Financeiro**, **Onboarding e Cadências**, **Marketing**, **Planejador de Cidadania** e **Pesquisa Documental**.

> **Regra de aceite:** uma especificação só é considerada entregue quando a pessoa proprietária consegue executar o fluxo no preview, recarregar a página e encontrar os mesmos dados no Supabase. Lista estática, mock, estado local, localStorage, card sem ação, botão sem gravação ou relatório sem dado real não são entrega.

---

# 0. Regras comuns aos cinco motores

## 0.1 Fonte de verdade

```text
Dados operacionais → Supabase PostgreSQL
Arquivos/documentos → Supabase Storage
Usuário e sessão → Supabase Auth
Código → GitHub
Preview e produção → Vercel
```

Não usar Lovable como fonte de dados, lógica ou deploy. Não usar planilha, array local, JSON hardcoded, dados de demonstração ou localStorage como fonte final de estado operacional.

## 0.2 Acesso

A proprietária/admin autenticada e vinculada à organização possui acesso total aos cinco motores.

```text
sessão autenticada + membership ativo da organização = acesso interno
role owner ou admin = CRUD total na organização
```

Nenhum motor pode exigir modo proprietária, reconfirmação, auditoria, checklist de lançamento, gate institucional, contrato prévio, SKU homologado, link Asaas, pagamento conciliado ou fase específica para salvar um rascunho.

## 0.3 Padrão de persistência

Para qualquer criação/edição:

```text
1. validar apenas os campos mínimos reais;
2. executar INSERT ou UPDATE no Supabase;
3. tratar erro retornado;
4. exibir “Salvo.” se houver sucesso;
5. invalidar/refazer query;
6. recarregar página e confirmar persistência.
```

Toda tela deve informar erro de forma objetiva:

```text
Não foi possível salvar: [mensagem retornada]. Tente novamente.
```

Nunca exibir erro genérico sem causa, “ação ignorada”, “aprovação necessária”, “reconfirme sua propriedade” ou sucesso falso.

## 0.4 Convenções compartilhadas

- Toda tabela operacional contém `id uuid`, `organization_id uuid`, `created_at timestamptz`, `updated_at timestamptz` quando aplicável.
- Todo dado vinculado a cliente deve conter `client_id` e/ou `case_id` quando houver contexto de caso.
- Usar exclusão lógica (`archived_at`, `status = 'archived'` ou `is_archived`) em vez de exclusão definitiva na interface.
- Criar índices para `organization_id`, `client_id`, `case_id`, `status`, `due_date`, `created_at` e campos de filtro recorrente.
- Não imprimir segredos de Supabase, Asaas, e-mail, WhatsApp ou Vercel em logs, commits ou telas.

---

# 1. Motor Financeiro

## 1.1 Resultado de negócio

A proprietária consegue controlar, por cliente e por caso:

- proposta comercial;
- valor contratado;
- honorários, descontos, despesas e taxas externas;
- entrada;
- parcelas;
- vencimentos;
- pagamentos manuais;
- saldo aberto;
- atraso;
- conciliação futura com Asaas;
- visão geral de recebíveis e recebidos.

O motor deve funcionar totalmente **antes** de qualquer integração automática com Asaas.

## 1.2 Fluxo executável

```text
Cliente
  → Caso
  → Proposta ou Contrato
  → Plano financeiro
  → Entrada + parcelas
  → Registro de pagamento manual
  → Saldo recalculado
  → Painel Financeiro atualizado
  → Caso e cliente exibem o resumo financeiro
```

## 1.3 Tabelas mínimas

```sql
create table financial_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid not null,
  case_id uuid,
  proposal_id uuid,
  contract_id uuid,
  title text not null,
  currency text not null default 'BRL',
  honorarium_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  expense_estimate_amount numeric(12,2) not null default 0,
  external_fees_estimate_amount numeric(12,2) not null default 0,
  contracted_total_amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table receivables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  financial_plan_id uuid not null references financial_plans(id) on delete cascade,
  client_id uuid not null,
  case_id uuid,
  contract_id uuid,
  installment_number integer,
  description text not null,
  category text not null default 'honorarium',
  amount numeric(12,2) not null,
  due_date date,
  paid_amount numeric(12,2) not null default 0,
  paid_at timestamptz,
  status text not null default 'pending',
  payment_method text,
  external_reference text,
  asaas_payment_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table financial_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  receivable_id uuid references receivables(id) on delete set null,
  client_id uuid,
  case_id uuid,
  transaction_type text not null,
  amount numeric(12,2) not null,
  occurred_at timestamptz not null default now(),
  payment_method text,
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index financial_plans_org_case_idx
  on financial_plans (organization_id, case_id, status);

create index receivables_org_status_due_idx
  on receivables (organization_id, status, due_date);

create index receivables_case_idx
  on receivables (case_id, status);
```

### Estados de recebível

```text
pending     = lançado, ainda não vencido/pago
agreed      = pagamento combinado, sem confirmação
overdue     = vencido e não pago
partial     = pagamento parcial registrado
paid        = quitado
cancelled   = cancelado
waived      = dispensado
```

## 1.4 Regras de cálculo

```text
valor_contratado = honorários - desconto
valor_previsto_total = valor_contratado + despesas previstas + taxas externas previstas
valor_recebido = soma(financial_transactions do tipo payment)
saldo_de_honorários = soma(receivables.amount) - soma(receivables.paid_amount)
```

Regras:

- Despesas e taxas externas devem permanecer separadas dos honorários.
- Permitir criar plano financeiro sem proposta, contrato, SKU ou integração externa.
- Permitir editar valores e parcelas enquanto o plano estiver em `draft` ou `active`.
- Um pagamento manual cria `financial_transaction` e atualiza o recebível correspondente.
- Se `paid_amount = amount`, marcar recebível como `paid` e preencher `paid_at`.
- Se `0 < paid_amount < amount`, marcar `partial`.
- Uma rotina de leitura pode marcar como `overdue` quando `due_date < current_date` e status estiver `pending`/`agreed`; essa rotina nunca deve bloquear uso.

## 1.5 Telas e ações reais

### `/financeiro`

Exibir dados reais filtrados por organização:

- total contratado;
- total recebido;
- saldo aberto;
- vencido;
- vencimentos dos próximos 30 dias;
- lista de recebíveis com filtros de status, cliente, caso e período;
- botão “Novo plano financeiro”;
- botão “Registrar pagamento”;
- botão “Gerar parcelas”.

### `/casos/:caseId/financeiro`

Exibir:

- planos financeiros do caso;
- parcelas e pagamentos;
- saldo;
- histórico de transações;
- ação para editar e registrar pagamento.

### Ações obrigatórias

```text
Criar plano financeiro
Adicionar item/recebível manual
Gerar entrada e parcelas
Editar vencimento/valor/descrição
Registrar pagamento total
Registrar pagamento parcial
Cancelar/dispensar recebível
Registrar despesa/taxa como informação
```

## 1.6 Critérios de aceite

1. Criar cliente e caso de teste.
2. Criar plano com honorários de R$ 1.000,00, desconto de R$ 100,00 e despesas previstas de R$ 200,00.
3. Criar entrada de R$ 300,00 e três parcelas de R$ 200,00.
4. Registrar entrada como paga por Pix.
5. Registrar pagamento parcial de R$ 100,00 na primeira parcela.
6. Recarregar `/financeiro` e `/casos/:caseId/financeiro`.
7. Confirmar: entrada `paid`, primeira parcela `partial`, duas parcelas `pending`, total recebido e saldo corretos.
8. Confirmar que nenhum passo exigiu Asaas, auditoria, contrato assinado ou SKU.

---

# 2. Motor de Onboarding e Cadências

## 2.1 Definição

Neste produto, **cadência** é uma sequência real de tarefas, lembretes e comunicações associada a um evento do cliente/caso. Ela não é uma lista de mensagens ou um card decorativo.

O onboarding é a primeira cadência: após pagamento, aceite de proposta ou ativação manual, o sistema cria as tarefas necessárias para iniciar o caso e acompanha a resposta do cliente.

## 2.2 Resultado de negócio

A proprietária consegue:

- iniciar onboarding para qualquer caso;
- criar e editar checklists de onboarding;
- atribuir tarefas ao cliente/equipe;
- definir prazo;
- visualizar o que está atrasado;
- registrar contato manual;
- criar follow-ups automaticamente a partir de eventos;
- pausar, concluir ou reagendar cadências;
- ver as próximas ações no Painel Hoje.

## 2.3 Fluxo executável

```text
Evento de entrada
  → ativar onboarding/cadência
  → criar tarefas reais e persistidas
  → exibir no Painel Hoje
  → registrar interação e resposta
  → concluir/reagendar tarefas
  → disparar próxima tarefa apenas se a anterior estiver pendente/concluída conforme regra
  → encerrar cadência ao atingir o objetivo
```

### Eventos iniciais mínimos

```text
proposal_accepted
payment_registered
contract_signed
case_created
case_without_update
missing_document
payment_overdue
```

## 2.4 Tabelas mínimas

```sql
create table cadence_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  name text not null,
  trigger_event text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table cadence_template_steps (
  id uuid primary key default gen_random_uuid(),
  cadence_template_id uuid not null references cadence_templates(id) on delete cascade,
  step_order integer not null,
  offset_days integer not null default 0,
  action_type text not null,
  title text not null,
  description text,
  audience text not null default 'internal',
  channel text,
  template_code text,
  requires_previous_completion boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (cadence_template_id, step_order)
);

create table cadence_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  cadence_template_id uuid not null references cadence_templates(id),
  client_id uuid,
  case_id uuid,
  source_event text not null,
  source_id uuid,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  paused_at timestamptz,
  paused_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cadence_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  cadence_run_id uuid not null references cadence_runs(id) on delete cascade,
  template_step_id uuid references cadence_template_steps(id),
  client_id uuid,
  case_id uuid,
  task_id uuid,
  scheduled_for timestamptz not null,
  completed_at timestamptz,
  status text not null default 'scheduled',
  action_type text not null,
  channel text,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table communication_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid,
  case_id uuid,
  cadence_action_id uuid references cadence_actions(id) on delete set null,
  channel text not null,
  direction text not null,
  status text not null,
  subject text,
  body text,
  occurred_at timestamptz not null default now(),
  created_by uuid,
  created_at timestamptz not null default now()
);

create index cadence_runs_case_status_idx
  on cadence_runs (case_id, status);

create index cadence_actions_org_due_idx
  on cadence_actions (organization_id, status, scheduled_for);
```

Usar a tabela `tasks` existente ou criar uma tabela com `case_id`, `client_id`, `title`, `due_date`, `status`, `owner_id`, `source_type` e `source_id`.

## 2.5 Templates iniciais obrigatórios

### `ONBOARDING_CLIENTE_NOVO`

| Ordem | Offset | Ação | Público | Título |
|---|---:|---|---|---|
| 1 | 0 dias | tarefa | interno | Preparar boas-vindas e conferir dados iniciais |
| 2 | 0 dias | tarefa | cliente | Enviar/solicitar formulário e documentos iniciais |
| 3 | 2 dias | tarefa | interno | Verificar se cliente respondeu ao onboarding |
| 4 | 7 dias | tarefa | interno | Fazer follow-up de onboarding pendente |
| 5 | 14 dias | tarefa | interno | Revisar caso sem documentos iniciais |

### `FOLLOW_UP_PROPOSTA`

| Ordem | Offset | Ação | Público | Título |
|---|---:|---|---|---|
| 1 | 3 dias | tarefa | interno | Fazer follow-up da proposta |
| 2 | 7 dias | tarefa | interno | Verificar objeções ou atualizar proposta |
| 3 | 14 dias | tarefa | interno | Encerrar, pausar ou reabrir oportunidade |

### `DOCUMENTO_PENDENTE`

| Ordem | Offset | Ação | Público | Título |
|---|---:|---|---|---|
| 1 | 0 dias | tarefa | cliente | Solicitar documento pendente |
| 2 | 7 dias | tarefa | interno | Verificar pendência documental |
| 3 | 14 dias | tarefa | interno | Fazer contato humano sobre pendência crítica |

### `PAGAMENTO_EM_ATRASO`

| Ordem | Offset | Ação | Público | Título |
|---|---:|---|---|---|
| 1 | 1 dia | tarefa | interno | Conferir parcela vencida |
| 2 | 3 dias | tarefa | cliente | Enviar lembrete de pagamento |
| 3 | 10 dias | tarefa | interno | Definir próxima ação financeira |

## 2.6 Motor de execução

Implementar uma função server-side idempotente:

```text
iniciarCadencia(trigger_event, organization_id, client_id, case_id, source_id)
```

Ela deve:

1. Localizar `cadence_templates` ativos para o evento.
2. Evitar criar run duplicado para a mesma combinação de template + caso + evento de origem.
3. Criar `cadence_run`.
4. Criar `cadence_actions` programadas.
5. Criar tarefas reais na tabela `tasks` para cada ação do tipo `task`.
6. Fazer as tarefas aparecerem no Painel Hoje conforme `due_date`.

Implementar também uma função de leitura/execução diária:

```text
processarCadenciasPendentes(organization_id, date)
```

Na primeira versão, ela **não precisa enviar WhatsApp ou e-mail automaticamente**. Ela deve criar a tarefa para a proprietária e registrar a ação pendente. A ação externa só poderá ser enviada quando a proprietária clicar em “Enviar” ou usar uma integração posteriormente.

## 2.7 Telas e ações reais

### `/onboarding`

- lista de onboardings ativos;
- percentual de tarefas concluídas;
- cliente, caso, responsável, início e próxima ação;
- botão “Iniciar onboarding” para qualquer caso;
- ação de pausar, reativar e concluir.

### `/cadencias`

- lista de cadências ativas;
- filtros por template, cliente, caso, status e data;
- ações agendadas, concluídas, vencidas e pausadas;
- possibilidade de reagendar ou concluir manualmente;
- histórico de interações.

### `/painel`

- tarefas de hoje e atrasadas originadas das cadências;
- botão de concluir/reagendar;
- link direto para cliente/caso.

## 2.8 Critérios de aceite

1. Criar cliente e caso.
2. Ativar manualmente `ONBOARDING_CLIENTE_NOVO`.
3. Confirmar criação de `cadence_run` e cinco tarefas reais.
4. Abrir Painel Hoje e localizar as tarefas previstas para hoje.
5. Concluir a primeira tarefa e reagendar a segunda.
6. Recarregar a página e confirmar persistência.
7. Criar uma proposta e marcá-la como aceita.
8. Confirmar que `FOLLOW_UP_PROPOSTA` cria tarefas de D+3, D+7 e D+14.
9. Confirmar que nenhuma ação exige auditoria, integração de WhatsApp/e-mail ou modo proprietária.

---

# 3. Motor de Marketing e Conversão

## 3.1 Resultado de negócio

A proprietária consegue acompanhar a origem de cada lead e conduzi-lo até conversão comercial:

```text
origem/campanha
  → lead
  → atendimento
  → qualificação
  → diagnóstico
  → proposta
  → pagamento/contrato
  → cliente/caso
```

O motor deve permitir marketing real mesmo antes de integrações com Meta, Google Ads, LinkedIn ou WhatsApp. A primeira versão precisa registrar dados manualmente e mostrar métricas calculadas com esses dados.

## 3.2 Funil canônico

```text
new
contacted
qualified
diagnostic_scheduled
diagnostic_completed
proposal_sent
negotiation
won
lost
nurture
```

Regras:

- `won` cria ou permite criar cliente e caso.
- `lost` exige motivo opcional, não bloqueante.
- `nurture` mantém lead vivo para follow-up futuro.
- Nenhuma mudança de estágio exige aprovação.

## 3.3 Tabelas mínimas

```sql
create table marketing_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  name text not null,
  channel text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  source_id uuid references marketing_sources(id),
  name text not null,
  channel text not null,
  status text not null default 'draft',
  started_at date,
  ended_at date,
  budget_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  source_id uuid references marketing_sources(id),
  campaign_id uuid references marketing_campaigns(id),
  full_name text not null,
  email text,
  phone text,
  interest_country_code text,
  interest_type text,
  stage text not null default 'new',
  score integer not null default 0,
  owner_id uuid,
  next_contact_at timestamptz,
  lost_reason text,
  notes text,
  converted_client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lead_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  lead_id uuid not null references leads(id) on delete cascade,
  activity_type text not null,
  body text,
  occurred_at timestamptz not null default now(),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table marketing_spend_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  campaign_id uuid references marketing_campaigns(id) on delete set null,
  occurred_on date not null,
  amount numeric(12,2) not null,
  source_reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index leads_org_stage_idx
  on leads (organization_id, stage, next_contact_at);

create index leads_campaign_idx
  on leads (campaign_id, created_at);
```

## 3.4 Fontes iniciais

Popular fontes editáveis:

```text
google_ads
meta_ads
linkedin
instagram
whatsapp
indicacao
site_organico
newsletter
evento
parceiro
outro
```

Não presumir custo, CAC ou retorno se não houver lançamento de gasto e conversão real.

## 3.5 Motor de qualificação

Criar um score simples e transparente, recalculável:

```text
+20 se tem telefone ou e-mail
+15 se informa país de interesse
+15 se informa objetivo (cidadania, pesquisa, memória, documentos)
+20 se respondeu diagnóstico/radar
+15 se possui ascendente identificado
+15 se agendou conversa ou solicitou proposta
```

Faixas:

```text
0–29   = inicial
30–59  = em qualificação
60–79  = qualificado
80–100 = prioritário
```

O score não bloqueia atendimento; ele apenas ordena a fila.

## 3.6 Telas e ações reais

### `/marketing/leads`

- lista em tabela e kanban por estágio;
- criar lead;
- editar dados, estágio, país/objetivo, fonte, campanha, responsável e próximo contato;
- registrar atividade;
- converter lead em cliente;
- criar caso a partir do lead convertido.

### `/marketing/campanhas`

- criar campanha;
- definir fonte, período e orçamento;
- registrar gasto manual;
- ver leads, qualificados, propostas, vendas e receita atribuída.

### `/marketing/relatorios`

Calcular com dados reais:

```text
leads por origem
leads por campanha
qualificados por origem
propostas por origem
conversões won por origem
receita contratada por origem/campanha
custo registrado por campanha
CPL = gasto / leads, quando gasto e leads > 0
CAC = gasto / clientes ganhos, quando gasto e ganhos > 0
```

Se faltarem dados, exibir **“Sem dados suficientes”**, nunca números inventados.

## 3.7 Integração com cadências

Eventos de marketing devem acionar tarefas reais:

```text
lead_created             → tarefa de primeiro contato
lead_stage=qualified     → tarefa de diagnóstico/proposta
proposal_sent            → FOLLOW_UP_PROPOSTA
lead_stage=nurture       → tarefa de retomada configurável
```

## 3.8 Critérios de aceite

1. Criar fonte `indicacao` e campanha `Indicações Agosto`.
2. Registrar gasto opcional de R$ 0,00 ou R$ 100,00.
3. Criar três leads com fontes distintas.
4. Mover um para `qualified` e registrar atividade.
5. Criar proposta vinculada ao lead/cliente.
6. Converter um lead em cliente e caso.
7. Marcar um como `won` e associar valor contratado.
8. Abrir relatório e confirmar contagens/receita reais.
9. Confirmar que CAC/CPL só aparece se houver dados suficientes.

---

# 4. Motor do Planejador de Cidadania

## 4.1 Resultado de negócio

O Planejador organiza o caso por país, rota, fase, pendências, documentos, marcos, próxima ação e estimativa operacional. Ele deve registrar dados e sugerir organização; não pode prometer resultado jurídico nem bloquear a proprietária de avançar/editar o caso.

## 4.2 Fases canônicas

```text
discovery              = Descoberta e Dados Iniciais
diagnosis              = Diagnóstico e Estratégia
research               = Pesquisa e Documentos
legal_preparation      = Validação, Retificação e Pasta
filing                 = Protocolo e Acompanhamento
post_recognition       = Reconhecimento, Registros e Legado
```

A proprietária pode avançar, recuar ou escolher fase diretamente. O sistema registra o histórico, mas nunca exige aprovação, checklist completo ou reconfirmação.

## 4.3 Fluxo executável

```text
Caso criado
  → selecionar país/objetivo/rota quando conhecidos
  → criar avaliação diagnóstica ou registrar hipótese
  → criar pendências e requisitos documentais
  → criar milestones e tarefas
  → atualizar fase manualmente ou por sugestão
  → exibir próximo passo e progresso no Desk/app cliente
  → registrar protocolo/reconhecimento quando ocorrer
```

## 4.4 Tabelas mínimas

```sql
create table citizenship_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid not null,
  case_code text,
  title text not null,
  country_code text,
  route text,
  objective text,
  current_phase text not null default 'discovery',
  status text not null default 'active',
  next_action text,
  next_action_due_date date,
  assigned_to uuid,
  estimated_start_date date,
  estimated_min_end_date date,
  estimated_max_end_date date,
  confidence_score numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table case_phase_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references citizenship_cases(id) on delete cascade,
  previous_phase text,
  new_phase text not null,
  reason text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

create table case_milestones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references citizenship_cases(id) on delete cascade,
  code text,
  title text not null,
  phase text,
  status text not null default 'planned',
  planned_date date,
  completed_date date,
  client_visible boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table case_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references citizenship_cases(id) on delete cascade,
  title text not null,
  requirement_type text not null default 'document',
  phase text,
  status text not null default 'pending',
  is_blocking boolean not null default false,
  person_id uuid,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table planner_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references citizenship_cases(id) on delete cascade,
  assessment_type text not null,
  status text not null default 'draft',
  result_summary text,
  confidence_score numeric(5,2),
  input_data jsonb not null default '{}'::jsonb,
  result_data jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index citizenship_cases_org_phase_idx
  on citizenship_cases (organization_id, current_phase, status);

create index case_requirements_case_status_idx
  on case_requirements (case_id, status, is_blocking);

create index case_milestones_case_date_idx
  on case_milestones (case_id, planned_date, status);
```

## 4.5 Regras operacionais

### Progresso

Calcular sem bloquear:

```text
progresso = itens concluídos / itens totais relevantes
```

Exibir progresso como indicador, nunca como condição para avançar fase.

### Próxima ação

Ordem de seleção:

```text
1. requisito bloqueante pendente com prazo mais próximo;
2. tarefa aberta vencida;
3. tarefa aberta para hoje;
4. milestone planejado mais próximo;
5. next_action manual do caso;
6. “Definir próximo passo” se não houver ação.
```

### Estimativa

Guardar estimativa em faixa:

```text
estimated_min_end_date
estimated_max_end_date
confidence_score
```

A interface deve informar que a previsão depende de documentação, órgãos externos e rota. Não apresentar data como garantia.

### Avaliação de elegibilidade

Nesta versão, permitir que a proprietária registre:

```text
potential
review_required
eligible_for_strategy
not_applicable
inconclusive
```

A avaliação pode conter hipóteses, alertas e evidências em JSONB/texto. Não criar um motor jurídico automático que declare cidadania garantida.

## 4.6 Telas e ações reais

### `/planejador`

- lista de casos por fase, país, responsável, status e próxima ação;
- botão “Novo caso”;
- filtros e busca;
- indicadores: casos por fase, atrasados, sem próxima ação, com pendência bloqueante;
- abrir caso.

### `/casos/:caseId/planejador`

- fase atual e botão para trocar fase;
- linha do tempo de milestones;
- requisitos/pendências;
- próxima ação editável;
- estimativa em faixa;
- avaliação/diagnóstico;
- histórico de fases;
- vínculo com tarefas, documentos, financeiro, proposta e contrato.

### Ações obrigatórias

```text
Criar/editar caso
Definir país, rota e objetivo
Mover fase livremente
Criar milestone
Concluir milestone
Criar requisito/pendência
Marcar requisito como concluído
Definir próxima ação
Registrar avaliação diagnóstica
Informar previsão em faixa
```

## 4.7 Critérios de aceite

1. Criar caso para cliente de teste.
2. Definir país `ITA`, rota `judicial` e objetivo.
3. Criar três requisitos, um marcado como bloqueante.
4. Criar dois milestones e concluir um.
5. Definir próxima ação e data.
6. Mover da fase `discovery` para `research` e depois voltar para `diagnosis`.
7. Registrar avaliação `potential` com resumo e score.
8. Definir previsão mínima/máxima.
9. Recarregar e confirmar que tudo permanece.
10. Confirmar que o sistema não impediu nenhuma ação por checklist ou fase.

---

# 5. Motor de Pesquisa Documental e Genealógica

## 5.1 Resultado de negócio

A proprietária consegue montar pesquisa de verdade: pessoas, relações, eventos, fontes, pedidos documentais, documentos recebidos, evidências, hipóteses, achados e pendências — todos vinculados a um caso e persistidos.

## 5.2 Fluxo executável

```text
Caso
  → pessoa/ascendente
  → relação familiar
  → evento histórico
  → fonte/referência
  → pedido documental ou pesquisa
  → documento localizado/recebido
  → upload ou referência
  → evidência vinculada
  → hipótese confirmada/refutada/em análise
  → atualização ao cliente quando liberada
```

## 5.3 Tabelas mínimas

```sql
create table research_people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  full_name text not null,
  birth_name text,
  alternate_names jsonb not null default '[]'::jsonb,
  birth_date date,
  birth_place text,
  death_date date,
  death_place text,
  nationality text,
  person_status text not null default 'researching',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  person_a_id uuid not null references research_people(id) on delete cascade,
  person_b_id uuid not null references research_people(id) on delete cascade,
  relationship_type text not null,
  evidence_status text not null default 'hypothesis',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  person_id uuid references research_people(id) on delete set null,
  event_type text not null,
  event_date date,
  event_place text,
  description text,
  precision text default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  source_type text not null,
  title text not null,
  repository_name text,
  reference_code text,
  source_url text,
  citation_text text,
  reliability text default 'unknown',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_document_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  person_id uuid references research_people(id) on delete set null,
  source_id uuid references research_sources(id) on delete set null,
  document_type text not null,
  title text not null,
  jurisdiction text,
  repository_name text,
  status text not null default 'to_research',
  requested_at date,
  estimated_response_date date,
  received_at date,
  cost_amount numeric(12,2),
  external_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  person_id uuid references research_people(id) on delete set null,
  request_id uuid references research_document_requests(id) on delete set null,
  source_id uuid references research_sources(id) on delete set null,
  title text not null,
  document_type text,
  document_date date,
  issuer text,
  language text,
  status text not null default 'received',
  storage_path text,
  external_url text,
  client_visible boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  person_id uuid references research_people(id) on delete set null,
  source_id uuid references research_sources(id) on delete set null,
  document_id uuid references research_documents(id) on delete set null,
  claim text not null,
  evidence_status text not null default 'supports',
  confidence_score numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_hypotheses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  title text not null,
  statement text not null,
  status text not null default 'testing',
  confidence_score numeric(5,2),
  conclusion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index research_people_case_idx on research_people (case_id, full_name);
create index research_documents_case_status_idx on research_documents (case_id, status);
create index research_requests_case_status_idx on research_document_requests (case_id, status);
create index research_sources_case_idx on research_sources (case_id, source_type);
```

### Vocabulários mínimos

#### `research_people.person_status`

```text
researching
identified
confirmed
uncertain
archived
```

#### `research_relationships.relationship_type`

```text
parent_child
spouse
sibling
other
unknown
```

#### `evidence_status`

```text
hypothesis
supports
conflicts
confirmed
rejected
```

#### `research_document_requests.status`

```text
to_research
located
requested
awaiting_response
received
unavailable
cancelled
```

#### `research_documents.status`

```text
received
under_review
validated
needs_translation
needs_apostille
needs_rectification
rejected
```

#### `research_hypotheses.status`

```text
testing
supported
confirmed
refuted
inconclusive
```

## 5.4 Storage

Usar bucket privado no Supabase Storage:

```text
research-documents
```

Estrutura de caminho:

```text
{organization_id}/{case_id}/{person_id-or-general}/{document_id-or-timestamp}-{filename}
```

Regras:

- upload retorna `storage_path` salvo em `research_documents`;
- arquivo só é exibido para membros da mesma organização e para cliente se `client_visible = true`;
- em caso de falha de upload, permitir salvar pedido/documento como registro sem arquivo e incluir `external_url` ou observação;
- upload não pode apagar campos preenchidos do formulário.

## 5.5 Telas e ações reais

### `/pesquisa`

- selecionar caso;
- resumo de pessoas, documentos, pedidos, fontes e hipóteses;
- busca de pessoas/documentos por nome/tipo/status;
- botão “Nova pessoa”, “Nova fonte”, “Novo pedido”, “Novo documento”, “Nova hipótese”.

### `/casos/:caseId/pesquisa`

Abas reais:

```text
Pessoas
Relações
Eventos
Fontes
Pedidos documentais
Documentos
Evidências
Hipóteses
Atualizações
```

### Ações mínimas

```text
Criar pessoa
Editar pessoa
Criar relação
Criar evento
Criar fonte com referência/URL
Criar pedido documental
Mudar status do pedido
Criar documento e anexar arquivo
Abrir arquivo
Criar evidência vinculada a fonte/documento
Criar hipótese e mudar estado
Liberar atualização/documento ao cliente
```

## 5.6 Integrações com Planejador e Cadências

- Novo `research_document_request` em `to_research`/`requested` cria requisito no Planejador quando vinculado a necessidade de cidadania.
- Documento com status `needs_translation`, `needs_apostille` ou `needs_rectification` cria pendência e tarefa correspondente.
- Pedido sem atualização após prazo estimado cria tarefa de follow-up no Painel Hoje.
- Documento definido como `client_visible = true` fica disponível no portal do cliente.
- Achado relevante pode criar `case_update` com visibilidade `client`, mas isso deve ser uma ação explícita da proprietária na primeira versão.

## 5.7 Critérios de aceite

1. Criar cliente e caso.
2. Criar pessoa ancestral com nome e local de nascimento.
3. Criar relação parent-child entre duas pessoas.
4. Criar evento de nascimento ou casamento.
5. Criar fonte com repositório, código de referência e URL.
6. Criar pedido de certidão, alterar de `to_research` para `requested`.
7. Criar documento, enviar arquivo real ao Storage e abrir o arquivo.
8. Criar evidência vinculada ao documento.
9. Criar hipótese e mudar status de `testing` para `supported`.
10. Marcar documento como `needs_translation` e confirmar criação de tarefa/pendência.
11. Recarregar a página e confirmar persistência de todos os itens.

---

# 6. Ordem obrigatória de implementação

Não iniciar o próximo motor enquanto o motor anterior não estiver funcional no preview e aceito pela proprietária.

```text
1. Financeiro
2. Onboarding e Cadências
3. Marketing e Conversão
4. Planejador de Cidadania
5. Pesquisa Documental e Genealógica
```

Cada motor deve seguir este ciclo:

```text
schema/migration não destrutiva
→ RLS por organização
→ funções CRUD reais
→ interface ligada ao banco
→ tratamento de erro
→ teste manual no preview
→ aceite da proprietária
→ somente então próximo motor
```

---

# 7. Proibições de entrega

Não considerar implementado se houver:

- tela sem dados reais;
- mock, array local ou JSON estático;
- ação que não persiste após refresh;
- botão que não faz INSERT/UPDATE;
- funcionalidade dependente de auditoria, reconfirmação, gate ou modo proprietária;
- bloqueio por checklist, fase, contrato, pagamento, SKU ou Asaas;
- PDF de contrato inexistente ou link quebrado;
- integração falsa;
- sucesso exibido após erro do banco;
- erro silencioso;
- dado de marketing/KPI inventado;
- exclusão ou alteração destrutiva de dados existentes.

---

# 8. Entrega por motor

Para cada motor, entregar apenas:

1. Migration SQL não destrutiva.
2. Rotas/telas implementadas.
3. Funções CRUD conectadas ao Supabase.
4. URL do preview Vercel.
5. Resultado dos critérios de aceite correspondentes, item a item.
6. Lista curta de falhas reais restantes, se houver.

Não entregar documentação adicional no lugar da implementação.

---

# 9. Regra final

> O motor só existe quando produz uma ação de trabalho persistida e recuperável: um valor financeiro, uma tarefa, um lead, uma fase de caso, uma pessoa, uma fonte, um pedido, um documento, uma evidência ou uma hipótese.
>
> Se a proprietária não consegue executar a ação, fechar a página, voltar e continuar do mesmo ponto, então o motor não foi construído.
