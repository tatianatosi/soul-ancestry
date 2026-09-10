import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { CardIndicador, type TomEstado } from "@/components/desk/ui-desk";
import { painelHojeDesk } from "@/lib/crm-desk.functions";
import type { Fila } from "@/lib/crm-desk";
import {
  type AbaDesk,
  type KpiTransversal,
  contextoDosKpis,
  kpisDaAba,
  rotaAcaoKpi,
  valorDoKpi,
} from "@/lib/kpis-transversais";

const TOM_KPI: Record<string, TomEstado> = {
  acao_vencida_sem_dono: "critico",
  bloqueio_ativo: "critico",
  proximo_marco: "atencao",
  lead_discovery_parado: "atencao",
  lacuna_probatoria: "atencao",
  entrega_revisao: "atencao",
  formalizacao_pendente: "atencao",
  financeiro_sem_confirmacao: "atencao",
  conteudo_atraso: "atencao",
};

/** Grade de KPIs a partir das filas já lidas — Hoje e as abas donas compartilham a fonte. */
export function GradeKpisVivos({
  kpis,
  filas,
  incluirDemo = false,
}: {
  kpis: readonly KpiTransversal[];
  filas: Fila[];
  incluirDemo?: boolean;
}) {
  const ctx = contextoDosKpis(filas, incluirDemo);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-kpis-vivos>
      {kpis.map((k) => {
        const v = valorDoKpi(k, ctx);
        const tom = !v.total ? "neutro" : (TOM_KPI[k.id] ?? "atencao");
        const apoio = v.total === null ? `${v.cobertura} — ${k.leitura}` : k.leitura;
        return (
          <Link
            key={k.id}
            to={rotaAcaoKpi(v.destino)}
            className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <CardIndicador rotulo={k.rotulo} valor={v.total} apoio={apoio} tom={tom} />
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Resumo da aba: lê as mesmas filas do Painel Hoje. Não cria segunda pendência.
 * Clique abre o detalhe de origem.
 */
export function FaixaKpisVivos({ aba }: { aba: AbaDesk }) {
  const carregar = useServerFn(painelHojeDesk);
  const q = useQuery({
    queryKey: ["painel-desk-hoje", false],
    queryFn: () => carregar({ data: { incluirDemo: false } }),
    retry: false,
  });
  const kpis = kpisDaAba(aba);
  if (kpis.length === 0) return null;
  if (q.isLoading) {
    return <p className="mb-4 text-sm text-navy/50">Carregando sinais desta aba…</p>;
  }
  if (q.isError || !q.data) {
    return (
      <p className="mb-4 text-sm text-terracotta">
        Não foi possível ler os KPIs desta aba. Nenhum número foi inventado.
      </p>
    );
  }
  return (
    <section className="mb-6 space-y-2" data-kpis-aba={aba}>
      <p className="text-xs text-navy/55">
        Sinais desta aba. O clique abre a fila de origem; o Hoje só resume o mesmo fato.
      </p>
      <GradeKpisVivos kpis={kpis} filas={q.data.filas as Fila[]} />
    </section>
  );
}
