import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { RadarSeisEixos } from "@/components/portal/radar-seis-eixos";
import { LinkPortal, usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
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
          superficie="app"
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
            const casoCodigo = previa?.identidade?.codigo ?? "—";
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-5" data-aba-radar>
                  <RadarSeisEixos dimensoes={dimensoes} />

                  {/* Próximo passo real (mesma fonte de Home/Jornada) — nunca um passo por eixo inventado. */}
                  <section className="rounded-xl border border-navy/10 border-l-4 border-l-navy bg-card p-4 shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">
                      Seu próximo passo
                    </p>
                    <p className="mt-1 text-sm text-navy/80">
                      {vivo.proximaAcao?.acao ?? "Assim que a equipe publicar a próxima ação, ela aparece aqui."}
                    </p>
                    {vivo.proximaAcao?.destino ? (
                      <LinkPortal
                        to={vivo.proximaAcao.destino}
                        className="mt-1 inline-block text-xs font-medium text-terracotta underline-offset-2 hover:underline"
                      >
                        {vivo.proximaAcao.destino.includes("documentos")
                          ? "Ver documentos solicitados"
                          : "Ver próxima ação"}
                      </LinkPortal>
                    ) : null}
                  </section>

                  <section aria-label="Dimensões do Radar">
                    <h2 className="mb-3 font-serif text-xl text-navy">Suas seis dimensões</h2>
                    <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {dimensoes.map((d, i) => (
                        <li key={d.id} className="min-w-0 rounded-xl border border-border bg-card p-3.5 shadow-sm sm:p-4">
                          <div className="min-w-0 sm:flex sm:items-start sm:justify-between sm:gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-semibold uppercase tracking-widest text-navy/45">
                                Dimensão {i + 1}
                              </p>
                              <h2 className="mt-0.5 text-xs font-semibold leading-tight text-navy">{d.titulo}</h2>
                            </div>
                            <span className="mt-2 block font-serif text-xl leading-none text-navy sm:mt-0 sm:shrink-0 sm:text-base">
                              {d.rotuloNumero}
                            </span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream" aria-hidden="true">
                            <div
                              className="h-full rounded-full bg-gold"
                              style={{ width: `${d.estado === "percentual" ? (d.percentual ?? 0) : 0}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[10px] leading-relaxed text-navy/55">{d.legenda}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
