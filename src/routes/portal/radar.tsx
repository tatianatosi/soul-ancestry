import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
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
            const casoCodigo = previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—");
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-6" data-aba-radar>
                  <div
                    data-radar-meta
                    className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <ChipMeta rotulo="Caso" valor={casoCodigo} />
                    <ChipMeta rotulo="Eixos" valor="6 dimensões" />
                  </div>
                  <RadarSeisEixos dimensoes={dimensoes} />

                  {/* Próximo passo real (mesma fonte de Home/Jornada) — nunca um passo por eixo inventado. */}
                  <section className="rounded-2xl border-l-4 border-l-navy-800 bg-card p-4">
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

                  {/* Acabamento 2026-09-13 (referência Lovable): leitura mais leve —
                      lista numerada com selo suave no lugar de 6 cartões com barra de
                      progresso. Mesmos dados (titulo/legenda/rotuloNumero), sem
                      recalcular nada. */}
                  <section className="rounded-2xl border border-border bg-card p-2 sm:p-3">
                    <ul className="divide-y divide-border">
                      {dimensoes.map((d, i) => (
                        <li key={d.id} className="flex items-start gap-3 px-3 py-3">
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-semibold text-navy">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-semibold text-navy">{d.titulo}</h2>
                            <p className="mt-0.5 text-xs text-navy/60">{d.legenda}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-navy/75">
                            {d.rotuloNumero}
                          </span>
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
