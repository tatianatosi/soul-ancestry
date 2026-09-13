import { Clock3, UserRound } from "lucide-react";
import { KitBadge, KitCard, type KitTone } from "./base";

export type KanbanItem = { id: string; title: string; context?: string; owner?: string; due?: string; nextAction?: string; alert?: string; tone?: KitTone };
export function CrmKanban({ columns }: { columns: { id: string; title: string; items: KanbanItem[] }[] }) {
  return <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">{columns.map((column) => <section key={column.id} className="rounded-lg border border-navy/10 bg-cream/40 p-2.5"><div className="mb-2 flex items-center justify-between border-b border-navy/10 pb-2"><h3 className="text-[11px] font-semibold uppercase text-navy/65">{column.title}</h3><KitBadge>{column.items.length}</KitBadge></div><div className="space-y-2">{column.items.map((item) => <article key={item.id} className="rounded-lg border border-navy/10 bg-card p-3"><p className="text-xs font-semibold text-navy">{item.title}</p>{item.context ? <p className="mt-1 text-[11px] text-navy/55">{item.context}</p> : null}{item.nextAction ? <p className="mt-2 border-t border-navy/5 pt-2 text-[11px] text-navy/70"><strong>Próximo passo:</strong> {item.nextAction}</p> : null}{item.alert ? <p className="mt-2 rounded-md border border-atencao/30 bg-atencao-suave p-1.5 text-[10px] text-atencao">{item.alert}</p> : null}<div className="mt-2 flex justify-between gap-2 text-[10px] text-navy/50"><span className="inline-flex items-center gap-1"><UserRound className="h-3 w-3" />{item.owner ?? "A definir"}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{item.due ?? "Sem prazo"}</span></div></article>)}</div></section>)}</div>;
}

export function ChecklistCard({ title, items }: { title: string; items: { id: string; label: string; done: boolean; detail?: string }[] }) {
  return <KitCard title={title}><ul className="space-y-2">{items.map((item) => <li key={item.id} className="flex items-start gap-2 rounded-md border border-navy/10 bg-cream/35 p-2"><span aria-hidden className={item.done ? "text-sucesso" : "text-navy/30"}>{item.done ? "✓" : "○"}</span><span><span className="block text-sm text-navy">{item.label}</span>{item.detail ? <span className="text-xs text-navy/55">{item.detail}</span> : null}</span></li>)}</ul></KitCard>;
}

export function ContextAlert({ context, message, tone = "attention" }: { context: string; message: string; tone?: KitTone }) {
  return <div className="rounded-lg border border-navy/10 bg-card p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-navy">{context}</p><KitBadge tone={tone}>{message}</KitBadge></div></div>;
}