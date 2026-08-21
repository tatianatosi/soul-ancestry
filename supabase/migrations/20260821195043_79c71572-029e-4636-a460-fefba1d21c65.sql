-- Gates de ativação: definição canônica + estado por caso
CREATE OR REPLACE FUNCTION public.case_activation_gates(_case uuid)
RETURNS TABLE(
  check_key text,
  label text,
  dominio text,
  obrigatorio boolean,
  estado text,
  motivo text,
  evidencia text,
  validado_em timestamptz,
  validado_por uuid,
  origem text,
  isencao_motivo text,
  isencao_expira_em timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    d.check_key,
    d.label,
    d.dominio,
    d.obrigatorio,
    CASE
      WHEN k.id IS NULL THEN 'nao_avaliada'
      WHEN k.status = 'isento' AND k.isencao_expira_em IS NOT NULL AND k.isencao_expira_em < now() THEN 'expirada'
      WHEN k.status IN ('validado','nao_aplicavel','isento') THEN 'validado'
      ELSE 'pendente'
    END AS estado,
    CASE
      WHEN k.id IS NULL THEN 'Requisito ainda não instanciado para este caso'
      WHEN k.status = 'isento' AND k.isencao_expira_em IS NOT NULL AND k.isencao_expira_em < now() THEN 'Isenção expirada'
      WHEN k.status IN ('validado','nao_aplicavel','isento') THEN NULL
      ELSE 'Aguardando validação com evidência'
    END AS motivo,
    k.observacao AS evidencia,
    k.validado_em,
    k.validado_por,
    k.origem_validacao AS origem,
    k.isencao_motivo,
    k.isencao_expira_em
  FROM public.activation_check_definicoes() d
  LEFT JOIN public.case_activation_checks k
    ON k.case_id = _case AND k.check_key = d.check_key
  ORDER BY d.check_key;
$$;

-- Motivos que impedem a ativação. Vazio = elegível.
CREATE OR REPLACE FUNCTION public.case_activacao_bloqueios(_case uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    array_agg(g.label || ' — ' || g.motivo ORDER BY g.check_key),
    ARRAY[]::text[]
  )
  FROM public.case_activation_gates(_case) g
  WHERE g.obrigatorio AND g.estado <> 'validado';
$$;

-- Trava de servidor: ativação recusada com qualquer gate obrigatório fora de "validado".
CREATE OR REPLACE FUNCTION public.fn_caso_ativacao_gates_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_bloqueios text[];
  v_virou_ativo boolean;
BEGIN
  v_virou_ativo :=
    (COALESCE(NEW.ativo, false) AND NOT COALESCE(OLD.ativo, false))
    OR (NEW.status = 'ativo' AND COALESCE(OLD.status, '') <> 'ativo')
    OR (NEW.eixo_operacao = 'caso_ativo' AND COALESCE(OLD.eixo_operacao, '') <> 'caso_ativo');

  IF NOT v_virou_ativo THEN
    RETURN NEW;
  END IF;

  v_bloqueios := public.case_activacao_bloqueios(NEW.id);

  IF array_length(v_bloqueios, 1) > 0 THEN
    RAISE EXCEPTION 'NÃO ELEGÍVEL — ATIVAÇÃO BLOQUEADA: % requisito(s) obrigatório(s) fora de validado. %',
      array_length(v_bloqueios, 1), array_to_string(v_bloqueios, ' | ');
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_caso_ativacao_gates_guard ON public.crm_casos;
CREATE TRIGGER trg_caso_ativacao_gates_guard
  BEFORE UPDATE ON public.crm_casos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_caso_ativacao_gates_guard();