-- P16 (26/09/2026) — autorização explícita da Proprietária: "verifique quais
-- estão pendentes se for as que estão e foram enviadas agora pode já sair do
-- estado que estão pois serão usadas ... e o mesmo equivale para cada país
-- báltico não trazido para o planejador e produtos pai".
--
-- Parte 1 — promove os 36 itens `ESPECIFICACAO_PENDENTE` de
-- `planner_catalog_feed` (os 30 códigos CA-CID-XX-00N/CA-NAT-XX-00N + os 6
-- CA-GEN-MULTI, todos criados em P9/P13) para `ATIVO_SEM_PRECO_HOMOLOGADO` —
-- mesmo estado já usado para os itens reais da Alemanha (CA-CID-DE-001/002/
-- 003b) e CA-HIST-001/005: usável no motor de orquestração, sem fabricar
-- preço homologado (nenhum valor comercial é definido aqui — continua
-- pendente de decisão comercial).
update public.planner_catalog_feed
set status_dictionary = 'ATIVO_SEM_PRECO_HOMOLOGADO',
    reconciliation_note = coalesce(reconciliation_note || ' | ', '') || 'Promovido de ESPECIFICACAO_PENDENTE em 2026-09-26 (P16) — item confirmado para uso no motor pela Proprietária; preço segue sem homologação até decisão comercial.'
where status_dictionary = 'ESPECIFICACAO_PENDENTE';

-- Parte 2 — traz os 4 países bálticos/Países Baixos (NL/EE/LV/LT, tier
-- legal_research_pilot do documento-fonte, tracks já criados e dedup'ados no
-- P12) para `planner_catalog_feed`/produtos-pai, mesmo padrão de 3 itens por
-- país (Diagnóstico F1, Pesquisa/prova F2, Acompanhamento F4) já usado para
-- Croácia/Portugal/Espanha/Polônia/Romênia/Hungria/Irlanda/Luxemburgo.
-- Bélgica continua fora (detection_only, decisão do P12, não revista aqui).
insert into public.planner_catalog_feed
  (organization_id, item_id, prefix, name, status_dictionary, product_parent, journey_phase_default, country_scope, requires_case_gate, source_artifact, source_version, reconciliation_note)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', v.item_id, 'CA-CID', v.name, 'ATIVO_SEM_PRECO_HOMOLOGADO', v.product_parent, v.fase, array[v.pais], true,
       'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados', 'v2.1',
       'Sem item homologado hoje; não estimar preço | País trazido do dedup/expansão jurídica (P12, 2026-09-25 — legal_research_pilot) para o planejador/produtos-pai em 2026-09-26 (P16), a pedido explícito da Proprietária.'
from (values
  ('CA-CID-NL-001', 'Diagnóstico — Países Baixos', 'Diagnóstico de Cidadania por Etapas', 'F1', 'NL'),
  ('CA-CID-NL-002', 'Pesquisa/prova — Países Baixos', 'Preparação de Prova e Pasta Documental', 'F2', 'NL'),
  ('CA-CID-NL-003', 'Acompanhamento — Países Baixos', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'NL'),
  ('CA-CID-EE-001', 'Diagnóstico — Estônia', 'Diagnóstico de Cidadania por Etapas', 'F1', 'EE'),
  ('CA-CID-EE-002', 'Pesquisa/prova — Estônia', 'Preparação de Prova e Pasta Documental', 'F2', 'EE'),
  ('CA-CID-EE-003', 'Acompanhamento — Estônia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'EE'),
  ('CA-CID-LV-001', 'Diagnóstico — Letônia', 'Diagnóstico de Cidadania por Etapas', 'F1', 'LV'),
  ('CA-CID-LV-002', 'Pesquisa/prova — Letônia', 'Preparação de Prova e Pasta Documental', 'F2', 'LV'),
  ('CA-CID-LV-003', 'Acompanhamento — Letônia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'LV'),
  ('CA-CID-LT-001', 'Diagnóstico — Lituânia', 'Diagnóstico de Cidadania por Etapas', 'F1', 'LT'),
  ('CA-CID-LT-002', 'Pesquisa/prova — Lituânia', 'Preparação de Prova e Pasta Documental', 'F2', 'LT'),
  ('CA-CID-LT-003', 'Acompanhamento — Lituânia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'LT')
) as v(item_id, name, product_parent, fase, pais)
where not exists (select 1 from public.planner_catalog_feed p where p.item_id = v.item_id);
