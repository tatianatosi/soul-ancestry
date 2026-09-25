-- Motor de Triagem AncestralScan → CRM Vivo/Mesa Discovery → Planejador
-- (P10, 25/09/2026). Autorização explícita da Proprietária.
--
-- "AncestralScan" não existe como código neste repositório — é a
-- ferramenta pública do site institucional, fora deste app. Esta tabela é
-- o destino de uma IMPORTAÇÃO MANUAL (staff), nunca um endpoint público
-- não autenticado: mesmo padrão da importação Placego por CSV (seção 4 do
-- CA-DECISOES-CANONICAS) — sem API/webhook contínuo antes de decisão
-- própria. Registro aditivo e versionado: não confirma elegibilidade, via,
-- produto, preço, contrato ou acesso ao App.
create table if not exists public.ancestralscan_triagens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  versao_scan text not null,
  origem_campanha text,
  respondido_em timestamptz not null,
  -- mesmo vocabulário de leads.consentimento_status — nunca inventado à parte.
  consentimento_status text not null default 'nao_solicitado'
    check (consentimento_status in ('nao_solicitado', 'pendente', 'concedido', 'recusado')),
  consentimento_versao_aviso text,
  consentimento_em timestamptz,
  paises_declarados text[] not null default '{}',
  geracao_declarada text,
  localidade_ascendente_declarada text,
  documentos_declarados text[] not null default '{}',
  -- resposta pública bruta, versionada — nunca lida como decisão interna.
  respostas_publicas jsonb not null default '{}',
  alertas_publicos text[] not null default '{}',
  -- scores do Scan, sempre separados de qualquer campo de decisão interna.
  scores_orientativos jsonb not null default '{}',
  -- preenchido só quando um humano decide criar/vincular um Lead (Camada B).
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

grant select, insert, update on public.ancestralscan_triagens to authenticated;
grant all on public.ancestralscan_triagens to service_role;
alter table public.ancestralscan_triagens enable row level security;
create policy ancestralscan_triagens_sel on public.ancestralscan_triagens
  for select to authenticated using (is_org_member(organization_id));
create policy ancestralscan_triagens_ins on public.ancestralscan_triagens
  for insert to authenticated with check (can_write(organization_id));
create policy ancestralscan_triagens_upd on public.ancestralscan_triagens
  for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

comment on table public.ancestralscan_triagens is
  'Resposta declarada e orientativa do AncestralScan público, importada manualmente por staff. Não confirma elegibilidade/via/produto. Vira Lead só por ação humana explícita (Camada B).';

-- Camada B: referência do lead à triagem que o originou (nullable — a
-- maioria dos leads não vem do Scan). Sem duplicar os campos da triagem no
-- lead: o lead grava só os campos comerciais/canônicos aceitos.
alter table public.leads
  add column if not exists scan_triagem_id uuid references public.ancestralscan_triagens(id) on delete set null;

comment on column public.leads.scan_triagem_id is
  'P10 (25/09/2026) — referência à triagem AncestralScan de origem, quando o lead foi criado a partir de uma (Camada B). Null para todo lead de outra origem.';
