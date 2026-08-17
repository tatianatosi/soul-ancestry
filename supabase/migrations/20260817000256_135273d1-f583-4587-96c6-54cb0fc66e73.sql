-- 1. Uso permitido dos modelos contratuais
ALTER TABLE public.contract_templates
  ADD COLUMN IF NOT EXISTS uso_permitido text NOT NULL DEFAULT 'geracao';

ALTER TABLE public.contract_templates
  DROP CONSTRAINT IF EXISTS contract_templates_uso_permitido_chk;
ALTER TABLE public.contract_templates
  ADD CONSTRAINT contract_templates_uso_permitido_chk
  CHECK (uso_permitido IN ('geracao','historico_inutilizavel_para_geracao'));

CREATE OR REPLACE FUNCTION public.fn_contract_template_uso_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.code IN ('MODELO-ESTUDO','BASE-GEN-V2') THEN
    NEW.uso_permitido := 'geracao';
  ELSE
    NEW.uso_permitido := 'historico_inutilizavel_para_geracao';
    IF NEW.status = 'active' THEN
      RAISE EXCEPTION 'Modelo histórico (%). Não é instrumento contratual aplicável e não pode ficar ativo para geração.', NEW.code;
    END IF;
    IF NEW.notes_internal IS NULL OR btrim(NEW.notes_internal) = '' THEN
      NEW.notes_internal := 'Referência histórica preservada para auditoria; não é instrumento contratual aplicável.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contract_template_uso ON public.contract_templates;
CREATE TRIGGER trg_contract_template_uso
  BEFORE INSERT OR UPDATE ON public.contract_templates
  FOR EACH ROW EXECUTE FUNCTION public.fn_contract_template_uso_guard();

UPDATE public.contract_templates
   SET uso_permitido = CASE WHEN code IN ('MODELO-ESTUDO','BASE-GEN-V2')
                            THEN 'geracao' ELSE 'historico_inutilizavel_para_geracao' END;

-- 2. Prévia só a partir dos modelos vigentes
CREATE OR REPLACE FUNCTION public.fn_preview_template_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.template_code IS NOT NULL
     AND NEW.template_code NOT IN ('MODELO-ESTUDO','BASE-GEN-V2') THEN
    RAISE EXCEPTION 'Prévia só pode ser gerada pelo MODELO ESTUDO + base contratual genérica v2.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_preview_template ON public.contract_parameter_previews;
CREATE TRIGGER trg_preview_template
  BEFORE INSERT OR UPDATE ON public.contract_parameter_previews
  FOR EACH ROW EXECUTE FUNCTION public.fn_preview_template_guard();

-- 3. Códigos legados como alias do caso canônico
ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS codigos_legados text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.resolver_case_canonico(_ref text)
RETURNS TABLE(case_id uuid, codigo text, alias boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT c.id, c.codigo, (upper(btrim(_ref)) <> upper(c.codigo)) AS alias
  FROM public.crm_casos c
  WHERE public.is_org_member(c.organization_id)
    AND c.archived_at IS NULL
    AND (
      upper(c.codigo) = upper(btrim(_ref))
      OR upper(btrim(_ref)) = ANY (SELECT upper(x) FROM unnest(c.codigos_legados) x)
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolver_case_canonico(text) TO authenticated;

-- 4. Alias não pode virar caso novo (sem duplicar o piloto real)
CREATE OR REPLACE FUNCTION public.fn_caso_alias_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.crm_casos c
    WHERE c.organization_id = NEW.organization_id
      AND c.id <> NEW.id
      AND c.archived_at IS NULL
      AND upper(NEW.codigo) = ANY (SELECT upper(x) FROM unnest(c.codigos_legados) x)
  ) THEN
    RAISE EXCEPTION 'Este código é alias histórico de um caso canônico existente. Use o case_id canônico.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_caso_alias ON public.crm_casos;
CREATE TRIGGER trg_caso_alias
  BEFORE INSERT OR UPDATE OF codigo ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_caso_alias_guard();