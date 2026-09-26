-- P15 (26/09/2026) — "Prompt Canônico — Planejador Universal Multipaís,
-- Produtos-Pai, Jornada, Catálogo-Alimento e Preços Resgatados", regras 5 e
-- "MÚLTIPLOS PAÍSES E RAMOS" (incremental_scope): construção real das duas
-- únicas entidades do MODELO DE DADOS que, verificadas contra o schema real,
-- não existiam sob nenhum outro nome — nem como duplicata a evitar.
--
-- As demais 6 entidades listadas no prompt (family_case, family_branch,
-- research_base, nationality_track, case_commercial_condition, microdelivery)
-- já existem, ao vivo e populadas, sob nomes reais decididos em datas
-- anteriores (case_plans+crm_casos, lineage_paths, research_cases,
-- citizenship_tracks, commercial_conditions+case_services,
-- client_deliverables — ver docs/arquitetura/2026-09-26_P15-...md para o
-- de-para completo). Recriá-las com os nomes literais do prompt duplicaria
-- estrutura viva com dado real de caso (Ana Luiza) — proibido pelo AGENTS.md
-- sem decisão explícita da Proprietária, que este corte não presume.

-- ============================================================
-- legacy_catalog_import — proveniência dos valores já resgatados
-- ============================================================
create table if not exists public.legacy_catalog_import (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  source_artifact text not null,
  source_version text,
  source_line text,
  legacy_sku text not null,
  legacy_name text,
  legacy_price numeric,
  legacy_link text,
  imported_at timestamptz not null default now(),
  integrity_hash text not null,
  reconciliation_status text not null default 'pendente_reconciliacao'
    check (reconciliation_status in ('pendente_reconciliacao','reconciliado_com_price_catalog','divergente_bloqueado','nao_aplicavel_catalogo','arquivado')),
  price_catalog_rescued_id uuid references public.price_catalog_rescued(id),
  created_at timestamptz not null default now(),
  created_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

alter table public.legacy_catalog_import enable row level security;

grant select, insert, update on public.legacy_catalog_import to authenticated;
grant all on public.legacy_catalog_import to service_role;

drop policy if exists legacy_catalog_import_sel on public.legacy_catalog_import;
create policy legacy_catalog_import_sel on public.legacy_catalog_import
  for select to authenticated using (is_org_member(organization_id));

drop policy if exists legacy_catalog_import_ins on public.legacy_catalog_import;
create policy legacy_catalog_import_ins on public.legacy_catalog_import
  for insert to authenticated with check (can_write(organization_id));

drop policy if exists legacy_catalog_import_upd on public.legacy_catalog_import;
create policy legacy_catalog_import_upd on public.legacy_catalog_import
  for update to authenticated using (can_write(organization_id));

comment on table public.legacy_catalog_import is 'Snapshot de origem dos valores resgatados em price_catalog_rescued (P15, 26/09/2026) — camada de proveniência/inventário pedida pela regra 5 do prompt canônico. Nunca consultada em runtime por proposta/preço/cobrança; só auditoria/rastreio.';

-- Popula 1:1 a partir de price_catalog_rescued (já existente e já conferido
-- linha a linha nas rodadas de 04/09 e 09/09) — nenhum valor novo, só a
-- camada de proveniência que faltava. integrity_hash é um hash reproduzível
-- do conteúdo já gravado (não uma prova de origem do arquivo original, que
-- este agente nunca leu diretamente — nenhuma linha/hash de arquivo é
-- fabricada).
insert into public.legacy_catalog_import
  (organization_id, source_artifact, source_version, legacy_sku, legacy_name, legacy_price, integrity_hash, reconciliation_status, price_catalog_rescued_id)
select
  p.organization_id,
  case when p.source_type = 'proposta_canva' then 'Proposta Canva/Blueprint — condição particular de caso'
       else 'planejador-universal-simulador-todas-cidadanias.xlsx / planejador-financeiro-universal-clube-ancestral.xlsx (transcritos no Prompt Canônico v2.1)' end,
  case when p.source_reference ilike '%v2.1%' then 'v2.1' else null end,
  coalesce(p.item_id, 'MATRIZ-' || coalesce(p.country_code, 'GERAL') || '-' || upper(p.price_component)),
  coalesce(p.item_id, 'Referência de matriz — ' || coalesce(p.country_code, 'geral') || ' / ' || p.price_component),
  p.amount,
  md5(coalesce(p.item_id,'') || '|' || coalesce(p.country_code,'') || '|' || p.price_component || '|' || coalesce(p.amount::text,'') || '|' || p.source_reference),
  case p.price_status
    when 'DIVERGENTE' then 'divergente_bloqueado'
    when 'CONDICAO_PARTICULAR_DE_CASO' then 'nao_aplicavel_catalogo'
    when 'ARQUIVADO' then 'arquivado'
    else 'pendente_reconciliacao'
  end,
  p.id
from public.price_catalog_rescued p
where not exists (
  select 1 from public.legacy_catalog_import l where l.price_catalog_rescued_id = p.id
);

-- ============================================================
-- incremental_scope — esforço incremental de país/ramo, dependente de aprovação
-- ============================================================
create table if not exists public.incremental_scope (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  track_id uuid not null references public.citizenship_tracks(id),
  item_id text not null,
  incremental_reason text not null,
  quantity integer not null default 1 check (quantity > 0),
  reference_price_id uuid references public.price_catalog_rescued(id),
  approval_status text not null default 'pendente_aprovacao'
    check (approval_status in ('pendente_aprovacao','aprovado','rejeitado','arquivado')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

alter table public.incremental_scope enable row level security;

grant select, insert, update on public.incremental_scope to authenticated;
grant all on public.incremental_scope to service_role;

drop policy if exists incremental_scope_sel on public.incremental_scope;
create policy incremental_scope_sel on public.incremental_scope
  for select to authenticated using (is_org_member(organization_id));

drop policy if exists incremental_scope_ins on public.incremental_scope;
create policy incremental_scope_ins on public.incremental_scope
  for insert to authenticated with check (can_write(organization_id));

drop policy if exists incremental_scope_upd on public.incremental_scope;
create policy incremental_scope_upd on public.incremental_scope
  for update to authenticated using (can_write(organization_id));

comment on table public.incremental_scope is 'Esforço incremental de país/ramo específico dentro de um caso multipaís (P15, 26/09/2026) — nunca cobra a base de pesquisa compartilhada de novo; sempre pendente_aprovacao até decisão humana. Sem linhas ainda: nenhum caso real multi-trilha existe hoje (Ana Luiza é trilha única) — estrutura pronta para o próximo caso multipaís real, não fabricada com dado de exemplo.';
