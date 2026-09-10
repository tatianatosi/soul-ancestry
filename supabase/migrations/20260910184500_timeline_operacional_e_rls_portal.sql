-- Corretiva não destrutiva (Fase 1 / limpeza cirúrgica).
-- Não apaga tabelas. Não apaga migration anterior.
-- 1) Eventos de timeline para abertura de caso, mudança de próxima ação e tarefas.
-- 2) RLS: equipe interna lê timeline completa; portal só vê evento cliente_aprovado
--    do próprio caso. Tarefas deixam de ser visíveis só por is_org_member.
-- Reusa is_staff_ativo (já existente). Não cria função duplicada.

CREATE OR REPLACE FUNCTION public.clube_ancestral_timeline_operacional()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_case uuid;
  v_org uuid;
  v_title text;
  v_summary text;
  v_etype text;
  v_bloqueio boolean := false;
  v_ja uuid;
BEGIN
  IF TG_TABLE_NAME = 'crm_casos' THEN
    v_case := NEW.id;
    v_org := NEW.organization_id;
    IF TG_OP = 'INSERT' THEN
      v_etype := 'caso';
      v_title := 'Caso aberto';
      v_summary := coalesce(NEW.codigo, NEW.titulo);
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.proxima_acao IS DISTINCT FROM OLD.proxima_acao
         OR NEW.prazo_proxima_acao IS DISTINCT FROM OLD.prazo_proxima_acao THEN
        v_etype := 'caso';
        v_title := 'Próxima ação atualizada';
        v_summary := coalesce(NEW.proxima_acao, NEW.proxima_acao_codigo, '');
      ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        v_etype := 'caso';
        v_title := 'Status do caso alterado';
        v_summary := coalesce(NEW.status, '');
      ELSE
        RETURN NEW;
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'tarefas' THEN
    v_case := NEW.caso_id;
    v_org := NEW.organization_id;
    IF v_case IS NULL THEN
      RETURN NEW;
    END IF;
    IF TG_OP = 'INSERT' THEN
      v_bloqueio := NEW.status = 'bloqueada';
      v_etype := CASE WHEN v_bloqueio THEN 'pendencia' ELSE 'tarefa' END;
      v_title := CASE WHEN v_bloqueio THEN 'Pendência/bloqueio registrado' ELSE 'Tarefa criada' END;
      v_summary := NEW.titulo;
    ELSIF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.motivo_bloqueio IS DISTINCT FROM OLD.motivo_bloqueio
       OR NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id
       OR NEW.prazo IS DISTINCT FROM OLD.prazo THEN
      v_bloqueio := NEW.status = 'bloqueada';
      v_etype := CASE WHEN v_bloqueio THEN 'pendencia' ELSE 'tarefa' END;
      v_title := 'Tarefa atualizada';
      v_summary := NEW.titulo || ' → ' || NEW.status;
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- App writer e trigger podem coincidir; não duplica o mesmo evento na janela.
  SELECT id INTO v_ja
    FROM public.case_timeline_events
   WHERE organization_id = v_org
     AND case_id = v_case
     AND source_entity_id = NEW.id
     AND title = v_title
     AND created_at >= now() - interval '15 seconds'
     AND archived_at IS NULL
   LIMIT 1;
  IF v_ja IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.case_timeline_events (
    organization_id,
    case_id,
    event_type,
    title,
    status,
    occurred_at,
    visibility,
    summary_internal,
    bloqueio,
    source_entity_type,
    source_entity_id
  ) VALUES (
    v_org,
    v_case,
    v_etype,
    v_title,
    'registrado',
    now(),
    'interno',
    v_summary,
    v_bloqueio,
    TG_TABLE_NAME,
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_timeline_operacional_casos ON public.crm_casos;
CREATE TRIGGER trg_timeline_operacional_casos
  AFTER INSERT OR UPDATE ON public.crm_casos
  FOR EACH ROW
  EXECUTE FUNCTION public.clube_ancestral_timeline_operacional();

DROP TRIGGER IF EXISTS trg_timeline_operacional_tarefas ON public.tarefas;
CREATE TRIGGER trg_timeline_operacional_tarefas
  AFTER INSERT OR UPDATE ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.clube_ancestral_timeline_operacional();

DROP POLICY IF EXISTS cte_select ON public.case_timeline_events;
DROP POLICY IF EXISTS cte_select_equipe ON public.case_timeline_events;
DROP POLICY IF EXISTS cte_select_portal ON public.case_timeline_events;

CREATE POLICY cte_select_equipe ON public.case_timeline_events
  FOR SELECT TO authenticated
  USING (public.is_staff_ativo(organization_id));

CREATE POLICY cte_select_portal ON public.case_timeline_events
  FOR SELECT TO authenticated
  USING (
    visibility = 'cliente_aprovado'
    AND coalesce(btrim(summary_client_approved), '') <> ''
    AND public.portal_caso_permitido(case_id)
  );

DROP POLICY IF EXISTS tarefas_select ON public.tarefas;
CREATE POLICY tarefas_select ON public.tarefas
  FOR SELECT TO authenticated
  USING (public.is_staff_ativo(organization_id));
