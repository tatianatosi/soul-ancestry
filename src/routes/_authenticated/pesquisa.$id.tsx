import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PesquisaCaso } from "@/components/pesquisa/painel";

export const Route = createFileRoute("/_authenticated/pesquisa/$id")({
  head: () => ({
    meta: [
      { title: "Dossiê de pesquisa — Clube Ancestral" },
      { name: "description", content: "Pessoas, hipóteses, evidências, linha do tempo e pendências do caso." },
      { property: "og:title", content: "Dossiê de pesquisa — Clube Ancestral" },
      { property: "og:description", content: "Pessoas, hipóteses, evidências e pendências do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PesquisaCasoPage,
});

function PesquisaCasoPage() {
  const { id } = Route.useParams();
  return (
    <SaasShell titulo="Pesquisa genealógica" descricao="Dossiê de pesquisa do caso.">
      <PesquisaCaso casoId={id} />
    </SaasShell>
  );
}
