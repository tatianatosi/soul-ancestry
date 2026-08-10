import { useEffect, useState } from "react";
import { runCanvasAudit } from "@/lib/canvas-audit";

import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand";
import { RelatorioVisualTab } from "./relatorio-visual";
import { EntregaConsultivaTab } from "./entrega-consultiva";
import { EntregaModeloTab } from "./entrega-modelo";
import { modeloByCaso } from "@/data/caso-sophia";
import { RelatorioFase02 } from "./relatorio-fase02";
import { registroOuFallback } from "@/data/case-registry";
import { CASOS } from "@/data/casos";

/**
 * App Cliente — orientado por dados.
 *
 * Nenhum nome, país, documento, percentual ou texto de caso deve ser escrito
 * dentro deste arquivo: tudo vem de `activeCase`.
 * Para publicar outro cliente, duplique `src/data/caseTemplate.ts`, preencha e
 * troque a linha final de `src/data/activeCase.ts`.
 */
import { activeCase } from "@/data/activeCase";
import { toFichaPiloto } from "@/lib/caseAdapter";
import { limparLista } from "@/lib/client-copy";
import {
  EVIDENCE_LABEL,
  EVIDENCE_TOM,
  FALLBACK,
  STATUS_CASO_LABEL,
  lista,
  PROCURACAO_TEXTO_CLIENTE,
  CONTA_FALLBACK,
  CONTRATO_BASE_LABEL,
  DESPESAS_LABEL_CLIENTE,
  DESPESAS_TEXTO_CLIENTE,
  ORDEM_SERVICO_LABEL,
  documentoVisivel,
  produtoContratado,
  proximaEtapaCliente,
  REFERENCIA_CLIENTE,
  paisesComAderencia,
  preenchido,
  referenciaVisivel,
  rotaLabel,
  texto,
} from "@/lib/evidence";
import type { CaseData, PessoaBase } from "@/types/case";

import {
  Home,
  Route as RouteIcon,
  Radar,
  TreeDeciduous,
  FileText,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Users,
  User,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Search,
  UploadCloud,
  Clock,
  ClipboardList,
  Layers,
  MapPin,
  Compass,
} from "lucide-react";

type Tab =
  | "home"
  | "jornada"
  | "entrega"
  | "relatorio"
  | "fase02"
  | "radar"
  | "arvore"
  | "docs"
  | "biblio"
  | "conta";

const ETAPAS_CASO = ["novo", "em_leitura", "em_documentos", "em_upgrade"] as const;

export function ClienteApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [showConta, setShowConta] = useState(false);
  const caso = activeCase;
  const ficha = toFichaPiloto(caso);

  /** Casos legados da jornada seguem alimentando as fases 01 e 02. */
  const casoJornada = CASOS.find((c) => c.id === caso.geral.case_id) ?? CASOS[0];
  const modelo = modeloByCaso(casoJornada.id);
  const registro = registroOuFallback(
    casoJornada.id,
    caso.geral.cliente_nome,
    caso.rota.pais_principal,
    caso.geral.produto_atual,
  );

  useEffect(() => {
    const id = window.setTimeout(() => runCanvasAudit(), 400);
    return () => window.clearTimeout(id);
  }, [tab, showConta]);

  const wide = !showConta && (tab === "relatorio" || tab === "entrega" || tab === "fase02");

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[calc(100vh-52px)] w-full flex-col bg-cream transition-all",
        wide ? "max-w-6xl" : "max-w-md",
      )}
    >
      <header className="flex items-center justify-between border-b border-border/60 bg-navy px-5 py-4 text-cream">
        {showConta ? (
          <>
            <button
              onClick={() => setShowConta(false)}
              className="flex items-center gap-2 text-sm text-cream/80"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <div className="font-serif text-lg italic text-gold">Minha Conta</div>
            <div className="w-16" />
          </>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo size={36} showText={false} />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest text-gold/80">Bem-vinda</div>
                <div className="truncate font-serif text-lg italic">
                  {texto(
                    caso.geral.cliente_nome_exibicao || caso.geral.cliente_nome,
                    "Sua jornada",
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowConta(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold transition hover:bg-gold/30"
              aria-label="Minha Conta"
            >
              <User className="h-5 w-5" />
            </button>
          </>
        )}
      </header>

      <div data-print-hide className="border-b border-border bg-areia px-5 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-[11px] text-navy/70">Painel individual da sua jornada</div>
          <span className="shrink-0 rounded-full border border-navy/25 px-3 py-1 text-[11px] font-semibold text-navy">
            {STATUS_CASO_LABEL[caso.geral.status_caso]}
          </span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        {showConta || tab === "conta" ? (
          <ContaScreen caso={caso} />
        ) : (
          <>
            {tab === "home" && (
              <HomeTab
                caso={caso}
                ficha={ficha}
                onOpenRelatorio={() => setTab("relatorio")}
                onOpenEntrega={() => setTab("entrega")}
                onOpenFase02={() => setTab("fase02")}
                onOpenDocs={() => setTab("docs")}
                fase02Status={registro.phase2Status}
              />
            )}
            {tab === "jornada" && <JornadaTab caso={caso} />}
            {tab === "entrega" && (
              <PainelExpandido caso={caso} area="entrega">
                {modelo ? (
                  <EntregaModeloTab modelo={modelo} />
                ) : (
                  <EntregaConsultivaTab caso={casoJornada} />
                )}
              </PainelExpandido>
            )}
            {tab === "relatorio" && (
              <PainelExpandido caso={caso} area="fase1">
                <RelatorioVisualTab caso={casoJornada} />
              </PainelExpandido>
            )}
            {tab === "fase02" && (
              <PainelExpandido caso={caso} area="fase2">
                <RelatorioFase02 registro={registro} />
              </PainelExpandido>
            )}
            {tab === "radar" && <RotaTab caso={caso} />}
            {tab === "arvore" && <ArvoreTab caso={caso} />}
            {tab === "docs" && <DocsTab caso={caso} />}
            {tab === "biblio" && (
              <DescobertasTab caso={caso} onOpenRelatorio={() => setTab("relatorio")} />
            )}
          </>
        )}
      </main>

      <nav
        data-print-hide
        className={cn(
          "fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 border-t border-border bg-white/95 backdrop-blur",
          wide ? "max-w-6xl" : "max-w-md",
        )}
      >
        <div className="grid grid-cols-10">
          {(
            [
              ["home", Home, "Home"],
              ["jornada", RouteIcon, "Jornada"],
              ["entrega", Sparkles, "Entrega"],
              ["relatorio", ClipboardList, "Fase 01"],
              ["fase02", Layers, "Fase 02"],
              ["radar", Radar, "Radar"],
              ["arvore", TreeDeciduous, "Árvore"],
              ["docs", FileText, "Docs"],
              ["biblio", BookOpen, "Legado"],
              ["conta", User, "Conta"],
            ] as const
          ).map(([id, Icon, label]) => {
            const isActive =
              id === "conta" ? showConta || tab === "conta" : !showConta && tab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setShowConta(id === "conta");
                }}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                  isActive ? "text-navy" : "text-muted-foreground hover:text-navy",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-gold")} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* -------- PAINEL EXPANDIDO (somente Entregas, Fase 1 e Fase 2 em >=1024px) -------- */
function PainelExpandido({
  caso,
  area,
  children,
}: {
  caso: CaseData;
  area: "entrega" | "fase1" | "fase2";
  children: React.ReactNode;
}) {
  const pendentes = lista(caso.documentos.documentos_pendentes);
  const solicitados = lista(caso.documentos.proximas_solicitacoes);
  const localizados = limparLista(caso.documentos.documentos_localizados);
  const emValidacao = lista(caso.documentos.documentos_em_validacao);

  const blocos =
    area === "fase2"
      ? [
          { titulo: "Rota em leitura", itens: [rotaLabel(caso)] },
          { titulo: "Dependências", itens: pendentes },
          { titulo: "Próximos marcos", itens: solicitados },
        ]
      : area === "fase1"
        ? [
            { titulo: "Já localizados", itens: localizados },
            { titulo: "Em validação", itens: emValidacao },
            { titulo: "Ainda precisamos confirmar", itens: pendentes },
          ]
        : [
            {
              titulo: "Entregáveis em preparação",
              itens: [texto(caso.documentos.documento_principal, FALLBACK.semArquivo)],
            },
            { titulo: "Próximo passo", itens: solicitados },
          ];

  const visiveis = blocos.filter((b) => b.itens.length > 0);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6 lg:p-5">
      <div className="min-w-0">{children}</div>

      <aside data-print-hide className="space-y-4 p-5 lg:sticky lg:top-[76px] lg:p-0">
        <div className="rounded-2xl border border-navy/20 bg-navy p-4 text-cream">
          <div className="text-[11px] uppercase tracking-widest text-gold/80">
            Resumo do acompanhamento
          </div>
          <div className="mt-1 font-serif text-lg italic text-gold">
            {texto(caso.jornada.etapa_atual, FALLBACK.atualizacao)}
          </div>
          <div className="mt-3 rounded-lg bg-navy-soft/70 p-3 text-[12px]">
            <div className="text-cream/70">Pendência principal</div>
            <div className="font-semibold text-cream">
              {texto(caso.documentos.pendencia_principal, FALLBACK.atualizacao)}
            </div>
          </div>
        </div>

        {visiveis.map((b) => (
          <div key={b.titulo} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-widest text-terracotta">{b.titulo}</div>
            <ul className="mt-2 space-y-2">
              {b.itens.map((i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] leading-snug text-navy/80"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="rounded-2xl border border-border bg-areia p-4 text-[12px] leading-relaxed text-navy/70">
          {PROCURACAO_TEXTO_CLIENTE}
        </p>
      </aside>
    </div>
  );
}

/* -------- componentes auxiliares -------- */
function EvidenceTag({ status }: { status: PessoaBase["status_evidencia"] }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        EVIDENCE_TOM[status],
      )}
    >
      {EVIDENCE_LABEL[status]}
    </span>
  );
}

function Bloco({
  titulo,
  children,
  eyebrow,
}: {
  titulo: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {eyebrow && (
        <div className="mb-1 text-[11px] uppercase tracking-widest text-terracotta">{eyebrow}</div>
      )}
      <h3 className="mb-3 font-serif text-xl text-navy">{titulo}</h3>
      {children}
    </section>
  );
}

/* -------- HOME -------- */
function HomeTab({
  caso,
  ficha,
  onOpenRelatorio,
  onOpenEntrega,
  onOpenFase02,
  onOpenDocs,
  fase02Status,
}: {
  caso: CaseData;
  ficha: ReturnType<typeof toFichaPiloto>;
  onOpenRelatorio: () => void;
  onOpenEntrega: () => void;
  onOpenFase02: () => void;
  onOpenDocs: () => void;
  fase02Status: string;
}) {
  const idx = ETAPAS_CASO.indexOf(caso.geral.status_caso);
  const paises = paisesComAderencia(caso);
  const destaques = caso.descobertas.slice(0, 3);

  return (
    <div className="space-y-5 p-5" data-tab="home">
      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-gold/80">
              Seu acompanhamento
            </div>
            <div className="font-serif text-xl italic">{ficha.conta_produto_atual}</div>
            <div className="text-[11px] text-cream/70">Rota provável: {ficha.rota_provavel}</div>
          </div>
          <span className="shrink-0 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-navy">
            {STATUS_CASO_LABEL[caso.geral.status_caso]}
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-navy-soft/60 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-widest text-gold/80">
            Hoje você está aqui
          </div>
          <div className="flex items-center justify-between gap-1">
            {ETAPAS_CASO.map((s, i) => {
              const done = i < idx;
              const active = i === idx;
              return (
                <div key={s} className="flex flex-1 flex-col items-center">
                  <div
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold transition",
                      done && "bg-gold/40 text-gold",
                      active && "scale-110 bg-gold text-navy ring-4 ring-gold/30",
                      !done && !active && "border border-cream/20 bg-navy/40 text-cream/50",
                    )}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <div
                    className={cn(
                      "mt-1.5 text-center text-[11px] leading-tight",
                      active ? "font-bold text-gold" : "text-cream/60",
                    )}
                  >
                    {STATUS_CASO_LABEL[s]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-navy-soft/70 p-3">
            <div className="text-cream/70">Documento foco</div>
            <div className="font-semibold text-cream">{ficha.documento_foco}</div>
          </div>
          <div className="rounded-lg bg-navy-soft/70 p-3">
            <div className="text-cream/70">Etapa atual</div>
            <div className="font-semibold text-cream">{ficha.etapa_atual}</div>
          </div>
        </div>
      </section>

      {caso.alerta.ativo && preenchido(caso.alerta.titulo) && (
        <section className="rounded-2xl border border-gold/50 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-navy">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-serif text-lg leading-snug text-navy">{caso.alerta.titulo}</div>
              {preenchido(caso.alerta.texto) && (
                <p className="mt-1 text-[12px] leading-relaxed text-navy/70">{caso.alerta.texto}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {preenchido(caso.jornada.contexto_resumo) && (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            Onde seu caso está
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-navy/80">
            {caso.jornada.contexto_resumo}
          </p>
        </section>
      )}

      {paises.length > 0 && (
        <Bloco titulo="Leitura de origem" eyebrow="Radar">
          <div className="grid grid-cols-2 gap-3">
            {paises.map((p) => (
              <div key={p.pais} className="rounded-xl border border-navy/25 bg-card p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-navy/70">
                  <MapPin className="h-3 w-3 text-gold" /> {p.pais}
                </div>
                {preenchido(p.aderencia) && (
                  <>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-serif text-2xl text-navy">{p.aderencia}</span>
                      <span className="text-[12px] text-navy/70">%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${p.aderencia}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {preenchido(caso.rota.resumo_radar) && (
            <p className="mt-3 rounded-xl border border-border bg-white p-4 text-[12px] leading-relaxed text-navy/75">
              {caso.rota.resumo_radar}
            </p>
          )}
        </Bloco>
      )}

      <button
        onClick={onOpenEntrega}
        className="flex w-full items-center gap-4 rounded-2xl border-2 border-gold bg-white p-5 text-left shadow-sm transition hover:bg-areia/60"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-gold">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            Entrega · leitura inicial
          </div>
          <div className="font-serif text-xl leading-tight text-navy">
            Seu caso e o próximo passo
          </div>
          <div className="text-[12px] text-navy/70">
            Leitura da linha familiar e checklist mínimo.
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-sage" />
      </button>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-widest text-terracotta">
          Entregas da jornada
        </div>
        <h3 className="font-serif text-xl text-navy">Suas fases de entrega</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onOpenRelatorio}
            className="rounded-xl border border-gold/50 bg-cream/60 p-4 text-left transition hover:bg-areia/70"
          >
            <div className="text-[10px] uppercase tracking-widest text-navy/50">Fase 01</div>
            <div className="font-serif text-lg leading-snug text-navy">Diagnóstico inicial</div>
            <div className="mt-1 text-[12px] text-navy/70">
              Leitura da família e primeiros caminhos.
            </div>
          </button>
          <button
            onClick={onOpenFase02}
            className="rounded-xl border border-navy/20 bg-cream/60 p-4 text-left transition hover:bg-areia/70"
          >
            <div className="text-[10px] uppercase tracking-widest text-navy/50">Fase 02</div>
            <div className="font-serif text-lg leading-snug text-navy">
              Relatório completo de pesquisa
            </div>
            <div className="mt-2 inline-block rounded-full border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-navy">
              {fase02Status}
            </div>
          </button>
        </div>
      </section>

      <Bloco titulo="Documentos em foco" eyebrow="Documentos">
        <div className="space-y-2.5">
          <div className="rounded-xl border border-navy/25 bg-card p-4">
            <div className="text-[11px] uppercase tracking-widest text-navy/60">
              Peça de trabalho atual
            </div>
            <div className="text-sm font-medium text-navy">{ficha.documento_foco}</div>
          </div>
          {preenchido(caso.documentos.pendencia_principal) && (
            <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
              <div className="text-[11px] uppercase tracking-widest text-terracotta">
                Pendência principal
              </div>
              <div className="text-sm font-medium text-navy">
                {caso.documentos.pendencia_principal}
              </div>
            </div>
          )}
          <button
            onClick={onOpenDocs}
            className="flex w-full items-center justify-between rounded-xl border border-navy/20 bg-white p-4 text-left transition hover:bg-areia/60"
          >
            <span className="text-[12px] text-navy/75">{ficha.doc_status}</span>
            <ChevronRight className="h-4 w-4 text-sage" />
          </button>
        </div>
      </Bloco>

      {preenchido(caso.arvore.pessoas_conectadas) && caso.arvore.pessoas_conectadas > 0 && (
        <section className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-white p-5 shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/20">
            <Users className="h-7 w-7 text-gold" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-navy/70">Pessoas conectadas</div>
            <div className="font-serif text-2xl text-navy">
              {caso.arvore.pessoas_conectadas}{" "}
              <span className="text-[13px] text-navy/70">
                em {caso.arvore.geracoes_lidas} gerações lidas
              </span>
            </div>
          </div>
        </section>
      )}

      <Bloco titulo="Achados Recentes">
        {destaques.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-4 text-[12px] text-navy/70">
            {FALLBACK.semDescoberta}
          </div>
        ) : (
          <div className="space-y-2.5">
            {destaques.map((x) => (
              <div
                key={x.titulo}
                className="rounded-xl border border-border border-l-4 border-l-gold bg-card p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[11px] uppercase tracking-widest text-terracotta">
                    Achado
                  </span>
                </div>
                <div className="text-sm text-navy">{x.titulo}</div>
                {preenchido(x.pessoa_relacionada) && (
                  <div className="mt-1 text-[12px] text-navy/70">{x.pessoa_relacionada}</div>
                )}
                <div className="mt-2">
                  <EvidenceTag status={x.tipo_evidencia} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Bloco>
    </div>
  );
}

/* -------- JORNADA -------- */
function JornadaTab({ caso }: { caso: CaseData }) {
  const trilhas = [
    { titulo: "Origem", texto: caso.jornada.trilha_origem },
    { titulo: "Cidadania", texto: caso.jornada.trilha_cidadania },
    { titulo: "Memória", texto: caso.jornada.trilha_memoria },
  ].filter((t) => preenchido(t.texto));

  const ancestral = lista([caso.jornada.jornada_ancestral_1]);
  const cliente = lista([caso.jornada.jornada_cliente_1]);
  const intersecoes = lista([caso.jornada.jornada_intersecao_1, caso.jornada.jornada_intersecao_2]);

  return (
    <div className="space-y-6 p-5" data-tab="jornada">
      <div>
        <h2 className="font-serif text-2xl text-navy">Sua Jornada</h2>
        <p className="mt-1 text-[13px] italic text-navy/70">
          Duas linhas caminham juntas: a história da sua família e o seu processo.
        </p>
      </div>

      {preenchido(caso.jornada.etapa_atual) && (
        <div className="rounded-2xl border border-gold/40 bg-white p-5 shadow-sm">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Etapa atual</div>
          <div className="mt-0.5 font-serif text-lg leading-snug text-navy">
            {caso.jornada.etapa_atual}
          </div>
        </div>
      )}

      {trilhas.length > 0 && (
        <Bloco titulo="Trilhas do caso">
          <div className="space-y-3">
            {trilhas.map((t) => (
              <div key={t.titulo} className="rounded-xl border border-navy/25 bg-areia p-4">
                <div className="text-[11px] uppercase tracking-widest text-terracotta">
                  {t.titulo}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-navy/80">{t.texto}</p>
              </div>
            ))}
          </div>
        </Bloco>
      )}

      {(ancestral.length > 0 || cliente.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {ancestral.length > 0 && (
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-widest text-terracotta">
                Linha Ancestral
              </div>
              <div className="relative pl-4">
                <div className="absolute bottom-1 left-1 top-1 w-px bg-gold/40" />
                {ancestral.map((t) => (
                  <div key={t} className="relative mb-4">
                    <div className="absolute -left-3 top-4 h-3 w-3 rounded-full bg-gold" />
                    <div
                      data-audit="jornada-card"
                      className="rounded-xl border border-navy/30 bg-areia p-3"
                    >
                      <div className="text-[12px] leading-relaxed text-navy/80">{t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cliente.length > 0 && (
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-widest text-navy">Sua linha</div>
              <div className="relative pl-4">
                <div className="absolute bottom-1 left-1 top-1 w-px bg-navy/30" />
                {cliente.map((t) => (
                  <div key={t} className="relative mb-4">
                    <div className="absolute -left-3 top-4 h-3 w-3 rounded-full bg-navy" />
                    <div
                      data-audit="jornada-card"
                      className="rounded-xl border border-navy/30 bg-areia p-3"
                    >
                      <div className="text-[12px] leading-relaxed text-navy/80">{t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {intersecoes.length > 0 && (
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            Momentos de encontro
          </div>
          <ul className="mt-2 space-y-2">
            {intersecoes.map((t) => (
              <li key={t} className="text-sm italic leading-relaxed text-navy">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preenchido(caso.conta.texto_upgrade) && (
        <div className="rounded-2xl border border-plum/30 bg-plum/5 p-5">
          <div className="text-[11px] uppercase tracking-widest text-plum">Continuidade</div>
          <p className="mt-1 text-[13px] leading-relaxed text-navy/80">
            {caso.conta.texto_upgrade}
          </p>
        </div>
      )}
    </div>
  );
}

/* -------- ROTA / RADAR -------- */
function RotaTab({ caso }: { caso: CaseData }) {
  const paises = paisesComAderencia(caso);
  return (
    <div className="space-y-6 p-5" data-tab="radar">
      <div>
        <h2 className="font-serif text-2xl text-navy">Radar de Origem</h2>
        <p className="mt-1 text-[13px] italic text-navy/70">
          Leitura interna da pesquisa — não substitui a confirmação documental.
        </p>
      </div>

      <div className="rounded-2xl border border-gold/40 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-terracotta">
          <Compass className="h-3.5 w-3.5" /> Rota provável
        </div>
        <div className="mt-1 font-serif text-xl text-navy">{rotaLabel(caso)}</div>
        {preenchido(caso.rota.hipotese_principal) && (
          <p className="mt-2 text-[13px] leading-relaxed text-navy/75">
            {caso.rota.hipotese_principal}
          </p>
        )}
        <div className="mt-3">
          <EvidenceTag status={caso.rota.status_hipotese} />
        </div>
      </div>

      {paises.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {paises.map((p) => (
            <div key={p.pais} className="rounded-xl border border-navy/25 bg-card p-3">
              <div className="text-[11px] uppercase tracking-wide text-navy/70">{p.pais}</div>
              {preenchido(p.aderencia) && (
                <>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-serif text-2xl text-navy">{p.aderencia}</span>
                    <span className="text-[12px] text-navy/70">%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${p.aderencia}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {preenchido(caso.rota.resumo_radar) && (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            Resumo da leitura
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-navy/80">{caso.rota.resumo_radar}</p>
        </div>
      )}
    </div>
  );
}

export function RadarChart({
  axes,
  size = 300,
  color = "#C9A84C",
  strokeColor,
  polygons,
}: {
  axes: { k: string; v: number }[];
  size?: number;
  color?: string;
  strokeColor?: string;
  polygons?: { name: string; values: number[]; color: string }[];
}) {
  const cx = size / 2,
    cy = size / 2;
  const r = size / 2 - 44;
  const n = axes.length;
  const pt = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (r * val) / 100;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };
  const rings = [20, 40, 60, 80, 100];
  const single = axes.map((a, i) => pt(i, a.v));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-sm">
      {rings.map((rg) => (
        <polygon
          key={rg}
          points={axes.map((_, i) => pt(i, rg).join(",")).join(" ")}
          fill="none"
          stroke="#E4DBC8"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E4DBC8" strokeWidth="1" />;
      })}
      {polygons ? (
        polygons.map((p) => (
          <polygon
            key={p.name}
            points={axes.map((_, i) => pt(i, p.values[i]).join(",")).join(" ")}
            fill={p.color}
            fillOpacity="0.18"
            stroke={p.color}
            strokeWidth="2"
          />
        ))
      ) : (
        <polygon
          points={single.map((p) => p.join(",")).join(" ")}
          fill={color}
          fillOpacity="0.35"
          stroke={strokeColor ?? color}
          strokeWidth="2"
        />
      )}
      {!polygons &&
        single.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="#1B2B4B" strokeWidth="1.5" />
        ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 118);
        return (
          <text
            key={a.k}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#1B2B4B"
            fontWeight="600"
          >
            {a.k}
          </text>
        );
      })}
    </svg>
  );
}

/* -------- ÁRVORE -------- */
function ArvoreTab({ caso }: { caso: CaseData }) {
  const ocultar = caso.governanca.dados_sensiveis_ocultos;
  const f = caso.familia_direta;

  const No = ({
    pessoa,
    papel,
    destaque,
  }: {
    pessoa: PessoaBase;
    papel: string;
    destaque?: boolean;
  }) => {
    if (!preenchido(pessoa.nome)) return null;
    const variantes = lista(pessoa.variantes_nome);
    const ref = referenciaVisivel(pessoa, ocultar);
    const datas = [pessoa.nascimento, pessoa.falecimento].filter((d) => preenchido(d)).join(" — ");
    return (
      <div
        className={cn(
          "rounded-lg border bg-white px-3 py-2 text-left shadow-sm",
          destaque ? "border-gold ring-2 ring-gold/30" : "border-border",
        )}
      >
        <div className="text-[10px] uppercase tracking-widest text-terracotta">{papel}</div>
        <div className="text-[13px] font-semibold leading-tight text-navy">{pessoa.nome}</div>
        {preenchido(datas) && <div className="text-[11px] text-navy/70">{datas}</div>}
        {preenchido(pessoa.local_relevante) && (
          <div className="text-[11px] text-navy/70">{pessoa.local_relevante}</div>
        )}
        {variantes.length > 0 && (
          <div className="mt-1 text-[11px] italic text-navy/60">
            Também registrado como: {variantes.join(", ")}
          </div>
        )}
        {preenchido(pessoa.observacao) && (
          <div className="mt-1 text-[11px] leading-snug text-navy/60">{pessoa.observacao}</div>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <EvidenceTag status={pessoa.status_evidencia} />
          {ref && (
            <span className="rounded-full border border-navy/15 bg-areia px-2 py-0.5 text-[10px] text-navy/70">
              {ref}
            </span>
          )}
        </div>
      </div>
    );
  };

  const colaterais = lista(caso.arvore.pessoas_colaterais);

  return (
    <div className="space-y-5 p-5" data-tab="arvore">
      <div>
        <h2 className="font-serif text-2xl text-navy">Árvore Familiar</h2>
        <p className="mt-1 text-[13px] italic text-navy/70">
          A linha prioritária aparece em destaque.
        </p>
      </div>

      {preenchido(caso.arvore.linha_prioritaria) && (
        <div className="rounded-2xl border border-gold bg-gold/10 p-4">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            Linha prioritária
          </div>
          <div className="mt-1 text-[13px] font-medium leading-relaxed text-navy">
            {caso.arvore.linha_prioritaria}
          </div>
        </div>
      )}

      {ocultar && (
        <div className="rounded-2xl border border-gold/40 bg-white p-4 shadow-sm">
          <div className="font-serif text-lg leading-snug text-navy">
            {REFERENCIA_CLIENTE.titulo}
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-navy/70">
            {REFERENCIA_CLIENTE.texto}
          </p>
          <span className="mt-2 inline-block rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
            {REFERENCIA_CLIENTE.etiqueta}
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="space-y-5">
          {f.pai_de_alessandro && preenchido(f.pai_de_alessandro.nome) && (
            <>
              <Gen label="Geração anterior">
                <div className="mx-auto max-w-[260px]">
                  <No pessoa={f.pai_de_alessandro} papel="Pai do bisavô" />
                </div>
              </Gen>
              <Connector />
            </>
          )}
          <Gen label="Bisavós paternos">
            <div className="grid grid-cols-2 gap-2">
              <No pessoa={f.bisavo_paterno} papel="Bisavô" destaque />
              <No pessoa={f.bisavo_paterna} papel="Bisavó" destaque />
            </div>
          </Gen>
          <Connector />
          <Gen label="Avós">
            <div className="grid grid-cols-2 gap-2">
              <No pessoa={f.avo_paterno} papel="Avô paterno" destaque />
              <No pessoa={f.avo_paterna} papel="Avó paterna" />
              <No pessoa={f.avo_materno} papel="Avô materno" />
              <No pessoa={f.avo_materna} papel="Avó materna" />
            </div>
          </Gen>
          <Connector />
          <Gen label="Pais">
            <div className="grid grid-cols-2 gap-2">
              <No pessoa={f.pai} papel="Pai" destaque />
              <No pessoa={f.mae} papel="Mãe" />
            </div>
          </Gen>
          <Connector />
          <Gen label="Você">
            <div className="mx-auto max-w-[220px]">
              <div className="rounded-lg border-2 border-navy bg-navy px-3 py-2 text-center text-cream shadow">
                <div className="text-xs font-semibold">{caso.geral.cliente_nome}</div>
                {preenchido(caso.cliente.endereco_resumido) && (
                  <div className="text-[11px] text-cream/70">{caso.cliente.endereco_resumido}</div>
                )}
              </div>
            </div>
          </Gen>
        </div>
      </div>

      {preenchido(caso.arvore.conexao_chave) && (
        <div className="rounded-xl border border-navy/25 bg-card p-4">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Conexão-chave</div>
          <p className="mt-1 text-[13px] leading-relaxed text-navy/80">
            {caso.arvore.conexao_chave}
          </p>
        </div>
      )}
      {preenchido(caso.arvore.conexao_territorial) && (
        <div className="rounded-xl border border-navy/25 bg-card p-4">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Território</div>
          <p className="mt-1 text-[13px] leading-relaxed text-navy/80">
            {caso.arvore.conexao_territorial}
          </p>
        </div>
      )}
      {preenchido(caso.arvore.lacuna_critica) && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">
            O que ainda falta
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-navy/80">
            {caso.arvore.lacuna_critica}
          </p>
        </div>
      )}

      {colaterais.length > 0 && (
        <Bloco titulo="Ramos relacionados">
          <div className="flex flex-wrap gap-2">
            {colaterais.map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-white px-3 py-1 text-[11px] text-navy/70"
              >
                {p}
              </span>
            ))}
          </div>
        </Bloco>
      )}

      {caso.arvore.pessoas_conectadas > 0 && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
          <div className="font-serif text-xl text-navy">
            {caso.arvore.pessoas_conectadas} pessoas conectadas
          </div>
          <div className="text-[12px] text-navy/70">
            {caso.arvore.geracoes_lidas} gerações lidas até aqui
          </div>
        </div>
      )}
    </div>
  );
}
function Gen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-widest text-terracotta">{label}</div>
      {children}
    </div>
  );
}
function Connector() {
  return <div className="mx-auto h-4 w-px bg-border" />;
}

/* -------- DOCUMENTOS -------- */
function DocsTab({ caso }: { caso: CaseData }) {
  const grupos = [
    {
      titulo: "Localizados",
      itens: limparLista(caso.documentos.documentos_localizados),
      tom: "border-sage/40 bg-sage/10 text-sage",
      Icone: CheckCircle2,
    },
    {
      titulo: "Em validação",
      itens: lista(caso.documentos.documentos_em_validacao),
      tom: "border-gold/50 bg-gold/15 text-navy",
      Icone: Clock,
    },
    {
      titulo: "Solicitados",
      itens: lista(caso.documentos.proximas_solicitacoes),
      tom: "border-plum/30 bg-plum/10 text-plum",
      Icone: UploadCloud,
    },
    {
      titulo: "Pendentes",
      itens: lista(caso.documentos.documentos_pendentes),
      tom: "border-terracotta/40 bg-terracotta/10 text-terracotta",
      Icone: FileText,
    },
  ].filter((g) => g.itens.length > 0);

  return (
    <div className="space-y-6 p-5" data-tab="docs">
      <div>
        <h2 className="font-serif text-2xl text-navy">Documentos</h2>
        <p className="mt-1 text-[13px] italic text-navy/70">
          {texto(caso.documentos.status_documental, FALLBACK.atualizacao)}
        </p>
      </div>

      <div className="rounded-2xl border border-gold/40 bg-white p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-widest text-terracotta">
          Peça de trabalho atual
        </div>
        <div className="font-serif text-lg leading-snug text-navy">
          {texto(caso.documentos.documento_principal, FALLBACK.semArquivo)}
        </div>
        {preenchido(caso.documentos.pendencia_principal) && (
          <div className="mt-3 rounded-xl border border-terracotta/40 bg-terracotta/5 p-3">
            <div className="text-[11px] uppercase tracking-widest text-terracotta">
              Pendência principal
            </div>
            <div className="text-[13px] text-navy">{caso.documentos.pendencia_principal}</div>
          </div>
        )}
      </div>

      <button className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gold/60 bg-gold/5 p-6 text-center transition hover:bg-gold/10">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-gold">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="text-sm font-semibold text-navy">Enviar novo documento</div>
        <div className="text-[12px] text-navy/70">PDF, JPG ou PNG — até 10 MB por arquivo</div>
        <span className="mt-1 rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-cream">
          Selecionar arquivo
        </span>
      </button>

      {grupos.map((g) => (
        <Bloco key={g.titulo} titulo={g.titulo}>
          <div className="space-y-2.5">
            {g.itens.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-navy/25 bg-white p-4 shadow-sm"
              >
                <div
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                    g.tom,
                  )}
                >
                  <g.Icone className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 text-sm leading-snug text-navy">{item}</div>
              </div>
            ))}
          </div>
        </Bloco>
      ))}

      <div className="rounded-xl border border-border bg-areia p-4 text-[12px] leading-relaxed text-navy/70">
        <p>{PROCURACAO_TEXTO_CLIENTE}</p>
        <p className="mt-2">
          Referências genealógicas ajudam a orientar a pesquisa, mas não substituem certidões
          oficiais.
        </p>
      </div>
    </div>
  );
}

/* -------- DESCOBERTAS / LEGADO -------- */
function DescobertasTab({
  caso,
  onOpenRelatorio,
}: {
  caso: CaseData;
  onOpenRelatorio: () => void;
}) {
  return (
    <div className="space-y-6 p-5" data-tab="biblio">
      <section>
        <div className="mb-1 text-[11px] uppercase tracking-widest text-terracotta">
          Biblioteca da jornada
        </div>
        <h2 className="font-serif text-2xl text-navy">Seus Achados</h2>
        <p className="mt-1 text-[12px] italic text-navy/70">
          Cada descoberta validada fica registrada aqui, com a pessoa relacionada e o estágio da
          evidência.
        </p>

        <div className="mt-4 space-y-3">
          {caso.descobertas.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-white p-4 text-[12px] text-navy/70">
              A próxima descoberta será adicionada assim que uma nova referência for validada.
            </div>
          )}
          {caso.descobertas.map((x) => (
            <div key={x.titulo} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[11px] uppercase tracking-widest text-terracotta">
                    Achado
                  </span>
                </div>
                {preenchido(x.data) && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-navy/70">
                    <Calendar className="h-3 w-3" />
                    {x.data}
                  </span>
                )}
              </div>
              <div className="font-serif text-lg leading-snug text-navy">{x.titulo}</div>
              {preenchido(x.texto) && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-navy/70">{x.texto}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {preenchido(x.pessoa_relacionada) && (
                  <span className="rounded-full border border-navy/15 bg-areia px-2.5 py-0.5 text-[11px] text-navy/70">
                    {x.pessoa_relacionada}
                  </span>
                )}
                <EvidenceTag status={x.tipo_evidencia} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={onOpenRelatorio}
        className="flex w-full items-center gap-4 rounded-2xl border border-gold/40 bg-white p-5 text-left shadow-sm transition hover:bg-areia/60"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-gold">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Fase 01</div>
          <div className="font-serif text-xl leading-tight text-navy">
            Abrir o diagnóstico inicial
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-sage" />
      </button>

      {preenchido(caso.conta.texto_upgrade) && (
        <section className="relative overflow-hidden rounded-2xl border border-plum/40 bg-gradient-to-br from-plum via-plum to-[#5B3877] p-6 text-cream">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%)",
            }}
          />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] uppercase tracking-widest text-cream">
              Continuidade da jornada
            </div>
            <h3 className="font-serif text-2xl italic">A próxima etapa da sua história</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/85">{caso.conta.texto_upgrade}</p>
          </div>
        </section>
      )}
    </div>
  );
}

/* -------- CONTA -------- */
function ContaScreen({ caso }: { caso: CaseData }) {
  const historico = limparLista(caso.conta.historico).slice().reverse();
  const iniciais = caso.geral.cliente_nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 p-5" data-tab="conta">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-navy font-serif text-2xl italic text-gold">
            {iniciais}
          </div>
          <div className="min-w-0">
            <div className="truncate font-serif text-xl text-navy">{caso.geral.cliente_nome}</div>
            {preenchido(caso.cliente.endereco_resumido) && (
              <div className="truncate text-[12px] text-navy/70">
                {caso.cliente.endereco_resumido}
              </div>
            )}
            {preenchido(caso.governanca.responsavel_caso) && (
              <div className="text-[12px] text-navy/70">
                Acompanhamento {caso.governanca.responsavel_caso}
              </div>
            )}
          </div>
        </div>
      </section>

      <ContaContrato caso={caso} />
      <TimelineContratualCliente caso={caso} />
      <ContaProduto caso={caso} />
      <ContaPagamentos caso={caso} />
      <ContaDespesas caso={caso} />

      <section className="rounded-2xl border border-navy/20 bg-navy p-5 text-cream">
        <div className="text-[11px] uppercase tracking-widest text-gold/80">Produto atual</div>
        <div className="font-serif text-lg italic text-gold">
          {texto(caso.conta.produto_atual || caso.geral.produto_atual, FALLBACK.atualizacao)}
        </div>
        <div className="mt-4 space-y-3 text-[12px]">
          <div className="rounded-lg bg-navy-soft/70 p-3">
            <div className="text-cream/70">Status da jornada</div>
            <div className="font-semibold text-cream">
              {texto(caso.conta.status_jornada, FALLBACK.atualizacao)}
            </div>
          </div>
          <div className="rounded-lg bg-navy-soft/70 p-3">
            <div className="text-cream/70">Última atualização</div>
            <div className="font-semibold text-cream">
              {texto(
                caso.conta.ultima_atualizacao || caso.geral.ultima_atualizacao,
                FALLBACK.atualizacao,
              )}
            </div>
          </div>
        </div>
      </section>


      {historico.length > 0 && (
        <Bloco titulo="Histórico da jornada">
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            {historico.map((h, i) => (
              <div
                key={h}
                className={cn(
                  "flex items-start gap-3 p-4",
                  i < historico.length - 1 && "border-b border-border",
                )}
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <div className="text-sm leading-relaxed text-navy">{h}</div>
              </div>
            ))}
          </div>
        </Bloco>
      )}

      <section className="rounded-2xl border border-gold/50 bg-cream p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-widest text-terracotta">Próxima etapa</div>
        <p className="mt-1 text-[13px] font-semibold leading-relaxed text-navy">
          {proximaEtapaCliente(caso)}
        </p>
        {preenchido(caso.conta.texto_upgrade) && (
          <p className="mt-2 text-[13px] leading-relaxed text-navy/80">
            {caso.conta.texto_upgrade}
          </p>
        )}
      </section>

    </div>
  );
}

/* -------- MINHA CONTA: blocos contratuais (visão cliente) -------- */

function CartaoConta({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="text-[11px] uppercase tracking-widest text-terracotta">{titulo}</div>
      <div className="mt-3 space-y-2 text-sm text-navy">{children}</div>
    </section>
  );
}

function LinhaConta({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-[12px] text-navy/60">{l}</span>
      <span className="max-w-[65%] text-right text-[13px] font-medium text-navy">{v}</span>
    </div>
  );
}

function ContaContrato({ caso }: { caso: CaseData }) {
  const c = caso.contratacao;
  const formalizado = c && c.contrato_base.status !== "nao_enviado";
  return (
    <CartaoConta titulo="Seu contrato">
      <LinhaConta l="Código do caso" v={texto(caso.geral.case_id, FALLBACK.atualizacao)} />
      <LinhaConta
        l="Status do contrato"
        v={c ? CONTRATO_BASE_LABEL[c.contrato_base.status] : FALLBACK.aguardando}
      />
      <LinhaConta
        l="Ordem de Serviço"
        v={c ? ORDEM_SERVICO_LABEL[c.ordem_servico.status] : FALLBACK.aguardando}
      />
      {preenchido(c?.contrato_base.data_aceite) && (
        <LinhaConta l="Data de aceite" v={c!.contrato_base.data_aceite} />
      )}
      {documentoVisivel(c?.contrato_base) ? (
        <a
          href={c!.contrato_base.secure_url}
          className="mt-1 block rounded-lg bg-navy px-4 py-2.5 text-center text-[13px] font-semibold text-cream"
        >
          Ver contrato
        </a>
      ) : (
        <p className="text-[13px] leading-relaxed text-navy/75">
          {formalizado ? PROCURACAO_TEXTO_CLIENTE : CONTA_FALLBACK.contrato}
        </p>
      )}
    </CartaoConta>
  );
}

function ContaProduto({ caso }: { caso: CaseData }) {
  const c = caso.contratacao;
  const os = c?.ordem_servico;
  const contratado = produtoContratado(c);
  const entregaveis = lista(os?.entregaveis);

  return (
    <CartaoConta titulo="Seu produto">
      {contratado ? (
        <>
          <LinhaConta l="Produto contratado" v={texto(os?.produto_nome, FALLBACK.atualizacao)} />
          <LinhaConta l="Código" v={texto(os?.produto_sku, FALLBACK.atualizacao)} />
        </>
      ) : (
        <p className="text-[13px] leading-relaxed text-navy/75">{CONTA_FALLBACK.produto}</p>
      )}
      {preenchido(os?.escopo_resumo) && (
        <p className="text-[13px] leading-relaxed text-navy/80">{os!.escopo_resumo}</p>
      )}
      {preenchido(os?.etapa_inicial) && (
        <LinhaConta l="Etapa inicial" v={os!.etapa_inicial} />
      )}
      {entregaveis.length > 0 && (
        <ul className="mt-1 space-y-1.5">
          {entregaveis.map((e) => (
            <li key={e} className="flex items-start gap-2 text-[13px] text-navy">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}
    </CartaoConta>
  );
}

function ContaPagamentos({ caso }: { caso: CaseData }) {
  const os = caso.contratacao?.ordem_servico;
  const campos = [
    ["Situação", os?.status === "aceita" ? "Contratação formalizada" : ""],
    ["Forma de pagamento", os?.meio_pagamento],
    ["Parcelas ou recorrência", os?.parcelas_ou_recorrencia],
    ["Próximo vencimento", os?.proximo_vencimento],
  ].filter(([, v]) => preenchido(v)) as [string, string][];

  return (
    <CartaoConta titulo="Pagamentos">
      {campos.length > 0 ? (
        campos.map(([l, v]) => <LinhaConta key={l} l={l} v={v} />)
      ) : (
        <p className="text-[13px] leading-relaxed text-navy/75">{CONTA_FALLBACK.pagamento}</p>
      )}
    </CartaoConta>
  );
}

function ContaDespesas({ caso }: { caso: CaseData }) {
  const d = caso.contratacao?.despesas_externas;
  return (
    <CartaoConta titulo="Despesas do processo">
      <LinhaConta
        l="Situação"
        v={d ? DESPESAS_LABEL_CLIENTE[d.status] : CONTA_FALLBACK.despesas}
      />
      <p className="text-[13px] leading-relaxed text-navy/80">
        {preenchido(d?.descricao_cliente) ? d!.descricao_cliente : DESPESAS_TEXTO_CLIENTE}
      </p>
    </CartaoConta>
  );
}
