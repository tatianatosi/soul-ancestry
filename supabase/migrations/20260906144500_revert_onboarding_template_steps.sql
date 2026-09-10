-- Reverte 20260906143000_onboarding_template_steps.sql (commit f9cef0b,
-- revertido em seguida no mesmo dia). A tabela duplicava o motor de
-- onboarding que já existia — CHECKLIST_ONBOARDING_PADRAO e
-- criarChecklistOnboarding() em src/lib/onboarding-jornada.ts/.functions.ts —
-- que não tinha sido encontrado antes de construir isto. Nenhum caso real
-- chegou a usar esta tabela: criada e revertida na mesma sessão, sem nenhuma
-- escrita real em onboarding_checklist originada dela.

drop table if exists public.onboarding_template_steps;
