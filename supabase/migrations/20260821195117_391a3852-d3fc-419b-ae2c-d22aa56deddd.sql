REVOKE EXECUTE ON FUNCTION public.case_activation_gates(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.case_activacao_bloqueios(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.case_activation_gates(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.case_activacao_bloqueios(uuid) TO authenticated, service_role;