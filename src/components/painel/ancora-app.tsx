import { frasePar, parDoBloco } from "@/lib/par-app-desk";

/**
 * A linha que ancora um bloco do Desk na tela do App que ele sustenta.
 *
 * Inventário 2026-09-11 §22: chips "Só interno" e diagnóstico de par App/Desk
 * saem da primeira dobra operacional. Bloco interno (alcance nunca) não renderiza.
 * Par com tela do App permanece como âncora humana discreta.
 */
export function AncoraApp({ bloco }: { bloco: string }) {
  const par = parDoBloco(bloco);
  const frase = frasePar(bloco);
  if (!par || !frase) return null;
  if (par.alcance === "nunca") return null;

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-navy/45">
      <span className="rounded-full border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[10px] text-navy/70">
        App · {par.telaApp}
      </span>
      <span className="min-w-0">{frase}</span>
    </p>
  );
}
