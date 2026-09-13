import type { ReactNode } from "react";

import { KitCard, KitEmptyState, type KitTone } from "./base";
import { PublicationQueue } from "./conteudo";
import { CrmKanban, ContextAlert, type KanbanItem } from "./operacao";
import { ColumnChart, KpiCard, type BarDatum, HorizontalBars } from "./visualizacao";

type Kpi = { label: string; value: string | number | null; detail?: string; tone?: KitTone };
type Alert = { context: string; message: string; tone?: KitTone };

function TituloSuperficie({ titulo, apoio }: { titulo: string; apoio?: string }) {
  return <header><h2 className="font-serif text-2xl text-navy">{titulo}</h2>{apoio ? <p className="mt-1 text-sm text-navy/60">{apoio}</p> : null}</header>;
}

/** Grupo 1 · entrada única do Desk, limitado a cinco indicadores. */
export function HojeTemplate({ kpis, alerts, children }: { kpis: Kpi[]; alerts: Alert[]; children?: ReactNode }) {
  return <section className="space-y-4"><TituloSuperficie titulo="Hoje" apoio="Exceções, sinais e descoberta que pedem atenção." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpis.slice(0, 5).map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div><div className="grid gap-3 lg:grid-cols-2">{alerts.length ? alerts.map((alert) => <ContextAlert key={`${alert.context}-${alert.message}`} {...alert} />) : <KitEmptyState title="Sem alertas" description="Nenhuma exceção operacional disponível." />}</div>{children}</section>;
}

/** Grupo 2 · Marketing & Comercial, com funil e CRM vivo. */
export function ComercialTemplate({ funnel, columns, children }: { funnel: BarDatum[]; columns: { id: string; title: string; items: KanbanItem[] }[]; children?: ReactNode }) {
  return <section className="space-y-4"><TituloSuperficie titulo="Marketing & Comercial" apoio="Aquisição, Discovery, próximos passos e handoff." /><KitCard title="Funil comercial"><HorizontalBars items={funnel} label="Funil comercial" /></KitCard><CrmKanban columns={columns} />{children}</section>;
}

/** Grupo 4 · Pesquisa e Biblioteca Mestre no mesmo encadeamento. */
export function PesquisaBibliotecaTemplate({ chain, queue, children }: { chain: BarDatum[]; queue: { draft: number; review: number; approved: number; published: number }; children?: ReactNode }) {
  return <section className="space-y-4"><TituloSuperficie titulo="Inteligência & Pesquisa" apoio="Pergunta → fonte → evidência → achado → microentrega." /><KitCard title="Encadeamento da pesquisa"><HorizontalBars items={chain} label="Encadeamento da pesquisa" /></KitCard><KitCard title="Fila governada de publicação"><PublicationQueue counts={queue} /></KitCard>{children}</section>;
}

/** Grupo 5 · formalização e financeiro permanecem reunidos. */
export function FormalizacaoFinanceiroTemplate({ kpis, alerts, children }: { kpis: Kpi[]; alerts: Alert[]; children?: ReactNode }) {
  return <section className="space-y-4"><TituloSuperficie titulo="Formalização & Financeiro" apoio="Contrato vivo, atos formais, parcelas e alertas contextuais." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div>{alerts.map((alert) => <ContextAlert key={`${alert.context}-${alert.message}`} {...alert} />)}{children}</section>;
}

/** Grupo 6 · governança; configuração e acesso continuam no menu da conta. */
export function GovernancaTemplate({ indicators, children }: { indicators: Array<{ label: string; value: number; highlighted?: boolean }>; children?: ReactNode }) {
  return <section className="space-y-4"><TituloSuperficie titulo="Governança & Administração" apoio="Qualidade, auditoria e controles administrativos." /><KitCard title="Indicadores de governança"><ColumnChart items={indicators} label="Indicadores de governança" /></KitCard>{children}</section>;
}