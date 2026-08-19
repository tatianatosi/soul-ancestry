-- ============ LEADS: campos operacionais do Desk ============
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS codigo text,
  ADD COLUMN IF NOT EXISTS area_responsavel text,
  ADD COLUMN IF NOT EXISTS responsavel_nome text,
  ADD COLUMN IF NOT EXISTS responsavel_user_id uuid,
  ADD COLUMN IF NOT EXISTS proxima_acao text,
  ADD COLUMN IF NOT EXISTS proxima_acao_em date,
  ADD COLUMN IF NOT EXISTS eixo_comercial text NOT NULL DEFAULT 'novo_lead',
  ADD COLUMN IF NOT EXISTS eixo_formalizacao text NOT NULL DEFAULT 'nao_iniciado',
  ADD COLUMN IF NOT EXISTS objetivo text,
  ADD COLUMN IF NOT EXISTS nacionalidade text,
  ADD COLUMN IF NOT EXISTS via_juridica_preliminar text,
  ADD COLUMN IF NOT EXISTS status_via text,
  ADD COLUMN IF NOT EXISTS marco_preliminar text,
  ADD COLUMN IF NOT EXISTS discovery_resultado text,
  ADD COLUMN IF NOT EXISTS resumo_call text,
  ADD COLUMN IF NOT EXISTS resumo_validado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS call_agendada_em timestamptz,
  ADD COLUMN IF NOT EXISTS call_realizada_em timestamptz,
  ADD COLUMN IF NOT EXISTS proposta_link_interno text,
  ADD COLUMN IF NOT EXISTS proposta_referencia_interna text,
  ADD COLUMN IF NOT EXISTS contrato_link_interno text,
  ADD COLUMN IF NOT EXISTS asaas_evento_referencia text,
  ADD COLUMN IF NOT EXISTS motivo_perda text,
  ADD COLUMN IF NOT EXISTS servico_inicial_aprovado text,
  ADD COLUMN IF NOT EXISTS pagamento_previsto_em date,
  ADD COLUMN IF NOT EXISTS dados_teste boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nucleo_id uuid REFERENCES public.nucleos_familiares(id),
  ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES public.crm_casos(id),
  ADD COLUMN IF NOT EXISTS narrativa_familiar text,
  ADD COLUMN IF NOT EXISTS ultimo_followup_em date;

CREATE UNIQUE INDEX IF NOT EXISTS leads_codigo_uidx ON public.leads(codigo) WHERE codigo IS NOT NULL;

-- Código automático CA-LEAD-AAAA-SEQ (sem edição manual)
CREATE OR REPLACE FUNCTION public.fn_lead_codigo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ano text := to_char(coalesce(NEW.created_at, now()), 'YYYY');
  seq int;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.codigo IS NOT NULL AND NEW.codigo IS DISTINCT FROM OLD.codigo THEN
      NEW.codigo := OLD.codigo;
    END IF;
    RETURN NEW;
  END IF;

  SELECT coalesce(max((regexp_replace(codigo, '^CA-LEAD-\d{4}-', ''))::int), 0) + 1
    INTO seq
    FROM public.leads
   WHERE organization_id = NEW.organization_id
     AND codigo ~ ('^CA-LEAD-' || ano || '-\d+$');

  NEW.codigo := 'CA-LEAD-' || ano || '-' || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_codigo ON public.leads;
CREATE TRIGGER trg_lead_codigo BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.fn_lead_codigo();

-- Travas executáveis do lead
CREATE OR REPLACE FUNCTION public.fn_lead_desk_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ativo boolean;
BEGIN
  ativo := NEW.archived_at IS NULL
       AND coalesce(NEW.eixo_comercial, '') NOT IN ('perdido', 'encerrado_sem_aderencia');

  IF ativo THEN
    IF coalesce(NEW.area_responsavel, '') = '' OR coalesce(NEW.responsavel_nome, '') = ''
       OR coalesce(NEW.proxima_acao, '') = '' OR NEW.proxima_acao_em IS NULL THEN
      RAISE EXCEPTION 'Lead ativo exige área responsável, responsável nominal, próxima ação e data da próxima ação.';
    END IF;
  END IF;

  IF NEW.eixo_comercial IN ('discovery_realizada', 'diagnostico_em_elaboracao', 'proposta_enviada', 'negociacao') THEN
    IF coalesce(NEW.discovery_resultado, '') = '' OR NOT coalesce(NEW.resumo_validado, false)
       OR NEW.proxima_acao_em IS NULL THEN
      RAISE EXCEPTION 'Discovery realizada exige resultado da Discovery, resumo validado e próxima ação datada.';
    END IF;
  END IF;

  IF NEW.eixo_comercial IN ('proposta_enviada', 'negociacao') THEN
    IF coalesce(NEW.proposta_link_interno, '') = '' OR coalesce(NEW.responsavel_nome, '') = '' THEN
      RAISE EXCEPTION 'Proposta enviada exige link interno da proposta e responsável nominal.';
    END IF;
  END IF;

  IF NEW.eixo_comercial = 'perdido' AND coalesce(NEW.motivo_perda, '') = '' THEN
    RAISE EXCEPTION 'Lead perdido exige motivo de perda.';
  END IF;

  IF NEW.eixo_formalizacao IN ('contrato_assinado', 'pagamento_inicial_confirmado', 'cliente_ativo', 'onboarding_iniciado', 'caso_ativo')
     AND coalesce(NEW.contrato_link_interno, '') = '' THEN
    RAISE EXCEPTION 'Contrato assinado exige link interno do contrato.';
  END IF;

  IF NEW.eixo_formalizacao IN ('pagamento_inicial_confirmado', 'cliente_ativo', 'onboarding_iniciado', 'caso_ativo')
     AND coalesce(NEW.asaas_evento_referencia, '') = '' THEN
    RAISE EXCEPTION 'Pagamento inicial confirmado exige referência ao evento transacional do Asaas.';
  END IF;

  IF NEW.eixo_formalizacao = 'caso_ativo' AND NEW.case_id IS NULL THEN
    RAISE EXCEPTION 'Caso ativo exige caso operacional vinculado: Discovery ou proposta não abrem caso.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_desk_guard ON public.leads;
CREATE TRIGGER trg_lead_desk_guard BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.fn_lead_desk_guard();

-- ============ PROPOSTA CANVA: completude por página ============
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS extracao_status text NOT NULL DEFAULT 'nao_iniciada',
  ADD COLUMN IF NOT EXISTS deck_referencia_interna text;

CREATE TABLE IF NOT EXISTS public.proposal_canva_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id),
  case_id uuid REFERENCES public.crm_casos(id),
  page_number int NOT NULL CHECK (page_number BETWEEN 1 AND 7),
  page_content_structured jsonb NOT NULL DEFAULT '{}'::jsonb,
  campos_nao_localizados text[] NOT NULL DEFAULT ARRAY[]::text[],
  extracao_status text NOT NULL DEFAULT 'registrada',
  extraido_por text,
  extraido_em timestamptz NOT NULL DEFAULT now(),
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  UNIQUE (proposal_id, page_number)
);

GRANT SELECT, INSERT, UPDATE ON public.proposal_canva_pages TO authenticated;
GRANT ALL ON public.proposal_canva_pages TO service_role;
ALTER TABLE public.proposal_canva_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pcp_select" ON public.proposal_canva_pages FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY "pcp_insert" ON public.proposal_canva_pages FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY "pcp_update" ON public.proposal_canva_pages FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

DROP TRIGGER IF EXISTS trg_pcp_no_delete ON public.proposal_canva_pages;
CREATE TRIGGER trg_pcp_no_delete BEFORE DELETE ON public.proposal_canva_pages
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

DROP TRIGGER IF EXISTS trg_pcp_touch ON public.proposal_canva_pages;
CREATE TRIGGER trg_pcp_touch BEFORE UPDATE ON public.proposal_canva_pages
FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();

-- ============ DEPENDENTES DO CASO ============
CREATE TABLE IF NOT EXISTS public.case_dependents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  dependent_person_id uuid REFERENCES public.case_members(id),
  nome_completo text NOT NULL,
  vinculo_com_titular text NOT NULL,
  titular_responsavel_legal_id uuid REFERENCES public.case_members(id),
  titular_responsavel_legal_nome text,
  status_representacao text NOT NULL DEFAULT 'pendente',
  documento_representacao_referencia_interna text,
  participa_do_contrato boolean NOT NULL DEFAULT false,
  possui_acesso_app boolean NOT NULL DEFAULT false,
  anexo_individual_aplicavel boolean NOT NULL DEFAULT false,
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT case_dependents_status_chk CHECK (status_representacao IN ('pendente', 'documentada', 'nao_aplicavel'))
);

GRANT SELECT, INSERT, UPDATE ON public.case_dependents TO authenticated;
GRANT ALL ON public.case_dependents TO service_role;
ALTER TABLE public.case_dependents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cdep_select" ON public.case_dependents FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY "cdep_insert" ON public.case_dependents FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY "cdep_update" ON public.case_dependents FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

-- Dependente nunca recebe acesso ao App sem representação aplicável
CREATE OR REPLACE FUNCTION public.fn_case_dependent_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.possui_acesso_app AND NEW.status_representacao = 'pendente' THEN
    RAISE EXCEPTION 'Dependente não recebe acesso ao App com representação pendente.';
  END IF;
  IF NEW.status_representacao = 'documentada'
     AND coalesce(NEW.documento_representacao_referencia_interna, '') = '' THEN
    RAISE EXCEPTION 'Representação documentada exige referência interna do documento.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_dependent_guard ON public.case_dependents;
CREATE TRIGGER trg_case_dependent_guard BEFORE INSERT OR UPDATE ON public.case_dependents
FOR EACH ROW EXECUTE FUNCTION public.fn_case_dependent_guard();

DROP TRIGGER IF EXISTS trg_cdep_no_delete ON public.case_dependents;
CREATE TRIGGER trg_cdep_no_delete BEFORE DELETE ON public.case_dependents
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

DROP TRIGGER IF EXISTS trg_cdep_touch ON public.case_dependents;
CREATE TRIGGER trg_cdep_touch BEFORE UPDATE ON public.case_dependents
FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();

-- ============ MATRIZ DE DECISÃO JURÍDICA (sem texto de cláusula) ============
CREATE TABLE IF NOT EXISTS public.legal_clause_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  tema_codigo text NOT NULL,
  tema text NOT NULL,
  status text NOT NULL DEFAULT 'pendente_revisao_juridica',
  versao_juridica_aplicavel text,
  responsavel_revisao text,
  decisao text,
  justificativa text,
  decidido_em timestamptz,
  referencia_versao text,
  impacto_templates text[] NOT NULL DEFAULT ARRAY[]::text[],
  bloqueia_assinatura boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT lcm_status_chk CHECK (status IN ('pendente_revisao_juridica', 'aprovado', 'rejeitado', 'substituir', 'nao_aplicavel')),
  UNIQUE (organization_id, tema_codigo)
);

GRANT SELECT, INSERT, UPDATE ON public.legal_clause_matrix TO authenticated;
GRANT ALL ON public.legal_clause_matrix TO service_role;
ALTER TABLE public.legal_clause_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lcm_select" ON public.legal_clause_matrix FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY "lcm_insert" ON public.legal_clause_matrix FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));
CREATE POLICY "lcm_update" ON public.legal_clause_matrix FOR UPDATE TO authenticated
  USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_legal_clause_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('aprovado', 'rejeitado', 'substituir', 'nao_aplicavel') THEN
    IF coalesce(NEW.responsavel_revisao, '') = '' OR coalesce(NEW.decisao, '') = ''
       OR coalesce(NEW.justificativa, '') = '' OR NEW.decidido_em IS NULL THEN
      RAISE EXCEPTION 'Decisão jurídica exige responsável, decisão, justificativa e data da decisão.';
    END IF;
  END IF;
  IF NEW.status = 'aprovado' AND coalesce(NEW.versao_juridica_aplicavel, '') = '' THEN
    RAISE EXCEPTION 'Tema aprovado exige versão jurídica aplicável registrada.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_legal_clause_guard ON public.legal_clause_matrix;
CREATE TRIGGER trg_legal_clause_guard BEFORE INSERT OR UPDATE ON public.legal_clause_matrix
FOR EACH ROW EXECUTE FUNCTION public.fn_legal_clause_guard();

DROP TRIGGER IF EXISTS trg_lcm_no_delete ON public.legal_clause_matrix;
CREATE TRIGGER trg_lcm_no_delete BEFORE DELETE ON public.legal_clause_matrix
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

DROP TRIGGER IF EXISTS trg_lcm_touch ON public.legal_clause_matrix;
CREATE TRIGGER trg_lcm_touch BEFORE UPDATE ON public.legal_clause_matrix
FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();