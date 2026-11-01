import { createFileRoute, useParams } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell } from "@/components/portal/portal-shell";
import { PortalCasoDetalhe } from "@/components/portal/caso-detalhe";

export const Route = createFileRoute("/portal/casos/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Meu caso — Portal Clube Ancestral" },
      { name: "description", content: "Andamento, documentos solicitados e entregas liberadas do seu caso." },
      { property: "og:title", content: "Meu caso — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe o andamento do seu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CasoPage,
});

function CasoPage() {
  const { id } = useParams({ from: "/portal/casos/$id" });
  return (
    <PortalShell titulo={COPY_TELAS.casos.titulo} descricao={COPY_TELAS.casos.descricao}>
      <PortalCasoDetalhe casoId={id} />
    </PortalShell>
  );
}
