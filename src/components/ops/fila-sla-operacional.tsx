import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { alertasOps } from "@/lib/ops.functions";
import { ROTULO_SLA } from "@/lib/ops.server";

/**
 * 27/08/2026 — "o que é operacional pode ir pro painel hoje... mas veja a
 * sobreposição... algumas são legado outras são válidas como quadro kanban
 * mas isso iria lá pro painel hoje" (Proprietária).
 *
 * Tarefa e micro-entrega (Kanban de /ops) são um estágio diferente de
 * leads/casos comerciais — pós-venda, execução do caso — e não têm sinal
 * nenhum hoje fora de /ops. Mesma leitura de /ops (alertasOps), nenhum
 * cálculo paralelo. Mora dentro de "Exceções que exigem dono", como já
 * aconteceu com a revisão jurídica em 25/08 — não é um sexto bloco.
 */
export function FilaSlaOperacional() {
  const carregar = useServerFn(alertasOps);
  const q = useQuery({ queryKey: ["ops-alertas-sla"], queryFn: () => carregar(), retry: false });

  if (q.isLoading) return null;
  if (q.isError || !q.data) return null;

  const { atrasadas, emRisco, microAtrasadas, microEmRisco } = q.data;
  const grupos = [
    { chave: "tarefa_atrasada", rotulo: "Tarefas atrasadas", itens: atrasadas },
    { chave: "tarefa_em_risco", rotulo: "Tarefas com SLA em risco", itens: emRisco },
    { chave: "micro_atrasada", rotulo: "Micro-entregas atrasadas", itens: microAtrasadas },
    { chave: "micro_em_risco", rotulo: "Micro-entregas com prazo em risco", itens: microEmRisco },
  ].filter((g) => g.itens.length > 0);

  return (
    <div data-painel="sla-operacional" className="mt-4 border-t border-navy/10 pt-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy">Execução do caso — SLA operacional</h3>
        <Link to="/ops" className="text-xs text-navy underline underline-offset-2">
          Abrir Operação
        </Link>
      </div>
      {grupos.length === 0 ? (
        <p className="text-sm text-navy/55">Nenhuma tarefa ou micro-entrega atrasada ou em risco.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {grupos.map((g) => (
            <div key={g.chave} className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {g.rotulo} · {g.itens.length}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {g.itens.slice(0, 5).map((i: Record<string, unknown>) => (
                  <li key={String(i["id"])} className="text-navy/80">
                    {String(i["titulo"] ?? "—")}
                    <span className="block text-[11px] text-navy/50">
                      {String(i["caso_codigo"] ?? "sem caso")} ·{" "}
                      {ROTULO_SLA[String(i["sla_status"] ?? i["prazo_status"])] ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
