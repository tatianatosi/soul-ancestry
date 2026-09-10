import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { lerSinaisMotorCidadania } from "@/lib/motor-cidadania.functions";

function classeEstado(estado: string) {
  if (estado === "com_dado") return "bg-gold/15 text-navy";
  if (estado === "planta") return "bg-navy/5 text-navy/55";
  return "bg-terracotta/10 text-terracotta";
}

function rotuloEstado(estado: string) {
  if (estado === "com_dado") return "Com dado";
  if (estado === "planta") return "Planta";
  return "Sem dado";
}

/** Diagnóstico das fases 0–8 no Caso 360 — leitura, não parecer jurídico. */
export function FasesMotorCidadania({ caseId }: { caseId: string }) {
  const carregar = useServerFn(lerSinaisMotorCidadania);
  const q = useQuery({
    queryKey: ["motor-cidadania", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Planejador de Cidadania (fases 0–8)
      </p>
      {q.isLoading ? (
        <p className="text-sm text-navy/55">Lendo trilhas, pesquisa e catálogo deste caso…</p>
      ) : q.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {q.error instanceof Error ? q.error.message : "Não foi possível ler o planejador."}
        </p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-3">
          {(q.data?.fases ?? []).map((f) => (
            <li key={f.fase} className="rounded-lg border border-navy/10 bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium text-navy">
                  {f.fase}. {f.nome}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${classeEstado(f.estado)}`}
                >
                  {rotuloEstado(f.estado)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-navy/60">{f.nota}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
