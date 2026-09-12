import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import { CASO_DEMO_CODIGO } from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { meusCasos } from "@/lib/portal-cliente.functions";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";
import { ChipIdentidadeCaso } from "@/components/caso/chip-identidade-caso";
import { identidadeDePortalCaso } from "@/lib/caso-compartilhado";

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Home — Portal Clube Ancestral" },
      {
        name: "description",
        content: "Painel do caso, progresso e achados recentes do seu acompanhamento.",
      },
      { property: "og:title", content: "Home — Portal Clube Ancestral" },
      {
        property: "og:description",
        content: "Painel do caso, progresso e achados recentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalHome,
});

/**
 * Home do mockup aprovado: painel do caso, progresso e achados recentes —
 * não uma lista administrativa de fichas.
 */
export function PortalHome() {
  const previa = usePreviaPortal();
  const vivo = usePortalVivo();
  const carregar = useServerFn(meusCasos);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portal-meus-casos"],
    queryFn: () => carregar({}),
    enabled: previa === null,
  });

  const jornada = jornadaSanitizada(
    vivo.data?.projecoes ?? [],
    new Date(),
    vivo.data?.proximaAcao,
  );

  if (previa) {
    return (
      <PortalShell titulo={COPY_TELAS.home.titulo} descricao={COPY_TELAS.home.descricao}>
        {vivo.isLoading ? (
          <PortalCarregando />
        ) : (
          <PainelHomeMockup
            tituloCaso={previa.titulo}
            statusRotulo="Acompanhamento ativo"
            proximoPasso={jornada.proximoPasso}
            marcos={jornada.marcosPublicados}
            casoCodigo={previa.identidade?.codigo ?? CASO_DEMO_CODIGO}
            identidade={previa.identidade}
            achados={jornada.linha.slice(0, 3).map((item) => ({
              id: item.id,
              tipo: item.tipoRotulo,
              texto: item.conteudo,
            }))}
          />
        )}
      </PortalShell>
    );
  }

  return (
    <PortalShell titulo={COPY_TELAS.home.titulo} descricao={COPY_TELAS.home.descricao}>
      <EstadoDados
        carregando={isLoading || vivo.isLoading}
        erro={error}
        dados={data}
        aoTentarNovamente={() => void refetch()}
        recurso="o painel do seu caso"
        vazio={COPY_TELAS.home.vazio}
      >
        {(casos) => {
          const principal = casos[0];
          if (!principal) {
            return <p className="text-sm text-navy/70">{COPY_TELAS.home.vazio}</p>;
          }
          return (
            <div className="space-y-4">
              <PainelHomeMockup
                tituloCaso={principal.titulo}
                statusRotulo={principal.statusRotulo}
                statusTexto={principal.statusTexto}
                proximoPasso={principal.proximoPasso || jornada.proximoPasso}
                proximoPassoDestino={principal.proximoPassoDestino}
                marcos={jornada.marcosPublicados}
                casoCodigo={principal.codigo ?? "—"}
                casoId={principal.id}
                identidade={identidadeDePortalCaso({
                  id: principal.id,
                  codigo: principal.codigo ?? null,
                  titulo: principal.titulo,
                })}
                achados={jornada.linha.slice(0, 3).map((item) => ({
                  id: item.id,
                  tipo: item.tipoRotulo,
                  texto: item.conteudo,
                }))}
              />
              {casos.length > 1 ? (
                <section className="space-y-2">
                  <h2 className="text-xs font-medium uppercase tracking-wide text-navy/50">
                    Outros acompanhamentos
                  </h2>
                  <ul className="space-y-2">
                    {casos.slice(1).map((c) => (
                      <li key={c.id}>
                        <Link
                          to="/portal/casos/$id"
                          params={{ id: c.id }}
                          className="block rounded-xl border border-navy/10 bg-cream/50 px-4 py-3 hover:border-gold"
                        >
                          <p className="font-serif text-base text-navy">{c.titulo}</p>
                          <p className="text-xs text-navy/60">{c.statusRotulo}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          );
        }}
      </EstadoDados>
    </PortalShell>
  );
}

function PainelHomeMockup({
  tituloCaso,
  statusRotulo,
  statusTexto,
  proximoPasso,
  proximoPassoDestino,
  marcos,
  casoCodigo,
  casoId,
  identidade,
  achados,
}: {
  tituloCaso: string;
  statusRotulo: string;
  statusTexto?: string;
  proximoPasso: string;
  proximoPassoDestino?: string | null;
  marcos: number;
  casoCodigo: string;
  casoId?: string;
  identidade?: import("@/lib/caso-compartilhado").IdentidadeCaso;
  achados: Array<{ id: string; tipo: string; texto: string }>;
}) {
  const proximaCurta =
    proximoPasso.length > 48 ? `${proximoPasso.slice(0, 45).trimEnd()}…` : proximoPasso;
  return (
    <div className="space-y-4" data-aba-home>
      <div
        data-home-meta
        className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/50 px-4 py-3"
      >
        <ChipMeta rotulo="Caso" valor={casoCodigo} />
        <ChipMeta
          rotulo="Progresso"
          valor={marcos === 0 ? "Sem publicação ainda" : `${marcos} marcos`}
        />
        <ChipMeta rotulo="Próxima ação" valor={proximaCurta || "Aguardando equipe"} />
        <ChipMeta
          rotulo="Achados"
          valor={achados.length === 0 ? "Nenhum ainda" : `${achados.length} recentes`}
        />
      </div>

      <section className="rounded-2xl border border-navy/10 bg-cream/50 p-5 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-widest text-navy/45">Seu caso</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-serif text-2xl text-navy">{tituloCaso}</h2>
          <span className="rounded-full border border-navy/15 bg-cream/40 px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
            {statusRotulo}
          </span>
        </div>
        {statusTexto ? <p className="mt-2 text-sm text-navy/70">{statusTexto}</p> : null}

        {identidade ? (
          <div className="mt-3">
            <ChipIdentidadeCaso identidade={identidade} superficie="App Cliente" />
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-navy/10 bg-cream/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/45">Progresso publicado</p>
            <p className="mt-1 font-serif text-2xl text-navy">{marcos}</p>
            <p className="text-xs text-navy/55">
              {marcos === 0
                ? "Aguardando primeira publicação"
                : "marcos já compartilhados com você — sem % inventado"}
            </p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-navy/45">Próxima ação</p>
            <p className="mt-1 text-sm font-medium text-navy">{proximoPasso}</p>
            {proximoPassoDestino ? (
              <LinkPortal
                to={proximoPassoDestino}
                className="mt-2 inline-block text-sm font-medium text-terracotta underline-offset-2 hover:underline"
              >
                Abrir
              </LinkPortal>
            ) : casoId ? (
              <Link
                to="/portal/casos/$id"
                params={{ id: casoId }}
                className="mt-2 inline-block text-sm font-medium text-terracotta underline-offset-2 hover:underline"
              >
                Ver detalhes do caso
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-navy/10 bg-cream/40 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-lg text-navy">Achados recentes</h3>
          <LinkPortal to="/portal/jornada" className="text-xs font-medium text-navy/60 hover:text-navy">
            Ver jornada
          </LinkPortal>
        </div>
        {achados.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">
            Assim que a equipe publicar um achado ou atualização, ele aparece aqui.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {achados.map((a) => (
              <li key={a.id} className="rounded-lg border border-navy/10 bg-cream/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">{a.tipo}</p>
                <p className="mt-1 text-sm text-navy/85">{a.texto}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
