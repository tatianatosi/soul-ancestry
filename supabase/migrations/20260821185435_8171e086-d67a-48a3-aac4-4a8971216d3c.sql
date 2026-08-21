REVOKE EXECUTE ON FUNCTION public.fn_authorized_portal_email_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_portal_access_autorizacao_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_portal_case_access_guard() FROM anon, authenticated, public;