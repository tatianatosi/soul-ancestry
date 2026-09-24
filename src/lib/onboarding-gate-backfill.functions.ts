import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { AVISO_PRE_MIGRATION_GATE, colunaAusenteNoBanco } from "@/lib/gate-onboarding-case-plans";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Backfill do gate de onboarding para case_plans (decisão da Proprietária,
 * 2026-09-24: migrar case_plans para cobrir os campos exclusivos de
 * onboarding_planos). Só espelha `motivos_bloqueio` — o único campo que os
 * escritores reais gravam hoje; os outros 5 (inicio_previsto, dossiê,
 * ambiente, nível, grupo familiar) nunca são escritos por código nenhum
 * nesta base, então não há dado real para copiar.
 *
 * Não cria linha de case_plans: essa tabela é de outros motores (P3, ver
 * motores-tabelas.ts), e este backfill nunca inventa uma linha nova só para
 * caber o gate de onboarding. Casos sem linha de case_plans com
 * fase_jornada = 'onboarding' ficam listados como "sem alvo" — pendência
 * visível, não erro silencioso.
 *
 * Mesmo padrão de `ressincronizarAnexosDoCaso`: mostra o plano primeiro,
 * só grava com `confirmar: true`.
 */
export const backfillGateOnboardingEmCasePlans = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { confirmar?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: planos, error: erroPlanos } = await supabase
      .from("onboarding_planos")
      .select("case_id,motivos_bloqueio")
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    if (erroPlanos) throw new Error(`Não foi possível ler onboarding_planos: ${erroPlanos.message}`);

    const lista = (planos ?? []) as { case_id: string; motivos_bloqueio: unknown }[];
    if (!lista.length) return { simulado: !data.confirmar, plano: [], sincronizados: 0 };

    const caseIds = lista.map((p) => p.case_id);
    const { data: alvos, error: erroAlvos } = await supabase
      .from("case_plans")
      .select("id,case_id,motivos_bloqueio")
      .eq("organization_id", organizationId)
      .eq("fase_jornada", "onboarding")
      .is("archived_at", null)
      .in("case_id", caseIds);
    /*
      24/09/2026 — pré-migration: sem a coluna, antes todo caso virava
      "sem_alvo" (mentira silenciosa). Agora para aqui, antes de qualquer
      gravação, e diz por quê. A migration não é aplicada por este código.
    */
    if (colunaAusenteNoBanco(erroAlvos)) {
      return { simulado: !data.confirmar, plano: [], sincronizados: 0, schemaPendente: true, aviso: AVISO_PRE_MIGRATION_GATE };
    }
    if (erroAlvos) throw new Error(`Não foi possível ler case_plans: ${erroAlvos.message}`);

    const alvoPorCaso = new Map<string, { id: string; motivos_bloqueio: unknown }>();
    for (const a of (alvos ?? []) as any[]) alvoPorCaso.set(a.case_id, a);

    const plano = lista.map((p) => {
      const alvo = alvoPorCaso.get(p.case_id);
      if (!alvo) return { caseId: p.case_id, acao: "sem_alvo" as const };
      const igual = JSON.stringify(alvo.motivos_bloqueio ?? []) === JSON.stringify(p.motivos_bloqueio ?? []);
      return { caseId: p.case_id, acao: (igual ? "ja_sincronizado" : "sincronizar") as "ja_sincronizado" | "sincronizar" };
    });

    if (!data.confirmar) return { simulado: true, plano, sincronizados: 0 };

    let sincronizados = 0;
    const falhas: { caseId: string; motivo: string }[] = [];
    for (const item of plano) {
      if (item.acao !== "sincronizar") continue;
      const p = lista.find((x) => x.case_id === item.caseId)!;
      const { error } = await supabase
        .from("case_plans")
        .update({ motivos_bloqueio: p.motivos_bloqueio ?? [], updated_by: context.userId })
        .eq("organization_id", organizationId)
        .eq("case_id", item.caseId)
        .eq("fase_jornada", "onboarding")
        .is("archived_at", null);
      if (error) falhas.push({ caseId: item.caseId, motivo: error.message });
      else sincronizados += 1;
    }

    return { simulado: false, plano, sincronizados, falhas };
  });
