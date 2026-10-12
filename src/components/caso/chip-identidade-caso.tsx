/**
 * Chip de identidade do caso — mesmo contrato no App e no Desk.
 * Desk: caseId (UUID) + código humano + fonte (auditoria App↔Desk).
 * App Cliente: só título + código humano — sem UUID/fonte no chrome (data-* permanece para prova).
 * Não inventa segundo id.
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
  const noCliente = superficie === "App Cliente";

  return (
    <div
      data-identidade-caso
      data-superficie={superficie}
      data-case-id={identidade.caseId}
      className={
        noCliente
          ? "rounded-lg border border-navy/10 bg-cream/70 px-3 py-2 text-left text-xs text-navy"
          : "rounded-lg border border-navy/15 bg-cream/90 px-3 py-2 text-left text-xs text-navy"
      }
    >
      {noCliente ? (
        <>
          <p className="text-[10px] font-medium uppercase tracking-widest text-navy/45">Seu acompanhamento</p>
          <p className="mt-1 font-serif text-base text-navy">{identidade.titulo ?? "Caso"}</p>
          {identidade.codigo ? (
            <p className="mt-1 text-[11px] text-navy/60">
              Referência <span data-field="codigo">{identidade.codigo}</span>
            </p>
          ) : null}
          {/* Campos técnicos só em data-* — não no chrome do cliente */}
          <span hidden data-field="caseId">
            {identidade.caseId}
          </span>
        </>
      ) : (
        <>
          <p className="text-[10px] font-medium uppercase tracking-widest text-navy/50">{superficie}</p>
          <p className="mt-1 font-medium text-navy">{identidade.titulo ?? "Caso"}</p>
          <p className="mt-1 text-[11px] text-navy/70">
            Código <span data-field="codigo">{identidade.codigo ?? "Não registrado"}</span>
          </p>
          {/* Nomes de sistema só em "Detalhes técnicos" recolhido (regra do Desk). */}
          <details className="mt-1">
            <summary className="cursor-pointer text-[10px] text-navy/45">Detalhes técnicos</summary>
            <dl className="mt-1 space-y-1 font-mono text-[11px] text-navy/80">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-navy/45">caseId</dt>
                <dd data-field="caseId">{identidade.caseId}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-navy/45">fonte</dt>
                <dd>{identidade.fonte}</dd>
              </div>
            </dl>
          </details>
        </>
      )}
    </div>
  );
}
