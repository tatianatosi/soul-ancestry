import { createFileRoute } from "@tanstack/react-router";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";

export const Route = createFileRoute("/portal/fase-01")({
  head: () => ({
    meta: [
      { title: "Fase 01 — Portal Clube Ancestral" },
      { name: "description", content: "Situação da Fase 01 dentro do seu acompanhamento." },
      { property: "og:title", content: "Fase 01 — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe a Fase 01 do seu processo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalFase01,
});

function PortalFase01() {
  const { visibilidade, carregando } = useVisibilidade("relatorio");

  return (
    <PortalShell titulo="Fase 01" descricao="Estado da primeira fase do seu acompanhamento.">
      {carregando ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
            Nenhum conteúdo desta fase foi publicado para consulta até agora.
          </p>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
