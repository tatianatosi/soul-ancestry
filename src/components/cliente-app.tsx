import { useEffect, useState } from "react";
import { runCanvasAudit } from "@/lib/canvas-audit";

import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand";
import { RelatorioVisualTab } from "./relatorio-visual";
import { EntregaConsultivaTab } from "./entrega-consultiva";
import { RelatorioFase02 } from "./relatorio-fase02";
import { registroOuFallback } from "@/data/case-registry";
import { entregasByCaso, STATUS_LABEL } from "@/data/relatorio-visual";


import {
  CASOS,
  ETAPAS,
  PLANO_LEGADO,
  brl,
  resumoCaso,
  type Caso,
} from "@/data/casos";
import { propostaByCaso } from "@/data/propostas";

import {
  Home,
  Route as RouteIcon,
  Radar,
  TreeDeciduous,
  FileText,
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  Eye,
  Lock,
  ArrowRight,
  Users,
  User,
  MessageCircle,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Search,
  Check,
  UploadCloud,
  Scale,
  CreditCard,
  Link2,
  ClipboardList,
  Layers,

} from "lucide-react";

type Tab = "home" | "jornada" | "entrega" | "relatorio" | "fase02" | "radar" | "arvore" | "docs" | "biblio" | "conta";
export type CaseStatus = "em-andamento" | "proposta-aceita";

export function ClienteApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [showConta, setShowConta] = useState(false);
  const [casoId, setCasoId] = useState<string>(CASOS[0].id);
  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0];
  const [override, setOverride] = useState<Record<string, boolean>>({});
  const aceita = override[caso.id] ?? caso.status === "proposta-aceita";
  const caseStatus: CaseStatus = aceita ? "proposta-aceita" : "em-andamento";

  useEffect(() => {
    const id = window.setTimeout(() => runCanvasAudit(), 400);
    return () => window.clearTimeout(id);
  }, [tab, showConta, casoId, aceita]);

  const wide = !showConta && (tab === "relatorio" || tab === "entrega" || tab === "fase02");
  const registro = registroOuFallback(caso.id, caso.cliente, caso.pais, caso.tipoProcesso);


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
            <button onClick={() => setShowConta(false)} className="flex items-center gap-2 text-sm text-cream/80">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <div className="font-serif text-lg italic text-gold">Minha Conta</div>
            <div className="w-16" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <BrandLogo size={36} showText={false} />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest text-gold/80">Bem-vindo(a)</div>
                <div className="font-serif text-lg italic truncate">{caso.cliente}</div>
              </div>
            </div>
            <button
              onClick={() => setShowConta(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold hover:bg-gold/30 transition"
              aria-label="Minha Conta"
            >
              <User className="h-5 w-5" />
            </button>
          </>
        )}
      </header>

      {/* Acesso público + seletor de caso */}
      <div data-print-hide className="space-y-2 border-b border-border bg-areia px-5 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-[11px] text-navy/70">Acesso público · painel da jornada (sem cadastro)</div>
          <button
            onClick={() => setOverride((o) => ({ ...o, [caso.id]: !aceita }))}
            className="shrink-0 rounded-full border border-navy/30 px-3 py-1 text-[11px] font-semibold text-navy hover:bg-navy/5 transition"
          >
            {aceita ? "Voltar ao estado inicial" : "Simular proposta aceita"}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CASOS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCasoId(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition",
                c.id === caso.id
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/25 text-navy hover:bg-navy/5",
              )}
            >
              {c.cliente.split(" ")[0]} · {c.pais}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        {showConta || tab === "conta" ? (
          <ContaScreen caso={caso} caseStatus={caseStatus} />
        ) : (
          <>
            {tab === "home" && (
              <HomeTab
                caso={caso}
                caseStatus={caseStatus}
                onOpenRelatorio={() => setTab("relatorio")}
                onOpenEntrega={() => setTab("entrega")}
                onOpenFase02={() => setTab("fase02")}
                fase02Status={registro.phase2Status}
              />
            )}
            {tab === "jornada" && <JornadaTab caso={caso} />}
            {tab === "entrega" && <EntregaConsultivaTab caso={caso} />}
            {tab === "relatorio" && <RelatorioVisualTab caso={caso} />}
            {tab === "fase02" && <RelatorioFase02 registro={registro} />}
            {tab === "radar" && <RadarTab caso={caso} />}
            {tab === "arvore" && <ArvoreTab caso={caso} />}
            {tab === "docs" && <DocsTab caso={caso} />}
            {tab === "biblio" && (
              <BiblioTab
                caso={caso}
                registro={registro}
                onOpenRelatorio={() => setTab("relatorio")}
                onOpenFase02={() => setTab("fase02")}
              />
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
        <div className="grid grid-cols-9">
          {(
            [
              ["home", Home, "Home"],
              ["jornada", RouteIcon, "Jornada"],
              ["entrega", Sparkles, "Entrega"],
              ["relatorio", ClipboardList, "Relatório"],
              ["radar", Radar, "Radar"],
              ["arvore", TreeDeciduous, "Árvore"],
              ["docs", FileText, "Docs"],
              ["biblio", BookOpen, "Legado"],
              ["conta", User, "Conta"],
            ] as const
          ).map(([id, Icon, label]) => {
            const isActive = id === "conta" ? showConta || tab === "conta" : !showConta && tab === id;
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

/* -------- CONTA -------- */
function ContaScreen({ caso, caseStatus }: { caso: Caso; caseStatus: CaseStatus }) {
  const { previsto, saldo } = resumoCaso(caso);
  const proposta = propostaByCaso(caso.id);

  return (
    <div className="space-y-6 p-5" data-tab="conta">
      {/* A — Perfil */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-navy text-2xl font-serif italic text-gold">
            {caso.iniciais}
          </div>
          <div className="min-w-0">
            <div className="font-serif text-xl text-navy truncate">{caso.cliente}</div>
            <div className="text-[12px] text-navy/70 truncate">Caso {caso.id}</div>
            <div className="text-[12px] text-navy/70">{caso.tipoProcesso}</div>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-3 text-[12px] text-navy/70">
          Início do caso: <span className="font-semibold text-navy">{caso.dataInicio}</span> · Responsável:{" "}
          <span className="font-semibold text-navy">{caso.responsavel}</span>
        </div>
      </section>

      {/* B — Plano contratado */}
      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Plano contratado</h3>
        <div className="rounded-2xl border border-navy/20 bg-navy p-5 text-cream">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-widest text-gold/80">{caso.plano.formato}</div>
              <div className="font-serif text-lg italic text-gold">{caso.plano.nome}</div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",
                caseStatus === "proposta-aceita" ? "bg-gold text-navy" : "bg-cream/15 text-cream",
              )}
            >
              {caseStatus === "proposta-aceita" ? "ATIVO" : "EM PROPOSTA"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
            {[
              ["Honorários base", brl(caso.plano.honorariosBase)],
              ["Despesas previstas", brl(caso.plano.despesasPrevistas)],
              ["Taxas previstas", brl(caso.plano.taxasPrevistas)],
              ["Parcelas", caso.plano.parcelas],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-navy-soft/70 p-3">
                <div className="text-cream/70">{l}</div>
                <div className="font-semibold text-cream">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-gold/15 p-3 text-[12px]">
            <span className="text-cream/80">Referência total da proposta</span>
            <span className="font-serif text-lg text-gold">{brl(proposta.capa.referenciaTotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-navy-soft/70 p-3 text-[12px]">
            <span className="text-cream/70">Formato recomendado</span>
            <span className="font-semibold text-cream">{proposta.formatoRecomendado}</span>
          </div>
          <div className="mt-2 text-[11px] text-cream/70">
            SKUs de referência: {proposta.skusPrincipais.map((s) => s.sku).join(" · ") || caso.plano.skus.join(" · ")}
          </div>
          <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-[12px] leading-relaxed text-cream/90">
            O valor total apresentado já inclui as principais despesas de certidões, traduções e apostilas, muitas
            delas antecipadas pelo Clube em nome do projeto — você não precisa se preocupar com cada pagamento
            isolado.
          </p>


        </div>

        {/* Método de pagamento */}
        <div className="mt-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-navy">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-navy">Método de pagamento</div>
              <div className="truncate text-[12px] text-navy/70">{caso.plano.linkPagamento}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-areia p-3">
            <div className="text-[12px] text-navy/70">
              Saldo em aberto: <span className="font-semibold text-navy">{brl(Math.max(saldo, 0))}</span>
            </div>
            <button className="inline-flex shrink-0 items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-[11px] font-semibold text-cream">
              <Link2 className="h-3 w-3" /> Abrir link
            </button>
          </div>
        </div>

        {/* Upsell */}
        <div className="mt-3 rounded-2xl border border-gold/50 bg-cream p-5 shadow-sm">
          <div className="mb-1 text-base font-semibold text-navy">👨‍👩‍👧 Familiar Conectado</div>
          <div className="text-[12px] text-navy/70">Inclua até 4 familiares na sua jornada</div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-navy/70">A partir de</div>
              <div className="font-serif text-xl text-navy">
                R$ 269<span className="text-[12px] text-navy/70">/mês</span>
              </div>
            </div>
            <button className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy hover:bg-gold/90 transition">
              Conhecer plano familiar
            </button>
          </div>
        </div>
      </section>

      {/* C — WhatsApp */}
      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">WhatsApp</h3>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-navy">Alertas Básicos</div>
              <div className="text-[12px] text-navy/70">R$ 19/mês · plano atual</div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              ATIVO
            </span>
          </div>
          <button className="mt-3 flex w-full items-center justify-between rounded-xl border border-dashed border-gold/60 bg-gold/5 p-3 text-left hover:bg-gold/10 transition">
            <div>
              <div className="text-xs font-semibold text-navy">Alertas Família — R$ 39/mês</div>
              <div className="text-[11px] text-navy/70">Para grupos familiares</div>
            </div>
            <ChevronRight className="h-4 w-4 text-gold" />
          </button>
        </div>
      </section>

      {/* D — Histórico */}
      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Histórico de atividades</h3>
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          {caso.historico.map((h, i) => (
            <div
              key={h.t + i}
              className={cn(
                "flex items-center justify-between p-4",
                i < caso.historico.length - 1 && "border-b border-border",
              )}
            >
              <div className="text-sm text-navy">{h.t}</div>
              <div className="ml-3 shrink-0 text-[12px] text-navy/70">{h.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* -------- HOME -------- */
function HomeTab({
  caso,
  caseStatus,
  onOpenRelatorio,
  onOpenEntrega,
  onOpenFase02,
  fase02Status,
}: {
  caso: Caso;
  caseStatus: CaseStatus;
  onOpenRelatorio: () => void;
  onOpenEntrega: () => void;
  onOpenFase02: () => void;
  fase02Status: string;
}) {

  const currentIdx = ETAPAS.findIndex((e) => e.key === caso.etapaAtual);
  const proximoPasso = caso.checklistAppCliente.find((i) => !i.feito)?.item ?? caso.proximaAcao;
  return (
    <div className="space-y-5 p-5" data-tab="home">
      {caseStatus === "proposta-aceita" && (
        <section className="rounded-2xl border border-sage/40 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-widest text-navy/70">Pagamento confirmado</div>
              <div className="text-sm text-navy">Proposta aceita — seu caso foi ativado.</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-areia p-3">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-widest text-navy/60">Próximo passo</div>
              <div className="text-sm font-medium text-navy">{proximoPasso}</div>
            </div>
            <button className="shrink-0 rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold text-navy hover:bg-gold/90 transition">
              Avançar
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-gold/80">Seu caso · {caso.id}</div>
            <div className="font-serif text-xl italic">{caso.tipoProcesso}</div>
            <div className="text-[11px] text-cream/70">{caso.baseJuridica}</div>
          </div>
          <span className="shrink-0 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-navy">
            {caseStatus === "proposta-aceita" ? "CASO ATIVO" : caso.status === "em-proposta" ? "EM PROPOSTA" : "EM ANDAMENTO"}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-cream/70">
            <span>Progresso da jornada</span>
            <span className="font-semibold text-gold">{caso.progresso}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-soft">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold"
              style={{ width: `${caso.progresso}%` }}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-navy-soft/60 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-widest text-gold/80">Hoje você está aqui</div>
          <div className="flex items-center justify-between gap-1">
            {ETAPAS.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s.key} className="flex flex-1 flex-col items-center">
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
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <button
        onClick={onOpenEntrega}
        className="flex w-full items-center gap-4 rounded-2xl border-2 border-gold bg-white p-5 text-left shadow-sm transition hover:bg-areia/60"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-gold">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Entrega 1 · leitura inicial</div>
          <div className="font-serif text-xl leading-tight text-navy">Seu caso e o próximo passo</div>
          <div className="text-[12px] text-navy/70">Elegibilidade, checklist mínimo e CTA da Etapa 02.</div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-sage" />
      </button>

      <button
        onClick={onOpenRelatorio}
        className="flex w-full items-center gap-4 rounded-2xl border border-gold/40 bg-white p-5 text-left shadow-sm transition hover:bg-areia/60"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-gold">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">Projeto Essencial</div>
          <div className="font-serif text-xl leading-tight text-navy">Relatório da sua família</div>
          <div className="text-[12px] text-navy/70">Síntese da pesquisa base em cards.</div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-sage" />
      </button>

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Próximos passos</h3>
        <div className="space-y-2.5">
          {caso.proximosPassos.map((it, i) => (
            <div key={it.titulo} className="flex items-start gap-3 rounded-xl border border-navy/25 bg-card p-4 shadow-sm">
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold",
                  it.tom === "urgent" && "bg-terracotta/15 text-terracotta",
                  it.tom === "info" && "bg-gold/20 text-navy",
                  it.tom === "soft" && "bg-muted text-navy/70",
                )}
              >
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-navy">{it.titulo}</div>
                <div className="text-[12px] text-navy/70">{it.sub}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-sage" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-white p-5 shadow-sm">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/20">
          <Users className="h-7 w-7 text-gold" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-navy/70">Pessoas conectadas</div>
          <div className="font-serif text-2xl text-navy">
            {caso.linhaAncestral.length * 3} <span className="text-[13px] text-navy/70">ancestrais recuperados</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Achados Recentes</h3>
        <div className="space-y-2.5">
          {caso.achados.map((x) => (
            <div key={x.titulo} className="rounded-xl border border-border border-l-4 border-l-gold bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-gold" />
                <span className="text-[11px] uppercase tracking-widest text-terracotta">Achado</span>
              </div>
              <div className="text-sm text-navy">{x.titulo}</div>
              <div className="mt-1 text-[12px] text-navy/70">{x.data}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-plum/30 bg-plum/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-plum/15 text-plum">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-plum">Próximo nível disponível</div>
            <div className="mt-0.5 text-sm text-navy">Sua história familiar completa aguarda.</div>
            <button className="mt-2 text-xs font-medium text-plum hover:underline">Saber mais →</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------- JORNADA -------- */
function JornadaTab({ caso }: { caso: Caso }) {
  return (
    <div className="p-5" data-tab="jornada">
      <h2 className="font-serif text-2xl text-navy">Sua Jornada</h2>
      <p className="mt-1 text-[13px] italic text-navy/70">
        Duas linhas caminham juntas: a história e o seu processo — {caso.id}.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-terracotta">Linha Ancestral</div>
          <div className="relative pl-4">
            <div className="absolute bottom-1 left-1 top-1 w-px bg-gold/40" />
            {caso.linhaAncestral.map((e) => (
              <div key={e.ano} className="relative mb-4">
                <div
                  className={cn(
                    "absolute -left-3 top-4 h-3 w-3 rounded-full",
                    e.uniao ? "bg-terracotta ring-2 ring-terracotta/30" : "bg-gold",
                  )}
                />
                <div data-audit="jornada-card" className="rounded-xl border border-navy/30 bg-areia p-3">
                  <div className="font-serif text-xl text-navy">{e.ano}</div>
                  <div className="text-[12px] text-navy/70">{e.texto}</div>
                  {e.uniao && (
                    <span className="mt-1 inline-block rounded-full bg-terracotta/10 px-2 py-0.5 text-[11px] font-medium text-terracotta">
                      União de Ramos
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-navy">Linha do Processo</div>
          <div className="relative pl-4">
            <div className="absolute bottom-1 left-1 top-1 w-px bg-navy/30" />
            {caso.linhaProcesso.map((e) => {
              const label = ETAPAS.find((x) => x.key === e.etapa)?.label ?? e.etapa;
              const atual = e.etapa === caso.etapaAtual;
              return (
                <div key={e.etapa} className="relative mb-4">
                  <div
                    className={cn(
                      "absolute -left-3 top-4 h-3 w-3 rounded-full",
                      atual ? "bg-navy ring-4 ring-gold/40" : e.realizado ? "bg-sage" : "bg-navy/40",
                    )}
                  />
                  <div data-audit="jornada-card" className="rounded-xl border border-navy/30 bg-areia p-3">
                    <div className="font-serif text-lg text-navy">{label}</div>
                    <div className="text-[12px] text-navy/70">
                      {e.realizado ? "Realizado em " : "Previsto: "}
                      {e.data}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
        <div className="text-[11px] uppercase tracking-widest text-terracotta">Momentos de união</div>
        <p className="mt-1 text-sm italic text-navy">
          {caso.linhaAncestral.filter((e) => e.uniao).length > 0
            ? "Ramos que se uniram ao longo do tempo — sua história é feita desses encontros."
            : "Ainda mapeando as uniões de ramos deste caso."}
        </p>
      </div>
    </div>
  );
}

/* -------- RADAR -------- */
function RadarTab({ caso }: { caso: Caso }) {
  return (
    <div className="p-5" data-tab="radar">
      <h2 className="font-serif text-2xl text-navy">Radar Ancestral</h2>
      <p className="mt-1 text-[13px] italic text-navy/70">Seu equilíbrio nas 6 dimensões.</p>
      <div className="mt-4 rounded-2xl border border-border bg-white p-4">
        <RadarChart axes={caso.radar} size={280} color="#C9A84C" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {caso.radar.map((a) => (
          <div key={a.k} className="rounded-xl border border-navy/25 bg-card p-3">
            <div className="text-[11px] uppercase tracking-wide text-navy/70">{a.k}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-serif text-2xl text-navy">{a.v}</span>
              <span className="text-[12px] text-navy/70">%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gold" style={{ width: `${a.v}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Marcos jurídicos / elegibilidade */}
      <section className="mt-6">
        <h3 className="mb-3 font-serif text-xl text-navy">Elegibilidade e marcos jurídicos</h3>
        <div className="space-y-2.5">
          {caso.marcosJuridicos.map((m) => (
            <div key={m.titulo} className="rounded-xl border border-navy/25 bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-terracotta" />
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    m.situacao === "aberta" && "bg-emerald-50 text-emerald-700",
                    m.situacao === "condicionada" && "bg-orange-50 text-orange-700",
                    m.situacao === "fechada" && "bg-red-50 text-red-700",
                  )}
                >
                  Via {m.situacao}
                </span>
              </div>
              <div className="text-sm font-medium text-navy">{m.titulo}</div>
              <div className="mt-1 text-[12px] text-navy/70">{m.nota}</div>
            </div>
          ))}
        </div>
      </section>
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

/* -------- ARVORE -------- */
function ArvoreTab({ caso }: { caso: Caso }) {
  const Node = ({ label, hint, connected }: { label: string; hint?: string; connected?: boolean }) => (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border bg-white px-2 py-2 text-center text-[11px] shadow-sm",
        connected ? "border-gold ring-2 ring-gold/30" : "border-border",
      )}
    >
      <div className="font-semibold leading-tight text-navy">{label}</div>
      {hint && <div className="text-[11px] text-navy/70">{hint}</div>}
      {connected && <div className="mt-0.5 text-[11px] uppercase tracking-widest text-terracotta">conectado</div>}
    </div>
  );
  return (
    <div className="p-5" data-tab="arvore">
      <h2 className="font-serif text-2xl text-navy">Árvore Familiar</h2>
      <p className="mt-1 text-[13px] italic text-navy/70">Cinco gerações que compõem você.</p>

      <div className="mt-5 rounded-2xl border border-border bg-white p-4">
        <div className="space-y-5">
          <Gen label="G5 · Ancestrais">
            <div className="grid grid-cols-3 gap-2">
              <Node label="Ancestral I" hint="~1820" />
              <Node label="Ancestral II" hint="~1825" />
              <Node label="Ancestral III" hint="~1830" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G4 · Trisavós">
            <div className="grid grid-cols-4 gap-2">
              <Node label="Trisavô A" hint="1855" />
              <Node label="Trisavó B" hint="1858" />
              <Node label="Trisavô C" hint="1860" connected />
              <Node label="Trisavó D" hint="1862" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G3 · Bisavós">
            <div className="grid grid-cols-4 gap-2">
              <Node label="Antenato" hint="1887" connected />
              <Node label="Bisavô B" hint="1885" />
              <Node label="Bisavó C" hint="1890" />
              <Node label="Bisavô D" hint="1888" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G2 · Avós">
            <div className="mx-auto grid max-w-[200px] grid-cols-2 gap-2">
              <Node label="Avó" hint="1930" />
              <Node label="Avô" hint="1928" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G1 · Você">
            <div className="mx-auto max-w-[130px]">
              <div className="rounded-lg border-2 border-navy bg-navy px-2 py-2 text-center text-cream shadow">
                <div className="text-xs font-semibold">{caso.cliente}</div>
                <div className="text-[11px] text-cream/70">{caso.pais}</div>
              </div>
            </div>
          </Gen>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
        <div className="font-serif text-xl text-navy">{caso.linhaAncestral.length * 3} pessoas conectadas</div>
        <div className="text-[12px] text-navy/70">de um universo de 31 possíveis nas 5 gerações</div>
      </div>
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

/* -------- DOCS -------- */
function DocsTab({ caso }: { caso: Caso }) {
  const okCount = caso.checklistDocs.filter((c) => c.status === "ok").length;
  const cfgFor = (s: string) =>
    ({
      ok: { cls: "bg-emerald-50 text-emerald-700", label: "OK" },
      parcial: { cls: "bg-blue-50 text-blue-700", label: "Parcial" },
      pendente: { cls: "bg-orange-50 text-orange-700", label: "Pendente" },
    })[s]!;
  return (
    <div className="space-y-6 p-5" data-tab="docs">
      <div>
        <h2 className="font-serif text-2xl text-navy">Documentos</h2>
        <p className="mt-1 text-[13px] italic text-navy/70">
          Checklist do caso {caso.id} · {caso.tipoProcesso}
        </p>
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

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="font-serif text-xl text-navy">Checklist consolidado</h3>
          <span className="text-[12px] text-navy/70">
            {okCount}/{caso.checklistDocs.length} concluídos
          </span>
        </div>
        <div className="space-y-2.5">
          {caso.checklistDocs.map((c) => {
            const cfg = cfgFor(c.status);
            return (
              <div key={c.item} className="rounded-xl border border-navy/25 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full", cfg.cls)}>
                    {c.status === "ok" ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 text-sm text-navy">{c.item}</div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", cfg.cls)}>
                    {cfg.label}
                  </span>
                </div>
                {c.status !== "ok" && (
                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-navy/30 bg-areia px-3 py-2 text-[12px] font-semibold text-navy transition hover:bg-areia/70">
                    <UploadCloud className="h-3.5 w-3.5" /> Enviar arquivo deste item
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-xl text-navy">Entregas do caso</h3>
        <div className="space-y-2.5">
          {caso.achados.map((d) => (
            <div key={d.titulo} className="flex items-center gap-3 rounded-xl border border-navy/25 bg-card p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-navy">{d.titulo}</div>
                <div className="text-[12px] text-navy/70">{d.data}</div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Entregue
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-navy/25 bg-card p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50">
              <Eye className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-navy">Dossiê consolidado</div>
              <div className="text-[12px] text-navy/70">em revisão</div>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              Em revisão
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------- BIBLIO + LEGADO -------- */
function BiblioTab({
  caso,
  registro,
  onOpenRelatorio,
  onOpenFase02,
}: {
  caso: Caso;
  registro: import("@/data/case-registry").CaseRecord;
  onOpenRelatorio?: () => void;
  onOpenFase02?: () => void;
}) {
  const proposta = propostaByCaso(caso.id);
  const entregas = entregasByCaso(caso);
  return (

    <div className="space-y-6 p-5" data-tab="biblio">
      <section>
        <div className="mb-1 text-[11px] uppercase tracking-widest text-terracotta">Biblioteca da jornada</div>
        <h2 className="font-serif text-2xl text-navy">Relatórios da jornada</h2>
        <p className="mt-1 text-[12px] italic text-navy/70">
          Fase 01 e Fase 02 ficam arquivadas aqui, junto com a linha do tempo e o catálogo documental.
        </p>
        <div className="mt-4 space-y-3">
          {registro.reports.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-4 text-[12px] text-navy/60">
              Nenhuma entrega arquivada ainda — as fases aparecem aqui assim que forem criadas.
            </div>
          )}
          {registro.reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-navy/20 bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-widest text-terracotta">{r.tipo}</div>
                  <div className="font-serif text-lg leading-snug text-navy">{r.titulo}</div>
                </div>
                <span className="shrink-0 rounded-full border border-navy/20 bg-areia px-2.5 py-0.5 text-[11px] font-semibold text-navy">
                  {r.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-navy/60">
                <span>
                  Versão {r.versao} · atualizado em {r.atualizadoEm} · {r.responsavel}
                </span>
                <button
                  onClick={() =>
                    r.tipo === "Fase 02 — Relatório Completo" ? onOpenFase02?.() : onOpenRelatorio?.()
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-navy/20 px-3 py-1 font-semibold text-navy transition hover:bg-navy hover:text-cream"
                >
                  Abrir <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1 text-[11px] uppercase tracking-widest text-terracotta">Entregas da jornada</div>
        <h2 className="font-serif text-2xl text-navy">Relatórios da sua família</h2>
        <p className="mt-1 text-[12px] italic text-navy/70">
          Biblioteca histórica das entregas do Clube Ancestral — cada etapa fica registrada aqui.
        </p>
        <div className="mt-4 space-y-3">
          {entregas.map((e) => (
            <div key={e.id} className="rounded-xl border border-navy/25 bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-widest text-terracotta">{e.etapa}</div>
                  <div className="font-serif text-lg leading-snug text-navy">{e.titulo}</div>
                </div>
                <span className="shrink-0 rounded-full border border-navy/20 bg-areia px-2.5 py-0.5 text-[11px] font-semibold text-navy">
                  {STATUS_LABEL[e.status]}
                </span>
              </div>
              <div className="mt-1.5 text-[12px] text-navy/70">{e.descricao}</div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-navy/60">
                  <Calendar className="h-3 w-3" />
                  {e.data}
                </span>
                <button
                  onClick={() => e.abreRelatorio && onOpenRelatorio?.()}
                  className="inline-flex items-center gap-1 rounded-full border border-navy/20 px-3 py-1 text-[11px] font-semibold text-navy transition hover:bg-navy hover:text-cream"
                >
                  {e.abreRelatorio ? "Abrir relatório" : "Ver entrega"} <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1 text-[11px] uppercase tracking-widest text-terracotta">Biblioteca</div>
        <h2 className="font-serif text-2xl text-navy">Seus Achados</h2>
        <div className="mt-4 space-y-3">

          {caso.achados.map((x) => (
            <div key={x.titulo} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[11px] uppercase tracking-widest text-terracotta">Achado</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-navy/70">
                  <Calendar className="h-3 w-3" />
                  {x.data}
                </span>
              </div>
              <div className="font-serif text-lg leading-snug text-navy">{x.titulo}</div>
              <div className="mt-1.5 text-[12px] text-navy/70">{x.desc}</div>
              <button className="mt-3 inline-flex items-center gap-1 rounded-full border border-navy/20 px-3 py-1 text-[11px] font-semibold text-navy transition hover:bg-navy hover:text-cream">
                Ver detalhes <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-plum/40 bg-gradient-to-br from-plum via-plum to-[#5B3877] p-6 text-cream">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%)" }}
        />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] uppercase tracking-widest text-cream">
            <Lock className="h-3 w-3" /> {PLANO_LEGADO.nome} — upsell
          </div>
          <h3 className="font-serif text-2xl italic">Desbloqueie sua História Familiar</h3>
          <p className="mt-2 text-sm text-cream/80">
            Upsells mapeados na proposta do caso {proposta.casoId} (Planilha Mestre de Produtos).
          </p>
          <ul className="mt-4 space-y-1 text-xs text-cream/80">
            {proposta.upsells.map((u) => (
              <li key={u.sku}>
                · {u.nome} — {brl(u.valor)}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-cream/70">A partir de</div>
              <div className="font-serif text-xl text-gold">
                {brl(proposta.upsells.length ? Math.min(...proposta.upsells.map((u) => u.valor)) : PLANO_LEGADO.precoRef)}
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy">
              Conhecer plano Legado <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
