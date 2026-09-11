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
          "CRM vivo: Calls, SPIN, próxima ação e handoff para pessoa/caso. KPIs de atraso ficam no Hoje.",
      },
      { property: "og:title", content: "Painel de Calls — Clube Ancestral" },
      {
        property: "og:description",
        content: "CRM Calls faz parte do CRM vivo — Mesa de Discovery, SPIN e handoff no Desk.",
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
      descricao="CRM vivo: uma pergunta por vez, com origem e destino. A Mesa de Discovery registra a call; o handoff cria pessoa e caso. O que está parado ou vencido aparece no Hoje."
    >
      <PainelCalls leadIdInicial={lead} />
    </SaasShell>
  );
}
