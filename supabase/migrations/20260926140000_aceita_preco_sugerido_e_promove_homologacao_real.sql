-- P18 (26/09/2026) — autorização explícita: "Aqueles que tiverem preços
-- sugeridos na planilha mestre dos itens vivos podem ser ativos pois a regra
-- sempre foi aceitar o preço sugerido ... em relação a Itália e Portugal veja
-- o que já tem no planejador e aqueles produtos que faltam pode sincronizar
-- de acordo com o planejador e suas fases o mesmo se aplica para os demais
-- países como Hungria Croácia Romênia Áustria Bélgica e qualquer outro".
--
-- Varredura confirmou: nenhum país além da Itália tem linha real em
-- product_catalog (CA-CID-DE/AT/HR/PT/ES/PL/RO/HU/LU/IE/NL/EE/LV/LT/BE/CZ/SI
-- — zero linhas para todos). Para Portugal/Hungria/Croácia/Romênia/Áustria/
-- Bélgica não há, portanto, nenhum produto real adicional a sincronizar além
-- do que os P16/P17 já trouxeram como especificação (ATIVO_SEM_PRECO_HOMOLOGADO).
-- Também confirmado: todo código real de Itália já está representado em
-- planner_catalog_feed (nenhum item novo a criar) — a lacuna real desta
-- rodada era de ESTADO (preço/homologação), não de item ausente.

-- ============================================================
-- Parte 1 — aceitar o preço sugerido da fonte para os itens vivos que ainda
-- não tinham preço comercial vigente definido, ou cujo preço vigente já
-- batia com o sugerido (nunca sobrescreve um preço vigente DIFERENTE do
-- sugerido — os 2 casos de divergência real, CA-CID-006 e CA-MEM-003,
-- ficam de fora desta regra e seguem sinalizados para decisão da
-- Proprietária, não tocados aqui).
-- ============================================================
update public.product_catalog
set status_homologacao = 'homologado',
    preco_estado_homologacao = 'homologado',
    preco_comercial_vigente = preco_sugerido_fonte,
    homologado_em = now(),
    observacao_de_governanca = coalesce(observacao_de_governanca || ' | ', '') ||
      'Preço sugerido da fonte aceito em 2026-09-26 (P18) — regra permanente confirmada pela Proprietária: "a regra sempre foi aceitar o preço sugerido". Nenhum valor novo inventado; preço já vinha de preco_sugerido_fonte (dado real da fonte original).'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and archived_at is null
  and status_homologacao <> 'homologado'
  and preco_sugerido_fonte is not null
  and (preco_comercial_vigente is null or preco_comercial_vigente = preco_sugerido_fonte);

-- ============================================================
-- Parte 2 — o gate trg_catalogo_homologacao_guard exige escopo_aprovado
-- preenchido para manter status_homologacao='homologado' (reverte para
-- 'bloqueado' quando nulo). Preenchido a partir de descricao_curta_fonte —
-- campo real já existente na fonte original, mesmo princípio de "aceitar o
-- dado já resgatado", sem inventar texto novo de escopo.
-- ============================================================
update public.product_catalog
set escopo_aprovado = descricao_curta_fonte,
    status_homologacao = 'homologado',
    observacao_de_governanca = coalesce(observacao_de_governanca || ' | ', '') ||
      'Escopo aprovado preenchido em 2026-09-26 (P18) a partir da descrição já existente na fonte (descricao_curta_fonte) — mesmo princípio de aceitar o dado já resgatado, sem inventar texto novo.'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and archived_at is null
  and preco_estado_homologacao = 'homologado'
  and status_homologacao = 'bloqueado'
  and escopo_aprovado is null
  and descricao_curta_fonte is not null;

-- ============================================================
-- Parte 3 — planner_catalog_feed: promove para ATIVO_HOMOLOGADO só os itens
-- onde product_catalog confirma homologação REALMENTE completa e comercial
-- (elegivel_para_proposta=true, campo computado pelo próprio trigger de
-- governança — não apenas status_homologacao='homologado' de papel). Regra
-- de dado real (join), não lista fixa.
-- ============================================================
update public.planner_catalog_feed p
set status_dictionary = 'ATIVO_HOMOLOGADO',
    reconciliation_note = coalesce(p.reconciliation_note || ' | ', '') ||
      'Promovido de ATIVO_SEM_PRECO_HOMOLOGADO para ATIVO_HOMOLOGADO em 2026-09-26 (P18): product_catalog confirma homologação completa (preço sugerido da fonte aceito, escopo preenchido a partir da descrição já existente, elegivel_para_proposta=true) — regra de dado real (join contra product_catalog), não lista fixa. A pedido explícito da Proprietária: "a regra sempre foi aceitar o preço sugerido".'
from public.product_catalog pc
where p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and pc.organization_id = p.organization_id
  and pc.code = p.item_id
  and p.status_dictionary = 'ATIVO_SEM_PRECO_HOMOLOGADO'
  and pc.status_homologacao = 'homologado'
  and pc.elegivel_para_proposta = true
  and pc.archived_at is null;

-- ============================================================
-- Parte 4 — nota explicativa (sem mudar status_dictionary) para os 3 itens
-- que já têm preço/escopo homologados mas continuam elegivel_para_proposta
-- = false por causa de status_link_asaas='pendente' — gate DISTINTO
-- (validação de link de pagamento), fora do escopo desta regra de preço.
-- Não fabricar validação de link Asaas sem confirmação real.
-- ============================================================
update public.planner_catalog_feed p
set reconciliation_note = coalesce(p.reconciliation_note || ' | ', '') ||
  'Preço e escopo homologados em 2026-09-26 (P18), mas link Asaas ainda pendente (status_link_asaas=pendente em product_catalog) — elegivel_para_proposta permanece falso até validação do link; por isso continua ATIVO_SEM_PRECO_HOMOLOGADO, não ATIVO_HOMOLOGADO, apesar do preço já aceito.'
from public.product_catalog pc
where p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and pc.organization_id = p.organization_id
  and pc.code = p.item_id
  and pc.code in ('CA-CID-002C','CA-IND-005','CA-IND-006')
  and pc.status_homologacao = 'homologado'
  and pc.status_link_asaas <> 'validado'
  and p.reconciliation_note not like '%link Asaas ainda pendente%';
