-- Autoridade da proprietária na camada do banco.
--
-- Diagnóstico de 05/09/2026: há 108 funções de guarda em `public`, 106 delas
-- levantam exceção e NENHUMA reconhece a decisão auditada da proprietária.
-- Por isso o bloqueio aparece em toda aba, todo grupo e toda tela: ele não vem
-- da interface, vem do banco, e o banco recusa igual para qualquer papel.
--
-- Esta migration NÃO remove guarda nenhuma. Ela cria o caminho pelo qual uma
-- decisão da proprietária, já registrada e auditada, é reconhecida — e corrige
-- dois becos sem saída que recusam para todo mundo, para sempre.

-- 1) Reconhecimento da decisão auditada -------------------------------------

-- Verdadeiro quando quem executa é admin ativo da organização do registro.
create or replace function public.fn_eh_proprietaria_ativa(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
      from public.staff_access s
     where s.auth_user_id = auth.uid()
       and s.organization_id = p_org
       and s.status = 'active'
       and s.archived_at is null
       and s.role = 'admin'
  );
$$;

comment on function public.fn_eh_proprietaria_ativa(uuid) is
  'Admin ativo e não arquivado da organização do registro. Base da autoridade operacional.';

-- Verdadeiro quando existe decisão auditada recente, com motivo, para este
-- registro e esta operação. A janela curta impede que uma decisão antiga
-- libere uma escrita futura sem novo aceite.
create or replace function public.fn_decisao_proprietaria_ativa(
  p_org uuid,
  p_entidade text,
  p_entidade_id text,
  p_janela interval default interval '2 minutes'
)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.fn_eh_proprietaria_ativa(p_org)
     and exists (
       select 1
         from public.owner_override_events e
        where e.organization_id = p_org
          and e.entidade = p_entidade
          and e.entidade_id is not distinct from p_entidade_id
          and e.actor_user_id = auth.uid()
          and e.confirmacao_manual
          and length(coalesce(trim(e.motivo), '')) >= 20
          and e.created_at >= now() - p_janela
     );
$$;

comment on function public.fn_decisao_proprietaria_ativa(uuid, text, text, interval) is
  'Decisão da proprietária registrada em owner_override_events, com motivo e confirmação manual, dentro da janela. Não apaga a pendência: apenas a torna superável.';

-- 2) Becos sem saída ---------------------------------------------------------
--
-- As duas condições abaixo recusavam incondicionalmente, sem olhar dado, papel
-- ou decisão. Nenhum caminho do produto conseguia atravessá-las: contrato
-- nunca saía de 'approved_for_send' e anexo nunca era assinado. Não são
-- salvaguarda, são funcionalidade desligada e esquecida ligada.
--
-- Passam a exigir decisão auditada da proprietária, em vez de recusar sempre.

create or replace function public.fn_contracts_guard()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare v_seq int; v_parent record; v_ver record; n int;
begin
  if TG_OP = 'INSERT' then
    select count(*) + 1 into v_seq from public.contracts where organization_id = NEW.organization_id;
    NEW.contract_number := to_char(now(),'YYYY') || '-' ||
      case NEW.contract_type when 'contract_base' then 'CB' when 'contract_complement' then 'CC' else 'AD' end ||
      '-' || lpad(v_seq::text, 4, '0');
    NEW.status := coalesce(NEW.status, 'draft');
    if NEW.status not in ('draft','pending_data') then
      raise exception 'Novo instrumento deve iniciar em rascunho.';
    end if;
  else
    if NEW.contract_number is distinct from OLD.contract_number then
      raise exception 'A numeração do contrato é gerada pelo sistema e não pode ser alterada.';
    end if;
    if OLD.status = 'signed' and NEW.status not in ('signed','archived') then
      raise exception 'Contrato assinado é imutável; use complementar ou aditivo.';
    end if;
    if OLD.status = 'signed' and (
         NEW.title is distinct from OLD.title
      or NEW.purpose_summary is distinct from OLD.purpose_summary
      or NEW.scope_summary is distinct from OLD.scope_summary
      or NEW.exclusions_summary is distinct from OLD.exclusions_summary
      or NEW.contract_type is distinct from OLD.contract_type
      or NEW.parent_contract_id is distinct from OLD.parent_contract_id) then
      raise exception 'Conteúdo de contrato assinado não pode ser alterado.';
    end if;

    -- ANTES: recusava sempre. AGORA: exige decisão auditada da proprietária.
    if OLD.status = 'approved_for_send' and NEW.status = 'sent'
       and not public.fn_decisao_proprietaria_ativa(NEW.organization_id, 'contracts', NEW.id::text) then
      raise exception 'Envio de contrato exige confirmação registrada da proprietária, com motivo.';
    end if;

    if NEW.status = 'archived' and OLD.status <> 'archived' and coalesce(trim(NEW.archive_reason),'') = '' then
      raise exception 'Arquivamento exige motivo.';
    end if;
  end if;

  -- Gate de assinatura: integridade do instrumento, mantido integralmente.
  if NEW.status = 'signed' and (TG_OP = 'INSERT' or OLD.status is distinct from 'signed') then
    select * into v_ver from public.contract_versions
      where contract_id = NEW.id and archived_at is null
      and (NEW.current_version_id is null or id = NEW.current_version_id)
      order by version_number desc limit 1;
    if v_ver is null or v_ver.generated_content = '{}'::jsonb then
      raise exception 'Assinatura bloqueada: não há versão do instrumento com conteúdo gerado.';
    end if;
    if coalesce(trim(NEW.signature_reference),'') = ''
       and coalesce(trim(NEW.provider_envelope_id),'') = ''
       and coalesce(trim(v_ver.rendered_file_path),'') = '' then
      raise exception 'Assinatura bloqueada: informe o arquivo assinado ou o registro da assinatura externa.';
    end if;
    if NEW.signed_at is null then
      raise exception 'Assinatura bloqueada: data de assinatura é obrigatória.';
    end if;
    select count(*) into n from public.contract_parties
      where contract_id = NEW.id and active and archived_at is null and role = 'provider'
        and coalesce(trim(person_name),'') <> '' and coalesce(trim(document_number),'') <> '';
    if n = 0 then
      raise exception 'Assinatura bloqueada: parte prestadora não qualificada.';
    end if;
    select count(*) into n from public.contract_parties
      where contract_id = NEW.id and active and archived_at is null and role = 'contracting_client'
        and coalesce(trim(person_name),'') <> '' and coalesce(trim(document_number),'') <> '';
    if n = 0 then
      raise exception 'Assinatura bloqueada: parte contratante não qualificada.';
    end if;
    select count(*) into n from public.contract_parties
      where contract_id = NEW.id and active and archived_at is null and signature_required
        and legal_capacity_status in ('minor','legal_representative_required') and represented_by_party_id is null;
    if n > 0 then
      raise exception 'Assinatura bloqueada: parte sem representante legal qualificado.';
    end if;
    select count(*) into n from public.contract_scope_items
      where contract_id = NEW.id and archived_at is null
        and category = 'contracted_scope' and status = 'included';
    if n = 0 then
      raise exception 'Assinatura bloqueada: escopo contratado não aprovado.';
    end if;
    if NEW.financial_gate_status not in ('confirmed','not_applicable')
       or NEW.financial_change_status = 'pending_review' then
      raise exception 'Assinatura bloqueada: condição comercial não validada.';
    end if;
    if v_ver.review_decision <> 'approved' or v_ver.reviewed_by is null or v_ver.reviewed_at is null then
      raise exception 'Assinatura bloqueada: revisão humana da versão não registrada.';
    end if;
    if NEW.review_owner_user_id is null then
      raise exception 'Assinatura bloqueada: responsável pela revisão humana não definido.';
    end if;
    select count(*) into n from public.contract_validation_results
      where contract_id = NEW.id and archived_at is null
        and severity = 'blocking' and status = 'open';
    if n > 0 then
      raise exception 'Assinatura bloqueada: existem % pendência(s) bloqueante(s) em aberto.', n;
    end if;
  end if;

  -- Relacionamento base/complementar/aditivo: integridade estrutural, mantido.
  if NEW.contract_type = 'contract_base' then
    if NEW.parent_contract_id is not null then
      raise exception 'Contrato-base não pode ter contrato-pai.';
    end if;
    NEW.relationship_type := 'independent';
  else
    if NEW.parent_contract_id is null or coalesce(trim(NEW.base_contract_reference),'') = '' then
      raise exception 'Instrumento complementar ou aditivo exige contrato-base vinculado e referência do contrato-base.';
    end if;
    select * into v_parent from public.contracts where id = NEW.parent_contract_id;
    if v_parent is null or v_parent.organization_id <> NEW.organization_id then
      raise exception 'Contrato-base deve pertencer à mesma organização.';
    end if;
    if v_parent.contract_type <> 'contract_base' then
      raise exception 'O contrato-pai deve ser um contrato-base.';
    end if;
    if NEW.relationship_type not in ('complement','amendment','replacement_reference') then
      raise exception 'Tipo de relacionamento inválido para instrumento derivado.';
    end if;
  end if;
  return NEW;
end $function$;
