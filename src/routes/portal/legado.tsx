import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { legadoSanitizado } from "@/lib/portal-dados-vivos";
import { PRATELEIRAS, prateleiraDe, type PrateleiraId, type PublicacaoCliente } from "@/lib/projecoes-cliente";

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

/* PRATELEIRAS/PrateleiraId/prateleiraDe agora vivem em @/lib/projecoes-cliente
   — mesma classificação usada pela Biblioteca Mestre (Desk, §18), para as
   duas telas nunca divergirem sobre em qual coleção um item cai. */

function Chip({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export function PortalLegado() {
  const previa = usePreviaPortal();
  const { visibilidade, carregando } = useVisibilidade("biblio");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.legado.titulo} descricao={COPY_TELAS.legado.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          superficie="app"
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu legado"
        >
          {([vivo]) => {
            const entregas = legadoSanitizado(vivo.projecoes);
            const premium = entregas.length > 0;
            const casoCodigo = previa?.identidade?.codigo ?? "—";
            const porPrateleira = Object.fromEntries(
              PRATELEIRAS.map((p) => [p.id, entregas.filter((e) => prateleiraDe(e) === p.id)]),
            ) as Record<PrateleiraId, PublicacaoCliente[]>;

            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-4" data-aba-legado>
                  <div
                    data-legado-meta
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Chip rotulo="Biblioteca" valor="Legado familiar" />
                      <Chip rotulo="Caso" valor={casoCodigo} />
                      <Chip
                        rotulo="Publicados"
                        valor={
                          entregas.length === 0
                            ? "Nenhum ainda"
                            : `${entregas.length} material${entregas.length === 1 ? "" : "is"}`
                        }
                      />
                      <Chip rotulo="Nível" valor={premium ? "Premium" : "Biblioteca"} />
                    </div>
                    {premium ? (
                      <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
                        Premium
                      </span>
                    ) : null}
                  </div>

                  {/* Acabamento 2026-09-13 (referência Lovable): card editorial de
                      abertura, mesmo texto que já existia (movido para cá, não
                      duplicado), no padrão navy já usado no hero da Home. */}
                  <section className="rounded-2xl bg-navy-800 p-4 text-cream sm:p-5">
                    <p className="text-[10px] uppercase tracking-widest text-gold/80">
                      Biblioteca da família
                    </p>
                    <h2 className="mt-1 font-serif text-lg text-cream">
                      Seu legado, organizado por coleção
                    </h2>
                    <p className="mt-2 text-sm text-cream/70">
                      Cadernos, relatórios, narrativas e memória — só o que a equipe publica para
                      ficar com a sua família. Sem inventar material.
                    </p>
                  </section>

                  <div className="space-y-3" data-legado-prateleiras>
                    {PRATELEIRAS.map((p) => {
                      const itens = porPrateleira[p.id];
                      return (
                        <section
                          key={p.id}
                          data-legado-prateleira={p.id}
                          className="rounded-2xl border border-border bg-card p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-widest text-gold/70">
                                Coleção
                              </p>
                              <h2 className="mt-0.5 text-sm font-semibold text-navy">{p.rotulo}</h2>
                              <p className="mt-0.5 text-xs text-navy/55">{p.dica}</p>
                            </div>
                            <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                              {itens.length === 0 ? "Vazio" : `${itens.length}`}
                            </span>
                          </div>
                          {itens.length === 0 ? (
                            <p className="mt-3 rounded-xl border border-dashed border-navy/20 bg-cream/60 px-4 py-4 text-center text-sm text-navy/60">
                              Nada publicado nesta prateleira ainda.
                            </p>
                          ) : (
                            <ul className="mt-3 space-y-2">
                              {itens.map((item) => (
                                <li
                                  key={item.id}
                                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                                >
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
                                    {item.tipoRotulo}
                                  </p>
                                  <p className="mt-1 whitespace-pre-line text-sm text-navy/85">
                                    {item.conteudo}
                                  </p>
                                  {item.publicadoEm ? (
                                    <p className="mt-2 font-mono text-[11px] text-navy/45">
                                      {item.publicadoEm}
                                    </p>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      );
                    })}
                  </div>

                  {entregas.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-4 text-center text-sm text-navy/60">
                      {COPY_TELAS.legado.vazio}
                    </p>
                  ) : null}
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
