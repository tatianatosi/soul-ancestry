import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { pendenciasCriticasPainel } from "@/lib/plano-acao-pesquisa.functions";
import {
  pendenciasCriticasPesquisa,
  PRIORIDADES,
  rotuloDe,
  type ItemPainel,
} from "@/lib/plano-acao-pesquisa";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Painel Hoje: pendências críticas de pesquisa (leitura). Sem ação externa. */
export function PendenciasCriticasPesquisa() {
  const carregar = useServerFn(pendenciasCriticasPainel);
  const q = useQuery({
    queryKey: ["painel-pendencias-criticas-pesquisa"],
    queryFn: () => carregar(),
    retry: false,
  });

  if (q.isLoading) return null;
  if (q.isError)
    return (
      <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-terracotta">
        Não foi possível carregar as pendências críticas de pesquisa.
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </p>
    );
  if (!q.data) return null;

  const itens = pendenciasCriticasPesquisa((q.data.itens ?? []) as ItemPainel[]);
  const casos = new Map((q.data.casos ?? []).map((c: Record<string, any>) => [String(c.id), c]));

  return (
    <section className="mt-6">
      <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-wide text-navy/60">
            Pendências críticas de pesquisa
          </p>
          <span className="font-serif text-2xl text-navy">{itens.length}</span>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {itens.slice(0, 6).map((i: any) => (
            <li key={i.id}>
              <Link
                to="/plano-acao/$caseId"
                params={{ caseId: String(i.case_id) }}
                search={{ foco: "criticas" as const }}
                className="underline"
              >
                {casos.get(String(i.case_id))?.codigo ?? "caso"}
              </Link>{" "}
              — {i.titulo} · prazo {i.due_date} · {rotuloDe(PRIORIDADES, i.priority)}
            </li>
          ))}
          {itens.length === 0 && <li>Nenhuma pendência crítica de pesquisa hoje.</li>}
        </ul>
        <p className="mt-2 text-[11px] text-navy/50">
          Somente prioridade crítica com prazo hoje ou vencido, em aberto. Dados de demonstração não
          entram nesta lista.
        </p>
      </div>
    </section>
  );
}
