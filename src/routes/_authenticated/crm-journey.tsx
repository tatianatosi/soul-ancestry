import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { JornadaCrmHub } from "@/components/crm/jornada-crm";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";
import { FASES_CRM_JOURNEY, fasePorId, type FaseJourneyId } from "@/lib/crm-journey-fases";

const IDS = new Set(FASES_CRM_JOURNEY.map((f) => f.id));

export const Route = createFileRoute("/_authenticated/crm-journey")({
  validateSearch: (s: Record<string, unknown>): { fase?: FaseJourneyId } => {
    const bruto = typeof s.fase === "string" ? s.fase : "";
    return { fase: IDS.has(bruto as FaseJourneyId) ? (bruto as FaseJourneyId) : undefined };
  },
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error} reset={reset} titulo="CRM Journey" />
  ),
  head: () => ({
    meta: [
      { title: "CRM Journey — Clube Ancestral" },
      {
        name: "description",
        content:
          "Jornada comercial completa: Calls → proposta → contrato → App → pesquisa. WhatsApp só com aprovação humana.",
      },
      { property: "og:title", content: "CRM Journey — Clube Ancestral" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CrmJourneyPage,
});

function CrmJourneyPage() {
  const { fase } = Route.useSearch();
  const navegar = useNavigate({ from: Route.fullPath });
  const ativa = fasePorId(fase);

  return (
    <SaasShell
      titulo="CRM Journey"
      descricao="Ciclo inteiro navegável: da Mesa de Discovery ao App e à pesquisa. Cada fase abre a tela real do Desk — sem inventar crm_calls nem enviar WhatsApp sozinho."
    >
      <JornadaCrmHub
        faseAtivaId={ativa.id}
        onSelecionar={(id) => {
          void navegar({ search: { fase: id } });
        }}
      />
    </SaasShell>
  );
}
