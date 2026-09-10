-- 07/09/2026 — versão em lote de proxima_acao_prioritaria para telas de
-- lista (Lista de Casos). Achado real: a Lista de Casos lia
-- crm_casos.proxima_acao cru enquanto a Ficha 360 já usa a RPC
-- proxima_acao_prioritaria (9 níveis, incluindo bloqueio real de ativação,
-- tarefa vencida, documento pendente, proposta/contrato, pagamento). Hoje os
-- dois concordam porque todos os 7 casos ativos estão em nível 1, mas a
-- divergência é estrutural — ver
-- docs/auditorias/mapeamento-duplicatas-todas-abas-07-09.md, seção 2.
CREATE OR REPLACE FUNCTION public.proxima_acao_prioritaria_lote(_cases uuid[])
RETURNS TABLE(case_id uuid, nivel integer, motivo text, origem_tabela text, origem_id uuid, prazo date)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT c.id AS case_id, p.nivel, p.motivo, p.origem_tabela, p.origem_id, p.prazo
  FROM unnest(_cases) AS c(id)
  CROSS JOIN LATERAL public.proxima_acao_prioritaria(c.id) AS p;
$$;
