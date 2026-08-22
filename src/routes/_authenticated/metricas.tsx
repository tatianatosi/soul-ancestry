import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { painelHojeDesk } from "@/lib/crm-desk.functions";

export const Route = createFileRoute("/_authenticated/metricas")({
  head: () => ({
    meta: [
      { title: "Métricas comerciais e operacionais — Clube Ancestral" },
      {
        name: "description",
        content:
          "Leitura diária de leads por origem, entrada semanal e mensal, Discovery, funil de conversão, higiene de follow-up e pendências documentais.",
      },
      { property: "og:title", content: "Métricas comerciais e operacionais — Clube Ancestral" },
      { property: "og:description", content: "Indicadores derivados dos leads e casos persistidos do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Metricas,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-terracotta">Não foi possível carregar as métricas: {error.message}</div>,
});

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-navy/50">{titulo}</p>
      <div className="mt-2 space-y-1 text-xs text-navy/70">{children}</div>
    </div>
  );
}

function Linhas({ itens, vazio }: { itens: { chave: string; total: number }[]; vazio: string }) {
  if (itens.length === 0) return <p>{vazio}</p>;
  return (
    <ul className="space-y-1">
      {itens.map((i) => (
        <li key={i.chave} className="flex justify-between gap-3">
          <span>{i.chave}</span>
          <span className="font-semibold text-navy">{i.total}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Métricas comerciais e operacionais do Desk. Leitura derivada de leads e casos
 * persistidos — nenhuma cobrança, comunicação ou ação externa parte desta tela.
 */
function Metricas() {
  const buscar = useServerFn(painelHojeDesk);
  const [incluirDemo, setIncluirDemo] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["metricas-crm", incluirDemo],
    queryFn: () => buscar({ data: { incluirDemo } }),
  });
  const m = data?.metricas;

  return (
    <SaasShell
      titulo="Métricas comerciais e operacionais"
      descricao="Indicadores do dia derivados dos leads e casos do Desk. Não substituem o Asaas nem a planilha mestre de SKUs."
    >
      <label className="mb-4 flex items-center gap-2 text-xs text-navy/70">
        <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
        Incluir registros de demonstração/teste (fora das métricas reais por padrão)
      </label>

      {isLoading || !m ? (
        <p className="text-sm text-navy/60">Calculando métricas…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Cartao titulo="Leads por origem">
            <Linhas itens={m.porOrigem.map((o) => ({ chave: o.origem, total: o.total }))} vazio="Sem origens registradas." />
          </Cartao>

          <Cartao titulo="Entrada semanal">
            <Linhas itens={m.entradaSemanal.slice(-8).map((s) => ({ chave: s.periodo, total: s.total }))} vazio="Sem entrada registrada." />
          </Cartao>

          <Cartao titulo="Entrada mensal">
            <Linhas itens={m.entradaMensal.slice(-8).map((s) => ({ chave: s.periodo, total: s.total }))} vazio="Sem entrada registrada." />
          </Cartao>

          <Cartao titulo="Calls e Discovery">
            <ul className="space-y-1">
              <li>Agendadas: <strong className="text-navy">{m.calls.agendadas}</strong></li>
              <li>Realizadas: <strong className="text-navy">{m.calls.realizadas}</strong></li>
              <li>No-show: <strong className="text-navy">{m.calls.noShow}</strong></li>
              <li>
                Conversão agendada → realizada:{" "}
                <strong className="text-navy">{m.calls.conversao === null ? "—" : `${m.calls.conversao}%`}</strong>
              </li>
            </ul>
          </Cartao>

          <Cartao titulo="Funil de conversão">
            <ul className="space-y-1">
              {m.funil.map((e) => (
                <li key={e.etapa} className="flex justify-between gap-3">
                  <span>{e.etapa}</span>
                  <span className="font-semibold text-navy">
                    {e.para}/{e.de}
                    {e.taxa === null ? "" : ` (${e.taxa}%)`}
                  </span>
                </li>
              ))}
            </ul>
          </Cartao>

          <Cartao titulo="Higiene comercial">
            <ul className="space-y-1">
              <li>Leads ativos sem próxima ação: <strong className="text-navy">{m.semProximaAcao}</strong></li>
              <li>Follow-ups vencidos: <strong className="text-navy">{m.followupsVencidos}</strong></li>
            </ul>
          </Cartao>

          <Cartao titulo="Casos ativos por nacionalidade e via">
            <Linhas itens={m.casosPorNacionalidadeVia} vazio="Sem casos ativos classificados." />
          </Cartao>

          <Cartao titulo="Pendências documentais por responsável">
            <Linhas itens={m.pendenciasDocumentais} vazio="Nenhuma pendência documental aberta." />
          </Cartao>
        </div>
      )}
    </SaasShell>
  );
}
