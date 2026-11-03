import { createFileRoute, Link } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PesquisaCaso } from "@/components/pesquisa/painel";

export const Route = createFileRoute("/_authenticated/pesquisa/$id")({
  staticData: { sitemap: false },
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
    <SaasShell
      titulo="Dossiê de pesquisa"
      descricao="Repositório do caso. O que for publicado como legado aparece no App Cliente."
    >
      <p className="mb-4 rounded-lg border border-navy/10 bg-cream/60 px-4 py-3 text-sm text-navy/70">
        Este dossiê é o repositório interno. Para o cliente ver o material na aba Legado, publique a
        projeção sanitizada na{" "}
        <Link
          to="/biblioteca-evidencias/$caseId"
          params={{ caseId: id }}
          className="font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Biblioteca de evidências
        </Link>
        .
      </p>
      <PesquisaCaso casoId={id} />
    </SaasShell>
  );
}
