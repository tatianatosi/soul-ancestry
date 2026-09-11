> **Cópia de arquivo (2026-09-11).** Canônico em `docs/politicas/CLUBE_ANCESTRAL_ENTERPRISE_PRD.md`.

# CLUBE ANCESTRAL — ENTERPRISE PRD

**Arquivo:** `CLUBE_ANCESTRAL_ENTERPRISE_PRD.md`  
**Versão:** 0.1 — Diagnóstico e Blueprint Vivo  
**Data:** 18/08/2026  
**Horizonte imediato:** 30 dias  
**Status:** [PILOTO - EM AJUSTE]  
**Proprietária/Admin:** Clube Ancestral  
**Ambientes-alvo:** Vercel + Supabase (região São Paulo) + GitHub + integrações privadas

> Este PRD é um artefato vivo: estabelece a arquitetura de referência, os limites de segurança, o modelo de dados e o plano de estabilização. Não constitui autorização para enviar mensagens, criar contratos, alterar cobranças, publicar propostas, mudar dados de clientes ou ativar integrações produtivas sem validação humana explícita.

---

## 1. Objetivo e princípios

### 1.1 Objetivo

Migrar o ecossistema atualmente prototipado no Lovable Cloud para uma arquitetura versionada, modular, auditável e segura, composta por:

1. **App Cliente:** experiência autenticada e mobile-first para clientes acompanharem exclusivamente seus próprios casos, árvore genealógica, entregas, documentos aprovados, cronograma e notificações.
2. **Desk Intelligence:** painel operacional e executivo privado para a Admin operar CRM, casos, planejamento, contratos, SLAs, catálogo, simuladores, varreduras e integrações.
3. **Camada de Integrações:** Edge Functions no Supabase para chamadas server-side a Claude, WhatsApp, Google Drive, Canva, Asaas e serviços futuros.
4. **Camada de Governança:** fontes de verdade, trilha de auditoria, RLS, classificação de dados, feature flags e gates de aprovação.

### 1.2 Premissas obrigatórias

- O piloto suporta inicialmente **50–100 usuários ativos**; a prioridade é segurança, clareza operacional e reversibilidade, não complexidade prematura.
- O App Cliente e o Desk **não compartilham rotas, bundles, permissões ou segredos**. Eles podem ser dois projetos Vercel independentes, consumindo o mesmo Supabase com políticas e schemas segregados.
- O cliente nunca recebe chaves de `service_role`, tokens de Claude, WhatsApp, Google Drive, Canva, Asaas ou credenciais de webhooks.
- O browser utiliza somente variáveis públicas estritamente necessárias: URL do Supabase e chave anônima/publishable.
- Toda operação que tenha efeito externo (contrato, mensagem, cobrança, atualização em Drive/Canva/Asaas) passa por: validação de dados → idempotência → aprovação humana, quando aplicável → auditoria.
- O sistema trata as regras jurídicas e dicionários como **apoio operacional e versionado**, nunca como parecer jurídico automático ou decisão definitiva.
- A separação de origem é mandatória: Lovable é origem temporária de código/UI; GitHub é a origem de verdade do código; Supabase é a fonte relacional operacional; Drive é documental; Dropbox é histórico/backup; Canva é a fonte-mestre de proposta/layout aprovado.

### 1.3 Estados do piloto

Aplicar uma destas tags em épicos, telas, tabelas, integrações e regras ainda não homologadas:

- `[PILOTO - EM AJUSTE]`: existe no protótipo ou em implementação, sujeito a mudança.
- `ESTÁVEL`: validado funcionalmente, testado e com owner definido.
- `BLOQUEADO_POR_GATILHO`: depende de dado, consentimento, decisão, reconciliação ou aprovação.
- `PENDENTE_DE_VALIDACAO`: hipótese ou regra sem evidência suficiente.
- `ARQUIVADO_HISTORICO`: preservado para rastreabilidade, sem uso operacional.

---

## 2. Fontes de verdade e fronteiras

| Domínio | Fonte primária | Consumidor autorizado | Regra de precedência |
|---|---|---|---|
| Lead, oportunidade, aceite e handoff | CRM/Desk | Desk, automações controladas | CRM prevalece sobre planilhas auxiliares e histórico |
| SKU, preço, escopo, condição e link autorizado | Planilha Mestre de Produtos, importada e versionada | CRM, contratos, App, Asaas adapter | Catálogo homologado prevalece sobre proposta, Planejador e Asaas |
| Cobrança, pagamento e assinatura | Asaas | Desk financeiro, App em modo leitura | Asaas é transacional; não define escopo, preço canônico ou elegibilidade |
| Caso, evidência, pesquisa e decisões | Desk/Dossiê | Desk, App sanitizado | Desk prevalece sobre Drive e Dropbox |
| Cronograma, marcos e etapas | Planejador Universal/Desk | App, Desk | Planejador prevalece sobre calendários auxiliares |
| Proposta e layout-mestre | Canva | Desk, geração de proposta | Canva é master; Dropbox contém backup/histórico |
| Documentos de clientes ativos | Google Drive compartilhado | Desk; App por referência autorizada | acesso por adaptador server-side e autorização por caso |
| Backup e legado | Dropbox | somente recuperação/auditoria | nunca é fonte operacional |
| Regras consulares e dicionários | Base jurídica versionada no Supabase | simuladores e Desk | requer versão, fonte, data de revisão e aprovação humana |

### 2.1 Decisões de saneamento que bloqueiam automação

- Não expor no App nem cobrar SKU sem `catalog_status = ACTIVE` e reconciliação de preço/link.
- A coexistência de CRMs, IDs de caso ou versões de contrato deve ser resolvida por uma tabela de mapeamento e decisão de canonicidade; não criar um terceiro identificador.
- Contratos só podem nascer da matriz jurídica vigente, com versão imutável, snapshot dos parâmetros e aprovação explícita.
- A existência de template, link, arquivo ou webhook não comprova aplicação correta em um caso.

---

## 3. Arquitetura de referência

### 3.1 Visão lógica

```text
                        ┌──────────────────────────────────┐
                        │              GitHub              │
                        │ monorepo, PRs, CI, migrations     │
                        └───────────────┬──────────────────┘
                                        │ deploy
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
┌──────────▼───────────┐    ┌───────────▼──────────┐      ┌──────────▼───────────┐
│ Vercel: App Cliente  │    │ Vercel: Desk Privado │      │ Supabase São Paulo   │
│ cliente.domínio      │    │ desk.domínio         │      │ Auth, Postgres, RLS  │
│ public bundle        │    │ admin-only bundle    │      │ Storage, Realtime    │
└──────────┬───────────┘    └───────────┬──────────┘      │ Edge Functions       │
           │ anon/publishable key         │ anon key + MFA │ Cron/Webhooks        │
           └──────────────────────────────┴────────────────┴──────────┬───────────┘
                                                                        │ server-side secrets
             ┌──────────────────────────────────────────────────────────┼─────────────────────────┐
             │              │                │                │           │                         │
        Claude API      WhatsApp API      Google Drive       Canva      Asaas                  Observabilidade
        análise assistida notificações    documentos          propostas  financeiro             logs/alertas
```

### 3.2 Repositório modular

Estrutura inicial recomendada:

```text
clube-ancestral/
├── apps/
│   ├── client-app/                 # Vercel project: cliente
│   └── desk-admin/                 # Vercel project: admin privado
├── packages/
│   ├── ui/                         # componentes visuais compartilhados sem lógica sensível
│   ├── domain/                     # tipos, regras puras, estados e validadores
│   ├── api-client/                 # cliente Supabase tipado e contratos de API
│   └── config/                     # lint, TypeScript, testes
├── supabase/
│   ├── migrations/                 # SQL incremental e reversível
│   ├── functions/                  # Edge Functions por domínio
│   ├── seed/                       # dados fictícios/sanitizados
│   └── tests/                      # RLS, RPCs, integrações mockadas
├── docs/
│   ├── PRD/
│   ├── ADR/                        # decisões arquiteturais
│   ├── RUNBOOKS/
│   └── DATA_CONTRACTS/
└── .github/workflows/
```

### 3.3 Bounded contexts e Edge Functions

| Contexto | Responsabilidade | Interface | Estado |
|---|---|---|---|
| Identity & Access | Magic Link, perfis, roles, MFA Admin, consentimento | Supabase Auth + RLS | ESTÁVEL para núcleo; refinamento de UX [PILOTO - EM AJUSTE] |
| CRM | lead, contato, oportunidade, pipeline, touchpoints, aceite | tabelas + RPCs Desk | [PILOTO - EM AJUSTE] |
| Case Management | caso, núcleo familiar, árvore, tarefas, marcos, evidências | tabelas + views App sanitizadas | [PILOTO - EM AJUSTE] |
| Catálogo & Produtos | SKU, preço, escopo, condição, elegibilidade, oferta contextual | importação versionada + RPC | [PILOTO - EM AJUSTE] |
| Contratos | template versionado, parâmetros, renderização, aprovação e auditoria | `contract-generate`, `contract-approve` | [PILOTO - EM AJUSTE] |
| Inteligência jurídica | regras, dicionários, fontes, versões, resultados explicáveis | `eligibility-evaluate` | [PILOTO - EM AJUSTE] |
| Pesquisa e varredura | jobs, achados, evidências, revisão e publicação | `research-scan`, fila/job table | [PILOTO - EM AJUSTE] |
| Comunicação | notificações in-app, push e WhatsApp | `notification-dispatch`, `whatsapp-send` | [PILOTO - EM AJUSTE] |
| Integrações documentais | referências de Drive/Canva, snapshots e permissões | adaptadores server-side | [PILOTO - EM AJUSTE] |
| Financeiro | espelho de eventos Asaas, custos cartorários, reconciliação | webhooks + ledger de eventos | [PILOTO - EM AJUSTE] |
| Observabilidade | audit logs, erros, jobs, health checks e métricas | logs centralizados | ESTÁVEL mínimo obrigatório |

### 3.4 Regra de isolamento de aplicação

**App Cliente**

- Rotas: `/login`, `/jornada`, `/casos/:id`, `/arvore/:id`, `/documentos`, `/notificacoes`.
- Consome apenas views/RPCs explicitamente publicadas para `authenticated` e filtradas por RLS.
- Não consulta tabelas administrativas diretamente.
- Não renderiza notas internas, custos, regras não homologadas, dados de outros familiares sem vínculo de autorização ou documentos não publicados.

**Desk Intelligence**

- Domínio/subdomínio independente, autenticação obrigatória, allowlist de Admin no piloto e MFA obrigatório antes de produção.
- Sem fallback de “admin por e-mail no front-end”; a role vem de `app_metadata`/claims mantidas server-side.
- Permite operações administrativas somente por funções/RPCs validadas; alterações sensíveis devem gerar `audit_log`.
- O Desk é privado para a proprietária no estágio atual; futuras funções de equipe exigem RBAC formal por capacidade.

---

## 4. Variáveis de ambiente e segredos

### 4.1 Matriz de variáveis

| Variável | Onde existe | Visibilidade | Uso |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` ou `VITE_SUPABASE_URL` | App Cliente e Desk | pública | endpoint do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou publishable key | App Cliente e Desk | pública | autenticação/consultas protegidas por RLS |
| `SUPABASE_URL` | Edge Functions/CI | privada | SDK server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions/CI estritamente controlado | secreta | jobs administrativos, webhooks e bypass pontual de RLS |
| `SUPABASE_DB_URL` | CI/migrações | secreta | migrations e testes controlados |
| `CLAUDE_API_KEY` | Edge Function `ai-orchestrator` | secreta | análise de IA no servidor |
| `WHATSAPP_*` | Edge Function `whatsapp-send`/webhook | secreta | envio, validação webhook, templates |
| `GOOGLE_*` | Edge Function `drive-adapter` | secreta | OAuth/service account e acesso delimitado ao Drive |
| `CANVA_*` | Edge Function `canva-adapter` | secreta | acesso à proposta/layout conforme API autorizada |
| `ASAAS_*` | Edge Function `asaas-webhook`/adapter | secreta | reconciliação financeira e webhooks |
| `SENTRY_DSN` ou equivalente | Vercel + Functions | privada/pública conforme fornecedor | monitoramento de falhas sem PII em excesso |
| `CRON_SECRET` | Functions agendadas | secreta | autenticação de tarefas programadas |
| `WEBHOOK_SIGNING_SECRET_*` | Functions receptoras | secreta | validação de assinatura e anti-replay |

### 4.2 Regras operacionais de segredo

- Nunca prefixar segredo com `NEXT_PUBLIC_`, `VITE_` ou outra convenção de bundle do browser.
- Nunca registrar tokens, CPF, documentos civis, telefone, e-mail completo ou conteúdo de contrato em logs de aplicação.
- Manter segredos por ambiente: `development`, `preview`, `staging`, `production`.
- Production e staging usam projetos Supabase distintos e chaves distintas.
- Rotacionar credenciais após suspeita de exposição e, no mínimo, em revisão semestral.
- Validar assinatura, timestamp, origem e idempotência em todos os webhooks.
- Restringir `service_role` a Functions e CI; jamais em Vercel client env, Lovable exportado ou repositório.

---

## 5. Modelo de dados Supabase

### 5.1 Convenções

- Schema operacional: `public`; acesso de leitura do App via views/RPCs e RLS.
- Tabelas de segredo/integrador: schema `private` sem grants ao browser.
- Identificadores: UUID primário e código humano opcional/canônico (`case_code`, `sku_code`).
- Datas em `timestamptz`; valores monetários em `numeric(14,2)` com `currency`.
- PII criptografada em nível de aplicação/coluna quando necessário; o banco guarda ciphertext e metadados de chave, nunca chave privada.
- `created_at`, `updated_at`, `created_by` e `updated_by` em entidades críticas.
- Estados são enums/check constraints; não usar strings livres para fluxo operacional.

### 5.2 SQL base — schemas, extensões e perfis

```sql
create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from anon, authenticated;

create type public.app_role as enum ('CLIENT', 'ADMIN', 'OPERATOR', 'READ_ONLY');
create type public.case_status as enum ('LEAD', 'ONBOARDING', 'ACTIVE', 'WAITING_CLIENT', 'WAITING_THIRD_PARTY', 'PAUSED', 'COMPLETED', 'ARCHIVED');
create type public.record_state as enum ('PILOTO_EM_AJUSTE', 'ESTAVEL', 'BLOQUEADO_POR_GATILHO', 'PENDENTE_DE_VALIDACAO', 'ARQUIVADO_HISTORICO');
create type public.contract_status as enum ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'GENERATED', 'SENT', 'SIGNED', 'VOIDED', 'ARCHIVED');
create type public.notification_status as enum ('DRAFT', 'PENDING_APPROVAL', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'CLIENT',
  display_name text,
  email_ciphertext bytea,
  phone_ciphertext bytea,
  pii_key_version text,
  consent_at timestamptz,
  consent_version text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id),
  legal_name_ciphertext bytea,
  cpf_ciphertext bytea,
  status public.record_state not null default 'PILOTO_EM_AJUSTE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_access (
  client_account_id uuid not null references public.client_accounts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  access_type text not null check (access_type in ('OWNER', 'FAMILY_MEMBER', 'AUTHORIZED_REPRESENTATIVE')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (client_account_id, profile_id)
);
```

### 5.3 SQL base — CRM e catálogo

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  source text,
  full_name_ciphertext bytea,
  email_ciphertext bytea,
  phone_ciphertext bytea,
  consent_marketing_at timestamptz,
  status text not null default 'NEW',
  owner_profile_id uuid references public.profiles(id),
  state public.record_state not null default 'PILOTO_EM_AJUSTE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  client_account_id uuid references public.client_accounts(id),
  pipeline_stage text not null,
  acceptance_at timestamptz,
  estimated_value numeric(14,2),
  currency char(3) not null default 'BRL',
  state public.record_state not null default 'PILOTO_EM_AJUSTE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crm_touchpoints (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  channel text not null check (channel in ('WHATSAPP', 'EMAIL', 'PHONE', 'SITE', 'MEETING', 'OTHER')),
  direction text not null check (direction in ('INBOUND', 'OUTBOUND', 'INTERNAL')),
  occurred_at timestamptz not null,
  summary text not null,
  external_ref text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.product_catalog_versions (
  id uuid primary key default gen_random_uuid(),
  version_label text not null unique,
  source_reference text not null,
  imported_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  is_current boolean not null default false
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  catalog_version_id uuid not null references public.product_catalog_versions(id),
  sku_code text not null,
  name text not null,
  category text,
  lifecycle text,
  visibility_app text not null default 'HIDDEN',
  catalog_status text not null check (catalog_status in ('ACTIVE', 'PILOT', 'CONDITIONAL', 'PENDING', 'ARCHIVED')),
  price numeric(14,2),
  currency char(3) not null default 'BRL',
  scope_snapshot jsonb not null default '{}'::jsonb,
  asaas_link_ref text,
  state public.record_state not null default 'PILOTO_EM_AJUSTE',
  unique (catalog_version_id, sku_code)
);

create table public.product_eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  rule_version text not null,
  rule_json jsonb not null,
  human_approval_required boolean not null default true,
  active boolean not null default false
);
```

### 5.4 SQL base — casos, genealogia, documentos e SLA

```sql
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  case_code text not null unique,
  client_account_id uuid not null references public.client_accounts(id),
  opportunity_id uuid references public.opportunities(id),
  title text not null,
  country_code char(2),
  citizenship_path text,
  status public.case_status not null default 'ONBOARDING',
  state public.record_state not null default 'PILOTO_EM_AJUSTE',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.case_people (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  full_name_ciphertext bytea,
  relation_type text,
  birth_date_ciphertext bytea,
  death_date_ciphertext bytea,
  country_code char(2),
  is_subject boolean not null default false,
  visibility_to_client boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.genealogy_relationships (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  parent_person_id uuid not null references public.case_people(id) on delete cascade,
  child_person_id uuid not null references public.case_people(id) on delete cascade,
  relation_confidence numeric(5,2),
  evidence_status text not null default 'UNVERIFIED',
  created_at timestamptz not null default now(),
  unique(case_id, parent_person_id, child_person_id)
);

create table public.case_milestones (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  stage text not null,
  due_at timestamptz,
  completed_at timestamptz,
  client_visible boolean not null default false,
  state public.record_state not null default 'PILOTO_EM_AJUSTE',
  created_at timestamptz not null default now()
);

create table public.document_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  person_id uuid references public.case_people(id),
  document_type text not null,
  source_system text not null check (source_system in ('SUPABASE_STORAGE', 'GOOGLE_DRIVE', 'DROPBOX', 'OTHER')),
  external_ref text,
  checksum_sha256 text,
  status text not null check (status in ('REQUESTED', 'LOCATED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED')),
  client_visible boolean not null default false,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.sla_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  applies_to text not null,
  target_hours integer not null check (target_hours > 0),
  warning_percent integer not null default 80 check (warning_percent between 1 and 100),
  active boolean not null default true
);

create table public.sla_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  policy_id uuid not null references public.sla_policies(id),
  subject_type text not null,
  subject_id uuid,
  started_at timestamptz not null,
  due_at timestamptz not null,
  completed_at timestamptz,
  status text not null check (status in ('ON_TRACK', 'WARNING', 'BREACHED', 'PAUSED', 'COMPLETED')),
  pause_reason text,
  created_at timestamptz not null default now()
);
```

### 5.5 SQL base — contratos, IA, varredura, comunicação e auditoria

```sql
create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  template_code text not null,
  version text not null,
  body_template text not null,
  parameter_schema jsonb not null,
  jurisdiction text,
  is_current boolean not null default false,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  state public.record_state not null default 'PILOTO_EM_AJUSTE',
  unique(template_code, version)
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  client_account_id uuid not null references public.client_accounts(id),
  template_id uuid not null references public.contract_templates(id),
  status public.contract_status not null default 'DRAFT',
  parameter_snapshot jsonb not null,
  rendered_document_ref text,
  content_hash text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  generated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.legal_rule_sets (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null,
  rule_key text not null,
  version text not null,
  source_reference text not null,
  effective_from date,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  rule_json jsonb not null,
  status public.record_state not null default 'PENDENTE_DE_VALIDACAO',
  unique(country_code, rule_key, version)
);

create table public.eligibility_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id),
  rule_set_id uuid references public.legal_rule_sets(id),
  input_snapshot jsonb not null,
  result_json jsonb not null,
  result_status text not null check (result_status in ('INDETERMINATE', 'POTENTIALLY_ELIGIBLE', 'POTENTIALLY_INELIGIBLE', 'REVIEW_REQUIRED')),
  requires_human_review boolean not null default true,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.research_jobs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  job_type text not null,
  input_snapshot jsonb not null,
  status text not null check (status in ('QUEUED', 'RUNNING', 'NEEDS_REVIEW', 'COMPLETED', 'FAILED', 'CANCELLED')),
  idempotency_key text not null unique,
  started_at timestamptz,
  completed_at timestamptz,
  error_code text,
  created_at timestamptz not null default now()
);

create table public.research_findings (
  id uuid primary key default gen_random_uuid(),
  research_job_id uuid not null references public.research_jobs(id) on delete cascade,
  case_id uuid not null references public.cases(id),
  finding_type text not null,
  evidence_ref text,
  confidence numeric(5,2),
  review_status text not null check (review_status in ('PENDING', 'APPROVED', 'REJECTED')),
  client_visible boolean not null default false,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  recipient_profile_id uuid references public.profiles(id),
  channel text not null check (channel in ('IN_APP', 'PUSH', 'WHATSAPP')),
  status public.notification_status not null default 'DRAFT',
  template_key text,
  payload jsonb not null,
  idempotency_key text not null unique,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  sent_at timestamptz,
  provider_message_ref text,
  created_at timestamptz not null default now()
);

create table public.integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null check (status in ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED')),
  payload_redacted jsonb,
  error_detail text,
  unique(provider, external_event_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_profile_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  before_redacted jsonb,
  after_redacted jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);
```

### 5.6 RLS: modelo mínimo obrigatório

```sql
alter table public.profiles enable row level security;
alter table public.client_accounts enable row level security;
alter table public.client_access enable row level security;
alter table public.cases enable row level security;
alter table public.case_people enable row level security;
alter table public.genealogy_relationships enable row level security;
alter table public.case_milestones enable row level security;
alter table public.document_records enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN' and is_active = true
  );
$$;

create or replace function public.can_access_case(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.cases c
    join public.client_access ca on ca.client_account_id = c.client_account_id
    where c.id = target_case_id
      and ca.profile_id = auth.uid()
      and ca.revoked_at is null
  );
$$;

create policy "profile self or admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "client sees own cases"
on public.cases for select
using (public.can_access_case(id));

create policy "client sees authorized people only"
on public.case_people for select
using (
  public.can_access_case(case_id)
  and (public.is_admin() or visibility_to_client = true)
);

create policy "client sees visible milestones"
on public.case_milestones for select
using (
  public.can_access_case(case_id)
  and (public.is_admin() or client_visible = true)
);

create policy "client sees approved documents"
on public.document_records for select
using (
  public.can_access_case(case_id)
  and (public.is_admin() or (client_visible = true and status = 'APPROVED'))
);

create policy "client sees own notifications"
on public.notifications for select
using (recipient_profile_id = auth.uid() or public.is_admin());
```

### 5.7 Regras de RLS e dados pessoais

- Habilitar RLS em **todas** as tabelas expostas no schema `public`; ausência de policy significa negação.
- Proibir acesso direto de clientes a: `contracts`, `legal_rule_sets`, `eligibility_assessments`, `research_jobs`, `audit_logs`, `integration_events`, custos e dados internos de CRM.
- Expor ao App apenas views com colunas sanitizadas e aprovadas. Exemplo: `client_case_overview_v`, `client_documents_v`, `client_timeline_v`.
- Operações de escrita do cliente ficam limitadas a recursos explicitamente permitidos, como atualização de dados cadastrais consentidos ou upload sob prefixo próprio de Storage; nunca a entidades de decisão operacional.
- PII com alto risco (CPF, dados civis, e-mail, telefone, documentos) requer criptografia por campo, controle de chave externo/KMS quando disponível, mascaramento em logs e política de retenção.
- Arquivos devem seguir paths com `case_id`, mas a autorização real vem de policy de Storage e lookup relacional; não confiar somente no path.

---

## 6. Fluxos essenciais

### 6.1 Onboarding de cliente

1. Admin registra/converte lead em `client_account` e vincula a oportunidade/caso.
2. Admin concede `client_access` ao perfil do cliente ou cria convite autenticado.
3. Cliente recebe Magic Link; após primeiro login, aceita termos/consentimento versionado.
4. App exibe somente a view sanitizada do caso e os documentos com `APPROVED + client_visible`.
5. Toda alteração administrativa produz evento auditável.

### 6.2 Contrato

1. Desk seleciona caso, template vigente e SKUs homologados.
2. Função valida dados obrigatórios, estado do catálogo, parâmetros, preço snapshot e versão de template.
3. Contrato nasce como `DRAFT`; renderização gera um snapshot imutável e hash.
4. Admin revisa e aprova; só então status pode avançar para `GENERATED` e, em futuro homologado, `SENT`.
5. Alteração de escopo, preço ou template exige novo snapshot/versão; nunca sobrescrever documento já aprovado.

### 6.3 Elegibilidade e IA

1. Desk reúne dados estruturados e evidencia lacunas.
2. `eligibility-evaluate` usa exclusivamente ruleset versionado e modelo de IA como auxiliar explicativo.
3. Resultado retorna decisão provisória, motivos, dados ausentes, referências e `requires_human_review = true`.
4. O sistema não envia resultado jurídico definitivo ao cliente sem revisão e publicação pela Admin.

### 6.4 Achado histórico e comunicação

1. Job de pesquisa gera `research_finding` com evidência e confiança.
2. Achado inicia como `PENDING` e invisível ao cliente.
3. Admin aprova/rejeita; aprovação pode liberar item no App.
4. Notificação é criada como `DRAFT`/`PENDING_APPROVAL` com chave idempotente.
5. Após aprovação, dispatch envia Push/WhatsApp e grava referência do provedor; falhas são reprocessáveis sem duplicar mensagens.

### 6.5 Financeiro e reconciliação

1. Eventos de Asaas são recebidos via webhook autenticado e gravados em `integration_events`.
2. Adapter transforma eventos em espelho de cobrança/pagamento, sem alterar preço/escopo de produto.
3. Reconciliação compara catálogo homologado, oportunidade, contrato, cobranças e entrega vinculada.
4. Divergências viram exceções no Desk, não correções automáticas silenciosas.

---

## 7. Integrações e padrões de segurança

### 7.1 Padrão de Edge Function

Cada integração deve:

- receber autenticação do usuário ou assinatura do provedor;
- autorizar role/caso antes de buscar dados;
- validar payload com schema;
- usar chave idempotente;
- chamar terceiro somente server-side;
- persistir evento e status sem PII desnecessária;
- retornar erro seguro, sem detalhes de segredo;
- registrar `request_id` e `audit_log` para operações relevantes.

### 7.2 Mapa de integrações

| Integração | Função | Dados mínimos | Gate |
|---|---|---|---|
| Claude | `ai-orchestrator` | contexto sanitizado, ruleset, instrução, trace | revisão humana para saída jurídica/cliente |
| WhatsApp | `whatsapp-send`, `whatsapp-webhook` | template aprovado, destinatário autorizado, case ref | aprovação Admin e opt-in quando aplicável |
| Google Drive | `drive-adapter` | ID de arquivo/pasta, case_id, permissão | acesso por allowlist e vínculo de caso |
| Canva | `canva-adapter` | template/proposta IDs, variáveis aprovadas | proposta master e aprovação antes de exportar/enviar |
| Asaas | `asaas-webhook`, `asaas-reconcile` | evento financeiro, customer/payment ref | reconciliação; sem mutação automática de preço |
| Push | `notification-dispatch` | token, conteúdo sanitizado, idempotency key | opt-in e aprovação de achado |

### 7.3 Dicionários jurídicos

Criar rulesets por país para Itália, Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria e Áustria. Cada entrada deve ter:

- `country_code`, `rule_key`, versão e vigência;
- URL/referência ou fonte documental;
- data de consulta e data da última revisão;
- escopo, exceções e lista de dados necessários;
- estado de aprovação;
- responsável pela revisão;
- testes de exemplos e casos-limite.

Nunca permitir que a IA altere, publique ou ative uma regra jurídica. Ela pode sugerir diffs, perguntas de esclarecimento e explicações, sempre como rascunho.

---

## 8. UX/UI e critérios do App Cliente

### 8.1 Experiência do cliente [PILOTO - EM AJUSTE]

- Home de jornada: etapa atual, próximo marco, pendências claras e entregas recentes.
- Árvore genealógica: nomes/datas somente se aprovados para visualização do perfil; indicar nível de confiança/evidência sem expor notas internas.
- Documentos: status simples (`solicitado`, `localizado`, `em revisão`, `aprovado`); downloads controlados e auditáveis.
- Linha do tempo: marcos sanitizados e atualizações compreensíveis.
- Notificações: achados aprovados, solicitações e atualizações; preferências de canal.
- Acessibilidade, mobile-first, feedback de carregamento/erro e linguagem clara em PT-BR.

### 8.2 Experiência do Desk [PILOTO - EM AJUSTE]

- Dashboard: pipeline, casos ativos, SLAs em alerta, pendências de revisão, falhas de integração e reconciliação.
- Perfil 360°: CRM, casos, família, produtos, contratos, financeiro e histórico de contatos com rastreabilidade.
- Kanban de casos e tarefas: status, bloqueios, próximo responsável, SLA e dependência externa.
- Catálogo: importação/versionamento, divergências e status de exposição; não editar preço de forma dispersa.
- Contratos: template, preview, parâmetros, revisão, aprovação e versão.
- Regras jurídicas: navegação por país, versão, fontes e fila de revisão.
- Central de jobs: varreduras, erros, reprocessamento seguro e revisão de achados.

---

## 9. Requisitos não funcionais

### 9.1 Segurança

- RLS testado automaticamente em CI com perfis cliente A, cliente B e Admin.
- MFA obrigatório para Admin antes de go-live produtivo.
- Rate limiting para Magic Link, endpoints públicos e webhooks.
- CSP, headers de segurança e proteção contra XSS/CSRF conforme framework.
- Backups, plano de restauração e exercício de restore antes de produção.
- Retenção/eliminação de dados compatível com consentimento, contrato e obrigações aplicáveis.

### 9.2 Qualidade e observabilidade

- CI bloqueia merge com lint, typecheck, testes de domínio, testes de RLS e build dos dois apps.
- Preview deployment por pull request; produção somente por merge aprovado.
- Feature flags por módulo/caso: `client_tree`, `contracts_v2`, `whatsapp_notifications`, `eligibility_simulator`, `catalog_offers`.
- Logs estruturados por `request_id`, `case_id` pseudonimizado quando possível, função e status; sem segredos/PII em texto livre.
- Alertas: erros de Edge Functions, falha de webhook, job parado, SLA violado, tentativa RLS negada em volume anormal e custo/limite de IA.

### 9.3 Desempenho

- Meta inicial: páginas críticas do App com carregamento percebido rápido em mobile; listas paginadas; árvore carregada sob demanda.
- Índices em `cases(client_account_id)`, `case_milestones(case_id, due_at)`, `document_records(case_id, status)`, `notifications(recipient_profile_id, status)`, `sla_records(case_id, status)` e FKs de CRM.
- Jobs longos assíncronos; Edge Functions não devem depender de processamento extenso síncrono.

---

## 10. Cronograma de 30 dias

| Semana/Fase | Objetivo | Entregáveis | Critérios de saída |
|---|---|---|---|
| **Fase 1 — Estabilização de Dados** | Consolidar identidade, fonte de verdade, IDs, schema e RLS | monorepo; ambientes Supabase; migrations base; matriz de fontes; catálogo importável; testes RLS; mapeamento de IDs | cliente A não lê cliente B; Admin acessa Desk; dados de piloto migrados com reconciliação e rollback documentado |
| **Fase 2 — Correções UI/UX** | Separar aplicativos, corrigir navegação e implantar views sanitizadas | App Cliente em Vercel preview; Desk privado; design system; telas críticas; flags por caso | fluxos login→jornada→documentos e Desk→caso→SLA funcionam com dados fictícios e piloto sem regressão |
| **Fase 3 — IA e WhatsApp** | Integrar APIs exclusivamente server-side e habilitar fluxos aprováveis | Edge Functions; logs; idempotência; sandbox WhatsApp; IA com rulesets; central de jobs | nenhum segredo no browser; webhook validado; mensagens e resultados passam por gate Admin; reprocessamento não duplica |
| **Fase 4 — Homologação e Carga** | Testar segurança, desempenho, operação e reversão | roteiro UAT; testes de carga 50–100 usuários; pentest básico; runbooks; backup/restore; go/no-go | zero falha crítica RLS; métricas aceitas; incident runbook testado; backlog classificado e plano pós-piloto aprovado |

### 10.1 Sequenciamento semanal detalhado

**Dias 1–7 — Fase 1**

- Congelar uma baseline do export Lovable no GitHub, com tag `lovable-baseline-YYYYMMDD`.
- Criar ADRs: divisão App/Desk, fonte de verdade, autenticação, RLS, segredo e catálogo.
- Criar Supabase `staging` e `production` na região São Paulo; não migrar produção sem backup/export e plano de rollback.
- Implementar modelos de `profiles`, `client_accounts`, `client_access`, `cases`, catálogo, documentos, SLA e auditoria.
- Resolver/registrar canonicidade de IDs; mapear identificadores legados em tabela de crosswalk, sem apagamento.
- Executar testes RLS iniciais com dois clientes fictícios e um Admin.

**Dias 8–14 — Fase 2**

- Extrair componentes reaproveitáveis e remover dependências de UI que contenham regra sensível.
- Configurar dois projetos Vercel: App Cliente e Desk; previews isolados.
- Implementar clientes de API tipados e views sanitizadas.
- Corrigir estados vazios, loading, erros, navegação mobile e acessibilidade de fluxos críticos.
- Aplicar feature flags por módulo e por caso piloto.

**Dias 15–21 — Fase 3**

- Criar adaptadores e mocks para Claude, WhatsApp, Drive, Canva e Asaas.
- Implementar funções de integração com validação, assinatura e idempotência.
- Adicionar fila de aprovação para contratos, achados e mensagens.
- Cadastrar estrutura de rulesets jurídicos; importar somente regras previamente revisadas.
- Instrumentar observabilidade e limites de custo/uso de IA.

**Dias 22–30 — Fase 4**

- UAT com casos piloto selecionados e dados anonimizados para cenários de falha.
- Testar RLS, autorização Storage, Magic Link, expiração de sessão, webhooks repetidos e falha de provedor.
- Simular carga de 50–100 usuários autenticados e jobs assíncronos com dados sintéticos.
- Executar restore de backup em staging e validar consistência.
- Realizar revisão de go/no-go; promover somente módulos que cumprirem requisitos.

---

## 11. Critérios de go/no-go

### Go parcial permitido

- App Cliente com Magic Link e RLS testado para casos piloto autorizados.
- Desk exclusivo para Admin com MFA/controle de acesso aplicado.
- Catálogo apenas em leitura, com SKUs não reconciliados ocultos.
- Documentos somente aprovados e explicitamente visíveis ao cliente.

### No-go automático

- `service_role` presente no browser, código Lovable publicado ou repositório.
- Tabela pública sem RLS/policy compatível.
- Cliente consegue inferir, ler ou alterar caso de outro cliente.
- Notificação WhatsApp ou contrato disparado sem gate de aprovação e idempotência.
- SKU/preço/link divergente sendo exposto como venda autorizada.
- Resultado de IA jurídica publicado sem revisão humana, versão de regra e fonte.
- Sem backup/restauração testada ou sem registro de auditoria para ações críticas.

---

## 12. Backlog inicial classificado

### P0 — antes de qualquer ampliação do piloto

- [ ] Criar monorepo, tag de baseline Lovable e pipeline CI.
- [ ] Separar App Cliente/Desk em projetos Vercel distintos.
- [ ] Criar staging/production isolados no Supabase São Paulo.
- [ ] Implementar RLS e testes multi-tenant.
- [ ] Definir ID canônico de caso e tabela de mapeamento legado.
- [ ] Criar catálogo versionado e bloquear exposição de SKU não homologado.
- [ ] Criar logs de auditoria, tratamento de webhook e idempotência.
- [ ] Revisar chaves e remover todos os segredos do front-end/histórico Git.

### P1 — durante o mês

- [ ] Views sanitizadas do App Cliente.
- [ ] SLA operacional e alertas de vencimento.
- [ ] Contratos versionados com gate Admin.
- [ ] Jobs de varredura e fila de revisão de achados.
- [ ] Integração sandbox de WhatsApp e eventos de Asaas.
- [ ] Rulesets iniciais dos oito países, com versão e fontes.

### P2 — pós-estabilização

- [ ] Permissões de equipe além de Admin.
- [ ] Sincronização documentada Drive/Canva com permissões granulares.
- [ ] Automação de proposta/contrato somente após homologação jurídica e comercial.
- [ ] Dashboards avançados de conversão, microentregas, custos e LTV.

---

## 13. Especificação para Claude Code

### 13.1 Regras de execução local

- Trabalhar exclusivamente em branch por tarefa (`feat/`, `fix/`, `chore/`).
- Nunca sobrescrever a baseline Lovable; manter diffs pequenos, revisáveis e reversíveis.
- Nunca imprimir, criar ou alterar variáveis reais de produção em arquivos, commits ou logs.
- Usar `.env.example` com placeholders; `.env.local` fica fora do Git.
- Não executar migration em produção sem revisão humana, backup e confirmação explícita.
- Qualquer mudança em RLS, autenticação, contrato, cobrança, notificação ou ruleset jurídico exige testes e ADR/diff explicativo.
- APIs externas devem começar em mock/sandbox e feature flag desligada.

### 13.2 Preparação do repositório

```bash
# 1) Clonar e criar baseline imutável do material exportado do Lovable
git clone <URL_DO_REPOSITORIO_GITHUB> clube-ancestral
cd clube-ancestral
git checkout -b chore/enterprise-baseline
git add .
git commit -m "chore: snapshot baseline exportado do Lovable"
git tag lovable-baseline-$(date +%Y%m%d)
git push origin chore/enterprise-baseline --tags

# 2) Criar branch de integração arquitetural
git checkout main
git pull --ff-only
git checkout -b feat/enterprise-foundation

# 3) Instalar dependências conforme o package manager existente
corepack enable
pnpm install --frozen-lockfile || npm ci

# 4) Criar contrato seguro de variáveis sem valores reais
cp .env.example .env.local
printf "\n# Nunca preencher ou commitar secrets reais.\n" >> .env.local

# 5) Inspecionar a estrutura antes de alterar código
find . -maxdepth 3 -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  | sort | sed -n '1,400p'
```

### 13.3 Prompt mestre para Claude Code

```text
Você atua como Staff Software Engineer e Security Engineer no projeto Clube Ancestral.

Leia integralmente o arquivo CLUBE_ANCESTRAL_ENTERPRISE_PRD.md antes de propor mudanças. O sistema está em PILOTO e precisa continuar funcional durante toda alteração.

Objetivo: migrar progressivamente o export Lovable para uma arquitetura modular em Vercel + Supabase, sem quebrar fluxos existentes e sem introduzir segredos no cliente.

Restrições inegociáveis:
1. Não altere arquivos de ambiente reais, não exponha tokens e não use SUPABASE_SERVICE_ROLE_KEY no browser.
2. Não remova funcionalidades existentes sem inventário, plano de migração e feature flag/rollback.
3. App Cliente e Desk devem permanecer isolados; nenhum bundle do cliente pode importar código administrativo ou segredos.
4. Toda tabela Supabase exposta deve ter RLS e testes que provem isolamento Cliente A vs Cliente B.
5. Operações de contrato, WhatsApp, Asaas, Drive, Canva ou IA devem ser server-side, idempotentes e auditáveis. Ações externas começam mockadas ou desabilitadas por flag.
6. IA e regras de cidadania apenas apoiam revisão humana; não publique decisão jurídica automática.
7. Marque artefatos em ajuste com [PILOTO - EM AJUSTE].

Primeiro, sem editar arquivos:
- gere um inventário das rotas, componentes, fontes de dados, variáveis de ambiente, chamadas externas e riscos de segurança;
- compare-o com o PRD;
- apresente uma matriz: Arquivo | Função atual | Risco | Mudança mínima | Teste | Rollback;
- aguarde instrução para aplicar alterações.
```

### 13.4 Prompt de diagnóstico do export Lovable

```text
Analise o código atual exportado do Lovable em modo somente leitura. Localize:
- rotas/telas do App Cliente e possíveis telas administrativas;
- uso de Supabase, autenticação, tabelas, Storage e Realtime;
- variáveis VITE_/NEXT_PUBLIC_ e qualquer possível segredo exposto;
- chamadas diretas a APIs de terceiros;
- lógica de acesso por usuário, case_id e cliente;
- componentes que misturam UI, regra de negócio e acesso a dados;
- dependências duplicadas, código morto e falhas de UX críticas.

Entregue um relatório em Markdown em docs/AUDIT_LOVABLE_BASELINE.md. Não faça mudanças ainda. Classifique cada achado em P0/P1/P2, indique o risco de RLS/PII e associe ao requisito correspondente do PRD.
```

### 13.5 Prompt para fundação Supabase/RLS

```text
Implemente somente a fundação de dados e autorização descrita no PRD.

Tarefas:
1. Crie migrations incrementais em supabase/migrations, sem editar migrations já aplicadas.
2. Inclua schemas, enums, profiles, client_accounts, client_access, cases, document_records, case_milestones, sla_records, audit_logs e os helpers is_admin/can_access_case.
3. Habilite RLS em todas as tabelas expostas e adicione policies de negação por padrão.
4. Crie views sanitizadas para o App Cliente; não conceda acesso direto a tabelas internas.
5. Crie testes automatizados com Admin, Cliente A e Cliente B provando que A não acessa casos, documentos, marcos nem notificações de B.
6. Inclua seed fictício e sanitizado, sem PII real.

Antes de aplicar, mostre o plano e os arquivos que serão criados. Depois de aplicar, execute lint/typecheck/testes disponíveis e reporte o resultado, incluindo como fazer rollback.
```

### 13.6 Prompt para separação Vercel e UI

```text
Refatore gradualmente o front-end para dois aplicativos independentes: apps/client-app e apps/desk-admin.

Requisitos:
- Preserve rotas e comportamentos existentes quando possível.
- Mova componentes sem dados sensíveis para packages/ui.
- Mova tipos, validadores e regras puras para packages/domain.
- O App Cliente deve consumir somente views/RPCs sanitizadas; o Desk pode consumir APIs administrativas autenticadas.
- Não inclua service role, tokens ou lógica de integração externa nos bundles.
- Adicione feature flags para módulos ainda [PILOTO - EM AJUSTE].
- Crie READMEs com comandos de desenvolvimento, build, preview e deploy Vercel.

Entregue mudanças em commits lógicos e uma tabela de compatibilidade/rollback por rota afetada.
```

### 13.7 Prompt para Edge Functions e integrações mockadas

```text
Implemente um esqueleto seguro de Edge Functions para Claude, WhatsApp, Google Drive, Canva e Asaas.

Para cada integração:
- use secrets somente no ambiente server-side;
- valide autenticação/assinatura, payload e autorização;
- implemente idempotency_key e integração_events;
- registre logs redigidos, request_id e falhas sem PII;
- use adapter interface e provider mock por padrão;
- mantenha envio externo desligado por feature flag;
- não crie contratos, não envie mensagens e não altere cobranças reais.

Inclua testes unitários dos adaptadores e um RUNBOOK de configuração por ambiente, com placeholders para secrets.
```

### 13.8 Prompt para ciclo iterativo diário

```text
Leia CLUBE_ANCESTRAL_ENTERPRISE_PRD.md e o estado atual do repositório. Escolha apenas a próxima tarefa P0/P1 de menor risco ainda não concluída.

Antes de editar, responda com:
1. objetivo e requisito do PRD;
2. arquivos afetados;
3. risco para o piloto;
4. estratégia de feature flag/rollback;
5. testes a executar.

Após aprovação, implemente a mudança mínima, execute testes e produza:
- resumo do diff;
- resultado dos testes;
- riscos remanescentes;
- atualização sugerida do backlog e do PRD, sem apagar histórico.

Não realize deploy produtivo nem mutações externas.
```

### 13.9 Comandos de validação sugeridos

```bash
# Qualidade do front-end
pnpm lint || npm run lint
pnpm typecheck || npm run typecheck
pnpm test || npm test
pnpm build || npm run build

# Revisão de segurança simples
rg -n "SUPABASE_SERVICE_ROLE|CLAUDE_API_KEY|WHATSAPP|ASAAS|GOOGLE.*SECRET|CANVA.*SECRET" \
  --glob '!node_modules/**' --glob '!*.lock' .

# Conferir variáveis públicas suspeitas
rg -n "(VITE_|NEXT_PUBLIC_).*(SECRET|TOKEN|SERVICE|KEY)" \
  --glob '!node_modules/**' --glob '!*.lock' .

# Conferir migrations e policies
find supabase/migrations -type f -name '*.sql' -print | sort
rg -n "enable row level security|create policy|service_role|security definer" supabase

# Exemplo de rotina de git segura
git status
git diff --check
git diff --stat
git add <ARQUIVOS_REVISADOS>
git commit -m "feat(scope): descrição curta e reversível"
```

---

## 14. Governança de mudança

Toda alteração do PRD deve registrar:

- data, autora/or e motivação;
- seção afetada;
- mudança de estado (por exemplo, `[PILOTO - EM AJUSTE]` → `ESTÁVEL`);
- dependências e impacto nos dados/RLS;
- estratégia de migração, rollback e testes;
- decisão humana requerida, quando houver.

### Changelog inicial

| Data | Versão | Mudança |
|---|---|---|
| 18/08/2026 | 0.1 | Criação do diagnóstico consolidado para migração progressiva Lovable → GitHub/Vercel/Supabase e estabilização do piloto |

---

## 15. Definição de pronto para produção

Uma versão de módulo pode ser promovida de `[PILOTO - EM AJUSTE]` para `ESTÁVEL` somente quando:

1. Possui owner, requisitos documentados, testes e runbook.
2. Não expõe segredo, PII indevida ou dados cross-tenant.
3. Passa nos testes de RLS, integração e regressão aplicáveis.
4. Possui logs, tratamento de erro e rollback conhecido.
5. Fluxos externos têm idempotência, validação de webhook e aprovação humana quando cabível.
6. A Admin homologou o fluxo com cenário normal, falha e reversão.
7. O change log do PRD e a documentação técnica foram atualizados.

> A prioridade do mês é transformar o protótipo em uma base confiável: dados coerentes, isolamento por cliente, segredos fora do front-end, integrações controladas e evolução sem interrupção do piloto.
