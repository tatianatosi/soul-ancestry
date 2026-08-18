ALTER TABLE public.contract_parameter_previews
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'congelado',
  ADD COLUMN IF NOT EXISTS evento text,
  ADD COLUMN IF NOT EXISTS motivo text,
  ADD COLUMN IF NOT EXISTS conteudo_hash text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cpp_estado_valido') THEN
    ALTER TABLE public.contract_parameter_previews
      ADD CONSTRAINT cpp_estado_valido CHECK (estado IN ('rascunho_editavel','congelado'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cpp_evento_valido') THEN
    ALTER TABLE public.contract_parameter_previews
      ADD CONSTRAINT cpp_evento_valido CHECK (
        evento IS NULL OR evento IN (
          'rascunho_atualizado','revisao_solicitada','retorno_ajuste',
          'aprovacao','envio_assinatura','assinatura_registrada'
        )
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_cpp_rascunho_unico
  ON public.contract_parameter_previews (parameters_id, COALESCE(template_code, ''))
  WHERE estado = 'rascunho_editavel' AND archived_at IS NULL;

CREATE OR REPLACE FUNCTION public.fn_cpp_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Rascunho editável: salvar atualiza a mesma linha, sem criar versão nova.
    IF OLD.estado = 'rascunho_editavel' AND OLD.aprovado_em IS NULL THEN
      IF NEW.estado NOT IN ('rascunho_editavel','congelado') THEN
        RAISE EXCEPTION 'Estado de prévia inválido.';
      END IF;
    ELSE
      IF NEW.conteudo IS DISTINCT FROM OLD.conteudo
         OR NEW.html IS DISTINCT FROM OLD.html
         OR NEW.anexos IS DISTINCT FROM OLD.anexos
         OR NEW.versao IS DISTINCT FROM OLD.versao
         OR NEW.estado IS DISTINCT FROM OLD.estado THEN
        RAISE EXCEPTION 'Prévia congelada é imutável. Gere uma nova versão a partir dos parâmetros.';
      END IF;
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