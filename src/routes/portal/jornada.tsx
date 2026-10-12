import { BookOpen } from "lucide-react";
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
import { jornadaSanitizada, publicacoesDeEntrega, publicacoesDeFase01, publicacoesDeFase02, ROTULOS_ETAPA_CLIENTE } from "@/lib/portal-dados-vivos";
import { ehPessoaPublicada, type PublicacaoCliente } from "@/lib/projecoes-cliente";
import { cn } from "@/lib/utils";
import { textoParaCliente } from "@/lib/portal-linguagem-viva";
import { KitBadge } from "@/components/clube-ancestral-kit/base";

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
    titulo: item.tipo === "microentrega" ? "Da nossa jornada" : item.tipo === "linha_tempo" ? "Marco da história" : item.tipoRotulo,
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
    <div className="border-t border-border py-3">
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
  return (
    <div className="app-jornada-linha min-w-0" data-linha-tom={variante}>
      <div className={cn("h-1 w-full", variante === "gold" ? "bg-gold" : "bg-navy")} aria-hidden="true" />
      <div className="py-4">
      <h2 className="mb-3 font-serif text-xl text-navy">{eyebrow}</h2>
      {eventos.length === 0 ? (
        <div><p className="py-3 text-sm leading-relaxed text-navy/60">
          {variante === "gold"
            ? "As histórias das gerações anteriores aparecerão aqui quando estiverem prontas para a família."
            : "Os próximos passos aparecerão aqui quando estiverem prontos para compartilhar."}
        </p><p className="app-estado-editorial mt-2">Em pesquisa</p></div>
      ) : (
        <div className="relative">
          <div className={cn("app-jornada-fio absolute inset-y-0 left-0 w-0.5 rounded-full", variante === "gold" ? "bg-gold" : "bg-navy")} aria-hidden="true" />
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
                <div className="app-jornada-data">
                  <KitBadge tone={no.categoria === "navy" ? "neutral" : "gold"}>
                  {no.rotuloCategoria}
                  {no.dataPrincipal ? ` · ${no.dataPrincipal}` : ""}
                  </KitBadge>
                </div>
                <div className="app-jornada-evento">
                  <h3 className="font-serif text-xl text-navy">{no.titulo}</h3>
                  <p className="mt-0.5 text-sm text-navy/70">{no.conteudo}</p>
                </div>
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
  return (
    <div className="app-jornada-uniao app-uniao-ramos relative py-5" data-uniao-ramos>
      <p className="text-[10px] font-semibold uppercase tracking-widest">Momentos de União</p>
      <h3 className="mt-1 font-serif text-xl">União de Ramos</h3>
      {pontes.length > 0 ? (
        <ul className="mt-1.5 space-y-1.5">
          {pontes.map((p, i) => <li key={i} className="text-sm leading-relaxed text-navy/75">{p.texto}</li>)}
        </ul>
      ) : (
        <div><p className="mt-1.5 text-sm leading-relaxed text-navy/60">Os encontros da história da família aparecerão aqui quando forem compartilhados.</p><p className="app-estado-editorial mt-2">Em pesquisa</p></div>
      )}
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

    const abreJornada = (r: typeof entrega.visibilidade) => r.estado === "released";

  return (
    <PortalShell titulo="Nossa jornada" descricao={COPY_TELAS.jornada.descricao}>
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
            const temMateriais = publicacoesDeEntrega(vivo.projecoes).length > 0;
            const temFase01 = publicacoesDeFase01(vivo.projecoes).length > 0;
            const temFase02 = publicacoesDeFase02(vivo.projecoes).length > 0;
            const destino = vivo.proximaAcao?.destino ?? null;
            const ritmoRotulo =
              jornada.ritmo === "sem_publicacao"
                 ? "Estamos preparando os primeiros passos para compartilhar com você"
                : jornada.ritmo === "regular"
                   ? "Veja os trechos já compartilhados com sua família"
                  : jornada.ritmo === "atencao"
                    ? "Próxima atualização em preparação"
                     : "A próxima atualização será compartilhada quando estiver pronta";
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
                  /*
                   * Retificação de 07/10/2026: pessoa publicada na árvore não é
                   * acontecimento. Um nome com geração não virou fato histórico
                   * só por existir — quem lista nome e vínculo é a Árvore.
                   *
                   * Recorte por PESSOA, não por tipo: o Lovable chegou à mesma
                   * conclusão excluindo `tipo !== "arvore"` inteiro, mas isso
                   * derrubaria também a nota de árvore que É acontecimento
                   * documentado — e a retificação pede justamente que "evento
                   * autorizado com data/precisão/local" entre na Linha
                   * Ancestral. Fora fica só o nó de pessoa.
                   */
                  .filter((item) => !ehPessoaPublicada(item))
                  .sort((a, b) => new Date(a.publicadoEm ?? 0).getTime() - new Date(b.publicadoEm ?? 0).getTime())
                  .map(noRealDeItem);

            // Marcos aprovados para a família também pertencem à linha viva.
            // Não duplicar uma publicação que já traz o mesmo texto.
            if (!ehDemo) {
              for (const marco of vivo.historico ?? []) {
                const texto = textoParaCliente(marco.texto);
                if (!texto || nos.some((no) => no.tipo === "evento" && no.conteudo === texto)) continue;
                nos.push({
                  tipo: "evento",
                  id: `marco-${marco.id}`,
                  categoria: "navy",
                  rotuloCategoria: "Marco compartilhado",
                  dataPrincipal: marco.data ? dataCurta(marco.data) : null,
                  titulo: "Marco da jornada",
                  conteudo: texto,
                });
              }
            }

            /*
              União de Ramos: vínculo explícito por id — nunca por proximidade
              de data, nome parecido ou sobrenome em comum.

              03/10/2026: para o cliente REAL, as pontes vêm de
              `jornada.pontes` (projeções `uniao_ramos` publicadas pelo Desk,
              com as duas pontas em `source_entity_id`/`vinculo_projecao_id`).
              Antes só existia o par fixo da demo, então a ponte nunca
              aparecia para cliente real, mesmo com o campo de vínculo já no
              banco. A demo segue com o roteiro editorial próprio.
            */
            if (ehDemo) {
              const temHistoria = jornada.linha.some((i) => i.id === UNIAO_DE_RAMOS_DEMO_SOPHIA.historiaProjecaoId);
              const temCaso = jornada.linha.some((i) => i.id === UNIAO_DE_RAMOS_DEMO_SOPHIA.casoProjecaoId);
              if (temHistoria && temCaso) {
                // Roteiro editorial: a ponte entra após o 3º evento (posição 4 do roteiro).
                nos.splice(3, 0, { tipo: "ponte", texto: UNIAO_DE_RAMOS_DEMO_SOPHIA.legenda });
              }
            } else {
              // Ordem decrescente de posição: inserir de baixo para cima mantém
              // os índices das pontes seguintes válidos.
              const inserir = jornada.pontes
                .map((ponte) => ({
                  ponte,
                  idx: nos.findIndex((n) => n.tipo === "evento" && n.id === ponte.historiaProjecaoId),
                }))
                .filter((x) => x.idx !== -1)
                .sort((a2, b2) => b2.idx - a2.idx);
              for (const { ponte, idx } of inserir) {
                nos.splice(idx + 1, 0, { tipo: "ponte", texto: ponte.legenda });
              }
            }


             // Nó final: apenas quando a próxima ação tem destino liberado.
            // Ajuste 2026-09-12: CTA nomeia a rota real em vez de "Abrir" genérico.
            if (destino) nos.push({
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

            // P3 (25/09/2026): próxima entrega — só a data sanitizada que a
            // view portal_casos projeta; nenhum título ou detalhe interno.
            if (vivo.proximaEntrega) {
              nos.push({
                tipo: "evento",
                id: "__proxima_entrega__",
                categoria: "navy",
                rotuloCategoria: "Próxima entrega",
                dataPrincipal: vivo.proximaEntrega.data.split("-").reverse().join("/"),
                titulo: "Próxima entrega",
                conteudo: vivo.proximaEntrega.texto,
                destino: null,
              });
            }

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
                <div className="app-v11-secoes pb-6 lg:pb-0" data-aba-jornada>
                  <nav aria-label="Linhas da jornada" className="sticky top-0 z-10 grid grid-cols-3 gap-2 border-b border-border bg-cream py-2 sm:static">
                    <a href="#linha-origem" className="flex min-h-11 items-center justify-center border-b-2 border-gold text-sm font-medium text-navy">Origem</a>
                    <a href="#linha-processo" className="flex min-h-11 items-center justify-center border-b-2 border-navy text-sm font-medium text-navy">Processo</a>
                    <a href="#linha-memoria" className="flex min-h-11 items-center justify-center border-b-2 border-plum text-sm font-medium text-navy">Memória</a>
                  </nav>
                  {jornada.linha.length === 0 && (vivo.historico ?? []).length === 0 ? (
                    /*
                      FIDELIDADE-VISUAL-2026-09-23: estado vazio não mostra o
                      painel administrativo (Caso/Composição/Marcos/Ritmo/
                      Atualizações) nem a trilha de 8 bolhas sem rótulo — só o
                      bloco narrativo aprovado: etapa, próxima atualização e o
                      estado vazio de publicação por linha.
                    */
                     <div data-jornada-vazio className="space-y-5">
                       <div data-jornada-narrativa-vazia className="app-v11-abertura text-cream">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Nossa jornada</p>
                         <h2 className="mt-1 font-serif text-2xl text-cream">Uma história começando a ganhar forma</h2>
                         <p className="mt-2 text-sm leading-relaxed text-cream/80">{ritmoRotulo}</p>
                      </div>
                        <div data-jornada-duas-linhas className="relative grid gap-5 pl-6 sm:grid-cols-2 sm:gap-6">
                         <span aria-hidden="true" className="absolute bottom-5 left-2 top-5 w-0.5 bg-gold/70" />
                          <section id="linha-origem" className="relative scroll-mt-20 py-4">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-gold bg-cream" />
                           <h2 className="font-serif text-xl text-navy">Linha Ancestral</h2>
                           <p className="mt-2 text-sm leading-relaxed text-navy/60">As histórias das gerações anteriores aparecerão aqui quando estiverem prontas para a família.</p>
                            <p className="app-estado-editorial mt-2">Em pesquisa</p>
                         </section>
                          <div className="relative sm:order-2 sm:col-span-2">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-gold bg-cream" />
                           <MomentosDeUniao pontes={pontes} />
                         </div>
                          <section id="linha-processo" className="relative scroll-mt-20 py-4 sm:col-start-2 sm:row-start-1">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-navy bg-cream" />
                           <h2 className="font-serif text-xl text-navy">Linha do Processo</h2>
                           <p className="mt-2 text-sm leading-relaxed text-navy/60">Os próximos passos aparecerão aqui quando estiverem prontos para compartilhar.</p>
                            <p className="app-estado-editorial mt-2">Em pesquisa</p>
                         </section>
                          <section id="linha-memoria" className="relative scroll-mt-20 border-t border-border py-4 sm:order-4 sm:col-span-2">
                            <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-plum bg-cream" />
                            <h2 className="flex items-center gap-2 font-serif text-xl text-navy"><BookOpen className="h-5 w-5" aria-hidden="true" />Memória</h2>
                            <p className="mt-2 text-sm leading-relaxed text-navy/60">As histórias e os materiais de memória aparecerão aqui quando forem compartilhados com a família.</p>
                          </section>
                      </div>
                    </div>
                  ) : (
                    <>
                       <div className="app-v11-abertura text-cream">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Nossa jornada</p>
                         <h2 className="mt-1 font-serif text-2xl text-cream">Uma história começando a ganhar forma</h2>
                         <p className="mt-2 text-sm leading-relaxed text-cream/80">{vivo.composicao ?? "A história da sua família"} · {ritmoRotulo}</p>
                      </div>
                        <div data-jornada-duas-linhas className="relative grid gap-5 pl-6 sm:grid-cols-2 sm:gap-6">
                         <span aria-hidden="true" className="absolute bottom-5 left-2 top-5 w-0.5 bg-gold/70" />
                          <div id="linha-origem" className="relative min-w-0 scroll-mt-20">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-gold bg-cream" />
                          <TimelineVertical eventos={linhaAncestral} eyebrow="Linha Ancestral" variante="gold" />
                        </div>
                          <div className="relative sm:order-2 sm:col-span-2">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-gold bg-cream" />
                           <MomentosDeUniao pontes={pontes} />
                         </div>
                          <div id="linha-processo" className="relative min-w-0 scroll-mt-20 sm:col-start-2 sm:row-start-1">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-navy bg-cream" />
                          <TimelineVertical eventos={linhaProcesso} eyebrow="Linha do Processo" variante="navy" />
                            {passoAtualIndice !== null ? (
                              <div className="mt-3"><TrilhaCompacta passos={passos} passoAtualIndice={passoAtualIndice} /></div>
                            ) : null}
                        </div>
                         <section id="linha-memoria" className="relative scroll-mt-20 border-t border-border py-4 sm:order-4 sm:col-span-2">
                           <span aria-hidden="true" className="absolute -left-[23px] top-6 h-3 w-3 rounded-full border-2 border-plum bg-cream" />
                           <h2 className="flex items-center gap-2 font-serif text-xl text-navy"><BookOpen className="h-5 w-5" aria-hidden="true" />Memória</h2>
                           <p className="mt-2 text-sm leading-relaxed text-navy/75">As histórias e os materiais de memória compartilhados com sua família ficam reunidos no Legado.</p>
                           <LinkPortal to="/portal/legado" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-navy underline decoration-gold underline-offset-4">Ver o Legado</LinkPortal>
                         </section>
                      </div>
                    </>
                  )}

                   {((abreJornada(entrega.visibilidade) && temMateriais) ||
                     (abreJornada(fase1.visibilidade) && temFase01) ||
                     (abreJornada(fase2.visibilidade) && temFase02)) && (
                    <p className="text-[11px] text-navy/50">
                      Material publicado:{" "}
                       {abreJornada(entrega.visibilidade) && temMateriais ? (
                        <LinkPortal to="/portal/entregas" className="underline underline-offset-2 hover:text-navy/70">
                          ver materiais liberados
                        </LinkPortal>
                      ) : null}
                       {abreJornada(entrega.visibilidade) && temMateriais && abreJornada(fase1.visibilidade) && temFase01 ? " · " : null}
                       {abreJornada(fase1.visibilidade) && temFase01 ? (
                        <LinkPortal to="/portal/fase-01" className="underline underline-offset-2 hover:text-navy/70">
                          ver relatório preparado
                        </LinkPortal>
                      ) : null}
                       {((abreJornada(entrega.visibilidade) && temMateriais) || (abreJornada(fase1.visibilidade) && temFase01)) &&
                       abreJornada(fase2.visibilidade) && temFase02
                        ? " · "
                        : null}
                       {abreJornada(fase2.visibilidade) && temFase02 ? (
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
