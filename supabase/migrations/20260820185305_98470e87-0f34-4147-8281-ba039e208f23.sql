-- 1. Colunas de autoria ausentes
ALTER TABLE public.case_alerts ADD COLUMN IF NOT EXISTS created_by uuid, ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.entity_labels ADD COLUMN IF NOT EXISTS created_by uuid, ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.onboarding_checklist ADD COLUMN IF NOT EXISTS created_by uuid, ADD COLUMN IF NOT EXISTS updated_by uuid;

-- 2. Preenchimento de autoria pelo servidor (auth.uid()), nunca pela interface
DROP TRIGGER IF EXISTS case_alerts_meta ON public.case_alerts;
CREATE TRIGGER case_alerts_meta BEFORE INSERT OR UPDATE ON public.case_alerts
  FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();
DROP TRIGGER IF EXISTS entity_labels_meta ON public.entity_labels;
CREATE TRIGGER entity_labels_meta BEFORE INSERT OR UPDATE ON public.entity_labels
  FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();
DROP TRIGGER IF EXISTS onboarding_checklist_meta ON public.onboarding_checklist;
CREATE TRIGGER onboarding_checklist_meta BEFORE INSERT OR UPDATE ON public.onboarding_checklist
  FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();
DROP TRIGGER IF EXISTS checklist_cadastral_meta ON public.checklist_cadastral;
CREATE TRIGGER checklist_cadastral_meta BEFORE INSERT OR UPDATE ON public.checklist_cadastral
  FOR EACH ROW EXECUTE FUNCTION public.fn_touch_meta();

-- 3. Auditoria por campo, com mascaramento de dados sensíveis
CREATE OR REPLACE FUNCTION public.fn_audit_campos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_org uuid;
  v_id uuid;
  v_old jsonb := case when TG_OP = 'UPDATE' then to_jsonb(OLD) else '{}'::jsonb end;
  v_new jsonb := to_jsonb(NEW);
  v_ant jsonb := '{}'::jsonb;
  v_pos jsonb := '{}'::jsonb;
  k text;
  sensivel boolean;
begin
  v_org := (v_new->>'organization_id')::uuid;
  v_id := (v_new->>'id')::uuid;

  for k in select jsonb_object_keys(v_new) loop
    if TG_OP = 'UPDATE' and (v_old->k) is not distinct from (v_new->k) then
      continue;
    end if;
    sensivel := k ~* '(cpf|rg\b|documento|endereco|cep|telefone|email|e_mail|url|link|token|transcri|storage_path|protegid|observac)';
    v_ant := v_ant || jsonb_build_object(
      k,
      case
        when TG_OP <> 'UPDATE' then null
        when v_old->k is null or v_old->k = 'null'::jsonb then null
        when sensivel then to_jsonb('[protegido]'::text)
        else v_old->k
      end);
    v_pos := v_pos || jsonb_build_object(
      k,
      case
        when v_new->k is null or v_new->k = 'null'::jsonb then null
        when sensivel then to_jsonb('[protegido]'::text)
        else v_new->k
      end);
  end loop;

  if v_org is null or (TG_OP = 'UPDATE' and v_pos = '{}'::jsonb) then
    return NEW;
  end if;

  insert into public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, valores_anteriores, valores_posteriores, metadados)
  values (v_org, auth.uid(), lower(TG_OP), TG_TABLE_NAME, v_id,
    case when TG_OP = 'UPDATE' then v_ant else null end, v_pos,
    jsonb_build_object('origem', 'aba_casos', 'campos', (select jsonb_agg(x) from jsonb_object_keys(v_pos) x)));
  return NEW;
end
$function$;

DROP TRIGGER IF EXISTS case_services_audit_campos ON public.case_services;
CREATE TRIGGER case_services_audit_campos AFTER INSERT OR UPDATE ON public.case_services
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_campos();
DROP TRIGGER IF EXISTS case_service_criterios_audit_campos ON public.case_service_criterios;
CREATE TRIGGER case_service_criterios_audit_campos AFTER INSERT OR UPDATE ON public.case_service_criterios
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_campos();
DROP TRIGGER IF EXISTS onboarding_checklist_audit_campos ON public.onboarding_checklist;
CREATE TRIGGER onboarding_checklist_audit_campos AFTER INSERT OR UPDATE ON public.onboarding_checklist
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_campos();
DROP TRIGGER IF EXISTS checklist_cadastral_audit_campos ON public.checklist_cadastral;
CREATE TRIGGER checklist_cadastral_audit_campos AFTER INSERT OR UPDATE ON public.checklist_cadastral
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_campos();
DROP TRIGGER IF EXISTS entity_labels_audit_campos ON public.entity_labels;
CREATE TRIGGER entity_labels_audit_campos AFTER INSERT OR UPDATE ON public.entity_labels
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_campos();
DROP TRIGGER IF EXISTS case_alerts_audit_campos ON public.case_alerts;
CREATE TRIGGER case_alerts_audit_campos AFTER INSERT OR UPDATE ON public.case_alerts
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_campos();

-- 4. Políticas: papel public -> authenticated (mesma condição de organização)
DROP POLICY IF EXISTS chk_cad_select ON public.checklist_cadastral;
DROP POLICY IF EXISTS chk_cad_insert ON public.checklist_cadastral;
DROP POLICY IF EXISTS chk_cad_update ON public.checklist_cadastral;
CREATE POLICY chk_cad_select ON public.checklist_cadastral FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY chk_cad_insert ON public.checklist_cadastral FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY chk_cad_update ON public.checklist_cadastral FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

DROP POLICY IF EXISTS cte_select ON public.case_timeline_events;
DROP POLICY IF EXISTS cte_insert ON public.case_timeline_events;
DROP POLICY IF EXISTS cte_update ON public.case_timeline_events;
CREATE POLICY cte_select ON public.case_timeline_events FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY cte_insert ON public.case_timeline_events FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
CREATE POLICY cte_update ON public.case_timeline_events FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

REVOKE ALL ON public.checklist_cadastral FROM anon;
REVOKE ALL ON public.case_timeline_events FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.checklist_cadastral TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.case_timeline_events TO authenticated;
GRANT ALL ON public.checklist_cadastral TO service_role;
GRANT ALL ON public.case_timeline_events TO service_role;