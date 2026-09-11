import { createFileRoute } from "@tanstack/react-router";

import { PainelCalls } from "@/components/crm/painel-calls";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/calls")({
  validateSearch: (s: Record<string, unknown>): { lead?: string } => ({
    lead: typeof s.lead === "string" && s.lead.length > 0 ? s.lead : undefined,
  }),
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error} reset={reset} titulo="Mesa de Discovery" />
  ),
  head: () => ({
    meta: [
      { title: "Mesa de Discovery — Clube Ancestral" },
      {
        name: "description",
        content:
          "Entrada comercial: varredura, perguntas SPIN, próxima ação e handoff para pessoa/caso. KPIs de atraso ficam no Hoje.",
      },
      { property: "og:title", content: "Mesa de Discovery — Clube Ancestral" },
      {
        property: "og:description",
        content: "A Mesa faz a entrada comercial funcionar — Calls, SPIN e handoff no Desk.",
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
      titulo="Mesa de Discovery"
      descricao="Entrada comercial: uma pergunta por vez, com origem e destino. O handoff cria pessoa e caso. O que está parado ou vencido aparece no Hoje."
    >
      <PainelCalls leadIdInicial={lead} />
    </SaasShell>
  );
}
