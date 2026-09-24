-- Gate de onboarding em case_plans (produto_pai/rota/fase/composição já são
-- canônicos aqui; este passo é sobre o que faltava).
--
-- Decisão da Proprietária, 2026-09-24, em resposta a uma pergunta direta
-- sobre a autorização anterior ("case_plans vira fonte canônica única,
-- onboarding_planos em absorção"): investigação prévia (agente de
-- exploração + leitura direta) mostrou que produto_pai_id/rota_confirmada/
-- fase_jornada/composicao NUNCA estiveram duplicados em onboarding_planos —
-- já eram exclusivos de case_plans, nada a absorver aí. O overlap real
-- estava só em 7 colunas do GATE de onboarding, sem equivalente algum em
-- case_plans: inicio_previsto (a âncora D0 de todo o motor de cadência em
-- cadencia-onboarding.ts/cadencia-d0-d30.ts/cadencia-d31-d365.ts),
-- dossie_mae_status/dossie_mae_referencia, ambiente_autorizado,
-- nivel_acesso, grupo_familiar_status e motivos_bloqueio. Perguntada entre
-- (a) só documentar a separação, (b) agregador de leitura só para telas
-- novas, ou (c) migrar case_plans para cobrir os 6 campos exclusivos e
-- aposentar onboarding_planos de verdade, a Proprietária escolheu (c).
--
-- Esta migration é só o passo 1 (aditivo, sem risco): as 7 colunas nascem
-- NULLABLE em case_plans, mesmos domínios/CHECKs de
-- public.onboarding_planos (ver
-- supabase/migrations/20260820182049_6117e5d9-c6ae-4961-9bac-176ee1f9a0d6.sql).
-- Nenhum dado existente é alterado, nenhuma coluna é removida, SEM
-- backfill aqui — o backfill é uma ferramenta separada, com "ver o que
-- será feito" antes de gravar (mesmo padrão de
-- ressincronizarAnexosDoCaso), porque backfill em massa dentro de uma
-- migration sem uma prévia auditável já causou dado errado neste projeto
-- antes. onboarding_planos continua existindo e sendo a fonte de leitura
-- até o corte que troca os leitores (fechamento-caso.functions.ts,
-- case-service-consolidacao.functions.ts, cadencia-onboarding.ts) — essa
-- troca só acontece depois que o backfill for confirmado.
--
-- Por que estas colunas moram na LINHA de case_plans com
-- fase_jornada = 'onboarding': o gate (dossiê mãe, ambiente autorizado,
-- grupo familiar, motivos de bloqueio) é especificamente sobre a fase de
-- onboarding do caso, não sobre o caso inteiro — a mesma razão pela qual
-- onboarding_planos sempre foi uma tabela à parte, e não colunas soltas em
-- crm_casos.

ALTER TABLE public.case_plans
  ADD COLUMN IF NOT EXISTS inicio_previsto date,
  ADD COLUMN IF NOT EXISTS dossie_mae_status text,
  ADD COLUMN IF NOT EXISTS dossie_mae_referencia text,
  ADD COLUMN IF NOT EXISTS ambiente_autorizado text,
  ADD COLUMN IF NOT EXISTS nivel_acesso text,
  ADD COLUMN IF NOT EXISTS grupo_familiar_status text,
  ADD COLUMN IF NOT EXISTS motivos_bloqueio jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$ BEGIN
  ALTER TABLE public.case_plans
    ADD CONSTRAINT case_plans_dossie_mae_status_chk
    CHECK (dossie_mae_status IS NULL OR dossie_mae_status IN ('nao_iniciado','em_preparacao','validado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.case_plans
    ADD CONSTRAINT case_plans_grupo_familiar_status_chk
    CHECK (grupo_familiar_status IS NULL OR grupo_familiar_status IN ('pendente','planejado','criado','nao_aplicavel'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN public.case_plans.inicio_previsto IS
  'Âncora D0 do onboarding deste caso (mesma semântica de onboarding_planos.inicio_previsto). Alimenta cadencia-onboarding.ts/cadencia-d0-d30.ts/cadencia-d31-d365.ts. NULL = onboarding ainda não começou.';
COMMENT ON COLUMN public.case_plans.dossie_mae_status IS
  'Estado do dossiê-mãe do onboarding (mesmo domínio de onboarding_planos.dossie_mae_status). Migração 2026-09-24, decisão da Proprietária de migrar o gate de onboarding para case_plans.';
COMMENT ON COLUMN public.case_plans.dossie_mae_referencia IS
  'Referência/localização do dossiê-mãe (mesma semântica de onboarding_planos.dossie_mae_referencia).';
COMMENT ON COLUMN public.case_plans.ambiente_autorizado IS
  'Ambiente de trabalho autorizado para este onboarding (mesma semântica de onboarding_planos.ambiente_autorizado).';
COMMENT ON COLUMN public.case_plans.nivel_acesso IS
  'Nível de acesso concedido neste onboarding (mesma semântica de onboarding_planos.nivel_acesso).';
COMMENT ON COLUMN public.case_plans.grupo_familiar_status IS
  'Estado do grupo familiar para fins de onboarding (mesmo domínio de onboarding_planos.grupo_familiar_status).';
COMMENT ON COLUMN public.case_plans.motivos_bloqueio IS
  'Lista de motivos de bloqueio do gate de onboarding (mesma semântica de onboarding_planos.motivos_bloqueio), ligada aos gates contrato_assinado/pagamento_confirmado.';
