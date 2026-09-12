import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { arvoreSanitizada } from "@/lib/portal-dados-vivos";
import { painelArvoreGeracoes } from "@/lib/portal-arvore-geracoes";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/arvore")({
  head: () => ({
    meta: [
      { title: "Árvore — Portal Clube Ancestral" },
      { name: "description", content: "Espaço da sua árvore familiar dentro do acompanhamento." },
      { property: "og:title", content: "Árvore — Portal Clube Ancestral" },
      { property: "og:description", content: "Sua árvore familiar no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalArvore,
});

export function PortalArvore() {
  const { visibilidade, carregando } = useVisibilidade("arvore");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.arvore.titulo} descricao={COPY_TELAS.arvore.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="a sua árvore"
        >
          {([vivo]) => {
            const itens = arvoreSanitizada(vivo.projecoes);
            const painel = painelArvoreGeracoes(itens);
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-5">
                  {/* Estrutura G1–G5 do mockup — chrome visual, sem inventar pessoas. */}
                  <section
                    aria-label="Gerações G1 a G5"
                    className="rounded-2xl border border-navy/10 bg-white/80 p-5 shadow-sm"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-widest text-navy/45">
                      Árvore genealógica G1–G5
                    </p>
                    <p className="mt-1 text-sm text-navy/65">
                      {painel.temPublicacao
                        ? "A estrutura abaixo acompanha o que a equipe já publicou para você. Nomes só aparecem quando liberados."
                        : COPY_TELAS.arvore.vazio}
                    </p>
                    <div className="mt-5 space-y-5">
                      {painel.geracoes.map((geracao) => (
                        <div key={geracao.id}>
                          <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-navy/45">
                            {geracao.rotulo}
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {Array.from({ length: geracao.slots }).map((_, i) => (
                              <div
                                key={`${geracao.id}-${i}`}
                                className={cn(
                                  "flex h-12 w-12 items-center justify-center rounded-full border text-[10px] text-navy/55",
                                  painel.temPublicacao
                                    ? "border-gold/50 bg-gold/10"
                                    : "border-navy/15 bg-cream",
                                )}
                                aria-hidden="true"
                              >
                                —
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {painel.notasPublicadas.length > 0 ? (
                    <section aria-label="Atualizações publicadas da árvore" className="space-y-3">
                      <h2 className="font-serif text-lg text-navy">Atualizações publicadas</h2>
                      <ul className="space-y-3">
                        {painel.notasPublicadas.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-lg border border-navy/10 bg-cream/50 p-3 text-sm text-navy/75"
                          >
                            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
                              {item.tipoRotulo}
                            </p>
                            <p className="mt-1 whitespace-pre-line">{item.conteudo}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
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
