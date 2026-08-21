DO $$
DECLARE
  v_case uuid := 'a11a0000-0000-4000-8000-000000000002';
  v_nucleo uuid := 'a11a0000-0000-4000-8000-0000000000f1';
  v_org uuid;
  r record;
BEGIN
  SELECT organization_id INTO v_org FROM public.crm_casos WHERE id = v_case;
  IF v_org IS NULL THEN RETURN; END IF;

  FOR r IN
    SELECT cm.id, cm.nome
    FROM public.case_members cm
    WHERE cm.case_id = v_case
      AND cm.archived_at IS NULL
      AND EXISTS (
        SELECT 1 FROM public.nucleo_membros nm
        WHERE nm.nucleo_id = v_nucleo
          AND nm.archived_at IS NULL
          AND lower(btrim(nm.nome)) = lower(btrim(cm.nome))
      )
  LOOP
    UPDATE public.case_members
       SET archived_at = now(),
           archive_motivo = 'Reconciliação de vínculo: composição familiar é mantida somente em Núcleos e dossiês (núcleo Silveira / Friedmann-Reimer). Registro duplicado na ficha de Caso arquivado logicamente, sem exclusão física.',
           updated_at = now()
     WHERE id = r.id;

    INSERT INTO public.caso_log (organization_id, case_id, entidade, entidade_id, campo, valor_anterior, valor_novo)
    VALUES (v_org, v_case, 'case_members', r.id, 'archived_at',
            'ativo na ficha de Caso: ' || r.nome,
            'arquivado — duplicidade com núcleo familiar único; fonte de verdade é Núcleos e dossiês');
  END LOOP;

  INSERT INTO public.caso_log (organization_id, case_id, entidade, entidade_id, campo, valor_anterior, valor_novo)
  VALUES (v_org, v_case, 'crm_casos', v_case, 'vinculo_nucleo',
          'Composição familiar duplicada entre Caso e Núcleos',
          'Caso CA-CID-AT-FAM-2026-001 (alias CA-AUT-ANALUIZA-FAM-2026-001) referencia apenas o núcleo Silveira / Friedmann-Reimer e seu dossiê-mãe único');
END $$;