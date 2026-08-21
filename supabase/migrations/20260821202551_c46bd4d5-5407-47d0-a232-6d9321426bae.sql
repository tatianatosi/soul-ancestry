-- 1. Versionamento imutável + guarda de ciclo de vida
create or replace function public.fn_message_template_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_mudou_conteudo boolean := false;
begin
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    new.updated_by := auth.uid();

    if new.status is distinct from old.status
       and new.status in ('vigente','suspenso','substituido','arquivado')
       and not public.has_org_role(new.organization_id, 'admin'::app_role) then
      raise exception 'Somente administrador pode tornar o modelo vigente, suspenso, substituído ou arquivado.';
    end if;

    if new.status = 'substituido' and new.supersedes_template_id is null then
      raise exception 'Substituição exige o identificador do modelo sucessor.';
    end if;

    if new.archived_at is not null and coalesce(btrim(new.archive_reason), '') = '' then
      raise exception 'Arquivamento exige motivo registrado.';
    end if;

    if new.status = 'aprovado' and old.status <> 'aprovado' then
      new.approved_by := coalesce(new.approved_by, auth.uid());
      new.approved_at := coalesce(new.approved_at, now());
    end if;

    v_mudou_conteudo := new.body is distinct from old.body
      or new.subject is distinct from old.subject
      or new.safe_variables is distinct from old.safe_variables
      or new.required_variables is distinct from old.required_variables;

    if v_mudou_conteudo and old.status in ('vigente','aprovado') then
      new.version := old.version + 1;
    end if;

    if v_mudou_conteudo or new.status is distinct from old.status then
      insert into public.message_template_versions
        (organization_id, template_id, version, body_snapshot, subject_snapshot,
         variables_snapshot, change_reason, status_snapshot, created_by)
      values (new.organization_id, new.id, new.version, new.body, new.subject,
              jsonb_build_object('safe', new.safe_variables, 'required', new.required_variables),
              'alteracao de conteudo ou estado', new.status, auth.uid());
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_message_template_guard on public.message_templates;
create trigger trg_message_template_guard
before update on public.message_templates
for each row execute function public.fn_message_template_guard();

-- 2. Sem exclusão física em nenhuma tabela da biblioteca
create or replace function public.fn_biblioteca_mensagens_sem_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  raise exception 'Exclusão física proibida: use arquivamento lógico com motivo.';
end;
$$;

drop trigger if exists trg_mt_no_delete on public.message_templates;
create trigger trg_mt_no_delete before delete on public.message_templates
for each row execute function public.fn_biblioteca_mensagens_sem_delete();
drop trigger if exists trg_mtv_no_delete on public.message_template_versions;
create trigger trg_mtv_no_delete before delete on public.message_template_versions
for each row execute function public.fn_biblioteca_mensagens_sem_delete();
drop trigger if exists trg_mtu_no_delete on public.message_template_usage;
create trigger trg_mtu_no_delete before delete on public.message_template_usage
for each row execute function public.fn_biblioteca_mensagens_sem_delete();
drop trigger if exists trg_mtc_no_delete on public.message_template_categories;
create trigger trg_mtc_no_delete before delete on public.message_template_categories
for each row execute function public.fn_biblioteca_mensagens_sem_delete();
drop trigger if exists trg_eci_no_delete on public.editorial_content_items;
create trigger trg_eci_no_delete before delete on public.editorial_content_items
for each row execute function public.fn_biblioteca_mensagens_sem_delete();
drop trigger if exists trg_ecl_no_delete on public.editorial_content_links;
create trigger trg_ecl_no_delete before delete on public.editorial_content_links
for each row execute function public.fn_biblioteca_mensagens_sem_delete();

-- 3. Validação de uso (não dispara nada; apenas autoriza ou bloqueia)
create or replace function public.fn_validar_uso_template(
  _template_id uuid,
  _actor_id uuid default auth.uid(),
  _lead_id uuid default null,
  _opportunity_id uuid default null,
  _case_id uuid default null,
  _person_id uuid default null,
  _channel text default null
) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  t public.message_templates%rowtype;
  cat public.message_template_categories%rowtype;
  caso public.crm_casos%rowtype;
  lead_demo boolean := false;
  b text[] := '{}';
  papeis text[];
  permitidos text[];
  etapa text;
begin
  select * into t from public.message_templates where id = _template_id;
  if not found then
    return jsonb_build_object('permitido', false, 'bloqueios', jsonb_build_array('Modelo inexistente.'));
  end if;

  if not public.is_org_member(t.organization_id) then
    return jsonb_build_object('permitido', false, 'bloqueios', jsonb_build_array('Modelo pertence a outra organização.'));
  end if;

  select * into cat from public.message_template_categories where id = t.category_id;

  select array_agg(r.role::text) into papeis
  from public.user_roles r
  where r.user_id = coalesce(_actor_id, auth.uid()) and r.organization_id = t.organization_id;
  papeis := coalesce(papeis, '{}');

  permitidos := case cat.key
    when 'comercial' then array['admin','comercial','operacoes']
    when 'formalizacao' then array['admin','comercial','operacoes']
    when 'financeiro' then array['admin','financeiro']
    when 'pesquisa' then array['admin','operacoes','pesquisador']
    when 'marketing_editorial' then array['admin','operacoes','comercial']
    else array['admin','operacoes']
  end;

  if not (papeis && permitidos) then
    b := b || 'Seu papel não autoriza o uso desta categoria de modelo.';
  end if;

  if t.archived_at is not null or t.status in ('arquivado','suspenso','substituido') then
    b := b || 'Modelo arquivado, suspenso ou substituído.';
  elsif t.status not in ('aprovado','vigente') then
    b := b || 'Modelo ainda não aprovado: uso externo bloqueado.';
  end if;

  if _channel is not null and _channel <> t.channel then
    b := b || 'Canal incompatível com o modelo.';
  end if;

  if cat.key = 'marketing_editorial' and (_case_id is not null or _lead_id is not null or _person_id is not null) then
    b := b || 'Modelo editorial não pode ser vinculado a pessoa, lead ou caso identificável.';
  end if;

  if _case_id is not null then
    select * into caso from public.crm_casos where id = _case_id;
    if not found or caso.organization_id <> t.organization_id then
      b := b || 'Caso inexistente ou de outra organização.';
      _case_id := null;
    end if;
  end if;

  if _lead_id is not null then
    select l.demo into lead_demo from public.leads l
    where l.id = _lead_id and l.organization_id = t.organization_id;
    if not found then b := b || 'Lead inexistente ou de outra organização.'; end if;
  end if;

  if t.is_demo and coalesce(caso.demo, lead_demo, false) = false and (_case_id is not null or _lead_id is not null) then
    b := b || 'Modelo de demonstração não pode ser usado em contexto real.';
  end if;
  if not t.is_demo and coalesce(caso.demo, lead_demo, false) then
    b := b || 'Registro de demonstração: uso apenas com modelo marcado como demonstração.';
  end if;

  etapa := coalesce(t.stage_scope, '');
  if t.requires_gate_validation and etapa <> '' then
    if etapa in ('aceite_verbal_confirmado','confirmacao_formal_recebida','formalizacao_em_preparacao',
                 'contrato_enviado','contrato_assinado','pagamento_inicial_confirmado',
                 'onboarding_iniciado','primeira_microentrega','espera_externa')
       and _case_id is null then
      b := b || 'Vincule o caso correspondente antes de usar este modelo.';
    else
      if etapa = 'aceite_verbal_confirmado' and caso.aceite_comercial_em is null then
        b := b || 'Bloqueado: aceite verbal ainda não registrado.';
      end if;
      if etapa = 'confirmacao_formal_recebida' and caso.data_confirmacao_formal_proposta is null then
        b := b || 'Bloqueado: confirmação formal não registrada.';
      end if;
      if etapa = 'contrato_enviado' and not exists (
        select 1 from public.contracts c
        where c.case_id = _case_id and c.archived_at is null
          and c.approved_for_send_at is not null
      ) then
        b := b || 'Bloqueado: contrato ainda não revisado e liberado para envio.';
      end if;
      if etapa = 'contrato_assinado' and coalesce(caso.contrato_assinado, false) = false then
        b := b || 'Bloqueado: contrato assinado não registrado.';
      end if;
      if etapa = 'pagamento_inicial_confirmado' and coalesce(caso.pagamento_confirmado, false) = false then
        b := b || 'Bloqueado: pagamento inicial não confirmado na fonte transacional.';
      end if;
      if etapa = 'onboarding_iniciado' and caso.onboarding_iniciado_em is null then
        b := b || 'Bloqueado: onboarding ainda não iniciado.';
      end if;
      if etapa = 'primeira_microentrega' and not exists (
        select 1 from public.client_deliverables d
        where d.case_id = _case_id and d.archived_at is null
          and d.approval_status = 'aprovado' and d.published_at is not null
      ) then
        b := b || 'Bloqueado: não há entrega aprovada e publicada para o cliente.';
      end if;
      if etapa = 'espera_externa' and not exists (
        select 1 from public.case_espera_externa e
        where e.case_id = _case_id and e.archived_at is null
          and coalesce(btrim(e.motivo), '') <> '' and e.prazo_rechecagem is not null
      ) then
        b := b || 'Bloqueado: espera externa não registrada de forma completa.';
      end if;
      if etapa = 'proposta_enviada' and _case_id is not null and caso.data_proposta is null then
        b := b || 'Bloqueado: proposta enviada não registrada.';
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'permitido', array_length(b, 1) is null,
    'bloqueios', to_jsonb(coalesce(b, '{}')),
    'template_version', t.version,
    'channel', t.channel,
    'organization_id', t.organization_id
  );
end;
$$;

revoke all on function public.fn_validar_uso_template(uuid, uuid, uuid, uuid, uuid, uuid, text) from public, anon;
grant execute on function public.fn_validar_uso_template(uuid, uuid, uuid, uuid, uuid, uuid, text) to authenticated, service_role;
revoke all on function public.fn_message_template_guard() from public, anon, authenticated;
revoke all on function public.fn_biblioteca_mensagens_sem_delete() from public, anon, authenticated;