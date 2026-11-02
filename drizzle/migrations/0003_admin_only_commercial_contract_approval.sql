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
    IF NOT public.contract_pode_aprovar(org) THEN
      RAISE EXCEPTION 'APROVACAO_ADMIN: somente admin ativo da organização aprova preços e contratos ou altera conteúdo aprovado.' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.fn_admin_approval_boundary() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.price_catalog_rescued FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"price_status":["VIGENTE","HOMOLOGADO_CATALOGO","CONDICAO_PARTICULAR_DE_CASO"]}', '');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.product_catalog FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"status_homologacao":["homologado"],"preco_estado_homologacao":["homologado"],"estado_catalogo":["homologado_ativo"]}', 'homologado_por,homologado_em,responsavel_homologacao');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.commercial_conditions FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"status":["homologada"]}', 'homologado_por,homologado_em');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.case_commercial_condition FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"approval_status":["approved","aprovada","homologada"]}', 'aprovado_por,aprovado_em');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"status":["aprovada"]}', 'aprovada_em');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.contract_versions FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"status":["approved_for_send","signed_snapshot"],"review_decision":["approved"]}', 'approved_at,approved_by');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"status":["approved_for_send","sent","signed"]}', 'approved_for_send_at,approved_for_send_by,external_signature_approved_at,external_signature_approved_by');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.contract_case_parameters FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"status":["aprovado","enviado_assinatura","assinado"]}', 'aprovado_por,aprovado_em');
CREATE TRIGGER zz_admin_approval_boundary BEFORE INSERT OR UPDATE ON public.contract_parameter_previews FOR EACH ROW EXECUTE FUNCTION public.fn_admin_approval_boundary('{"evento":["aprovacao","envio_assinatura","assinatura_registrada"]}', 'aprovado_por,aprovado_em');