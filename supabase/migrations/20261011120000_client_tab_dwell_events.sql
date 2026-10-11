-- Telemetria de permanência nas abas do App Cliente (11/10/2026).
--
-- Não existia nenhuma tabela de telemetria de UI no schema — `client_access_events`
-- é outra coisa (eventos de acesso/autenticação, enum fechado `portal_event_type`).
-- Esta tabela é nova e aditiva, no mesmo padrão de RLS de `client_access_events`:
-- o próprio titular autenticado no portal grava o evento (sem admin/service role),
-- a equipe interna só lê, e nada é apagado.
--
-- "tab" usa os nomes reais das 7 abas vigentes (`GRUPOS`/`nav` em
-- src/components/portal/portal-shell.tsx) — nenhum nome hipotético.
create table if not exists public.client_tab_dwell_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_portal_access_id uuid not null references public.client_portal_access(id) on delete cascade,
  case_id uuid references public.crm_casos(id),
  tab text not null check (tab in ('home','jornada','radar','arvore','documentos','legado','conta')),
  duracao_ms integer not null check (duracao_ms >= 0 and duracao_ms <= 86400000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists client_tab_dwell_events_acesso_idx
  on public.client_tab_dwell_events (client_portal_access_id, occurred_at desc);
create index if not exists client_tab_dwell_events_tab_idx
  on public.client_tab_dwell_events (tab, occurred_at desc);

grant select, insert on public.client_tab_dwell_events to authenticated;
grant all on public.client_tab_dwell_events to service_role;
alter table public.client_tab_dwell_events enable row level security;

-- Equipe interna lê; o titular autenticado só grava o próprio evento, no
-- próprio acesso e na própria organização — nunca em nome de outro membro
-- do núcleo (mesmo princípio de privilégio mínimo de portal_meu_acesso()).
create policy "ctde_select_member" on public.client_tab_dwell_events for select to authenticated
  using (public.is_org_member(organization_id));
create policy "ctde_insert_self" on public.client_tab_dwell_events for insert to authenticated
  with check (
    client_portal_access_id = public.portal_meu_acesso()
    and organization_id = public.portal_minha_org()
  );

create trigger no_delete_ctde before delete on public.client_tab_dwell_events
  for each row execute function public.fn_block_delete();

comment on table public.client_tab_dwell_events is
  'Telemetria de permanência do titular autenticado nas abas do App Cliente (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta). Gravada pelo próprio cliente via RLS, nunca por admin/service role; equipe interna só lê.';
