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
import { CheckCircle2, Search, ArrowRight } from "lucide-react";
import { CaCard } from "@/components/ui/ca-card";

/**
 * Rota real por tipo de publicação (correção 2026-09-12, pedido da
 * Proprietária): achado sobre a árvore abre Árvore, sobre legado abre
 * Legado, documento analisado abre Documentos; o resto (marco, resumo,
 * atualização, linha do tempo) abre Jornada. Nunca uma rota inventada.
 */
function destinoPorTipo(tipo: string): "/portal/jornada" | "/portal/arvore" | "/portal/documentos" | "/portal/legado" {
  if (tipo === "arvore") return "/portal/arvore";
  if (tipo === "legado") return "/portal/legado";
  if (tipo === "evidencia") return "/portal/documentos";
  return "/portal/jornada";
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
            proximoPassoDestino={vivo.data?.proximaAcao?.destino ?? null}
            marcos={jornada.marcosPublicados}
            casoCodigo={previa.identidade?.codigo ?? CASO_DEMO_CODIGO}
            identidade={previa.identidade}
            achados={jornada.linha.slice(0, 3).map((item) => ({
              id: item.id,
              tipo: item.tipoRotulo,
              destino: destinoPorTipo(item.tipo),
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
                  destino: destinoPorTipo(item.tipo),
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
  const rotuloAtual = rotulos[indice];
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs text-cream/70">
        <span>Progresso da jornada</span>
        <span className="font-semibold text-gold">{percentual}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-navy-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold"
          style={{ width: `${percentual}%` }}
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-1">
        {rotulos.map((rotulo, i) => {
          const concluida = i < indice;
          const atual = i === indice;
          return (
            <div key={rotulo} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                  concluida && "bg-gold/40 text-gold",
                  atual && "bg-gold text-navy",
                  !concluida && !atual && "bg-cream/15 text-cream/50",
                )}
              >
                {concluida ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              <span className={cn("text-center text-[8px] leading-tight", atual ? "text-gold" : "text-cream/50")}>
                {rotulo}
              </span>
            </div>
          );
        })}
      </div>
      {rotuloAtual ? (
        <p className="sr-only">Etapa atual: {rotuloAtual}</p>
      ) : null}
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
  achados: Array<{
    id: string;
    tipo: string;
    destino: "/portal/jornada" | "/portal/arvore" | "/portal/documentos" | "/portal/legado";
    texto: string;
  }>;
  /** Só preenchido na demo — não existe policy de portal para fase real do caso ainda. */
  fase?: { rotulos: readonly string[]; indice: number; percentual: number } | null;
}) {
  const proximaCurta =
    proximoPasso.length > 64 ? `${proximoPasso.slice(0, 61).trimEnd()}…` : proximoPasso;
  return (
    <div className="space-y-4" data-aba-home>
      {/*
        Correção 2026-09-12: um card navy só, sem cartão bege duplicado
        antes dele nem cartão cinza/claro dentro dele (o chip de
        identidade do caso continua no DOM para prova App↔Desk, só não
        aparece mais visualmente aqui).
      */}
      <section className="rounded-2xl bg-navy-800 p-4 text-cream sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gold/80">Seu caso</p>
            <h2 className="font-serif text-lg text-cream">{tituloCaso}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold text-navy">
            {statusRotulo}
          </span>
        </div>
        {statusTexto ? <p className="mt-1.5 text-xs text-cream/70">{statusTexto}</p> : null}

        {identidade ? (
          <div className="sr-only">
            <ChipIdentidadeCaso identidade={identidade} superficie="App Cliente" />
          </div>
        ) : null}

        {fase ? (
          <EstepeJornada rotulos={fase.rotulos} indice={fase.indice} percentual={fase.percentual} />
        ) : (
          <p className="mt-3 text-xs text-cream/60">
            {marcos === 0
              ? "Aguardando primeira publicação"
              : `${marcos} marcos já compartilhados com você — sem % inventado`}
          </p>
        )}
      </section>

      {/* Correção 2026-09-12: grade em telas largas (sidebar liberou espaço horizontal); CTA lilás removido (fora do guia oficial de marca — só 5 cores). */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-navy">Próximos passos</h3>
          <CaCard className="flex flex-row items-start gap-3 p-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/20 text-sm font-semibold text-navy">
              1
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy">{proximaCurta}</p>
              {proximoPassoDestino ? (
                <LinkPortal
                  to={proximoPassoDestino}
                  className="mt-0.5 inline-block text-xs font-medium text-terracotta underline-offset-2 hover:underline"
                >
                  {proximoPassoDestino.includes("documentos") ? "Ver documentos solicitados" : "Ver próxima ação"}
                </LinkPortal>
              ) : casoId ? (
                <Link
                  to="/portal/casos/$id"
                  params={{ id: casoId }}
                  className="mt-0.5 inline-block text-xs font-medium text-terracotta underline-offset-2 hover:underline"
                >
                  Ver detalhes do caso
                </Link>
              ) : null}
            </div>
          </CaCard>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-navy">Achados recentes</h3>
            <LinkPortal to="/portal/jornada" className="text-xs font-medium text-navy/60 hover:text-navy">
              Ver Jornada
            </LinkPortal>
          </div>
          {achados.length === 0 ? (
            <p className="text-sm text-navy/60">
              Assim que a equipe publicar um achado ou atualização, ele aparece aqui.
            </p>
          ) : (
            <div className="space-y-2">
              {achados.map((a) => (
                <LinkPortal key={a.id} to={a.destino} className="block">
                  <CaCard className="flex items-start justify-between gap-2 border-l-4 border-l-gold p-3 transition-colors hover:border-gold">
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <Search className="h-3 w-3 text-gold" aria-hidden="true" />
                        <span className="text-[10px] font-medium uppercase tracking-widest text-gold">{a.tipo}</span>
                      </div>
                      <p className="line-clamp-2 text-sm text-navy/85">{a.texto}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-navy/40" aria-hidden="true" />
                  </CaCard>
                </LinkPortal>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
