DROP INDEX IF EXISTS public.leads_codigo_uidx;
CREATE UNIQUE INDEX leads_codigo_org_uidx ON public.leads (organization_id, codigo) WHERE codigo IS NOT NULL;