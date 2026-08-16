
-- 1. Registro mestre -------------------------------------------------------
CREATE TABLE public.contract_case_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  proposal_id uuid REFERENCES public.proposals(id),
  contract_template_id uuid REFERENCES public.contract_templates(id),
  contract_template_version integer,
  contract_id uuid REFERENCES public.contracts(id),
  status text NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','em_validacao','validado','aprovado','enviado_assinatura','assinado','bloqueado')),
  completude_pct integer NOT NULL DEFAULT 0,
  revisao_humana_por uuid,
  revisao_humana_em timestamptz,
  aprovado_por uuid,
  aprovado_em timestamptz,
  bloqueio_motivo text,
  observacoes_internas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  UNIQUE (case_id)
);

GRANT SELECT, INSERT, UPDATE ON public.contract_case_parameters TO authenticated;
GRANT ALL ON public.contract_case_parameters TO service_role;
ALTER TABLE public.contract_case_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccp_select" ON public.contract_case_parameters
  FOR SELECT TO authenticated USING (public.contract_pode_ler(organization_id));
CREATE POLICY "ccp_insert" ON public.contract_case_parameters
  FOR INSERT TO authenticated WITH CHECK (public.contract_pode_preparar(organization_id));
CREATE POLICY "ccp_update" ON public.contract_case_parameters
  FOR UPDATE TO authenticated USING (public.contract_pode_preparar(organization_id))
  WITH CHECK (public.contract_pode_preparar(organization_id));

-- 2. Valores parametrizados -------------------------------------------------
CREATE TABLE public.contract_parameter_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  parameters_id uuid NOT NULL REFERENCES public.contract_case_parameters(id) ON DELETE RESTRICT,
  grupo text NOT NULL CHECK (grupo IN ('partes','membros','objeto','servicos','comerciais','assinatura')),
  campo text NOT NULL,
  label text NOT NULL,
  obrigatorio boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  valor text,
  origem text CHECK (origem IN ('crm','proposta','formulario','whatsapp','transcricao','documento','preenchimento_humano','calculo_aprovado')),
  origem_detalhe text,
  status text NOT NULL DEFAULT 'vazio'
    CHECK (status IN ('vazio','importado_a_confirmar','validado','bloqueado','substituido')),
  conflito jsonb NOT NULL DEFAULT '[]'::jsonb,
  justificativa text,
  atualizado_por uuid,
  atualizado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  UNIQUE (parameters_id, campo)
);

GRANT SELECT, INSERT, UPDATE ON public.contract_parameter_values TO authenticated;
GRANT ALL ON public.contract_parameter_values TO service_role;
ALTER TABLE public.contract_parameter_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cpv_select" ON public.contract_parameter_values
  FOR SELECT TO authenticated USING (public.contract_pode_ler(organization_id));
CREATE POLICY "cpv_insert" ON public.contract_parameter_values
  FOR INSERT TO authenticated WITH CHECK (public.contract_pode_preparar(organization_id));
CREATE POLICY "cpv_update" ON public.contract_parameter_values
  FOR UPDATE TO authenticated USING (public.contract_pode_preparar(organization_id))
  WITH CHECK (public.contract_pode_preparar(organization_id));

-- 3. Prévias imutáveis ------------------------------------------------------
CREATE TABLE public.contract_parameter_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  parameters_id uuid NOT NULL REFERENCES public.contract_case_parameters(id) ON DELETE RESTRICT,
  versao integer NOT NULL,
  tipo text NOT NULL DEFAULT 'rascunho' CHECK (tipo IN ('rascunho','final')),
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb,
  html text NOT NULL DEFAULT '',
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  placeholders_pendentes jsonb NOT NULL DEFAULT '[]'::jsonb,
  template_code text,
  template_version integer,
  congelado_em timestamptz NOT NULL DEFAULT now(),
  gerado_por uuid,
  aprovado_por uuid,
  aprovado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_reason text,
  UNIQUE (parameters_id, versao)
);

GRANT SELECT, INSERT, UPDATE ON public.contract_parameter_previews TO authenticated;
GRANT ALL ON public.contract_parameter_previews TO service_role;
ALTER TABLE public.contract_parameter_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cpp_select" ON public.contract_parameter_previews
  FOR SELECT TO authenticated USING (public.contract_pode_ler(organization_id));
CREATE POLICY "cpp_insert" ON public.contract_parameter_previews
  FOR INSERT TO authenticated WITH CHECK (public.contract_pode_preparar(organization_id));
CREATE POLICY "cpp_update" ON public.contract_parameter_previews
  FOR UPDATE TO authenticated USING (public.contract_pode_aprovar(organization_id))
  WITH CHECK (public.contract_pode_aprovar(organization_id));

-- 4. Catálogo de campos -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.contract_parameter_definicoes()
RETURNS TABLE(grupo text, campo text, label text, obrigatorio boolean, ordem integer)
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT * FROM (VALUES
    ('partes','contratante_nome','Contratante — nome completo',true,10),
    ('partes','contratante_documento','Contratante — documento de identificação',true,20),
    ('partes','contratante_endereco','Contratante — endereço completo',true,30),
    ('partes','contratante_contato','Contratante — e-mail e telefone',true,40),
    ('partes','contratada_qualificacao','Contratada — qualificação completa',true,50),
    ('partes','representacao_legal','Representação legal / menores representados',false,60),
    ('membros','beneficiarios','Beneficiários incluídos no projeto',true,10),
    ('membros','vinculo_familiar','Vínculo familiar declarado entre os beneficiários',true,20),
    ('membros','ancestral_referencia','Ancestral de referência declarado',true,30),
    ('membros','membros_excluidos','Pessoas expressamente fora do escopo',false,40),
    ('objeto','objeto_contrato','Objeto do contrato',true,10),
    ('objeto','produto_sku','Produto / SKU contratado',true,20),
    ('objeto','pais_rota','País e rota pretendida',true,30),
    ('objeto','escopo_resumo','Resumo do escopo aprovado',true,40),
    ('servicos','servicos_incluidos','Serviços incluídos',true,10),
    ('servicos','servicos_excluidos','Serviços expressamente excluídos',true,20),
    ('servicos','fases_entregas','Fases e entregas previstas',true,30),
    ('servicos','anexos_aplicaveis','Anexos aplicáveis ao produto/escopo',true,40),
    ('servicos','prazos_referencia','Prazos de referência (não promessa de resultado)',false,50),
    ('comerciais','valor_total','Valor total aprovado',true,10),
    ('comerciais','forma_pagamento','Forma de pagamento',true,20),
    ('comerciais','parcelas','Parcelas',true,30),
    ('comerciais','vencimentos','Datas de vencimento',true,40),
    ('comerciais','despesas_externas','Despesas externas e reembolsos',false,50),
    ('comerciais','excecoes_comerciais','Exceções comerciais autorizadas',false,60),
    ('assinatura','partes_signatarias','Partes signatárias',true,10),
    ('assinatura','forma_assinatura','Forma de assinatura e registro externo',true,20),
    ('assinatura','data_assinatura','Data da assinatura',false,30),
    ('assinatura','referencia_assinatura','Referência/comprovante da assinatura',false,40),
    ('assinatura','revisor_responsavel','Revisor humano responsável',true,50)
  ) AS t(grupo, campo, label, obrigatorio, ordem);
$$;

-- 5. Semeadura de campos ao criar o registro mestre -------------------------
CREATE OR REPLACE FUNCTION public.fn_seed_contract_parameters()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.contract_parameter_values
    (organization_id, parameters_id, grupo, campo, label, obrigatorio, ordem, status, created_by, updated_by)
  SELECT NEW.organization_id, NEW.id, d.grupo, d.campo, d.label, d.obrigatorio, d.ordem, 'vazio', auth.uid(), auth.uid()
  FROM public.contract_parameter_definicoes() d;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seed_contract_parameters
AFTER INSERT ON public.contract_case_parameters
FOR EACH ROW EXECUTE FUNCTION public.fn_seed_contract_parameters();

-- 6. Guardas do registro mestre ---------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_ccp_guard()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_demo boolean; v_code text; v_status text;
BEGIN
  SELECT demo INTO v_demo FROM public.crm_casos WHERE id = NEW.case_id;
  IF COALESCE(v_demo, false) THEN
    RAISE EXCEPTION 'Casos de demonstração não podem alimentar o motor contratual real.';
  END IF;

  IF NEW.contract_template_id IS NOT NULL THEN
    SELECT code, status INTO v_code, v_status FROM public.contract_templates WHERE id = NEW.contract_template_id;
    IF v_code IS NULL OR v_code NOT IN ('MODELO-ESTUDO','BASE-GEN-V2') THEN
      RAISE EXCEPTION 'Somente MODELO ESTUDO e a base contratual genérica v2 podem ser usados. Modelos anteriores são referência histórica.';
    END IF;
    IF v_status <> 'active' THEN
      RAISE EXCEPTION 'O modelo contratual selecionado não está ativo.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IN ('aprovado','enviado_assinatura','assinado')
     AND OLD.status NOT IN ('aprovado','enviado_assinatura','assinado') THEN
    IF NEW.revisao_humana_por IS NULL THEN
      RAISE EXCEPTION 'Revisão humana obrigatória antes de aprovar os parâmetros contratuais.';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.contract_parameter_values v
      WHERE v.parameters_id = NEW.id AND v.archived_at IS NULL
        AND v.obrigatorio AND v.status <> 'validado'
    ) THEN
      RAISE EXCEPTION 'Existem parâmetros obrigatórios não validados. Resolva o checklist de pendências.';
    END IF;
  END IF;

  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ccp_guard
BEFORE INSERT OR UPDATE ON public.contract_case_parameters
FOR EACH ROW EXECUTE FUNCTION public.fn_ccp_guard();

CREATE TRIGGER trg_ccp_block_delete
BEFORE DELETE ON public.contract_case_parameters
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- 7. Guarda dos valores ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.contract_parameter_confianca(_origem text)
RETURNS integer
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _origem
    WHEN 'documento' THEN 5
    WHEN 'crm' THEN 4
    WHEN 'proposta' THEN 4
    WHEN 'preenchimento_humano' THEN 4
    WHEN 'calculo_aprovado' THEN 4
    WHEN 'formulario' THEN 3
    WHEN 'whatsapp' THEN 2
    WHEN 'transcricao' THEN 1
    ELSE 0 END;
$$;

CREATE OR REPLACE FUNCTION public.fn_cpv_guard()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.valor IS NOT NULL AND btrim(NEW.valor) = '' THEN
    NEW.valor := NULL;
  END IF;

  IF NEW.valor IS NULL THEN
    NEW.origem := NULL;
    NEW.status := 'vazio';
  ELSE
    IF NEW.origem IS NULL THEN
      RAISE EXCEPTION 'Todo parâmetro preenchido precisa de origem rastreável declarada.';
    END IF;
    IF NEW.valor ~* '(\[ex\.|lorem ipsum|preencher|placeholder|xxxx|a definir|tbd|<[^>]*>)' THEN
      RAISE EXCEPTION 'Placeholder ou texto de exemplo não é aceito como parâmetro contratual.';
    END IF;
    IF NEW.origem IN ('whatsapp','transcricao') AND NEW.status = 'validado' THEN
      RAISE EXCEPTION 'Dados de WhatsApp ou transcrição entram como importado_a_confirmar e exigem confirmação humana com outra origem.';
    END IF;
    IF NEW.status = 'vazio' THEN
      NEW.status := CASE WHEN NEW.origem IN ('whatsapp','transcricao') THEN 'importado_a_confirmar' ELSE 'importado_a_confirmar' END;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'validado' AND OLD.valor IS NOT NULL
     AND NEW.valor IS DISTINCT FROM OLD.valor THEN
    IF public.contract_parameter_confianca(NEW.origem) < public.contract_parameter_confianca(OLD.origem)
       AND COALESCE(length(btrim(NEW.justificativa)), 0) < 10 THEN
      RAISE EXCEPTION 'Um parâmetro validado não pode ser sobrescrito por origem menos confiável sem justificativa registrada.';
    END IF;
  END IF;

  NEW.atualizado_por := auth.uid();
  NEW.atualizado_em := now();
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cpv_guard
BEFORE INSERT OR UPDATE ON public.contract_parameter_values
FOR EACH ROW EXECUTE FUNCTION public.fn_cpv_guard();

CREATE TRIGGER trg_cpv_block_delete
BEFORE DELETE ON public.contract_parameter_values
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

CREATE TRIGGER trg_cpv_audit
AFTER INSERT OR UPDATE ON public.contract_parameter_values
FOR EACH ROW EXECUTE FUNCTION public.fn_audit();

-- 8. Prévias imutáveis -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_cpp_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.conteudo IS DISTINCT FROM OLD.conteudo
       OR NEW.html IS DISTINCT FROM OLD.html
       OR NEW.anexos IS DISTINCT FROM OLD.anexos
       OR NEW.versao IS DISTINCT FROM OLD.versao THEN
      RAISE EXCEPTION 'Prévia versionada é imutável. Gere uma nova versão a partir dos parâmetros.';
    END IF;
    IF NEW.aprovado_por IS NOT NULL AND OLD.aprovado_por IS NULL
       AND jsonb_array_length(OLD.placeholders_pendentes) > 0 THEN
      RAISE EXCEPTION 'Existem campos obrigatórios em placeholder. A prévia não pode ser aprovada nem enviada.';
    END IF;
  END IF;
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cpp_guard
BEFORE INSERT OR UPDATE ON public.contract_parameter_previews
FOR EACH ROW EXECUTE FUNCTION public.fn_cpp_guard();

CREATE TRIGGER trg_cpp_block_delete
BEFORE DELETE ON public.contract_parameter_previews
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- 9. Completude e pendências -------------------------------------------------
CREATE OR REPLACE FUNCTION public.contract_parameters_completude(_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', count(*),
    'validados', count(*) FILTER (WHERE status = 'validado'),
    'a_confirmar', count(*) FILTER (WHERE status = 'importado_a_confirmar'),
    'vazios', count(*) FILTER (WHERE status = 'vazio'),
    'bloqueados', count(*) FILTER (WHERE status = 'bloqueado'),
    'pct', CASE WHEN count(*) FILTER (WHERE obrigatorio) = 0 THEN 0
      ELSE round(100.0 * count(*) FILTER (WHERE obrigatorio AND status = 'validado')
        / count(*) FILTER (WHERE obrigatorio)) END,
    'por_grupo', COALESCE((
      SELECT jsonb_object_agg(g.grupo, jsonb_build_object(
        'total', g.total, 'validados', g.validados, 'a_confirmar', g.a_confirmar, 'vazios', g.vazios))
      FROM (
        SELECT grupo, count(*) total,
               count(*) FILTER (WHERE status='validado') validados,
               count(*) FILTER (WHERE status='importado_a_confirmar') a_confirmar,
               count(*) FILTER (WHERE status='vazio') vazios
        FROM public.contract_parameter_values
        WHERE parameters_id = _id AND archived_at IS NULL
        GROUP BY grupo) g), '{}'::jsonb)
  )
  FROM public.contract_parameter_values
  WHERE parameters_id = _id AND archived_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.contract_parameters_pendencias(_id uuid)
RETURNS TABLE(grupo text, campo text, label text, motivo text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.grupo, v.campo, v.label,
    CASE WHEN v.status = 'vazio' THEN 'Sem dado de origem rastreável'
         WHEN v.status = 'importado_a_confirmar' THEN 'Importado, aguardando confirmação humana'
         WHEN v.status = 'bloqueado' THEN COALESCE(v.justificativa, 'Parâmetro bloqueado')
         ELSE 'Pendente' END
  FROM public.contract_parameter_values v
  WHERE v.parameters_id = _id AND v.archived_at IS NULL
    AND v.obrigatorio AND v.status <> 'validado'
  ORDER BY v.grupo, v.ordem;
$$;

GRANT EXECUTE ON FUNCTION public.contract_parameter_definicoes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.contract_parameter_confianca(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contract_parameters_completude(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contract_parameters_pendencias(uuid) TO authenticated;
