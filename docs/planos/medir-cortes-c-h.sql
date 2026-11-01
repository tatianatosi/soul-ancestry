-- Medição de leitura dos cortes C e H (01/11/2026). SOMENTE SELECT.
-- Uso: rodar no banco antes e depois de cada execução e colar os dois resultados
-- no relatório. "Feito" só vale com este antes/depois.
select 'corte_c.itens_do_plano' as medida, count(*)::text as valor
  from research_action_plan_items where archived_at is null
union all
select 'corte_c.itens_com_custo', count(*)::text
  from research_action_plan_items where archived_at is null and estimated_cost_amount is not null
union all
select 'corte_c.itens_com_prazo', count(*)::text
  from research_action_plan_items where archived_at is null and due_date is not null
union all
select 'corte_c.despesa_' || coalesce(expense_approval_status, 'sem_status'), count(*)::text
  from research_action_plan_items where archived_at is null group by expense_approval_status
union all
select 'corte_h.parametros_' || coalesce(status, 'sem_status') || '_aprovado_' || (aprovado_por is not null)::text, count(*)::text
  from contract_case_parameters where archived_at is null group by status, aprovado_por is not null
union all
select 'corte_h.previa_' || coalesce(tipo, 'sem_tipo') || '_' || coalesce(estado, 'sem_estado'), count(*)::text
  from contract_parameter_previews where archived_at is null group by tipo, estado
order by 1;
