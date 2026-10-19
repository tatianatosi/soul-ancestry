/**
 * Faixa "Alimento contextual" (Prancha V4 — contextos como alimento visível).
 *
 * Cada superfície do Desk declara, em linguagem humana, de onde vem o dado
 * que ela mostra e quem consome o resultado. Nomes técnicos de tabela ficam
 * no detalhe recolhido, nunca no fluxo principal.
 */

import { ArrowRight } from "lucide-react";

export function FonteAlimento({
  fonte,
  consumidor,
  detalheTecnico,
}: {
  /** De onde vem o dado, em rótulo humano. */
  fonte: string;
  /** Quem consome o resultado desta superfície. */
  consumidor: string;
  /** Nome de sistema (tabela/função), só no detalhe recolhido. */
  detalheTecnico?: string;
}) {
  return (
    <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-[11px] text-navy/65">
      <span className="font-semibold uppercase tracking-wide text-navy/50">Alimento</span>
      <span className="font-medium text-navy">{fonte}</span>
      <ArrowRight className="h-3 w-3 text-gold" aria-hidden />
      <span className="font-medium text-navy">{consumidor}</span>
      {detalheTecnico ? (
        <details className="ml-auto">
          <summary className="cursor-pointer text-[10px] text-navy/45 underline underline-offset-2">
            Detalhes técnicos
          </summary>
          <span className="mt-1 block font-mono text-[10px] text-navy/45">{detalheTecnico}</span>
        </details>
      ) : null}
    </p>
  );
}
