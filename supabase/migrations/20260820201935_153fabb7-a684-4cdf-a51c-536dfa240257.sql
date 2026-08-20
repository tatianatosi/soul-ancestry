REVOKE ALL ON FUNCTION public.nucleo_completude(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.nucleo_completude(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.fn_checklist_pessoa_guard() FROM PUBLIC, anon, authenticated;