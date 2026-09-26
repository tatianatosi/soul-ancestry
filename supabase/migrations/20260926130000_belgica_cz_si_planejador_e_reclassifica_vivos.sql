-- P17 (26/09/2026) — autorização explícita: "Pode adicionar Bélgica e os
-- demais países faltantes no planejador ... os itens que estão vivos pode
-- adicionar a tabela como vivos sem divergência já aqueles que já fazem e
-- são parte da planilha mestre devem ser legado e cuidado como legado".
--
-- Varredura confirmou: Tchéquia (CZ) e Eslovênia (SI) já tinham trilha
-- jurídica real (citizenship_tracks, desde o P11) mas nunca tinham entrado
-- em planner_catalog_feed — o mesmo gap que o P16 já tinha corrigido para
-- os países bálticos/Países Baixos. Bélgica não tinha nem trilha.

-- ============================================================
-- Parte 1 — trilha da Bélgica (conteúdo fino, tier detection_only do
-- documento-fonte — "Detecção de vínculo; backlog jurídico", mesmo nível de
-- SK/UA/BG/RS/MD). Mesmo padrão conservador de sempre: nenhuma fonte legal
-- afirmada como homologada.
-- ============================================================
insert into public.citizenship_tracks
  (organization_id, code, pais, nacionalidade, via_preliminar, marco_juridico_referencia, status_via,
   requisitos_entrada, documentos_prioritarios, riscos_internos, autorizacao_pesquisa_necessaria,
   revisao_humana_juridica, status_atualizacao, pesquisa_externa_aplicavel, lifecycle_status,
   legal_reference_label, legal_reference_summary, official_source_name, official_source_url)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'TRK-BE-DESC', 'Bélgica', 'outra_nacionalidade', 'a_confirmar',
       'Marco oficial a homologar', 'em_confirmacao_juridica',
       null, 'Nenhum documento prioritário confirmado ainda — rota em backlog jurídico.',
       'Detecção de vínculo; backlog jurídico (contexto regional 2026-09-02) — tratado como triagem inicial, não como rota validada. Diferente de NL/EE/LV/LT (legal_research_pilot), a Bélgica está no tier detection_only do documento-fonte; conteúdo jurídico rico ainda não foi transcrito.',
       true, 'obrigatoria', 'vigente', true, 'em_revisao',
       'Marco oficial a homologar', 'Não ofertar como rota concluída sem revisão jurídica.',
       'Fonte oficial a homologar', ''
where not exists (select 1 from public.citizenship_tracks t where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = 'TRK-BE-DESC');

insert into public.versioned_legal_rules
  (organization_id, track_id, tema, status, escopo, dados_necessarios, fonte_referencia)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, 'Bélgica — detecção de vínculo (backlog jurídico)', 'em_revisao',
       'Triagem de vínculo declarado, sem rota jurídica validada — mesmo tratamento do backlog oriental (SK/UA/BG/RS/MD): detecção apenas, sem resultado ou preço até pesquisa jurídica dedicada.',
       'Declaração de vínculo/local ancestral; nenhum dado adicional coletado até decisão de aprofundar a pesquisa jurídica.',
       'Marco oficial a homologar — sem citação confirmada'
from public.citizenship_tracks t
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = 'TRK-BE-DESC'
  and not exists (select 1 from public.versioned_legal_rules r where r.track_id = t.id);

insert into public.legal_reference_milestones
  (organization_id, track_id, label, reference_type, status, review_required, lifecycle_status, summary_internal)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, 'Marco oficial a homologar', 'lei', 'a_revisar', 'obrigatoria', 'em_revisao',
       'Não ofertar como rota concluída sem revisão jurídica.'
from public.citizenship_tracks t
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = 'TRK-BE-DESC'
  and not exists (select 1 from public.legal_reference_milestones m where m.track_id = t.id);

-- ============================================================
-- Parte 2 — Bélgica, Tchéquia e Eslovênia entram no planejador/produtos-pai
-- (mesmo padrão de 3 itens por país já usado para os demais).
-- ============================================================
insert into public.planner_catalog_feed
  (organization_id, item_id, prefix, name, status_dictionary, product_parent, journey_phase_default, country_scope, requires_case_gate, source_artifact, source_version, reconciliation_note)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', v.item_id, 'CA-CID', v.name, 'ATIVO_SEM_PRECO_HOMOLOGADO', v.product_parent, v.fase, array[v.pais], true,
       'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados', 'v2.1',
       'Sem item homologado hoje; não estimar preço | País trazido ao planejador/produtos-pai em 2026-09-26 (P17), a pedido explícito da Proprietária.'
from (values
  ('CA-CID-BE-001', 'Diagnóstico — Bélgica', 'Diagnóstico de Cidadania por Etapas', 'F1', 'BE'),
  ('CA-CID-BE-002', 'Pesquisa/prova — Bélgica', 'Preparação de Prova e Pasta Documental', 'F2', 'BE'),
  ('CA-CID-BE-003', 'Acompanhamento — Bélgica', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'BE'),
  ('CA-CID-CZ-001', 'Diagnóstico — Tchéquia', 'Diagnóstico de Cidadania por Etapas', 'F1', 'CZ'),
  ('CA-CID-CZ-002', 'Pesquisa/prova — Tchéquia', 'Preparação de Prova e Pasta Documental', 'F2', 'CZ'),
  ('CA-CID-CZ-003', 'Acompanhamento — Tchéquia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'CZ'),
  ('CA-CID-SI-001', 'Diagnóstico — Eslovênia', 'Diagnóstico de Cidadania por Etapas', 'F1', 'SI'),
  ('CA-CID-SI-002', 'Pesquisa/prova — Eslovênia', 'Preparação de Prova e Pasta Documental', 'F2', 'SI'),
  ('CA-CID-SI-003', 'Acompanhamento — Eslovênia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'SI')
) as v(item_id, name, product_parent, fase, pais)
where not exists (select 1 from public.planner_catalog_feed p where p.item_id = v.item_id);

-- ============================================================
-- Parte 3 — reclassifica os 20 itens "LEGADO_RECONCILIAR" que a varredura
-- confirma serem produtos REAIS e ATIVOS (product_catalog.status_produto=
-- 'ativo', sem linha duplicada/arquivada) — "vivos sem divergência", por
-- definição da própria Proprietária. Regra objetiva, não arbitrária:
-- homologado + preço vigente => ATIVO_HOMOLOGADO (só CA-ASS-005 qualifica);
-- os demais (bloqueado/em_revisao no catálogo real, ou sem linha própria
-- mas com uso real já confirmado — mesmo padrão de CA-CID-DE-001/002/003b)
-- => ATIVO_SEM_PRECO_HOMOLOGADO. Nenhum item genuinamente divergente
-- (as 6 linhas DIVERGENTE de price_catalog_rescued/legacy_catalog_import,
-- Itália/Portugal) foi tocado — continuam bloqueadas/segregadas como
-- legado, por não terem um vencedor confirmado.
update public.planner_catalog_feed p
set status_dictionary = case when pc.status_homologacao = 'homologado' and pc.preco_comercial_vigente is not null
                              then 'ATIVO_HOMOLOGADO' else 'ATIVO_SEM_PRECO_HOMOLOGADO' end,
    reconciliation_note = coalesce(p.reconciliation_note || ' | ', '') ||
      'Reclassificado de LEGADO_RECONCILIAR em 2026-09-26 (P17): item confirmado vivo/ativo no catálogo real (' ||
      coalesce(pc.status_produto, 'sem linha em product_catalog — mesmo padrão de CA-CID-DE-001/002/003b') ||
      '), sem divergência de preço encontrada — a pedido explícito da Proprietária ("itens que estão vivos... adicionar a tabela como vivos sem divergência").'
from (values
  ('CA-ASS-001'),('CA-ASS-004'),('CA-ASS-005'),('CA-CID-001'),('CA-CID-002'),('CA-CID-002C'),
  ('CA-CID-009'),('CA-CID-019'),('CA-CID-020'),('CA-CID-021'),('CA-CID-023'),('CA-CID-AT-001'),
  ('CA-COMBO-001'),('CA-HIST-004'),('CA-HIST-006'),('CA-IND-001'),('CA-IND-002'),('CA-IND-005'),
  ('CA-IND-006'),('CA-MEM-003')
) as codes(item_id)
left join public.product_catalog pc on pc.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and pc.code = codes.item_id
where p.item_id = codes.item_id and p.status_dictionary = 'LEGADO_RECONCILIAR';
