CREATE OR REPLACE FUNCTION public.caso_saude_cadencia(_case uuid)
RETURNS TABLE(dias_sem_touchpoint integer, status_cadencia text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    GREATEST(0, (current_date - COALESCE(c.ultimo_touchpoint_em, c.created_at)::date))::int,
    CASE
      WHEN c.aguardando_instituicao_externa AND COALESCE(c.motivo_espera_externa,'') <> '' THEN 'regular'
      WHEN (current_date - COALESCE(c.ultimo_touchpoint_em, c.created_at)::date) >= 14 THEN 'critico'
      WHEN (current_date - COALESCE(c.ultimo_touchpoint_em, c.created_at)::date) >= 10 THEN 'atencao'
      ELSE 'regular'
    END
  FROM public.crm_casos c
  WHERE c.id = _case;
$$;

REVOKE EXECUTE ON FUNCTION public.caso_saude_cadencia(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.caso_saude_cadencia(uuid) TO authenticated;