import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand";
import {
  Home, Route as RouteIcon, Radar, TreeDeciduous, FileText, BookOpen,
  Sparkles, Clock, CheckCircle2, Eye, Lock, ArrowRight, Users, User,
  MessageCircle, Calendar, ChevronRight, ArrowLeft, Search, Check,
} from "lucide-react";

type Tab = "home" | "jornada" | "radar" | "arvore" | "docs" | "biblio" | "conta";

export function ClienteApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [showConta, setShowConta] = useState(false);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-52px)] w-full max-w-md flex-col bg-cream">
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
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy overflow-hidden">
                <BrandLogo size={36} showText={false} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest text-gold/80">Bem-vinda</div>
                <div className="font-serif text-lg italic truncate">Marina Alves</div>
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

      <main className="flex-1 overflow-y-auto pb-28">
        {showConta ? (
          <ContaScreen />
        ) : (
          <>
            {tab === "home" && <HomeTab />}
            {tab === "jornada" && <JornadaTab />}
            {tab === "radar" && <RadarTab />}
            {tab === "arvore" && <ArvoreTab />}
            {tab === "docs" && <DocsTab />}
            {tab === "biblio" && <BiblioTab />}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-white/95 backdrop-blur">
        <div className="grid grid-cols-6">
          {([
            ["home", Home, "Home"],
            ["jornada", RouteIcon, "Jornada"],
            ["radar", Radar, "Radar"],
            ["arvore", TreeDeciduous, "Árvore"],
            ["docs", FileText, "Docs"],
            ["biblio", BookOpen, "Legado"],
          ] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setShowConta(false); }}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                !showConta && tab === id ? "text-navy" : "text-muted-foreground hover:text-navy"
              )}
            >
              <Icon className={cn("h-5 w-5", !showConta && tab === id && "text-gold")} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* -------- CONTA -------- */
function ContaScreen() {
  const history = [
    { t: "📄 Certidão recebida", d: "28 jun 2026" },
    { t: "🔎 Achado documental", d: "15 jun 2026" },
    { t: "✅ Pesquisa confirmada", d: "10 jun 2026" },
    { t: "💬 Consulta realizada", d: "02 jun 2026" },
    { t: "🎯 Caso iniciado", d: "15 jan 2024" },
  ];
  return (
    <div className="space-y-6 p-5">
      {/* SECTION A — Perfil */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-navy text-2xl font-serif italic text-gold">MA</div>
          <div className="min-w-0">
            <div className="font-serif text-xl text-navy truncate">Marina Alves</div>
            <div className="text-xs text-sage truncate">marina.alves@email.com</div>
            <div className="text-xs text-sage">WhatsApp: +55 11 98765-4321</div>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-3 text-xs text-sage">
          Membro desde: <span className="font-semibold text-navy">Janeiro 2024</span>
        </div>
      </section>

      {/* SECTION B — Meu Plano */}
      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">Meu Plano</h3>
        <div className="mb-3 flex items-center justify-between rounded-xl border border-navy/20 bg-navy p-4 text-cream">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gold/80">Plano atual</div>
            <div className="font-serif text-lg italic text-gold">Plano Essencial</div>
          </div>
          <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold text-navy">ATIVO</span>
        </div>

        {/* Upsell card */}
        <div className="rounded-2xl border border-gold/50 bg-cream p-5 shadow-sm">
          <div className="mb-1 text-base font-semibold text-navy">👨‍👩‍👧 Familiar Conectado</div>
          <div className="text-xs text-sage">Inclua até 4 familiares na sua jornada</div>
          <ul className="mt-3 space-y-1.5 text-sm text-navy">
            <li>✓ Acesso compartilhado para toda a família</li>
            <li>✓ Alertas de WhatsApp para cada membro</li>
            <li>✓ Árvore familiar colaborativa</li>
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-sage">A partir de</div>
              <div className="font-serif text-lg text-navy">R$ 269<span className="text-xs text-sage">/mês</span></div>
            </div>
            <button className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy hover:bg-gold/90 transition">
              Conhecer plano familiar
            </button>
          </div>
        </div>
      </section>

      {/* SECTION C — WhatsApp */}
      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">WhatsApp</h3>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-navy">Alertas Básicos</div>
              <div className="text-xs text-sage">R$ 19/mês · plano atual</div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">ATIVO</span>
          </div>
          <button className="mt-3 flex w-full items-center justify-between rounded-xl border border-dashed border-gold/60 bg-gold/5 p-3 text-left hover:bg-gold/10 transition">
            <div>
              <div className="text-xs font-semibold text-navy">Alertas Família — R$ 39/mês</div>
              <div className="text-[11px] text-sage">Para grupos familiares</div>
            </div>
            <ChevronRight className="h-4 w-4 text-gold" />
          </button>
        </div>
      </section>

      {/* SECTION D — Histórico */}
      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">Histórico de atividades</h3>
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          {history.map((h, i) => (
            <div key={i} className={cn("flex items-center justify-between p-4", i < history.length - 1 && "border-b border-border")}>
              <div className="text-sm text-navy">{h.t}</div>
              <div className="text-xs text-sage shrink-0 ml-3">{h.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


/* -------- HOME -------- */
function HomeTab() {
  const steps = ["Diagnóstico", "Pesquisa", "Reconstrução", "Validação", "Entrega"];
  const currentIdx = 2;
  return (
    <div className="space-y-5 p-5">
      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gold/80">Seu caso</div>
            <div className="font-serif text-xl italic">Cidadania Portuguesa</div>
          </div>
          <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-navy">CASO ATIVO</span>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-cream/70">
            <span>Progresso da jornada</span>
            <span className="text-gold font-semibold">65%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-soft">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold" style={{ width: "65%" }} />
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-5 rounded-xl bg-navy-soft/60 p-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-gold/80">Hoje você está aqui</div>
          <div className="flex items-center justify-between gap-1">
            {steps.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s} className="flex flex-1 flex-col items-center">
                  <div className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold transition",
                    done && "bg-gold/40 text-gold",
                    active && "bg-gold text-navy ring-4 ring-gold/30 scale-110",
                    !done && !active && "bg-navy/40 text-cream/50 border border-cream/20",
                  )}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <div className={cn(
                    "mt-1.5 text-center text-[9px] leading-tight",
                    active ? "font-bold text-gold" : "text-cream/60"
                  )}>{s}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">Próximos passos</h3>
        <div className="space-y-2.5">
          {[
            { n: 1, t: "Assinar procuração digital", s: "Aguardando sua ação", tone: "urgent" },
            { n: 2, t: "Validar certidão de Isabel (1923)", s: "Documento recém-encontrado", tone: "info" },
            { n: 3, t: "Entrevista com sua tia Rosa", s: "Agendar até 15/07", tone: "soft" },
          ].map((it) => (
            <div key={it.n} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold",
                it.tone === "urgent" && "bg-terracotta/15 text-terracotta",
                it.tone === "info" && "bg-gold/20 text-navy",
                it.tone === "soft" && "bg-muted text-navy/70"
              )}>{it.n}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-navy">{it.t}</div>
                <div className="text-xs text-sage">{it.s}</div>
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
          <div className="text-xs uppercase tracking-wide text-sage">Pessoas conectadas</div>
          <div className="font-serif text-2xl text-navy">12 <span className="text-sm text-sage">ancestrais recuperados</span></div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">Achados Recentes</h3>
        <div className="space-y-2.5">
          {[
            { t: "Certidão de Giuseppe localizada — Nápoles, 1887", d: "28 jun 2026" },
            { t: "Registro de emigração encontrado — Gênova, 1912", d: "24 jun 2026" },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-border border-l-4 border-l-gold bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] uppercase tracking-widest text-gold">Achado</span>
              </div>
              <div className="text-sm text-navy">{x.t}</div>
              <div className="mt-1 text-xs text-sage">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Discreet next-level card */}
      <section className="rounded-xl border border-plum/30 bg-plum/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-plum/15 text-plum">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-plum">Próximo nível disponível</div>
            <div className="mt-0.5 text-sm text-navy">Sua história familiar completa aguarda.</div>
            <button className="mt-2 text-xs font-medium text-plum hover:underline">Saber mais →</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------- JORNADA -------- */
function JornadaTab() {
  const left = [
    { y: "1887", t: "Nascimento do bisavô Giuseppe (Itália)" },
    { y: "1912", t: "Emigração para o Brasil", union: true },
    { y: "1923", t: "Nascimento da avó Isabel" },
    { y: "1951", t: "Nascimento do pai", union: true },
    { y: "1978", t: "Nascimento da cliente (Marina)" },
    { y: "2024", t: "Início da jornada Clube Ancestral" },
  ];
  const right = [
    { s: "Kickoff", d: "12/03" },
    { s: "Coleta inicial", d: "20/03" },
    { s: "Reconstrução de linhagem", d: "05/06", active: true },
    { s: "Validação consular", d: "—" },
    { s: "Requerimento final", d: "—" },
  ];
  return (
    <div className="p-5">
      <h2 className="font-serif text-2xl text-navy">Sua Jornada</h2>
      <p className="mt-1 text-sm text-sage italic">Duas linhas caminham juntas: a história e o seu processo.</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-gold">Linha Ancestral</div>
          <div className="relative pl-4">
            <div className="absolute left-1 top-1 bottom-1 w-px bg-gold/40" />
            {left.map((e) => (
              <div key={e.y} className="relative mb-6">
                <div className={cn(
                  "absolute -left-3 top-1 h-3 w-3 rounded-full",
                  e.union ? "bg-terracotta ring-2 ring-terracotta/30" : "bg-gold"
                )} />
                <div className="font-serif text-lg text-navy">{e.y}</div>
                <div className="text-xs text-sage">{e.t}</div>
                {e.union && (
                  <span className="mt-1 inline-block rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-medium text-terracotta">União de Ramos</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-navy">Linha do Processo</div>
          <div className="relative pl-4">
            <div className="absolute left-1 top-1 bottom-1 w-px bg-navy/30" />
            {right.map((e) => (
              <div key={e.s} className="relative mb-6">
                <div className={cn(
                  "absolute -left-3 top-1 h-3 w-3 rounded-full",
                  e.active ? "bg-navy ring-4 ring-gold/40" : "bg-navy/60"
                )} />
                <div className="font-serif text-base text-navy">{e.s}</div>
                <div className="text-xs text-sage">{e.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
        <div className="text-[11px] uppercase tracking-widest text-terracotta">Momentos de união</div>
        <p className="mt-1 text-sm text-navy italic">"Duas famílias se encontraram em 1912 e novamente em 1951 — sua história é feita desses encontros."</p>
      </div>
    </div>
  );
}

/* -------- RADAR -------- */
function RadarTab() {
  const axes = [
    { k: "Documentação", v: 78 },
    { k: "Origem", v: 90 },
    { k: "Conexões Familiares", v: 65 },
    { k: "Elegibilidade", v: 72 },
    { k: "Memória", v: 55 },
    { k: "Legado", v: 40 },
  ];
  return (
    <div className="p-5">
      <h2 className="font-serif text-2xl text-navy">Radar Ancestral</h2>
      <p className="mt-1 text-sm text-sage italic">Seu equilíbrio nas 6 dimensões.</p>
      <div className="mt-4 rounded-2xl border border-border bg-white p-4">
        <RadarChart axes={axes} size={280} color="#C9A84C" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {axes.map((a) => (
          <div key={a.k} className="rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide text-sage">{a.k}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-serif text-2xl text-navy">{a.v}</span>
              <span className="text-xs text-sage">%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gold" style={{ width: `${a.v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RadarChart({
  axes, size = 300, color = "#C9A84C", strokeColor,
  polygons,
}: {
  axes: { k: string; v: number }[];
  size?: number;
  color?: string;
  strokeColor?: string;
  polygons?: { name: string; values: number[]; color: string }[];
}) {
  const cx = size / 2, cy = size / 2;
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
          fill="none" stroke="#E4DBC8" strokeWidth="1"
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
            fill={p.color} fillOpacity="0.18" stroke={p.color} strokeWidth="2"
          />
        ))
      ) : (
        <polygon
          points={single.map((p) => p.join(",")).join(" ")}
          fill={color} fillOpacity="0.35"
          stroke={strokeColor ?? color} strokeWidth="2"
        />
      )}
      {!polygons && single.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="#1B2B4B" strokeWidth="1.5" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 118);
        return (
          <text key={a.k} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#1B2B4B" fontWeight="600">
            {a.k}
          </text>
        );
      })}
    </svg>
  );
}

/* -------- ARVORE -------- */
function ArvoreTab() {
  const Node = ({ label, hint, connected }: { label: string; hint?: string; connected?: boolean }) => (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-lg border bg-white px-2 py-2 text-center text-[10px] shadow-sm",
      connected ? "border-gold ring-2 ring-gold/30" : "border-border"
    )}>
      <div className="font-semibold text-navy leading-tight">{label}</div>
      {hint && <div className="text-[9px] text-sage">{hint}</div>}
      {connected && <div className="mt-0.5 text-[8px] uppercase tracking-widest text-gold">conectado</div>}
    </div>
  );
  return (
    <div className="p-5">
      <h2 className="font-serif text-2xl text-navy">Árvore Familiar</h2>
      <p className="mt-1 text-sm text-sage italic">Cinco gerações que compõem você.</p>

      <div className="mt-5 rounded-2xl border border-border bg-white p-4">
        <div className="space-y-5">
          <Gen label="G5 · Ancestrais">
            <div className="grid grid-cols-3 gap-2">
              <Node label="Manuel F." hint="~1820" />
              <Node label="Maria P." hint="~1825" />
              <Node label="João S." hint="~1830" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G4 · Bisavós de bisavós">
            <div className="grid grid-cols-4 gap-2">
              <Node label="Joaquim F." hint="1855" />
              <Node label="Ana C." hint="1858" />
              <Node label="Antônio R." hint="1860" connected />
              <Node label="Rosa L." hint="1862" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G3 · Bisavós">
            <div className="grid grid-cols-4 gap-2">
              <Node label="Isabel F." hint="1887" connected />
              <Node label="Pedro M." hint="1885" />
              <Node label="Clara R." hint="1890" />
              <Node label="José A." hint="1888" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G2 · Avós">
            <div className="mx-auto grid max-w-[200px] grid-cols-2 gap-2">
              <Node label="Helena" hint="1930" />
              <Node label="Carlos" hint="1928" />
            </div>
          </Gen>
          <Connector />
          <Gen label="G1 · Você">
            <div className="mx-auto max-w-[110px]">
              <div className="rounded-lg border-2 border-navy bg-navy px-2 py-2 text-center text-cream shadow">
                <div className="text-xs font-semibold">Marina Alves</div>
                <div className="text-[9px] text-cream/70">1978</div>
              </div>
            </div>
          </Gen>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
        <div className="font-serif text-lg text-navy">12 pessoas conectadas recuperadas</div>
        <div className="text-xs text-sage">de um universo de 31 possíveis nas 5 gerações</div>
      </div>
    </div>
  );
}
function Gen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-widest text-gold">{label}</div>
      {children}
    </div>
  );
}
function Connector() {
  return <div className="mx-auto h-4 w-px bg-border" />;
}

/* -------- DOCS -------- */
function DocsTab() {
  const docs = [
    { t: "Certidão de nascimento — Marina", d: "12/03", s: "delivered" },
    { t: "Certidão de batismo — Joaquim (1887)", d: "01/06", s: "delivered" },
    { t: "Registro de casamento — Isabel & Antônio", d: "22/06", s: "delivered" },
    { t: "Certidão consular Portugal", d: "aguardando", s: "pending" },
    { t: "Autenticação notarial", d: "aguardando", s: "pending" },
    { t: "Dossiê consolidado", d: "em revisão", s: "review" },
  ];
  return (
    <div className="p-5">
      <h2 className="font-serif text-2xl text-navy">Documentos</h2>
      <p className="mt-1 text-sm text-sage italic">Seu acervo processual.</p>
      <div className="mt-4 space-y-2.5">
        {docs.map((d) => {
          const cfg = {
            delivered: { Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Entregue" },
            pending:   { Icon: Clock, color: "text-orange-600", bg: "bg-orange-50", label: "Pendente" },
            review:    { Icon: Eye, color: "text-blue-600", bg: "bg-blue-50", label: "Em revisão" },
          }[d.s]!;
          return (
            <div key={d.t} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", cfg.bg)}>
                <cfg.Icon className={cn("h-5 w-5", cfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-navy">{d.t}</div>
                <div className="text-xs text-sage">{d.d}</div>
              </div>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.bg, cfg.color)}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------- BIBLIO + LEGADO -------- */
function BiblioTab() {
  const achados = [
    { d: "28 jun 2026", t: "Certidão de nascimento de Giuseppe localizada — Nápoles, 1887", desc: "Documento original recuperado no arquivo diocesano de Nápoles, confirmando a linhagem paterna italiana." },
    { d: "14 jun 2026", t: "Registro de emigração encontrado — Porto de Gênova, 1912", desc: "Lista de passageiros do navio Città di Torino, com Giuseppe entre os embarcados rumo a Santos." },
    { d: "02 jun 2026", t: "Sobrenome confirmado em 3 gerações consecutivas", desc: "Cruzamento de registros paroquiais e civis valida a continuidade do sobrenome familiar." },
  ];
  return (
    <div className="space-y-6 p-5">
      <section>
        <div className="mb-1 text-[11px] uppercase tracking-widest text-gold">Biblioteca</div>
        <h2 className="font-serif text-2xl text-navy">Seus Achados</h2>
        <div className="mt-4 space-y-3">
          {achados.map((x) => (
            <div key={x.t} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[10px] uppercase tracking-widest text-gold">Achado</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-sage">
                  <Calendar className="h-3 w-3" />{x.d}
                </span>
              </div>
              <div className="font-serif text-base text-navy leading-snug">{x.t}</div>
              <div className="mt-1.5 text-xs text-sage">{x.desc}</div>
              <button className="mt-3 inline-flex items-center gap-1 rounded-full border border-navy/20 px-3 py-1 text-[11px] font-semibold text-navy hover:bg-navy hover:text-cream transition">
                Ver detalhes <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-plum/40 bg-gradient-to-br from-plum via-plum to-[#5B3877] p-6 text-cream">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%)" }} />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] uppercase tracking-widest text-cream">
            <Lock className="h-3 w-3" /> Legado — plano premium
          </div>
          <h3 className="font-serif text-2xl italic">Desbloqueie sua História Familiar</h3>
          <p className="mt-2 text-sm text-cream/80">
            Um livro impresso, um dossiê narrativo e a árvore expandida completa — para você e as próximas gerações.
          </p>
          <ul className="mt-4 space-y-1 text-xs text-cream/80">
            <li>· Álbum ilustrado impresso</li>
            <li>· Narrativa completa em áudio</li>
            <li>· Cerimônia de entrega</li>
          </ul>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy">
            Conhecer plano Legado <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
