ALTER FUNCTION public.fn_crm_interaction_imutavel() SET search_path TO 'public';
ALTER FUNCTION public.fn_g07_institution_guard() SET search_path TO 'public';
REVOKE EXECUTE ON FUNCTION public.fn_crm_interaction_imutavel() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_g07_institution_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_g07_plan_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_g07_plan_pos() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_g07_estimate_guard() FROM anon, authenticated;