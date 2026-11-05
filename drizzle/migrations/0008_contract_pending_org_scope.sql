CREATE OR REPLACE FUNCTION public.contract_parameters_pendencias(_id uuid)
RETURNS TABLE(grupo text, campo text, label text, motivo text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.grupo, v.campo, v.label,
    CASE WHEN v.status = 'vazio' THEN 'Sem dado de origem rastreável'
         WHEN v.status = 'importado_a_confirmar' THEN 'Importado, aguardando confirmação humana'
         WHEN v.status = 'bloqueado' THEN COALESCE(v.justificativa, 'Parâmetro bloqueado')
         ELSE 'Pendente' END
  FROM public.contract_parameter_values v
  JOIN public.contract_case_parameters p ON p.id = v.parameters_id
  WHERE v.parameters_id = _id AND v.archived_at IS NULL
    AND p.archived_at IS NULL
    AND v.organization_id = p.organization_id
    AND v.obrigatorio AND v.status <> 'validado'
    AND public.contract_pode_ler(p.organization_id)
  ORDER BY v.grupo, v.ordem;
$$;