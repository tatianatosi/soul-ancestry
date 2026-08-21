
REVOKE ALL ON FUNCTION public.atendimento_bloqueios(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.atendimento_bloqueios(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.fn_atendimento_solicitacao_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_atendimento_entrega_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_atendimento_fatura_guard() FROM PUBLIC, anon, authenticated;
