ALTER TABLE public.case_service_criterios
  ADD COLUMN IF NOT EXISTS justificativa text,
  ADD COLUMN IF NOT EXISTS evidencia_interna text;

CREATE TABLE IF NOT EXISTS public.commercial_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid REFERENCES public.crm_casos(id),
  case_service_id uuid REFERENCES public.case_services(id),
  product_catalog_id uuid REFERENCES public.product_catalog(id),
  codigo text NOT NULL,
  forma_pagamento text,
  parcelas integer,
  valor_parcela numeric(12,2),
  valor_total_referencia numeric(12,2),
  vencimento_dia integer,
  primeiro_vencimento date,
  condicao_aplicavel text,
  status text NOT NULL DEFAULT 'rascunho',
  homologado_por text,
  homologado_em timestamptz,
  origem text NOT NULL DEFAULT 'interna',
  observacao_interna text,
  data_origin text NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT commercial_conditions_status_chk CHECK (status IN ('rascunho','em_revisao','homologada','recusada','substituida')),
  CONSTRAINT commercial_conditions_origin_chk CHECK (data_origin IN ('real','fixture_demo','importado','migrado')),
  CONSTRAINT commercial_conditions_parcelas_chk CHECK (parcelas IS NULL OR parcelas > 0),
  CONSTRAINT commercial_conditions_venc_chk CHECK (vencimento_dia IS NULL OR (vencimento_dia BETWEEN 1 AND 28))
);

GRANT SELECT, INSERT, UPDATE ON public.commercial_conditions TO authenticated;
GRANT ALL ON public.commercial_conditions TO service_role;

ALTER TABLE public.commercial_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY commercial_conditions_sel ON public.commercial_conditions
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY commercial_conditions_ins ON public.commercial_conditions
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY commercial_conditions_upd ON public.commercial_conditions
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_commercial_condition_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p RECORD;
BEGIN
  NEW.updated_at := now();

  IF NEW.status = 'homologada' THEN
    IF NEW.homologado_por IS NULL OR btrim(NEW.homologado_por) = '' OR NEW.homologado_em IS NULL THEN
      RAISE EXCEPTION 'CONDICAO_SEM_HOMOLOGACAO: condição comercial exige responsável e data de homologação.';
    END IF;
    IF NEW.forma_pagamento IS NULL OR btrim(NEW.forma_pagamento) = '' OR NEW.parcelas IS NULL THEN
      RAISE EXCEPTION 'CONDICAO_INCOMPLETA: forma de pagamento e parcelas são obrigatórias para homologar.';
    END IF;
    IF NEW.product_catalog_id IS NULL THEN
      RAISE EXCEPTION 'CONDICAO_SEM_PRODUTO: condição homologada exige produto do catálogo.';
    END IF;
    SELECT homologado_por, homologado_em, vigencia_inicio, vigencia_fim, status_homologacao
      INTO p FROM public.product_catalog WHERE id = NEW.product_catalog_id;
    IF p.status_homologacao <> 'homologado'
       OR p.homologado_por IS NULL OR p.homologado_em IS NULL OR p.vigencia_inicio IS NULL THEN
      RAISE EXCEPTION 'PRECO_NAO_HOMOLOGADO: produto sem homologador, data ou vigência registrada — condição não pode ser homologada.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_commercial_condition_guard ON public.commercial_conditions;
CREATE TRIGGER trg_commercial_condition_guard
  BEFORE INSERT OR UPDATE ON public.commercial_conditions
  FOR EACH ROW EXECUTE FUNCTION public.fn_commercial_condition_guard();

DROP TRIGGER IF EXISTS trg_commercial_conditions_no_delete ON public.commercial_conditions;
CREATE TRIGGER trg_commercial_conditions_no_delete
  BEFORE DELETE ON public.commercial_conditions
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE OR REPLACE FUNCTION public.fn_case_service_promocao_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pendentes integer;
  condicoes integer;
BEGIN
  IF NEW.status IN ('approved','contracted','active')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN

    SELECT count(*) INTO pendentes
      FROM public.case_service_criterios c
     WHERE c.case_id = NEW.case_id
       AND c.archived_at IS NULL
       AND c.obrigatorio
       AND (c.status = 'pendente_decisao_humana'
            OR (c.status IN ('aceito','recusado') AND (c.decidido_por IS NULL OR c.decidido_em IS NULL)));
    IF pendentes > 0 THEN
      RAISE EXCEPTION 'CRITERIO_ACEITE_PENDENTE: % critério(s) obrigatório(s) sem decisão humana registrada.', pendentes;
    END IF;

    SELECT count(*) INTO condicoes
      FROM public.commercial_conditions cc
     WHERE cc.case_service_id = NEW.id
       AND cc.archived_at IS NULL
       AND cc.status = 'homologada';
    IF condicoes = 0 THEN
      RAISE EXCEPTION 'CONDICAO_COMERCIAL_NAO_HOMOLOGADA: serviço não pode sair de rascunho sem condição comercial homologada.';
    END IF;

    IF NEW.contrato_referencia_interna IS NULL OR btrim(NEW.contrato_referencia_interna) = '' THEN
      RAISE EXCEPTION 'REFERENCIA_CONTRATUAL_AUSENTE: serviço exige referência contratual interna antes da promoção.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_service_promocao_guard ON public.case_services;
CREATE TRIGGER trg_case_service_promocao_guard
  BEFORE INSERT OR UPDATE ON public.case_services
  FOR EACH ROW EXECUTE FUNCTION public.fn_case_service_promocao_guard();