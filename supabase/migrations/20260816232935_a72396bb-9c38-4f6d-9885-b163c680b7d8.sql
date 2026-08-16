-- 1. Campos de controle do piloto no caso
alter table public.crm_casos
  add column if not exists piloto boolean not null default false,
  add column if not exists selo_interno text,
  add column if not exists preparacao_status text,
  add column if not exists ativacao_operacional text,
  add column if not exists aceite_comercial_em date,
  add column if not exists aceite_comercial_registrado_por uuid;

alter table public.crm_casos drop constraint if exists crm_casos_preparacao_chk;
alter table public.crm_casos add constraint crm_casos_preparacao_chk
  check (preparacao_status is null or preparacao_status in ('NO_GO','GO_CONDICIONAL','GO'));
alter table public.crm_casos drop constraint if exists crm_casos_ativacao_op_chk;
alter table public.crm_casos add constraint crm_casos_ativacao_op_chk
  check (ativacao_operacional is null or ativacao_operacional in ('NO_GO','GO_CONDICIONAL','GO'));

-- 2. Conferência de dados do piloto (importação controlada com origem)
create table if not exists public.piloto_conferencia (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  case_id uuid not null references public.crm_casos(id),
  secao text not null,
  campo text not null,
  label text not null,
  obrigatorio boolean not null default true,
  valor text,
  origem text,
  origem_detalhe text,
  verificado boolean not null default false,
  verificado_por uuid,
  verificado_em timestamptz,
  observacao text,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (case_id, campo),
  constraint piloto_conferencia_origem_chk check (
    origem is null or origem in (
      'proposta_aprovada','whatsapp_confirmado','reuniao_transcricao',
      'documento','formulario','preenchimento_humano'
    )
  )
);

grant select, insert, update on public.piloto_conferencia to authenticated;
grant all on public.piloto_conferencia to service_role;
alter table public.piloto_conferencia enable row level security;

create policy "piloto_conferencia_select" on public.piloto_conferencia
  for select to authenticated using (public.is_org_member(organization_id));
create policy "piloto_conferencia_insert" on public.piloto_conferencia
  for insert to authenticated with check (public.can_write(organization_id));
create policy "piloto_conferencia_update" on public.piloto_conferencia
  for update to authenticated using (public.can_write(organization_id))
  with check (public.can_write(organization_id));

-- 3. Bloqueios críticos do piloto
create table if not exists public.piloto_bloqueios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  case_id uuid not null references public.crm_casos(id),
  chave text not null,
  descricao text not null,
  criticidade text not null default 'critico',
  status text not null default 'aberto',
  justificativa text,
  resolvido_por uuid,
  resolvido_em timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (case_id, chave),
  constraint piloto_bloqueios_criticidade_chk check (criticidade in ('critico','alto','medio')),
  constraint piloto_bloqueios_status_chk check (status in ('aberto','resolvido','nao_aplicavel'))
);

grant select, insert, update on public.piloto_bloqueios to authenticated;
grant all on public.piloto_bloqueios to service_role;
alter table public.piloto_bloqueios enable row level security;

create policy "piloto_bloqueios_select" on public.piloto_bloqueios
  for select to authenticated using (public.is_org_member(organization_id));
create policy "piloto_bloqueios_insert" on public.piloto_bloqueios
  for insert to authenticated with check (public.can_write(organization_id));
create policy "piloto_bloqueios_update" on public.piloto_bloqueios
  for update to authenticated using (public.can_write(organization_id))
  with check (public.can_write(organization_id));

-- 4. Guardas de conferência: origem obrigatória, sem placeholder, transcrição não verificada
create or replace function public.fn_piloto_dado_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  NEW.updated_at := now();
  if TG_OP = 'UPDATE' then NEW.updated_by := auth.uid(); end if;

  if NEW.valor is not null and length(trim(NEW.valor)) = 0 then
    NEW.valor := null;
  end if;

  if NEW.valor is not null then
    if NEW.valor ~* '(\[ex\.|\bex\.:|lorem ipsum|preencher|placeholder|xxx|<[^>]*>)' then
      raise exception 'Valor contém texto de exemplo/placeholder. Campos sem dado real devem permanecer vazios como pendência.';
    end if;
    if NEW.origem is null then
      raise exception 'Informe a origem do dado (proposta, WhatsApp, reunião/transcrição, documento, formulário ou preenchimento humano).';
    end if;
    if NEW.origem = 'reuniao_transcricao'
       and (TG_OP = 'INSERT' or NEW.valor is distinct from OLD.valor or NEW.origem is distinct from OLD.origem) then
      NEW.verificado := false;
      NEW.verificado_por := null;
      NEW.verificado_em := null;
    end if;
  else
    NEW.verificado := false;
    NEW.verificado_por := null;
    NEW.verificado_em := null;
  end if;

  if NEW.verificado and not coalesce(OLD.verificado, false) then
    NEW.verificado_por := coalesce(NEW.verificado_por, auth.uid());
    NEW.verificado_em := coalesce(NEW.verificado_em, now());
  end if;

  return NEW;
end $$;

create trigger piloto_conferencia_guard before insert or update on public.piloto_conferencia
  for each row execute function public.fn_piloto_dado_guard();
create trigger piloto_conferencia_audit after insert or update on public.piloto_conferencia
  for each row execute function public.fn_audit();
create trigger piloto_conferencia_no_delete before delete on public.piloto_conferencia
  for each row execute function public.fn_block_delete();

-- 5. Bloqueios: resolução só por admin/operações e com justificativa
create or replace function public.fn_piloto_bloqueio_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  NEW.updated_at := now();
  if TG_OP = 'UPDATE' then NEW.updated_by := auth.uid(); end if;

  if TG_OP = 'UPDATE' and NEW.status <> 'aberto' and OLD.status = 'aberto' then
    if not (public.has_org_role(NEW.organization_id,'admin') or public.has_org_role(NEW.organization_id,'operacoes')) then
      raise exception 'Somente admin ou operações podem resolver bloqueios críticos do piloto.';
    end if;
    if NEW.justificativa is null or length(trim(NEW.justificativa)) < 10 then
      raise exception 'Registre a justificativa da resolução (mínimo 10 caracteres).';
    end if;
    NEW.resolvido_por := coalesce(NEW.resolvido_por, auth.uid());
    NEW.resolvido_em := coalesce(NEW.resolvido_em, now());
  end if;
  return NEW;
end $$;

create trigger piloto_bloqueios_guard before insert or update on public.piloto_bloqueios
  for each row execute function public.fn_piloto_bloqueio_guard();
create trigger piloto_bloqueios_audit after insert or update on public.piloto_bloqueios
  for each row execute function public.fn_audit();
create trigger piloto_bloqueios_no_delete before delete on public.piloto_bloqueios
  for each row execute function public.fn_block_delete();

-- 6. Caso piloto: sem vínculo demo e ativação bloqueada por bloqueios críticos
create or replace function public.fn_piloto_caso_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_abertos text;
begin
  if NEW.piloto then
    if NEW.demo then
      raise exception 'O caso piloto real não pode ser marcado como demonstração.';
    end if;
    if exists (select 1 from public.clientes c where c.id = NEW.cliente_id and c.demo) then
      raise exception 'O caso piloto real não pode ser vinculado a um cliente de demonstração.';
    end if;
    if exists (select 1 from public.organizations o where o.id = NEW.organization_id and o.nome ilike 'DEMO%') then
      raise exception 'O caso piloto real não pode pertencer a uma organização de demonstração.';
    end if;

    if (NEW.ativo and not coalesce(OLD.ativo,false)) or (NEW.status = 'ativo' and coalesce(OLD.status,'') <> 'ativo') then
      select string_agg(b.descricao, '; ') into v_abertos
        from public.piloto_bloqueios b
       where b.case_id = NEW.id and b.status = 'aberto' and b.criticidade = 'critico' and b.archived_at is null;
      if v_abertos is not null then
        raise exception 'Ativação operacional NO_GO. Bloqueios críticos abertos: %', v_abertos;
      end if;
    end if;
  end if;
  return NEW;
end $$;

create trigger piloto_caso_guard before insert or update on public.crm_casos
  for each row execute function public.fn_piloto_caso_guard();

-- 7. Contratos do piloto: apenas MODELO ESTUDO + base genérica v2, assinatura com registro externo
create or replace function public.fn_piloto_contrato_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_piloto boolean; v_code text;
begin
  select coalesce(c.piloto,false) into v_piloto from public.crm_casos c where c.id = NEW.case_id;
  if not coalesce(v_piloto,false) then return NEW; end if;

  select t.code into v_code from public.contract_templates t where t.id = NEW.template_id;
  if v_code is null then
    raise exception 'Contrato do piloto exige um modelo contratual ativo (MODELO ESTUDO ou base genérica v2).';
  end if;
  if v_code in ('MODELO-SIMPLES','MODELO-2024') then
    raise exception 'Modelo % não é aplicável ao piloto real. Use MODELO ESTUDO com a base contratual genérica v2.', v_code;
  end if;
  if v_code not in ('MODELO-ESTUDO','BASE-GEN-V2') then
    raise exception 'Modelo contratual não autorizado para o piloto real.';
  end if;

  if NEW.status = 'signed' and coalesce(OLD.status,'') <> 'signed' then
    if NEW.signed_at is null or NEW.signature_reference is null or NEW.signed_source is null then
      raise exception 'Assinatura exige data, origem externa e referência de assinatura registradas.';
    end if;
    if NEW.approved_for_send_by is null then
      raise exception 'Assinatura exige aprovação humana registrada antes do envio.';
    end if;
    if not exists (
      select 1 from public.contract_parties p
       where p.contract_id = NEW.id and p.archived_at is null
    ) then
      raise exception 'Assinatura exige partes qualificadas registradas no contrato.';
    end if;
  end if;
  return NEW;
end $$;

create trigger piloto_contrato_guard before insert or update on public.contracts
  for each row execute function public.fn_piloto_contrato_guard();

-- 8. Modelos contratuais aplicáveis
insert into public.contract_templates (organization_id, code, name, instrument_type, description, status, template_version, requires_human_review, demo)
values
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','MODELO-ESTUDO','MODELO ESTUDO','contract_base','Versão contratual ativa para estudo de viabilidade e pesquisa genealógica.','active',1,true,false),
  ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','BASE-GEN-V2','Base contratual genérica v2','contract_base','Base contratual genérica v2, aplicável em conjunto com o MODELO ESTUDO.','active',2,true,false)
on conflict do nothing;

-- 9. Cliente e caso canônico do piloto (dados reais mínimos; o restante fica pendente)
insert into public.clientes (id, organization_id, nome, status, pais_interesse, origem, demo, observacoes)
values ('a11a0000-0000-4000-8000-000000000001','11f32aae-ea08-47e0-8114-f5d8a900c9a1','Ana Luiza','pre_onboarding',null,'proposta_aprovada',false,
        'PILOTO REAL — DADOS REAIS — ACESSO RESTRITO. Demais dados cadastrais permanecem pendentes de conferência.')
on conflict (id) do nothing;

insert into public.crm_casos (
  id, organization_id, cliente_id, codigo, titulo, status, fase, prioridade,
  demo, piloto, selo_interno, preparacao_status, ativacao_operacional,
  aceite_comercial_em, ativo, app_access_status, info_cliente_liberada, resumo
) values (
  'a11a0000-0000-4000-8000-000000000002','11f32aae-ea08-47e0-8114-f5d8a900c9a1','a11a0000-0000-4000-8000-000000000001',
  'CA-2026-ANA-001','Projeto familiar — Ana Luiza (piloto real)','rascunho','preparacao','alta',
  false, true,'PILOTO REAL — DADOS REAIS — ACESSO RESTRITO','GO_CONDICIONAL','NO_GO',
  date '2026-08-14', false,'bloqueado', false,
  'Piloto real. Dados carregados somente com origem registrada; campos sem dado real permanecem pendentes.'
) on conflict (id) do nothing;

-- 10. Catálogo de conferência (todos vazios = pendência)
insert into public.piloto_conferencia (organization_id, case_id, secao, campo, label, obrigatorio)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1','a11a0000-0000-4000-8000-000000000002', s, c, l, o
from (values
  ('Identificação','nome_completo_cliente','Nome completo do cliente principal',true),
  ('Identificação','documento_identificacao','Documento de identificação',true),
  ('Identificação','contato_principal','Contato principal confirmado',true),
  ('Identificação','endereco','Endereço',false),
  ('Família','ascendente_alvo','Ascendente alvo',true),
  ('Família','linha_ascendencia','Linha de ascendência',true),
  ('Família','pais_alvo','País alvo',true),
  ('Família','localidades_conhecidas','Localidades conhecidas',false),
  ('Comercial','proposta_aprovada_referencia','Referência da proposta aprovada',true),
  ('Comercial','valor_aprovado','Valor comercial aprovado (revisão humana)',true),
  ('Comercial','condicoes_pagamento','Condições comerciais aprovadas',true),
  ('Comercial','data_aceite_comercial','Data do aceite comercial',true),
  ('Contrato','partes_qualificadas','Partes qualificadas',true),
  ('Contrato','escopo_aprovado','Escopo aprovado',true),
  ('Contrato','anexos_aplicaveis','Anexos aplicáveis',true),
  ('Contrato','dados_assinatura','Dados de assinatura (registro externo)',true),
  ('Documentos','documentos_disponiveis','Documentos já disponíveis',false),
  ('Documentos','consentimento_registrado','Consentimento registrado',true)
) as t(s,c,l,o)
on conflict (case_id, campo) do nothing;

-- 11. Bloqueios críticos iniciais
insert into public.piloto_bloqueios (organization_id, case_id, chave, descricao, criticidade)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1','a11a0000-0000-4000-8000-000000000002', k, d, 'critico'
from (values
  ('contrato_assinado_externo','Contrato MODELO ESTUDO assinado com registro externo, data e partes qualificadas'),
  ('condicao_financeira','Condição financeira aplicável confirmada por financeiro'),
  ('partes_qualificadas','Partes qualificadas validadas por revisão humana'),
  ('consentimento_registrado','Consentimento do titular registrado'),
  ('dossie_minimo_conferido','Dossiê mínimo conferido, com origem em todos os campos obrigatórios'),
  ('autorizacao_pesquisa_externa','Autorização para pesquisa externa e solicitações institucionais')
) as t(k,d)
on conflict (case_id, chave) do nothing;