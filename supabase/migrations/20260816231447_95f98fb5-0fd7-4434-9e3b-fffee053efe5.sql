revoke execute on function public.pode_iniciar_pesquisa_externa(uuid) from anon;
revoke execute on function public.research_quality_scan(uuid) from anon;
revoke execute on function public.rg_pode_editar_caso(uuid) from anon;
revoke execute on function public.rg_tem_evidencia_validada(text, uuid) from anon;
revoke execute on function public.rg_papel(uuid) from anon;
revoke execute on function public.rg_ler_detalhe(uuid) from anon;
revoke execute on function public.rg_ler_resumo(uuid) from anon;
revoke execute on function public.rg_editar(uuid) from anon;
revoke execute on function public.rg_admin(uuid) from anon;

-- ---------- Cenário DEMO fictício ----------
do $$
declare v_org uuid; v_case uuid; v_rc uuid; v_user uuid;
        p_ancestral uuid; p_viva uuid;
        s_cat uuid; s_ext uuid;
        e_coll uuid; e_rev uuid; e_val uuid; e_desc uuid;
        r_asserted uuid; r_val uuid; ev1 uuid;
begin
  select id, organization_id into v_case, v_org from public.crm_casos
   where demo is true and archived_at is null order by created_at limit 1;
  if v_case is null then return; end if;
  if exists (select 1 from public.research_cases where case_id = v_case) then return; end if;
  select user_id into v_user from public.organization_members
   where organization_id = v_org order by created_at limit 1;
  if v_user is null then return; end if;

  insert into public.research_cases (organization_id, case_id, status, research_objective,
    research_scope_summary, country_context, confidence_level,
    external_research_authorization_status, next_research_action, internal_risk_summary, demo)
  values (v_org, v_case, 'preparation',
    'DEMO — organizar linha familiar e lacunas documentais antes de qualquer ação externa.',
    'DEMO — dados fictícios para treinamento interno.', 'Itália', 'not_assessed',
    'not_requested', 'Revisar documentos já fornecidos pela família.',
    'DEMO — identidade do ancestral ainda não revisada.', true)
  returning id into v_rc;

  insert into public.research_people (organization_id, research_case_id, canonical_name, person_status, living_status, birth_date_precision, birth_place, nationality_context, identity_status, notes_internal)
  values (v_org, v_rc, 'DEMO Antenor Fittipaldi', 'ancestor', 'deceased', 'year', 'DEMO — comune fictício', 'Itália', 'tentative', 'DEMO — pessoa fictícia.')
  returning id into p_ancestral;

  insert into public.research_people (organization_id, research_case_id, canonical_name, person_status, living_status, identity_status, sensitivity_level, notes_internal)
  values (v_org, v_rc, 'DEMO Marina Fittipaldi', 'subject', 'living', 'unreviewed', 'restricted', 'DEMO — pessoa viva fictícia, acesso restrito.')
  returning id into p_viva;

  insert into public.research_name_variants (organization_id, person_id, variant_name, variant_type, status, notes)
  values (v_org, p_ancestral, 'DEMO Antenor Fitipaldi', 'spelling', 'plausible', 'DEMO — grafia alternativa em registro civil.'),
         (v_org, p_ancestral, 'DEMO Antonio Fittipaldi', 'record_error', 'rejected', 'DEMO — pessoa distinta; não vincular por semelhança de nome.');

  insert into public.research_sources (organization_id, research_case_id, source_type, title, repository_or_institution, citation_text, source_status, external_source, notes_internal)
  values (v_org, v_rc, 'family_document', 'DEMO — certidão fornecida pela família', 'Acervo da família (DEMO)', 'DEMO — cópia simples entregue pelo cliente.', 'reviewed', false, 'DEMO')
  returning id into s_cat;

  insert into public.research_sources (organization_id, research_case_id, source_type, title, repository_or_institution, citation_text, source_status, external_source, notes_internal)
  values (v_org, v_rc, 'archive_catalog', 'DEMO — referência de catálogo de arquivo', 'Arquivo fictício (DEMO)', 'DEMO — apenas referência catalogada; nenhuma consulta externa executada.', 'referenced', true, 'DEMO — referência não é prova.')
  returning id into s_ext;

  insert into public.research_evidence_items (organization_id, research_case_id, evidence_type, title, description, person_id, source_id, evidence_status, confidence_level)
  values (v_org, v_rc, 'structured_note', 'DEMO — relato familiar sobre origem', 'DEMO — informação coletada em entrevista fictícia.', p_ancestral, s_cat, 'collected', 'low')
  returning id into e_coll;

  insert into public.research_evidence_items (organization_id, research_case_id, evidence_type, title, description, person_id, source_id, evidence_status, confidence_level)
  values (v_org, v_rc, 'record_excerpt', 'DEMO — trecho de registro em revisão', 'DEMO — aguardando conferência de grafia.', p_ancestral, s_ext, 'under_review', 'low')
  returning id into e_rev;

  insert into public.research_evidence_items (organization_id, research_case_id, evidence_type, title, description, person_id, source_id, evidence_status, confidence_level, validation_rationale, reviewed_by, validated_by, reviewed_at, validated_at, fornecida_pelo_cliente, origem_externa)
  values (v_org, v_rc, 'document', 'DEMO — certidão de nascimento (cópia da família)', 'DEMO — documento entregue pelo cliente.', p_ancestral, s_cat, 'validated', 'high',
    'DEMO — documento conferido com a fonte original fornecida pela família e revisado internamente.', v_user, v_user, now(), now(), true, true)
  returning id into e_val;

  insert into public.research_evidence_items (organization_id, research_case_id, evidence_type, title, description, evidence_status, discard_reason)
  values (v_org, v_rc, 'archive_reference', 'DEMO — homônimo descartado', 'DEMO — semelhança de nome sem vínculo comprovado.', 'discarded', 'DEMO — pessoa distinta; datas incompatíveis.')
  returning id into e_desc;

  insert into public.research_relationships (organization_id, research_case_id, person_a_id, person_b_id, relationship_type, directionality, status, confidence_level, notes_internal)
  values (v_org, v_rc, p_ancestral, p_viva, 'grandparent', 'a_to_b', 'asserted', 'low', 'DEMO — vínculo afirmado pela família, ainda sem lastro.')
  returning id into r_asserted;

  insert into public.research_relationships (organization_id, research_case_id, person_a_id, person_b_id, relationship_type, directionality, status, confidence_level, notes_internal)
  values (v_org, v_rc, p_ancestral, p_viva, 'parent', 'a_to_b', 'asserted', 'medium', 'DEMO — relação com evidência validada.')
  returning id into r_val;

  insert into public.research_evidence_links (organization_id, evidence_item_id, entity_type, entity_id, link_role, notes)
  values (v_org, e_val, 'relationship', r_val, 'supports', 'DEMO'),
         (v_org, e_val, 'person', p_ancestral, 'identifies', 'DEMO');

  update public.research_relationships set status='validated', confidence_level='high' where id = r_val;

  insert into public.research_case_events (organization_id, research_case_id, person_id, event_type, event_date_precision, location_text, country_context, status, confidence_level, notes_internal)
  values (v_org, v_rc, p_ancestral, 'migration', 'year', 'DEMO — porto fictício', 'Brasil', 'under_review', 'low', 'DEMO — período estimado.')
  returning id into ev1;

  insert into public.research_case_hypotheses (organization_id, research_case_id, title, statement, category, status, confidence_level, related_person_id)
  values (v_org, v_rc, 'DEMO — hipótese de filiação', 'Hipótese de pesquisa — não é conclusão. DEMO: possível filiação a confirmar por documento civil.', 'parentage', 'open', 'low', p_ancestral);

  insert into public.research_document_requests (organization_id, research_case_id, person_id, request_type, requested_document_type, status, external_action_required, notes_internal, client_visible)
  values (v_org, v_rc, p_viva, 'client_document', 'DEMO — documento de identidade do requerente', 'requested_from_client', false, 'DEMO', true);

  insert into public.research_document_requests (organization_id, research_case_id, person_id, request_type, requested_document_type, target_institution, status, external_action_required, notes_internal)
  values (v_org, v_rc, p_ancestral, 'archive_request', 'DEMO — certidão em arquivo estrangeiro', 'DEMO — arquivo fictício', 'requested_from_client', true, 'DEMO — depende de contrato, financeiro e autorização.');

  insert into public.research_pending_items (organization_id, research_case_id, title, description, category, severity, status, blocking_reason)
  values (v_org, v_rc, 'DEMO — identidade do ancestral não revisada', 'Revisar variantes antes de qualquer resumo.', 'identity', 'critical', 'open', 'Sem revisão humana da identidade.'),
         (v_org, v_rc, 'DEMO — conferir grafia em registro', 'Divergência de grafia entre documentos.', 'conflict', 'high', 'open', null);

  insert into public.research_reports (organization_id, research_case_id, report_type, status, title, content)
  values (v_org, v_rc, 'internal_progress', 'draft', 'DEMO — relatório interno de andamento',
    'INTERNO — NÃO ENVIAR / NÃO PUBLICAR. DEMO: organização inicial do caso, lacunas e próximos passos.');

  insert into public.research_client_summaries (organization_id, research_case_id, title_client_facing, summary_client_facing, status)
  values (v_org, v_rc, 'DEMO — andamento da organização documental',
    'DEMO: seguimos organizando os documentos já enviados pela família. Avisaremos quando houver nova etapa.', 'draft');
end $$;