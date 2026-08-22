-- 1. contract_annexes: instâncias versionadas por caso/parâmetros/prévia
ALTER TABLE public.contract_annexes ALTER COLUMN contract_id DROP NOT NULL;

ALTER TABLE public.contract_annexes
  ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES public.crm_casos(id),
  ADD COLUMN IF NOT EXISTS parameters_id uuid REFERENCES public.contract_case_parameters(id),
  ADD COLUMN IF NOT EXISTS preview_id uuid REFERENCES public.contract_parameter_previews(id),
  ADD COLUMN IF NOT EXISTS annex_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS model_version text,
  ADD COLUMN IF NOT EXISTS rendered_html text,
  ADD COLUMN IF NOT EXISTS structured_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS applicability_rule text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS ux_contract_annexes_versao
  ON public.contract_annexes (organization_id, case_id, annex_code, annex_version)
  WHERE archived_at IS NULL AND case_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_contract_annexes_parameters
  ON public.contract_annexes (parameters_id) WHERE archived_at IS NULL;

-- 2. contract_parameter_previews: corpo contratual e marcação de legado
ALTER TABLE public.contract_parameter_previews
  ADD COLUMN IF NOT EXISTS corpo_contratual boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legado_sem_evento boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS legado_sem_corpo boolean NOT NULL DEFAULT false;

-- 3. Todo novo snapshot exige evento de governança
CREATE OR REPLACE FUNCTION public.fn_preview_evento_obrigatorio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.evento IS NULL OR btrim(NEW.evento) = '' THEN
    RAISE EXCEPTION 'Prévia exige evento de governança não nulo.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_preview_evento_obrigatorio ON public.contract_parameter_previews;
CREATE TRIGGER trg_preview_evento_obrigatorio
BEFORE INSERT ON public.contract_parameter_previews
FOR EACH ROW EXECUTE FUNCTION public.fn_preview_evento_obrigatorio();

-- 4. Prévia legada ou sem corpo contratual não pode ser aprovada
CREATE OR REPLACE FUNCTION public.fn_preview_aprovacao_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.aprovado_por IS NOT NULL AND OLD.aprovado_por IS DISTINCT FROM NEW.aprovado_por THEN
    IF NEW.legado_sem_evento OR NEW.legado_sem_corpo OR NOT NEW.corpo_contratual THEN
      RAISE EXCEPTION 'Prévia legada ou sem corpo contratual não pode ser aprovada nem usada para assinatura.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_preview_aprovacao_guard ON public.contract_parameter_previews;
CREATE TRIGGER trg_preview_aprovacao_guard
BEFORE UPDATE ON public.contract_parameter_previews
FOR EACH ROW EXECUTE FUNCTION public.fn_preview_aprovacao_guard();