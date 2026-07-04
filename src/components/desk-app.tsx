import { useState } from "react";
import { cn } from "@/lib/utils";
import { RadarChart } from "./cliente-app";
import {
  LayoutGrid, Users, ListChecks, Radar as RadarIcon, Bell, Library,
  TrendingUp, DollarSign, Send, AlertTriangle, CheckCircle2, Circle, Clock,
} from "lucide-react";

type Section = "overview" | "casos" | "checklist" | "radar" | "alertas" | "biblio";

export function DeskApp() {
  const [sec, setSec] = useState<Section>("overview");
  const nav = [
    ["overview", LayoutGrid, "Visão Geral"],
    ["casos", Users, "Casos 360"],
    ["checklist", ListChecks, "Checklist"],
    ["radar", RadarIcon, "Radar Interno"],
    ["alertas", Bell, "Alertas"],
    ["biblio", Library, "Biblioteca Mestre"],
  ] as const;

  return (
    <div className="flex min-h-[calc(100vh-52px)] bg-cream">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-navy text-cream md:flex md:flex-col">
        <div className="border-b border-cream/10 px-5 py-4">
          <div className="text-[10px] uppercase tracking-widest text-gold">Interno</div>
          <div className="font-serif text-lg italic text-cream">Desk Intelligence</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setSec(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                sec === id ? "bg-gold text-navy font-semibold" : "text-cream/80 hover:bg-navy-soft"
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
        <div className="border-t border-cream/10 p-4 text-xs text-cream/50">
          Equipe · 4 analistas online
        </div>
      </aside>

      {/* mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-border bg-navy text-cream md:hidden">
        {nav.map(([id, Icon]) => (
          <button
            key={id}
            onClick={() => setSec(id)}
            className={cn("flex flex-col items-center gap-1 py-2 text-[10px]",
              sec === id ? "text-gold" : "text-cream/70")}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-x-hidden px-6 py-8 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl">
          {sec === "overview" && <Overview />}
          {sec === "casos" && <Casos />}
          {sec === "checklist" && <Checklist />}
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
    { l: "Taxa de conversão", v: "34%", i: TrendingUp, tint: "bg-emerald-600 text-white" },
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.l}</div>
            <div className="mt-1 font-serif text-3xl text-navy">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-serif text-lg text-navy">Alertas de achados pendentes</h3>
            <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">5 não enviados</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Dias em espera</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((a) => (
                <tr key={a.c} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-navy">{a.c}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.t}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold",
                      a.d > 5 ? "bg-terracotta/15 text-terracotta" : "bg-orange-100 text-orange-700")}>
                      {a.d}d
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-cream">
                      <Send className="h-3 w-3" /> Enviar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-serif text-lg text-navy">Prioridades de hoje</h3>
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li key={c.t} className="flex items-start gap-3">
                {c.tone === "done" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
                {c.tone === "todo" && <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
                {c.tone === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-terracotta" />}
                <span className={cn("text-sm", c.tone === "done" ? "text-muted-foreground line-through" : "text-navy")}>
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
                <td className="px-5 py-3 font-medium text-navy">{r.n}</td>
                <td className="px-5 py-3">{r.p}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.e}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", dot[r.h as keyof typeof dot])} />
                    <span className="text-xs capitalize text-muted-foreground">
                      {r.h === "emerald" ? "saudável" : r.h === "orange" ? "atenção" : "crítico"}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.a}</td>
                <td className="px-5 py-3 text-right font-serif text-navy">{r.t}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <p className="mt-1 text-sm text-muted-foreground">A ferramenta interna mais usada — o que precisa acontecer agora.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((s) => {
          const st = styles[s.tone];
          return (
            <div key={s.title} className={cn("rounded-2xl border-2 p-5 shadow-sm", st.border, st.bg)}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-navy">{s.title}</h3>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", st.chip)}>
                  {s.items.length}
                </span>
              </div>
              <ul className="space-y-3">
                {s.items.map((it, i) => {
                  const done = s.tone === "confirm";
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-lg bg-white/70 p-3">
                      <st.Icon className={cn("mt-0.5 h-4 w-4 shrink-0", st.iconColor)} />
                      <span className={cn("text-sm", done ? "text-muted-foreground line-through" : "text-navy font-medium")}>{it}</span>
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

/* --- Radar Interno --- */
function RadarInterno() {
  const axes = [
    { k: "Documentação", v: 0 }, { k: "Origem", v: 0 }, { k: "Conexões", v: 0 },
    { k: "Elegibilidade", v: 0 }, { k: "Memória", v: 0 }, { k: "Legado", v: 0 },
  ];
  const polys = [
    { name: "Marina Alves",   values: [78, 90, 65, 72, 55, 40], color: "#C9A84C" },
    { name: "Ricardo Vieira", values: [55, 60, 80, 50, 70, 30], color: "#1B2B4B" },
    { name: "Camila Santos",  values: [88, 72, 60, 90, 80, 65], color: "#8B4513" },
    { name: "João Ferreira",  values: [40, 50, 45, 55, 35, 20], color: "#4B7A6B" },
  ];
  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold">Análise comparativa</div>
        <h1 className="font-serif text-3xl italic text-navy">Radar Interno</h1>
        <p className="mt-1 text-sm text-muted-foreground">Equilíbrio dos casos ativos, sobrepostos para leitura rápida.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:col-span-2">
          <RadarChart axes={axes} size={440} polygons={polys} />
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-serif text-lg text-navy">Legenda</h3>
          <ul className="space-y-3">
            {polys.map((p) => (
              <li key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                  <span className="text-sm text-navy">{p.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  méd. {Math.round(p.values.reduce((a, b) => a + b, 0) / p.values.length)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            Use este painel para identificar clientes com dimensões desequilibradas e priorizar entregas.
          </div>
        </div>
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
        <table className="w-full text-sm">
          <thead className="bg-navy text-cream text-left text-[11px] uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Descoberta</th>
              <th className="px-5 py-3">Espera</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="px-5 py-3 font-medium text-navy">{r.c}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.t}</td>
                <td className="px-5 py-3 text-muted-foreground italic">{r.d}</td>
                <td className="px-5 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold",
                    r.w > 5 ? "bg-terracotta/15 text-terracotta" : "bg-orange-100 text-orange-700")}>
                    {r.w}d
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold",
                    r.s === "novo" && "bg-blue-100 text-blue-700",
                    r.s === "revisado" && "bg-emerald-100 text-emerald-700",
                    r.s === "urgente" && "bg-red-100 text-red-700",
                  )}>{r.s}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy">
                    <Send className="h-3 w-3" /> Enviar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <p className="mt-1 text-sm text-muted-foreground">Todos os conteúdos produzidos, organizados por caso.</p>
      </header>

      {groups.map((g) => (
        <section key={g.client}>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl text-navy">{g.client}</h3>
            <span className="text-xs text-muted-foreground">{g.items.length} peças</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((it) => (
              <div key={it.t} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-gold">{it.type}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", chip(it.s))}>{it.s}</span>
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
