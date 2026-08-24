import { createFileRoute } from "@tanstack/react-router";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";

export const Route = createFileRoute("/portal/fase-02")({
  head: () => ({
    meta: [
      { title: "Fase 02 — Portal Clube Ancestral" },
      { name: "description", content: "Situação da Fase 02 dentro do seu acompanhamento." },
      { property: "og:title", content: "Fase 02 — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe a Fase 02 do seu processo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalFase02,
});

function PortalFase02() {
  const { visibilidade, carregando } = useVisibilidade("fase02");

  return (
    <PortalShell titulo="Fase 02" descricao="Estado da segunda fase do seu acompanhamento.">
      {carregando ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          {/* permiteUpsell é sempre false: nenhuma oferta, preço ou CTA de compra. */}
          <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
            Nenhum conteúdo desta fase foi publicado para consulta até agora.
          </p>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
