DROP POLICY IF EXISTS "app_proj_select_portal" ON public.app_projections;

CREATE POLICY "app_proj_select_portal" ON public.app_projections
  FOR SELECT TO authenticated
  USING (
    destination = 'app'
    AND approval_status = 'published'
    AND archived_at IS NULL
    AND effective_from IS NOT NULL
    AND effective_from <= now()
    AND visibility_scope IN ('titular', 'nucleo')
    AND public.portal_caso_permitido(case_id)
  );

CREATE OR REPLACE VIEW public.portal_projecoes
WITH (security_barrier = true, security_invoker = true) AS
SELECT p.id,
       p.case_id,
       p.projection_type,
       p.content_sanitized,
       p.effective_from,
       p.updated_at
FROM public.app_projections p
WHERE p.destination = 'app'
  AND p.approval_status = 'published'
  AND p.archived_at IS NULL
  AND p.effective_from IS NOT NULL
  AND p.effective_from <= now();

REVOKE ALL ON public.portal_projecoes FROM anon;
GRANT SELECT ON public.portal_projecoes TO authenticated;

CREATE INDEX IF NOT EXISTS app_proj_publicadas_idx
  ON public.app_projections (case_id, effective_from DESC)
  WHERE destination = 'app' AND approval_status = 'published' AND archived_at IS NULL;