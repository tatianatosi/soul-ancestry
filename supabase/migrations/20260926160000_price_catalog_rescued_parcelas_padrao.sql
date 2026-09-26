-- P20 (26/09/2026) — a Proprietária colou de novo o "Prompt Canônico —
-- Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados"
-- (variante datada de 2026-09-04), pedindo revisão e execução da fórmula de
-- cálculo (referencia_da_trilha / condicao_do_caso / caso_multipais) e da
-- tabela de honorários/despesas/taxas/parcelas por país.
--
-- Verificação item a item contra o banco real confirmou: price_catalog_rescued
-- já existe com exatamente o schema e os 6 estados descritos (P13,
-- 2026-09-25), e os valores de honorários/despesas/taxas para todos os 10
-- países já batem exatamente com os números agora colados — não é dado novo,
-- é o mesmo prompt canônico já executado antes. O único componente
-- genuinamente ausente era "parcelas" (contagem de parcelas por país/
-- processo) — price_component já previa 'parcelas_padrao' no CHECK desde a
-- criação da tabela, mas nenhuma linha usava esse valor.

insert into public.price_catalog_rescued
  (organization_id, country_code, price_component, amount, currency, source_type, source_reference, price_status, case_only, notes)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', v.country_code, 'parcelas_padrao', v.parcelas, 'BRL',
       'planejador_universal_historico',
       'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados v2.1',
       'REFERENCIA_RESGATADA', false,
       'Número padrão de parcelas do processo (referência resgatada, não regra de cobrança automática).'
from (values
  ('IT', 6), ('HR', 4), ('PT', 10), ('ES', 5), ('DE', 6),
  ('PL', 6), ('RO', 6), ('AT', 10), ('BR', 3), ('FR', 3)
) as v(country_code, parcelas)
where not exists (
  select 1 from public.price_catalog_rescued p
  where p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
    and p.country_code = v.country_code
    and p.price_component = 'parcelas_padrao'
    and p.archived_at is null
);
