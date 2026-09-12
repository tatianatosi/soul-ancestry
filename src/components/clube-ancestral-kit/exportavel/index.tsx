import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import logoPrincipal from "./assets/logo-principal.svg";
import "./tokens.css";

export const CLUBE_ANCESTRAL_TOKENS = {
  navy: "#13294B",
  navySoft: "#1B365D",
  cream: "#F0EEE9",
  gold: "#C2A84D",
  ink: "#28334A",
  white: "#FFFFFF",
} as const;

export type KitTone = "neutral" | "gold" | "success" | "warning" | "critical";
export type ItemNavegacao = { id: string; label: string; icon?: ReactNode };
export type EstadoEtapa = "done" | "current" | "next";

const join = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();

export function KitRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={join("ca-kit", className)}>{children}</div>;
}

export function BrandLogo({ src = logoPrincipal, size = 42, showName = true, className }: { src?: string; size?: number; showName?: boolean; className?: string }) {
  return <span className={join("ca-kit__brand", className)}><img src={src} alt="Clube Ancestral" style={{ height: size }} />{showName ? <span className="ca-kit__brand-name">Clube Ancestral</span> : null}</span>;
}

export function KitButton({ variant = "primary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "gold" | "outline" }) {
  return <button {...props} className={join("ca-kit__button", `ca-kit__button--${variant}`, className)} />;
}

export function KitBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: KitTone }) {
  return <span className={join("ca-kit__badge", tone !== "neutral" && `ca-kit__badge--${tone}`)}>{children}</span>;
}

export function KitCard({ title, eyebrow, action, children, className }: { title?: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={join("ca-kit__card", className)}>{title || eyebrow || action ? <header className="ca-kit__card-head"><div>{eyebrow ? <p className="ca-kit__eyebrow">{eyebrow}</p> : null}{title ? <h3 className="ca-kit__title">{title}</h3> : null}</div>{action}</header> : null}{children}</section>;
}

export function KitEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="ca-kit__empty"><div><h3 className="ca-kit__title">{title}</h3><p>{description}</p>{action ? <div style={{ marginTop: 14 }}>{action}</div> : null}</div></div>;
}

export function DeskSidebar({ items, active, onSelect }: { items: ItemNavegacao[]; active: string; onSelect?: (id: string) => void }) {
  return <aside className="ca-kit__sidebar"><BrandLogo size={34} /><nav className="ca-kit__sidebar-nav" aria-label="Navegação principal">{items.map((item) => <button key={item.id} type="button" className="ca-kit__nav-button" aria-current={item.id === active ? "page" : undefined} onClick={() => onSelect?.(item.id)}>{item.icon}{item.label}</button>)}</nav></aside>;
}

export function DeskTopbar({ title, searchLabel = "Buscar caso, pessoa ou documento", action }: { title: string; searchLabel?: string; action?: ReactNode }) {
  return <header className="ca-kit__topbar"><div className="ca-kit__search">{searchLabel}</div><h2 className="ca-kit__title">{title}</h2>{action}</header>;
}

export function MobileNav({ items, active, onSelect }: { items: ItemNavegacao[]; active: string; onSelect?: (id: string) => void }) {
  return <nav className="ca-kit__mobile-nav" aria-label="Navegação móvel">{items.map((item) => <button key={item.id} type="button" className="ca-kit__nav-button" aria-current={item.id === active ? "page" : undefined} onClick={() => onSelect?.(item.id)}>{item.icon}{item.label}</button>)}</nav>;
}

export type TimelineItem = { id: string; title: string; detail?: string; meta?: string; state: EstadoEtapa };
export function VerticalTimeline({ items, emptyTitle = "Nenhum evento" }: { items: TimelineItem[]; emptyTitle?: string }) {
  if (!items.length) return <KitEmptyState title={emptyTitle} description="Não há informações disponíveis para esta linha do tempo." />;
  return <ol className="ca-kit__timeline">{items.map((item) => <li key={item.id} className="ca-kit__timeline-item" data-state={item.state}><span className="ca-kit__timeline-dot" aria-hidden /><div><strong>{item.title}</strong>{item.detail ? <p>{item.detail}</p> : null}{item.meta ? <p>{item.meta}</p> : null}</div></li>)}</ol>;
}

export type StepItem = { id: string; title: string; detail?: string; state: EstadoEtapa };
export function Stepper({ steps }: { steps: StepItem[] }) {
  if (!steps.length) return <KitEmptyState title="Nenhuma etapa" description="Não há etapas disponíveis para exibição." />;
  return <ol className="ca-kit__stepper" style={{ "--ca-step-count": steps.length } as CSSProperties}>{steps.map((step) => <li key={step.id} className="ca-kit__step" data-state={step.state}><strong>{step.title}</strong>{step.detail ? <p className="ca-kit__muted">{step.detail}</p> : null}</li>)}</ol>;
}

export type RadarAxis = { label: string; value: number };
export type RadarSeries = { id: string; label: string; values: number[]; tone?: "navy" | "gold" };
export function RadarSvg({ axes, series, label = "Radar", size = 300 }: { axes: string[]; series: RadarSeries[]; label?: string; size?: number }) {
  if (axes.length < 3 || !series.length) return <KitEmptyState title="Radar sem dados" description="Informe ao menos três eixos e uma série para exibir o radar." />;
  const center = size / 2; const radius = size / 2 - 54;
  const point = (index: number, value: number) => { const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2; const distance = radius * Math.max(0, Math.min(100, value)) / 100; return [center + distance * Math.cos(angle), center + distance * Math.sin(angle)] as const; };
  const points = (values: number[]) => axes.map((_, index) => point(index, values[index] ?? 0).join(",")).join(" ");
  return <svg className="ca-kit__radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>{[25, 50, 75, 100].map((level) => <polygon key={level} points={points(axes.map(() => level))} fill="none" stroke="var(--ca-border)" />)}{axes.map((axis, index) => { const end = point(index, 100); const text = point(index, 122); return <g key={axis}><line x1={center} y1={center} x2={end[0]} y2={end[1]} stroke="var(--ca-border)" /><text x={text[0]} y={text[1]} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="var(--ca-ink)">{axis}</text></g>; })}{series.map((item) => <polygon key={item.id} points={points(item.values)} fill={item.tone === "gold" ? "var(--ca-gold-soft)" : "var(--ca-navy-wash)"} stroke={item.tone === "gold" ? "var(--ca-gold)" : "var(--ca-navy)"} strokeWidth="2.5" />)}</svg>;
}

export type FamilyPerson = { id: string; name: string; role?: string; place?: string; status?: string };
export function FamilyNode({ person, selected = false }: { person: FamilyPerson; selected?: boolean }) {
  return <article className="ca-kit__person" data-selected={selected}><span className="ca-kit__avatar">{initials(person.name)}</span><div><p><strong>{person.name}</strong></p><small>{[person.role, person.place].filter(Boolean).join(" · ") || "Pessoa"}</small>{person.status ? <div><KitBadge>{person.status}</KitBadge></div> : null}</div></article>;
}

export function FamilyTree({ levels }: { levels: FamilyPerson[][] }) {
  const people = levels.flat();
  if (!people.length) return <KitEmptyState title="Árvore sem pessoas" description="Nenhuma pessoa foi informada para esta visualização." />;
  return <div className="ca-kit__family-tree">{levels.map((level, levelIndex) => <div key={`level-${levelIndex}`} className="ca-kit__family-level">{level.map((person, personIndex) => <FamilyNode key={person.id} person={person} selected={levelIndex === 0 && personIndex === 0} />)}</div>)}</div>;
}

export type ArtifactProps = { title: string; description?: string; status?: string; action?: ReactNode };
function Artifact({ kind, eyebrow, title, description, status, action }: ArtifactProps & { kind: "document" | "finding" | "microdelivery"; eyebrow: string }) {
  return <article className="ca-kit__artifact" data-kind={kind}><div className="ca-kit__card-head"><div><p className="ca-kit__eyebrow">{eyebrow}</p><strong>{title}</strong></div>{status ? <KitBadge tone={kind === "microdelivery" ? "success" : kind === "finding" ? "gold" : "neutral"}>{status}</KitBadge> : null}</div>{description ? <p className="ca-kit__muted">{description}</p> : null}{action}</article>;
}
export function DocumentCard(props: ArtifactProps) { return <Artifact {...props} kind="document" eyebrow="Documento" />; }
export function FindingCard(props: ArtifactProps) { return <Artifact {...props} kind="finding" eyebrow="Achado" />; }
export function MicrodeliveryCard(props: ArtifactProps) { return <Artifact {...props} kind="microdelivery" eyebrow="Microentrega" />; }

export type KanbanItem = { id: string; title: string; description?: string; owner?: string; due?: string; alert?: string };
export type KanbanColumn = { id: string; title: string; items: KanbanItem[] };
export function Kanban({ columns }: { columns: KanbanColumn[] }) {
  if (!columns.length) return <KitEmptyState title="Quadro vazio" description="Nenhuma coluna foi informada." />;
  return <div className="ca-kit__kanban">{columns.map((column) => <section key={column.id} className="ca-kit__kanban-column"><header className="ca-kit__kanban-head"><strong>{column.title}</strong><KitBadge>{column.items.length}</KitBadge></header>{column.items.length ? column.items.map((item) => <article key={item.id} className="ca-kit__kanban-card"><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}{item.alert ? <p><KitBadge tone="warning">{item.alert}</KitBadge></p> : null}<p>{item.owner ?? "Responsável não informado"} · {item.due ?? "Prazo não informado"}</p></article>) : <p className="ca-kit__muted">Nenhum item.</p>}</section>)}</div>;
}

export function KpiCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return <KitCard className="ca-kit__kpi"><div className="ca-kit__kpi-label">{label}</div><div className="ca-kit__kpi-value">{value ?? "—"}</div>{detail ? <div className="ca-kit__kpi-detail">{detail}</div> : null}</KitCard>;
}

export function DataTable({ columns, rows, caption = "Tabela", emptyText = "Nenhum registro para exibir." }: { columns: string[]; rows: ReactNode[][]; caption?: string; emptyText?: string }) {
  return <div className="ca-kit__table-wrap"><table className="ca-kit__table"><caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{caption}</caption><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>) : <tr><td colSpan={Math.max(columns.length, 1)} className="ca-kit__muted">{emptyText}</td></tr>}</tbody></table></div>;
}

export type SummaryItem = { label: string; value?: ReactNode };
function Summary({ items }: { items: SummaryItem[] }) { return <div className="ca-kit__summary">{items.map((item) => <div key={item.label} className="ca-kit__summary-item"><span>{item.label}</span><strong>{item.value ?? "Não informado"}</strong></div>)}</div>; }
function CompositionHeader({ title, subtitle, status }: { title: string; subtitle?: string; status?: string }) { return <header className="ca-kit__section-head"><div><h2 className="ca-kit__title">{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>{status ? <KitBadge tone="gold">{status}</KitBadge> : null}</header>; }

export function Case360({ title, subtitle, status, summary, journey, nextAction, documents, aside }: { title: string; subtitle?: string; status?: string; summary: SummaryItem[]; journey: StepItem[]; nextAction?: ReactNode; documents?: ArtifactProps[]; aside?: ReactNode }) {
  return <section className="ca-kit__composition"><CompositionHeader title={title} subtitle={subtitle} status={status} /><Summary items={summary} /><KitCard title="Jornada"><Stepper steps={journey} /></KitCard><div className="ca-kit__grid">{nextAction ? <KitCard title="Próxima ação">{nextAction}</KitCard> : <KitEmptyState title="Sem próxima ação" description="Nenhuma próxima ação foi informada." />}{aside}</div>{documents ? <KitCard title="Documentos"><div className="ca-kit__stack">{documents.map((document, index) => <DocumentCard key={`${document.title}-${index}`} {...document} />)}</div></KitCard> : null}</section>;
}

export function Person360({ title, subtitle, status, summary, treeLevels, timeline, documents }: { title: string; subtitle?: string; status?: string; summary: SummaryItem[]; treeLevels: FamilyPerson[][]; timeline: TimelineItem[]; documents?: ArtifactProps[] }) {
  return <section className="ca-kit__composition"><CompositionHeader title={title} subtitle={subtitle} status={status} /><Summary items={summary} /><div className="ca-kit__grid"><KitCard title="Árvore familiar"><FamilyTree levels={treeLevels} /></KitCard><KitCard title="Linha do tempo"><VerticalTimeline items={timeline} /></KitCard></div>{documents ? <KitCard title="Documentos associados"><div className="ca-kit__stack">{documents.map((document, index) => <DocumentCard key={`${document.title}-${index}`} {...document} />)}</div></KitCard> : null}</section>;
}

export type FinancialEntry = { id: string; description: string; amount: ReactNode; status?: string; due?: string };
export function Financeiro({ title = "Financeiro", status, summary, entries, alert }: { title?: string; status?: string; summary: SummaryItem[]; entries: FinancialEntry[]; alert?: ReactNode }) {
  return <section className="ca-kit__composition"><CompositionHeader title={title} status={status} /><Summary items={summary} />{alert}<DataTable caption="Lançamentos financeiros" columns={["Descrição", "Valor", "Status", "Prazo"]} rows={entries.map((entry) => [entry.description, entry.amount, entry.status ?? "Não informado", entry.due ?? "Não informado"])} /></section>;
}

export type LegalEntry = { id: string; act: string; requirement?: string; status?: string; owner?: string };
export function Juridico({ title = "Jurídico", status, summary, entries, alert }: { title?: string; status?: string; summary: SummaryItem[]; entries: LegalEntry[]; alert?: ReactNode }) {
  return <section className="ca-kit__composition"><CompositionHeader title={title} status={status} /><Summary items={summary} />{alert}<DataTable caption="Atos jurídicos" columns={["Ato formal", "Requisito", "Status", "Responsável"]} rows={entries.map((entry) => [entry.act, entry.requirement ?? "Não informado", entry.status ?? "Não informado", entry.owner ?? "Não informado"])} /></section>;
}
