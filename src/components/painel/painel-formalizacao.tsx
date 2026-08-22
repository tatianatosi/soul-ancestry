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

      {(() => {
        const porCaso = new Map<string, { rotulo: string; gates: { fila: string; detalhe: string }[] }>();
        for (const f of filas) {
          for (const i of f.itens) {
            const atual = porCaso.get(i.id) ?? { rotulo: i.rotulo, gates: [] };
            atual.gates.push({ fila: f.rotulo, detalhe: i.detalhe });
            porCaso.set(i.id, atual);
          }
        }
        const linhas = [...porCaso.entries()].sort((a, b) => b[1].gates.length - a[1].gates.length);
        if (!linhas.length) return null;
        return (
          <div className="mb-3 rounded-xl border border-navy/10 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-navy/50">
              Resumo por caso — gates pendentes e próximo marco
            </p>
            <ul className="mt-2 divide-y divide-navy/5">
              {linhas.slice(0, 8).map(([id, c]) => (
                <li key={id} className="py-2 text-xs">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Link to="/casos/$caseId" params={{ caseId: id }} className="font-medium text-navy underline">
                      {c.rotulo}
                    </Link>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        c.gates.length > 2 ? "border-terracotta/40 bg-terracotta/5 text-terracotta" : "border-navy/15 text-navy/60"
                      }`}
                    >
                      {c.gates.length} gate(s) pendente(s)
                    </span>
                  </div>
                  <p className="mt-1 text-navy/70">
                    <span className="font-medium text-navy">Próximo marco:</span> {c.gates[0]!.fila} — {c.gates[0]!.detalhe}
                  </p>
                  <p className="text-navy/50">
                    Também pendente: {c.gates.slice(1).map((g) => g.fila).join(" · ") || "nenhum outro gate"}
                  </p>
                  <p className="text-navy/45">Responsável e prazo ficam na ficha operacional do caso.</p>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

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
