import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { arvoreSanitizada } from "@/lib/portal-dados-vivos";
import { painelArvoreGeracoes, type GeracaoArvore } from "@/lib/portal-arvore-geracoes";
import { LinkPortal, usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { cn } from "@/lib/utils";
import { Search, Clock } from "lucide-react";

/**
 * Conector real entre gerações (correção 2026-09-12): um leque de linhas da
 * geração anterior até cada slot desta geração — mostra a estrutura real de
 * descendência entre as duas faixas, sem inventar QUAL slot é filho de qual
 * (essa relação pessoa-a-pessoa não existe em dado publicado no portal).
 */
function ConectorGeracao({ slots }: { slots: number }) {
  const pontos = Array.from({ length: slots }, (_, i) => ((i + 0.5) / slots) * 100);
  return (
    <svg viewBox="0 0 100 20" className="mx-auto block h-4 w-full max-w-xs" preserveAspectRatio="none" aria-hidden="true">
      {pontos.map((x, i) => (
        <path key={i} d={`M 50 0 L ${x} 20`} stroke="var(--gold)" strokeOpacity={0.4} strokeWidth={1} fill="none" />
      ))}
    </svg>
  );
}

function NoArvore({
  ehG1,
  estado,
  titulo,
}: {
  ehG1: boolean;
  estado: "em_pesquisa" | "a_publicar";
  titulo?: string;
}) {
  const rotuloEstado = estado === "em_pesquisa" ? "Em pesquisa" : "A publicar";
  return (
    <div
      className={cn(
        "flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border text-center shadow-sm",
        ehG1 ? "border-2 border-navy bg-navy font-semibold text-cream shadow" : "border-gold/40 bg-white text-navy/55",
      )}
      title={ehG1 ? "Você (G1)" : rotuloEstado}
    >
      {ehG1 ? (
        <span className="text-[10px]">Você</span>
      ) : (
        <>
          {/* Ajuste 2026-09-12 (opcional, pedido da Proprietária): no desktop,
              ícone + tooltip evita repetir o mesmo texto em vários nós; no
              mobile (sem hover), o texto continua visível. */}
          {estado === "em_pesquisa" ? (
            <Search className="hidden h-3.5 w-3.5 text-gold/70 lg:block" aria-hidden="true" />
          ) : (
            <Clock className="hidden h-3.5 w-3.5 text-navy/40 lg:block" aria-hidden="true" />
          )}
          <span className="text-[8px] leading-tight lg:hidden">{rotuloEstado}</span>
        </>
      )}
    </div>
  );
}

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

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
  const previa = usePreviaPortal();
  const { visibilidade, carregando } = useVisibilidade("arvore");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  return (
    <PortalShell titulo={COPY_TELAS.arvore.titulo} descricao={COPY_TELAS.arvore.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          superficie="app"
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="a sua árvore"
        >
          {([vivo]) => {
            const itens = arvoreSanitizada(vivo.projecoes);
            const painel = painelArvoreGeracoes(itens);
            const casoCodigo = previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—");
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-5" data-aba-arvore>
                  <div
                    data-arvore-meta
                    className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <ChipMeta rotulo="Caso" valor={casoCodigo} />
                    <ChipMeta rotulo="Estrutura" valor="G1–G5" />
                    <ChipMeta
                      rotulo="Publicações"
                      valor={
                        painel.notasPublicadas.length === 0
                          ? "Nenhuma ainda"
                          : `${painel.notasPublicadas.length}`
                      }
                    />
                    <ChipMeta rotulo="Nomes" valor="Só quando liberados" />
                  </div>
                  {/* Estrutura G1–G5 do mockup — chrome visual, sem inventar pessoas. */}
                  <section
                    aria-label="Gerações G1 a G5"
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-widest text-navy/45">
                      Árvore genealógica G1–G5
                    </p>
                    <p className="mt-1 text-sm text-navy/65">
                      {painel.temPublicacao
                        ? "A estrutura abaixo acompanha o que a equipe já publicou para você. Nomes só aparecem quando liberados."
                        : COPY_TELAS.arvore.vazio}
                    </p>
                    <div className="mt-5 space-y-1">
                      {painel.geracoes.map((geracao: GeracaoArvore, gi) => (
                        <div key={geracao.id}>
                          {gi > 0 ? <ConectorGeracao slots={geracao.slots} /> : null}
                          <p className="mb-2 text-center text-[10px] uppercase tracking-[0.14em] text-navy/45">
                            {geracao.rotulo}
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {Array.from({ length: geracao.slots }).map((_, i) => {
                              const ehG1 = geracao.id === "G1";
                              return (
                                <NoArvore
                                  key={`${geracao.id}-${i}`}
                                  ehG1={ehG1}
                                  estado={painel.estadoSlotAnonimo}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {painel.notasPublicadas.length > 0 ? (
                    <section aria-label="Atualizações publicadas da árvore" className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-navy">Atualizações publicadas</h2>
                        {/* Só linka para a Jornada quando há evento real publicado para ver lá. */}
                        <LinkPortal to="/portal/jornada" className="text-xs font-medium text-navy/60 hover:text-navy">
                          Ver na Jornada
                        </LinkPortal>
                      </div>
                      <ul className="space-y-3">
                        {painel.notasPublicadas.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-lg border border-border bg-card p-3 text-sm text-navy/75"
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
