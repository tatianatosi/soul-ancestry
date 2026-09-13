import { cn } from "@/lib/utils";
import { KitCard, type KitTone } from "./base";

export type RadarAxis = { label: string; value: number };
export function RadarChart({ axes, label }: { axes: RadarAxis[]; label: string }) {
  const center = 120; const radius = 76;
  const point = (index: number, value: number) => { const angle = (-90 + index * (360 / axes.length)) * Math.PI / 180; const distance = radius * value / 100; return { x: center + distance * Math.cos(angle), y: center + distance * Math.sin(angle) }; };
  const polygon = (value: number) => axes.map((_, index) => { const p = point(index, value); return `${p.x},${p.y}`; }).join(" ");
  return <svg viewBox="-36 -24 312 292" className="mx-auto w-full max-w-sm" role="img" aria-label={label}>{[25,50,75,100].map((level) => <polygon key={level} points={polygon(level)} fill="none" stroke="currentColor" className="text-navy/15" />)}{axes.map((axis, index) => { const end = point(index, 100); const text = point(index, 122); return <g key={axis.label}><line x1={center} y1={center} x2={end.x} y2={end.y} stroke="currentColor" className="text-navy/15" /><text x={text.x} y={text.y} textAnchor="middle" className="fill-navy text-[9px]">{axis.label}</text></g>; })}<polygon points={axes.map((axis,index) => { const p = point(index,axis.value); return `${p.x},${p.y}`; }).join(" ")} className="fill-gold/30 stroke-navy" strokeWidth="2.5" />{axes.map((axis,index) => { const p = point(index,axis.value); return <circle key={axis.label} cx={p.x} cy={p.y} r="3.5" className="fill-card stroke-navy" strokeWidth="2" />; })}</svg>;
}

export function KpiCard({ label, value, detail, tone = "neutral" }: { label: string; value: string | number | null | undefined; detail?: string; tone?: KitTone }) {
  const color = tone === "critical" ? "text-critico" : tone === "attention" ? "text-atencao" : tone === "success" ? "text-sucesso" : "text-navy";
  return <KitCard className="min-h-28"><p className="text-[10px] font-semibold uppercase tracking-widest text-navy/50">{label}</p><p className={cn("mt-2 font-serif text-3xl tabular-nums", value == null ? "text-navy/35" : color)}>{value ?? "—"}</p><p className="mt-1 text-xs text-navy/55">{value == null ? "Sem dados suficientes" : detail}</p></KitCard>;
}

export function DeskMatrix({ rows }: { rows: { label: string; values: { value: number | string; tone: KitTone }[] }[] }) {
  const tone: Record<KitTone, string> = { neutral: "bg-cream", attention: "bg-atencao-suave", critical: "bg-critico-suave", success: "bg-sucesso-suave", gold: "bg-gold/20" };
  return <div className="grid grid-cols-[4rem_repeat(3,minmax(0,1fr))] gap-1">{rows.map((row) => <div className="contents" key={row.label}><span className="flex items-center justify-end pr-2 text-xs text-navy/55">{row.label}</span>{row.values.map((cell,index) => <span key={index} className={cn("grid min-h-14 place-items-center rounded-md border border-card text-sm font-semibold text-navy", tone[cell.tone])}>{cell.value}</span>)}</div>)}</div>;
}

export type BarDatum = { label: string; value: number; detail?: string; tone?: "navy" | "gold" | "terracotta" };

export function HorizontalBars({ items, label }: { items: BarDatum[]; label: string }) {
  return <figure role="img" aria-label={label} className="space-y-3">{items.map((item) => <div key={item.label}><div className="mb-1 flex items-center justify-between gap-3 text-[10px]"><span className="font-medium text-navy">{item.label}</span><span className="tabular-nums text-navy/55">{item.detail ?? `${item.value}%`}</span></div><div className="h-2 overflow-hidden rounded-full bg-navy/10"><div className={cn("h-full rounded-full", item.tone === "terracotta" ? "bg-terracotta" : item.tone === "gold" ? "bg-gold" : "bg-navy")} style={{ width: `${Math.max(4, Math.min(100, item.value))}%` }} /></div></div>)}</figure>;
}

export function ColumnChart({ items, label }: { items: { label: string; value: number; highlighted?: boolean }[]; label: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);
  return <figure role="img" aria-label={label}><div className="flex h-36 items-end gap-2 border-b border-l border-navy/15 px-2 pt-3">{items.map((item) => <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"><span className="text-[9px] font-semibold tabular-nums text-navy/60">{item.value}</span><div className={cn("w-full max-w-10 rounded-t-sm", item.highlighted ? "bg-gold" : "bg-navy/70")} style={{ height: `${Math.max(10, (item.value / maximum) * 96)}px` }} /><span className="w-full truncate text-center text-[8px] text-navy/55">{item.label}</span></div>)}</div></figure>;
}

export function TrendChart({ values, labels, label }: { values: number[]; labels: string[]; label: string }) {
  const width = 320; const height = 112; const maximum = Math.max(...values, 1); const minimum = Math.min(...values, 0); const range = Math.max(maximum - minimum, 1);
  const points = values.map((value, index) => ({ x: 18 + index * ((width - 36) / Math.max(values.length - 1, 1)), y: height - 22 - ((value - minimum) / range) * (height - 42), value }));
  return <figure role="img" aria-label={label}><svg viewBox={`0 0 ${width} ${height}`} className="w-full">{[28,54,80].map((y) => <line key={y} x1="12" x2={width - 12} y1={y} y2={y} className="stroke-navy/10" />)}<polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" className="stroke-terracotta" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{points.map((point,index) => <g key={`${labels[index]}-${point.value}`}><circle cx={point.x} cy={point.y} r="4" className="fill-card stroke-terracotta" strokeWidth="2" /><text x={point.x} y={height - 6} textAnchor="middle" className="fill-navy/55 text-[8px]">{labels[index]}</text></g>)}</svg></figure>;
}

export function StatusDonut({ segments, label }: { segments: { label: string; value: number; tone: "navy" | "gold" | "terracotta" | "success" }[]; label: string }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0); let accumulated = 0;
  const stroke = { navy: "stroke-navy", gold: "stroke-gold", terracotta: "stroke-terracotta", success: "stroke-sucesso" } as const;
  const fill = { navy: "bg-navy", gold: "bg-gold", terracotta: "bg-terracotta", success: "bg-sucesso" } as const;
  return <figure role="img" aria-label={label} className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center"><svg viewBox="0 0 120 120" className="mx-auto h-32 w-32 -rotate-90"><circle cx="60" cy="60" r="42" fill="none" className="stroke-navy/10" strokeWidth="18" />{segments.map((segment) => { const ratio = total > 0 ? segment.value / total : 0; const start = accumulated; accumulated += ratio; return <circle key={segment.label} cx="60" cy="60" r="42" fill="none" className={stroke[segment.tone]} strokeWidth="18" strokeDasharray={`${ratio * 263.89} 263.89`} strokeDashoffset={-start * 263.89} />; })}</svg><figcaption className="space-y-2">{segments.map((segment) => <div key={segment.label} className="flex items-center justify-between gap-3 text-[10px]"><span className="flex items-center gap-2 text-navy/65"><span className={cn("h-2.5 w-2.5 rounded-sm", fill[segment.tone])} />{segment.label}</span><strong className="tabular-nums text-navy">{segment.value}</strong></div>)}</figcaption></figure>;
}