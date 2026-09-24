import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Card do Clube Ancestral: bloco com eyebrow (terracota) + título serifado.
 * Usa os tokens já aprovados (bg-card ganha sombra via [data-marca-guia="oki"]
 * em styles.css) — não reimplementa cor/sombra aqui.
 *
 * `variante="compacto"` (DSA-10, iniciativa Painel → Cartão Canônico,
 * 2026-09-23) reproduz exatamente a superfície de `Painel`
 * (@/components/comercial/base, hoje um adapter deste componente) — borda
 * navy suave, fundo creme, sem sombra — para as ~30 telas que ainda não
 * migraram para o visual `padrao`. Não é uma terceira implementação de
 * cartão: é o mesmo componente, tokens diferentes.
 */
type VarianteCaCard = "padrao" | "compacto";

export function CaCard({
  titulo,
  eyebrow,
  acao,
  children,
  className,
  variante = "padrao",
}: {
  titulo?: string;
  eyebrow?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
  variante?: VarianteCaCard;
}) {
  if (variante === "compacto") {
    return (
      <section className={cn("rounded-xl border border-navy/10 bg-cream/40 p-4", className)}>
        {(titulo || eyebrow || acao) && (
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">{eyebrow}</p>
              ) : null}
              {titulo ? <h3 className="font-serif text-lg">{titulo}</h3> : null}
            </div>
            {acao}
          </header>
        )}
        <div className="mt-3">{children}</div>
      </section>
    );
  }

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
