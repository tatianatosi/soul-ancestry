import { createFileRoute } from "@tanstack/react-router";

import { PainelCalls } from "@/components/crm/painel-calls";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/calls")({
  validateSearch: (s: Record<string, unknown>): { lead?: string } => ({
    lead: typeof s.lead === "string" && s.lead.length > 0 ? s.lead : undefined,
  }),
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error} reset={reset} titulo="Painel de Calls" />
  ),
  head: () => ({
    meta: [
      { title: "Painel de Calls — Clube Ancestral" },
      {
        name: "description",
        content:
          "CRM vivo após o Lead: Call Discovery/diagnóstico (SPIN), idealmente call de proposta, handoff. KPIs de atraso ficam no Hoje.",
      },
      { property: "og:title", content: "Painel de Calls — Clube Ancestral" },
      {
        property: "og:description",
        content:
          "Sequência: Lead → Call Discovery → (ideal) call de proposta. Persistência em leads; sem crm_calls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallsPage,
});

function CallsPage() {
  const { lead } = Route.useSearch();
  return (
    <SaasShell
      titulo="Painel de Calls"
      descricao="Sequência: Lead primeiro, depois Call Discovery/diagnóstico (Mesa SPIN). Idealmente uma call para apresentar a proposta — o registro fica em Propostas. O handoff cria pessoa e caso. O que está parado ou vencido aparece no Hoje."
    >
      <PainelCalls leadIdInicial={lead} />
    </SaasShell>
  );
}
