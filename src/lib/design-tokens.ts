/**
 * Fonte única dos tokens de cor estruturais — Paleta Pantone do mockup,
 * aprovada pela Proprietária em 12/09/2026, substituindo integralmente a
 * paleta OKI anterior (#2F4B6E / #FCB73A / #ECDFCD / #9A3A2F / #101010).
 *
 * Não misturar as duas paletas. Nenhum HEX desta lista pode coexistir com
 * os HEX antigos em `src/lib/marca.ts` ou `src/styles.css` — alterar cor
 * estrutural = alterar aqui primeiro.
 */
export const DESIGN_TOKENS_PANTONE = {
  navy900: { hex: "#13294B", pantone: "2767 C", uso: "Sidebar / topbar" },
  navy800: { hex: "#1B365D", pantone: "534 C", uso: "Hero e camadas navy" },
  gold500: { hex: "#C2A84D", pantone: "4019 C", uso: "Destaques e progresso" },
  slate800: { hex: "#28334A", pantone: "2380 C", uso: "Texto / ícones" },
  cream50: { hex: "#F0EEE9", pantone: "Cloud Dancer 11-4201 TCX", uso: "Fundo" },
} as const;

/**
 * Tons derivados: sempre alfa dos 5 tokens oficiais acima (nunca família de
 * cor nova) — usados para hover, elevação e bordas/fundos suaves.
 * Branco puro (#FFFFFF) é reservado a cards elevados, inputs e modais.
 */
export const DESIGN_TOKENS_DERIVADOS = {
  branco: "#FFFFFF",
} as const;
