import { BookOpen, FileText, Library, NotebookPen } from "lucide-react";
import { KitBadge, KitCard } from "./base";

const contentIcons = { Caderno: NotebookPen, Relatório: FileText, Narrativa: BookOpen, Memória: Library } as const;
export type ContentKind = keyof typeof contentIcons;

export function ContentShelf({ title, items }: { title: string; items: { id: string; kind: ContentKind; title: string; subtitle?: string; state?: string }[] }) {
  return <section><h3 className="mb-3 font-serif text-xl text-navy">{title}</h3>{items.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => { const Icon = contentIcons[item.kind]; return <KitCard key={item.id}><Icon className="h-5 w-5 text-gold" aria-hidden /><p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-navy/50">{item.kind}</p><p className="mt-1 text-sm font-medium text-navy">{item.title}</p>{item.subtitle ? <p className="mt-1 text-xs text-navy/55">{item.subtitle}</p> : null}{item.state ? <div className="mt-3"><KitBadge tone="success">{item.state}</KitBadge></div> : null}</KitCard>; })}</div> : <p className="rounded-lg border border-dashed border-navy/20 bg-cream/40 p-6 text-center text-sm text-navy/55">Nenhum conteúdo publicado nesta prateleira.</p>}</section>;
}

export function PublicationQueue({ counts }: { counts: { draft: number; review: number; approved: number; published: number } }) {
  const stages = [["Rascunho", counts.draft], ["Revisão", counts.review], ["Aprovado", counts.approved], ["Publicado", counts.published]] as const;
  return <ol className="grid gap-2 sm:grid-cols-4">{stages.map(([label,count],index) => <li key={label} className="rounded-lg border border-navy/10 bg-card p-3"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-navy">{label}</span><KitBadge tone={index > 1 ? "success" : index === 1 ? "attention" : "neutral"}>{count}</KitBadge></div></li>)}</ol>;
}