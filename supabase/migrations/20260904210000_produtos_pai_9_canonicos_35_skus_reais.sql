-- Aplica os 9 produtos-pai canônicos (PP-01 a PP-09, decisão da Proprietária confirmada
-- em 04/09 — docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md,
-- seção 1/1.1) contra os 35 SKUs reais ativos hoje em product_catalog, dentro de
-- planner_catalog_feed (a lista-alimento aditiva — não toca product_catalog, nenhum
-- SKU real é desativado, reclassificado ou tem preço alterado).
--
-- Fonte do de-para: Motor Planejador Canônico, seção 2 ("Cruzamento contra os 35 SKUs
-- reais ativos hoje"), quatro sínteses independentes convergindo nos mesmos 9 nomes.
--
-- O que este arquivo NÃO decide:
-- - CA-CID-021 fica sem produto_parent: é o único caso em que as quatro rodadas
--   documentais concordam em NÃO conseguir decidir entre PP-02 e PP-07 (combo) —
--   forçar uma escolha aqui contradiria o próprio achado. Fica null, sinalizado.
-- - CA-COMBO-001, CA-FAM-002, CA-IND-*, CA-MEM-*, CA-WPP-002: nenhum documento recebido
--   até hoje os cita nominalmente em nenhuma das três taxonomias de produto-pai. O
--   mapeamento abaixo é por analogia de família comercial (mesmo raciocínio que o
--   próprio Motor Planejador usa na seção 2 para CA-HIST-*/CA-IND-*/CA-MEM-*) —
--   marcado explicitamente como analogia, não citação literal, em reconciliation_note.

-- ============ 1. Normaliza product_parent dos itens já existentes na lista-alimento
--                 para o nome canônico exato dos 9 produtos-pai (PP-01 a PP-09) ============
update public.planner_catalog_feed
set product_parent = 'Diagnóstico de Cidadania por Etapas'
where item_id in ('CA-CID-001', 'CA-CID-DE-001', 'CA-CID-AT-001',
                   'CA-CID-HR-001', 'CA-CID-PT-001', 'CA-CID-ES-001', 'CA-CID-PL-001',
                   'CA-CID-RO-001', 'CA-CID-LU-001', 'CA-CID-HU-001', 'CA-CID-IE-001',
                   'CA-NAT-BR-001', 'CA-NAT-FR-001')
  and product_parent is distinct from 'Diagnóstico de Cidadania por Etapas';

update public.planner_catalog_feed
set product_parent = 'Preparação de Prova e Pasta Documental'
where item_id in ('CA-CID-002D', 'CA-CID-002A', 'CA-CID-002B', 'CA-CID-DE-002',
                   'CA-CID-HR-002', 'CA-CID-PT-002', 'CA-CID-ES-002', 'CA-CID-PL-002',
                   'CA-CID-RO-002', 'CA-CID-AT-002', 'CA-CID-LU-002', 'CA-CID-HU-002',
                   'CA-CID-IE-002', 'CA-NAT-BR-002', 'CA-NAT-FR-002')
  and product_parent is distinct from 'Preparação de Prova e Pasta Documental';

update public.planner_catalog_feed
set product_parent = 'Acompanhamento Familiar de Nacionalidade'
where item_id in ('CA-CID-023', 'CA-CID-025', 'CA-CID-DE-003b',
                   'CA-CID-HR-003', 'CA-CID-PT-003', 'CA-CID-ES-003', 'CA-CID-PL-003',
                   'CA-CID-RO-003', 'CA-CID-AT-003', 'CA-CID-LU-003', 'CA-CID-HU-003',
                   'CA-CID-IE-003')
  and product_parent is distinct from 'Acompanhamento Familiar de Nacionalidade';

update public.planner_catalog_feed
set product_parent = 'Regularização e Vida Civil Pós-Reconhecimento'
where item_id in ('CA-CID-003', 'CA-CID-006', 'CA-CID-016', 'CA-CID-018')
  and product_parent is distinct from 'Regularização e Vida Civil Pós-Reconhecimento';

update public.planner_catalog_feed
set product_parent = 'História de Família, Memória e Legado'
where item_id in ('CA-HIST-001', 'CA-HIST-005', 'CA-HIST-002', 'CA-MEM-004', 'CA-MEM-008')
  and product_parent is distinct from 'História de Família, Memória e Legado';

update public.planner_catalog_feed
set product_parent = 'Continuidade e Acervo Familiar'
where item_id in ('CA-ASS-002', 'CA-ASS-003', 'CA-WPP-001', 'CA-WPP-002')
  and product_parent is distinct from 'Continuidade e Acervo Familiar';

-- CA-FAM-002 havia sido classificado (rodada anterior) como "Acompanhamento Familiar de
-- Nacionalidade"/F4 por leitura literal do nome. Revisado: "Familiar Conectado Plus" é
-- produto de continuidade/relacionamento, mesma família de CA-WPP-*/CA-ASS-* — corrigido
-- para Continuidade e Acervo Familiar/F7, por analogia (não citação literal em nenhum doc).
update public.planner_catalog_feed
set product_parent = 'Continuidade e Acervo Familiar',
    journey_phase_default = 'F7',
    reconciliation_note = 'Corrigido em 04/09: reclassificado de Acompanhamento (F4) para '
      || 'Continuidade e Acervo Familiar (F7) — mesma família comercial de CA-WPP-*/CA-ASS-*. '
      || 'Mapeamento por analogia; nenhum dos documentos de produto-pai recebidos até hoje cita '
      || 'CA-FAM-002 nominalmente.'
where item_id = 'CA-FAM-002';

-- ============ 2. Insere os 17 SKUs reais ativos que ainda não estavam na lista-alimento ============
insert into public.planner_catalog_feed
  (organization_id, item_id, prefix, name, status_dictionary, product_parent, journey_phase_default,
   country_scope, source_artifact, source_version, reconciliation_note)
select o.id, v.item_id, v.prefix, v.name, v.status_dictionary, v.product_parent, v.journey_phase_default,
  array[]::text[], 'Motor Planejador Canônico — reconciliação PP-01 a PP-09 contra os 35 SKUs reais',
  '1.2 (seção 2)', v.reconciliation_note
from public.organizations o
cross join (values
  -- PP-04 — Preparação de Prova e Pasta Documental
  ('CA-CID-002', 'CA-CID', 'Montagem Completa de Pasta para Cidadania', 'LEGADO_RECONCILIAR',
    'Preparação de Prova e Pasta Documental', 'F2',
    'Item real ativo; código-base de 002A-D. Citado na seção 2 do Motor Planejador.'),
  ('CA-CID-002C', 'CA-CID', 'Pasta — variante C', 'LEGADO_RECONCILIAR',
    'Preparação de Prova e Pasta Documental', 'F2',
    'Item real ativo; o próprio documento-fonte não decide entre PP-03/PP-05 na taxonomia '
    || 'PP-01-14, mas converge em PP-04 na reconciliação dos 9 — seguindo esta última, por '
    || 'instrução explícita da Proprietária.'),
  -- PP-07 — Regularização e Vida Civil Pós-Reconhecimento
  ('CA-CID-009', 'CA-CID', 'Registro de 1º Filho', 'LEGADO_RECONCILIAR',
    'Regularização e Vida Civil Pós-Reconhecimento', 'F5', 'Item real ativo; consistente na seção 2.'),
  ('CA-CID-019', 'CA-CID', 'Declaração de Valor', 'LEGADO_RECONCILIAR',
    'Regularização e Vida Civil Pós-Reconhecimento', 'F5', 'Item real ativo; consistente na seção 2.'),
  ('CA-CID-020', 'CA-CID', 'Consultoria e Declaração de Valor', 'LEGADO_RECONCILIAR',
    'Regularização e Vida Civil Pós-Reconhecimento', 'F5', 'Item real ativo; consistente na seção 2.'),
  -- Sem produto-pai — ambiguidade real, documentada 3x, não resolvida aqui
  ('CA-CID-021', 'CA-CID', 'Combo Starter Cidadania', 'LEGADO_RECONCILIAR', null, null,
    'Item real ativo. Único caso em que P01-09, PP-01-08 e PP-01-14 concordam em não '
    || 'conseguir decidir entre PP-02/PP-07 (combo) — deixado sem produto-pai de propósito.'),
  -- PP-09 — Continuidade e Acervo Familiar
  ('CA-ASS-001', 'CA-ASS', 'Plano Essência', 'LEGADO_RECONCILIAR',
    'Continuidade e Acervo Familiar', 'F7', 'Item real ativo; por herança de v1.0/v1.2 (não repetido '
    || 'na Revisão Canônica final, mas nunca contestado).'),
  ('CA-ASS-004', 'CA-ASS', 'Assinatura Cidadão Pós-Reconhecimento', 'LEGADO_RECONCILIAR',
    'Continuidade e Acervo Familiar', 'F7', 'Item real ativo; mesma herança de CA-ASS-001.'),
  ('CA-ASS-005', 'CA-ASS', 'Plano Anual com Desconto — Memórias', 'LEGADO_RECONCILIAR',
    'Continuidade e Acervo Familiar', 'F7', 'Item real ativo; mesma herança de CA-ASS-001.'),
  -- PP-08 — História de Família, Memória e Legado (inclui os gaps por analogia)
  ('CA-HIST-004', 'CA-HIST', 'Pacote Família Completa — 3 Sobrenomes', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F2', 'Item real ativo; consistente na seção 2.'),
  ('CA-HIST-006', 'CA-HIST', 'Combo Pesquisa + Diagnóstico de Cidadania Italiana', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F1', 'Item real ativo; combo pesquisa/diagnóstico, '
    || 'citado na família CA-HIST na seção 2.'),
  ('CA-IND-001', 'CA-IND', 'Autobiografia Guiada — Pacote Express', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F6', 'Item real ativo. Gap confirmado na seção 2: '
    || 'nenhum documento de produto-pai o cita nominalmente; mapeamento por analogia de família '
    || '(mesmo grupo comercial de CA-HIST-*/CA-MEM-*).'),
  ('CA-IND-002', 'CA-IND', 'Legado em Vídeo — Mini-Série de Depoimentos', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F6', 'Item real ativo. Mesmo gap e mesma analogia de CA-IND-001.'),
  ('CA-IND-005', 'CA-IND', 'Livro Biográfico Completo — Premium', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F6', 'Item real ativo. Mesmo gap e mesma analogia de CA-IND-001.'),
  ('CA-IND-006', 'CA-IND', 'Memória Empresarial — História da Empresa', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F6', 'Item real ativo. Mesmo gap e mesma analogia de CA-IND-001.'),
  ('CA-MEM-003', 'CA-MEM', 'Entrevista Guiada com Idoso', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F6', 'Item real ativo. Mesmo gap e mesma analogia de CA-IND-001 '
    || '(o Motor Planejador cita CA-MEM-* como ambíguo entre PP-08/PP-09; optei por PP-08 — '
    || 'entrega de artefato, não plano recorrente — mesmo critério de CA-MEM-004/008 já '
    || 'mapeados nominalmente na seção 2).'),
  -- Continuidade — gap por analogia (comunicação/relacionamento contínuo, não entrega única)
  ('CA-COMBO-001', 'CA-COMBO', 'Combo Vó (Restauração + Entrevista + Diário)', 'LEGADO_RECONCILIAR',
    'História de Família, Memória e Legado', 'F6', 'Item real ativo. Gap confirmado na seção 2: nenhum '
    || 'documento o cita. Mapeado por analogia — combo de entregas de memória/legado, mesmo grupo de CA-HIST-*.')
) as v(item_id, prefix, name, status_dictionary, product_parent, journey_phase_default, reconciliation_note)
where o.archived_at is null and o.demo = false
  and not exists (select 1 from public.planner_catalog_feed x where x.organization_id = o.id and x.item_id = v.item_id);
