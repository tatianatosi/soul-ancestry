-- Preserva os identificadores legados PACOTE-*/NAT-BR-01 como alias em
-- `planner_catalog_feed.legacy_aliases` (P13, 25/09/2026).
--
-- Achado: o "Prompt Canônico — Preços Resgatados" (v2.1/variantes, já
-- executado nesta base — todos os 9 produtos-pai, os 30 itens
-- ESPECIFICACAO_PENDENTE por país, os 6 CA-GEN-MULTI e todo o
-- price_catalog_rescued já existiam antes desta migration, conferido por
-- leitura direta) tinha uma regra nunca cumprida: "Preservar identificadores
-- antigos como alias legado; não criar novos identificadores com esse
-- padrão." A coluna `legacy_aliases` existe desde a criação da tabela mas
-- está vazia em 100% das linhas.
--
-- Mapeamento de código legado → item vigente, sourced de
-- docs/evolucao/recuperados/fontes-primarias/01_CATALOGO_E_SKUS/DICIONARIO_DE_SKUS.csv
-- (linha 14, regra de migração explícita: "Se aprovados: renomear para
-- CA-CID-[SIGLA_PAIS]-NNN (ex.: CA-CID-HR-001)" — exemplo literal do próprio
-- dicionário para PACOTE-CROACIA-01) e linha 15 (NAT-BR-01 →
-- "CA-CID-NNN ou novo prefixo CA-NAT-NNN"; o prefixo CA-NAT já foi o
-- efetivamente adotado). PACOTE-FR-01 mapeia para CA-NAT-FR-001 pelo mesmo
-- prefixo CA-NAT já em uso para naturalização.
--
-- PACOTE-EU-01 ("Europa geral") NÃO recebe alias de item: já está corretamente
-- modelado em `price_catalog_rescued` com `item_id = null` e nota própria
-- ("não é produto de processo final — usar só como referência legada de
-- triagem") — mantém-se assim, não força vínculo a produto que não existe.
-- PACOTE-AT-* nunca existiu (Áustria já nasceu com CA-CID-AT-001 real, sem
-- origem em PACOTE-*) — nenhum alias a atribuir.
update public.planner_catalog_feed
set legacy_aliases = array[v.alias]
from (values
  ('CA-CID-HR-001', 'PACOTE-CROACIA-01'),
  ('CA-CID-PT-001', 'PACOTE-PT-01'),
  ('CA-CID-ES-001', 'PACOTE-ES-01'),
  ('CA-CID-DE-001', 'PACOTE-DE-01'),
  ('CA-CID-PL-001', 'PACOTE-PL-01'),
  ('CA-CID-RO-001', 'PACOTE-RO-01'),
  ('CA-NAT-FR-001', 'PACOTE-FR-01'),
  ('CA-NAT-BR-001', 'NAT-BR-01')
) as v(item_id, alias)
where planner_catalog_feed.item_id = v.item_id
  and not (coalesce(planner_catalog_feed.legacy_aliases, array[]::text[]) @> array[v.alias]);
