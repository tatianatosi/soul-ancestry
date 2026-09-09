-- CRM Vivo — "Uma próxima ação" (seção 3.4 de
-- docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md): todo caso ativo
-- deve ter exatamente uma próxima ação prioritária, calculada pela mesma
-- ordem em qualquer tela que a mostre (Painel Hoje, Caso 360, Lista de
-- Casos). Antes de hoje cada tela calculava (ou não calculava) isso à sua
-- própria maneira; esta função é a única fonte.
--
-- Ordem de prioridade (a mesma do documento, níveis 1-6, 8-9; o nível 7
-- "milestone planejado mais próximo" foi omitido porque não existe hoje
-- nenhuma tabela de milestones de caso no banco — não inventado aqui).
create or replace function public.proxima_acao_prioritaria(_case uuid)
returns table (
  nivel int,
  motivo text,
  origem_tabela text,
  origem_id uuid,
  prazo date
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Nível 1: pendência bloqueante de ativação (já projetada por
  -- case_ativacao_bloqueios_reais, criada em 20260905120000).
  if exists (select 1 from case_ativacao_bloqueios_reais(_case)) then
    return query
      select 1, b.motivo, 'case_ativacao_bloqueios_reais'::text, null::uuid, null::date
      from case_ativacao_bloqueios_reais(_case) b
      limit 1;
    return;
  end if;

  -- Nível 2: tarefa vencida.
  if exists (
    select 1 from tarefas t
    where t.caso_id = _case and t.archived_at is null
      and t.status not in ('concluida', 'cancelada') and t.prazo < current_date
  ) then
    return query
      select 2, 'Tarefa vencida: ' || t.titulo, 'tarefas'::text, t.id, t.prazo
      from tarefas t
      where t.caso_id = _case and t.archived_at is null
        and t.status not in ('concluida', 'cancelada') and t.prazo < current_date
      order by t.prazo asc
      limit 1;
    return;
  end if;

  -- Nível 3: tarefa com vencimento hoje.
  if exists (
    select 1 from tarefas t
    where t.caso_id = _case and t.archived_at is null
      and t.status not in ('concluida', 'cancelada') and t.prazo = current_date
  ) then
    return query
      select 3, 'Tarefa com vencimento hoje: ' || t.titulo, 'tarefas'::text, t.id, t.prazo
      from tarefas t
      where t.caso_id = _case and t.archived_at is null
        and t.status not in ('concluida', 'cancelada') and t.prazo = current_date
      order by t.created_at asc
      limit 1;
    return;
  end if;

  -- Nível 4: documento solicitado ao cliente, ainda não recebido.
  if exists (
    select 1 from document_requests d
    where d.case_id = _case and d.archived_at is null and d.received_at is null
  ) then
    return query
      select 4, 'Documento solicitado ao cliente: ' || coalesce(d.document_type, d.full_name_text, 'sem descrição'),
             'document_requests'::text, d.id, d.next_action_due
      from document_requests d
      where d.case_id = _case and d.archived_at is null and d.received_at is null
      order by coalesce(d.next_action_due, d.requested_at) asc nulls last
      limit 1;
    return;
  end if;

  -- Nível 5: proposta ou contrato aguardando resposta.
  if exists (
    select 1 from proposals p
    where p.case_id = _case and p.archived_at is null and p.status in ('enviada', 'em_negociacao')
  ) then
    return query
      select 5, 'Proposta aguardando resposta (enviada em ' || to_char(p.enviada_em, 'DD/MM') || ')',
             'proposals'::text, p.id, p.validade
      from proposals p
      where p.case_id = _case and p.archived_at is null and p.status in ('enviada', 'em_negociacao')
      order by p.enviada_em asc nulls last
      limit 1;
    return;
  end if;
  if exists (
    select 1 from contracts c
    where c.case_id = _case and c.archived_at is null and c.status = 'sent'
  ) then
    return query
      select 5, 'Contrato aguardando assinatura'::text, 'contracts'::text, c.id, null::date
      from contracts c
      where c.case_id = _case and c.archived_at is null and c.status = 'sent'
      limit 1;
    return;
  end if;

  -- Nível 6: pagamento pendente ou vencido.
  if exists (
    select 1 from invoices i
    where i.case_id = _case and i.archived_at is null and i.status in ('pendente', 'vencida')
  ) then
    return query
      select 6,
             case when i.status = 'vencida' then 'Pagamento vencido' else 'Pagamento pendente' end
               || coalesce(' (vencimento ' || to_char(i.vencimento, 'DD/MM') || ')', ''),
             'invoices'::text, i.id, i.vencimento
      from invoices i
      where i.case_id = _case and i.archived_at is null and i.status in ('pendente', 'vencida')
      order by i.vencimento asc nulls last
      limit 1;
    return;
  end if;

  -- Nível 8: próxima ação manual definida pela proprietária (crm_casos.proxima_acao).
  if exists (
    select 1 from crm_casos cc
    where cc.id = _case and cc.proxima_acao is not null and btrim(cc.proxima_acao) <> ''
  ) then
    return query
      select 8, cc.proxima_acao, 'crm_casos'::text, cc.id, cc.prazo_proxima_acao
      from crm_casos cc
      where cc.id = _case
      limit 1;
    return;
  end if;

  -- Nível 9: nada calculável — fallback explícito, nunca silêncio.
  return query select 9, 'Definir próximo passo'::text, null::text, null::uuid, null::date;
end;
$$;

comment on function public.proxima_acao_prioritaria(uuid) is
  'CRM Vivo — próxima ação prioritária única por caso (níveis 1-6,8-9 de PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md secao 3.4). Nível 7 (milestone) omitido: não existe tabela de milestones de caso hoje.';
