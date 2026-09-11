import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CircleDollarSign, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { moeda } from "@/components/comercial/base";
import { saudacaoDaHora } from "@/lib/painel-abertura";
import type { ItemDia } from "@/lib/painel-dia";
import { hojeISO, textoPrazo } from "@/lib/painel-dia";
import {
  percentualInteiro,
  recorteMesVisaoGeral,
  type CelulaFunilMockup,
} from "@/lib/visao-geral-mockup";
import { cn } from "@/lib/utils";

export type PrioridadeHoje = Pick<ItemDia, "id" | "tipo" | "rotulo" | "acao" | "data" | "responsavel">;

function marcadorPrioridade(data: string | null, hoje: string) {
  if (data && data < hoje) {
    return { forma: "triangulo" as const, sr: "Crítico" };
  }
  if (data === hoje) {
    return { forma: "anel" as const, sr: "Hoje" };
  }
  return { forma: "cheio" as const, sr: "No prazo" };
}

function Marcador({ forma, sr }: ReturnType<typeof marcadorPrioridade>) {
  if (forma === "triangulo") {
    return (
      <span className="mt-1 inline-block text-terracotta" aria-label={sr} title={sr}>
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <path d="M6 1.5 11 10.5H1L6 1.5Z" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (forma === "anel") {
    return (
      <span
        className="mt-1.5 inline-block size-2.5 rounded-full border-2 border-navy/40"
        aria-label={sr}
        title={sr}
      />
    );
  }
  return (
    <span className="mt-1.5 inline-block size-2.5 rounded-full bg-sucesso" aria-label={sr} title={sr} />
  );
}

function KpiPagina11({
  rotulo,
  valor,
  apoio,
  to,
  icone: Icone,
}: {
  rotulo: string;
  valor: string | number | null;
  apoio?: string;
  to: "/casos" | "/alertas" | "/financeiro" | "/conversao";
  icone: LucideIcon;
}) {
  const temValor = valor !== null && valor !== undefined && valor !== "";
  return (
    <Link
      to={to}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
    >
      <div className="rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5">
        <Icone className="size-5 text-navy" strokeWidth={1.5} aria-hidden />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/50">{rotulo}</p>
        <p
          className={cn(
            "mt-1 font-serif text-2xl leading-none tabular-nums",
            temValor ? "text-navy" : "text-navy/40",
          )}
        >
          {temValor ? valor : "—"}
        </p>
        <p className="mt-1 text-xs text-navy/55">{temValor ? (apoio ?? "") : "Sem dados suficientes"}</p>
      </div>
    </Link>
  );
}

/** Saudação da p. 11: eyebrow do mês + “Bom dia, equipe.” em serif. */
export function SaudacaoVisaoGeral() {
  return (
    <header>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/45">
        Visão geral · {recorteMesVisaoGeral()}
      </p>
      <h1 className="mt-1 font-serif text-3xl leading-tight text-navy">{saudacaoDaHora()}, equipe.</h1>
    </header>
  );
}

/**
 * Face da Visão Geral no mockup de 17 páginas (p. 11): quatro KPIs com ícone,
 * funil de 4 células coloridas, tabela de alertas à esquerda e prioridades à direita.
 */
export function VisaoGeralTopo({
  casosAtivos,
  alertasPendentes,
  receitaMes,
  conversao,
  funil,
  prioridades,
  alertas,
}: {
  casosAtivos: number;
  alertasPendentes: number | null;
  receitaMes: number | null;
  conversao: number | null;
  funil: readonly CelulaFunilMockup[];
  prioridades: readonly PrioridadeHoje[];
  alertas?: ReactNode;
}) {
  const hoje = hojeISO();

  return (
    <section data-mockup-kpis className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiPagina11
          rotulo="Casos ativos"
          valor={casosAtivos}
          apoio="Abrir Casos 360"
          to="/casos"
          icone={Users}
        />
        <KpiPagina11
          rotulo="Alertas pendentes"
          valor={alertasPendentes}
          apoio="Abrir a lista em Alertas"
          to="/alertas"
          icone={Bell}
        />
        <KpiPagina11
          rotulo="Receita do mês"
          valor={receitaMes === null ? null : moeda(receitaMes)}
          apoio="Abrir faturas e pagamentos"
          to="/financeiro"
          icone={CircleDollarSign}
        />
        <KpiPagina11
          rotulo="Taxa de conversão"
          valor={conversao === null ? null : percentualInteiro(conversao)}
          apoio="Abrir funil comercial"
          to="/conversao"
          icone={TrendingUp}
        />
      </div>

      <section className="rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5">
        <header className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">Funil de leads</h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">Últimos 30 dias</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {funil.map((c) => (
            <div key={c.codigo} className="rounded-xl bg-cream/50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50">{c.rotulo}</p>
              <p className={cn("mt-1 font-serif text-2xl tabular-nums", c.semDado ? "text-navy/40" : "text-navy")}>
                {c.texto}
              </p>
              {c.semDado ? (
                <p className="mt-1 text-[11px] text-navy/50">Sem dados suficientes</p>
              ) : (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/10">
                  <div
                    className={cn("h-full rounded-full", c.barra)}
                    style={{ width: `${c.largura}%` }}
                    aria-hidden
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Link to="/conversao" className="mt-4 inline-block text-xs text-navy underline underline-offset-2">
          Abrir conversão e funil
        </Link>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">{alertas}</div>
        <div className="rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="font-serif text-lg text-navy">Prioridades de hoje</h2>
          <p className="mt-0.5 text-xs text-navy/55">O que está parado, vencido ou pede decisão.</p>
          {prioridades.length ? (
            <ul className="mt-4 space-y-3">
              {prioridades.map((i) => {
                const marcador = marcadorPrioridade(i.data, hoje);
                return (
                  <li key={`${i.tipo}-${i.id}`} className="flex items-start gap-3">
                    <Marcador {...marcador} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy">{i.rotulo}</p>
                      <p className="text-xs text-navy/70">{i.acao}</p>
                      <p className="text-[11px] text-navy/50">
                        {i.responsavel ?? "Sem responsável"} · {textoPrazo(i.data)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-navy/55">Nada vencido ou sem dono nesta leitura.</p>
          )}
          <Link to="/calls" className="mt-4 inline-block text-xs text-navy underline underline-offset-2">
            Abrir Mesa de Discovery
          </Link>
        </div>
      </div>
    </section>
  );
}
