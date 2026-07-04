import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home, Route as RouteIcon, Radar, TreeDeciduous, FileText, BookOpen,
  Sparkles, Clock, CheckCircle2, Eye, Lock, ArrowRight, Users, Crown,
} from "lucide-react";

type Tab = "home" | "jornada" | "radar" | "arvore" | "docs" | "biblio";

export function ClienteApp() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="mx-auto flex min-h-[calc(100vh-52px)] w-full max-w-md flex-col bg-cream">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border/60 bg-navy px-5 py-4 text-cream">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-gold/80">Bem-vindo</div>
          <div className="font-serif text-xl italic">Marina Alves</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/20 text-gold font-medium">MA</div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {tab === "home" && <HomeTab />}
        {tab === "jornada" && <JornadaTab />}
        {tab === "radar" && <RadarTab />}
        {tab === "arvore" && <ArvoreTab />}
        {tab === "docs" && <DocsTab />}
        {tab === "biblio" && <BiblioTab />}
      </main>

      {/* Bottom nav */}
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
              onClick={() => setTab(id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                tab === id ? "text-navy" : "text-muted-foreground hover:text-navy"
              )}
            >
              <Icon className={cn("h-5 w-5", tab === id && "text-gold")} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* -------- HOME -------- */
function HomeTab() {
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
          <div className="mt-3 text-[11px] text-cream/60">Etapa atual: Reconstrução de linhagem</div>
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
                <div className="text-xs text-muted-foreground">{it.s}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-white p-5 shadow-sm">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/20">
          <Users className="h-7 w-7 text-gold" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Pessoas conectadas</div>
          <div className="font-serif text-2xl text-navy">12 <span className="text-sm text-muted-foreground">ancestrais recuperados</span></div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg text-navy">Micro-entregas recentes</h3>
        <div className="space-y-2.5">
          {[
            { t: "Registro de batismo — Coimbra, 1887", d: "há 2 dias", tag: "Achado" },
            { t: "Nota de contexto: emigração 1920", d: "há 5 dias", tag: "Contexto" },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] uppercase tracking-widest text-gold">{x.tag}</span>
              </div>
              <div className="text-sm text-navy">{x.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-terracotta to-terracotta/80 p-5 text-cream">
        <Crown className="absolute -right-4 -top-4 h-24 w-24 text-cream/10" />
        <div className="text-[11px] uppercase tracking-widest text-cream/70">Upgrade</div>
        <div className="mt-1 font-serif text-lg italic">Desbloqueie o plano Legado</div>
        <p className="mt-1 text-xs text-cream/80">Álbum familiar impresso, dossiê narrativo completo e sessão presencial.</p>
        <button className="mt-4 rounded-full bg-cream px-4 py-2 text-xs font-semibold text-terracotta">Conhecer plano</button>
      </section>
    </div>
  );
}

/* -------- JORNADA -------- */
function JornadaTab() {
  const left = [
    { y: "1820", t: "Ramo Ferreira — Minho, Portugal" },
    { y: "1887", t: "Batismo de Joaquim, seu 3º avô" },
    { y: "1923", t: "Casamento Isabel & António", union: true },
    { y: "1965", t: "Migração para São Paulo", union: true },
    { y: "2024", t: "Você inicia sua jornada" },
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
      <p className="mt-1 text-sm text-muted-foreground italic">Duas linhas caminham juntas: a história e o seu processo.</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-gold">Ancestralidade</div>
          <div className="relative pl-4">
            <div className="absolute left-1 top-1 bottom-1 w-px bg-gold/40" />
            {left.map((e) => (
              <div key={e.y} className="relative mb-6">
                <div className={cn(
                  "absolute -left-3 top-1 h-3 w-3 rounded-full",
                  e.union ? "bg-terracotta ring-2 ring-terracotta/30" : "bg-gold"
                )} />
                <div className="font-serif text-lg text-navy">{e.y}</div>
                <div className="text-xs text-muted-foreground">{e.t}</div>
                {e.union && (
                  <span className="mt-1 inline-block rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] font-medium text-terracotta">União de Ramos</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-[11px] uppercase tracking-widest text-navy">Seu processo</div>
          <div className="relative pl-4">
            <div className="absolute left-1 top-1 bottom-1 w-px bg-navy/30" />
            {right.map((e) => (
              <div key={e.s} className="relative mb-6">
                <div className={cn(
                  "absolute -left-3 top-1 h-3 w-3 rounded-full",
                  e.active ? "bg-navy ring-4 ring-gold/40" : "bg-navy/60"
                )} />
                <div className="font-serif text-base text-navy">{e.s}</div>
                <div className="text-xs text-muted-foreground">{e.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
        <div className="text-[11px] uppercase tracking-widest text-terracotta">Momentos de união</div>
        <p className="mt-1 text-sm text-navy italic">"Duas famílias se encontraram em 1923 e novamente em 1965 — sua história é feita desses encontros."</p>
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
      <p className="mt-1 text-sm text-muted-foreground italic">Seu equilíbrio nas 6 dimensões.</p>
      <div className="mt-4 rounded-2xl border border-border bg-white p-4">
        <RadarChart axes={axes} size={280} color="#C9A84C" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {axes.map((a) => (
          <div key={a.k} className="rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{a.k}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-serif text-2xl text-navy">{a.v}</span>
              <span className="text-xs text-muted-foreground">%</span>
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
      {hint && <div className="text-[9px] text-muted-foreground">{hint}</div>}
      {connected && <div className="mt-0.5 text-[8px] uppercase tracking-widest text-gold">conectado</div>}
    </div>
  );
  return (
    <div className="p-5">
      <h2 className="font-serif text-2xl text-navy">Árvore Familiar</h2>
      <p className="mt-1 text-sm text-muted-foreground italic">Cinco gerações que compõem você.</p>

      <div className="mt-5 rounded-2xl border border-border bg-white p-4">
        <div className="space-y-5">
          {/* G5 */}
          <Gen label="G5 · Ancestrais">
            <div className="grid grid-cols-3 gap-2">
              <Node label="Manuel F." hint="~1820" />
              <Node label="Maria P." hint="~1825" />
              <Node label="João S." hint="~1830" />
            </div>
          </Gen>
          <Connector />
          {/* G4 */}
          <Gen label="G4 · Bisavós de bisavós">
            <div className="grid grid-cols-4 gap-2">
              <Node label="Joaquim F." hint="1855" />
              <Node label="Ana C." hint="1858" />
              <Node label="Antônio R." hint="1860" connected />
              <Node label="Rosa L." hint="1862" />
            </div>
          </Gen>
          <Connector />
          {/* G3 */}
          <Gen label="G3 · Bisavós">
            <div className="grid grid-cols-4 gap-2">
              <Node label="Isabel F." hint="1887" connected />
              <Node label="Pedro M." hint="1885" />
              <Node label="Clara R." hint="1890" />
              <Node label="José A." hint="1888" />
            </div>
          </Gen>
          <Connector />
          {/* G2 */}
          <Gen label="G2 · Avós">
            <div className="mx-auto grid max-w-[200px] grid-cols-2 gap-2">
              <Node label="Helena" hint="1930" />
              <Node label="Carlos" hint="1928" />
            </div>
          </Gen>
          <Connector />
          {/* G1 */}
          <Gen label="G1 · Você">
            <div className="mx-auto max-w-[110px]">
              <div className="rounded-lg border-2 border-navy bg-navy px-2 py-2 text-center text-cream shadow">
                <div className="text-xs font-semibold">Marina Alves</div>
                <div className="text-[9px] text-cream/70">1992</div>
              </div>
            </div>
          </Gen>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
        <div className="font-serif text-lg text-navy">12 pessoas conectadas recuperadas</div>
        <div className="text-xs text-muted-foreground">de um universo de 31 possíveis nas 5 gerações</div>
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
      <p className="mt-1 text-sm text-muted-foreground italic">Seu acervo processual.</p>
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
                <div className="text-xs text-muted-foreground">{d.d}</div>
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
  return (
    <div className="space-y-6 p-5">
      <section>
        <div className="mb-1 text-[11px] uppercase tracking-widest text-gold">Biblioteca</div>
        <h2 className="font-serif text-2xl text-navy">Seus achados</h2>
        <div className="mt-4 space-y-3">
          {[
            { tag: "Achado comentado", t: "Registro de batismo, Coimbra 1887", d: "Comentário do genealogista sobre o padrinho identificado." },
            { tag: "Registro histórico", t: "Livro paroquial S. Maria — pág. 142", d: "Cópia digitalizada com transcrição." },
            { tag: "Nota de contexto", t: "A emigração portuguesa dos anos 1920", d: "Contexto histórico que envolveu seus ancestrais." },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-[10px] uppercase tracking-widest text-gold">{x.tag}</span>
              </div>
              <div className="text-sm font-medium text-navy">{x.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-navy bg-gradient-to-br from-navy via-navy-soft to-navy p-6 text-cream">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%)" }} />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-[10px] uppercase tracking-widest text-purple-200">
            <Lock className="h-3 w-3" /> Legado — bloqueado
          </div>
          <h3 className="font-serif text-2xl italic">Desbloqueie sua História Familiar</h3>
          <p className="mt-2 text-sm text-cream/80">
            Um livro impresso, um dossiê narrativo e a árvore expandida completa — para você e as próximas gerações.
          </p>
          <ul className="mt-4 space-y-1 text-xs text-cream/70">
            <li>· Álbum ilustrado impresso</li>
            <li>· Narrativa completa em áudio</li>
            <li>· Cerimônia de entrega</li>
          </ul>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy">
            Fazer upgrade para Legado <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
