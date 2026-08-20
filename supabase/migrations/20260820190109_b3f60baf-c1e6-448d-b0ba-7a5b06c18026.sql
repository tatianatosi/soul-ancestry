-- =========================================================
-- G-01 — Norma de identificadores canônicos do Clube Ancestral
-- Nenhum caso real é renomeado por esta migration.
-- =========================================================

-- 1) Tabela de aliases históricos ------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id) ON DELETE RESTRICT,
  alias text NOT NULL,
  alias_type text NOT NULL DEFAULT 'historico',
  source text NOT NULL DEFAULT 'migracao',
  reason text,
  superseded_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT case_aliases_alias_nao_vazio CHECK (btrim(alias) <> ''),
  CONSTRAINT case_aliases_tipo_valido CHECK (alias_type IN ('historico','legado','externo','deck','importacao','apelido')),
  CONSTRAINT case_aliases_unico UNIQUE (organization_id, alias)
);

CREATE INDEX IF NOT EXISTS idx_case_aliases_case ON public.case_aliases(case_id);

GRANT SELECT, INSERT ON public.case_aliases TO authenticated;
GRANT ALL ON public.case_aliases TO service_role;

ALTER TABLE public.case_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_aliases_select" ON public.case_aliases;
CREATE POLICY "case_aliases_select" ON public.case_aliases
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "case_aliases_insert" ON public.case_aliases;
CREATE POLICY "case_aliases_insert" ON public.case_aliases
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));

-- alias nunca é apagado nem reescrito: sem policy de UPDATE/DELETE,
-- e bloqueio explícito por trigger para o caminho de service_role.
CREATE OR REPLACE FUNCTION public.fn_case_alias_imutavel()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Alias histórico não pode ser excluído. Registre substituição em superseded_by.';
  END IF;
  IF NEW.alias IS DISTINCT FROM OLD.alias
     OR NEW.case_id IS DISTINCT FROM OLD.case_id
     OR NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'Alias histórico é imutável. Apenas superseded_by/reason podem ser complementados.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_alias_imutavel ON public.case_aliases;
CREATE TRIGGER trg_case_alias_imutavel
  BEFORE UPDATE OR DELETE ON public.case_aliases
  FOR EACH ROW EXECUTE FUNCTION public.fn_case_alias_imutavel();

-- alias registrado precisa ser do próprio caso e não pode colidir com um código canônico vivo
CREATE OR REPLACE FUNCTION public.fn_case_alias_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE v_org uuid;
BEGIN
  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Alias precisa apontar para um caso existente.';
  END IF;
  IF v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'Alias precisa pertencer à mesma organização do caso.';
  END IF;
  NEW.alias := btrim(NEW.alias);
  IF EXISTS (
    SELECT 1 FROM public.crm_casos c
     WHERE c.organization_id = NEW.organization_id
       AND c.id <> NEW.case_id
       AND upper(c.codigo) = upper(NEW.alias)
  ) THEN
    RAISE EXCEPTION 'Este identificador é o código canônico de outro caso e não pode virar alias.';
  END IF;
  NEW.created_by := coalesce(NEW.created_by, auth.uid());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_alias_guard ON public.case_aliases;
CREATE TRIGGER trg_case_alias_guard
  BEFORE INSERT ON public.case_aliases
  FOR EACH ROW EXECUTE FUNCTION public.fn_case_alias_guard();

-- 2) Modelo estruturado do caso -------------------------------------------
ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS modelo text;

UPDATE public.crm_casos
   SET modelo = CASE
     WHEN modelo IS NOT NULL THEN modelo
     WHEN codigo ~* '-FAM-' THEN 'FAM'
     WHEN codigo ~* '-MULTI-' THEN 'MULTI'
     WHEN codigo ~* '-PESQ-' THEN 'PESQ'
     WHEN codigo ~* '-LEG-' THEN 'LEG'
     WHEN codigo ~* '-POS-' THEN 'POS'
     ELSE 'IND'
   END
 WHERE modelo IS NULL;

ALTER TABLE public.crm_casos
  ALTER COLUMN modelo SET DEFAULT 'IND';

ALTER TABLE public.crm_casos
  ALTER COLUMN modelo SET NOT NULL;

ALTER TABLE public.crm_casos
  DROP CONSTRAINT IF EXISTS crm_casos_modelo_valido;
ALTER TABLE public.crm_casos
  ADD CONSTRAINT crm_casos_modelo_valido
  CHECK (modelo IN ('IND','FAM','MULTI','PESQ','LEG','POS'));

-- 3) Gerador transacional de case_id --------------------------------------
CREATE OR REPLACE FUNCTION public.gerar_case_id(_org uuid, _modelo text, _demo boolean DEFAULT false, _ano int DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_modelo text := upper(btrim(coalesce(_modelo, 'IND')));
  v_ano text := to_char(coalesce(make_date(coalesce(_ano, extract(year from now())::int), 1, 1), now()::date), 'YYYY');
  v_prefixo text;
  v_seq int;
BEGIN
  IF v_modelo NOT IN ('IND','FAM','MULTI','PESQ','LEG','POS') THEN
    RAISE EXCEPTION 'Modelo de caso inválido: %. Permitidos: IND, FAM, MULTI, PESQ, LEG, POS.', _modelo;
  END IF;

  v_prefixo := CASE WHEN _demo THEN 'CA-DEMO-CID-' ELSE 'CA-CID-' END || v_modelo || '-' || v_ano || '-';

  -- serializa a geração por organização/modelo/ano dentro da transação
  PERFORM pg_advisory_xact_lock(hashtextextended(_org::text || v_prefixo, 0));

  SELECT coalesce(max((regexp_replace(codigo, '^' || v_prefixo, ''))::int), 0) + 1
    INTO v_seq
    FROM public.crm_casos
   WHERE organization_id = _org
     AND codigo ~ ('^' || v_prefixo || '\d+$');

  RETURN v_prefixo || lpad(v_seq::text, 3, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.gerar_case_id(uuid, text, boolean, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gerar_case_id(uuid, text, boolean, int) TO authenticated, service_role;

-- 4) Código canônico imutável e gerado pelo servidor ----------------------
CREATE OR REPLACE FUNCTION public.fn_case_codigo_canonico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- case_id é imutável: edição manual é silenciosamente revertida e sinalizada
    IF NEW.codigo IS DISTINCT FROM OLD.codigo THEN
      RAISE EXCEPTION 'O identificador canônico do caso é imutável (%). Registre o valor anterior em case_aliases.', OLD.codigo;
    END IF;
    IF NEW.modelo IS DISTINCT FROM OLD.modelo THEN
      RAISE EXCEPTION 'O modelo do caso compõe o identificador canônico e não pode ser alterado após a abertura.';
    END IF;
    RETURN NEW;
  END IF;

  NEW.modelo := upper(btrim(coalesce(NEW.modelo, 'IND')));

  IF NEW.codigo IS NULL OR btrim(NEW.codigo) = '' THEN
    NEW.codigo := public.gerar_case_id(NEW.organization_id, NEW.modelo, coalesce(NEW.demo, false));
  END IF;

  NEW.codigo := upper(btrim(NEW.codigo));

  -- fixtures nunca se confundem com casos reais
  IF coalesce(NEW.demo, false) AND NEW.codigo !~ '^CA-DEMO' THEN
    RAISE EXCEPTION 'Caso de demonstração exige identificador com prefixo CA-DEMO.';
  END IF;
  IF NOT coalesce(NEW.demo, false) AND NEW.codigo ~ '^CA-DEMO' THEN
    RAISE EXCEPTION 'Caso real não pode usar identificador de demonstração.';
  END IF;

  -- alias histórico nunca vira chave de caso novo
  IF EXISTS (
    SELECT 1 FROM public.case_aliases a
     WHERE a.organization_id = NEW.organization_id
       AND upper(a.alias) = NEW.codigo
  ) THEN
    RAISE EXCEPTION 'Este identificador já existe como alias histórico. Use o identificador canônico do caso.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_codigo_canonico ON public.crm_casos;
CREATE TRIGGER trg_case_codigo_canonico
  BEFORE INSERT OR UPDATE ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_case_codigo_canonico();

-- 5) Lead só recebe case_id após abertura formal --------------------------
CREATE OR REPLACE FUNCTION public.fn_lead_case_id_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE v_org uuid;
BEGIN
  IF NEW.case_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Lead só pode ser vinculado a um caso já aberto.';
  END IF;
  IF v_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'Lead e caso precisam pertencer à mesma organização.';
  END IF;

  IF lower(coalesce(NEW.eixo_formalizacao, '')) IN ('nao_iniciado','triagem','em_triagem','discovery')
     OR lower(coalesce(NEW.estagio, '')) IN ('novo','triagem','em_triagem','qualificacao','discovery') THEN
    RAISE EXCEPTION 'Lead em triagem não recebe identificador de caso. Autorize a abertura formal antes de vincular.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_case_id_guard ON public.leads;
CREATE TRIGGER trg_lead_case_id_guard
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_lead_case_id_guard();

-- 6) Referência de deck Canva deriva do case_id ---------------------------
CREATE OR REPLACE FUNCTION public.fn_deck_referencia_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE v_codigo text;
BEGIN
  IF NEW.deck_referencia_interna IS NULL OR btrim(NEW.deck_referencia_interna) = '' THEN
    RETURN NEW;
  END IF;

  NEW.deck_referencia_interna := upper(btrim(NEW.deck_referencia_interna));

  IF NEW.case_id IS NULL THEN
    RAISE EXCEPTION 'Referência de deck exige um caso já existente. A proposta não cria identificador de caso.';
  END IF;

  SELECT codigo INTO v_codigo FROM public.crm_casos WHERE id = NEW.case_id;
  IF v_codigo IS NULL THEN
    RAISE EXCEPTION 'Referência de deck aponta para caso inexistente.';
  END IF;

  IF NEW.deck_referencia_interna !~ ('^DECK-CANVA-' || upper(v_codigo) || '-V\d+$') THEN
    RAISE EXCEPTION 'Referência de deck deve seguir DECK-CANVA-%-v[N].', v_codigo;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deck_referencia_guard ON public.proposals;
CREATE TRIGGER trg_deck_referencia_guard
  BEFORE INSERT OR UPDATE OF deck_referencia_interna, case_id ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.fn_deck_referencia_guard();
