-- ============ PROPOSTAS ============
alter table public.proposals
  add column if not exists case_id uuid references public.crm_casos(id),
  add column if not exists exclusoes text,
  add column if not exists forma_pagamento text,
  add column if not exists observacoes_internas text,
  add column if not exists observacoes_cliente text,
  add column if not exists validade_renovada_em timestamptz,
  add column if not exists validade_renovada_por uuid,
  add column if not exists validade_renovada_motivo text,
  add column if not exists substituida_por_id uuid references public.proposals(id),
  add column if not exists substituida_em timestamptz;

update public.proposals set status = 'recusada' where status = 'arquivada';

alter table public.proposals drop constraint if exists proposals_status_check;
alter table public.proposals add constraint proposals_status_check
  check (status = any (array['rascunho','em_revisao','enviada','aprovada','recusada','expirada','substituida']));

create unique index if not exists proposals_uma_aprovada_por_cliente
  on public.proposals(client_id)
  where status = 'aprovada' and archived_at is null and client_id is not null;

create or replace function public.fn_proposals_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_venc date;
begin
  if TG_OP = 'UPDATE' and NEW.status = 'aprovada' and OLD.status is distinct from 'aprovada' then
    v_venc := NEW.validade;
    if v_venc is null then
      raise exception 'Proposta só pode ser aprovada com data de validade registrada.';
    end if;
    if v_venc < current_date then
      raise exception 'Proposta vencida: registre a renovação de validade antes de aprovar.';
    end if;
    if OLD.status = 'expirada' and (NEW.validade_renovada_em is null or coalesce(btrim(NEW.validade_renovada_motivo),'') = '') then
      raise exception 'Proposta expirada exige renovação de validade com motivo registrado.';
    end if;
    NEW.aprovada_em := coalesce(NEW.aprovada_em, now());

    if NEW.client_id is not null then
      update public.proposals
         set status = 'substituida',
             substituida_em = now(),
             substituida_por_id = NEW.id
       where organization_id = NEW.organization_id
         and client_id = NEW.client_id
         and id <> NEW.id
         and status = 'aprovada'
         and archived_at is null;
    end if;
  end if;

  if TG_OP = 'UPDATE' and NEW.validade is distinct from OLD.validade and OLD.validade is not null
     and OLD.validade < current_date then
    if coalesce(btrim(NEW.validade_renovada_motivo),'') = '' then
      raise exception 'Renovar a validade de uma proposta vencida exige motivo.';
    end if;
    NEW.validade_renovada_em := now();
    NEW.validade_renovada_por := auth.uid();
  end if;

  if TG_OP = 'UPDATE' and NEW.status = 'recusada' and OLD.status is distinct from 'recusada' then
    NEW.recusada_em := coalesce(NEW.recusada_em, now());
  end if;
  if TG_OP = 'UPDATE' and NEW.status = 'enviada' and OLD.status is distinct from 'enviada' then
    NEW.enviada_em := coalesce(NEW.enviada_em, now());
  end if;
  return NEW;
end $$;

drop trigger if exists trg_proposals_guard on public.proposals;
create trigger trg_proposals_guard before insert or update on public.proposals
for each row execute function public.fn_proposals_guard();

drop trigger if exists trg_proposals_audit on public.proposals;
create trigger trg_proposals_audit after insert or update on public.proposals
for each row execute function public.fn_audit();

-- ============ CONTRATOS: assinatura ============
alter table public.contracts
  add column if not exists external_signature_justification text,
  add column if not exists external_signature_approved_by uuid,
  add column if not exists external_signature_approved_at timestamptz;

create or replace function public.fn_contracts_signature_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_arquivo text;
begin
  if NEW.status = 'signed' and (TG_OP = 'INSERT' or OLD.status is distinct from 'signed') then
    if NEW.signed_at is null then
      raise exception 'Contrato assinado exige data de assinatura.';
    end if;
    if NEW.current_version_id is null then
      raise exception 'Contrato assinado exige versão vigente registrada.';
    end if;
    select rendered_file_path into v_arquivo from public.contract_versions where id = NEW.current_version_id;
    if coalesce(btrim(v_arquivo),'') = '' then
      if coalesce(btrim(NEW.external_signature_justification),'') = ''
         or NEW.external_signature_approved_by is null
         or NEW.external_signature_approved_at is null then
        raise exception 'Sem arquivo da versão, a assinatura externa exige justificativa aprovada por admin.';
      end if;
      if not public.has_org_role(NEW.organization_id, 'admin'::public.app_role)
         and not public.has_role(NEW.external_signature_approved_by, 'admin'::public.app_role) then
        raise exception 'A justificativa de assinatura externa precisa ser aprovada por um admin.';
      end if;
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_contracts_signature_guard on public.contracts;
create trigger trg_contracts_signature_guard before insert or update on public.contracts
for each row execute function public.fn_contracts_signature_guard();

-- ============ ORDENS DE SERVIÇO ============
create or replace function public.fn_service_orders_case_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if NEW.status in ('active','completed') and NEW.case_id is null then
    raise exception 'Ordem de serviço só pode ser iniciada vinculada a um caso.';
  end if;
  return NEW;
end $$;

drop trigger if exists trg_service_orders_case_guard on public.service_orders;
create trigger trg_service_orders_case_guard before insert or update on public.service_orders
for each row execute function public.fn_service_orders_case_guard();

-- ============ FATURAS ============
alter table public.invoices
  add column if not exists proposal_id uuid references public.proposals(id),
  add column if not exists descricao text,
  add column if not exists valor_pago numeric not null default 0,
  add column if not exists emitida_em timestamptz,
  add column if not exists paga_em timestamptz;

update public.invoices set status = 'emitida' where status = 'aberta';
update public.invoices set status = 'parcialmente_paga' where status = 'parcial';

alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices add constraint invoices_status_check
  check (status = any (array['rascunho','emitida','pendente','parcialmente_paga','paga','vencida','cancelada']));

alter table public.invoices drop constraint if exists invoices_conciliacao_status_check;
alter table public.invoices add constraint invoices_conciliacao_status_check
  check (conciliacao_status = any (array['nao_conciliado','sugerido','conciliado','divergente']));

alter table public.payments drop constraint if exists payments_conciliacao_status_check;
alter table public.payments add constraint payments_conciliacao_status_check
  check (conciliacao_status = any (array['nao_conciliado','sugerido','conciliado','divergente']));

create table if not exists public.invoice_adjustments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  invoice_id uuid not null references public.invoices(id),
  valor numeric not null,
  motivo text not null,
  referencia_externa text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

grant select, insert, update on public.invoice_adjustments to authenticated;
grant all on public.invoice_adjustments to service_role;
alter table public.invoice_adjustments enable row level security;

drop policy if exists "adjust_select" on public.invoice_adjustments;
create policy "adjust_select" on public.invoice_adjustments for select to authenticated
  using (public.is_org_member(organization_id));
drop policy if exists "adjust_insert" on public.invoice_adjustments;
create policy "adjust_insert" on public.invoice_adjustments for insert to authenticated
  with check (public.can_write_financeiro(organization_id));
drop policy if exists "adjust_update" on public.invoice_adjustments;
create policy "adjust_update" on public.invoice_adjustments for update to authenticated
  using (public.can_write_financeiro(organization_id))
  with check (public.can_write_financeiro(organization_id));

drop trigger if exists trg_adjust_audit on public.invoice_adjustments;
create trigger trg_adjust_audit after insert or update on public.invoice_adjustments
for each row execute function public.fn_audit();

drop trigger if exists trg_adjust_updated on public.invoice_adjustments;
create trigger trg_adjust_updated before update on public.invoice_adjustments
for each row execute function public.update_updated_at_column();

create or replace function public.fn_invoices_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_write_financeiro(NEW.organization_id) then
    raise exception 'Alteração financeira exige papel financeiro ou admin.';
  end if;
  if TG_OP = 'UPDATE' and OLD.status = 'paga' and NEW.valor is distinct from OLD.valor then
    raise exception 'Fatura paga não pode ter o valor editado. Registre um ajuste de fatura.';
  end if;
  if NEW.status = 'emitida' and NEW.emitida_em is null then
    NEW.emitida_em := now();
  end if;
  if NEW.status = 'paga' and NEW.paga_em is null then
    NEW.paga_em := now();
  end if;
  return NEW;
end $$;

drop trigger if exists trg_invoices_guard on public.invoices;
create trigger trg_invoices_guard before insert or update on public.invoices
for each row execute function public.fn_invoices_guard();

drop trigger if exists trg_invoices_audit on public.invoices;
create trigger trg_invoices_audit after insert or update on public.invoices
for each row execute function public.fn_audit();

-- ============ PAGAMENTOS E CONCILIAÇÃO ============
create or replace function public.fn_payments_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_inv record;
begin
  if not public.can_write_financeiro(NEW.organization_id) then
    raise exception 'Alteração financeira exige papel financeiro ou admin.';
  end if;

  if NEW.conciliacao_status in ('conciliado','divergente') then
    if NEW.pago_em is null then raise exception 'Conciliação exige data do pagamento.'; end if;
    if NEW.valor is null or NEW.valor <= 0 then raise exception 'Conciliação exige valor do pagamento.'; end if;
    if coalesce(btrim(NEW.referencia_externa),'') = '' then
      raise exception 'Conciliação exige referência externa do pagamento.';
    end if;

    select * into v_inv from public.invoices where id = NEW.invoice_id;
    if v_inv.id is not null and NEW.conciliacao_status = 'conciliado'
       and round(coalesce(NEW.valor,0),2) <> round(coalesce(v_inv.valor,0),2) then
      NEW.conciliacao_status := 'divergente';
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_payments_guard on public.payments;
create trigger trg_payments_guard before insert or update on public.payments
for each row execute function public.fn_payments_guard();

create or replace function public.fn_payments_pos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_inv record; v_pago numeric; v_case uuid;
begin
  select * into v_inv from public.invoices where id = NEW.invoice_id;
  if v_inv.id is null then return NEW; end if;

  select coalesce(sum(valor),0) into v_pago
    from public.payments
   where invoice_id = v_inv.id and archived_at is null
     and conciliacao_status = 'conciliado' and status = 'confirmado';

  update public.invoices
     set valor_pago = v_pago,
         status = case
           when status = 'cancelada' then status
           when v_pago <= 0 then status
           when round(v_pago,2) >= round(valor,2) then 'paga'
           else 'parcialmente_paga' end,
         conciliacao_status = case
           when exists (select 1 from public.payments p where p.invoice_id = v_inv.id
                          and p.archived_at is null and p.conciliacao_status = 'divergente')
             then 'divergente'
           when round(v_pago,2) >= round(valor,2) then 'conciliado'
           when v_pago > 0 then 'sugerido'
           else conciliacao_status end
   where id = v_inv.id;

  v_case := v_inv.case_id;
  if v_case is not null and NEW.conciliacao_status = 'divergente' then
    update public.crm_casos set pagamento_confirmado = false where id = v_case;
    update public.case_activation_checks
       set status = 'pendente',
           validado_em = null,
           validado_por = null,
           observacao = 'Bloqueado automaticamente: pagamento conciliado divergente da fatura.'
     where case_id = v_case and check_key = 'pagamento_confirmado';
  end if;
  return NEW;
end $$;

drop trigger if exists trg_payments_pos on public.payments;
create trigger trg_payments_pos after insert or update on public.payments
for each row execute function public.fn_payments_pos();

drop trigger if exists trg_payments_audit on public.payments;
create trigger trg_payments_audit after insert or update on public.payments
for each row execute function public.fn_audit();