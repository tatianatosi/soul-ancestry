ALTER TABLE public.master_library_items
  ADD COLUMN IF NOT EXISTS suspensao_motivo text,
  ADD COLUMN IF NOT EXISTS suspenso_em timestamptz,
  ADD COLUMN IF NOT EXISTS suspenso_por uuid,
  ADD COLUMN IF NOT EXISTS vigencia_justificativa text;

CREATE TABLE IF NOT EXISTS public.master_library_state_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.master_library_items(id),
  estado_anterior text,
  estado_novo text NOT NULL,
  justificativa text,
  versao text,
  responsavel text,
  criterio_registrado boolean NOT NULL DEFAULT false,
  sucessor_id uuid,
  predecessor_id uuid,
  ator_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.master_library_state_events TO authenticated;
GRANT ALL ON public.master_library_state_events TO service_role;

ALTER TABLE public.master_library_state_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mlse_select_org" ON public.master_library_state_events;
CREATE POLICY "mlse_select_org" ON public.master_library_state_events
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "mlse_insert_org" ON public.master_library_state_events;
CREATE POLICY "mlse_insert_org" ON public.master_library_state_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_mlse_item ON public.master_library_state_events(item_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.fn_biblioteca_mestre_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_admin boolean;
  v_papel app_role;
  v_sucessor_org uuid;
  v_pred_estado text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    NEW.updated_by := auth.uid();

    -- Arquivamento lógico: motivo, autor e data obrigatórios; item permanece consultável.
    IF NEW.archived_at IS NOT NULL AND COALESCE(btrim(NEW.archive_motivo), '') = '' THEN
      RAISE EXCEPTION 'Arquivamento exige motivo registrado.';
    END IF;
    IF NEW.archived_at IS NOT NULL AND NEW.archived_by IS NULL THEN
      NEW.archived_by := auth.uid();
    END IF;
    IF NEW.archived_at IS NOT NULL THEN
      NEW.vigencia_estado := 'arquivado';
    END IF;

    IF NEW.vigencia_estado IS DISTINCT FROM OLD.vigencia_estado THEN
      v_admin := public.has_org_role(NEW.organization_id, 'admin');
      v_papel := public.staff_meu_papel(NEW.organization_id);

      -- Toda transição governada exige perfil autorizado.
      IF NEW.vigencia_estado IN ('homologado','vigente','substituido','suspenso','arquivado') THEN
        IF NOT v_admin AND COALESCE(v_papel::text, '') <> 'operacoes' THEN
          RAISE EXCEPTION 'Somente admin ou operações podem homologar, tornar vigente, substituir, suspender ou arquivar um item.';
        END IF;
      END IF;

      IF NEW.vigencia_estado IN ('homologado','vigente') THEN
        IF COALESCE(btrim(NEW.versao), '') = '' THEN
          RAISE EXCEPTION 'Homologação exige versão do item.';
        END IF;
        IF COALESCE(btrim(NEW.owner), '') = '' THEN
          RAISE EXCEPTION 'Homologação exige responsável pelo item.';
        END IF;
        IF COALESCE(btrim(NEW.homologacao_criterio), '') = '' THEN
          RAISE EXCEPTION 'Homologação exige critério ou evidência registrada.';
        END IF;
        NEW.homologado_por := COALESCE(NEW.homologado_por, auth.uid());
        NEW.homologado_em := COALESCE(NEW.homologado_em, now());
      END IF;

      -- Sucessor só entra em vigência quando o predecessor foi encerrado.
      IF NEW.vigencia_estado = 'vigente' AND NEW.substitui_item_id IS NOT NULL THEN
        SELECT vigencia_estado INTO v_pred_estado
          FROM public.master_library_items WHERE id = NEW.substitui_item_id;
        IF COALESCE(v_pred_estado, '') NOT IN ('substituido','suspenso','arquivado') THEN
          RAISE EXCEPTION 'Sucessor só pode ficar vigente após o predecessor ser substituído, suspenso ou arquivado.';
        END IF;
      END IF;

      IF NEW.vigencia_estado = 'suspenso' THEN
        IF COALESCE(btrim(NEW.suspensao_motivo), '') = '' THEN
          RAISE EXCEPTION 'Suspensão exige motivo registrado.';
        END IF;
        NEW.suspenso_por := COALESCE(NEW.suspenso_por, auth.uid());
        NEW.suspenso_em := COALESCE(NEW.suspenso_em, now());
      END IF;

      IF NEW.vigencia_estado = 'substituido' THEN
        IF NEW.substituido_por_item_id IS NULL THEN
          RAISE EXCEPTION 'Item substituído deve apontar para o item sucessor.';
        END IF;
        IF NEW.substituido_por_item_id = NEW.id THEN
          RAISE EXCEPTION 'Um item não pode substituir a si mesmo.';
        END IF;
        SELECT organization_id INTO v_sucessor_org
          FROM public.master_library_items WHERE id = NEW.substituido_por_item_id;
        IF v_sucessor_org IS NULL OR v_sucessor_org <> NEW.organization_id THEN
          RAISE EXCEPTION 'Item sucessor inexistente ou de outra organização.';
        END IF;
        -- Reciprocidade: o sucessor referencia o predecessor.
        UPDATE public.master_library_items
          SET substitui_item_id = NEW.id
          WHERE id = NEW.substituido_por_item_id
            AND substitui_item_id IS DISTINCT FROM NEW.id;
      END IF;

      -- Evento append-only da mudança de estado.
      INSERT INTO public.master_library_state_events (
        organization_id, item_id, estado_anterior, estado_novo, justificativa,
        versao, responsavel, criterio_registrado, sucessor_id, predecessor_id, ator_user_id
      ) VALUES (
        NEW.organization_id, NEW.id, OLD.vigencia_estado, NEW.vigencia_estado,
        COALESCE(NULLIF(btrim(NEW.vigencia_justificativa), ''),
                 NULLIF(btrim(NEW.suspensao_motivo), ''),
                 NULLIF(btrim(NEW.archive_motivo), '')),
        NEW.versao, NEW.owner,
        COALESCE(btrim(NEW.homologacao_criterio), '') <> '',
        NEW.substituido_por_item_id, NEW.substitui_item_id, auth.uid()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;