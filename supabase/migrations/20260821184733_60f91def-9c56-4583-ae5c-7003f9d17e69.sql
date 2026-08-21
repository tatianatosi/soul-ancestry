ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS classificacao text NOT NULL DEFAULT 'pre_cliente',
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status_comercial text,
  ADD COLUMN IF NOT EXISTS ativacao_decidida_em timestamptz,
  ADD COLUMN IF NOT EXISTS ativacao_decidida_por uuid,
  ADD COLUMN IF NOT EXISTS ativacao_justificativa text;

ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_classificacao_check;
ALTER TABLE public.clientes ADD CONSTRAINT clientes_classificacao_check
  CHECK (classificacao IN ('pre_cliente','cliente_ativo','participante_familiar'));

CREATE OR REPLACE FUNCTION public.pais_canonico(_valor text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE lower(btrim(coalesce(_valor,'')))
    WHEN '' THEN NULL
    WHEN 'austria' THEN 'Áustria'
    WHEN 'áustria' THEN 'Áustria'
    WHEN 'italia' THEN 'Itália'
    WHEN 'itália' THEN 'Itália'
    WHEN 'portugal' THEN 'Portugal'
    WHEN 'espanha' THEN 'Espanha'
    WHEN 'alemanha' THEN 'Alemanha'
    WHEN 'polonia' THEN 'Polônia'
    WHEN 'polônia' THEN 'Polônia'
    WHEN 'hungria' THEN 'Hungria'
    WHEN 'romenia' THEN 'Romênia'
    WHEN 'romênia' THEN 'Romênia'
    WHEN 'lituania' THEN 'Lituânia'
    WHEN 'lituânia' THEN 'Lituânia'
    ELSE initcap(btrim(_valor))
  END
$$;

CREATE OR REPLACE FUNCTION public.fn_cliente_classificacao_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _apto boolean;
BEGIN
  NEW.pais_interesse := public.pais_canonico(NEW.pais_interesse);

  IF NEW.origem IS NOT NULL AND lower(btrim(NEW.origem)) IN (
    'proposta_aprovada','proposta_enviada','aceite_verbal','contrato_assinado','pagamento_confirmado','onboarding'
  ) THEN
    RAISE EXCEPTION 'Origem inválida: % é status comercial, não origem do relacionamento.', NEW.origem;
  END IF;

  IF NEW.classificacao = 'cliente_ativo' THEN
    IF NEW.ativacao_decidida_em IS NULL OR NEW.ativacao_decidida_por IS NULL THEN
      RAISE EXCEPTION 'Cliente ativo exige decisão humana de ativação registrada (autor e data).';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM public.crm_casos c
      WHERE c.cliente_id = NEW.id
        AND c.archived_at IS NULL
        AND coalesce(c.contrato_assinado,false)
        AND coalesce(c.pagamento_confirmado,false)
    ) INTO _apto;
    IF NOT _apto THEN
      RAISE EXCEPTION 'Cliente ativo exige caso com contrato assinado e pagamento inicial confirmado.';
    END IF;
  END IF;

  IF NEW.status = 'ativo' AND NEW.classificacao <> 'cliente_ativo' THEN
    RAISE EXCEPTION 'Status ativo só é permitido para cadastro classificado como cliente ativo.';
  END IF;

  IF NEW.archived_at IS NOT NULL AND coalesce(btrim(NEW.archive_motivo),'') = '' THEN
    RAISE EXCEPTION 'Arquivamento exige motivo registrado.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cliente_classificacao_guard ON public.clientes;
CREATE TRIGGER trg_cliente_classificacao_guard
BEFORE INSERT OR UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.fn_cliente_classificacao_guard();

UPDATE public.clientes
   SET status_comercial = coalesce(status_comercial, origem),
       origem = 'planejador'
 WHERE lower(coalesce(origem,'')) = 'proposta_aprovada';

UPDATE public.clientes SET pais_interesse = public.pais_canonico(pais_interesse);

UPDATE public.clientes SET is_demo = true, demo = true
 WHERE nome ILIKE '%(demo)%' OR coalesce(demo,false);

UPDATE public.clientes SET classificacao = 'participante_familiar'
 WHERE nome IN ('Alice Gomes Silveira','Adair Pinto Silveira Júnior');

UPDATE public.clientes SET classificacao = 'pre_cliente'
 WHERE classificacao <> 'participante_familiar' AND status <> 'ativo';