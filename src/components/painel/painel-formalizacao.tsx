import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelFormalizacao } from "@/lib/formalizacao-painel.functions";

/**
 * Painel Hoje — formalização, dossiê, cadência e entregas.
 * Leitura operacional: nenhuma ação financeira ou de comunicação parte daqui.
 */
export function PainelFormalizacao() {
  const carregar = useServerFn(painelFormalizacao);
  const q = useQuery({ queryKey: ["painel-formalizacao"], queryFn: () => carregar(), retry: false });

  if (q.isLoading) return <p className="mt-6 text-sm text-navy/50">Carregando filas de formalização…</p>;
  if (q.isError || !q.data) return null;

  const { filas, resumo } = q.data;

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl text-navy">Formalização, dossiê e cadência</h2>
        <p className="text-xs text-navy/55">
          {resumo.emFormalizacao} em formalização · {resumo.atencao} em atenção · {resumo.criticos} críticos
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filas.map((f) => (
          <div key={f.chave} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">{f.rotulo}</p>
              <span className="font-serif text-2xl text-navy">{f.itens.length}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/60">
              {f.itens.slice(0, 5).map((i, idx) => (
                <li key={`${f.chave}-${i.id}-${idx}`}>
                  <Link to="/casos/$caseId" params={{ caseId: i.id }} className="underline">
                    {i.rotulo}
                  </Link>{" "}
                  — {i.detalhe}
                </li>
              ))}
              {!f.itens.length ? <li>Fila vazia.</li> : null}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
