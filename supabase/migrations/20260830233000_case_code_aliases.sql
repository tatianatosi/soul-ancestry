-- 30/08/2026 — Fase 1 da Política Unificada de Casos Familiares
-- (docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md, seção 3).
--
-- Cria só a tabela de aliases de código de caso, pedida explicitamente no
-- documento para permitir reconciliar duplicidades de case_code (ex.:
-- CA-CID-AT-FAM-2026-001 / CA-AUT-ANALUIZA-FAM-2026-001) SEM apagar dado
-- nem criar caso novo: o código antigo continua encontrável como alias
-- depois de qualquer reconciliação.
--
-- Esta migration é aditiva e não decide qual case_id é o canônico em
-- nenhum caso real — isso depende da matriz de reconciliação (Fase 1 do
-- documento) ainda pendente de acesso real ao Supabase desta sessão.
-- Nenhuma linha é inserida aqui.

create table public.case_code_aliases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  case_id uuid not null references public.crm_casos(id),
  alias_code text not null,
  alias_type text not null default 'legacy',
  valid_from timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  unique (organization_id, alias_code)
);

grant select, insert on public.case_code_aliases to authenticated;
grant all on public.case_code_aliases to service_role;

alter table public.case_code_aliases enable row level security;

create policy cca_select on public.case_code_aliases
  for select to authenticated
  using (public.is_org_member(organization_id));

create policy cca_insert on public.case_code_aliases
  for insert to authenticated
  with check (public.can_write(organization_id));

-- Sem policy de update/delete: um alias registrado é histórico de migração,
-- não é editado nem removido — mesma regra de "nada é apagado fisicamente"
-- aplicada ao resto do produto.
