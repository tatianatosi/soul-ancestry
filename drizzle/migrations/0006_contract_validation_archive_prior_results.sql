DO $repair$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.validate_contract_readiness(uuid,uuid)'::regprocedure) INTO definition;
 IF strpos(definition,'delete from public.contract_validation_results vr') = 0 THEN RAISE EXCEPTION 'Expected validation cleanup not found'; END IF;
 definition := replace(definition, 'delete from public.contract_validation_results vr where vr.contract_id=_contract_id and vr.status=''open'' and vr.contract_version_id is not distinct from v.id;', 'update public.contract_validation_results vr set archived_at=now(), archived_by=auth.uid(), archive_reason=''Substituída por nova validação do instrumento'' where vr.contract_id=_contract_id and vr.archived_at is null and vr.contract_version_id is not distinct from v.id;');
 EXECUTE definition;
END $repair$;