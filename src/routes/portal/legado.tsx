import { createFileRoute } from "@tanstack/react-router";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { CompartilharAchadoCliente } from "@/components/portal/compartilhar-achado-cliente";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { legadoSanitizado, publicacoesDeEntrega } from "@/lib/portal-dados-vivos";
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

function dataPublicacao(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/* PRATELEIRAS/PrateleiraId/prateleiraDe agora vivem em @/lib/projecoes-cliente
   — mesma classificação usada pela Biblioteca Mestre (Desk, §18), para as
   duas telas nunca divergirem sobre em qual coleção um item cai. */

export function PortalLegado() {
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
            const materiaisPublicados = publicacoesDeEntrega(vivo.projecoes).filter((item) =>
              ["achado", "relatorio_fase", "relatorio_f1", "relatorio_f2", "microentrega"].includes(item.tipo),
            );
            const acervo = [...entregas, ...materiaisPublicados];
            const porPrateleira = Object.fromEntries(
              PRATELEIRAS.map((p) => [p.id, acervo.filter((e) => prateleiraDe(e) === p.id)]),
            ) as Record<PrateleiraId, PublicacaoCliente[]>;

            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="app-v11-secoes" data-aba-legado>
                  {/* Acabamento 2026-09-13 (referência Lovable): card editorial de
                      abertura, mesmo texto que já existia (movido para cá, não
                      duplicado), no padrão navy já usado no hero da Home. */}
                  <section className="app-v11-abertura text-cream">
                    <p className="text-xs uppercase text-gold">
                       Acervo da família
                    </p>
                    <h2 className="mt-1 font-serif text-xl text-cream">
                       Histórias para guardar e compartilhar
                    </h2>
                    <p className="mt-2 text-sm text-cream/70">
                        Um lugar para reunir as histórias e os materiais preparados para permanecer com a sua família.
                    </p>
                  </section>

                  {/*
                    P5 (26/09/2026) — mockup de 17 páginas, tela 6 (Legado):
                    "biblioteca da jornada... continuidade da jornada", card
                    que a auditoria tela-a-tela de 12/09 (p. 10, 33) já
                    apontava como faltante aqui (`docs/relatorios/
                    2026-09-12_verificacao-tela-a-tela-mockup17-auditoria47.md`).
                    Reaproveita `vivo.proximaAcao` — a mesma projeção sanitizada
                    que a Home já usa, nenhum dado novo.
                  */}
                   {vivo.proximaAcao?.acao ? (
                     <p data-legado-continuidade className="border-l-2 border-gold/60 py-1 pl-4 text-sm text-navy/75">
                       {vivo.proximaAcao.acao}
                     </p>
                   ) : null}

                  <div className="grid gap-6 sm:grid-cols-2 sm:items-start" data-legado-prateleiras>
                    {PRATELEIRAS.filter((p) => p.id !== "memoria").map((p) => {
                      const itens = p.id === "narrativas"
                        ? [...porPrateleira.narrativas, ...porPrateleira.memoria]
                        : porPrateleira[p.id];
                      return (
                        <section
                          key={p.id}
                          data-legado-prateleira={p.id}
                           className="app-v11-faixa flex min-w-0 flex-col"
                        >
                          <div className="flex flex-col items-start gap-2">
                            <div>
                              <p className="text-xs font-medium uppercase text-navy/60">
                                Coleção
                              </p>
                              <h2 className="mt-0.5 font-serif text-xl text-navy">{p.rotulo}</h2>
                              <p className="mt-0.5 text-xs text-navy/55">{p.dica}</p>
                            </div>
                            <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                                {itens.length === 0 ? "Ainda sem histórias" : `${itens.length} ${itens.length === 1 ? "história" : "histórias"}`}
                            </span>
                          </div>
                          {itens.length === 0 ? (
                             <p className="app-v11-lacuna mt-3 text-navy/60">
                                 {p.id === "cadernos"
                                   ? "Os cadernos da família aparecerão aqui quando forem liberados."
                                   : p.id === "relatorios"
                                     ? "Nenhum dossiê ou relatório foi liberado para a família até agora."
                                     : "As narrativas de origem aparecerão aqui quando estiverem prontas para a família."}
                            </p>
                          ) : (
                            <ul className="mt-3 space-y-2">
                              {itens.map((item) => (
                                <li
                                  key={item.id}
                                  className="border-b border-border py-4"
                                >
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
                                     {item.tipo === "microentrega" ? "Da nossa jornada" : item.tipoRotulo}
                                  </p>
                                  <p className="mt-1 whitespace-pre-line text-sm text-navy/85">
                                    {item.conteudo}
                                  </p>
                                  {item.publicadoEm && dataPublicacao(item.publicadoEm) ? (
                                    <p className="mt-2 text-[11px] text-navy/45">
                                      Publicado em {dataPublicacao(item.publicadoEm)}
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

                  {/*
                    Corte ÓRFÃOS — ponta do App (03/10/2026). A decisão de
                    09/09 ("cliente decide se deseja compartilhar o achado")
                    tinha três escritores no portal e RLS própria, com zero
                    chamadores. O que faltava era a regra de escopo, que veio
                    em 03/10: somente membros do mesmo processo e família,
                    coberto pelo anexo de privacidade do contrato.
                  */}
                   <p className="border-t border-border pt-4 text-sm leading-relaxed text-navy/75">Entrevistas, acervo e novas descobertas terão seu lugar nas coleções quando forem compartilhados com a família.</p>
                   <CompartilharAchadoCliente achados={entregas} />

                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
