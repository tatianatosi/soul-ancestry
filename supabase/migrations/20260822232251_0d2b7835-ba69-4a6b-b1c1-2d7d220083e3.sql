ALTER VIEW public.portal_casos SET (security_invoker = true);
ALTER VIEW public.portal_meu_cadastro SET (security_invoker = true);

ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES public.service_orders(id),
  ADD COLUMN IF NOT EXISTS source_annex_id uuid REFERENCES public.contract_annexes(id);

ALTER TABLE public.contract_scope_items
  ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES public.contract_scope_items(id),
  ADD COLUMN IF NOT EXISTS source_annex_id uuid REFERENCES public.contract_annexes(id),
  ADD COLUMN IF NOT EXISTS scope_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS conteudo_hash text;

CREATE INDEX IF NOT EXISTS idx_service_orders_previous_version ON public.service_orders(previous_version_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_source_annex ON public.service_orders(source_annex_id);
CREATE INDEX IF NOT EXISTS idx_contract_scope_previous_version ON public.contract_scope_items(previous_version_id);
CREATE INDEX IF NOT EXISTS idx_contract_scope_source_annex ON public.contract_scope_items(source_annex_id);

CREATE OR REPLACE FUNCTION public.fn_anexo_v_versionar_os_escopo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_os_anterior public.service_orders%ROWTYPE;
  v_os_nova_id uuid;
  v_item jsonb;
  v_hash text;
  v_ordem integer := 0;
  v_itens jsonb;
  v_ator uuid := auth.uid();
BEGIN
  IF NEW.annex_code <> 'ANEXO_V_ALTERACAO_ESCOPO'
     OR NEW.status <> 'approved'
     OR (TG_OP = 'UPDATE' AND OLD.status = 'approved') THEN
    RETURN NEW;
  END IF;

  IF NEW.file_hash IS NULL OR btrim(NEW.file_hash) = '' THEN
    RAISE EXCEPTION 'Anexo V não pode ser aceito sem conteudo_hash.';
  END IF;

  IF NEW.structured_data IS NULL OR NEW.structured_data = '{}'::jsonb THEN
    RAISE EXCEPTION 'Anexo V não pode ser aceito sem conteúdo estruturado.';
  END IF;

  v_itens := COALESCE(NEW.structured_data->'itens_escopo', NEW.structured_data->'scope_items');
  IF v_itens IS NULL OR jsonb_typeof(v_itens) <> 'array' OR jsonb_array_length(v_itens) = 0 THEN
    RAISE EXCEPTION 'Anexo V não pode ser aceito sem itens de escopo versionáveis.';
  END IF;

  SELECT * INTO v_os_anterior
  FROM public.service_orders
  WHERE organization_id = NEW.organization_id
    AND contract_id = NEW.contract_id
    AND archived_at IS NULL
  ORDER BY versao DESC, created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_os_anterior.id IS NULL THEN
    RAISE EXCEPTION 'Anexo V exige ordem de serviço anterior vinculada ao contrato.';
  END IF;

  v_hash := md5(
    NEW.file_hash || ':' ||
    COALESCE(NEW.structured_data::text, '') || ':' ||
    v_os_anterior.id::text || ':' ||
    (v_os_anterior.versao + 1)::text
  );

  INSERT INTO public.service_orders (
    organization_id, contract_id, contract_version_id, case_id, status,
    scope_summary, start_condition_status, start_condition_notes,
    responsible_user_id, start_date, end_date, deliverable_summary,
    client_visible_summary, internal_notes, demo, proposal_id,
    commercial_condition_id, versao, conteudo_hash, dados_teste,
    previous_version_id, source_annex_id, created_by, updated_by
  ) VALUES (
    v_os_anterior.organization_id, v_os_anterior.contract_id,
    v_os_anterior.contract_version_id, v_os_anterior.case_id, 'draft',
    COALESCE(NULLIF(btrim(NEW.structured_data->>'scope_summary'), ''), v_os_anterior.scope_summary),
    'pending',
    'Nova versão interna derivada do aceite do Anexo V; ativação permanece sujeita aos gates vigentes.',
    v_os_anterior.responsible_user_id, v_os_anterior.start_date, v_os_anterior.end_date,
    COALESCE(NULLIF(btrim(NEW.structured_data->>'deliverable_summary'), ''), v_os_anterior.deliverable_summary),
    COALESCE(NULLIF(btrim(NEW.structured_data->>'client_visible_summary'), ''), v_os_anterior.client_visible_summary),
    'Versionada automaticamente a partir do Anexo V aprovado.',
    v_os_anterior.demo, v_os_anterior.proposal_id,
    v_os_anterior.commercial_condition_id, v_os_anterior.versao + 1,
    v_hash, v_os_anterior.dados_teste,
    v_os_anterior.id, NEW.id, v_ator, v_ator
  ) RETURNING id INTO v_os_nova_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(v_itens)
  LOOP
    IF COALESCE(btrim(v_item->>'title'), '') = '' THEN
      RAISE EXCEPTION 'Anexo V contém item de escopo sem título.';
    END IF;
    v_ordem := v_ordem + 1;
    INSERT INTO public.contract_scope_items (
      organization_id, contract_id, category, title, description, status,
      source_type, source_reference, display_order, requires_human_validation,
      proposal_id, commercial_condition_id, service_order_id,
      previous_version_id, source_annex_id, scope_version, conteudo_hash,
      created_by, updated_by
    ) VALUES (
      NEW.organization_id, NEW.contract_id,
      COALESCE(NULLIF(v_item->>'category', ''), 'contracted_scope'),
      btrim(v_item->>'title'), NULLIF(btrim(v_item->>'description'), ''),
      COALESCE(NULLIF(v_item->>'status', ''), 'included'),
      'annex', 'Anexo V v' || NEW.annex_version::text,
      COALESCE((v_item->>'display_order')::integer, v_ordem), true,
      v_os_anterior.proposal_id, v_os_anterior.commercial_condition_id, v_os_nova_id,
      (SELECT c.id FROM public.contract_scope_items c
       WHERE c.organization_id = NEW.organization_id
         AND c.contract_id = NEW.contract_id
         AND c.title = btrim(v_item->>'title')
         AND c.archived_at IS NULL
       ORDER BY c.scope_version DESC, c.created_at DESC LIMIT 1),
      NEW.id, v_os_anterior.versao + 1,
      md5(NEW.file_hash || ':' || v_item::text),
      v_ator, v_ator
    );
  END LOOP;

  INSERT INTO public.audit_logs (
    organization_id, user_id, acao, entidade, entidade_id, metadados
  ) VALUES (
    NEW.organization_id, v_ator, 'anexo_v_aceito_versionamento_interno',
    'service_orders', v_os_nova_id,
    jsonb_build_object(
      'anexo_id', NEW.id,
      'os_anterior_id', v_os_anterior.id,
      'os_versao', v_os_anterior.versao + 1,
      'conteudo_hash', v_hash,
      'itens_escopo', jsonb_array_length(v_itens),
      'acao_externa', false
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_anexo_v_versionar_os_escopo ON public.contract_annexes;
CREATE TRIGGER trg_anexo_v_versionar_os_escopo
AFTER INSERT OR UPDATE OF status ON public.contract_annexes
FOR EACH ROW EXECUTE FUNCTION public.fn_anexo_v_versionar_os_escopo();