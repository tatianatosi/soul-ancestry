DROP POLICY IF EXISTS ccc_write_org ON public.case_commercial_condition;

CREATE POLICY ccc_insert_preparadores
ON public.case_commercial_condition
FOR INSERT TO authenticated
WITH CHECK (public.contract_pode_preparar(organization_id));

CREATE POLICY ccc_update_preparadores
ON public.case_commercial_condition
FOR UPDATE TO authenticated
USING (public.contract_pode_preparar(organization_id))
WITH CHECK (public.contract_pode_preparar(organization_id));