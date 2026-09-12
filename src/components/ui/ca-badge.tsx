import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Badge de estado do Clube Ancestral (ok/atenção/crítico/neutro/gold).
 * Usa os tokens semânticos já aprovados (--sucesso/--atencao/--critico em
 * styles.css) — não inventa cor nova, só nomeia o tom em vez do hex.
 */
const TONS = {
  ok: "bg-sucesso-suave text-sucesso border-sucesso/20",
  atencao: "bg-atencao-suave text-atencao border-atencao/20",
  critico: "bg-critico-suave text-critico border-critico/20",
  neutro: "bg-navy/5 text-navy border-navy/15",
  gold: "bg-gold/20 text-navy border-gold/40",
} as const;

export type TomCaBadge = keyof typeof TONS;

export function CaBadge({ children, tom = "neutro" }: { children: ReactNode; tom?: TomCaBadge }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONS[tom],
      )}
    >
      {children}
    </span>
  );
}

export function CaDot({ tom = "neutro" }: { tom?: TomCaBadge }) {
  const cor =
    tom === "ok"
      ? "bg-sucesso"
      : tom === "atencao"
        ? "bg-atencao"
        : tom === "critico"
          ? "bg-critico"
          : tom === "gold"
            ? "bg-gold"
            : "bg-navy/30";
  return <span className={cn("inline-block size-2.5 rounded-full", cor)} aria-hidden="true" />;
}
