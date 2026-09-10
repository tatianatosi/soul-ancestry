-- Prompt Canônico v2.1 (04/09) — seção "Divergências que devem ser
-- bloqueadas e registradas": Itália (R$4.500/4.700/4.800) e Portugal
-- (R$3.800/4.400/4.800) têm mais de uma referência incompatível e devem
-- ficar DIVERGENTE até validação da proprietária.
--
-- A execução original do prompt (migration
-- 20260904222833_planner_catalog_feed_price_catalog_rescued, ver também
-- docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md
-- seção 11) semeou os 52 valores REFERENCIA_RESGATADA/
-- PENDENTE_DE_HOMOLOGACAO/CONDICAO_PARTICULAR_DE_CASO corretamente
-- (conferido linha a linha contra o prompt reenviado em 08-09/09: bate
-- 100%), mas não chegou a inserir as linhas DIVERGENTE — a única lacuna
-- real entre o que o prompt pede e o que já estava no banco.
--
-- price_component segue a mesma convenção já usada nas linhas de item/pacote
-- existentes (ex.: IT/honorarios=4700, AT/honorarios=4800 para CA-CID-AT-001):
-- valor total do item/pacote entra como 'honorarios', não um componente novo
-- (a tabela não permite 'item_total').
insert into public.price_catalog_rescued
  (organization_id, country_code, price_component, amount, source_type, source_reference, price_status, notes)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', v.pais, 'honorarios', v.valor,
  'planejador_universal', 'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados v2.1',
  'DIVERGENTE', 'Mais de uma referência incompatível localizada; bloqueado para exibição/cobrança até validação país a país pela proprietária.'
from (values ('IT',4500),('IT',4700),('IT',4800),('PT',3800),('PT',4400),('PT',4800)) as v(pais, valor)
where not exists (
  select 1 from public.price_catalog_rescued p
  where p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
    and p.price_status = 'DIVERGENTE'
    and p.amount = v.valor
    and p.country_code = v.pais
);
