ALTER FUNCTION public.fn_linguagem_proibida(text) SET search_path = public;
ALTER FUNCTION public.unaccent_imutavel(text) SET search_path = public;
REVOKE ALL ON FUNCTION public.fn_linguagem_proibida(text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.unaccent_imutavel(text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_gf_guard() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_le_guard() FROM public, anon, authenticated;