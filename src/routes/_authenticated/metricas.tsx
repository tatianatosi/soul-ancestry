import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
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
  errorComponent: ({ error }) => <div className="p-6 text-sm text-terracotta">Não foi possível carregar as métricas: {(error as Error).message}</div>,
});

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
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
  const q = useQuery({
    queryKey: ["metricas-crm", incluirDemo],
    queryFn: () => buscar({ data: { incluirDemo } }),
  });
  type Metricas = NonNullable<typeof q.data>["metricas"];
  const m = q.data?.metricas as Metricas | undefined;

  return (
    <SaasShell
      titulo="Métricas comerciais e operacionais"
      descricao="Indicadores do dia derivados dos leads e casos do Desk. Não substituem o Asaas nem a planilha mestre de SKUs."
    >
      <label className="mb-4 flex items-center gap-2 text-xs text-navy/70">
        <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
        Incluir registros de demonstração/teste (fora das métricas reais por padrão)
      </label>

      <EstadoDados<Metricas>
        carregando={q.isLoading}
        erro={q.error}
        dados={m ? [m] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="as métricas do dia"
      >
        {([m]) => (
        <div className="space-y-6">
          {/* Máximo de cinco métricas principais (CA-UX-03 Fase B). */}
          <div data-metricas="principais" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Cartao titulo="Leads por origem">
              <Linhas itens={m.porOrigem.map((o) => ({ chave: o.origem, total: o.total }))} vazio="Sem origens registradas." />
            </Cartao>

            <Cartao titulo="Entrada semanal">
              <Linhas itens={m.entradaSemanal.slice(-8).map((s) => ({ chave: s.periodo, total: s.total }))} vazio="Sem entrada registrada." />
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

            <Cartao titulo="Casos ativos por nacionalidade e via">
              <Linhas itens={m.casosPorNacionalidadeVia} vazio="Sem casos ativos classificados." />
            </Cartao>

            <Cartao titulo="Pendências documentais por responsável">
              <Linhas itens={m.pendenciasDocumentais} vazio="Nenhuma pendência documental aberta." />
            </Cartao>
          </div>

          {/* Funil de conversão, funil de eventos, saúde e higiene comercial vivem apenas em /conversao. */}
          <p data-metricas="link-conversao" className="text-sm text-navy/70">
            <Link to="/conversao" className="text-navy underline underline-offset-2">
              Conversão e saúde comercial — ver no Comercial
            </Link>
          </p>

          <details data-metricas="historico" className="rounded-xl border border-navy/10 bg-cream/40 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-navy">Histórico e análise</summary>
            <p className="mt-1 text-xs text-navy/50">
              Leitura retrospectiva. Nenhum card desta seção cria fila, alerta, tarefa ou status.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Cartao titulo="Entrada mensal">
                <Linhas itens={m.entradaMensal.slice(-8).map((s) => ({ chave: s.periodo, total: s.total }))} vazio="Sem entrada registrada." />
              </Cartao>
            </div>
          </details>
        </div>
        )}
      </EstadoDados>
    </SaasShell>
  );
}
