import { useState } from "react";
import { cn } from "@/lib/utils";
import { RadarChart } from "./cliente-app";
import { BrandLogo } from "./brand";
import {
  CASOS, ETAPAS, INTEGRACOES, STATUS_APP, brl, painelUniversal, resumoCaso,
} from "@/data/casos";
import {
  LayoutGrid, Users, ListChecks, Radar as RadarIcon, Bell, Library,
  TrendingUp, DollarSign, Send, AlertTriangle, CheckCircle2, Circle, Clock,
  Scale, Wallet, Plug, Smartphone,
} from "lucide-react";

type Section =
  | "overview" | "casos" | "checklist" | "juridica" | "radar" | "alertas" | "biblio"
  | "financeiro" | "appcliente" | "integracoes";

export function DeskApp() {
  const [sec, setSec] = useState<Section>("overview");
  const nav = [
    ["overview", LayoutGrid, "Visão Geral"],
    ["casos", Users, "Casos 360"],
    ["appcliente", Smartphone, "Checklist AppCliente"],
    ["financeiro", Wallet, "Financeiro"],
    ["checklist", ListChecks, "Checklist"],
    ["juridica", Scale, "Validação Jurídica"],
    ["radar", RadarIcon, "Radar Interno"],
    ["alertas", Bell, "Alertas"],
    ["integracoes", Plug, "Integrações"],
    ["biblio", Library, "Biblioteca Mestre"],
  ] as const;

  return (
    <div className="flex min-h-[calc(100vh-52px)] bg-cream">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-navy text-cream md:sticky md:top-[52px] md:flex md:h-[calc(100vh-52px)] md:flex-col">
        <div className="border-b border-cream/10 px-5 py-4">
          <BrandLogo size={30} showText={true} textColor="#C9A84C" />
          <div className="mt-2 text-[11px] uppercase tracking-widest text-gold/80">Desk Intelligence</div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">

          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setSec(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition text-left",
                sec === id ? "bg-gold text-navy font-semibold" : "text-cream/80 hover:bg-navy-soft"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" /><span className="truncate">{label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-cream/10 p-4 text-xs text-cream/50">
          Equipe · 4 analistas online
        </div>
      </aside>

      {/* mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-7 border-t border-border bg-navy text-cream md:hidden">
        {nav.map(([id, Icon]) => (
          <button
            key={id}
            onClick={() => setSec(id)}
            className={cn("flex flex-col items-center gap-1 py-2 text-[11px]",
              sec === id ? "text-gold" : "text-cream/70")}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-x-hidden px-5 py-8 pb-24 md:px-8 md:pb-10">
        <div className="mx-auto max-w-6xl">
          {sec === "overview" && <Overview />}
          {sec === "casos" && <Casos />}
          {sec === "checklist" && <Checklist />}
          {sec === "juridica" && <ValidacaoJuridica />}
          {sec === "radar" && <RadarInterno />}
          {sec === "alertas" && <Alertas />}
          {sec === "biblio" && <BiblioMestre />}
        </div>
      </main>
    </div>
  );
}

/* --- Overview --- */
function Overview() {
  const kpis = [
    { l: "Casos ativos", v: "23", i: Users, tint: "bg-navy text-cream" },
    { l: "Alertas pendentes", v: "7", i: Bell, tint: "bg-terracotta text-cream" },
    { l: "Receita do mês", v: "R$ 18.400", i: DollarSign, tint: "bg-gold text-navy" },
    { l: "Taxa de conversão", v: "34%", i: TrendingUp, tint: "bg-sage text-white" },
  ];
  const alerts = [
    { c: "Marina Alves", t: "Achado documental", d: 2 },
    { c: "Ricardo Vieira", t: "Nova conexão familiar", d: 4 },
    { c: "Camila Santos", t: "Registro paroquial", d: 5 },
    { c: "João Ferreira", t: "Contexto histórico", d: 7 },
    { c: "Beatriz Lima", t: "Certidão validada", d: 9 },
  ];
  const checklist = [
    { t: "Revisar dossiê Alves", tone: "done" },
    { t: "Enviar micro-entrega Vieira", tone: "todo" },
    { t: "Confirmar certidão consular Lima", tone: "warn" },
  ];
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Visão geral · Julho 2026</div>
        <h1 className="font-serif text-3xl italic text-navy">Bom dia, equipe.</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className={cn("mb-4 grid h-10 w-10 place-items-center rounded-lg", k.tint)}>
              <k.i className="h-5 w-5" />
            </div>
            <div className="text-xs uppercase tracking-wide text-navy/70">{k.l}</div>
            <div className="mt-1 font-serif text-3xl text-navy">{k.v}</div>
          </div>
        ))}
      </div>

      {/* Funil de leads */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-navy">Funil de leads</h3>
          <span className="text-[11px] uppercase tracking-widest text-gold">Últimos 30 dias</span>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { l: "Novos leads", v: "58", bar: 100, c: "bg-navy" },
            { l: "Leads em WhatsApp", v: "31", bar: 53, c: "bg-sage" },
            { l: "Lead → diagnóstico", v: "42%", bar: 42, c: "bg-gold" },
            { l: "Lead → cliente", v: "12%", bar: 12, c: "bg-terracotta" },
          ].map((f) => (
            <div key={f.l} className="rounded-xl border border-border bg-cream/60 p-4">
              <div className="text-xs uppercase tracking-wide text-navy/70">{f.l}</div>
              <div className="mt-1 font-serif text-2xl text-navy">{f.v}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", f.c)} style={{ width: `${f.bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-2xl border border-border bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-serif text-lg text-navy">Alertas de achados pendentes</h3>
            <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">5 não enviados</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-navy/70">
                <tr>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Espera</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((a) => (
                  <tr key={a.c} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-navy whitespace-nowrap">{a.c}</td>
                    <td className="px-5 py-3 text-navy/75">{a.t}</td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                        a.d > 5 ? "bg-terracotta/15 text-terracotta" : "bg-orange-100 text-orange-700")}>
                        {a.d}d
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-cream whitespace-nowrap">
                        <Send className="h-3 w-3" /> Enviar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-serif text-lg text-navy">Prioridades de hoje</h3>
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li key={c.t} className="flex items-start gap-3">
                {c.tone === "done" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
                {c.tone === "todo" && <Circle className="mt-0.5 h-4 w-4 text-sage" />}
                {c.tone === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-terracotta" />}
                <span className={cn("text-sm", c.tone === "done" ? "text-navy/50 line-through" : "text-navy")}>
                  {c.t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* --- Casos 360 --- */
function Casos() {
  const rows = [
    { n: "Marina Alves", p: "Portugal", e: "Reconstrução", h: "emerald", a: "Enviar micro-entrega", t: "R$ 8.400" },
    { n: "Ricardo Vieira", p: "Itália", e: "Coleta inicial", h: "orange", a: "Solicitar certidão", t: "R$ 5.200" },
    { n: "Camila Santos", p: "Espanha", e: "Validação", h: "emerald", a: "Revisar dossiê", t: "R$ 12.900" },
    { n: "João Ferreira", p: "Portugal", e: "Kickoff", h: "orange", a: "Agendar chamada", t: "R$ 3.100" },
    { n: "Beatriz Lima", p: "Alemanha", e: "Requerimento", h: "red", a: "Corrigir documento", t: "R$ 14.700" },
    { n: "Paulo Neto", p: "Itália", e: "Reconstrução", h: "emerald", a: "Confirmar linhagem", t: "R$ 9.800" },
  ];
  const dot = { emerald: "bg-emerald-500", orange: "bg-orange-500", red: "bg-red-500" };
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Operação</div>
        <h1 className="font-serif text-3xl italic text-navy">Casos 360</h1>
      </header>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy text-cream text-left text-[11px] uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">País alvo</th>
                <th className="px-5 py-3">Estágio</th>
                <th className="px-5 py-3">Saúde</th>
                <th className="px-5 py-3">Próxima ação</th>
                <th className="px-5 py-3 text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.n} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy whitespace-nowrap">{r.n}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{r.p}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs whitespace-nowrap">{r.e}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className={cn("h-2.5 w-2.5 rounded-full", dot[r.h as keyof typeof dot])} />
                      <span className="text-[12px] capitalize text-navy/75">
                        {r.h === "emerald" ? "saudável" : r.h === "orange" ? "atenção" : "crítico"}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-navy/75">{r.a}</td>
                  <td className="px-5 py-3 text-right font-serif text-navy whitespace-nowrap">{r.t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- Checklist --- */
function Checklist() {
  const sections: { title: string; tone: "confirm" | "review" | "critical"; items: string[] }[] = [
    { title: "Confirmar", tone: "confirm", items: ["Dossiê Marina Alves — pronto para envio", "Micro-entrega Camila Santos aprovada", "Certidão consular João Ferreira validada"] },
    { title: "Em Revisão", tone: "review", items: ["Registro paroquial Vieira — 1887", "Narrativa contextual Santos", "Fotografia restaurada Lima", "Transcrição livro Coimbra"] },
    { title: "Pendente Crítico", tone: "critical", items: ["Corrigir data no dossiê Beatriz Lima", "Reenviar procuração Paulo Neto", "Prazo consular Alemanha — 3 dias"] },
  ];
  const styles = {
    confirm:  { border: "border-emerald-300", bg: "bg-emerald-50",  chip: "bg-emerald-600 text-white", Icon: CheckCircle2, iconColor: "text-emerald-600" },
    review:   { border: "border-blue-300",    bg: "bg-blue-50",     chip: "bg-blue-600 text-white",    Icon: Clock,        iconColor: "text-blue-600" },
    critical: { border: "border-red-400",     bg: "bg-red-50",      chip: "bg-red-600 text-white",     Icon: AlertTriangle, iconColor: "text-red-600" },
  };
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Prioridade máxima</div>
        <h1 className="font-serif text-3xl italic text-navy">Checklist da Semana</h1>
        <p className="mt-1 text-[13px] text-navy/70">A ferramenta interna mais usada — o que precisa acontecer agora.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((s) => {
          const st = styles[s.tone];
          return (
            <div key={s.title} className={cn("rounded-2xl border-2 p-5 shadow-sm", st.border, st.bg)}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-navy">{s.title}</h3>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", st.chip)}>
                  {s.items.length}
                </span>
              </div>
              <ul className="space-y-3">
                {s.items.map((it, i) => {
                  const done = s.tone === "confirm";
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-lg bg-white/70 p-3">
                      <st.Icon className={cn("mt-0.5 h-4 w-4 shrink-0", st.iconColor)} />
                      <span className={cn("text-sm", done ? "text-navy/50 line-through" : "text-navy font-medium")}>{it}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- Validação Jurídica --- */
function ValidacaoJuridica() {
  const rows = [
    { c: "Marina Alves",   p: "Portugal",  cr: "Bisneto de português (Lei 37/81)", g: "3ª geração", s: "Confirmado", obs: "Documentação civil consistente." },
    { c: "Ricardo Vieira", p: "Itália",    cr: "Jus sanguinis sem interrupção",     g: "4ª geração", s: "Em Análise", obs: "Falta certidão de casamento 1902." },
    { c: "Camila Santos",  p: "Espanha",   cr: "Lei de Memória Democrática",         g: "2ª geração", s: "Confirmado", obs: "Ancestral perseguido — prazo até 2025." },
    { c: "João Ferreira",  p: "Portugal",  cr: "Neto de português (art. 1º-B)",     g: "2ª geração", s: "Pendente",   obs: "Necessária prova de vínculo cultural." },
    { c: "Beatriz Lima",   p: "Alemanha",  cr: "§ 15 StAG (reparação)",              g: "3ª geração", s: "Em Análise", obs: "Ascendente vítima do regime nazista." },
    { c: "Paulo Neto",     p: "Itália",    cr: "1948 case — linha materna",          g: "3ª geração", s: "Confirmado", obs: "Requer ação judicial em Roma." },
  ];
  const badge = (s: string) =>
    s === "Confirmado" ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
    s === "Em Análise" ? "bg-blue-100 text-blue-700 border-blue-300" :
    "bg-orange-100 text-orange-700 border-orange-300";
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Elegibilidade & viabilidade</div>
        <h1 className="font-serif text-3xl italic text-navy">Validação Jurídica</h1>
        <p className="mt-1 text-[13px] text-navy/70">Critérios legais aplicáveis a cada caso.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">

            <thead className="bg-navy text-cream text-left text-[11px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">País Alvo</th>
                <th className="px-4 py-3">Critério Jurídico</th>
                <th className="px-4 py-3">Geração</th>
                <th className="px-4 py-3">Elegibilidade</th>
                <th className="px-4 py-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.c} className="hover:bg-muted/30 align-top">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{r.c}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.p}</td>
                  <td className="px-4 py-3 text-navy">{r.cr}</td>
                  <td className="px-4 py-3 text-navy/75 whitespace-nowrap">{r.g}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", badge(r.s))}>{r.s}</span>
                  </td>
                  <td className="px-4 py-3 text-navy/75 italic">{r.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- Radar Interno --- */
type Client = { name: string; eleg: number; urg: number; health: "green" | "yellow" | "red"; values: number[] };
const CLIENTS: Client[] = [
  { name: "Marina Alves",    eleg: 82, urg: 60, health: "green",  values: [78, 90, 65, 82, 55, 40] },
  { name: "Ricardo Vieira",  eleg: 55, urg: 70, health: "yellow", values: [55, 60, 80, 55, 70, 30] },
  { name: "Camila Santos",   eleg: 88, urg: 45, health: "green",  values: [88, 72, 60, 88, 80, 65] },
  { name: "João Ferreira",   eleg: 40, urg: 55, health: "yellow", values: [40, 50, 45, 40, 35, 20] },
  { name: "Beatriz Lima",    eleg: 62, urg: 92, health: "red",    values: [70, 65, 55, 62, 50, 30] },
  { name: "Paulo Neto",      eleg: 75, urg: 30, health: "green",  values: [75, 78, 68, 75, 60, 45] },
  { name: "Helena Duarte",   eleg: 45, urg: 82, health: "red",    values: [45, 50, 40, 45, 30, 25] },
  { name: "Rafael Costa",    eleg: 90, urg: 20, health: "green",  values: [90, 82, 78, 90, 70, 60] },
  { name: "Sofia Mendes",    eleg: 30, urg: 65, health: "yellow", values: [30, 40, 35, 30, 25, 15] },
  { name: "Otávio Pires",    eleg: 68, urg: 78, health: "yellow", values: [68, 60, 55, 68, 45, 40] },
  { name: "Luana Braga",     eleg: 85, urg: 50, health: "green",  values: [85, 80, 72, 85, 65, 55] },
  { name: "Diego Nogueira",  eleg: 50, urg: 88, health: "red",    values: [50, 55, 48, 50, 40, 30] },
];

function RadarInterno() {
  const [view, setView] = useState<"matrix" | "individual">("matrix");
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Análise comparativa</div>
        <h1 className="font-serif text-3xl italic text-navy">Radar Interno</h1>
        <p className="mt-1 text-[13px] text-navy/70">Priorização estratégica dos casos ativos.</p>
      </header>

      <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
        {(["matrix", "individual"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              view === v ? "bg-navy text-cream" : "text-sage hover:text-navy"
            )}
          >
            {v === "matrix" ? "Matriz de Prioridade" : "Radar Individual"}
          </button>
        ))}
      </div>

      {view === "matrix" ? <PriorityMatrix /> : <RadarIndividual />}
    </div>
  );
}

function PriorityMatrix() {
  const size = 520;
  const pad = 44;
  const w = size - pad * 2;
  const dotColor = { green: "#059669", yellow: "#D97706", red: "#DC2626" };
  const x = (v: number) => pad + (v / 100) * w;
  const y = (v: number) => pad + (1 - v / 100) * w;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="overflow-x-auto rounded-2xl border border-border bg-white p-5 shadow-sm">
        <svg viewBox={`0 0 ${size} ${size + 30}`} className="mx-auto block w-full min-w-[420px]">
          {/* Quadrants */}
          <rect x={pad} y={pad} width={w / 2} height={w / 2} fill="#F5F0E8" opacity="0.6" />
          <rect x={pad + w / 2} y={pad} width={w / 2} height={w / 2} fill="#C9A84C" opacity="0.15" />
          <rect x={pad} y={pad + w / 2} width={w / 2} height={w / 2} fill="#8B4513" opacity="0.08" />
          <rect x={pad + w / 2} y={pad + w / 2} width={w / 2} height={w / 2} fill="#6B7B5E" opacity="0.10" />

          {/* Grid */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v} stroke="#E4DBC8" strokeWidth="0.5">
              <line x1={x(v)} y1={pad} x2={x(v)} y2={pad + w} />
              <line x1={pad} y1={y(v)} x2={pad + w} y2={y(v)} />
            </g>
          ))}
          {/* Axes */}
          <line x1={pad} y1={pad + w} x2={pad + w} y2={pad + w} stroke="#1B2B4B" strokeWidth="1.5" />
          <line x1={pad} y1={pad} x2={pad} y2={pad + w} stroke="#1B2B4B" strokeWidth="1.5" />

          {/* Quadrant labels */}
          <text x={pad + w * 0.75} y={pad + 18} textAnchor="middle" fontSize="10" fill="#1B2B4B" fontWeight="700">AGIR AGORA</text>
          <text x={pad + w * 0.25} y={pad + 18} textAnchor="middle" fontSize="10" fill="#8B4513" fontWeight="700">AVALIAR</text>
          <text x={pad + w * 0.75} y={pad + w - 8} textAnchor="middle" fontSize="10" fill="#6B7B5E" fontWeight="700">CULTIVAR</text>
          <text x={pad + w * 0.25} y={pad + w - 8} textAnchor="middle" fontSize="10" fill="#8B4513" fontWeight="700">MONITORAR</text>

          {/* Axis labels */}
          <text x={pad + w / 2} y={size + 20} textAnchor="middle" fontSize="11" fill="#1B2B4B" fontWeight="600">Elegibilidade →</text>
          <text x={14} y={pad + w / 2} textAnchor="middle" fontSize="11" fill="#1B2B4B" fontWeight="600" transform={`rotate(-90 14 ${pad + w / 2})`}>Urgência →</text>

          {/* Dots */}
          {CLIENTS.map((c) => (
            <g key={c.name}>
              <circle cx={x(c.eleg)} cy={y(c.urg)} r="8" fill={dotColor[c.health]} stroke="#fff" strokeWidth="2" />
              <text x={x(c.eleg) + 12} y={y(c.urg) + 3} fontSize="9" fill="#1B2B4B" fontWeight="600">{c.name}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-lg text-navy">Legenda — saúde</h3>
          <ul className="space-y-2 text-sm">
            {[
              { c: "#059669", l: "Saudável", n: CLIENTS.filter(c => c.health === "green").length },
              { c: "#D97706", l: "Atenção", n: CLIENTS.filter(c => c.health === "yellow").length },
              { c: "#DC2626", l: "Crítico", n: CLIENTS.filter(c => c.health === "red").length },
            ].map((it) => (
              <li key={it.l} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: it.c }} />
                  <span className="text-navy">{it.l}</span>
                </div>
                <span className="text-[12px] text-navy/70">{it.n} casos</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-muted/60 p-4 text-[12px] text-navy/70">
          Cada ponto é um cliente ativo. Priorize o quadrante superior direito — alta elegibilidade e alta urgência — para maximizar conversão.
        </div>
      </div>
    </div>
  );
}

function RadarIndividual() {
  const [sel, setSel] = useState<string>(CLIENTS[0].name);
  const client = CLIENTS.find((c) => c.name === sel)!;
  const axes = [
    { k: "Documentação", v: client.values[0] },
    { k: "Origem", v: client.values[1] },
    { k: "Conexões", v: client.values[2] },
    { k: "Elegibilidade", v: client.values[3] },
    { k: "Memória", v: client.values[4] },
    { k: "Legado", v: client.values[5] },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gold">Cliente</div>
            <div className="font-serif text-xl text-navy">{client.name}</div>
          </div>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="rounded-lg border border-border bg-cream px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {CLIENTS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <RadarChart axes={axes} size={440} color="#C9A84C" />
      </div>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-serif text-lg text-navy">Dimensões</h3>
        <ul className="space-y-3">
          {axes.map((a) => (
            <li key={a.k}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-navy">{a.k}</span>
                <span className="font-semibold text-gold">{a.v}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gold" style={{ width: `${a.v}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --- Alertas --- */
function Alertas() {
  const rows = [
    { c: "Marina Alves",   t: "Achado documental",       d: "Registro batismo Coimbra 1887", w: 2, s: "novo" },
    { c: "Ricardo Vieira", t: "Nova conexão familiar",   d: "Ramo materno identificado — Napoli", w: 4, s: "novo" },
    { c: "Camila Santos",  t: "Registro paroquial",      d: "Livro S. Maria pág. 142", w: 5, s: "revisado" },
    { c: "João Ferreira",  t: "Contexto histórico",      d: "Emigração 1920 — Minho", w: 7, s: "revisado" },
    { c: "Beatriz Lima",   t: "Certidão validada",       d: "Consulado alemão confirmou", w: 9, s: "urgente" },
    { c: "Paulo Neto",     t: "Fotografia restaurada",   d: "Foto do 1º avô — 1932", w: 3, s: "novo" },
    { c: "Helena Duarte",  t: "Narrativa produzida",     d: "Capítulo 2 do dossiê pronto", w: 1, s: "novo" },
  ];
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Gestão de descobertas</div>
        <h1 className="font-serif text-3xl italic text-navy">Alertas</h1>
      </header>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy text-cream text-left text-[11px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Descoberta</th>
                <th className="px-4 py-3">Espera</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{r.c}</td>
                  <td className="px-4 py-3 text-navy/75 whitespace-nowrap">{r.t}</td>
                  <td className="px-4 py-3 text-navy/75 italic">{r.d}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                      r.w > 5 ? "bg-terracotta/15 text-terracotta" : "bg-orange-100 text-orange-700")}>
                      {r.w}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide font-semibold whitespace-nowrap",
                      r.s === "novo" && "bg-blue-100 text-blue-700",
                      r.s === "revisado" && "bg-emerald-100 text-emerald-700",
                      r.s === "urgente" && "bg-red-100 text-red-700",
                    )}>{r.s}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy whitespace-nowrap">
                      <Send className="h-3 w-3" /> Enviar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- Biblioteca Mestre --- */
function BiblioMestre() {
  const groups = [
    { client: "Marina Alves", items: [
      { t: "Dossiê linhagem paterna", type: "Dossiê", s: "Publicado" },
      { t: "Registro Coimbra 1887",   type: "Registro", s: "Publicado" },
      { t: "Narrativa emigração",     type: "Narrativa", s: "Em produção" },
    ]},
    { client: "Ricardo Vieira", items: [
      { t: "Dossiê Napoli",          type: "Dossiê", s: "Em produção" },
      { t: "Certidão civil 1902",    type: "Registro", s: "Revisão" },
    ]},
    { client: "Camila Santos", items: [
      { t: "Narrativa Andaluzia",    type: "Narrativa", s: "Publicado" },
      { t: "Dossiê consolidado",     type: "Dossiê", s: "Publicado" },
      { t: "Álbum fotográfico",      type: "Registro", s: "Em produção" },
    ]},
  ];
  const chip = (s: string) =>
    s === "Publicado" ? "bg-emerald-100 text-emerald-700" :
    s === "Revisão" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700";
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Curadoria interna</div>
        <h1 className="font-serif text-3xl italic text-navy">Biblioteca Mestre</h1>
        <p className="mt-1 text-[13px] text-navy/70">Todos os conteúdos produzidos, organizados por caso.</p>
      </header>

      {groups.map((g) => (
        <section key={g.client}>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl text-navy">{g.client}</h3>
            <span className="text-[12px] text-navy/70">{g.items.length} peças</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((it) => (
              <div key={it.t} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-gold">{it.type}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", chip(it.s))}>{it.s}</span>
                </div>
                <div className="font-serif text-lg text-navy">{it.t}</div>
                <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-cream to-muted" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
