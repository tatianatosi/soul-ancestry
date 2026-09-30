import { createFileRoute } from "@tanstack/react-router";

import { PainelCalls } from "@/components/crm/painel-calls";
import { ComercialConectado } from "@/components/desk/superficies-kit-conectadas";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/calls")({
  validateSearch: (s: Record<string, unknown>): { lead?: string } => ({
    lead: typeof s.lead === "string" && s.lead.length > 0 ? s.lead : undefined,
  }),
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error as Error} reset={reset} titulo="Mesa de Discovery" />
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
      visualKit="pantone"
    >
      <ComercialConectado />
      <details className="mt-6 rounded-lg border border-navy/15 bg-cream/40 p-4" open={Boolean(lead)}>
        <summary className="cursor-pointer font-medium text-navy">Abrir Mesa de Discovery</summary>
        <div className="mt-5 border-t border-navy/10 pt-5">
          <PainelCalls leadIdInicial={lead} />
        </div>
      </details>
    </SaasShell>
  );
}
