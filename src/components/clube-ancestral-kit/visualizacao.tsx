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