/**
 * Fonte única dos tokens de cor do guia de marca oficial (OKI).
 *
 * Valores extraídos LITERALMENTE da página de paleta do PDF
 * `docs/evolucao/recuperados/marca-oficial-2026-09-11/Apresentacao-Clube-Ancestral-OKI.pdf`
 * (mesmo arquivo reenviado em 12/09/2026). O guia não traz código Pantone —
 * só HEX/RGB/CMYK — então nenhuma conversão foi inventada aqui.
 *
 * Não duplicar estes hex em outro lugar: `src/lib/marca.ts` (MARCA_CORES) e
 * `src/styles.css` (:root, [data-marca="guia"]) devem sempre bater com os
 * valores literais abaixo. Alterar cor da marca = alterar aqui primeiro.
 */
export const DESIGN_TOKENS_OKI = {
  navy: { hex: "#2F4B6E", rgb: "47,75,110", cmyk: "61%,34%,0%,57%", pantone: null },
  preto: { hex: "#101010", rgb: "16,16,16", cmyk: "0%,0%,0%,94%", pantone: null },
  creme: { hex: "#ECDFCD", rgb: "236,223,205", cmyk: "0%,5%,13%,7%", pantone: null },
  dourado: { hex: "#FCB73A", rgb: "252,183,58", cmyk: "0%,28%,78%,1%", pantone: null },
  terracota: { hex: "#9A3A2F", rgb: "154,58,47", cmyk: "0%,63%,69%,40%", pantone: null },
} as const;

/**
 * Tons derivados (não vêm da página de paleta do guia — são usados para
 * elevação/hover/borda, sempre a partir dos 5 hex oficiais acima, nunca
 * inventando família de cor nova).
 */
export const DESIGN_TOKENS_DERIVADOS = {
  navySuave: "#40628B",
  douradoSuave: "#FFD98A",
  superficieElevada: "#F5EEE3",
  borda: "#DCCDB6",
} as const;
