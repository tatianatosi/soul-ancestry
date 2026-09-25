import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TETO_ANCESTRAIS_G1_G5 } from "@/lib/radar-seis-eixos";

/**
 * Prancha 4/7 (mockup): "12 pessoas conectadas de um universo de 31
 * possíveis". §29 diz que quando o mockup dá um número, tem que vir de fonte
 * canônica — a Árvore agora mostra `N de 31`, com `N = itens.length` (a
 * árvore sanitizada que a tela já renderiza) e `31 = TETO_ANCESTRAIS_G1_G5`
 * (constante que o Radar já usa).
 */
const arvore = readFileSync("src/routes/portal/arvore.tsx", "utf8");

describe("chip Conectadas usa a mesma constante do Radar", () => {
  it("31 = 1+2+4+8+16", () => {
    expect(TETO_ANCESTRAIS_G1_G5).toBe(1 + 2 + 4 + 8 + 16);
    expect(TETO_ANCESTRAIS_G1_G5).toBe(31);
  });

  it("a Árvore importa a constante do Radar, não redefine", () => {
    expect(arvore).toContain('from "@/lib/radar-seis-eixos"');
    expect(arvore).toContain("TETO_ANCESTRAIS_G1_G5");
    // Nada de literal 31 embutido no valor do chip.
    expect(arvore).not.toContain('valor="12 de 31"');
    expect(arvore).not.toContain("valor={`12 de");
  });

  it("N vem da árvore sanitizada que a tela já mostra", () => {
    expect(arvore).toContain("`${itens.length} de ${TETO_ANCESTRAIS_G1_G5} pessoas possíveis já conectadas`");
  });
});
