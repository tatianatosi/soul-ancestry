DROP POLICY IF EXISTS csd_select_org ON public.case_source_documents;
DROP POLICY IF EXISTS csd_insert_org ON public.case_source_documents;
DROP POLICY IF EXISTS csd_update_org ON public.case_source_documents;

CREATE POLICY csd_select_org ON public.case_source_documents
FOR SELECT TO authenticated
USING (
  public.is_org_member(organization_id)
  AND EXISTS (
    SELECT 1 FROM public.crm_casos c
    WHERE c.id = case_source_documents.case_id
      AND c.organization_id = case_source_documents.organization_id
  )
  AND public.pode_pesquisar_caso(case_id)
  AND (
    confidencialidade <> 'restrito'
    OR public.has_org_role(organization_id, 'admin')
    OR public.has_org_role(organization_id, 'pesquisador')
  )
);

CREATE POLICY csd_insert_org ON public.case_source_documents
FOR INSERT TO authenticated
WITH CHECK (
  public.is_org_member(organization_id)
  AND public.can_write(organization_id)
  AND EXISTS (
    SELECT 1 FROM public.crm_casos c
    WHERE c.id = case_source_documents.case_id
      AND c.organization_id = case_source_documents.organization_id
  )
  AND public.pode_pesquisar_caso(case_id)
);

CREATE POLICY csd_update_org ON public.case_source_documents
FOR UPDATE TO authenticated
USING (
  public.is_org_member(organization_id)
  AND public.can_write(organization_id)
  AND public.pode_pesquisar_caso(case_id)
)
WITH CHECK (
  public.is_org_member(organization_id)
  AND public.can_write(organization_id)
  AND EXISTS (
    SELECT 1 FROM public.crm_casos c
    WHERE c.id = case_source_documents.case_id
      AND c.organization_id = case_source_documents.organization_id
  )
  AND public.pode_pesquisar_caso(case_id)
);