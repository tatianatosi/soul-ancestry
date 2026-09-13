import type { ReactNode } from "react";
import { Check, Circle, Scale } from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DeskSidebar, DeskTopbar, KitBadge, KitCard, KitEmptyState, KitField, KitModal, KitTable, type KitTone } from "./base";
import { FamilyNetwork, MiniFamilyTree, PersonNode, ResearchArtifactCard, type GenealogyPerson } from "./genealogia";
import { JourneyProgress, MicrodeliveryCard, NextActionCard, type JourneyStep } from "./jornada";
import { CrmKanban, type KanbanItem } from "./operacao";
import { ColumnChart, DeskMatrix, HorizontalBars, KpiCard, RadarChart, type RadarAxis, StatusDonut, TrendChart } from "./visualizacao";
import { ContextAlert } from "./operacao";
import { MatrizPrioridadeNominal, RadarIndividualOperacional, RadarInternoTemplate } from "./radar-operacional";

export { BrandLogo, Button };

export function DeskMobileNav({
  items,
  active,
  onSelect,
}: {
  items: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <nav aria-label="Navegação do Desk" className="fixed inset-x-0 bottom-0 z-40 grid grid-flow-col border-t border-navy/10 bg-card px-2 py-1.5 lg:hidden">
      {items.map((item) => (
        <Button
          key={item.id}
          type="button"
          variant="ghost"
          size="sm"
          aria-current={item.id === active ? "page" : undefined}
          onClick={() => onSelect?.(item.id)}
          className={cn("h-12 min-w-0 flex-col gap-0.5 px-1 text-[10px]", item.id === active ? "bg-gold/20 text-navy" : "text-navy/55")}
        >
          {item.icon}
          <span className="max-w-full truncate">{item.label}</span>
        </Button>
      ))}
    </nav>
  );
}

export function TimelineVertical({ steps }: { steps: JourneyStep[] }) {
  if (!steps.length) return <KitEmptyState title="Linha do tempo vazia" description="Nenhuma etapa disponível para exibição." />;
  return (
    <ol className="space-y-0" aria-label="Linha do tempo vertical">
      {steps.map((step, index) => (
        <li key={step.id} className="grid grid-cols-[1.5rem_1fr] gap-3">
          <div className="flex flex-col items-center">
            <span className={cn("grid h-6 w-6 place-items-center rounded-full border", step.state === "done" ? "border-navy bg-navy text-card" : step.state === "current" ? "border-gold bg-gold text-navy" : "border-navy/20 bg-card text-navy/35")}>
              {step.state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-2.5 w-2.5" aria-hidden />}
            </span>
            {index < steps.length - 1 ? <span className="min-h-10 w-px flex-1 bg-navy/15" aria-hidden /> : null}
          </div>
          <div className="pb-5">
            <p className="text-sm font-semibold text-navy">{step.title}</p>
            {step.detail ? <p className="mt-0.5 text-xs text-navy/55">{step.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function JourneyStepper({ steps }: { steps: JourneyStep[] }) {
  if (!steps.length) return <KitEmptyState title="Stepper vazio" description="Nenhuma etapa disponível para exibição." />;
  return (
    <ol className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr" aria-label="Etapas da jornada">
      {steps.map((step, index) => (
        <li key={step.id} className="relative rounded-md border border-navy/10 bg-card p-3">
          <div className="flex items-center gap-2">
            <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold", step.state === "done" ? "bg-navy text-card" : step.state === "current" ? "bg-gold text-navy" : "bg-cream text-navy/50")}>{index + 1}</span>
            <span className="text-xs font-semibold text-navy">{step.title}</span>
          </div>
          {step.detail ? <p className="mt-2 text-[11px] text-navy/55">{step.detail}</p> : null}
        </li>
      ))}
    </ol>
  );
}

/** Nome estável pedido pelo kit; mantém a implementação vetorial acessível. */
export function RadarSvg(props: Parameters<typeof RadarChart>[0]) {
  return <RadarChart {...props} />;
}

export function DocumentoCard(props: Omit<Parameters<typeof ResearchArtifactCard>[0], "kind">) {
  return <ResearchArtifactCard kind="Documento" {...props} />;
}

export function AchadoCard(props: Omit<Parameters<typeof ResearchArtifactCard>[0], "kind">) {
  return <ResearchArtifactCard kind="Achado" {...props} />;
}

export function MicroentregaDetalhe({ title, description, owner, due, status, tone = "attention" }: { title: string; description?: string; owner?: string; due?: string; status: string; tone?: KitTone }) {
  return <KitCard eyebrow="Microentrega" title={title} action={<KitBadge tone={tone}>{status}</KitBadge>}><p className="text-sm text-navy/70">{description ?? "Descrição não informada."}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-navy/10 pt-3 text-xs text-navy/55"><span>Dono: {owner ?? "A definir"}</span><span>Prazo: {due ?? "Sem prazo"}</span></div></KitCard>;
}

type TemplateHeader = { title: string; subtitle?: string; status?: string };

function TemplateTitle({ title, subtitle, status }: TemplateHeader) {
  return <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-2xl text-navy">{title}</h2>{subtitle ? <p className="mt-1 text-sm text-navy/60">{subtitle}</p> : null}</div>{status ? <KitBadge tone="gold">{status}</KitBadge> : null}</header>;
}

export function Caso360Template({ header, axes, journey, action, people, alerts = [], microdelivery }: { header: TemplateHeader; axes: RadarAxis[]; journey: JourneyStep[]; action: { action: string; owner?: string; due?: string }; people: GenealogyPerson[]; alerts?: string[]; microdelivery?: { title: string; state: string; publishedAt?: string } }) {
  return <section className="space-y-4"><TemplateTitle {...header} /><div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"><KitCard title="Jornada D0–D365"><JourneyStepper steps={journey} /><div className="mt-4"><JourneyProgress label="Progresso da jornada" value={journey.length ? Math.round((journey.filter((step) => step.state === "done").length / journey.length) * 100) : 0} /></div></KitCard><NextActionCard {...action} /></div><div className="grid gap-4 lg:grid-cols-3"><KitCard title="Radar individual"><RadarChart axes={axes} label="Radar individual do caso" /></KitCard><KitCard title="Participantes"><div className="space-y-2">{people.length ? people.map((person) => <PersonNode key={person.id} person={person} />) : <KitEmptyState title="Sem participantes" description="Nenhuma pessoa disponível." />}</div></KitCard><KitCard title="Alertas do caso">{alerts.length ? <ul className="space-y-2">{alerts.map((alert) => <li key={alert} className="rounded-md border border-gold/35 bg-gold/10 p-2 text-xs text-navy">{alert}</li>)}</ul> : <KitEmptyState title="Sem alertas" description="Nenhum alerta contextual disponível." />}</KitCard></div>{microdelivery ? <MicrodeliveryCard {...microdelivery} /> : null}</section>;
}

export function Pessoa360Template({ header, person, family, documents, findings }: { header: TemplateHeader; person: GenealogyPerson; family: GenealogyPerson[]; documents: Array<{ title: string; detail?: string; status?: string }>; findings: Array<{ title: string; detail?: string; status?: string }> }) {
  return <section className="space-y-4"><TemplateTitle {...header} /><div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]"><KitCard title="Pessoa"><PersonNode person={person} selected /><dl className="mt-3 space-y-2 text-xs text-navy/65"><div className="flex justify-between gap-3"><dt>Local</dt><dd className="font-medium text-navy">{person.place ?? "Não informado"}</dd></div><div className="flex justify-between gap-3"><dt>Estado</dt><dd className="font-medium text-navy">{person.status ?? "Não informado"}</dd></div></dl></KitCard><KitCard title="Árvore e vínculos">{family.length ? <MiniFamilyTree people={[person, ...family]} /> : <KitEmptyState title="Sem vínculos" description="Nenhuma relação familiar disponível." />}</KitCard></div><div className="grid gap-4 lg:grid-cols-2"><KitCard title="Documentos"><div className="space-y-2">{documents.length ? documents.map((item) => <DocumentoCard key={item.title} {...item} />) : <KitEmptyState title="Sem documentos" description="Nenhum documento disponível." />}</div></KitCard><KitCard title="Achados"><div className="space-y-2">{findings.length ? findings.map((item) => <AchadoCard key={item.title} {...item} />) : <KitEmptyState title="Sem achados" description="Nenhum achado disponível." />}</div></KitCard></div></section>;
}

export function FinanceiroTemplate({ header, kpis, rows, alerts = [] }: { header: TemplateHeader; kpis: Array<{ label: string; value: string | number | null; detail?: string; tone?: KitTone }>; rows: ReactNode[][]; alerts?: string[] }) {
  return <section className="space-y-4"><TemplateTitle {...header} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div><div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]"><KitCard title="Parcelas"><KitTable columns={["Parcela", "Vencimento", "Valor", "Estado"]} rows={rows} /></KitCard><KitCard title="Alertas contextualizados">{alerts.length ? <ul className="space-y-2">{alerts.map((alert) => <li key={alert} className="rounded-md border border-gold/35 bg-gold/10 p-2 text-xs text-navy">{alert}</li>)}</ul> : <KitEmptyState title="Sem alertas" description="Nenhum alerta de contrato ou parcela." />}</KitCard></div></section>;
}

export function JuridicoTemplate({ header, acts, documents, alerts = [] }: { header: TemplateHeader; acts: Array<{ label: string; value: number; tone: KitTone }>; documents: Array<{ title: string; detail?: string; status?: string }>; alerts?: string[] }) {
  return <section className="space-y-4"><TemplateTitle {...header} /><div className="grid gap-4 lg:grid-cols-2"><KitCard title="Atos formais"><DeskMatrix rows={acts.map((act) => ({ label: act.label, values: [{ value: act.value, tone: act.tone }, { value: `${act.value}%`, tone: act.tone }, { value: act.value === 100 ? "Concluído" : "Em curso", tone: act.tone }] }))} /></KitCard><KitCard title="Documentos do contrato"><div className="space-y-2">{documents.length ? documents.map((item) => <DocumentoCard key={item.title} {...item} />) : <KitEmptyState title="Sem documentos" description="Nenhum documento formal disponível." />}</div></KitCard></div><KitCard title="Alertas do contrato e atos formais">{alerts.length ? <ul className="grid gap-2 sm:grid-cols-2">{alerts.map((alert) => <li key={alert} className="flex items-center gap-2 rounded-md border border-gold/35 bg-gold/10 p-3 text-xs text-navy"><Scale className="h-4 w-4 shrink-0 text-gold" aria-hidden />{alert}</li>)}</ul> : <KitEmptyState title="Sem alertas" description="Nenhum alerta jurídico contextual disponível." />}</KitCard></section>;
}

export const KIT_COMPONENTS = {
  marca: ["BrandLogo"],
  estrutura: ["DeskSidebar", "DeskTopbar", "DeskMobileNav"],
  base: ["Button", "KitBadge", "KitCard", "KitField", "KitTable", "KitEmptyState", "KitModal"],
  jornada: ["TimelineVertical", "JourneyStepper", "JourneyProgress"],
  conteudo: ["DocumentoCard", "AchadoCard", "MicroentregaDetalhe"],
  visualizacao: ["RadarSvg", "MatrizPrioridadeNominal", "RadarIndividualOperacional", "MiniFamilyTree", "FamilyNetwork", "PersonNode", "CrmKanban", "ContextAlert", "KpiCard", "HorizontalBars", "ColumnChart", "TrendChart", "StatusDonut"],
  templates: ["RadarInternoTemplate", "Caso360Template", "Pessoa360Template", "FinanceiroTemplate", "JuridicoTemplate"],
} as const;

export type { GenealogyPerson, JourneyStep, KanbanItem, RadarAxis };
export { ColumnChart, ContextAlert, CrmKanban, DeskSidebar, DeskTopbar, FamilyNetwork, HorizontalBars, KitBadge, KitCard, KitEmptyState, KitField, KitModal, KitTable, KpiCard, MatrizPrioridadeNominal, MiniFamilyTree, PersonNode, RadarChart, RadarIndividualOperacional, RadarInternoTemplate, StatusDonut, TrendChart };