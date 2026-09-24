import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { backfillGateOnboardingEmCasePlans } from "@/lib/onboarding-gate-backfill.functions";

export const Route = createFileRoute("/_authenticated/governanca/migracao-onboarding-gate")({
  head: () => ({
    meta: [
      { title: "Migração — gate de onboarding em case_plans — Clube Ancestral" },
      {
        name: "description",
        content: "Backfill único de motivos_bloqueio de onboarding_planos para case_plans, com prévia antes de gravar.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MigracaoOnboardingGatePage,
});

type ItemPlano = { caseId: string; acao: "sem_alvo" | "ja_sincronizado" | "sincronizar" };

const ROTULO_ACAO: Record<ItemPlano["acao"], string> = {
  sem_alvo: "Sem case_plans (fase onboarding) — não cria automaticamente",
  ja_sincronizado: "Já sincronizado",
  sincronizar: "Vai sincronizar",
};

function MigracaoOnboardingGatePage() {
  const backfill = useServerFn(backfillGateOnboardingEmCasePlans);
  const [plano, setPlano] = useState<ItemPlano[] | null>(null);

  const m = useMutation({
    mutationFn: (confirmar: boolean) => backfill({ data: { confirmar } }),
    onSuccess: (r: any) => setPlano(r.plano ?? []),
  });

  const pendentes = plano ? plano.filter((p) => p.acao === "sincronizar").length : 0;
  const semAlvo = plano ? plano.filter((p) => p.acao === "sem_alvo").length : 0;

  return (
    <SaasShell
      titulo="Migração — gate de onboarding em case_plans"
      descricao="Decisão da Proprietária, 2026-09-24: espelha motivos_bloqueio de onboarding_planos para a linha de case_plans (fase_jornada=onboarding) do mesmo caso. Só grava com confirmação; nunca cria linha de case_plans nova."
    >
      <CaCard titulo="Prévia e confirmação">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={m.isPending}
            onClick={() => m.mutate(false)}
            className="rounded-lg border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-cream/50 disabled:opacity-50"
          >
            Ver o que será feito
          </button>
          <button
            type="button"
            disabled={m.isPending || !pendentes}
            onClick={() => m.mutate(true)}
            className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
          >
            Sincronizar agora
          </button>
        </div>

        {plano && (
          <p className="mt-3 text-xs text-navy/70">
            {plano.length} caso(s) com onboarding_planos · {pendentes} a sincronizar · {semAlvo} sem case_plans(onboarding).
          </p>
        )}

        {plano && plano.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {plano.map((p) => (
              <li key={p.caseId} className="rounded border border-navy/10 p-2 text-xs text-navy/75">
                <span className="font-mono">{p.caseId}</span> — {ROTULO_ACAO[p.acao]}
              </li>
            ))}
          </ul>
        )}
      </CaCard>
    </SaasShell>
  );
}
