/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { painelCadencia } from "@/lib/jornada-cliente.functions";

const CORES: Record<string, string> = {
  regular: "border-emerald-200 bg-emerald-50 text-emerald-800",
  atencao: "border-amber-200 bg-amber-50 text-amber-900",
  critico: "border-terracotta/30 bg-terracotta/10 text-terracotta",
};

/** Saúde de cadência dos casos: uso diário do Desk, sem exposição ao cliente. */
export function PainelCadencia() {
  const carregar = useServerFn(painelCadencia);
  const q = useQuery({ queryKey: ["painel-cadencia"], queryFn: () => carregar() });

  const criticos = (q.data?.casos ?? [])
    .filter((c: any) => c.cadencia.status !== "regular")
    .sort((a: any, b: any) => b.cadencia.diasSemTouchpoint - a.cadencia.diasSemTouchpoint)
    .slice(0, 12);

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="font-serif text-lg text-navy">Cadência dos casos</h2>
      <p className="mt-1 text-xs text-navy/55">
        Dias sem atualização contextualizada ao cliente. Espera institucional comunicada não conta como atraso.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(["regular", "atencao", "critico"] as const).map((s) => (
          <div key={s} className={"rounded-lg border p-4 " + CORES[s]}>
            <p className="text-[11px] uppercase tracking-wide opacity-70">{s === "atencao" ? "Atenção" : s === "critico" ? "Crítico" : "Regular"}</p>
            <p className="mt-1 font-serif text-2xl">{q.isLoading ? "…" : (q.data?.resumo[s] ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {q.isLoading ? (
          <p className="text-sm text-navy/55">Carregando…</p>
        ) : criticos.length === 0 ? (
          <p className="text-sm text-navy/55">Nenhum caso fora da cadência.</p>
        ) : (
          criticos.map((c: any) => (
            <Link
              key={String(c['id'])}
              to="/casos/$caseId"
              params={{ caseId: String(c['id']) }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm hover:bg-navy/5"
            >
              <span className="text-navy">
                {String(c['case_id'] ?? c['titulo'] ?? "Caso")} · {String(c['cliente_nome'] ?? "")}
              </span>
              <span className="text-xs text-navy/60">
                {c.cadencia.diasSemTouchpoint} dias · {c.cadencia.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
