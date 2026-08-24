import { createFileRoute } from "@tanstack/react-router";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";

export const Route = createFileRoute("/portal/legado")({
  head: () => ({
    meta: [
      { title: "Legado — Portal Clube Ancestral" },
      { name: "description", content: "Materiais de legado publicados para você." },
      { property: "og:title", content: "Legado — Portal Clube Ancestral" },
      { property: "og:description", content: "Sua biblioteca de legado no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalLegado,
});

function PortalLegado() {
  const { visibilidade, carregando } = useVisibilidade("biblio");

  return (
    <PortalShell titulo="Legado" descricao="Materiais preparados para permanecer com a sua família.">
      {carregando ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
            Nenhum material de legado publicado no momento.
          </p>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
