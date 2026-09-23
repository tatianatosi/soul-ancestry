import { createFileRoute } from "@tanstack/react-router";
import { COPY_TELAS } from "@/lib/portal-copy";
import {
  ORDEM_NARRATIVA_DEMO_SOPHIA,
  PASSO_CASO_ATUAL_DEMO_SOPHIA_INDICE,
  UNIAO_DE_RAMOS_DEMO_SOPHIA,
} from "@/lib/portal-demo-sophia";
import { PortalShell, PortalCarregando } from "@/components/portal/portal-shell";
import { BlocoVisibilidade, useVisibilidade } from "@/components/portal/portal-visibilidade";
import { LinkPortal, usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { EstadoDados } from "@/components/saas/estado-dados";
import { jornadaSanitizada, ROTULOS_ETAPA_CLIENTE } from "@/lib/portal-dados-vivos";
import type { PublicacaoCliente } from "@/lib/projecoes-cliente";
import { cn } from "@/lib/utils";

const TIPOS_HISTORIA = new Set(["arvore", "achado", "evidencia", "linha_tempo", "legado"]);

const PASSOS_CASO = ["Onboarding", "Pesquisa", "Documentos", "Validação", "Entrega"] as const;

function dataCurta(iso: string | null): string {
  if (!iso) return "sem data";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Ano histórico citado LITERALMENTE no texto já publicado (nunca a data de
 * publicação). Correção 2026-09-12: publicadoEm é quando a equipe publicou,
 * não quando o fato ancestral aconteceu — só um ano real no próprio
 * conteúdo qualifica um evento como "Passado" datado.
 */
function anoHistoricoCitado(conteudo: string): number | null {
  const m = conteudo.match(/\b(1[5-9]\d{2}|20[0-2]\d)\b/);
  return m ? Number(m[0]) : null;
}

type NoEvento = {
  tipo: "evento";
  id: string;
  categoria: "gold" | "gold-soft" | "navy";
  rotuloCategoria: string;
  dataPrincipal: string | null;
  dataSecundaria?: string | null;
  titulo: string;
  conteudo: string;
  destino?: string | null;
  rotuloCta?: string;
};
type NoPonte = { tipo: "ponte"; texto: string };
type No = NoEvento | NoPonte;

/** Nó genérico para cliente real: categoria por tipo, data só quando honesta. */
function noRealDeItem(item: PublicacaoCliente): NoEvento {
  const historico = TIPOS_HISTORIA.has(item.tipo);
  const ano = historico ? anoHistoricoCitado(item.conteudo) : null;
  return {
    tipo: "evento",
    id: item.id,
    categoria: historico ? "gold" : "navy",
    rotuloCategoria: historico ? "Passado" : "Presente",
    dataPrincipal: historico ? (ano ? String(ano) : null) : dataCurta(item.publicadoEm),
    titulo: item.tipoRotulo,
    conteudo: item.conteudo,
  };
}

/**
 * Roteiro editorial da demo (correção 2026-09-12, Timeline Vertical): ordem
 * e tratamento por item aprovados pela Proprietária — não é regra geral,
 * só existe para o caso Sophia Piccoli. "Documento analisado" mostra 1897
 * porque seu próprio texto confirma a filiação do mesmo registro de
 * batismo; a data de publicação vira metadado secundário discreto.
 */
function noDemoDeItem(item: PublicacaoCliente): NoEvento {
  switch (item.id) {
    case "demo-sophia-03":
      return {
        tipo: "evento",
        id: item.id,
        categoria: "gold",
        rotuloCategoria: "Passado",
        dataPrincipal: "1897",
        titulo: item.tipoRotulo,
        conteudo: item.conteudo,
      };
    case "demo-sophia-04":
      return {
        tipo: "evento",
        id: item.id,
        categoria: "gold",
        // Ajuste 2026-09-12: "Documento histórico" no lugar de "Passado" —
        // explica por que o documento é histórico, em vez de repetir o
        // rótulo genérico da categoria.
        rotuloCategoria: "Documento histórico",
        dataPrincipal: "1897",
        dataSecundaria: `publicado em ${dataCurta(item.publicadoEm)}`,
        titulo: item.tipoRotulo,
        conteudo: item.conteudo,
      };
    case "demo-sophia-05":
      return {
        tipo: "evento",
        id: item.id,
        categoria: "gold",
        rotuloCategoria: "Passado",
        dataPrincipal: null,
        titulo: item.tipoRotulo,
        conteudo: item.conteudo,
      };
    case "demo-sophia-07":
      return {
        tipo: "evento",
        id: item.id,
        categoria: "gold-soft",
        rotuloCategoria: "Conteúdo",
        dataPrincipal: dataCurta(item.publicadoEm),
        titulo: item.tipoRotulo,
        conteudo: item.conteudo,
      };
    default:
      return noRealDeItem(item);
  }
}

function ChipMeta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">{rotulo}</p>
      <p className="mt-0.5 text-sm text-navy">{valor}</p>
    </div>
  );
}

/**
 * A linha do processo da Jornada (mockup 2/7, De-Para §4 linha 2).
 *
 * 21/09/2026: `passos` passou a ser parâmetro. Antes era sempre a lista fixa
 * `PASSOS_CASO`, e `passoAtualIndice` era nulo para todo cliente real — a
 * linha existia sem etapa ativa nenhuma, porque a fase do caso não chegava ao
 * App. Agora um caso real usa as 8 fases canônicas com rótulo de cliente; a
 * demo continua com o roteiro editorial dela.
 *
 * DIVERGÊNCIA REGISTRADA (§29): o mockup nomeia cinco passos (Kickoff, Coleta
 * inicial, Reconstrução de linhagem, Validação consular, Requerimento final),
 * o De-Para §4 nomeia quatro (Início, Pesquisa, Conferência, Entrega) e o dado
 * real tem oito fases. Nenhum de-para 8→5 ou 8→4 foi aprovado, então a linha
 * usa a fase real em vez de escolher uma das três listas por conta própria.
 */
function TrilhaCompacta({
  passos,
  passoAtualIndice,
}: {
  passos: readonly string[];
  passoAtualIndice: number | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex items-center">
        {passos.map((passo, i) => {
          const concluido = passoAtualIndice !== null && i < passoAtualIndice;
          const atual = passoAtualIndice !== null && i === passoAtualIndice;
          return (
            <div key={passo} className="flex flex-1 items-center">
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[8px] font-bold",
                  concluido && "bg-gold/30 text-navy",
                  atual && "bg-gold text-navy",
                  !concluido && !atual && "bg-navy/10 text-navy/45",
                )}
              >
                {i + 1}
              </span>
              {i < passos.length - 1 ? <span className="mx-1 h-px flex-1 bg-navy/10" aria-hidden="true" /> : null}
            </div>
          );
        })}
      </div>
      <div className="mt-1 hidden sm:flex">
        {passos.map((passo, i) => {
          const atual = passoAtualIndice !== null && i === passoAtualIndice;
          return (
            <span
              key={passo}
              className={cn(
                "flex-1 text-center text-[8px] leading-tight",
                atual ? "font-semibold text-navy" : "text-navy/50",
              )}
            >
              {passo}
            </span>
          );
        })}
      </div>
      {/* Ajuste 2026-09-12: microtexto explícito — o dourado sozinho não deixava claro que é a etapa atual. */}
      {passoAtualIndice !== null ? (
        <p className="mt-2 text-center text-[10px] text-navy/55">
          Você está aqui: <span className="font-semibold text-navy">{passos[passoAtualIndice]}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * Cor do nó na linha contínua (correção 2026-09-12, acabamento): passado
 * dourado suave -> dourado -> transição na União de Ramos -> presente navy
 * médio -> navy profundo na próxima ação; Legado volta a dourado suave.
 * Sem terracota/laranja/roxo — só os tokens Pantone já aprovados.
 */
function corDoNo(no: NoEvento, ultimo: boolean): string {
  if (no.categoria === "gold-soft") return "var(--gold-soft)";
  if (no.categoria === "gold") return "var(--gold)";
  return ultimo ? "var(--navy)" : "var(--navy-800)";
}

/**
 * Uma coluna da timeline (só eventos, sem ponte — a ponte agora é o
 * conector "MOMENTOS DE UNIÃO" entre as duas colunas, não um item
 * misturado na mesma lista).
 */
function TimelineVertical({
  eventos,
  eyebrow,
  variante = "navy",
}: {
  eventos: NoEvento[];
  eyebrow: string;
  variante?: "gold" | "navy";
}) {
  const paradas = eventos.map((no, i) => {
    const pct = eventos.length > 1 ? (i / (eventos.length - 1)) * 100 : 0;
    return `${corDoNo(no, i === eventos.length - 1)} ${pct}%`;
  });
  const gradiente = `linear-gradient(to bottom, ${paradas.join(", ")})`;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
      <div className={cn("h-1 w-full", variante === "gold" ? "bg-gold" : "bg-navy")} aria-hidden="true" />
      <div className="px-4 py-5 sm:px-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-navy/55">{eyebrow}</p>
      {eventos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-navy/15 bg-cream/50 px-3 py-4 text-center text-xs text-navy/50">
          Nada publicado nesta linha ainda.
        </p>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-0.5 rounded-full" style={{ background: gradiente }} aria-hidden="true" />
          <ol className="relative">
            {eventos.map((no, i) => (
              <li key={no.id} className="relative py-4 pl-5 last:pb-0 lg:py-6">
                <span
                  className={cn(
                    "absolute -left-[5px] top-5 h-2.5 w-2.5 rounded-full",
                    no.categoria === "gold" && "bg-gold",
                    no.categoria === "gold-soft" && "bg-gold/50",
                    no.categoria === "navy" && (no.id === "__agora__" ? "bg-navy" : "bg-navy-800"),
                  )}
                  aria-hidden="true"
                />
                <p
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wide",
                    no.categoria === "navy" ? "text-navy/60" : "text-gold",
                  )}
                >
                  {no.rotuloCategoria}
                  {no.dataPrincipal ? ` · ${no.dataPrincipal}` : ""}
                </p>
                <p className="text-sm font-medium text-navy">{no.titulo}</p>
                <p className="mt-0.5 text-sm text-navy/70">{no.conteudo}</p>
                {no.dataSecundaria ? <p className="mt-0.5 text-[10px] text-navy/40">{no.dataSecundaria}</p> : null}
                {no.destino ? (
                  <LinkPortal
                    to={no.destino}
                    className="mt-1 inline-block text-xs font-medium text-terracotta underline-offset-2 hover:underline"
                  >
                    {no.rotuloCta ?? "Ver próxima ação"}
                  </LinkPortal>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}
      </div>
    </div>
  );
}

/**
 * "MOMENTOS DE UNIÃO" (mockup 2/7) — conector explícito entre LINHA
 * ANCESTRAL e LINHA DO PROCESSO, em vez de um item misturado na mesma
 * lista (era o nó tipo "ponte" antes desta composição em duas colunas).
 */
function MomentosDeUniao({ pontes }: { pontes: NoPonte[] }) {
  if (pontes.length === 0) return null;
  return (
    <div className="relative rounded-2xl border border-gold/45 bg-linear-to-r from-gold/12 to-navy/5 px-4 py-4">
      <span className="mx-auto mb-2 block h-5 w-px bg-gold/50 sm:hidden" aria-hidden="true" />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/60">Momentos de União</p>
      <ul className="mt-1.5 space-y-1.5">
        {pontes.map((p, i) => (
          <li key={i} className="text-xs leading-relaxed text-navy/75">
            {p.texto}
          </li>
        ))}
      </ul>
      <span className="mx-auto mt-2 block h-5 w-px bg-navy/25 sm:hidden" aria-hidden="true" />
    </div>
  );
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
          superficie="app"
          carregando={isLoading}
          erro={isError ? (error ?? true) : null}
          dados={data ? [data] : null}
          aoTentarNovamente={refetch}
          recurso="o seu acompanhamento"
        >
          {([vivo]) => {
            const jornada = jornadaSanitizada(vivo.projecoes, new Date(), vivo.proximaAcao);
            const destino = vivo.proximaAcao?.destino ?? null;
            const casoCodigo = previa?.identidade?.codigo ?? "—";
            const ritmoRotulo =
              jornada.ritmo === "sem_publicacao"
                ? "Aguardando primeira publicação"
                : jornada.ritmo === "regular"
                  ? "Ritmo em dia"
                  : jornada.ritmo === "atencao"
                    ? "Próxima atualização em preparação"
                    : "Atualização em revisão";
            // Prévia não é sinônimo de demonstração: o acesso master abre caso
            // real. Roteiro editorial e passo fixo pertencem só ao caso demo.
            const ehDemo = Boolean(previa) && (previa?.identidade?.fonte ?? "demo") === "demo";
            // Caso real: a etapa vem de `case_plans.fase_jornada` pela view
            // `portal_casos`. Sem plano ativo, segue sem etapa destacada — o
            // estado honesto, nunca um passo escolhido a esmo.
            const passos = ehDemo ? PASSOS_CASO : ROTULOS_ETAPA_CLIENTE;
            const passoAtualIndice = ehDemo
              ? PASSO_CASO_ATUAL_DEMO_SOPHIA_INDICE
              : vivo.etapa
                ? vivo.etapa.posicao - 1
                : null;

            // Monta os nós: roteiro editorial na demo, ordem cronológica real no cliente real.
            const nos: No[] = ehDemo
              ? ORDEM_NARRATIVA_DEMO_SOPHIA.map((id) => jornada.linha.find((item) => item.id === id))
                  .filter((item): item is PublicacaoCliente => Boolean(item))
                  .map(noDemoDeItem)
              : [...jornada.linha]
                  .sort((a, b) => new Date(a.publicadoEm ?? 0).getTime() - new Date(b.publicadoEm ?? 0).getTime())
                  .map(noRealDeItem);

            // União de Ramos: vínculo explícito por id — nunca por proximidade de data.
            const temHistoria = jornada.linha.some((i) => i.id === UNIAO_DE_RAMOS_DEMO_SOPHIA.historiaProjecaoId);
            const temCaso = jornada.linha.some((i) => i.id === UNIAO_DE_RAMOS_DEMO_SOPHIA.casoProjecaoId);
            if (temHistoria && temCaso) {
              const ponte: No = { tipo: "ponte", texto: UNIAO_DE_RAMOS_DEMO_SOPHIA.legenda };
              if (ehDemo) {
                // Roteiro editorial: a ponte entra após o 3º evento (posição 4 do roteiro).
                nos.splice(3, 0, ponte);
              } else {
                const idx = nos.findIndex(
                  (n) => n.tipo === "evento" && n.id === UNIAO_DE_RAMOS_DEMO_SOPHIA.historiaProjecaoId,
                );
                if (idx !== -1) nos.splice(idx + 1, 0, ponte);
              }
            }


            // Nó final: próxima ação publicada, sempre presente (real ou demo).
            // Ajuste 2026-09-12: CTA nomeia a rota real em vez de "Abrir" genérico.
            nos.push({
              tipo: "evento",
              id: "__agora__",
              categoria: "navy",
              rotuloCategoria: "Presente",
              dataPrincipal: "Agora",
              titulo: "Próxima ação",
              conteudo: jornada.proximoPasso,
              destino,
              rotuloCta: destino?.includes("documentos") ? "Ver documentos solicitados" : "Ver próxima ação",
            });

            /*
              A2-JORNADA-DUAS-LINHAS (2026-09-23): mockup 2/7 mostra duas
              colunas paralelas — LINHA ANCESTRAL (história, dourado) ×
              LINHA DO PROCESSO (presente, navy) — com "MOMENTOS DE UNIÃO"
              como conector explícito entre as duas, não um item misturado
              na mesma lista cronológica única. A classificação por
              categoria (gold/gold-soft = história, navy = processo) já
              existia em `noRealDeItem`/`noDemoDeItem`; aqui só se separa
              o array único em três, sem recalcular nada.
            */
            const linhaAncestral = nos.filter(
              (n): n is NoEvento => n.tipo === "evento" && n.categoria !== "navy",
            );
            const linhaProcesso = nos.filter(
              (n): n is NoEvento => n.tipo === "evento" && n.categoria === "navy",
            );
            const pontes = nos.filter((n): n is NoPonte => n.tipo === "ponte");

            return (
              <BlocoVisibilidade visibilidade={visibilidade}>
                <div className="space-y-6 pb-6 lg:pb-0" data-aba-jornada>
                  <div
                    data-jornada-meta
                    className="flex flex-wrap gap-2 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <ChipMeta rotulo="Caso" valor={casoCodigo} />
                    {/*
                      22/09/2026 — a composição já chegava à Home e faltava
                      aqui. O caso é do titular, do casal ou da família, e a
                      Jornada é onde o cliente acompanha o processo: ler isso
                      nas duas telas é a mesma informação, com o mesmo
                      vocabulário. Sem composição declarada no plano, o chip
                      não aparece — nada de rótulo inventado.
                    */}
                    {vivo.composicao ? <ChipMeta rotulo="Composição" valor={vivo.composicao} /> : null}
                    <ChipMeta rotulo="Marcos" valor={String(jornada.marcosPublicados)} />
                    <ChipMeta rotulo="Ritmo" valor={ritmoRotulo} />
                    <ChipMeta
                      rotulo="Atualizações"
                      valor={jornada.linha.length === 0 ? "Nenhuma ainda" : `${jornada.linha.length} publicadas`}
                    />
                  </div>

                  <TrilhaCompacta passos={passos} passoAtualIndice={passoAtualIndice} />

                  {jornada.linha.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-navy/20 bg-cream/60 p-6 text-center text-sm text-navy/60">
                      {COPY_TELAS.jornada.vazio}
                    </p>
                  ) : (
                    <div data-jornada-duas-linhas className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                      <div className="order-2 sm:order-1 sm:col-span-2">
                        <MomentosDeUniao pontes={pontes} />
                      </div>
                      <div className="order-1 min-w-0 sm:order-2">
                        <TimelineVertical eventos={linhaAncestral} eyebrow="Linha Ancestral" variante="gold" />
                      </div>
                      <div className="order-3 min-w-0">
                        <TimelineVertical eventos={linhaProcesso} eyebrow="Linha do Processo" variante="navy" />
                      </div>
                    </div>
                  )}

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
