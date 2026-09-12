import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { RadarSeisEixos } from "@/components/portal/radar-seis-eixos";
import { usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export const Route = createFileRoute("/portal/radar")({
  head: () => ({
    meta: [
      { title: "Radar Ancestral — Portal Clube Ancestral" },
      { name: "description", content: "Seu equilíbrio nas 6 dimensões da jornada." },
      { property: "og:title", content: "Radar Ancestral — Portal Clube Ancestral" },
      { property: "og:description", content: "As 6 dimensões da sua jornada genealógica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalRadar,
});

/*
 * 07/09/2026 — achado direto da proprietária: esta tela nunca teve as 6
 * dimensões do mockup aprovado (Documentação, Origem, Conexões Familiares,
 * Elegibilidade, Memória, Legado) — era um radar diferente, de 4 eixos sobre
 * "próximos passos", com quatro cartões de texto e nenhum gráfico. Ver
 * src/lib/radar-seis-eixos.ts para a fonte de cada dimensão e por que
 * Elegibilidade continua sem percentual (decisão institucional, não esquecimento).
 */
export function PortalRadar() {
  const previa = usePreviaPortal();
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
          recurso="o seu radar ancestral"
        >
          {([vivo]) => {
            const dimensoes = radarSeisDimensoes({
              projecoes: vivo.projecoes,
              documentos: vivo.documentos,
            });
            const casoCodigo = previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—");
            const comPercentual = dimensoes.filter((d) => d.estado === "percentual").length;
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-6" data-aba-radar>
                  <div
                    data-radar-meta
                    className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <ChipMeta rotulo="Caso" valor={casoCodigo} />
                    <ChipMeta rotulo="App" valor="6 dimensões" />
                    <ChipMeta rotulo="Desk" valor="4 eixos ≠ App" />
                    <ChipMeta
                      rotulo="Com %"
                      valor={
                        comPercentual === 0
                          ? "Nenhum inventado"
                          : `${comPercentual} de 6`
                      }
                    />
                  </div>
                  <RadarSeisEixos dimensoes={dimensoes} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {dimensoes.map((d) => (
                      <article key={d.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <h2 className="text-sm font-semibold text-navy">{d.titulo}</h2>
                          {d.estado === "percentual" ? (
                            <span className="font-serif text-2xl text-navy">{d.percentual}%</span>
                          ) : null}
                        </div>
                        {d.estado === "percentual" ? (
                          <div className="mt-2 h-1.5 w-full rounded-full bg-navy/10">
                            <div
                              className="h-1.5 rounded-full bg-gold"
                              style={{ width: `${d.percentual ?? 0}%` }}
                            />
                          </div>
                        ) : null}
                        <p className="mt-2 text-xs text-navy/60">{d.legenda}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
