/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { painelCadencia } from "@/lib/jornada-cliente.functions";
import { EstadoDados } from "@/components/saas/estado-dados";

const CORES: Record<string, string> = {
  regular: "border-emerald-200 bg-emerald-50 text-emerald-800",
  atencao: "border-amber-200 bg-amber-50 text-amber-900",
  critico: "border-terracotta/30 bg-terracotta/10 text-terracotta",
};

/** Saúde de cadência — código preservado; fora de /ops (dedup CA-UX-03 → Onboarding e jornada). */
export function PainelCadencia() {
  const carregar = useServerFn(painelCadencia);
  const q = useQuery({ queryKey: ["painel-cadencia"], queryFn: () => carregar() });

  const criticosDe = (casos: any[]) =>
    casos
      .filter((c: any) => c.cadencia.status !== "regular")
      .sort((a: any, b: any) => b.cadencia.diasSemTouchpoint - a.cadencia.diasSemTouchpoint)
      .slice(0, 12);

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-5">
      <h2 className="font-serif text-lg text-navy">Cadência dos casos</h2>
      <p className="mt-1 text-xs text-navy/55">
        Dias sem atualização contextualizada ao cliente. Espera institucional comunicada não conta
        como atraso.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(["regular", "atencao", "critico"] as const).map((s) => (
          <div key={s} className={"rounded-lg border p-4 " + CORES[s]}>
            <p className="text-[11px] uppercase tracking-wide opacity-70">
              {s === "atencao" ? "Atenção" : s === "critico" ? "Crítico" : "Regular"}
            </p>
            <p className="mt-1 font-serif text-2xl">
              {q.isLoading ? "…" : q.isError ? "—" : (q.data?.resumo[s] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data?.casos as any[] | undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso="a cadência dos casos"
          vazio="Nenhum caso com cadência registrada."
        >
          {(casos) => {
            const criticos = criticosDe(casos);
            if (!criticos.length)
              return <p className="text-sm text-navy/55">Nenhum caso fora da cadência.</p>;
            return (
              <>
                {criticos.map((c: any) => (
                  <Link
                    key={String(c["id"])}
                    to="/casos/$caseId"
                    params={{ caseId: String(c["id"]) }}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm hover:bg-navy/5"
                  >
                    <span className="text-navy">{String(c["codigo"] ?? c["titulo"] ?? "Caso")}</span>
                    <span className="text-xs text-navy/60">
                      {c.cadencia.diasSemTouchpoint} dias · {c.cadencia.status}
                    </span>
                  </Link>
                ))}
              </>
            );
          }}
        </EstadoDados>
      </div>
    </section>
  );
}
