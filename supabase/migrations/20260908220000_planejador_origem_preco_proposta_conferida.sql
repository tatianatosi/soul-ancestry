-- 08/09/2026 — o Planejador foi criado para o caso NAO depender de SKU.
-- fn_blueprint_guard e o CHECK de origem_preco so aceitavam preco vindo de
-- product_catalog ou de excecao comercial, reintroduzindo o SKU como premissa e
-- travando o caso CA-CID-AT-FAM-2026-001 (Ana Luiza): blueprint completo,
-- proposta Canva conferida 7/7 sem campos faltando, mas o codigo
-- PROD-DIAG-FAM-MULTI nao existe em product_catalog.
--
-- Nova origem 'proposta_aprovada_conferida'. Nao e brecha: exige proposta
-- vinculada, aprovada, e conferencia Canva concluida em todas as paginas sem
-- campos nao localizados. Autorizado pela proprietaria em 08/09/2026.
-- (Conteudo aplicado via migrations planejador_origem_preco_proposta_conferida,
--  _fix_tipo e blueprint_origem_preco_aceita_proposta_conferida.)

ALTER TABLE public.blueprint_parameters DROP CONSTRAINT IF EXISTS blueprint_origem_preco_chk;
ALTER TABLE public.blueprint_parameters ADD CONSTRAINT blueprint_origem_preco_chk
  CHECK (origem_preco = ANY (ARRAY['product_catalog'::text, 'excecao_comercial_aprovada'::text, 'proposta_aprovada_conferida'::text]));
