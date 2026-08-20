REVOKE ALL ON FUNCTION public.fn_case_codigo_canonico() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_case_alias_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_case_alias_imutavel() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_lead_case_id_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_deck_referencia_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gerar_case_id(uuid, text, boolean, int) FROM PUBLIC, anon;