-- Unificação de pessoa (autorizada pela proprietária em 06/09/2026): liga
-- genealogical_person_profiles a clientes, a única das 3 fontes de pessoa
-- do caso (contract_parties, nucleo_membros, genealogical_person_profiles)
-- que ainda não tinha esse vínculo. Reaproveita a entidade existente
-- (clientes) em vez de criar uma nova tabela case_participants, seguindo a
-- própria regra do documento de origem: "reaproveitar entidades existentes
-- antes de criar novas".
--
-- Coluna nullable e aditiva: nenhuma linha existente é alterada em valor,
-- nenhuma tabela é apagada ou renomeada.

alter table public.genealogical_person_profiles
  add column if not exists client_id uuid references public.clientes(id);

create index if not exists idx_genealogical_person_profiles_client_id
  on public.genealogical_person_profiles (client_id);

comment on column public.genealogical_person_profiles.client_id is
  'Vínculo com o cadastro canônico de pessoa (clientes). Backfill por caso, nunca inferido automaticamente entre organizações.';
