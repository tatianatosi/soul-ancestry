update public.contract_parameter_values v
set valor = null, status = 'vazio', origem = null, origem_detalhe = null, conflito = '[]'::jsonb,
    justificativa = 'Parametro revogado: convencao homologada do caso e Austria (§ 58c StbG); valores herdados da rota italiana removidos e devolvidos a pendencia.'
from public.contract_case_parameters p, public.crm_casos c
where v.parameters_id = p.id and p.case_id = c.id
  and c.codigo = 'CA-CID-AT-FAM-2026-001'
  and v.origem = 'planejador'
  and v.campo in ('produto_sku','parcelas','despesas_externas');