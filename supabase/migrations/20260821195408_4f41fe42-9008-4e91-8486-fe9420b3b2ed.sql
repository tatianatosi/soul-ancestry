ALTER TABLE public.master_library_items
  ADD COLUMN IF NOT EXISTS vigencia_estado text NOT NULL DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS homologacao_criterio text,
  ADD COLUMN IF NOT EXISTS homologado_por uuid,
  ADD COLUMN IF NOT EXISTS homologado_em timestamptz,
  ADD COLUMN IF NOT EXISTS substituido_por_item_id uuid REFERENCES public.master_library_items(id);

ALTER TABLE public.master_library_items
  DROP CONSTRAINT IF EXISTS master_library_items_vigencia_estado_check;
ALTER TABLE public.master_library_items
  ADD CONSTRAINT master_library_items_vigencia_estado_check
  CHECK (vigencia_estado IN ('rascunho','em_revisao','homologado','vigente','substituido','suspenso','arquivado'));

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

      IF NEW.vigencia_estado IN ('homologado','vigente') THEN
        IF NOT v_admin AND COALESCE(v_papel::text, '') <> 'operacoes' THEN
          RAISE EXCEPTION 'Somente admin ou operações podem homologar ou tornar um item vigente.';
        END IF;
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
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;