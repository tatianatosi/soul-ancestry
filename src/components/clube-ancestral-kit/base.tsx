import type { InputHTMLAttributes, ReactNode } from "react";
import { Search } from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type KitTone = "neutral" | "attention" | "critical" | "success" | "gold";

const toneClasses: Record<KitTone, string> = {
  neutral: "border-navy/15 bg-cream/60 text-navy/75",
  attention: "border-atencao/30 bg-atencao-suave text-atencao",
  critical: "border-critico/30 bg-critico-suave text-critico",
  success: "border-sucesso/30 bg-sucesso-suave text-sucesso",
  gold: "border-gold/50 bg-gold/15 text-navy",
};

export function KitBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: KitTone }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", toneClasses[tone])}>{children}</span>;
}

export function KitCard({ title, eyebrow, action, children, className }: { title?: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-navy/10 bg-card p-4 shadow-sm", className)}>
      {title || action ? <header className="mb-3 flex items-start justify-between gap-3"><div>{eyebrow ? <p className="text-[10px] font-semibold uppercase tracking-widest text-terracotta">{eyebrow}</p> : null}{title ? <h3 className="font-serif text-lg text-navy">{title}</h3> : null}</div>{action}</header> : null}
      {children}
    </section>
  );
}

export function KitField(props: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const { label, hint, className, ...inputProps } = props;
  return <label className="block text-sm text-navy"><span className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-navy/55">{label}</span><input className={cn("w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-navy outline-none focus-visible:ring-2 focus-visible:ring-gold", className)} {...inputProps} />{hint ? <span className="mt-1 block text-xs text-navy/55">{hint}</span> : null}</label>;
}

export function KitTable({ columns, rows, caption }: { columns: string[]; rows: ReactNode[][]; caption?: string }) {
  return <div className="overflow-x-auto rounded-lg border border-navy/10 bg-card"><table className="w-full min-w-[36rem] text-left text-sm"><caption className="sr-only">{caption ?? "Tabela"}</caption><thead className="border-b border-navy/10 bg-cream/50"><tr>{columns.map((column) => <th key={column} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-navy/60">{column}</th>)}</tr></thead><tbody className="divide-y divide-navy/5">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-2 text-navy/80">{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function KitEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-navy/20 bg-cream/40 p-8 text-center"><p className="font-serif text-lg text-navy">{title}</p><p className="mx-auto mt-1 max-w-md text-sm text-navy/60">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</div>;
}

export function KitModal({ trigger, title, description, children }: { trigger: ReactNode; title: string; description?: string; children: ReactNode }) {
  return <Dialog><DialogTrigger asChild>{trigger}</DialogTrigger><DialogContent data-visual-kit="pantone" className="border-navy/15 bg-background text-navy"><DialogHeader><DialogTitle className="font-serif text-2xl">{title}</DialogTitle>{description ? <DialogDescription className="text-navy/60">{description}</DialogDescription> : null}</DialogHeader>{children}</DialogContent></Dialog>;
}

export function DeskTopbar({ title, accountLabel = "Conta", action }: { title: string; accountLabel?: string; action?: ReactNode }) {
  return <header className="flex items-center gap-3 border-b border-navy/10 bg-card px-4 py-3"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-cream/40 px-3 py-2"><Search className="h-4 w-4 text-navy/45" aria-hidden /><span className="truncate text-xs text-navy/50">Buscar caso, pessoa ou documento</span></div><span className="hidden font-serif text-lg text-navy lg:block">{title}</span>{action ?? <KitBadge tone="gold">{accountLabel}</KitBadge>}</header>;
}

export function DeskSidebar({ items, active, onSelect }: { items: { id: string; label: string; icon?: ReactNode }[]; active: string; onSelect?: (id: string) => void }) {
  return <aside className="hidden min-h-screen w-64 shrink-0 bg-navy px-3 py-5 text-cream lg:block"><BrandLogo size={34} showText={false} variant="client-dark" /><p className="mt-3 font-serif text-lg text-gold">Clube Ancestral</p><nav className="mt-5 space-y-1">{items.map((item) => <Button key={item.id} variant="ghost" onClick={() => onSelect?.(item.id)} className={cn("w-full justify-start text-cream/80 hover:bg-cream/10 hover:text-cream", item.id === active && "bg-gold text-navy hover:bg-gold hover:text-navy")}>{item.icon}{item.label}</Button>)}</nav></aside>;
}