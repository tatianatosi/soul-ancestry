import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Card do Clube Ancestral: bloco com eyebrow (terracota) + título serifado.
 * Usa os tokens já aprovados (bg-card ganha sombra via [data-marca-guia="oki"]
 * em styles.css) — não reimplementa cor/sombra aqui.
 */
export function CaCard({
  titulo,
  eyebrow,
  acao,
  children,
  className,
}: {
  titulo?: string;
  eyebrow?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5", className)}>
      {(titulo || acao) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">{eyebrow}</p>
            ) : null}
            {titulo ? <h3 className="font-serif text-lg text-navy">{titulo}</h3> : null}
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}
