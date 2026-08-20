DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['crm_casos','leads','clientes','tarefas','case_alerts','communication_queue'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS data_origin text NOT NULL DEFAULT ''real''', t);
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t||'_data_origin_chk');
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (data_origin IN (''real'',''fixture_demo'',''importado'',''migrado''))', t, t||'_data_origin_chk');
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.fn_data_origin_coerencia()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE tem_demo boolean;
BEGIN
  IF NEW.data_origin IS NULL OR btrim(NEW.data_origin) = '' THEN
    NEW.data_origin := 'real';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = TG_TABLE_NAME AND column_name = 'demo'
  ) INTO tem_demo;

  IF tem_demo THEN
    IF NEW.data_origin = 'fixture_demo' THEN
      NEW := jsonb_populate_record(NEW, jsonb_build_object('demo', true));
    ELSIF (to_jsonb(NEW) ->> 'demo')::boolean IS TRUE AND NEW.data_origin = 'real' THEN
      NEW.data_origin := 'fixture_demo';
    END IF;
  END IF;

  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.fn_data_origin_coerencia() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['crm_casos','leads','clientes','tarefas','case_alerts','communication_queue'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_data_origin ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_data_origin BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_data_origin_coerencia()', t);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_crm_casos_data_origin ON public.crm_casos (organization_id, data_origin);
CREATE INDEX IF NOT EXISTS idx_case_alerts_data_origin ON public.case_alerts (organization_id, data_origin);