/**
 * Chip de identidade do caso — mesmo contrato no App e no Desk.
 * Mostra caseId (UUID) + código humano. Não inventa segundo id.
 */

import type { IdentidadeCaso } from "@/lib/caso-compartilhado";

export function ChipIdentidadeCaso({
  identidade,
  superficie,
}: {
  identidade: IdentidadeCaso;
  /** Rótulo da superfície para o print App↔Desk. */
  superficie: "App Cliente" | "Desk";
}) {
  return (
    <div
      data-identidade-caso
      data-superficie={superficie}
      data-case-id={identidade.caseId}
      className="rounded-lg border border-navy/15 bg-white/90 px-3 py-2 text-left text-xs text-navy"
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/50">{superficie}</p>
      <p className="mt-1 font-medium text-navy">{identidade.titulo ?? "Caso"}</p>
      <dl className="mt-2 space-y-1 font-mono text-[11px] text-navy/80">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-navy/45">caseId</dt>
          <dd data-field="caseId">{identidade.caseId}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-navy/45">codigo</dt>
          <dd data-field="codigo">{identidade.codigo ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-navy/45">fonte</dt>
          <dd>{identidade.fonte}</dd>
        </div>
      </dl>
    </div>
  );
}
