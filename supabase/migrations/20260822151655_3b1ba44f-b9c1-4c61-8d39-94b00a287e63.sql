
ALTER TABLE public.case_alerts DROP CONSTRAINT case_alerts_data_origin_chk;
ALTER TABLE public.case_alerts ADD CONSTRAINT case_alerts_data_origin_chk
  CHECK (data_origin = ANY (ARRAY['real','fixture_demo','development_fixture','importado','migrado']));
