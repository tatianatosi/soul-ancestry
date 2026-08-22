/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { panoramaChecklistJuridico } from "@/lib/contratos.functions";

/**
 * Fila de revisão jurídica do Desk: leitura derivada do checklist automático
 * de cada instrumento em preparação. Nada é aprovado, enviado ou assinado aqui.
 */
export function FilaRevisaoJuridica({ compacto = false }: { compacto?: boolean }) {
  const panorama = useServerFn(panoramaChecklistJuridico);
  const q = useQuery({
    queryKey: ["checklist-juridico-panorama"],
    queryFn: () => panorama({ data: {} }),
  });

  const itens = (q.data?.instrumentos ?? []) as any[];
  const lista = compacto ? itens.slice(0, 5) : itens;

  return (
    <section className="mb-6 rounded-xl border border-navy/10 bg-white p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-navy">Revisão jurídica automática</h2>
          <p className="text-xs text-navy/60">
            Conformidade formal dos instrumentos em preparação. Sem juízo de mérito e sem ação externa.
          </p>
        </div>
        <Link to="/contratos" className="text-xs text-navy underline underline-offset-2">
          Abrir contratos
        </Link>
      </header>

      {q.isLoading ? (
        <p className="text-sm text-navy/60">Carregando checklist…</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-navy/60">Nenhum instrumento em preparação com pendência de conformidade.</p>
      ) : (
        <ul className="divide-y divide-navy/10">
          {lista.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <Link
                  to="/contratos/$id"
                  params={{ id: i.id }}
                  className="text-sm font-medium text-navy underline underline-offset-2"
                >
                  {i.numero ? `${i.numero} — ` : ""}
                  {i.titulo}
                </Link>
                <p className="truncate text-xs text-navy/60">
                  {i.conformes}/{i.total} itens conformes
                  {i.faltantes.length ? ` · falta: ${i.faltantes.slice(0, 3).map((f: any) => f.label).join(", ")}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  i.bloqueios > 0
                    ? "bg-terracotta/15 text-terracotta"
                    : i.pendentes > 0
                      ? "bg-gold/20 text-navy"
                      : "bg-navy/10 text-navy"
                }`}
              >
                {i.bloqueios > 0
                  ? `${i.bloqueios} bloqueio(s)`
                  : i.pendentes > 0
                    ? `${i.pendentes} pendência(s)`
                    : "Apto à revisão humana"}
              </span>
            </li>
          ))}
        </ul>
      )}
      {compacto && itens.length > lista.length ? (
        <p className="mt-2 text-xs text-navy/60">+{itens.length - lista.length} instrumento(s) na fila completa.</p>
      ) : null}
    </section>
  );
}
