import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { AtendimentoInterno } from "@/components/portal/atendimento-interno";

export const Route = createFileRoute("/_authenticated/atendimento")({
  head: () => ({
    meta: [
      { title: "Atendimento ao cliente — Clube Ancestral" },
      { name: "description", content: "Solicitações de documento, envios do cliente, entregas liberadas e tickets." },
      { property: "og:title", content: "Atendimento ao cliente — Clube Ancestral" },
      { property: "og:description", content: "Central interna do portal do cliente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AtendimentoPage,
});

function AtendimentoPage() {
  return (
    <SaasShell
      titulo="Atendimento ao cliente"
      descricao="Tudo que o cliente vê no portal é liberado aqui, com registro de quem liberou e quando."
    >
      <AtendimentoInterno />
    </SaasShell>
  );
}
