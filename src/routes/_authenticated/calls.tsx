import { createFileRoute } from "@tanstack/react-router";

import { PainelCalls } from "@/components/crm/painel-calls";
import { SaasShell } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/calls")({
  head: () => ({
    meta: [
      { title: "Painel de Calls — Clube Ancestral" },
      { name: "description", content: "Registro de calls, qualificação preliminar de leads e handoff da Discovery com validações de bloqueio." },
      { property: "og:title", content: "Painel de Calls — Clube Ancestral" },
      { property: "og:description", content: "Calls, qualificação e handoff da Discovery no Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallsPage,
});

function CallsPage() {
  return (
    <SaasShell titulo="Painel de Calls" descricao="Registrar chamadas, qualificar leads e fazer o handoff da Discovery.">
      <PainelCalls />
    </SaasShell>
  );
}
