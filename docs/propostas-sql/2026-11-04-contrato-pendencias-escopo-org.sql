-- PROPOSTA (não aplicada) — aguarda aprovação da Proprietária.
-- Alerta: qualquer usuário logado lê pendências de contrato de outra organização.
-- Correção: a função só devolve linhas se quem chama é membro da organização do registro.
-- Idempotente (CREATE OR REPLACE). Não altera dados.
-- Antes: SELECT count(*) FROM public.contract_parameters_pendencias('<id>');  -- como usuário de outra org > 0
CREATE OR REPLACE FUNCTION public.contract_parameters_pendencias(_id uuid)
RETURNS TABLE(grupo text, campo text, label text, motivo text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.grupo, v.campo, v.label,
    CASE WHEN v.status = 'vazio' THEN 'Sem dado de origem rastreável'
         WHEN v.status = 'importado_a_confirmar' THEN 'Importado, aguardando confirmação humana'
         WHEN v.status = 'bloqueado' THEN COALESCE(v.justificativa, 'Parâmetro bloqueado')
         ELSE 'Pendente' END
  FROM public.contract_parameter_values v
  JOIN public.contract_parameters p ON p.id = v.parameters_id
  WHERE v.parameters_id = _id AND v.archived_at IS NULL
    AND v.obrigatorio AND v.status <> 'validado'
    AND public.is_org_member(p.organization_id)
  ORDER BY v.grupo, v.ordem;
$$;
-- Depois: mesma consulta como usuário de outra org deve retornar 0; como membro, igual ao antes.
-- Conferir antes de aplicar: nomes/tipos de colunas de retorno e da tabela contract_parameters.
