-- P25 (26/09/2026) — pedido explícito da Proprietária: matriz de marcos
-- jurídicos por país deve cobrir Irlanda e França/Brasil (naturalizações),
-- que a verificação desta rodada confirmou genuinamente ausentes:
-- Irlanda não tinha trilha nenhuma; França não tinha trilha nenhuma;
-- Brasil já tinha trilha (TRILHA_BRASIL_NATURALIZACAO) mas nenhuma regra
-- nem marco jurídico associado.
--
-- Mesmo padrão conservador já usado para Bélgica/Tchéquia/Eslovênia (P17):
-- "Marco oficial a homologar", nenhuma fonte legal específica afirmada
-- sem confirmação — não fabricar citação de lei que não foi verificada
-- nesta sessão. Irlanda e França nascem no mesmo tier "backlog jurídico"
-- (detection_only) que Bélgica.

-- ============================================================
-- Parte 1 — trilha da Irlanda (nova, conteúdo fino)
-- ============================================================
insert into public.citizenship_tracks
  (organization_id, code, pais, nacionalidade, via_preliminar, marco_juridico_referencia, status_via,
   requisitos_entrada, documentos_prioritarios, riscos_internos, autorizacao_pesquisa_necessaria,
   revisao_humana_juridica, status_atualizacao, pesquisa_externa_aplicavel, lifecycle_status,
   legal_reference_label, legal_reference_summary, official_source_name, official_source_url)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'TRK-IE-DESC', 'Irlanda', 'outra_nacionalidade', 'a_confirmar',
       'Marco oficial a homologar', 'em_confirmacao_juridica',
       null, 'Nenhum documento prioritário confirmado ainda — rota em backlog jurídico.',
       'Detecção de vínculo; backlog jurídico — cadeia de registros e ordem documental não transcritas ainda. Tratado como triagem inicial, não como rota validada.',
       true, 'obrigatoria', 'vigente', true, 'em_revisao',
       'Marco oficial a homologar', 'Não ofertar como rota concluída sem revisão jurídica.',
       'Fonte oficial a homologar', ''
where not exists (select 1 from public.citizenship_tracks t where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = 'TRK-IE-DESC');

-- ============================================================
-- Parte 2 — trilha da França (nova, conteúdo fino — naturalização, não
-- cidadania por descendência, mesma distinção que a Proprietária já fez
-- para o Brasil).
-- ============================================================
insert into public.citizenship_tracks
  (organization_id, code, pais, nacionalidade, via_preliminar, marco_juridico_referencia, status_via,
   requisitos_entrada, documentos_prioritarios, riscos_internos, autorizacao_pesquisa_necessaria,
   revisao_humana_juridica, status_atualizacao, pesquisa_externa_aplicavel, lifecycle_status,
   legal_reference_label, legal_reference_summary, official_source_name, official_source_url)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'TRK-FR-NATURALIZACAO', 'França', 'francesa', 'a_confirmar',
       'Marco oficial a homologar', 'em_confirmacao',
       null, 'Nenhum documento prioritário confirmado ainda — rota em backlog jurídico.',
       'Naturalização francesa — backlog jurídico, sem marco/fonte oficial transcrita ainda. Tratado como triagem inicial, separado das trilhas de cidadania por descendência europeias.',
       true, 'obrigatoria', 'rascunho', true, 'em_revisao',
       'Marco oficial a homologar', 'Não ofertar como rota concluída sem revisão jurídica.',
       'Fonte oficial a homologar', ''
where not exists (select 1 from public.citizenship_tracks t where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = 'TRK-FR-NATURALIZACAO');

-- ============================================================
-- Parte 3 — regra e marco jurídico para as 2 trilhas novas + a trilha do
-- Brasil já existente (TRILHA_BRASIL_NATURALIZACAO), que tinha trilha mas
-- nenhuma regra/marco associado — mesmo padrão fino.
-- ============================================================
insert into public.versioned_legal_rules
  (organization_id, track_id, tema, status, escopo, dados_necessarios, fonte_referencia)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id,
       t.pais || ' — detecção de vínculo (backlog jurídico)', 'em_revisao',
       'Triagem de vínculo declarado, sem rota jurídica validada — mesmo tratamento do backlog oriental. Detecção apenas, sem resultado ou preço até pesquisa jurídica dedicada.',
       'Declaração de vínculo/local ancestral ou intenção de naturalização; nenhum dado adicional coletado até decisão de aprofundar a pesquisa jurídica.',
       'Marco oficial a homologar — sem citação confirmada'
from public.citizenship_tracks t
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and t.code in ('TRK-IE-DESC', 'TRK-FR-NATURALIZACAO', 'TRILHA_BRASIL_NATURALIZACAO')
  and not exists (select 1 from public.versioned_legal_rules r where r.track_id = t.id);

insert into public.legal_reference_milestones
  (organization_id, track_id, label, reference_type, status, review_required, lifecycle_status, summary_internal)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, 'Marco oficial a homologar', 'lei', 'a_revisar', 'obrigatoria', 'em_revisao',
       'Não ofertar como rota concluída sem revisão jurídica.'
from public.citizenship_tracks t
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and t.code in ('TRK-IE-DESC', 'TRK-FR-NATURALIZACAO', 'TRILHA_BRASIL_NATURALIZACAO')
  and not exists (select 1 from public.legal_reference_milestones m where m.track_id = t.id);
