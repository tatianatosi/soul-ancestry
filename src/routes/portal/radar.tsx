import { createFileRoute } from "@tanstack/react-router";

import { COPY_ESTADO_TEXTO, COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { radarSanitizado } from "@/lib/portal-dados-vivos";
import { garantirEixosCanonicos } from "@/lib/radar-eixos";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";

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

const TEXTO_ESTADO: Record<string, string> = {
  released: "",
  available_empty: COPY_ESTADO_TEXTO.available_empty,
  in_preparation: COPY_ESTADO_TEXTO.in_preparation,
};

export function PortalRadar() {
  const { visibilidade, carregando } = useVisibilidade("radar");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.radar.titulo} descricao={COPY_TELAS.radar.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu radar de países"
        >
          {([vivo]) => {
            // Cards de pontuação e textos seguem exatamente o conjunto e a ordem canônicos.
            const eixos = garantirEixosCanonicos(
              radarSanitizado({ projecoes: vivo.projecoes, documentos: vivo.documentos }),
            );
            return (
        <BlocoVisibilidade visibilidade={visibilidade}>
          <div className="grid gap-3 sm:grid-cols-2">
            {eixos.map((eixo) => (
              <article key={eixo.id} className="rounded-lg border border-navy/10 bg-cream/60 p-4">
                <h2 className="font-serif text-base text-navy">{eixo.titulo}</h2>
                <p className="mt-1 text-xs text-navy/60">{eixo.resumo}</p>
                {eixo.itens.length > 0 ? (
                  <dl className="mt-3 space-y-1">
                    {eixo.itens.map((i) => (
                      <div key={i.rotulo} className="flex justify-between text-xs text-navy/70">
                        <dt>{i.rotulo}</dt>
                        <dd className="font-medium text-navy">{i.valor}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-xs text-navy/50">{TEXTO_ESTADO[eixo.estado]}</p>
                )}
              </article>
            ))}
          </div>
        </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
