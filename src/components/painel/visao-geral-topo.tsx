import { Link } from "@tanstack/react-router";

import { BadgeDesk, CardIndicador } from "@/components/desk/ui-desk";
import { moeda } from "@/components/comercial/base";
import { percentualOuTraco } from "@/lib/conversao-funil";
import type { ItemDia } from "@/lib/painel-dia";
import { hojeISO, textoPrazo } from "@/lib/painel-dia";

export type EtapaFunilHoje = { codigo: string; rotulo: string; entidades: number };

export type PrioridadeHoje = Pick<ItemDia, "id" | "tipo" | "rotulo" | "acao" | "data" | "responsavel">;

function seloPrioridade(data: string | null, hoje: string) {
  if (!data) return { texto: "Sem prazo", tom: "neutro" as const };
  if (data < hoje) return { texto: "Crítico", tom: "critico" as const };
  if (data === hoje) return { texto: "Hoje", tom: "atencao" as const };
  return { texto: "Próximos 7 dias", tom: "neutro" as const };
}

/**
 * Face da Visão Geral no mockup de 17 páginas: quatro KPIs no topo, funil de
 * leads à esquerda, prioridades à direita. Cada número abre a aba dona.
 * Chrome visual alinhado ao Kpi/Card do mockup (rounded-2xl, eyebrow terracotta).
 */
export function VisaoGeralTopo({
  casosAtivos,
  alertasPendentes,
  receitaMes,
  conversao,
  funil,
  prioridades,
}: {
  casosAtivos: number;
  alertasPendentes: number | null;
  receitaMes: number | null;
  conversao: number | null;
  funil: readonly EtapaFunilHoje[];
  prioridades: readonly PrioridadeHoje[];
}) {
  const hoje = hojeISO();
  const picoFunil = Math.max(1, ...funil.map((e) => e.entidades));

  return (
    <section data-mockup-kpis className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/casos"
          className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <CardIndicador rotulo="Casos ativos" valor={casosAtivos} apoio="Abrir Casos 360" tom="neutro" />
        </Link>
        <Link
          to="/alertas"
          className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <CardIndicador
            rotulo="Alertas pendentes"
            valor={alertasPendentes}
            apoio="Abrir a lista em Alertas"
            tom="atencao"
          />
        </Link>
        <Link
          to="/financeiro"
          className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <CardIndicador
            rotulo="Receita do mês"
            valor={receitaMes === null ? null : moeda(receitaMes)}
            apoio="Abrir faturas e pagamentos"
            tom="neutro"
          />
        </Link>
        <Link
          to="/conversao"
          className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <CardIndicador
            rotulo="Conversão"
            valor={conversao === null ? null : percentualOuTraco(conversao)}
            apoio="Abrir funil comercial"
            tom="neutro"
          />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Painel Hoje</p>
          <h2 className="font-serif text-lg text-navy">Funil de leads</h2>
          <p className="mt-0.5 text-xs text-navy/55">
            Lead → Discovery → proposta → contrato → caso. Sem evento, a etapa fica zero.
          </p>
          <ol className="mt-4 space-y-2">
            {funil.map((e, i) => {
              const largura = e.entidades <= 0 ? 0 : Math.max(12, Math.round((e.entidades / picoFunil) * 100));
              return (
                <li key={e.codigo} className="list-none">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-wide text-navy/50">
                      {i + 1}. {e.rotulo}
                    </p>
                    <p className="font-serif text-xl tabular-nums text-navy">{e.entidades}</p>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${largura}%` }}
                      aria-hidden
                    />
                  </div>
                </li>
              );
            })}
          </ol>
          <Link to="/conversao" className="mt-4 inline-block text-xs text-navy underline underline-offset-2">
            Abrir conversão e funil
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Painel Hoje</p>
          <h2 className="font-serif text-lg text-navy">Prioridades de hoje</h2>
          <p className="mt-0.5 text-xs text-navy/55">O que está parado, vencido ou pede decisão.</p>
          {prioridades.length ? (
            <ul className="mt-4 space-y-2">
              {prioridades.map((i) => {
                const selo = seloPrioridade(i.data, hoje);
                return (
                  <li
                    key={`${i.tipo}-${i.id}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy">{i.rotulo}</p>
                      <p className="text-xs text-navy/70">{i.acao}</p>
                      <p className="text-[11px] text-navy/50">
                        {i.responsavel ?? "Sem responsável"} · {textoPrazo(i.data)}
                      </p>
                    </div>
                    <BadgeDesk texto={selo.texto} tom={selo.tom} />
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
