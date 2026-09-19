import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Card colapsável de nível único (CONTRATO-ANA-LEITURA-EM-UMA-HORA,
 * 19/09/2026). Estado controlado pela tela que o usa: abrir/fechar é só
 * `aberto`/`aoAlternar`, nunca dispara query nem mutation.
 *
 * O corpo nunca é desmontado (colapsa por `max-height`/opacidade, não por
 * `display:none` condicional) — âncoras internas (`id`) continuam existindo
 * no DOM e `scrollIntoView` continua funcionando mesmo com o card fechado.
 */
export function CartaoDetalhe({
  id,
  titulo,
  resumo,
  aberto,
  aoAlternar,
  children,
}: {
  id?: string;
  titulo: string;
  resumo?: ReactNode;
  aberto: boolean;
  aoAlternar: () => void;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-navy/10 bg-card">
      <button
        type="button"
        onClick={aoAlternar}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="font-serif text-base text-navy">{titulo}</h2>
          {resumo ? <div className="mt-0.5 text-xs text-navy/60">{resumo}</div> : null}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-navy/50 transition-transform", aberto && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <div
        className={cn(
          "space-y-4 px-4",
          aberto ? "max-h-none border-t border-navy/10 py-4 opacity-100" : "max-h-0 overflow-hidden py-0 opacity-0",
        )}
      >
        {children}
      </div>
    </section>
  );
}
