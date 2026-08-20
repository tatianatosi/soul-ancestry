-- Ficha de pesquisa do caso piloto (preparação apenas)
INSERT INTO public.research_cases (
  id, organization_id, case_id, status, research_scope_summary, country_context,
  family_line_summary_internal, research_objective, confidence_level,
  external_research_gate_status, external_research_authorization_status,
  next_research_action, internal_risk_summary, client_summary_status, demo
)
SELECT
  'c1a50000-0000-4000-8000-0000000000a1',
  '11f32aae-ea08-47e0-8114-f5d8a900c9a1',
  'a11a0000-0000-4000-8000-000000000002',
  'preparation',
  'Preparação interna da ficha piloto genealógica. Escopo conforme proposta Canva conferida; nenhuma consulta externa realizada.',
  'Áustria — § 58c StbG',
  'Linhagem austríaca § 58c a ser estabelecida somente por evidência. Nenhum antepassado inferido nesta etapa.',
  'Estruturar a ficha piloto genealógica do núcleo familiar e preparar o plano de pesquisa, sem consultar fontes.',
  'not_assessed',
  'pending_authorization',
  'pending',
  'Aguardar autorização de pesquisa e conclusão dos gates de formalização antes de qualquer consulta.',
  'Pesquisa não autorizada. Qualquer contato com arquivo, cartório ou repositório externo está bloqueado.',
  'not_drafted',
  false
WHERE NOT EXISTS (SELECT 1 FROM public.research_cases WHERE case_id = 'a11a0000-0000-4000-8000-000000000002');

-- Pessoas do núcleo e da pesquisa (sem inferir antepassados)
INSERT INTO public.research_people (
  id, organization_id, research_case_id, canonical_name, preferred_display_name,
  person_status, living_status, is_minor, nationality_context, identity_status,
  sensitivity_level, visible_to_client_summary, notes_internal
)
SELECT v.id::uuid, '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'c1a50000-0000-4000-8000-0000000000a1',
       v.nome, v.nome, v.papel, 'living', v.menor, 'Brasil / linha austríaca a verificar',
       'unreviewed', 'restricted', false, v.nota
FROM (VALUES
  ('c1a50000-0000-4000-8000-0000000000e1','Ana Luiza Gomes Silveira Rodrigues','subject', false, 'Contratante principal do núcleo. Dados cadastrais em conferência.'),
  ('c1a50000-0000-4000-8000-0000000000e2','Adair','family_member', false, 'Signatário do contrato familiar. Nome completo e dados a confirmar na fonte cadastral.'),
  ('c1a50000-0000-4000-8000-0000000000e3','Alice','family_member', false, 'Signatária do contrato familiar. Nome completo a confirmar.'),
  ('c1a50000-0000-4000-8000-0000000000e4','Felipe','family_member', true, 'Dependente menor. Representação legal pendente de documentação.')
) AS v(id, nome, papel, menor, nota)
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_people p WHERE p.research_case_id = 'c1a50000-0000-4000-8000-0000000000a1'
);

-- Vínculo apenas afirmado, sem evidência e sem confirmação
INSERT INTO public.research_relationships (
  organization_id, research_case_id, person_a_id, person_b_id, relationship_type,
  directionality, status, confidence_level, supporting_evidence_count, notes_internal
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'c1a50000-0000-4000-8000-0000000000a1',
       'c1a50000-0000-4000-8000-0000000000e1', 'c1a50000-0000-4000-8000-0000000000e4',
       'parent', 'a_to_b', 'asserted', 'low', 0,
       'Vínculo declarado no cadastro do caso. Não confirmado: depende de documento probatório.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_relationships WHERE research_case_id = 'c1a50000-0000-4000-8000-0000000000a1'
);

-- Hipóteses internas (nenhum achado)
INSERT INTO public.research_hypotheses (
  organization_id, case_id, person_id, titulo, descricao, status, grau_confianca, justificativa, demo
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'a11a0000-0000-4000-8000-000000000002', v.pessoa::uuid,
       v.titulo, v.descricao, 'aberta', 'baixo',
       'Hipótese interna registrada na preparação. Sem consulta a fontes e sem evidência associada.', false
FROM (VALUES
  (NULL,'Linha austríaca por ascendência direta','Verificar, quando autorizado, se existe ascendência austríaca documentada na linha da contratante.'),
  (NULL,'Documentação civil da geração intermediária','Verificar existência de registros civis brasileiros que liguem a geração intermediária à linha austríaca.'),
  (NULL,'Enquadramento § 58c StbG','Confirmar, apenas com evidência, se o núcleo se enquadra nos requisitos do § 58c StbG.')
) AS v(pessoa, titulo, descricao)
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_hypotheses WHERE case_id = 'a11a0000-0000-4000-8000-000000000002'
);

-- Lacunas e pendências internas
INSERT INTO public.research_pending_items (
  organization_id, research_case_id, title, description, category, severity, status, blocking_reason
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'c1a50000-0000-4000-8000-0000000000a1',
       v.titulo, v.descricao, v.categoria, v.severidade, v.status, v.bloqueio
FROM (VALUES
  ('Autorização de pesquisa pendente','Nenhuma consulta externa pode ocorrer antes da autorização registrada.','authorization','critical','blocked','Autorização de pesquisa não registrada.'),
  ('Gate de formalização pendente','Contrato assinado e pagamento inicial confirmado ainda pendentes.','external_gate','critical','blocked','Gates de formalização não atendidos.'),
  ('Nomes completos de Adair e Alice','Confirmar nome completo e dados cadastrais na fonte cadastral do caso.','identity','high','open',NULL),
  ('Representação legal do dependente Felipe','Documentação de representação do menor ainda não registrada.','identity','high','open',NULL),
  ('Linha austríaca não estabelecida','Nenhum antepassado austríaco identificado ou inferido nesta etapa.','relationship','high','open',NULL),
  ('Documentos familiares em posse do cliente','Levantar internamente quais documentos o núcleo já possui, sem solicitar.','document','medium','open',NULL)
) AS v(titulo, descricao, categoria, severidade, status, bloqueio)
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_pending_items WHERE research_case_id = 'c1a50000-0000-4000-8000-0000000000a1'
);

-- Fontes: apenas referências internas, sem acesso
INSERT INTO public.research_sources (
  organization_id, research_case_id, source_type, title, repository_or_institution,
  citation_text, source_status, access_level, external_source, notes_internal
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'c1a50000-0000-4000-8000-0000000000a1',
       v.tipo, v.titulo, v.repositorio, v.citacao, 'referenced', v.acesso, v.externa, v.nota
FROM (VALUES
  ('client_provided','Documentos declarados pelo núcleo familiar','Cliente','Referência interna: documentos citados pelo cliente durante o Discovery.', 'client_provided_restricted', false, 'Referência apenas. Nenhum documento solicitado ou recebido.'),
  ('archive_catalog','Catálogos de arquivo austríacos','A definir','Referência interna de catálogo potencialmente aplicável ao § 58c StbG.', 'internal_restricted', true, 'Catalogada como referência; consulta bloqueada até autorização.'),
  ('official_registry','Registros civis brasileiros da linha familiar','A definir','Referência interna de registros civis potencialmente aplicáveis.', 'internal_restricted', true, 'Catalogada como referência; nenhum pedido emitido.')
) AS v(tipo, titulo, repositorio, citacao, acesso, externa, nota)
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_sources WHERE research_case_id = 'c1a50000-0000-4000-8000-0000000000a1'
);

-- Solicitações de documento: não solicitado / a preparar
INSERT INTO public.research_document_requests (
  organization_id, research_case_id, person_id, request_type, requested_document_type,
  target_institution, status, external_action_required, external_gate_status,
  client_visible, notes_internal
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'c1a50000-0000-4000-8000-0000000000a1', v.pessoa::uuid,
       v.tipo, v.documento, v.instituicao, 'draft', false, 'pending_authorization', false,
       'Não solicitado. Preparação interna; envio depende de autorização humana.'
FROM (VALUES
  ('c1a50000-0000-4000-8000-0000000000e1','client_document','Certidão de nascimento da contratante',NULL),
  ('c1a50000-0000-4000-8000-0000000000e4','client_document','Documento de representação legal do dependente menor',NULL),
  (NULL,'future_external_request','Certidões da linha austríaca (a definir por evidência)','A definir')
) AS v(pessoa, tipo, documento, instituicao)
WHERE NOT EXISTS (
  SELECT 1 FROM public.research_document_requests WHERE research_case_id = 'c1a50000-0000-4000-8000-0000000000a1'
);