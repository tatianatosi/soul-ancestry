import { frasePar, parDoBloco } from "@/lib/par-app-desk";

/**
 * A linha que ancora um bloco do Desk na tela do App que ele sustenta.
 *
 * É o gesto do mockup "Intelligence Desk v2": mesmo bloco, duas profundidades,
 * dito em uma frase. Bloco sem par declarado não recebe linha nenhuma — não se
 * inventa correspondência.
 */
export function AncoraApp({ bloco }: { bloco: string }) {
  const par = parDoBloco(bloco);
  const frase = frasePar(bloco);
  if (!par || !frase) return null;

  const interno = par.alcance === "nunca";

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-navy/45">
      <span
        className={`rounded-full border px-1.5 py-0.5 text-[10px] ${
          interno
            ? "border-navy/20 bg-navy/5 text-navy/60"
            : "border-gold/40 bg-gold/10 text-navy/70"
        }`}
      >
        {interno ? "Só interno" : `App · ${par.telaApp}`}
      </span>
      <span className="min-w-0">{frase}</span>
    </p>
  );
}
