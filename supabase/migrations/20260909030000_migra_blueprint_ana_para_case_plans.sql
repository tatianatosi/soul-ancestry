-- Decisão 3 (CA-DECISÕES-DA-PROPRIETÁRIA-E-LIMPEZA-PRÉ-UXUI, 09/09/2026).
--
-- Migra o ÚNICO caso classificado COMPATIVEL_PARA_MIGRAR no dry-run
-- (blueprint_parameters -> case_plans): CA-CID-AT-FAM-2026-001 (Ana),
-- blueprint_parameters.id = 103c50e0-f3b8-43d5-b812-8dccba1a9c59.
--
-- Regras seguidas (docs/relatorios/2026-09-09_decisoes_proprietaria_limpeza_pre_uxui_execucao.md):
-- 1. Só este caso, só se continuar sem conflito (WHERE NOT EXISTS abaixo).
-- 2. Não sobrescreve nada: é um INSERT, não havia linha em case_plans para
--    este caso (confirmado no dry-run revalidado).
-- 3. Só campos com equivalência explícita são copiados: entregas_previstas
--    (jsonb) -> entregas (text[]). Campos exclusivos de case_plans (fase,
--    status, marcos, checklist etc.) ficam no valor padrão da própria
--    tabela — não são inferidos a partir do blueprint, que não os declara.
-- 4. Origem, data e execução ficam registradas em observacao_interna (campo
--    já existente — nenhuma coluna nova foi criada para isto).
-- 5. blueprint_parameters não é tocado: permanece como legado de leitura.
-- 6. Nenhuma migração de schema: usa só as colunas já existentes de
--    case_plans.
insert into public.case_plans (
  organization_id, case_id, family_id, case_service_id, product_catalog_id,
  entregas, dados_teste, observacao_interna, created_by, updated_by
)
select
  bp.organization_id,
  bp.case_id,
  bp.family_id,
  bp.case_service_id,
  bp.product_catalog_id,
  coalesce(
    (select array_agg(x) from jsonb_array_elements_text(bp.entregas_previstas) as x),
    '{}'
  ),
  false,
  concat(
    'Migrado de blueprint_parameters ', bp.id::text, ' em ', now()::text, '. ',
    'Execução: CA-DECISÕES-DA-PROPRIETÁRIA-E-LIMPEZA-PRÉ-UXUI-2026-09-09, Decisão 3 ',
    '(dry-run revalidado: 0 conflitos, único caso somente-blueprint). ',
    'fase_jornada, status e status_saude ficaram no padrão da tabela — ',
    'blueprint_parameters não declara equivalente e nada foi inferido. ',
    'Critérios de aceite do blueprint (sem coluna equivalente em case_plans, preservados aqui em texto): ',
    coalesce((select string_agg(x, ' · ') from jsonb_array_elements_text(bp.criterios_aceite) as x), 'nenhum'),
    '. blueprint_parameters preservado como legado de leitura, sem alteração.'
  ),
  '1540b457-47c3-4365-b31d-e6ff8764fae5', -- tati@pluggedresearch.com, Proprietária, autorizou esta migração
  '1540b457-47c3-4365-b31d-e6ff8764fae5'
from public.blueprint_parameters bp
where bp.id = '103c50e0-f3b8-43d5-b812-8dccba1a9c59'
  and not exists (
    select 1 from public.case_plans cp
    where cp.case_id = bp.case_id and cp.archived_at is null
  );
