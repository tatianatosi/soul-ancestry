import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import {
  CASO_DEMO_CODIGO,
  FASES_JORNADA_DEMO,
  FASE_ATUAL_DEMO_SOPHIA_INDICE,
  FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL,
} from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { meusCasos } from "@/lib/portal-cliente.functions";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";
import { ChipIdentidadeCaso } from "@/components/caso/chip-identidade-caso";
import { identidadeDePortalCaso } from "@/lib/caso-compartilhado";
import { cn } from "@/lib/utils";
import { CheckCircle2, Search, ArrowRight, Lock } from "lucide-react";

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
            fase={{
              rotulos: FASES_JORNADA_DEMO,
              indice: FASE_ATUAL_DEMO_SOPHIA_INDICE,
              percentual: FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL,
            }}
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

function EstepeJornada({
  rotulos,
  indice,
  percentual,
}: {
  rotulos: readonly string[];
  indice: number;
  percentual: number;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-xs text-cream/70">
        <span>Progresso da jornada</span>
        <span className="font-semibold text-gold">{percentual}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-navy-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold"
          style={{ width: `${percentual}%` }}
        />
      </div>

      <div className="mt-5 rounded-xl bg-navy-soft/60 p-3">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-gold/80">Hoje você está aqui</div>
        <div className="flex items-center justify-between gap-1">
          {rotulos.map((rotulo, i) => {
            const concluida = i < indice;
            const atual = i === indice;
            return (
              <div key={rotulo} className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold transition",
                    concluida && "bg-gold/40 text-gold",
                    atual && "scale-110 bg-gold text-navy ring-4 ring-gold/30",
                    !concluida && !atual && "border border-cream/20 bg-navy/40 text-cream/50",
                  )}
                >
                  {concluida ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div
                  className={cn(
                    "mt-1.5 text-center text-[9px] leading-tight",
                    atual ? "font-bold text-gold" : "text-cream/60",
                  )}
                >
                  {rotulo}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
  fase,
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
  /** Só preenchido na demo — não existe policy de portal para fase real do caso ainda. */
  fase?: { rotulos: readonly string[]; indice: number; percentual: number } | null;
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

      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-gold/80">Seu caso</p>
            <h2 className="font-serif text-xl italic">{tituloCaso}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-navy">
            {statusRotulo}
          </span>
        </div>
        {statusTexto ? <p className="mt-2 text-sm text-cream/75">{statusTexto}</p> : null}

        {identidade ? (
          <div className="mt-3">
            <ChipIdentidadeCaso identidade={identidade} superficie="App Cliente" />
          </div>
        ) : null}

        {fase ? (
          <EstepeJornada rotulos={fase.rotulos} indice={fase.indice} percentual={fase.percentual} />
        ) : null}

        <div className="mt-4 rounded-xl bg-cream/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-cream/50">Progresso publicado</p>
          <p className="mt-1 font-serif text-2xl">{marcos}</p>
          <p className="text-xs text-cream/60">
            {marcos === 0
              ? "Aguardando primeira publicação"
              : "marcos já compartilhados com você — sem % inventado"}
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">Próximos passos</h3>
        <div className="flex items-start gap-3 rounded-xl border border-navy/10 bg-card p-4 shadow-sm">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 font-serif text-sm font-semibold text-navy">
            1
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-navy">{proximoPasso}</p>
            {proximoPassoDestino ? (
              <LinkPortal
                to={proximoPassoDestino}
                className="text-xs font-medium text-terracotta underline-offset-2 hover:underline"
              >
                Abrir
              </LinkPortal>
            ) : casoId ? (
              <Link
                to="/portal/casos/$id"
                params={{ id: casoId }}
                className="text-xs font-medium text-terracotta underline-offset-2 hover:underline"
              >
                Ver detalhes do caso
              </Link>
            ) : null}
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-navy/40" aria-hidden="true" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-serif text-lg text-navy">Achados recentes</h3>
          <LinkPortal to="/portal/jornada" className="text-xs font-medium text-navy/60 hover:text-navy">
            Ver jornada
          </LinkPortal>
        </div>
        {achados.length === 0 ? (
          <p className="text-sm text-navy/60">
            Assim que a equipe publicar um achado ou atualização, ele aparece aqui.
          </p>
        ) : (
          <div className="space-y-2.5">
            {achados.map((a) => (
              <div key={a.id} className="rounded-xl border border-navy/10 border-l-4 border-l-gold bg-card p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-gold">{a.tipo}</span>
                </div>
                <p className="text-sm text-navy/85">{a.texto}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-plum/30 bg-plum/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-plum/15 text-plum">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-plum">Próximo nível disponível</p>
            <p className="mt-0.5 text-sm text-navy">Sua história familiar completa aguarda.</p>
            <LinkPortal to="/portal/legado" className="mt-2 inline-block text-xs font-medium text-plum hover:underline">
              Saber mais →
            </LinkPortal>
          </div>
        </div>
      </section>
    </div>
  );
}
