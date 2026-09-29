import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { COPY_TELAS } from "@/lib/portal-copy";
import {
  FASES_JORNADA_DEMO,
  FASE_ATUAL_DEMO_SOPHIA_INDICE,
  FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL,
} from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { LinkPortal, usePreviaPortal, usePortalVivo } from "@/components/portal/fonte-portal";
import { meusCasos } from "@/lib/portal-cliente.functions";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada, ROTULOS_ETAPA_CLIENTE } from "@/lib/portal-dados-vivos";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
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
  // Qual caso a leitura de fato usou — o servidor decide (pedido da URL, ou o
  // primeiro autorizado), e a Home segue essa decisão em vez de recalcular.
  const casoIdAtivo = vivo.data?.casoAtivoId ?? null;
  const etapa = vivo.data?.etapa ?? null;
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
            proximoPasso={jornada.proximoPasso}
            proximoPassoDestino={vivo.data?.proximaAcao?.destino ?? null}
            proximaEntrega={vivo.data?.proximaEntrega?.texto ?? null}
            marcos={jornada.marcosPublicados}
            achados={jornada.linha.slice(0, 3).map((item) => ({
              id: item.id,
              tipo: item.tipoRotulo,
              destino: destinoPorTipo(item.tipo),
              texto: item.conteudo,
              ano: item.publicadoEm ? item.publicadoEm.slice(0, 4) : null,
            }))}
            fase={
              // Progresso fixo pertence só ao caso de demonstração. Num caso
              // real aberto pelo acesso master, inventar fase seria dado falso.
              previa.identidade && previa.identidade.fonte !== "demo"
                ? null
                : {
                    rotulos: FASES_JORNADA_DEMO,
                    indice: FASE_ATUAL_DEMO_SOPHIA_INDICE,
                    percentual: FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL,
                    valor: `${FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL}%`,
                  }
            }

          />
        )}
      </PortalShell>
    );
  }

  return (
    <PortalShell titulo={COPY_TELAS.home.titulo} descricao={COPY_TELAS.home.descricao}>
      <EstadoDados
          superficie="app"
        carregando={isLoading || vivo.isLoading}
        erro={error}
        dados={data}
        aoTentarNovamente={() => void refetch()}
        recurso="o painel do seu caso"
        vazio={COPY_TELAS.home.vazio}
      >
        {(casos) => {
          /*
            21/09/2026 — era `casos[0]`: o cliente com mais de um caso via
            sempre o primeiro, sem escolha e sem como trocar. O caso ativo
            agora vem da URL; sem parâmetro, o primeiro continua sendo o
            padrão, mas agora é uma escolha visível e trocável.
          */
          const principal = casos.find((c) => c.id === casoIdAtivo) ?? casos[0];
          const outros = casos.filter((c) => c.id !== principal?.id);
          if (!principal) {
            return <p className="text-sm text-navy/70">{COPY_TELAS.home.vazio}</p>;
          }
          return (
            <div className="space-y-4">
              <PainelHomeMockup
                tituloCaso={principal.titulo}
                proximoPasso={principal.proximoPasso || jornada.proximoPasso}
                proximoPassoDestino={principal.proximoPassoDestino}
                proximaEntrega={vivo.data?.proximaEntrega?.texto ?? null}
                marcos={jornada.marcosPublicados}
                casoId={principal.id}
                achados={jornada.linha.slice(0, 3).map((item) => ({
                  id: item.id,
                  tipo: item.tipoRotulo,
                  destino: destinoPorTipo(item.tipo),
                  texto: item.conteudo,
                  ano: item.publicadoEm ? item.publicadoEm.slice(0, 4) : null,
                }))}
                composicao={vivo.data?.composicao ?? null}
                fase={
                  /*
                    Etapa real do caso, vinda de `case_plans.fase_jornada` pela
                    view `portal_casos`. Sem plano ativo, `etapa` é nula e o
                    cartão volta à contagem de marcos publicados — o estado
                    honesto de antes, nunca uma etapa inventada.
                  */
                  etapa
                    ? {
                        rotulos: ROTULOS_ETAPA_CLIENTE,
                        indice: etapa.posicao - 1,
                        percentual: Math.round(etapa.fracao * 100),
                        valor: `Etapa ${etapa.posicao} de ${etapa.total}`,
                        compacto: true,
                      }
                    : null
                }
              />
              {outros.length > 0 ? (
                <section className="space-y-2">
                  <h2 className="text-xs font-medium uppercase tracking-wide text-navy/50">
                    Outros acompanhamentos
                  </h2>
                  <ul className="space-y-2">
                    {outros.map((c) => (
                      <li key={c.id}>
                        {/* Troca o caso ativo de todo o App, em vez de abrir
                            uma rota profunda: é daqui que o cliente escolhe
                            qual acompanhamento as 7 abas mostram. */}
                        <Link
                          to="/portal"
                          search={{ casoId: c.id }}
                          className="block rounded-xl border border-navy/10 bg-cream/50 px-4 py-3 hover:border-gold"
                        >
                          <p className="font-serif text-base text-navy">{c.titulo}</p>
                          <p className="text-xs text-navy/60">{c.statusRotulo} · ver este acompanhamento</p>
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
  valor,
  compacto = false,
}: {
  rotulos: readonly string[];
  indice: number;
  percentual: number;
  /**
   * O que aparece à direita de "Progresso da jornada". A demo mostra o
   * percentual do mockup; um caso real mostra a posição no catálogo de fases,
   * porque o De-Para §3 ("o que fica oculto") veda percentual inferido.
   */
  valor: string;
  /**
   * Caso real: 8 fases não cabem com rótulo embaixo de cada passo a 375px.
   * Os passos viram só números e o nome da etapa atual sobe para uma linha
   * própria — mesma composição do mockup, legível no telefone.
   */
  compacto?: boolean;
}) {
  const rotuloAtual = rotulos[indice];
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs text-cream/70">
        <span>Progresso da jornada</span>
        <span className="font-semibold text-gold">{valor}</span>
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
              {compacto ? null : (
                <span className={cn("text-center text-[8px] leading-tight", atual ? "text-gold" : "text-cream/50")}>
                  {rotulo}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {rotuloAtual ? (
        <p className={compacto ? "mt-2 text-sm text-cream" : "sr-only"}>
          {compacto ? <span className="text-cream/60">Etapa atual: </span> : "Etapa atual: "}
          {rotuloAtual}
        </p>
      ) : null}
    </div>
  );
}

function PainelHomeMockup({
  tituloCaso,
  statusTexto,
  proximoPasso,
  proximoPassoDestino,
  proximaEntrega,
  marcos,
  casoId,
  achados,
  fase,
  composicao,
}: {
  tituloCaso: string;
  statusTexto?: string;
  proximoPasso: string;
  proximoPassoDestino?: string | null;
  /** P3: só a data sanitizada da próxima entrega (portal_casos). */
  proximaEntrega?: string | null;
  marcos: number;
  casoId?: string;
  achados: Array<{
    id: string;
    tipo: string;
    destino: "/portal/jornada" | "/portal/arvore" | "/portal/documentos" | "/portal/legado";
    texto: string;
    ano?: string | null;
  }>;
  /**
   * 21/09/2026: deixou de ser exclusivo da demo. A view `portal_casos` passou
   * a projetar `case_plans.fase_jornada`, então um caso real tem etapa de
   * verdade — antes, a única fase possível era a fixa do caso de exemplo.
   */
  fase?: {
    rotulos: readonly string[];
    indice: number;
    percentual: number;
    valor: string;
    compacto?: boolean;
  } | null;
  /**
   * "Caso individual" / "Caso do casal" / "Caso da família". O caso é do
   * titular, do casal ou do núcleo, e o cliente lê isso no próprio cartão em
   * vez de deduzir pelo título. Vazio quando o plano ainda não declarou.
   */
  composicao?: string | null;
}) {
  return (
    <div className="space-y-4" data-aba-home>
      {/*
        Correção 2026-09-12: um card navy só, sem cartão bege duplicado
        antes dele nem cartão cinza/claro dentro dele (o chip de
        identidade do caso continua no DOM para prova App↔Desk, só não
        aparece mais visualmente aqui).
      */}
      {/* 16/09/2026 — primeira dobra: o cartão do processo é o elemento
          principal (maior), e a linha do tempo abaixo fica discreta. */}
      <section className="relative overflow-hidden rounded-2xl border-b-2 border-gold/70 bg-navy-800 p-6 text-cream shadow-md sm:p-8">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">Acompanhamento da família</p>
          <h2 className="mt-2 font-serif text-[1.9rem] leading-tight text-cream sm:text-4xl">Uma história em construção</h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/80 sm:text-base">
            {tituloCaso}
            {composicao ? <span className="text-cream/60"> · {composicao}</span> : null}
          </p>
        </div>

        {fase ? (
          <EstepeJornada
            rotulos={fase.rotulos}
            indice={fase.indice}
            percentual={fase.percentual}
            valor={fase.valor}
            compacto={fase.compacto ?? false}
          />
        ) : (
          <p className="mt-4 border-t border-cream/10 pt-4 text-sm leading-relaxed text-cream/70">
            {marcos === 0
              ? "Estamos reunindo as primeiras memórias da sua família com calma e cuidado."
              : `${marcos} ${marcos === 1 ? "momento já compartilhado" : "momentos já compartilhados"} com você`}
          </p>
        )}
      </section>

      <div className="space-y-8 pt-2">
        <section aria-label="Próxima ação">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold">Próxima ação</p>
          <h3 className="mb-3 font-serif text-2xl text-navy">O que vem agora</h3>
          <CaCard>
            <p className="whitespace-pre-line text-sm leading-relaxed text-navy/80">{proximoPasso}</p>
            {proximaEntrega ? (
              <p className="mt-2 text-xs text-navy/70" data-proxima-entrega>
                {proximaEntrega}
              </p>
            ) : null}
            {proximoPassoDestino ? (
              <LinkPortal
                to={proximoPassoDestino}
                className="mt-3 inline-block text-xs font-medium text-terracotta underline-offset-2 hover:underline"
              >
                {proximoPassoDestino.includes("documentos") ? "Ver documentos solicitados" : "Ver próxima ação"}
              </LinkPortal>
            ) : casoId ? (
              <Link
                to="/portal/casos/$id"
                params={{ id: casoId }}
                className="mt-3 inline-block text-xs font-medium text-terracotta underline-offset-2 hover:underline"
              >
                Acompanhar sua jornada
              </Link>
            ) : null}
          </CaCard>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h3 className="font-serif text-2xl text-navy">Achados da sua história</h3>
            <LinkPortal to="/portal/jornada" className="shrink-0 text-xs font-medium text-navy/60 underline-offset-2 hover:text-navy hover:underline">
              Ver Jornada
            </LinkPortal>
          </div>
          {achados.length === 0 ? (
            <p className="font-serif text-base italic leading-relaxed text-navy/60">
              As descobertas confirmadas pela equipe aparecerão aqui, com todo o cuidado que a sua história merece.
            </p>
          ) : (
            <div className="space-y-3">
              {achados.slice(0, 3).map((a) => {
                const [titulo, ...resto] = a.texto.split(/(?<=[.!?])\s+/);
                const resumo = resto.join(" ");
                return (
                  <LinkPortal key={a.id} to={a.destino} className="block">
                    <CaCard className="border-l-2 border-l-gold transition-colors hover:border-gold">
                      <div className="flex items-baseline gap-3">
                        {a.ano ? <span className="font-serif text-2xl leading-none text-gold">{a.ano}</span> : null}
                        <span className="text-[10px] font-medium uppercase tracking-widest text-navy/55">{a.tipo}</span>
                      </div>
                      <p className="mt-2 font-serif text-lg leading-snug text-navy">{titulo}</p>
                      {resumo ? <p className="mt-1 line-clamp-2 text-sm text-navy/70">{resumo}</p> : null}
                    </CaCard>
                  </LinkPortal>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
