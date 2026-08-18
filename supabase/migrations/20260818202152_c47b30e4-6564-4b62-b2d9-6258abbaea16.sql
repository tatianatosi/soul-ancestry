-- 1) Planilha mestre de SKU (preços homologados)
CREATE TABLE public.sku_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  sku text NOT NULL,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  moeda text NOT NULL DEFAULT 'BRL',
  preco_total numeric(14,2),
  condicao_pagamento text,
  parcelas integer,
  entrada numeric(14,2),
  vigencia_inicio date NOT NULL DEFAULT current_date,
  vigencia_fim date,
  homologado boolean NOT NULL DEFAULT false,
  homologado_por uuid REFERENCES auth.users(id),
  homologado_em timestamptz,
  fonte text NOT NULL DEFAULT 'planilha_mestre',
  observacoes text,
  demo boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT sku_catalog_fonte_chk CHECK (fonte = 'planilha_mestre'),
  CONSTRAINT sku_catalog_vigencia_chk CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);
CREATE UNIQUE INDEX sku_catalog_sku_vig_uidx ON public.sku_catalog (organization_id, sku, vigencia_inicio);

GRANT SELECT, INSERT, UPDATE ON public.sku_catalog TO authenticated;
GRANT ALL ON public.sku_catalog TO service_role;
ALTER TABLE public.sku_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sku_catalog_select" ON public.sku_catalog FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "sku_catalog_insert" ON public.sku_catalog FOR INSERT TO authenticated WITH CHECK (public.can_write_financeiro(organization_id));
CREATE POLICY "sku_catalog_update" ON public.sku_catalog FOR UPDATE TO authenticated USING (public.can_write_financeiro(organization_id)) WITH CHECK (public.can_write_financeiro(organization_id));

-- 2) Exceções comerciais de preço
CREATE TABLE public.sku_price_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  sku text NOT NULL,
  case_id uuid REFERENCES public.crm_casos(id),
  contract_id uuid REFERENCES public.contracts(id),
  preco_total numeric(14,2),
  condicao_pagamento text,
  moeda text NOT NULL DEFAULT 'BRL',
  motivo text NOT NULL,
  responsavel text NOT NULL,
  aprovado_por uuid REFERENCES auth.users(id),
  aprovado_em timestamptz,
  valido_ate date NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  demo boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT sku_price_exceptions_status_chk CHECK (status IN ('pendente','aprovada','revogada','expirada'))
);
GRANT SELECT, INSERT, UPDATE ON public.sku_price_exceptions TO authenticated;
GRANT ALL ON public.sku_price_exceptions TO service_role;
ALTER TABLE public.sku_price_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sku_price_exc_select" ON public.sku_price_exceptions FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "sku_price_exc_insert" ON public.sku_price_exceptions FOR INSERT TO authenticated WITH CHECK (public.can_write_financeiro(organization_id));
CREATE POLICY "sku_price_exc_update" ON public.sku_price_exceptions FOR UPDATE TO authenticated USING (public.can_write_financeiro(organization_id)) WITH CHECK (public.can_write_financeiro(organization_id));

CREATE OR REPLACE FUNCTION public.fn_sku_price_exception_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(btrim(NEW.motivo),'') = '' THEN
    RAISE EXCEPTION 'Exceção comercial exige motivo registrado.';
  END IF;
  IF coalesce(btrim(NEW.responsavel),'') = '' THEN
    RAISE EXCEPTION 'Exceção comercial exige responsável identificado.';
  END IF;
  IF NEW.status = 'aprovada' AND (NEW.aprovado_por IS NULL OR NEW.aprovado_em IS NULL) THEN
    RAISE EXCEPTION 'Exceção comercial só pode ser aprovada com aprovador humano e data de aprovação.';
  END IF;
  IF NEW.status = 'aprovada' AND NEW.valido_ate < current_date THEN
    RAISE EXCEPTION 'Exceção comercial aprovada exige validade futura.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_sku_price_exception_guard BEFORE INSERT OR UPDATE ON public.sku_price_exceptions
FOR EACH ROW EXECUTE FUNCTION public.fn_sku_price_exception_guard();

-- 3) Despesas de terceiros
CREATE TABLE public.third_party_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid REFERENCES public.crm_casos(id),
  contract_id uuid REFERENCES public.contracts(id),
  descricao text NOT NULL,
  categoria text,
  estado text NOT NULL DEFAULT 'estimativa_pendente',
  estimativa_min numeric(14,2),
  estimativa_max numeric(14,2),
  moeda text NOT NULL DEFAULT 'BRL',
  pagador text NOT NULL DEFAULT 'cliente',
  comunicado_em timestamptz,
  aprovado_pelo_cliente_em timestamptz,
  aprovacao_evidencia text,
  executado_em timestamptz,
  valor_pago numeric(14,2),
  excecao_id uuid REFERENCES public.contract_exceptions(id),
  observacoes text,
  demo boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT tpe_estado_chk CHECK (estado IN (
    'nao_aplicavel','estimativa_pendente','estimada_comunicada','aguardando_aprovacao',
    'aprovada','paga_diretamente_pelo_cliente','parcialmente_paga','pendencia_do_cliente')),
  CONSTRAINT tpe_pagador_chk CHECK (pagador IN ('cliente','terceiro_autorizado')),
  CONSTRAINT tpe_faixa_chk CHECK (estimativa_max IS NULL OR estimativa_min IS NULL OR estimativa_max >= estimativa_min)
);
GRANT SELECT, INSERT, UPDATE ON public.third_party_expenses TO authenticated;
GRANT ALL ON public.third_party_expenses TO service_role;
ALTER TABLE public.third_party_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tpe_select" ON public.third_party_expenses FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "tpe_insert" ON public.third_party_expenses FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "tpe_update" ON public.third_party_expenses FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_third_party_expense_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(btrim(NEW.descricao),'') = '' THEN
    RAISE EXCEPTION 'Despesa de terceiro exige descrição.';
  END IF;
  IF NEW.estado <> 'nao_aplicavel' THEN
    IF NEW.estado <> 'estimativa_pendente' AND NEW.estimativa_min IS NULL AND NEW.estimativa_max IS NULL THEN
      RAISE EXCEPTION 'Despesa aplicável exige estimativa ou faixa antes de ser comunicada.';
    END IF;
    IF NEW.estado IN ('estimada_comunicada','aguardando_aprovacao','aprovada','paga_diretamente_pelo_cliente','parcialmente_paga')
       AND NEW.comunicado_em IS NULL THEN
      RAISE EXCEPTION 'Despesa exige comunicação prévia ao cliente registrada.';
    END IF;
    IF NEW.estado IN ('aprovada','paga_diretamente_pelo_cliente','parcialmente_paga')
       AND (NEW.aprovado_pelo_cliente_em IS NULL OR coalesce(btrim(NEW.aprovacao_evidencia),'') = '') THEN
      RAISE EXCEPTION 'Execução de despesa de terceiro exige aprovação do cliente registrada com evidência.';
    END IF;
    IF NEW.executado_em IS NOT NULL AND NEW.aprovado_pelo_cliente_em IS NULL THEN
      RAISE EXCEPTION 'Despesa não pode ser executada antes da aprovação do cliente.';
    END IF;
  END IF;
  IF NEW.pagador <> 'cliente' AND NEW.excecao_id IS NULL THEN
    RAISE EXCEPTION 'Pagador diferente do cliente exige exceção formal aprovada.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_third_party_expense_guard BEFORE INSERT OR UPDATE ON public.third_party_expenses
FOR EACH ROW EXECUTE FUNCTION public.fn_third_party_expense_guard();

-- Sem exclusão física
CREATE TRIGGER trg_sku_catalog_no_delete BEFORE DELETE ON public.sku_catalog FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_sku_price_exc_no_delete BEFORE DELETE ON public.sku_price_exceptions FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
CREATE TRIGGER trg_tpe_no_delete BEFORE DELETE ON public.third_party_expenses FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- updated_at
CREATE TRIGGER trg_sku_catalog_touch BEFORE UPDATE ON public.sku_catalog FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();
CREATE TRIGGER trg_sku_price_exc_touch BEFORE UPDATE ON public.sku_price_exceptions FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();
CREATE TRIGGER trg_tpe_touch BEFORE UPDATE ON public.third_party_expenses FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();

-- 4) Conferência de preço homologado do SKU
CREATE OR REPLACE FUNCTION public.sku_preco_homologado(_org uuid, _sku text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.sku_catalog%ROWTYPE; e public.sku_price_exceptions%ROWTYPE;
BEGIN
  IF _sku IS NULL OR btrim(_sku) = '' THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'SKU não informado.');
  END IF;
  SELECT * INTO r FROM public.sku_catalog
   WHERE organization_id = _org AND sku = _sku AND ativo AND homologado AND archived_at IS NULL
     AND vigencia_inicio <= current_date AND (vigencia_fim IS NULL OR vigencia_fim >= current_date)
   ORDER BY vigencia_inicio DESC LIMIT 1;

  SELECT * INTO e FROM public.sku_price_exceptions
   WHERE organization_id = _org AND sku = _sku AND status = 'aprovada' AND archived_at IS NULL
     AND valido_ate >= current_date
   ORDER BY aprovado_em DESC NULLS LAST LIMIT 1;

  IF r.id IS NULL AND e.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'SKU sem preço/condição homologados na Planilha Mestre.');
  END IF;
  IF r.id IS NOT NULL AND (r.preco_total IS NULL OR coalesce(btrim(r.condicao_pagamento),'') = '') AND e.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'SKU homologado sem preço ou condição de pagamento completos.');
  END IF;
  RETURN jsonb_build_object(
    'ok', true,
    'fonte', CASE WHEN e.id IS NOT NULL THEN 'excecao_comercial_aprovada' ELSE 'planilha_mestre' END,
    'sku', _sku,
    'nome', r.nome,
    'moeda', coalesce(e.moeda, r.moeda),
    'preco_total', coalesce(e.preco_total, r.preco_total),
    'condicao_pagamento', coalesce(e.condicao_pagamento, r.condicao_pagamento),
    'parcelas', r.parcelas,
    'excecao_valida_ate', e.valido_ate
  );
END;
$$;