CREATE OR REPLACE FUNCTION public.validate_contract_readiness(_contract_id uuid, _version_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(validation_key text, severity text, status text, label text, details text)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare c record; v record; n int;
begin
 select * into c from public.contracts where id = _contract_id;
 if c is null then raise exception 'Contrato não encontrado.'; end if;
 if public.contract_pode_ler(c.organization_id) IS DISTINCT FROM true then raise exception 'Acesso negado.'; end if;
 select * into v from public.contract_versions where contract_id = _contract_id and (_version_id is null or id = _version_id) order by version_number desc limit 1;
 create temp table _res (validation_key text, severity text, status text, label text, details text) on commit drop;
 insert into _res values
 ('contract_type','blocking',case when c.contract_type is null then 'open' else 'passed' end,'Tipo de instrumento definido',null),
 ('title_purpose','blocking',case when coalesce(trim(c.title),'')='' or coalesce(trim(c.purpose_summary),'')='' then 'open' else 'passed' end,'Título e finalidade preenchidos',null),
 ('review_owner','blocking',case when c.review_owner_user_id is null then 'open' else 'passed' end,'Responsável pela revisão humana definido',null),
 ('financial_classification','blocking',case when c.financial_change_status='pending_review' then 'open' else 'passed' end,'Condição financeira classificada',null),
 ('privacy_terms','high',case when c.privacy_terms_status='pending' then 'open' else 'passed' end,'Tratamento de dados indicado',null),
 ('external_expenses','high',case when c.external_expense_status='pending' then 'open' else 'passed' end,'Regra de despesas de terceiros definida',null),
 ('effective_period','blocking',case when c.effective_start_date is null and coalesce(trim(c.effective_rule),'')='' then 'open' else 'passed' end,'Vigência ou regra de vigência definida',null),
 ('exclusions','blocking',case when coalesce(trim(c.exclusions_summary),'')='' and not c.no_exclusions_confirmed then 'open' else 'passed' end,'Exclusões declaradas ou ausência confirmada',null);
 select count(*) into n from public.contract_parties where contract_id=_contract_id and role='provider' and active and archived_at is null;
 insert into _res values ('party_provider','blocking',case when n=0 then 'open' else 'passed' end,'Parte prestadora informada',null);
 select count(*) into n from public.contract_parties where contract_id=_contract_id and role='contracting_client' and active and archived_at is null;
 insert into _res values ('party_client','blocking',case when n=0 then 'open' else 'passed' end,'Parte contratante informada',null);
 select count(*) into n from public.contract_parties where contract_id=_contract_id and active and archived_at is null and signature_required and legal_capacity_status in ('minor','legal_representative_required') and represented_by_party_id is null;
 insert into _res values ('party_minor','blocking',case when n>0 then 'open' else 'passed' end,'Menores com representante legal',null);
 select count(*) into n from public.contract_scope_items si where si.contract_id=_contract_id and si.category='contracted_scope' and si.status='included' and si.archived_at is null;
 insert into _res values ('scope_defined','blocking',case when n=0 then 'open' else 'passed' end,'Escopo contratado definido',null);
 select count(*) into n from public.contract_annexes ca where ca.contract_id=_contract_id and ca.required_for_contract and ca.status not in ('ready_for_review','approved','attached','not_applicable') and ca.archived_at is null;
 insert into _res values ('annexes_required','blocking',case when n>0 then 'open' else 'passed' end,'Anexos obrigatórios preparados',nullif(n,0)::text);
 insert into _res values ('version_content','blocking',case when v is null or v.generated_content='{}'::jsonb then 'open' else 'passed' end,'Versão de trabalho com conteúdo gerado',null);
 if c.contract_type in ('contract_complement','amendment') then
 insert into _res values ('parent_contract','blocking',case when c.parent_contract_id is null or coalesce(trim(c.base_contract_reference),'')='' then 'open' else 'passed' end,'Contrato-base vinculado e referenciado',null);
 select count(*) into n from public.contract_clause_overrides where contract_id=_contract_id and archived_at is null;
 insert into _res values ('instrument_not_empty','blocking',case when n=0 then 'open' else 'passed' end,'Instrumento derivado possui itens expressamente indicados',null);
 select count(*) into n from public.contract_clause_overrides where contract_id=_contract_id and archived_at is null and action='replace' and (coalesce(trim(base_contract_clause_reference),'')='' or coalesce(trim(change_reason),'')='' or coalesce(trim(precedence_statement),'')='');
 insert into _res values ('replace_requirements','blocking',case when n>0 then 'open' else 'passed' end,'Substituições com cláusula-base, justificativa e precedência',null);
 end if;
 delete from public.contract_validation_results vr where vr.contract_id=_contract_id and vr.status='open' and vr.contract_version_id is not distinct from v.id;
 insert into public.contract_validation_results (organization_id,contract_id,contract_version_id,validation_key,severity,status,label,details,created_by)
 select c.organization_id,_contract_id,v.id,r.validation_key,r.severity,r.status,r.label,r.details,auth.uid() from _res r;
 insert into public.contract_review_events (organization_id,contract_id,contract_version_id,event_type,actor_user_id,metadata)
 values(c.organization_id,_contract_id,v.id,'validation_run',auth.uid(),jsonb_build_object('abertas',(select count(*) from _res rr where rr.status='open')));
 return query select r.validation_key,r.severity,r.status,r.label,r.details from _res r;
end $function$;