import { createFileRoute, Link, Navigate } from "@tanstack/react-router";

import { DeskApp } from "@/components/desk-app";
import { useSaas } from "@/components/saas/shell";
import { BANNER_REFERENCIA_MOCKUP, decidirAcessoReferencia } from "@/lib/descoberta-desk";

export const Route = createFileRoute("/_authenticated/referencia-mockup-desk")({
  head: () => ({
    meta: [
      { title: "Referência histórica: mockup original de 14 abas — Clube Ancestral" },
      {
        name: "description",
        content:
          "Referência visual interna do mockup original de 14 abas do Desk Intelligence. Somente leitura, sem dados reais e sem ações.",
      },
      { property: "og:title", content: "Referência histórica do Desk Intelligence" },
      {
        property: "og:description",
        content: "Mockup original de 14 abas preservado como referência interna, fora da superfície operacional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { papeis, isLoading } = useSaas();

  if (isLoading) {
    return <div className="p-8 text-sm text-navy/60">Carregando referência…</div>;
  }

  const decisao = decidirAcessoReferencia({ autenticado: true, papeis });
  if (decisao !== "permitir") {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div
        data-referencia-mockup="banner"
        className="sticky top-0 z-50 border-b border-terracotta/40 bg-terracotta px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white"
      >
        {BANNER_REFERENCIA_MOCKUP}
        <Link to="/painel" className="ml-3 underline underline-offset-2">
          Voltar ao Desk operacional
        </Link>
      </div>
      <DeskApp />
    </div>
  );
}
