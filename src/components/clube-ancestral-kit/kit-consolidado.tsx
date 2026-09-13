/**
 * Clube Ancestral — Kit visual único (componentes + tokens Pantone).
 *
 * Arquivo autocontido: cole no Soul Ancestry e importe.
 * Dependências: React + Tailwind (qualquer versão com valores arbitrários).
 * Não há dependência de shadcn, lucide, alias "@/" nem de config de tema:
 * as cores vêm das variáveis CSS injetadas por <KitTokens />.
 *
 * Nenhum dado real ou fictício vive aqui — todos os componentes recebem
 * conteúdo por propriedades. Sem conteúdo, cada um mostra estado vazio
 * explícito, nunca exemplo apresentado como real.
 */

import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

/* ------------------------------------------------------------------ tokens */

/** Paleta aprovada para o kit exportável + estados semânticos. */
export const KIT_TOKENS_CSS = `
[data-visual-kit="pantone"] {
  --ca-navy: #13294B;
  --ca-navy-soft: #1B365D;
  --ca-gold: #C2A84D;
  --ca-cream: #F0EEE9;
  --ca-terracotta: #28334A;
  --ca-preto: #28334A;
  --ca-fundo: #F0EEE9;
  --ca-card: #FFFFFF;
  --ca-borda: #D7D6D1;

  --ca-sucesso: #2F6E4B;
  --ca-sucesso-suave: #E6F1EA;
  --ca-atencao: #8A5A12;
  --ca-atencao-suave: #FBF0DA;
  --ca-critico: #7B3540;
  --ca-critico-suave: #F5E8E9;
  --ca-fonte-titulo: "Cormorant Garamond", Georgia, serif;
  --ca-fonte-corpo: "Montserrat", Arial, sans-serif;

  color: var(--ca-navy);
  background-color: var(--ca-fundo);
  font-family: var(--ca-fonte-corpo);
}
[data-visual-kit="pantone"] .ca-titulo { font-family: var(--ca-fonte-titulo); }
`;

/** Injete uma vez, no topo da aplicação, e marque o container com data-visual-kit="pantone". */
export function KitTokens() {
  return <style dangerouslySetInnerHTML={{ __html: KIT_TOKENS_CSS }} />;
}

/** Wrapper opcional: já aplica o escopo dos tokens. */
export function KitRoot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-visual-kit="pantone" className={className}>
      <KitTokens />
      {children}
    </div>
  );
}

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export type KitTone = "neutral" | "attention" | "critical" | "success" | "gold";

const toneStyle: Record<KitTone, CSSProperties> = {
  neutral: { borderColor: "var(--ca-borda)", background: "var(--ca-cream)", color: "var(--ca-navy)" },
  attention: { borderColor: "var(--ca-atencao)", background: "var(--ca-atencao-suave)", color: "var(--ca-atencao)" },
  critical: { borderColor: "var(--ca-critico)", background: "var(--ca-critico-suave)", color: "var(--ca-critico)" },
  success: { borderColor: "var(--ca-sucesso)", background: "var(--ca-sucesso-suave)", color: "var(--ca-sucesso)" },
  gold: { borderColor: "var(--ca-gold)", background: "color-mix(in srgb, var(--ca-gold) 18%, transparent)", color: "var(--ca-navy)" },
};

const cardStyle: CSSProperties = { borderColor: "var(--ca-borda)", background: "var(--ca-card)" };
const mutado: CSSProperties = { color: "color-mix(in srgb, var(--ca-navy) 62%, transparent)" };

/* -------------------------------------------------------------------- base */

export function KitBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: KitTone }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={toneStyle[tone]}
    >
      {children}
    </span>
  );
}

export function KitButton({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "gold" }) {
  const style: CSSProperties =
    variant === "primary"
      ? { background: "var(--ca-navy)", color: "#fff" }
      : variant === "gold"
        ? { background: "var(--ca-gold)", color: "var(--ca-navy)" }
        : { background: "transparent", color: "var(--ca-navy)", borderColor: "var(--ca-borda)", borderWidth: 1 };
  return (
    <button
      {...props}
      style={{ ...style, ...props.style }}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function KitCard({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("rounded-lg border p-4 shadow-sm", className)} style={cardStyle}>
      {title || action ? (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ca-terracotta)" }}>
                {eyebrow}
              </p>
            ) : null}
            {title ? <h3 className="ca-titulo text-lg">{title}</h3> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function KitField({
  label,
  hint,
  className,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-widest" style={mutado}>
        {label}
      </span>
      <input
        className={cx("w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2", className)}
        style={{ ...cardStyle, color: "var(--ca-navy)" }}
        {...inputProps}
      />
      {hint ? (
        <span className="mt-1 block text-xs" style={mutado}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function KitTable({ columns, rows, caption }: { columns: string[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border" style={cardStyle}>
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">{caption ?? "Tabela"}</caption>
        <thead style={{ background: "var(--ca-cream)" }}>
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest" style={mutado}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-sm" style={mutado}>
                Nenhum registro para exibir.
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderTop: "1px solid var(--ca-borda)" }}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function KitEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: "var(--ca-borda)", background: "var(--ca-cream)" }}>
      <p className="ca-titulo text-lg">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm" style={mutado}>
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------- chrome desk */

export function DeskTopbar({ title, accountLabel = "Conta", action }: { title: string; accountLabel?: string; action?: ReactNode }) {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-3" style={cardStyle}>
      <div className="min-w-0 flex-1 rounded-md border px-3 py-2 text-xs" style={{ borderColor: "var(--ca-borda)", background: "var(--ca-cream)", ...mutado }}>
        Buscar caso, pessoa ou documento
      </div>
      <span className="ca-titulo hidden text-lg lg:block">{title}</span>
      {action ?? <KitBadge tone="gold">{accountLabel}</KitBadge>}
    </header>
  );
}

export function DeskSidebar({
  items,
  active,
  onSelect,
  brand = "Clube Ancestral",
}: {
  items: { id: string; label: string }[];
  active: string;
  onSelect?: (id: string) => void;
  brand?: string;
}) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 px-3 py-5 lg:block" style={{ background: "var(--ca-navy)" }}>
      <p className="ca-titulo text-lg" style={{ color: "var(--ca-gold)" }}>
        {brand}
      </p>
      <nav className="mt-5 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className="w-full rounded-md px-3 py-2 text-left text-sm"
            style={
              item.id === active
                ? { background: "var(--ca-gold)", color: "var(--ca-navy)" }
                : { color: "rgba(236,223,205,.85)" }
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/** Barra inferior do App Cliente (mobile). Nunca exibir junto com a sidebar. */
export function ClientBottomNav({ items, active, onSelect }: { items: { id: string; label: string }[]; active: string; onSelect?: (id: string) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex justify-between gap-1 border-t px-2 py-1.5 lg:hidden" style={cardStyle}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item.id)}
          className="flex-1 rounded-md px-1 py-1.5 text-[11px] font-medium"
          style={item.id === active ? { background: "var(--ca-cream)", color: "var(--ca-navy)" } : mutado}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------------- genealogia */

export type GenealogyPerson = { id: string; name: string; role?: string; place?: string; status?: string };

export function PersonNode({ person, selected = false }: { person: GenealogyPerson; selected?: boolean }) {
  const initials = person.name.split(" ").slice(0, 2).map((p) => p.charAt(0)).join("");
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border p-2" style={{ ...cardStyle, borderColor: selected ? "var(--ca-gold)" : "var(--ca-borda)" }}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold" style={{ background: "var(--ca-navy)", color: "var(--ca-gold)" }}>
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{person.name}</span>
        <span className="block truncate text-xs" style={mutado}>
          {person.role ?? "Pessoa"}
        </span>
      </span>
    </div>
  );
}

export function FamilyCoreCard({ title, people, status = "Em pesquisa" }: { title: string; people: GenealogyPerson[]; status?: string }) {
  return (
    <KitCard title={title} action={<KitBadge tone="attention">{status}</KitBadge>}>
      {people.length === 0 ? (
        <p className="text-sm" style={mutado}>
          Nenhuma pessoa registrada neste núcleo.
        </p>
      ) : (
        <div className="space-y-2">
          {people.map((person) => (
            <PersonNode key={person.id} person={person} />
          ))}
        </div>
      )}
    </KitCard>
  );
}

export function RelationshipLine({ from, relation, to }: { from: string; relation: string; to: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs">
      <span className="rounded-md border p-2" style={cardStyle}>{from}</span>
      <span style={mutado}>{relation}</span>
      <span className="rounded-md border p-2" style={cardStyle}>{to}</span>
    </div>
  );
}

export function GenealogyEvent({ date, title, place }: { date?: string; title: string; place?: string }) {
  return (
    <div className="pl-3" style={{ borderLeft: "2px solid var(--ca-gold)" }}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-0.5 flex flex-wrap gap-3 text-xs" style={mutado}>
        {date ? <span>{date}</span> : null}
        {place ? <span>{place}</span> : null}
      </p>
    </div>
  );
}

export function ResearchArtifactCard({
  kind,
  title,
  detail,
  status,
  tone = "neutral",
}: {
  kind: "Fonte" | "Evidência" | "Achado" | "Documento";
  title: string;
  detail?: string;
  status?: string;
  tone?: KitTone;
}) {
  return (
    <article className="rounded-lg border p-3" style={cardStyle}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={mutado}>
            {kind}
          </p>
          <p className="text-sm font-medium">{title}</p>
          {detail ? (
            <p className="mt-1 text-xs" style={mutado}>
              {detail}
            </p>
          ) : null}
        </div>
        {status ? <KitBadge tone={tone}>{status}</KitBadge> : null}
      </div>
    </article>
  );
}

export function MiniFamilyTree({ people }: { people: GenealogyPerson[] }) {
  if (people.length === 0) {
    return <KitEmptyState title="Árvore sem pessoas" description="Nenhuma pessoa publicada para este caso até agora." />;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      <div className="col-span-2 mx-auto w-full max-w-xs">
        <PersonNode person={people[0]!} selected />
      </div>
      {people.slice(1, 3).map((person) => (
        <PersonNode key={person.id} person={person} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- jornada */

export type JourneyStep = { id: string; title: string; detail?: string; state: "done" | "current" | "next" };

export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  if (steps.length === 0) {
    return <KitEmptyState title="Jornada sem etapas" description="Nenhuma etapa publicada até agora." />;
  }
  return (
    <ol className="grid gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
      {steps.map((step) => (
        <li key={step.id} className="rounded-lg border p-3" style={cardStyle}>
          <span
            className="mb-2 block h-2 w-8 rounded-full"
            style={{ background: step.state === "done" ? "var(--ca-sucesso)" : step.state === "current" ? "var(--ca-gold)" : "var(--ca-borda)" }}
          />
          <p className="text-xs font-semibold">{step.title}</p>
          {step.detail ? (
            <p className="mt-1 text-[11px]" style={mutado}>
              {step.detail}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function JourneyProgress({ label, value }: { label: string; value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs" style={mutado}>
        <span>{label}</span>
        <span>{safe}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--ca-borda)" }}>
        <div className="h-full rounded-full" style={{ width: `${safe}%`, background: "var(--ca-gold)" }} />
      </div>
    </div>
  );
}

export function NextActionCard({ action, owner, due, tone = "gold" }: { action: string; owner?: string; due?: string; tone?: KitTone }) {
  return (
    <KitCard title="Próxima ação" action={<KitBadge tone={tone}>{due ?? "Sem prazo"}</KitBadge>}>
      <p className="text-sm font-medium">{action}</p>
      <p className="mt-2 text-xs" style={mutado}>
        Responsável: {owner ?? "A definir"}
      </p>
    </KitCard>
  );
}

export function MicrodeliveryCard({ title, state, publishedAt }: { title: string; state: string; publishedAt?: string }) {
  return (
    <KitCard eyebrow="Microentrega" title={title} action={<KitBadge tone={publishedAt ? "success" : "attention"}>{state}</KitBadge>}>
      <p className="text-xs" style={mutado}>
        {publishedAt ? `Publicada em ${publishedAt}` : "Aguardando revisão antes de qualquer publicação."}
      </p>
    </KitCard>
  );
}

/* ------------------------------------------------------------ visualização */

export type RadarAxis = { label: string; value: number };

export function RadarChart({ axes, label }: { axes: RadarAxis[]; label: string }) {
  if (axes.length === 0) return <KitEmptyState title="Radar sem dados" description="Sem informação suficiente para este radar." />;
  const center = 120;
  const radius = 76;
  const point = (index: number, value: number) => {
    const angle = ((-90 + index * (360 / axes.length)) * Math.PI) / 180;
    const distance = (radius * value) / 100;
    return { x: center + distance * Math.cos(angle), y: center + distance * Math.sin(angle) };
  };
  const polygon = (value: number) => axes.map((_, i) => { const p = point(i, value); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg viewBox="-36 -24 312 292" className="mx-auto w-full max-w-sm" role="img" aria-label={label}>
      {[25, 50, 75, 100].map((level) => (
        <polygon key={level} points={polygon(level)} fill="none" stroke="var(--ca-borda)" />
      ))}
      {axes.map((axis, index) => {
        const end = point(index, 100);
        const text = point(index, 122);
        return (
          <g key={axis.label}>
            <line x1={center} y1={center} x2={end.x} y2={end.y} stroke="var(--ca-borda)" />
            <text x={text.x} y={text.y} textAnchor="middle" fontSize="9" fill="var(--ca-navy)">
              {axis.label}
            </text>
          </g>
        );
      })}
      <polygon
        points={axes.map((axis, i) => { const p = point(i, axis.value); return `${p.x},${p.y}`; }).join(" ")}
        fill="color-mix(in srgb, var(--ca-gold) 35%, transparent)"
        stroke="var(--ca-navy)"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function KpiCard({ label, value, detail, tone = "neutral" }: { label: string; value: string | number | null | undefined; detail?: string; tone?: KitTone }) {
  const color =
    value == null
      ? "color-mix(in srgb, var(--ca-navy) 40%, transparent)"
      : tone === "critical"
        ? "var(--ca-critico)"
        : tone === "attention"
          ? "var(--ca-atencao)"
          : tone === "success"
            ? "var(--ca-sucesso)"
            : "var(--ca-navy)";
  return (
    <KitCard className="min-h-28">
      <p className="text-[10px] font-semibold uppercase tracking-widest" style={mutado}>
        {label}
      </p>
      <p className="ca-titulo mt-2 text-3xl tabular-nums" style={{ color }}>
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs" style={mutado}>
        {value == null ? "Sem dados suficientes" : detail}
      </p>
    </KitCard>
  );
}

export function DeskMatrix({ rows }: { rows: { label: string; values: { value: number | string; tone: KitTone }[] }[] }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "4rem repeat(3, minmax(0,1fr))" }}>
      {rows.map((row) => (
        <div className="contents" key={row.label}>
          <span className="flex items-center justify-end pr-2 text-xs" style={mutado}>
            {row.label}
          </span>
          {row.values.map((cell, index) => (
            <span key={index} className="grid min-h-14 place-items-center rounded-md text-sm font-semibold" style={toneStyle[cell.tone]}>
              {cell.value}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export type BarDatum = { label: string; value: number; detail?: string; tone?: "navy" | "gold" | "terracotta" };

export function HorizontalBars({ items, label }: { items: BarDatum[]; label: string }) {
  return <figure role="img" aria-label={label} className="space-y-3">{items.map((item) => <div key={item.label}><div className="mb-1 flex items-center justify-between gap-3 text-[10px]"><span className="font-medium">{item.label}</span><span className="tabular-nums" style={mutado}>{item.detail ?? `${item.value}%`}</span></div><div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--ca-borda)" }}><div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.min(100, item.value))}%`, background: item.tone === "terracotta" ? "var(--ca-terracotta)" : item.tone === "gold" ? "var(--ca-gold)" : "var(--ca-navy)" }} /></div></div>)}</figure>;
}

export function ColumnChart({ items, label }: { items: { label: string; value: number; highlighted?: boolean }[]; label: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  return <figure role="img" aria-label={label}><div className="flex h-36 items-end gap-2 border-b border-l px-2 pt-3" style={{ borderColor: "var(--ca-borda)" }}>{items.map((item) => <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"><span className="text-[9px] font-semibold tabular-nums" style={mutado}>{item.value}</span><div className="w-full max-w-10 rounded-t-sm" style={{ height: `${Math.max(10, (item.value / maximum) * 96)}px`, background: item.highlighted ? "var(--ca-gold)" : "var(--ca-navy)" }} /><span className="w-full truncate text-center text-[8px]" style={mutado}>{item.label}</span></div>)}</div></figure>;
}

export function TrendChart({ values, labels, label }: { values: number[]; labels: string[]; label: string }) {
  const width = 320; const height = 112; const maximum = Math.max(...values, 1); const minimum = Math.min(...values, 0); const range = Math.max(maximum - minimum, 1);
  const points = values.map((value, index) => ({ x: 18 + index * ((width - 36) / Math.max(values.length - 1, 1)), y: height - 22 - ((value - minimum) / range) * (height - 42), value }));
  return <figure role="img" aria-label={label}><svg viewBox={`0 0 ${width} ${height}`} className="w-full">{[28,54,80].map((y) => <line key={y} x1="12" x2={width - 12} y1={y} y2={y} stroke="var(--ca-borda)" />)}<polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="var(--ca-terracotta)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{points.map((point,index) => <g key={`${labels[index]}-${point.value}`}><circle cx={point.x} cy={point.y} r="4" fill="var(--ca-card)" stroke="var(--ca-terracotta)" strokeWidth="2" /><text x={point.x} y={height - 6} textAnchor="middle" fontSize="8" fill="var(--ca-navy)">{labels[index]}</text></g>)}</svg></figure>;
}

export function StatusDonut({ segments, label }: { segments: { label: string; value: number; tone: "navy" | "gold" | "terracotta" | "success" }[]; label: string }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0); let accumulated = 0;
  const color = { navy: "var(--ca-navy)", gold: "var(--ca-gold)", terracotta: "var(--ca-terracotta)", success: "var(--ca-sucesso)" } as const;
  return <figure role="img" aria-label={label} className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center"><svg viewBox="0 0 120 120" className="mx-auto h-32 w-32 -rotate-90"><circle cx="60" cy="60" r="42" fill="none" stroke="var(--ca-borda)" strokeWidth="18" />{segments.map((segment) => { const ratio = total > 0 ? segment.value / total : 0; const start = accumulated; accumulated += ratio; return <circle key={segment.label} cx="60" cy="60" r="42" fill="none" stroke={color[segment.tone]} strokeWidth="18" strokeDasharray={`${ratio * 263.89} 263.89`} strokeDashoffset={-start * 263.89} />; })}</svg><figcaption className="space-y-2">{segments.map((segment) => <div key={segment.label} className="flex items-center justify-between gap-3 text-[10px]"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: color[segment.tone] }} />{segment.label}</span><strong className="tabular-nums">{segment.value}</strong></div>)}</figcaption></figure>;
}

export function FamilyNetwork({ people, label = "Rede de pessoas, núcleos e casos" }: { people: [GenealogyPerson, GenealogyPerson, GenealogyPerson, GenealogyPerson, GenealogyPerson]; label?: string }) {
  const nodes = [{ x: 260, y: 110, person: people[0], main: true }, { x: 105, y: 52, person: people[1] }, { x: 410, y: 48, person: people[2] }, { x: 110, y: 174, person: people[3] }, { x: 408, y: 176, person: people[4] }];
  return <figure role="img" aria-label={label} className="relative mx-auto h-56 max-w-xl overflow-hidden rounded-lg border" style={{ borderColor: "var(--ca-borda)", background: "var(--ca-cream)" }}><svg viewBox="0 0 520 220" className="h-full w-full"><g stroke="var(--ca-gold)" strokeWidth="2"><line x1="260" y1="110" x2="105" y2="52" /><line x1="260" y1="110" x2="410" y2="48" /><line x1="260" y1="110" x2="110" y2="174" /><line x1="260" y1="110" x2="408" y2="176" /></g>{nodes.map((node) => { const initials = node.person.name.split(" ").slice(0,2).map((part) => part.charAt(0)).join(""); return <g key={node.person.id}><circle cx={node.x} cy={node.y} r={node.main ? 27 : 22} fill={node.main ? "var(--ca-gold)" : "var(--ca-card)"} stroke="var(--ca-navy)" strokeWidth="2" /><text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ca-navy)">{initials}</text></g>; })}</svg></figure>;
}

/* ---------------------------------------------------------------- operação */

export type KanbanItem = {
  id: string;
  title: string;
  context?: string;
  owner?: string;
  due?: string;
  nextAction?: string;
  alert?: string;
  tone?: KitTone;
};

export function CrmKanban({ columns }: { columns: { id: string; title: string; items: KanbanItem[] }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {columns.map((column) => (
        <section key={column.id} className="rounded-lg border p-2.5" style={{ borderColor: "var(--ca-borda)", background: "var(--ca-cream)" }}>
          <div className="mb-2 flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--ca-borda)" }}>
            <h3 className="text-[11px] font-semibold uppercase">{column.title}</h3>
            <KitBadge>{column.items.length}</KitBadge>
          </div>
          <div className="space-y-2">
            {column.items.length === 0 ? (
              <p className="px-1 py-3 text-[11px]" style={mutado}>
                Nenhum item nesta coluna.
              </p>
            ) : (
              column.items.map((item) => (
                <article key={item.id} className="rounded-lg border p-3" style={cardStyle}>
                  <p className="text-xs font-semibold">{item.title}</p>
                  {item.context ? (
                    <p className="mt-1 text-[11px]" style={mutado}>
                      {item.context}
                    </p>
                  ) : null}
                  {item.nextAction ? (
                    <p className="mt-2 pt-2 text-[11px]" style={{ borderTop: "1px solid var(--ca-borda)" }}>
                      <strong>Próximo passo:</strong> {item.nextAction}
                    </p>
                  ) : null}
                  {item.alert ? (
                    <p className="mt-2 rounded-md border p-1.5 text-[10px]" style={toneStyle.attention}>
                      {item.alert}
                    </p>
                  ) : null}
                  <div className="mt-2 flex justify-between gap-2 text-[10px]" style={mutado}>
                    <span>{item.owner ?? "A definir"}</span>
                    <span>{item.due ?? "Sem prazo"}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ChecklistCard({ title, items }: { title: string; items: { id: string; label: string; done: boolean; detail?: string }[] }) {
  return (
    <KitCard title={title}>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 rounded-md border p-2" style={{ borderColor: "var(--ca-borda)", background: "var(--ca-cream)" }}>
             <span aria-hidden style={{ color: item.done ? "var(--ca-sucesso)" : "color-mix(in srgb, var(--ca-navy) 35%, transparent)" }}>
              {item.done ? "✓" : "○"}
            </span>
            <span>
              <span className="block text-sm">{item.label}</span>
              {item.detail ? (
                <span className="text-xs" style={mutado}>
                  {item.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </KitCard>
  );
}

export function ContextAlert({ context, message, tone = "attention" }: { context: string; message: string; tone?: KitTone }) {
  return (
    <div className="rounded-lg border p-3" style={cardStyle}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold">{context}</p>
        <KitBadge tone={tone}>{message}</KitBadge>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- conteúdo */

export type ContentKind = "Caderno" | "Relatório" | "Narrativa" | "Memória";

export function ContentShelf({ title, items }: { title: string; items: { id: string; kind: ContentKind; title: string; subtitle?: string; state?: string }[] }) {
  return (
    <section>
      <h3 className="ca-titulo mb-3 text-xl">{title}</h3>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm" style={{ borderColor: "var(--ca-borda)", ...mutado }}>
          Nenhum conteúdo publicado nesta prateleira.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <KitCard key={item.id}>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={mutado}>
                {item.kind}
              </p>
              <p className="mt-1 text-sm font-medium">{item.title}</p>
              {item.subtitle ? (
                <p className="mt-1 text-xs" style={mutado}>
                  {item.subtitle}
                </p>
              ) : null}
              {item.state ? (
                <div className="mt-3">
                  <KitBadge tone="success">{item.state}</KitBadge>
                </div>
              ) : null}
            </KitCard>
          ))}
        </div>
      )}
    </section>
  );
}

/** Fila governada: rascunho → revisão → aprovado → publicado. */
export function PublicationQueue({ counts }: { counts: { draft: number; review: number; approved: number; published: number } }) {
  const stages: Array<[string, number]> = [
    ["Rascunho", counts.draft],
    ["Revisão", counts.review],
    ["Aprovado", counts.approved],
    ["Publicado", counts.published],
  ];
  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {stages.map(([label, count], index) => (
        <li key={label} className="rounded-lg border p-3" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{label}</span>
            <KitBadge tone={index > 1 ? "success" : index === 1 ? "attention" : "neutral"}>{count}</KitBadge>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------- notas
 * Uso mínimo:
 *
 *   import { KitRoot, KpiCard, CrmKanban } from "./clube-ancestral-kit";
 *
 *   <KitRoot className="min-h-screen p-6">
 *     <KpiCard label="Casos ativos" value={casos.length} detail="fonte: banco" />
 *   </KitRoot>
 *
 * Fontes: carregue Inter e Cormorant Garamond por <link> no head da aplicação.
 * App Cliente: 7 abas (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta);
 * Desk: 6 grupos. O kit não define navegação — só a aparência.
 */
