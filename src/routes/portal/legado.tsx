import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ChevronDown, FileText, Feather } from "lucide-react";

import { COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { CompartilharAchadoCliente } from "@/components/portal/compartilhar-achado-cliente";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { AvisoFalhaConexao } from "@/components/portal/aviso-falha-conexao";
import { legadoSanitizado, publicacoesDeEntrega } from "@/lib/portal-dados-vivos";
import {
  PRATELEIRAS,
  prateleiraDe,
  type PrateleiraId,
  type PublicacaoCliente,
} from "@/lib/projecoes-cliente";
import { listarEncontrosLinhagemApp } from "@/lib/legado-app.functions";
import { CartaoAchado, CartaoEditorial } from "@/components/portal/elementos-mockup";

export const DISCLAIMER_ENCONTROS =
  "Este conteúdo é histórico, cultural e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico.";

export const Route = createFileRoute("/portal/legado")({
  staticData: { sitemap: false },
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
  const casoId = data?.casoAtivoId ?? null;
  const {
    data: encontros,
    isLoading: carregandoEncontros,
    isError: falhaEncontros,
    refetch: recarregarEncontros,
  } = useQuery({
    queryKey: ["portal-encontros-linhagem", casoId],
    queryFn: () => listarEncontrosLinhagemApp({ data: { caseId: casoId as string } }),
    enabled: Boolean(casoId),
  });

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
              ["achado", "relatorio_fase", "relatorio_f1", "relatorio_f2", "microentrega"].includes(
                item.tipo,
              ),
            );
            // Achado 23 (design critique, 27/10/2026): os mesmos itens
            // tipo "achado" apareciam em "Seus Achados" E eram redistribuídos
            // de novo pelas Coleções via prateleiraDe() — mesmo padrão de
            // exclusão já usado em arvore.tsx (idsComPessoa), sem tocar em
            // prateleiraDe() (compartilhada com a Biblioteca Mestre do Desk).
            const achados = materiaisPublicados.filter((i) => i.tipo === "achado");
            const idsComAchado = new Set(achados.map((a) => String(a.id)));
            const acervo = [...entregas, ...materiaisPublicados].filter(
              (e) => !idsComAchado.has(String(e.id)),
            );
            const colecoes = [
              {
                id: "cadernos",
                rotulo: "Cadernos",
                dica: "Histórias compartilhadas",
                itens: acervo.filter((e) => prateleiraDe(e) === "cadernos"),
              },
              {
                id: "relatorios",
                rotulo: "Dossiês",
                dica: "Sínteses da pesquisa familiar",
                itens: acervo.filter(
                  (e) =>
                    prateleiraDe(e) === "relatorios" &&
                    !["relatorio_f1", "relatorio_f2"].includes(e.tipo),
                ),
              },
              {
                id: "fase1",
                rotulo: "Relatórios Fase 1",
                dica: "Primeira fase da pesquisa",
                itens: acervo.filter((e) => e.tipo === "relatorio_f1"),
              },
              {
                id: "fase2",
                rotulo: "Relatórios Fase 2",
                dica: "Continuidade da pesquisa",
                itens: acervo.filter((e) => e.tipo === "relatorio_f2"),
              },
              {
                id: "memoria",
                rotulo: "Memórias",
                dica: "Narrativas para guardar",
                itens: acervo.filter((e) => ["memoria", "narrativas"].includes(prateleiraDe(e))),
              },
            ];

            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="app-v11-secoes" data-aba-legado>
                  {/* Acabamento 2026-09-13 (referência Lovable): card editorial de
                      abertura, mesmo texto que já existia (movido para cá, não
                      duplicado), no padrão navy já usado no hero da Home. */}
                  <section className="app-legado-editorial">
                    <BookOpen className="app-legado-simbolo h-7 w-7" aria-hidden="true" />
                    <p className="text-xs uppercase text-gold">Acervo da família</p>
                    <h2 className="mt-1 font-serif text-xl text-navy">
                      Histórias para guardar e compartilhar
                    </h2>
                    <p className="mt-2 text-sm text-navy/70">
                      Um lugar para reunir as histórias e os materiais preparados para permanecer
                      com a sua família.
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
                    <p
                      data-legado-continuidade
                      className="border-l-2 border-gold/60 py-1 pl-4 text-sm text-navy/75"
                    >
                      {vivo.proximaAcao.acao}
                    </p>
                  ) : null}

                  {casoId && !carregandoEncontros ? (
                    <section data-legado-encontros className="space-y-3">
                      <h2 className="font-serif text-xl text-navy">Encontros de linhagem</h2>
                      {falhaEncontros ? (
                        // C3 (02/11/2026): falha de carga nunca vira "encontros em preparação".
                        <AvisoFalhaConexao
                          mensagem="Não conseguimos carregar agora. Tente de novo."
                          aoTentar={() => void recarregarEncontros()}
                        />
                      ) : encontros && encontros.length > 0 ? (
                        <>
                          <ul className="space-y-3">
                            {encontros.map((e) => (
                              <li key={e.id} className="border-b border-border pb-4">
                                <p className="font-serif text-lg text-navy">{e.titulo}</p>
                                {e.territoriosMigratorios ? (
                                  <p className="mt-1 text-xs uppercase tracking-wide text-navy/55">
                                    {e.territoriosMigratorios}
                                  </p>
                                ) : null}
                                <p className="mt-2 whitespace-pre-line text-sm text-navy/85">
                                  {e.resumoAprovado}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <div data-legado-encontros-vazio>
                          <CartaoEditorial texto="Os encontros de linhagem terão seu lugar aqui quando a equipe aprovar e liberar para a família." />
                        </div>
                      )}
                    </section>
                  ) : null}

                  <aside
                    aria-label="Aviso sobre Encontros de Linhagem"
                    className="border-l-2 border-gold/60 py-2 pl-4"
                  >
                    <p className="mb-1 text-sm font-medium text-navy">
                      Sobre os Encontros de Linhagem
                    </p>
                    <p data-legado-disclaimer className="text-xs leading-relaxed text-navy/70">
                      {DISCLAIMER_ENCONTROS}
                    </p>
                  </aside>

                  {/* "Seus Achados" (mockup original, 13/10/2026): só achados publicados para a família. */}
                  <section data-legado-achados className="space-y-3">
                    <h2 className="font-serif text-xl text-navy">Seus Achados</h2>
                    {(() => {
                      if (achados.length === 0) {
                        return (
                          <CartaoEditorial texto="Os achados da sua família terão seu lugar aqui quando forem aprovados e compartilhados." />
                        );
                      }
                      return (
                        <div className="grid gap-2.5">
                          {achados.map((a) => {
                            const [titulo, ...resto] = a.conteudo.split(/(?<=[.!?])\s+/);
                            const data = a.publicadoEm ? dataPublicacao(a.publicadoEm) : "";
                            return (
                              <CartaoAchado
                                key={a.id}
                                rotulo={data ? `${a.tipoRotulo} · ${data}` : a.tipoRotulo}
                                titulo={titulo ?? a.conteudo}
                                resumo={resto.join(" ") || undefined}
                              />
                            );
                          })}
                        </div>
                      );
                    })()}
                  </section>

                  <div className="app-prateleiras" data-legado-prateleiras>
                    {colecoes.map((p) => {
                      const itens = p.itens;
                      const IconeColecao =
                        p.id === "cadernos" ? BookOpen : p.id === "relatorios" ? FileText : Feather;
                      return (
                        <section
                          key={p.id}
                          data-legado-prateleira={p.id}
                          className="app-colecao flex min-w-0 flex-col"
                        >
                          <details className="app-colecao-detalhe" open>
                            <summary className="app-colecao-resumo">
                              <span
                                className="app-colecao-capa"
                                data-capa={p.id}
                                aria-hidden="true"
                              >
                                <IconeColecao className="h-6 w-6" />
                              </span>
                              <div className="min-w-0">
                                <div>
                                  <p className="text-xs font-medium uppercase text-navy/60">
                                    Coleção
                                  </p>
                                  <h2 className="mt-0.5 font-serif text-xl text-navy">
                                    {p.rotulo}
                                  </h2>
                                  <p className="mt-0.5 text-xs text-navy/55">{p.dica}</p>
                                </div>
                                <span className="rounded-full border border-navy/15 bg-cream/70 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
                                  {itens.length === 0
                                    ? "Em preparação"
                                    : `${itens.length} ${itens.length === 1 ? "material" : "materiais"}`}
                                </span>
                              </div>
                              <ChevronDown
                                className="app-detalhe-seta h-4 w-4 shrink-0"
                                aria-hidden="true"
                              />
                            </summary>
                            {itens.length === 0 ? (
                              <div className="mt-3">
                                <CartaoEditorial
                                  texto={
                                    p.id === "cadernos"
                                      ? "Os cadernos da família aparecerão aqui quando forem liberados."
                                      : p.id === "relatorios"
                                        ? "Os dossiês e relatórios terão seu lugar aqui quando forem liberados para a família."
                                        : p.id === "fase1" || p.id === "fase2"
                                          ? "O relatório desta fase aparecerá aqui quando for aprovado e compartilhado com a família."
                                          : "As memórias aparecerão aqui quando estiverem prontas para a família."
                                  }
                                />
                              </div>
                            ) : (
                              <ul className="mt-3 space-y-2">
                                {itens.map((item) => (
                                  <li key={item.id} className="border-b border-border py-4">
                                    <details open>
                                      <summary className="min-h-11 cursor-pointer font-serif text-lg text-navy">
                                        {item.tipo === "microentrega"
                                          ? "Da nossa jornada"
                                          : item.tipoRotulo}
                                        {item.publicadoEm && dataPublicacao(item.publicadoEm) ? (
                                          <span className="ml-2 font-sans text-xs text-navy/60">
                                            {dataPublicacao(item.publicadoEm)}
                                          </span>
                                        ) : null}
                                      </summary>
                                      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
                                        {item.tipo === "microentrega"
                                          ? "Da nossa jornada"
                                          : item.tipoRotulo}
                                      </p>
                                      <p className="mt-1 whitespace-pre-line text-sm text-navy/85">
                                        {item.conteudo}
                                      </p>
                                      {item.publicadoEm && dataPublicacao(item.publicadoEm) ? (
                                        <p className="mt-2 text-[11px] text-navy/45">
                                          Publicado em {dataPublicacao(item.publicadoEm)}
                                        </p>
                                      ) : null}
                                    </details>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </details>
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
                  <p className="border-t border-border pt-4 text-sm leading-relaxed text-navy/75">
                    Entrevistas, acervo e novas descobertas terão seu lugar nas coleções quando
                    forem compartilhados com a família.
                  </p>
                  <details className="app-legado-compartilhar">
                    <summary className="flex items-center gap-3 font-serif text-xl text-navy">
                      <span className="flex-1">Compartilhar com a família</span>
                      <ChevronDown className="app-detalhe-seta h-4 w-4" aria-hidden="true" />
                    </summary>
                    <CompartilharAchadoCliente achados={entregas} />
                  </details>
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
