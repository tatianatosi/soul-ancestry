CREATE OR REPLACE FUNCTION public.fn_admin_approval_boundary() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  incoming jsonb := to_jsonb(NEW);
  previous jsonb := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE '{}'::jsonb END;
  rules jsonb := TG_ARGV[0]::jsonb;
  metadata_keys text[] := string_to_array(TG_ARGV[1], ',');
  rule record;
  field text;
  approved_new boolean := false;
  approved_old boolean := false;
  approval_changed boolean := false;
  org uuid;
BEGIN
  org := (incoming->>'organization_id')::uuid;
  FOR rule IN SELECT key, value FROM jsonb_each(rules) LOOP
    IF rule.value ? COALESCE(incoming->>rule.key, '') THEN approved_new := true; END IF;
    IF rule.value ? COALESCE(previous->>rule.key, '') THEN approved_old := true; END IF;
    IF (rule.value ? COALESCE(incoming->>rule.key, '')) AND incoming->rule.key IS DISTINCT FROM previous->rule.key THEN approval_changed := true; END IF;
  END LOOP;
  FOREACH field IN ARRAY metadata_keys LOOP
    IF incoming->>field IS NOT NULL AND incoming->field IS DISTINCT FROM previous->field THEN approval_changed := true; END IF;
  END LOOP;
  IF (TG_OP = 'INSERT' AND approved_new) OR approval_changed OR
    ((approved_old OR approved_new) AND TG_OP = 'UPDATE' AND
     (incoming - ARRAY['updated_at','updated_by','created_at','created_by','archived_at','archived_by','archive_reason','archive_motivo']) IS DISTINCT FROM
     (previous - ARRAY['updated_at','updated_by','created_at','created_by','archived_at','archived_by','archive_reason','archive_motivo'])) THEN
    IF public.contract_pode_aprovar(org) IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'APROVACAO_ADMIN: somente admin ativo da organização aprova preços e contratos ou altera conteúdo aprovado.' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_admin_approval_boundary() FROM PUBLIC, anon, authenticated;