
-- 1) Bloqueio de status assinado sem requisitos
CREATE OR REPLACE FUNCTION public.fn_contracts_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
    if OLD.status = 'approved_for_send' and NEW.status = 'sent' then
      raise exception 'Envio de contrato está desabilitado nesta fase (integração não configurada).';
    end if;
    if NEW.status = 'archived' and OLD.status <> 'archived' and coalesce(trim(NEW.archive_reason),'') = '' then
      raise exception 'Arquivamento exige motivo.';
    end if;
  end if;

  -- Gate de assinatura
  if NEW.status = 'signed' and (TG_OP = 'INSERT' or OLD.status is distinct from 'signed') then
    -- versão do instrumento
    select * into v_ver from public.contract_versions
      where contract_id = NEW.id and archived_at is null
      and (NEW.current_version_id is null or id = NEW.current_version_id)
      order by version_number desc limit 1;
    if v_ver is null or v_ver.generated_content = '{}'::jsonb then
      raise exception 'Assinatura bloqueada: não há versão do instrumento com conteúdo gerado.';
    end if;
    -- arquivo ou registro de assinatura externa
    if coalesce(trim(NEW.signature_reference),'') = ''
       and coalesce(trim(NEW.provider_envelope_id),'') = ''
       and coalesce(trim(v_ver.rendered_file_path),'') = '' then
      raise exception 'Assinatura bloqueada: informe o arquivo assinado ou o registro da assinatura externa.';
    end if;
    -- data de assinatura
    if NEW.signed_at is null then
      raise exception 'Assinatura bloqueada: data de assinatura é obrigatória.';
    end if;
    -- partes qualificadas
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
    -- escopo aprovado
    select count(*) into n from public.contract_scope_items
      where contract_id = NEW.id and archived_at is null
        and category = 'contracted_scope' and status = 'included';
    if n = 0 then
      raise exception 'Assinatura bloqueada: escopo contratado não aprovado.';
    end if;
    -- condição comercial validada
    if NEW.financial_gate_status not in ('confirmed','not_applicable')
       or NEW.financial_change_status = 'pending_review' then
      raise exception 'Assinatura bloqueada: condição comercial não validada.';
    end if;
    -- registro de revisão humana
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

  -- relacionamento base/complementar/aditivo
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

-- 2) Cobrança bloqueada sem contrato assinado
CREATE OR REPLACE FUNCTION public.fn_guard_cobranca()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare c record;
begin
  if NEW.caso_id is null then return NEW; end if;
  if TG_OP = 'UPDATE' and NEW.caso_id is not distinct from OLD.caso_id
     and NEW.status is not distinct from OLD.status
     and NEW.valor is not distinct from OLD.valor then
    return NEW;
  end if;
  select * into c from public.crm_casos where id = NEW.caso_id;
  if c is null then return NEW; end if;
  if not coalesce(c.contrato_assinado,false) then
    raise exception 'Cobrança bloqueada: o caso não possui contrato assinado.';
  end if;
  return NEW;
end $function$;

DROP TRIGGER IF EXISTS trg_guard_cobranca ON public.eventos_financeiros;
CREATE TRIGGER trg_guard_cobranca
  BEFORE INSERT OR UPDATE ON public.eventos_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_cobranca();

-- 3) Pesquisa externa bloqueada sem contrato assinado
CREATE OR REPLACE FUNCTION public.fn_guard_pesquisa_externa()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare c record;
begin
  if NEW.caso_id is null then return NEW; end if;
  if coalesce(NEW.origem,'interna') in ('interna','cliente') then return NEW; end if;
  if TG_OP = 'UPDATE' and NEW.origem is not distinct from OLD.origem
     and NEW.caso_id is not distinct from OLD.caso_id then
    return NEW;
  end if;
  select * into c from public.crm_casos where id = NEW.caso_id;
  if c is null then return NEW; end if;
  if not coalesce(c.contrato_assinado,false) then
    raise exception 'Pesquisa externa bloqueada: o caso não possui contrato assinado.';
  end if;
  return NEW;
end $function$;

DROP TRIGGER IF EXISTS trg_guard_pesquisa_externa ON public.evidencias;
CREATE TRIGGER trg_guard_pesquisa_externa
  BEFORE INSERT OR UPDATE ON public.evidencias
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_pesquisa_externa();
