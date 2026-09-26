-- P19 (26/09/2026) — decisão explícita da Proprietária sobre as 2 divergências
-- de preço deixadas em aberto pelo P18 ("Ca Cid 006 vira 249 e cá mem vira
-- 197") + confirmação de que CA-CID-002A/B/C/D são itens da Itália
-- ("os códigos cá Cid 002 a B c d fazem parte da Itália").

-- ============================================================
-- Parte 1 — CA-CID-006 (280,00 → 249,00) e CA-MEM-003 (297,00 → 197,00):
-- valor confirmado pela Proprietária como o preço sugerido da fonte.
-- Também fecha homologação (mesmo padrão do P18): escopo a partir de
-- descricao_curta_fonte quando ainda vazio, nunca texto novo.
-- ============================================================
update public.product_catalog
set preco_comercial_vigente = preco_sugerido_fonte,
    preco_estado_homologacao = 'homologado',
    status_homologacao = 'homologado',
    escopo_aprovado = coalesce(escopo_aprovado, descricao_curta_fonte),
    homologado_em = now(),
    observacao_de_governanca = coalesce(observacao_de_governanca || ' | ', '') ||
      'Preço divergente resolvido em 2026-09-26 (P19) por decisão explícita da Proprietária: valor correto confirmado como o preço sugerido da fonte (249,00 para CA-CID-006; 197,00 para CA-MEM-003), substituindo o preço vigente anterior (280,00 / 297,00).'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and archived_at is null
  and code in ('CA-CID-006', 'CA-MEM-003')
  and preco_comercial_vigente <> preco_sugerido_fonte;

-- ============================================================
-- Parte 2 — reaplica a promoção data-driven do P18 (idempotente): agora que
-- CA-MEM-003 está homologado com elegivel_para_proposta=true, é promovido de
-- ATIVO_SEM_PRECO_HOMOLOGADO para ATIVO_HOMOLOGADO pela mesma regra de dado
-- real (nenhuma lista fixa nova).
-- ============================================================
update public.planner_catalog_feed p
set status_dictionary = 'ATIVO_HOMOLOGADO',
    reconciliation_note = coalesce(p.reconciliation_note || ' | ', '') ||
      'Promovido de ATIVO_SEM_PRECO_HOMOLOGADO para ATIVO_HOMOLOGADO em 2026-09-26 (P19): divergência de preço resolvida por decisão explícita da Proprietária, product_catalog agora confirma homologação completa (elegivel_para_proposta=true).'
from public.product_catalog pc
where p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and pc.organization_id = p.organization_id
  and pc.code = p.item_id
  and p.status_dictionary = 'ATIVO_SEM_PRECO_HOMOLOGADO'
  and pc.status_homologacao = 'homologado'
  and pc.elegivel_para_proposta = true
  and pc.archived_at is null;

-- ============================================================
-- Parte 3 — CA-CID-006 continua CONDICIONAL_POR_CASO (eixo de aplicabilidade
-- por trilha, distinto de prontidão de preço) — só registra a resolução do
-- preço na nota, sem mudar o status_dictionary.
-- ============================================================
update public.planner_catalog_feed
set reconciliation_note = coalesce(reconciliation_note || ' | ', '') ||
  'Divergência de preço resolvida em 2026-09-26 (P19) por decisão explícita da Proprietária: 249,00 confirmado como valor correto (era 280,00). Continua CONDICIONAL_POR_CASO — eixo de aplicabilidade por trilha, não de prontidão de preço.'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and item_id = 'CA-CID-006'
  and reconciliation_note not like '%Divergência de preço resolvida em 2026-09-26 (P19)%';

-- ============================================================
-- Parte 4 — CA-CID-002/002A/002B/002C/002D confirmados pela Proprietária
-- como itens da Itália; country_scope estava vazio (item pré-existente à
-- convenção de country_scope introduzida para os países adicionados depois
-- do P12). Fase (journey_phase_default='F2') já estava correta — não
-- alterada.
-- ============================================================
update public.planner_catalog_feed
set country_scope = array['IT'],
    reconciliation_note = coalesce(reconciliation_note || ' | ', '') ||
      'country_scope preenchido como Itália (IT) em 2026-09-26 (P19), a pedido explícito da Proprietária — estava vazio (item pré-existente à convenção de country_scope introduzida para os países adicionados depois).'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and item_id in ('CA-CID-002', 'CA-CID-002A', 'CA-CID-002B', 'CA-CID-002C', 'CA-CID-002D')
  and country_scope = '{}';
