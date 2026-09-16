import { createFileRoute } from "@tanstack/react-router";

import { HojeGoLive } from "@/components/golive/superficies/hoje";
import { SaasShell } from "@/components/saas/shell";

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

/**
 * Tela dona da superfície "Hoje".
 *
 * O painel consolidado que repetia os números das outras telas saiu: cada
 * frente é lida na sua própria tela dona. Aqui fica a decisão do dia.
 */
function Painel() {
  return (
    <SaasShell
      titulo="Visão Geral"
      descricao="O que está parado, vencido ou pede decisão — com ação e link para a tela dona."
      visualKit="pantone"
    >
      <HojeGoLive />
    </SaasShell>
  );
}
