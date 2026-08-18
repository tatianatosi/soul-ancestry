
-- 1) Núcleo familiar
create table if not exists public.nucleos_familiares (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  case_id uuid references public.crm_casos(id) on delete restrict,
  nome text not null,
  descricao text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

create table if not exists public.nucleo_membros (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  nucleo_id uuid not null references public.nucleos_familiares(id) on delete restrict,
  cliente_id uuid references public.clientes(id) on delete restrict,
  nome text not null,
  papel text not null check (papel in ('contratante_signatario','dependente')),
  vinculo text,
  processo text,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

create unique index if not exists nucleo_membros_unico on public.nucleo_membros (nucleo_id, lower(nome));
create unique index if not exists nucleos_familiares_caso_unico on public.nucleos_familiares (case_id) where archived_at is null;

grant select, insert, update on public.nucleos_familiares to authenticated;
grant select, insert, update on public.nucleo_membros to authenticated;
grant all on public.nucleos_familiares to service_role;
grant all on public.nucleo_membros to service_role;

alter table public.nucleos_familiares enable row level security;
alter table public.nucleo_membros enable row level security;

drop policy if exists nucleos_sel on public.nucleos_familiares;
create policy nucleos_sel on public.nucleos_familiares for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists nucleos_ins on public.nucleos_familiares;
create policy nucleos_ins on public.nucleos_familiares for insert to authenticated with check (public.can_write(organization_id));
drop policy if exists nucleos_upd on public.nucleos_familiares;
create policy nucleos_upd on public.nucleos_familiares for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

drop policy if exists nucleo_membros_sel on public.nucleo_membros;
create policy nucleo_membros_sel on public.nucleo_membros for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists nucleo_membros_ins on public.nucleo_membros;
create policy nucleo_membros_ins on public.nucleo_membros for insert to authenticated with check (public.can_write(organization_id));
drop policy if exists nucleo_membros_upd on public.nucleo_membros;
create policy nucleo_membros_upd on public.nucleo_membros for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

drop trigger if exists trg_nucleos_block_delete on public.nucleos_familiares;
create trigger trg_nucleos_block_delete before delete on public.nucleos_familiares for each row execute function public.fn_block_delete();
drop trigger if exists trg_nucleo_membros_block_delete on public.nucleo_membros;
create trigger trg_nucleo_membros_block_delete before delete on public.nucleo_membros for each row execute function public.fn_block_delete();

-- 2) CRM: três registros individuais
insert into public.clientes (id, organization_id, nome, email, telefone, documento, pais_interesse, status, origem, observacoes, demo)
select 'a11a0000-0000-4000-8000-000000000003'::uuid, '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
       'Adair Pinto Silveira Júnior', 'adair@apsrepresentacoes.com.br', '(62) 99134-5298',
       'CPF 774.227.321-72', 'Áustria', 'pre_onboarding', 'planejador',
       'Adulto contratante/signatário do núcleo familiar Silveira / Friedmann-Reimer.', false
where not exists (select 1 from public.clientes where lower(nome) = lower('Adair Pinto Silveira Júnior'));

insert into public.clientes (id, organization_id, nome, email, telefone, documento, pais_interesse, status, origem, observacoes, demo)
select 'a11a0000-0000-4000-8000-000000000004'::uuid, '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
       'Alice Gomes Silveira', 'alicegomessilveira@gmail.com', '(62) 99951-5298',
       null, 'Áustria', 'pre_onboarding', 'planejador',
       'Adulta contratante/signatária do núcleo familiar. Documento de identificação pendente de coleta.', false
where not exists (select 1 from public.clientes where lower(nome) = lower('Alice Gomes Silveira'));

-- 3) Núcleo + membros
insert into public.nucleos_familiares (id, organization_id, case_id, nome, descricao)
select 'a11a0000-0000-4000-8000-0000000000f1'::uuid, '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
       'a11a0000-0000-4000-8000-000000000002'::uuid,
       'Núcleo familiar Silveira / Friedmann-Reimer',
       'Núcleo compartilhado do caso canônico CA-CID-AT-FAM-2026-001 (CA-DEC-2026-08-17-01): um caso familiar, três registros individuais no CRM e um contrato-base familiar.'
where not exists (select 1 from public.nucleos_familiares where case_id = 'a11a0000-0000-4000-8000-000000000002'::uuid);

insert into public.nucleo_membros (organization_id, nucleo_id, cliente_id, nome, papel, vinculo, processo, ordem)
select n.organization_id, n.id, c.id, m.nome, m.papel, m.vinculo, m.processo, m.ordem
from public.nucleos_familiares n
cross join (values
  ('Ana Luiza Gomes Silveira Rodrigues','contratante_signatario','Titular adulta, contratante e signatária','Processo A',1),
  ('Adair Pinto Silveira Júnior','contratante_signatario','Adulto contratante e signatário','Processo B',2),
  ('Alice Gomes Silveira','contratante_signatario','Adulta contratante e signatária','Processo C',3),
  ('Felipe','dependente','Dependente/beneficiário menor vinculado a Ana Luiza; não é cliente nem signatário','Processo A (dependente)',4)
) as m(nome,papel,vinculo,processo,ordem)
left join public.clientes c on lower(c.nome) = lower(m.nome)
where n.case_id = 'a11a0000-0000-4000-8000-000000000002'::uuid
  and not exists (select 1 from public.nucleo_membros x where x.nucleo_id = n.id and lower(x.nome) = lower(m.nome));

-- 4) Contrato-base familiar + partes
insert into public.contracts (id, organization_id, contract_type, title, case_id, client_id, template_id, status, relationship_type, purpose_summary, scope_summary, demo)
select 'a11a0000-0000-4000-8000-0000000000c1'::uuid, '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
       'contract_base', 'Contrato-base familiar — Silveira / Friedmann-Reimer (Áustria)',
       'a11a0000-0000-4000-8000-000000000002'::uuid, 'a11a0000-0000-4000-8000-000000000001'::uuid,
       '01114bbd-3923-44e0-bdf4-e42ca23f859f'::uuid, 'draft', 'independent',
       'Instrumento único do núcleo familiar para assessoria de cidadania austríaca, cobrindo três processos individuais com dossiê-mãe compartilhado.',
       'Escopo familiar com anexos estruturais (ANX-ESCOPO, ANX-PRIVACIDADE, ANX-COMERCIAL) e anexos individuais por signatário.',
       false
where not exists (select 1 from public.contracts where case_id = 'a11a0000-0000-4000-8000-000000000002'::uuid and contract_type = 'contract_base' and archived_at is null);

insert into public.contract_parties (organization_id, contract_id, role, client_id, person_name, document_type, document_number, email, phone, address, relationship_to_case, legal_capacity_status, signature_required, signature_status, display_order)
select k.organization_id, k.id, p.role, cl.id, p.person_name, p.document_type, p.document_number, p.email, p.phone, p.address, p.relationship_to_case, p.legal_capacity_status, p.signature_required, p.signature_status, p.display_order
from public.contracts k
cross join (values
  ('provider', 'Clube Ancestral', null::text, null::text, null::text, null::text, null::text, 'Prestadora do serviço de assessoria', 'adult', true, 'pending', 0),
  ('contracting_client', 'Ana Luiza Gomes Silveira Rodrigues', 'CPF', '037.795.711-96', 'analuizabox@gmail.com', '(62) 98158-4015', 'Rua N 24, Qd. 21, Lt. 21 — Anápolis City, Anápolis/GO, CEP 75094-290', 'Titular do Processo A; contratante e signatária', 'adult', true, 'pending', 1),
  ('co_contractor', 'Adair Pinto Silveira Júnior', 'CPF', '774.227.321-72', 'adair@apsrepresentacoes.com.br', '(62) 99134-5298', 'Rua N 24, Qd. 21, Lt. 20 — Anápolis City, Anápolis/GO', 'Titular do Processo B; contratante e signatário', 'adult', true, 'pending', 2),
  ('co_contractor', 'Alice Gomes Silveira', null, null, 'alicegomessilveira@gmail.com', '(62) 99951-5298', 'Rua N 24, Qd. 21, Lt. 20 — Anápolis City, Anápolis/GO', 'Titular do Processo C; contratante e signatária', 'adult', true, 'pending', 3),
  ('dependent', 'Felipe', null, null, null, null, null, 'Dependente menor vinculado ao Processo A de Ana Luiza; não é cliente nem signatário', 'minor', false, 'not_required', 4)
) as p(role, person_name, document_type, document_number, email, phone, address, relationship_to_case, legal_capacity_status, signature_required, signature_status, display_order)
left join public.clientes cl on lower(cl.nome) = lower(p.person_name)
where k.id = 'a11a0000-0000-4000-8000-0000000000c1'::uuid
  and not exists (select 1 from public.contract_parties x where x.contract_id = k.id and lower(x.person_name) = lower(p.person_name));
