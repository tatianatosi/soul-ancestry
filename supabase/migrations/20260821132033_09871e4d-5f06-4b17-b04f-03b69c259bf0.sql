ALTER TABLE public.product_catalog
  ADD COLUMN IF NOT EXISTS status_produto text NOT NULL DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS versao_vigencia text,
  ADD COLUMN IF NOT EXISTS data_ultima_validacao date,
  ADD COLUMN IF NOT EXISTS responsavel_homologacao text,
  ADD COLUMN IF NOT EXISTS link_asaas_validado text,
  ADD COLUMN IF NOT EXISTS status_link_asaas text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS observacao_de_governanca text;

ALTER TABLE public.product_catalog DROP CONSTRAINT IF EXISTS product_catalog_status_produto_chk;
ALTER TABLE public.product_catalog ADD CONSTRAINT product_catalog_status_produto_chk
  CHECK (status_produto IN ('ativo','inativo','arquivado','historico','descontinuado'));

ALTER TABLE public.product_catalog DROP CONSTRAINT IF EXISTS product_catalog_status_link_chk;
ALTER TABLE public.product_catalog ADD CONSTRAINT product_catalog_status_link_chk
  CHECK (status_link_asaas IN ('pendente','validado','desatualizado','nao_aplicavel'));

ALTER TABLE public.product_catalog DROP CONSTRAINT IF EXISTS product_catalog_status_homolog_chk;
ALTER TABLE public.product_catalog ADD CONSTRAINT product_catalog_status_homolog_chk
  CHECK (status_homologacao IN ('homologado','em_revisao','bloqueado','arquivado'));

CREATE OR REPLACE FUNCTION public.fn_catalogo_homologacao_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Divergência de link ou ausência de preço/escopo homologado bloqueia a oferta.
  IF NEW.status_homologacao = 'homologado'
     AND (NEW.status_link_asaas = 'desatualizado'
          OR NEW.preco_comercial_vigente IS NULL
          OR NEW.escopo_aprovado IS NULL) THEN
    NEW.status_homologacao := 'bloqueado';
    NEW.observacao_de_governanca := coalesce(NEW.observacao_de_governanca, '')
      || ' [Bloqueado por validação comercial: preço, escopo ou link divergente.]';
  END IF;

  NEW.elegivel_para_proposta := (
    NEW.ativo IS TRUE
    AND NEW.status_produto = 'ativo'
    AND NEW.status_homologacao = 'homologado'
    AND NEW.status_link_asaas IN ('validado','nao_aplicavel')
    AND NEW.archived_at IS NULL
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_catalogo_homologacao_guard ON public.product_catalog;
CREATE TRIGGER trg_catalogo_homologacao_guard
  BEFORE INSERT OR UPDATE ON public.product_catalog
  FOR EACH ROW EXECUTE FUNCTION public.fn_catalogo_homologacao_guard();