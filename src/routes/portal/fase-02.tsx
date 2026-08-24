import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
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
    <PortalShell titulo={COPY_TELAS.fase02.titulo} descricao={COPY_TELAS.fase02.descricao}>
      {carregando ? (
        <PortalCarregando />
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
