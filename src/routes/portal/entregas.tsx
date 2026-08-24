import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";

export const Route = createFileRoute("/portal/entregas")({
  head: () => ({
    meta: [
      { title: "Entregas da Jornada — Portal Clube Ancestral" },
      { name: "description", content: "Entregas liberadas para você dentro do seu acompanhamento." },
      { property: "og:title", content: "Entregas da Jornada — Portal Clube Ancestral" },
      { property: "og:description", content: "Suas entregas publicadas pelo Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalEntregas,
});

function PortalEntregas() {
  const { visibilidade, carregando } = useVisibilidade("entrega");

  return (
    <PortalShell titulo={COPY_TELAS.entregas.titulo} descricao={COPY_TELAS.entregas.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
            Nenhuma entrega publicada para consulta no momento.
          </p>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
