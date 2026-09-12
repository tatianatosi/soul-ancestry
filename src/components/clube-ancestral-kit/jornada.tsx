import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitBadge, KitCard, type KitTone } from "./base";

export type JourneyStep = { id: string; title: string; detail?: string; state: "done" | "current" | "next" };

export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return <ol className="grid gap-3 sm:grid-cols-[repeat(var(--steps),minmax(0,1fr))]" style={{ "--steps": steps.length } as React.CSSProperties}>{steps.map((step) => <li key={step.id} className="relative rounded-lg border border-navy/10 bg-card p-3"><span className={cn("mb-2 grid h-6 w-6 place-items-center rounded-full", step.state === "done" ? "bg-sucesso text-card" : step.state === "current" ? "bg-gold text-navy" : "bg-cream text-navy/45")}>{step.state === "done" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}</span><p className="text-xs font-semibold text-navy">{step.title}</p>{step.detail ? <p className="mt-1 text-[11px] text-navy/55">{step.detail}</p> : null}</li>)}</ol>;
}

export function JourneyProgress({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div><div className="mb-1 flex justify-between text-xs text-navy/60"><span>{label}</span><span>{safeValue}%</span></div><div className="h-2 overflow-hidden rounded-full bg-navy/10"><div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${safeValue}%` }} /></div></div>;
}

export function NextActionCard({ action, owner, due, tone = "gold" }: { action: string; owner?: string; due?: string; tone?: KitTone }) {
  return <KitCard title="Próxima ação" action={<KitBadge tone={tone}>{due ?? "Sem prazo"}</KitBadge>}><p className="text-sm font-medium text-navy">{action}</p><p className="mt-2 inline-flex items-center gap-1 text-xs text-navy/55"><Clock3 className="h-3 w-3" />Responsável: {owner ?? "A definir"}</p></KitCard>;
}

export function MicrodeliveryCard({ title, state, publishedAt }: { title: string; state: string; publishedAt?: string }) {
  return <KitCard eyebrow="Microentrega" title={title} action={<KitBadge tone={publishedAt ? "success" : "attention"}>{state}</KitBadge>}><p className="text-xs text-navy/55">{publishedAt ? `Publicada em ${publishedAt}` : "Aguardando revisão antes de qualquer publicação."}</p></KitCard>;
}