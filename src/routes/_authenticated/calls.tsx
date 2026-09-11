import { createFileRoute } from "@tanstack/react-router";

import { PainelCalls } from "@/components/crm/painel-calls";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/calls")({
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error} reset={reset} titulo="Painel de Calls" />
  ),
  head: () => ({
    meta: [
      { title: "Painel de Calls — Clube Ancestral" },
      { name: "description", content: "Painel de Calls: entrada, varredura, Discovery, próxima ação e handoff. Ainda incompleto. KPIs de atraso ficam no Hoje." },
      { property: "og:title", content: "Painel de Calls — Clube Ancestral" },
      { property: "og:description", content: "O Painel de Calls faz a entrada comercial. A Mesa de Discovery é o roteiro SPIN dentro dele." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallsPage,
});

function CallsPage() {
  return (
    <SaasShell
      titulo="Painel de Calls"
      descricao="Entrada, Discovery, qualificação e handoff — ainda incompleto. A Mesa de Discovery é o roteiro SPIN dentro deste painel. O que está parado ou vencido aparece no Hoje."
    >
      <PainelCalls />
    </SaasShell>
  );
}
