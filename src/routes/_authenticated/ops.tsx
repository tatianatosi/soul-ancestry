import { createFileRoute, Link } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { DeskOperacional } from "@/components/ops/desk-operacional";
import { PainelOnboardingJornada } from "@/components/painel/painel-onboarding-jornada";

export const Route = createFileRoute("/_authenticated/ops")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Desk Operacional — Clube Ancestral" },
      {
        name: "description",
        content: "Fila de trabalho, kanban de tarefas, micro-entregas, SLA e alertas operacionais por caso.",
      },
      { property: "og:title", content: "Desk Operacional — Clube Ancestral" },
      { property: "og:description", content: "Fila, kanban, micro-entregas, SLA e alertas operacionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OpsPage,
});

function OpsPage() {
  return (
    <SaasShell
      titulo="Desk Operacional"
      descricao="Acompanhamento de casos, tarefas e micro-entregas com SLA calculado pelo banco."
    >
      <p
        data-ops-dedup="cadencia"
        className="mb-4 rounded-lg border border-navy/10 bg-cream/50 px-4 py-3 text-sm text-navy/70"
      >
        Cadência Ana (D10/D14), casos no eixo operação e SLA contam{" "}
        <strong className="font-medium text-navy">somente aqui</strong> — em Onboarding e jornada e no desk
        abaixo. O Painel Hoje só linka para esta tela. Métricas de aquisição ficam em{" "}
        <Link to="/marketing" className="font-medium text-navy underline decoration-gold underline-offset-4">
          Marketing
        </Link>
        .
      </p>
      <DeskOperacional />
      <PainelOnboardingJornada />
    </SaasShell>
  );
}
