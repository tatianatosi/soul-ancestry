CREATE OR REPLACE FUNCTION public.fn_case_source_document_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, metadados)
  VALUES (
    NEW.organization_id,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'criacao'
         WHEN NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN 'arquivamento'
         ELSE 'atualizacao' END,
    'case_source_documents',
    NEW.id,
    jsonb_build_object(
      'case_id', NEW.case_id,
      'tipo_documento', NEW.tipo_documento,
      'status', NEW.status,
      'qualidade_origem', NEW.qualidade_origem,
      'confidencialidade', NEW.confidencialidade,
      'archive_motivo', NEW.archive_motivo
    )
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_case_source_document_audit() FROM public, anon, authenticated;