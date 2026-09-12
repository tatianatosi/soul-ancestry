/**
 * Bloco recolhível de "Detalhes técnicos".
 *
 * Mantém nomes de tabela, identificadores e matrizes fora do fluxo principal.
 * Recolhido por padrão; nada dentro dele altera dados.
 */
import type { ReactNode } from "react";

export function DetalhesTecnicos({
  titulo = "Detalhes técnicos",
  children,
}: {
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-lg border border-navy/10 bg-cream/40">
      <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
        {titulo}
      </summary>
      <div className="border-t border-navy/10 p-4 text-navy/80">{children}</div>
    </details>
  );
}
