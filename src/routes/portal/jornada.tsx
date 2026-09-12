import { createFileRoute } from "@tanstack/react-router";
import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { LinkPortal, usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { KpiCard } from "@/components/clube-ancestral-kit";
import { jornadaSanitizada, partirJornadaEmDuasLinhas } from "@/lib/portal-dados-vivos";

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  // Kit visual aprovado: o cartão de indicador do Clube Ancestral.
  return <KpiCard label={rotulo} value={valor} />;
}

export const Route = createFileRoute("/portal/jornada")({
  head: () => ({
    meta: [
      { title: "Jornada — Portal Clube Ancestral" },
      {
        name: "description",
        content: "Linha do tempo do seu acompanhamento com o Clube Ancestral.",
      },
      { property: "og:title", content: "Jornada — Portal Clube Ancestral" },
      { property: "og:description", content: "Acompanhe as etapas da sua jornada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalJornada,
});

export function PortalJornada() {
  const previa = usePreviaPortal();
  const { visibilidade, carregando } = useVisibilidade("jornada");
  const entrega = useVisibilidade("entrega");
  const fase1 = useVisibilidade("relatorio");
  const fase2 = useVisibilidade("fase02");
  const { data, isLoading, isError, error, refetch } = usePortalVivo();

  const abreJornada = (r: typeof entrega.visibilidade) =>
    r.navegavel && r.estado !== "hidden_by_permission" && r.estado !== "not_applicable";

  return (
    <PortalShell titulo={COPY_TELAS.jornada.titulo} descricao={COPY_TELAS.jornada.descricao}>
      {carregando ? (
        <PortalCarregando />
      ) : (
        <EstadoDados
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu acompanhamento"
        >
          {([vivo]) => {
            const jornada = jornadaSanitizada(vivo.projecoes, new Date(), vivo.proximaAcao);
            const destino = vivo.proximaAcao?.destino ?? null;
            const casoCodigo = previa?.identidade?.codigo ?? (previa ? CASO_DEMO_CODIGO : "—");
            const ritmoRotulo =
              jornada.ritmo === "sem_publicacao"
                ? "Aguardando primeira publicação"
                : jornada.ritmo === "regular"
                  ? "Ritmo em dia"
                  : jornada.ritmo === "atencao"
                    ? "Próxima atualização em preparação"
                    : "Atualização em revisão";
            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-4" data-aba-jornada>
                <div
                  data-jornada-meta
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <ChipMeta rotulo="Caso" valor={casoCodigo} />
                  <ChipMeta rotulo="Marcos" valor={String(jornada.marcosPublicados)} />
                  <ChipMeta rotulo="Ritmo" valor={ritmoRotulo} />
                  <ChipMeta
                    rotulo="Atualizações"
                    valor={
                      jornada.linha.length === 0
                        ? "Nenhuma ainda"
                        : `${jornada.linha.length} publicadas`
                    }
                  />
                </div>
                {/* Eixo editorial 1820–2024 (taxonomia do mockup) — o feed abaixo permanece a fonte de atualizações. */}
                <div
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-cream/50 px-4 py-3"
                  aria-label="Linha do tempo ancestral de 1820 a 2024"
                >
                  <span className="font-serif text-sm text-navy">1820</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-navy/30 via-gold to-navy/30" aria-hidden="true" />
                  <span className="text-[10px] uppercase tracking-widest text-navy/45">Linha ancestral</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-navy/30 via-gold to-navy/30" aria-hidden="true" />
                  <span className="font-serif text-sm text-navy">2024</span>
                </div>
                <p className="rounded-lg border border-navy/10 bg-cream/60 p-3 text-sm text-navy/70">
                  <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/45">
                    {ritmoRotulo}
                  </span>
                  {jornada.proximoPasso}{" "}
                  {destino ? (
                    <LinkPortal to={destino} className="font-medium text-terracotta underline-offset-2 hover:underline">
                      Abrir
                    </LinkPortal>
                  ) : null}
                </p>
                {(() => {
                  const { historia, seuCaso, uniaoDeRamos } = partirJornadaEmDuasLinhas(jornada.linha);
                  const Coluna = ({
                    titulo,
                    itens,
                    vazio,
                    tom,
                  }: {
                    titulo: string;
                    itens: typeof jornada.linha;
                    vazio: string;
                    tom: "historia" | "caso";
                  }) => (
                    <section
                      aria-label={titulo}
                      className="rounded-xl border border-navy/10 bg-cream/50 p-4"
                      data-jornada-coluna={tom}
                    >
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-navy/45">
                        {titulo}
                      </p>
                      {itens.length === 0 ? (
                        <p className="mt-3 text-sm text-navy/55">{vazio}</p>
                      ) : (
                        <ol className="mt-3 space-y-3">
                          {itens.map((item) => (
                            <li key={item.id} className="border-l-2 border-gold/70 pl-3">
                              <p className="text-sm font-medium text-navy">{item.tipoRotulo}</p>
                              <p className="mt-0.5 text-sm text-navy/70">{item.conteudo}</p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </section>
                  );
                  if (jornada.linha.length === 0) {
                    return (
                      <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
                        {COPY_TELAS.jornada.vazio}
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3" data-jornada-duas-linhas>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Coluna
                          titulo="História"
                          tom="historia"
                          itens={historia}
                          vazio="Ainda não há marcos de família publicados nesta linha."
                        />
                        <Coluna
                          titulo="Seu caso"
                          tom="caso"
                          itens={seuCaso}
                          vazio="Ainda não há atualizações do acompanhamento publicadas."
                        />
                      </div>
                      {uniaoDeRamos ? (
                        <p
                          data-uniao-ramos
                          className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1.5 text-[11px] font-medium text-terracotta"
                        >
                          <span className="size-1.5 rounded-full bg-terracotta" aria-hidden />
                          União de Ramos — história e caso se encontram no que já foi publicado
                        </p>
                      ) : null}
                    </div>
                  );
                })()}

                {(abreJornada(entrega.visibilidade) ||
                  abreJornada(fase1.visibilidade) ||
                  abreJornada(fase2.visibilidade)) && (
                  <p className="text-[11px] text-navy/50">
                    Material publicado:{" "}
                    {abreJornada(entrega.visibilidade) ? (
                      <LinkPortal to="/portal/entregas" className="underline underline-offset-2 hover:text-navy/70">
                        ver materiais liberados
                      </LinkPortal>
                    ) : null}
                    {abreJornada(entrega.visibilidade) && abreJornada(fase1.visibilidade) ? " · " : null}
                    {abreJornada(fase1.visibilidade) ? (
                      <LinkPortal to="/portal/fase-01" className="underline underline-offset-2 hover:text-navy/70">
                        ver relatório preparado
                      </LinkPortal>
                    ) : null}
                    {(abreJornada(entrega.visibilidade) || abreJornada(fase1.visibilidade)) &&
                    abreJornada(fase2.visibilidade)
                      ? " · "
                      : null}
                    {abreJornada(fase2.visibilidade) ? (
                      <LinkPortal to="/portal/fase-02" className="underline underline-offset-2 hover:text-navy/70">
                        ver atualização seguinte
                      </LinkPortal>
                    ) : null}
                  </p>
                )}
                </div>
              </BlocoVisibilidade>
            );
          }}
        </EstadoDados>
      )}
    </PortalShell>
  );
}
