import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { DeskOperacional } from "@/components/ops/desk-operacional";

export const Route = createFileRoute("/_authenticated/ops")({
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
      <DeskOperacional />
    </SaasShell>
  );
}
