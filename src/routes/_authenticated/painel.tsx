import { createFileRoute } from "@tanstack/react-router";

import { HojeConectado } from "@/components/desk/superficies-kit-conectadas";
import { SaasShell } from "@/components/saas/shell";
import { PainelDia } from "@/components/painel/painel-dia";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Clube Ancestral" },
      { name: "description", content: "Fila priorizada do dia (Painel Hoje), exceções sem dono, comercial e casos com prazo." },
      { property: "og:title", content: "Visão Geral — Clube Ancestral" },
      { property: "og:description", content: "O que precisa de ação hoje, por quem e até quando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  return (
    <SaasShell
      titulo="Visão Geral"
      descricao="O que está parado, vencido ou pede decisão — com ação e link para a aba dona."
      visualKit="pantone"
    >
      <HojeConectado />
      <details className="mt-6 rounded-lg border border-navy/15 bg-cream/40 p-4">
        <summary className="cursor-pointer font-medium text-navy">Abrir fila operacional do dia</summary>
        <div className="mt-5 border-t border-navy/10 pt-5">
          <PainelDia />
        </div>
      </details>
    </SaasShell>
  );
}
