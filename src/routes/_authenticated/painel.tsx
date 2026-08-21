import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PainelDia } from "@/components/painel/painel-dia";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel Hoje — Clube Ancestral" },
      { name: "description", content: "Fila priorizada do dia, exceções sem dono, comercial e casos com prazo." },
      { property: "og:title", content: "Painel Hoje — Clube Ancestral" },
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
    <SaasShell titulo="Painel Hoje" descricao="O que precisa de ação hoje, por quem e até quando.">
      <PainelDia />
    </SaasShell>
  );
}
