import { createFileRoute } from "@tanstack/react-router";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";

export const Route = createFileRoute("/portal/jornada")({
  head: () => ({
    meta: [
      { title: "Jornada — Portal Clube Ancestral" },
      { name: "description", content: "Linha do tempo do seu acompanhamento com o Clube Ancestral." },
      { property: "og:title", content: "Jornada — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe as etapas da sua jornada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalJornada,
});

function PortalJornada() {
  const { visibilidade, carregando } = useVisibilidade("jornada");

  return (
    <PortalShell titulo="Jornada" descricao="As etapas do seu acompanhamento, em linguagem simples.">
      {carregando ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <ol className="space-y-3">
            {["Início do acompanhamento", "Organização das informações", "Trabalho em andamento", "Entregas da jornada"].map(
              (etapa) => (
                <li key={etapa} className="flex items-start gap-3 rounded-lg border border-navy/10 bg-cream/60 p-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="text-sm font-medium text-navy">{etapa}</p>
                    <p className="text-xs text-navy/60">Sem atualização publicada no momento.</p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
