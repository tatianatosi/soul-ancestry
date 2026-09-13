import { CalendarDays, FileText, Link2, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitBadge, KitCard, type KitTone } from "./base";

export type GenealogyPerson = { id: string; name: string; role?: string; place?: string; status?: string };

export function PersonNode({ person, selected = false }: { person: GenealogyPerson; selected?: boolean }) {
  const initials = person.name.split(" ").slice(0, 2).map((part) => part.charAt(0)).join("");
  return <div className={cn("flex min-w-0 items-center gap-2 rounded-lg border bg-card p-2", selected ? "border-gold ring-2 ring-gold/20" : "border-navy/10")}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-gold">{initials}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-navy">{person.name}</span><span className="block truncate text-xs text-navy/55">{person.role ?? "Pessoa"}</span></span></div>;
}

export function FamilyCoreCard({ title, people, status = "Em pesquisa" }: { title: string; people: GenealogyPerson[]; status?: string }) {
  return <KitCard title={title} action={<KitBadge tone="attention">{status}</KitBadge>}><div className="space-y-2">{people.map((person) => <PersonNode key={person.id} person={person} />)}</div></KitCard>;
}

export function RelationshipLine({ from, relation, to }: { from: string; relation: string; to: string }) {
  return <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs text-navy"><span className="rounded-md border border-navy/10 bg-card p-2">{from}</span><span className="inline-flex items-center gap-1 text-navy/55"><Link2 className="h-3 w-3" />{relation}</span><span className="rounded-md border border-navy/10 bg-card p-2">{to}</span></div>;
}

export function GenealogyEvent({ date, title, place }: { date?: string; title: string; place?: string }) {
  return <div className="border-l-2 border-gold pl-3"><p className="text-sm font-medium text-navy">{title}</p><p className="mt-0.5 flex flex-wrap gap-3 text-xs text-navy/55">{date ? <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{date}</span> : null}{place ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{place}</span> : null}</p></div>;
}

export function ResearchArtifactCard({ kind, title, detail, status, tone = "neutral" }: { kind: "Fonte" | "Evidência" | "Achado" | "Documento"; title: string; detail?: string; status?: string; tone?: KitTone }) {
  return <article className="rounded-lg border border-navy/10 bg-card p-3"><div className="flex items-start gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-cream text-navy">{kind === "Documento" ? <FileText className="h-4 w-4" /> : kind === "Achado" ? <UserRound className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-widest text-navy/50">{kind}</p><p className="text-sm font-medium text-navy">{title}</p>{detail ? <p className="mt-1 text-xs text-navy/55">{detail}</p> : null}</div>{status ? <KitBadge tone={tone}>{status}</KitBadge> : null}</div></article>;
}

export function MiniFamilyTree({ people }: { people: GenealogyPerson[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-5"><div className="col-span-2 mx-auto w-full max-w-xs"><PersonNode person={people[0] ?? { id: "empty", name: "Pessoa não informada" }} selected /></div>{people.slice(1, 3).map((person) => <div key={person.id} className="relative before:absolute before:-top-3 before:left-1/2 before:h-3 before:w-px before:bg-gold"><PersonNode person={person} /></div>)}</div>;
}

export function FamilyNetwork({ people, label = "Rede de pessoas, núcleos e casos" }: { people: [GenealogyPerson, GenealogyPerson, GenealogyPerson, GenealogyPerson, GenealogyPerson]; label?: string }) {
  const nodes = [{ x: 260, y: 110, person: people[0], main: true }, { x: 105, y: 52, person: people[1] }, { x: 410, y: 48, person: people[2] }, { x: 110, y: 174, person: people[3] }, { x: 408, y: 176, person: people[4] }];
  return <figure role="img" aria-label={label} className="relative mx-auto h-56 max-w-xl overflow-hidden rounded-lg border border-navy/10 bg-cream/35"><svg viewBox="0 0 520 220" className="h-full w-full"><g className="stroke-gold/60" strokeWidth="2"><line x1="260" y1="110" x2="105" y2="52" /><line x1="260" y1="110" x2="410" y2="48" /><line x1="260" y1="110" x2="110" y2="174" /><line x1="260" y1="110" x2="408" y2="176" /></g>{nodes.map((node) => { const initials = node.person.name.split(" ").slice(0,2).map((part) => part.charAt(0)).join(""); return <g key={node.person.id}><circle cx={node.x} cy={node.y} r={node.main ? 27 : 22} className={node.main ? "fill-gold stroke-navy" : "fill-card stroke-navy/40"} strokeWidth="2" /><text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-navy text-[11px] font-semibold">{initials}</text></g>; })}</svg></figure>;
}