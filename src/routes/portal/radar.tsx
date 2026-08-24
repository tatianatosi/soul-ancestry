import { createFileRoute } from "@tanstack/react-router";

import { PortalShell } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { EIXOS_RADAR_CANONICOS } from "@/lib/radar-eixos";

export const Route = createFileRoute("/portal/radar")({
  head: () => ({
    meta: [
      { title: "Radar — Portal Clube Ancestral" },
      { name: "description", content: "Os quatro eixos de leitura da sua jornada genealógica." },
      { property: "og:title", content: "Radar — Portal Clube Ancestral" },
      { property: "og:description", content: "Quatro eixos de acompanhamento do seu caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalRadar,
});

function PortalRadar() {
  const { visibilidade, carregando } = useVisibilidade("radar");

  return (
    <PortalShell titulo="Radar" descricao="Quatro eixos de leitura. Nada aqui é conclusão sobre o seu caso.">
      {carregando ? (
        <p className="text-sm text-navy/60">Carregando…</p>
      ) : (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <div className="grid gap-3 sm:grid-cols-2">
            {EIXOS_RADAR_CANONICOS.map((eixo) => (
              <article key={eixo.id} className="rounded-lg border border-navy/10 bg-cream/60 p-4">
                <h2 className="font-serif text-base text-navy">{eixo.titulo}</h2>
                <p className="mt-1 text-xs text-navy/60">{eixo.resumo}</p>
                <p className="mt-3 text-xs text-navy/50">Sem leitura publicada no momento.</p>
              </article>
            ))}
          </div>
        </BlocoVisibilidade>
      )}
    </PortalShell>
  );
}
