REVOKE ALL ON FUNCTION public.fn_sku_price_exception_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_third_party_expense_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sku_preco_homologado(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sku_preco_homologado(uuid, text) TO authenticated, service_role;