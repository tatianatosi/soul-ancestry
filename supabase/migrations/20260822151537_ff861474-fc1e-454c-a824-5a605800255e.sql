
ALTER TABLE public.research_action_plan_items DROP CONSTRAINT rapi_origin_chk;
ALTER TABLE public.research_action_plan_items ADD CONSTRAINT rapi_origin_chk
  CHECK (data_origin = ANY (ARRAY['real','fixture_demo','development_fixture','importado','migrado']));

ALTER TABLE public.institutions DROP CONSTRAINT institutions_origin_chk;
ALTER TABLE public.institutions ADD CONSTRAINT institutions_origin_chk
  CHECK (data_origin = ANY (ARRAY['real','fixture_demo','development_fixture','importado','migrado']));

ALTER TABLE public.expense_estimates DROP CONSTRAINT ee_origin_chk;
ALTER TABLE public.expense_estimates ADD CONSTRAINT ee_origin_chk
  CHECK (data_origin = ANY (ARRAY['real','fixture_demo','development_fixture','importado','migrado']));
