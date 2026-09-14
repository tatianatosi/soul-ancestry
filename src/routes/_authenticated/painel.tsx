import { createFileRoute } from "@tanstack/react-router";

import { HojeConectado } from "@/components/desk/superficies-kit-conectadas";
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

function Painel() {
  return (
    <SaasShell
      titulo="Visão Geral"
      descricao="O que está parado, vencido ou pede decisão — com ação e link para a aba dona."
      visualKit="pantone"
    >
      <HojeConectado />
    </SaasShell>
  );
}
