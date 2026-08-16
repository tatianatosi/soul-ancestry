-- ---------- Gate de pesquisa externa ----------
create or replace function public.rg_pode_editar_caso(_rc uuid)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare r record; p app_role;
begin
  select rc.organization_id, rc.assigned_researcher_user_id, rc.archived_at, c.responsavel_id
    into r from public.research_cases rc join public.crm_casos c on c.id = rc.case_id where rc.id = _rc;
  if not found then return false; end if;
  if not public.is_staff_ativo(r.organization_id) then return false; end if;
  p := public.staff_meu_papel(r.organization_id);
  if p in ('admin'::app_role,'operacoes'::app_role) then return true; end if;
  if p = 'pesquisador'::app_role then
    return coalesce(r.assigned_researcher_user_id = auth.uid(), false)
        or coalesce(r.responsavel_id = auth.uid(), false);
  end if;
  return false;
end $$;

create or replace function public.pode_iniciar_pesquisa_externa(_rc uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare rc record; c record; estado text; msg text; papel app_role; criticas int; pend int;
begin
  select * into rc from public.research_cases where id = _rc;
  if not found then
    return jsonb_build_object('permitido',false,'elegivel',false,'estado','blocked_by_case_status',
      'mensagem','Pesquisa externa bloqueada: caso não está elegível.');
  end if;
  select * into c from public.crm_casos where id = rc.case_id and organization_id = rc.organization_id;
  papel := public.staff_meu_papel(rc.organization_id);

  select count(*) into criticas from public.quality_issues q
   where q.organization_id = rc.organization_id and q.case_id = rc.case_id
     and q.severidade = 'critica' and q.status in ('aberta','reconhecida');
  select count(*) into pend from public.research_pending_items pi
   where pi.research_case_id = _rc and pi.severity = 'critical'
     and pi.status in ('open','in_progress','blocked') and pi.archived_at is null;

  if c is null or c.archived_at is not null or rc.archived_at is not null
     or c.status in ('pausado','encerrado','concluido','arquivado')
     or rc.status in ('paused','completed','archived') then
    estado := 'blocked_by_case_status'; msg := 'Pesquisa externa bloqueada: caso não está elegível.';
  elsif coalesce(c.contrato_assinado,false) is not true then
    estado := 'blocked_by_contract'; msg := 'Pesquisa externa bloqueada: contrato aplicável não assinado.';
  elsif coalesce(c.pagamento_confirmado,false) is not true then
    estado := 'blocked_by_financial_gate'; msg := 'Pesquisa externa bloqueada: condição financeira pendente.';
  elsif rc.external_research_authorization_status not in ('registered','not_applicable') then
    estado := 'pending_authorization'; msg := 'Pesquisa externa bloqueada: autorização aplicável pendente.';
  elsif criticas > 0 or pend > 0 then
    estado := 'blocked_by_quality'; msg := 'Pesquisa externa bloqueada: há inconsistência crítica aberta.';
  elsif rc.external_research_gate_status = 'released_by_authorized_user' then
    estado := 'released_by_authorized_user'; msg := 'Liberação humana registrada por usuário autorizado.';
  else
    estado := 'eligible_for_human_release';
    msg := 'Elegível para liberação humana; nenhuma ação externa foi executada.';
  end if;

  return jsonb_build_object(
    'permitido', estado = 'released_by_authorized_user',
    'elegivel', estado in ('eligible_for_human_release','released_by_authorized_user'),
    'estado', estado, 'mensagem', msg,
    'papel_autorizado', coalesce(papel in ('admin'::app_role,'operacoes'::app_role), false),
    'pendencias_criticas', pend, 'inconsistencias_criticas', criticas);
end $$;

create or replace function public.rg_tem_evidencia_validada(_tipo text, _id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1 from public.research_evidence_links l
    join public.research_evidence_items e on e.id = l.evidence_item_id
    where l.entity_type = _tipo and l.entity_id = _id and l.archived_at is null
      and l.link_role in ('supports','identifies','dates','locates')
      and e.evidence_status = 'validated' and e.archived_at is null)
$$;

-- ---------- Triggers utilitários ----------
create or replace function public.fn_rg_meta()
returns trigger language plpgsql set search_path=public as $$
begin
  if TG_OP = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  else
    new.updated_at := now();
    new.updated_by := coalesce(auth.uid(), new.updated_by);
    if new.archived_at is not null and old.archived_at is null then
      if new.archive_reason is null or length(btrim(new.archive_reason)) < 5 then
        raise exception 'Arquivamento exige motivo (archive_reason).';
      end if;
      new.archived_by := coalesce(new.archived_by, auth.uid());
    end if;
  end if;
  return new;
end $$;

create or replace function public.fn_rg_audit()
returns trigger language plpgsql security definer set search_path=public as $$
declare rc uuid; tipo text; org uuid; jnew jsonb; jold jsonb;
begin
  org := new.organization_id;
  jnew := to_jsonb(new);
  jold := case when TG_OP = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  rc := nullif(jnew->>'research_case_id','')::uuid;
  if TG_TABLE_NAME = 'research_cases' then rc := new.id; end if;
  if TG_OP = 'INSERT' then tipo := 'created';
  elsif (jnew->>'archived_at') is not null and (jold->>'archived_at') is null then tipo := 'archived';
  elsif (jnew->>'status') is distinct from (jold->>'status') then tipo := 'status_changed';
  else tipo := 'updated';
  end if;
  insert into public.research_audit_events(organization_id, research_case_id, entity_type, entity_id, event_type, actor_user_id, metadata)
  values (org, rc, TG_TABLE_NAME, new.id, tipo, auth.uid(),
          jsonb_strip_nulls(jsonb_build_object('status', jnew->>'status', 'op', TG_OP)));
  return new;
end $$;

create or replace function public.fn_rg_evidencia_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare gate jsonb;
begin
  if new.sensitivity_level = 'highly_restricted' and new.client_visibility <> 'never' then
    raise exception 'Dado altamente restrito não pode ser visível ao cliente.';
  end if;
  if new.evidence_status = 'validated' then
    if new.source_id is null and new.document_id is null and coalesce(btrim(new.external_reference),'') = '' then
      raise exception 'Evidência validada exige fonte, documento ou referência.';
    end if;
    if new.validated_by is null and new.reviewed_by is null then
      raise exception 'Evidência validada exige responsável pela revisão.';
    end if;
    if new.validated_at is null and new.reviewed_at is null then
      raise exception 'Evidência validada exige data de revisão.';
    end if;
    if coalesce(length(btrim(new.validation_rationale)),0) < 20 then
      raise exception 'Evidência validada exige justificativa com pelo menos 20 caracteres.';
    end if;
  end if;
  if new.evidence_status = 'discarded' and coalesce(length(btrim(new.discard_reason)),0) < 5 then
    raise exception 'Evidência descartada exige motivo.';
  end if;
  if TG_OP = 'INSERT' and new.origem_externa and not new.fornecida_pelo_cliente then
    gate := public.pode_iniciar_pesquisa_externa(new.research_case_id);
    if (gate->>'permitido')::boolean is not true then
      insert into public.research_audit_events(organization_id, research_case_id, entity_type, entity_id, event_type, metadata)
      values (new.organization_id, new.research_case_id, 'research_evidence_items', null, 'external_action_blocked',
              jsonb_build_object('estado', gate->>'estado'));
      raise exception '%', gate->>'mensagem';
    end if;
  end if;
  if new.client_visibility = 'released' and new.evidence_status <> 'validated' then
    raise exception 'Somente evidência validada pode ser liberada.';
  end if;
  return new;
end $$;

create or replace function public.fn_rg_relacao_guard()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status = 'validated' and not public.rg_tem_evidencia_validada('relationship', new.id) then
    raise exception 'Relação validada exige ao menos uma evidência validada vinculada.';
  end if;
  if new.status = 'validated' then
    new.validated_by := coalesce(new.validated_by, auth.uid());
    new.validated_at := coalesce(new.validated_at, now());
  end if;
  new.supporting_evidence_count := (
    select count(*) from public.research_evidence_links l join public.research_evidence_items e on e.id = l.evidence_item_id
     where l.entity_type='relationship' and l.entity_id = new.id and e.evidence_status='validated' and e.archived_at is null);
  return new;
end $$;

create or replace function public.fn_rg_evento_guard()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status = 'validated' and not public.rg_tem_evidencia_validada('event', new.id) then
    raise exception 'Evento validado exige ao menos uma evidência validada vinculada.';
  end if;
  return new;
end $$;

create or replace function public.fn_rg_pedido_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare gate jsonb;
begin
  if new.external_action_required then
    gate := public.pode_iniciar_pesquisa_externa(new.research_case_id);
    new.external_gate_status := gate->>'estado';
    if (gate->>'permitido')::boolean is not true
       and new.status not in ('draft','blocked_by_gate','cancelled','archived') then
      insert into public.research_audit_events(organization_id, research_case_id, entity_type, entity_id, event_type, metadata)
      values (new.organization_id, new.research_case_id, 'research_document_requests', new.id, 'external_action_blocked',
              jsonb_build_object('estado', gate->>'estado'));
      new.status := 'blocked_by_gate';
    end if;
  else
    new.external_gate_status := 'not_applicable';
  end if;
  return new;
end $$;

create or replace function public.fn_rg_pendencia_guard()
returns trigger language plpgsql set search_path=public as $$
begin
  if TG_OP='UPDATE' and new.status = 'resolved' and old.status <> 'resolved' then
    if coalesce(length(btrim(new.resolution_note)),0) < 5 then
      raise exception 'Resolução de pendência exige nota.';
    end if;
    new.resolved_by := coalesce(new.resolved_by, auth.uid());
    new.resolved_at := coalesce(new.resolved_at, now());
  end if;
  return new;
end $$;

create or replace function public.fn_rg_pessoa_guard()
returns trigger language plpgsql set search_path=public as $$
begin
  if (new.living_status = 'living' or new.is_minor) and new.sensitivity_level = 'standard' then
    new.sensitivity_level := case when new.is_minor then 'highly_restricted' else 'restricted' end;
  end if;
  if new.sensitivity_level = 'highly_restricted' then new.visible_to_client_summary := false; end if;
  if new.identity_status = 'confirmed' and exists (
      select 1 from public.research_relationships r
       where r.archived_at is null and r.status = 'conflicting'
         and (r.person_a_id = new.id or r.person_b_id = new.id)) then
    raise exception 'Identidade não pode ser confirmada com relação conflitante em aberto.';
  end if;
  return new;
end $$;

create or replace function public.fn_rg_resumo_cliente_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare txt text;
begin
  txt := lower(coalesce(new.title_client_facing,'') || ' ' || coalesce(new.summary_client_facing,''));
  if txt ~ '(hip[oó]tese|probabilidad|chance|elegibilidad|eleg[ií]vel|[êe]xito|garantia|prazo garantido|r\$|pre[çc]o|http|familysearch|sku)' then
    insert into public.research_audit_events(organization_id, research_case_id, entity_type, entity_id, event_type, metadata)
    values (new.organization_id, new.research_case_id, 'research_client_summaries', new.id, 'client_visibility_blocked', '{}'::jsonb);
    raise exception 'Resumo cliente-facing não pode conter hipótese, probabilidade, elegibilidade, preço ou referência de fonte.';
  end if;
  if new.status in ('approved_for_release','released') and new.approved_by is null then
    raise exception 'Resumo cliente-facing exige aprovação humana registrada.';
  end if;
  if new.status = 'released' and (new.released_by is null or new.released_at is null) then
    raise exception 'Liberação de resumo exige usuário e data de liberação.';
  end if;
  return new;
end $$;

create or replace function public.fn_rg_relatorio_guard()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.status = 'released' and (new.approved_by is null or new.client_release_authorized_by is null) then
    raise exception 'Relatório cliente-facing exige aprovação e liberação humana.';
  end if;
  return new;
end $$;

create or replace function public.fn_rg_case_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare gate jsonb;
begin
  if TG_OP='UPDATE' and new.archived_at is not null and old.archived_at is null then
    if exists (select 1 from public.research_pending_items p
                where p.research_case_id = new.id and p.severity='critical'
                  and p.status in ('open','in_progress','blocked') and p.archived_at is null)
       and not public.rg_admin(new.organization_id) then
      raise exception 'Pesquisa com pendência crítica aberta só pode ser arquivada por admin com justificativa.';
    end if;
  end if;
  if new.external_research_gate_status = 'released_by_authorized_user'
     and (TG_OP='INSERT' or old.external_research_gate_status is distinct from 'released_by_authorized_user') then
    if not (public.rg_admin(new.organization_id) or public.staff_meu_papel(new.organization_id) = 'operacoes'::app_role) then
      raise exception 'Somente admin ou operações podem registrar a liberação de pesquisa externa.';
    end if;
  elsif TG_OP='UPDATE' then
    gate := public.pode_iniciar_pesquisa_externa(new.id);
    if gate is not null then
      new.external_research_gate_status := gate->>'estado';
    end if;
  end if;
  return new;
end $$;

-- ---------- Grants, RLS e triggers ----------
do $$
declare t text; tabelas text[] := array[
  'research_cases','research_people','research_name_variants','research_relationships',
  'research_case_events','research_sources','research_evidence_items','research_evidence_links',
  'research_case_hypotheses','research_document_requests','research_pending_items',
  'research_reports','research_client_summaries','research_audit_events'];
begin
  foreach t in array tabelas loop
    execute format('grant select, insert, update on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    if t <> 'research_audit_events' then
      execute format('create trigger trg_%s_meta before insert or update on public.%I for each row execute function public.fn_rg_meta()', t, t);
      execute format('create trigger trg_%s_audit after insert or update on public.%I for each row execute function public.fn_rg_audit()', t, t);
    end if;
    execute format('create trigger trg_%s_no_delete before delete on public.%I for each row execute function public.fn_block_delete()', t, t);
  end loop;
end $$;

create trigger trg_rg_case_guard before insert or update on public.research_cases for each row execute function public.fn_rg_case_guard();
create trigger trg_rg_pessoa_guard before insert or update on public.research_people for each row execute function public.fn_rg_pessoa_guard();
create trigger trg_rg_relacao_guard before insert or update on public.research_relationships for each row execute function public.fn_rg_relacao_guard();
create trigger trg_rg_evento_guard before insert or update on public.research_case_events for each row execute function public.fn_rg_evento_guard();
create trigger trg_rg_evidencia_guard before insert or update on public.research_evidence_items for each row execute function public.fn_rg_evidencia_guard();
create trigger trg_rg_pedido_guard before insert or update on public.research_document_requests for each row execute function public.fn_rg_pedido_guard();
create trigger trg_rg_pendencia_guard before insert or update on public.research_pending_items for each row execute function public.fn_rg_pendencia_guard();
create trigger trg_rg_relatorio_guard before insert or update on public.research_reports for each row execute function public.fn_rg_relatorio_guard();
create trigger trg_rg_resumo_guard before insert or update on public.research_client_summaries for each row execute function public.fn_rg_resumo_cliente_guard();

do $$
declare t text; tabelas text[] := array[
  'research_people','research_relationships','research_case_events','research_evidence_items',
  'research_case_hypotheses','research_document_requests','research_pending_items',
  'research_reports','research_client_summaries'];
begin
  foreach t in array tabelas loop
    execute format('create policy "%s_read" on public.%I for select to authenticated using (public.rg_ler_detalhe(organization_id))', t, t);
    execute format('create policy "%s_insert" on public.%I for insert to authenticated with check (public.rg_editar(organization_id) and public.rg_pode_editar_caso(research_case_id))', t, t);
    execute format('create policy "%s_update" on public.%I for update to authenticated using (public.rg_editar(organization_id) and public.rg_pode_editar_caso(research_case_id)) with check (public.rg_editar(organization_id) and public.rg_pode_editar_caso(research_case_id))', t, t);
  end loop;
end $$;

create policy "research_cases_read" on public.research_cases for select to authenticated using (public.rg_ler_resumo(organization_id));
create policy "research_cases_insert" on public.research_cases for insert to authenticated with check (public.rg_editar(organization_id) and exists (select 1 from public.crm_casos c where c.id = case_id and c.organization_id = research_cases.organization_id));
create policy "research_cases_update" on public.research_cases for update to authenticated using (public.rg_pode_editar_caso(id)) with check (public.rg_pode_editar_caso(id));

create policy "research_sources_read" on public.research_sources for select to authenticated using (public.rg_ler_detalhe(organization_id));
create policy "research_sources_insert" on public.research_sources for insert to authenticated with check (public.rg_editar(organization_id) and (research_case_id is null or public.rg_pode_editar_caso(research_case_id)));
create policy "research_sources_update" on public.research_sources for update to authenticated using (public.rg_editar(organization_id) and (research_case_id is null or public.rg_pode_editar_caso(research_case_id))) with check (public.rg_editar(organization_id) and (research_case_id is null or public.rg_pode_editar_caso(research_case_id)));

create policy "research_name_variants_read" on public.research_name_variants for select to authenticated using (public.rg_ler_detalhe(organization_id));
create policy "research_name_variants_insert" on public.research_name_variants for insert to authenticated with check (public.rg_editar(organization_id) and exists (select 1 from public.research_people p where p.id = person_id and public.rg_pode_editar_caso(p.research_case_id)));
create policy "research_name_variants_update" on public.research_name_variants for update to authenticated using (public.rg_editar(organization_id)) with check (public.rg_editar(organization_id));

create policy "research_evidence_links_read" on public.research_evidence_links for select to authenticated using (public.rg_ler_detalhe(organization_id));
create policy "research_evidence_links_insert" on public.research_evidence_links for insert to authenticated with check (public.rg_editar(organization_id) and exists (select 1 from public.research_evidence_items e where e.id = evidence_item_id and public.rg_pode_editar_caso(e.research_case_id)));
create policy "research_evidence_links_update" on public.research_evidence_links for update to authenticated using (public.rg_editar(organization_id)) with check (public.rg_editar(organization_id));

create policy "research_audit_events_read" on public.research_audit_events for select to authenticated using (public.rg_ler_detalhe(organization_id));
create policy "research_audit_events_insert" on public.research_audit_events for insert to authenticated with check (public.rg_editar(organization_id));

-- ---------- Qualidade de pesquisa ----------
create or replace function public.research_quality_scan(_org uuid)
returns table(criadas integer, sanadas integer, abertas integer)
language plpgsql security definer set search_path=public as $$
declare v_criadas int := 0; v_sanadas int := 0; v_abertas int := 0;
begin
  if not public.is_staff_ativo(_org) then raise exception 'Acesso interno não autorizado.'; end if;

  create temp table _rg_achados (
    regra_key text, dominio text, severidade text, entidade text, entidade_id uuid,
    case_id uuid, titulo text, detalhe text) on commit drop;

  insert into _rg_achados
  select 'rg_evidencia_validada_sem_fonte','pesquisa','critica','research_evidence_items',e.id,rc.case_id,
         'Evidência validada sem fonte, documento ou referência',
         'A evidência "'||e.title||'" está validada sem lastro documental.'
  from research_evidence_items e join research_cases rc on rc.id = e.research_case_id
  where e.organization_id = _org and e.archived_at is null and e.evidence_status='validated'
    and e.source_id is null and e.document_id is null and coalesce(btrim(e.external_reference),'')='';

  insert into _rg_achados
  select 'rg_sensivel_visivel','pesquisa','critica','research_evidence_items',e.id,rc.case_id,
         'Dado altamente restrito com visibilidade cliente-facing',
         'A evidência "'||e.title||'" é altamente restrita e não pode ser exposta.'
  from research_evidence_items e join research_cases rc on rc.id = e.research_case_id
  where e.organization_id = _org and e.archived_at is null
    and e.sensitivity_level='highly_restricted' and e.client_visibility <> 'never';

  insert into _rg_achados
  select 'rg_relacao_validada_sem_evidencia','pesquisa','alta','research_relationships',r.id,rc.case_id,
         'Relação validada sem evidência validada',
         'Relação validada sem evidência validada vinculada.'
  from research_relationships r join research_cases rc on rc.id = r.research_case_id
  where r.organization_id = _org and r.archived_at is null and r.status='validated'
    and not public.rg_tem_evidencia_validada('relationship', r.id);

  insert into _rg_achados
  select 'rg_evento_validado_sem_evidencia','pesquisa','alta','research_case_events',ev.id,rc.case_id,
         'Evento validado sem evidência validada',
         'Evento validado sem evidência validada vinculada.'
  from research_case_events ev join research_cases rc on rc.id = ev.research_case_id
  where ev.organization_id = _org and ev.archived_at is null and ev.status='validated'
    and not public.rg_tem_evidencia_validada('event', ev.id);

  insert into _rg_achados
  select 'rg_fonte_verificada_sem_revisao','pesquisa','alta','research_sources',s.id,rc.case_id,
         'Fonte externa verificada sem revisão registrada',
         'A fonte "'||s.title||'" está marcada como verificada sem revisor ou data.'
  from research_sources s left join research_cases rc on rc.id = s.research_case_id
  where s.organization_id = _org and s.archived_at is null and s.external_source
    and s.source_status='verified' and (s.reviewed_by is null or s.reviewed_at is null);

  insert into _rg_achados
  select 'rg_pesquisa_sem_responsavel','pesquisa','media','research_cases',rc.id,rc.case_id,
         'Pesquisa sem responsável designado','Defina um pesquisador responsável.'
  from research_cases rc
  where rc.organization_id = _org and rc.archived_at is null
    and rc.status not in ('not_started','completed','archived') and rc.assigned_researcher_user_id is null;

  insert into _rg_achados
  select 'rg_pendencia_vencida','pesquisa','media','research_pending_items',p.id,rc.case_id,
         'Pendência de pesquisa vencida','A pendência "'||p.title||'" passou do prazo.'
  from research_pending_items p join research_cases rc on rc.id = p.research_case_id
  where p.organization_id = _org and p.archived_at is null and p.due_at is not null
    and p.due_at < now() and p.status in ('open','in_progress','blocked');

  insert into _rg_achados
  select 'rg_pendencia_critica_aberta','pesquisa','critica','research_pending_items',p.id,rc.case_id,
         'Pendência crítica de pesquisa em aberto','A pendência "'||p.title||'" bloqueia a liberação externa.'
  from research_pending_items p join research_cases rc on rc.id = p.research_case_id
  where p.organization_id = _org and p.archived_at is null and p.severity='critical'
    and p.status in ('open','in_progress','blocked');

  insert into _rg_achados
  select 'rg_pesquisa_sem_proxima_acao','pesquisa','baixa','research_cases',rc.id,rc.case_id,
         'Pesquisa sem próxima ação definida','Registre a próxima ação de pesquisa.'
  from research_cases rc
  where rc.organization_id = _org and rc.archived_at is null
    and rc.status in ('preparation','internal_research','awaiting_documents','awaiting_review')
    and coalesce(btrim(rc.next_research_action),'') = '';

  insert into _rg_achados
  select 'rg_fonte_sem_citacao','pesquisa','baixa','research_sources',s.id,rc.case_id,
         'Fonte sem citação registrada','A fonte "'||s.title||'" não possui citação.'
  from research_sources s left join research_cases rc on rc.id = s.research_case_id
  where s.organization_id = _org and s.archived_at is null and coalesce(btrim(s.citation_text),'')='';

  insert into public.quality_issues (organization_id, regra_key, dominio, severidade, entidade, entidade_id, case_id, titulo, detalhe, bloqueia_ativacao)
  select _org, a.regra_key, a.dominio, a.severidade, a.entidade, a.entidade_id, a.case_id, a.titulo, a.detalhe, false
  from _rg_achados a
  on conflict (organization_id, regra_key, entidade, entidade_id) do update
    set status = case when quality_issues.status in ('resolvida','sanada','falso_positivo') then quality_issues.status else 'aberta' end,
        detalhe = excluded.detalhe, updated_at = now();
  get diagnostics v_criadas = row_count;

  update public.quality_issues q set status='sanada', sanada_em=now(), updated_at=now()
   where q.organization_id=_org and q.dominio='pesquisa' and q.status in ('aberta','reconhecida')
     and not exists (select 1 from _rg_achados a where a.regra_key=q.regra_key and a.entidade=q.entidade and a.entidade_id=q.entidade_id);
  get diagnostics v_sanadas = row_count;

  select count(*) into v_abertas from public.quality_issues q
   where q.organization_id=_org and q.dominio='pesquisa' and q.status in ('aberta','reconhecida');

  return query select v_criadas, v_sanadas, v_abertas;
end $$;