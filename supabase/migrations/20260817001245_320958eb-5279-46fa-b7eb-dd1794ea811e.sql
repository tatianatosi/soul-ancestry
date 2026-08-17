-- 1) Origem "planejador" aceita e com maior confiança
ALTER TABLE public.contract_parameter_values
  DROP CONSTRAINT IF EXISTS contract_parameter_values_origem_check;
ALTER TABLE public.contract_parameter_values
  ADD CONSTRAINT contract_parameter_values_origem_check
  CHECK (origem = ANY (ARRAY['planejador','crm','proposta','formulario','whatsapp','transcricao','documento','preenchimento_humano','calculo_aprovado']));

CREATE OR REPLACE FUNCTION public.contract_parameter_confianca(_origem text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE _origem
    WHEN 'planejador' THEN 6
    WHEN 'documento' THEN 5
    WHEN 'crm' THEN 4
    WHEN 'proposta' THEN 4
    WHEN 'preenchimento_humano' THEN 4
    WHEN 'calculo_aprovado' THEN 4
    WHEN 'formulario' THEN 3
    WHEN 'whatsapp' THEN 2
    WHEN 'transcricao' THEN 1
    ELSE 0 END;
$function$;

-- 2) Guard: Planejador homologado não é sobrescrito por fonte menor
CREATE OR REPLACE FUNCTION public.fn_cpv_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      NEW.status := 'importado_a_confirmar';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.valor IS NOT NULL AND NEW.valor IS DISTINCT FROM OLD.valor THEN
    -- Planejador é fonte homologada: só cede com justificativa humana registrada
    IF OLD.origem = 'planejador' AND COALESCE(NEW.origem,'') <> 'planejador' THEN
      IF NEW.origem IN ('whatsapp','transcricao') THEN
        RAISE EXCEPTION 'Parâmetro homologado no Planejador não pode ser substituído por WhatsApp, transcrição ou relato.';
      END IF;
      IF COALESCE(length(btrim(NEW.justificativa)), 0) < 10 THEN
        RAISE EXCEPTION 'Divergência com o Planejador: registre justificativa e revisão humana antes de substituir o parâmetro.';
      END IF;
    END IF;

    IF OLD.status = 'validado'
       AND public.contract_parameter_confianca(NEW.origem) < public.contract_parameter_confianca(OLD.origem)
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
$function$;

-- 3) Alias: bloquear criação e também renomeação para código legado de outro caso
DROP TRIGGER IF EXISTS trg_caso_alias ON public.crm_casos;
CREATE TRIGGER trg_caso_alias
  BEFORE INSERT OR UPDATE OF codigo ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_caso_alias_guard();