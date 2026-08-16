import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PainelPesquisaModulo } from "@/components/pesquisa/modulo";

export const Route = createFileRoute("/_authenticated/pesquisa-modulo/$id")({
  head: () => ({
    meta: [
      { title: "Dossiê de pesquisa — Clube Ancestral" },
      {
        name: "description",
        content: "Pessoas, relações, eventos, fontes, evidências, pendências e relatórios internos do caso.",
      },
      { property: "og:title", content: "Dossiê de pesquisa — Clube Ancestral" },
      {
        property: "og:description",
        content: "Pessoas, relações, eventos, fontes, evidências, pendências e relatórios internos do caso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Detalhe,
  errorComponent: ({ error }) => (
    <SaasShell titulo="Dossiê de pesquisa" descricao="Não foi possível abrir esta pesquisa.">
      <p className="text-sm text-terracotta">{(error as Error).message}</p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Dossiê de pesquisa" descricao="Pesquisa não encontrada.">
      <p className="text-sm text-navy/60">Verifique o link ou volte ao painel de pesquisa.</p>
    </SaasShell>
  ),
});

function Detalhe() {
  const { id } = Route.useParams();
  return (
    <SaasShell titulo="Dossiê de pesquisa" descricao="Trabalho interno de pesquisa genealógica e evidências.">
      <PainelPesquisaModulo researchCaseId={id} />
    </SaasShell>
  );
}
