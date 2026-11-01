import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("condição comercial no App só chega ao contratante (31/10/2026)", () => {
  const fonte = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");
  const bloco = fonte.slice(
    fonte.indexOf("let condicaoComercial: CondicaoComercialCliente | null = null;\n    try"),
  );

  it("confere portal_sou_contratante_financeiro antes de ler pelo bridge admin", () => {
    const gate = bloco.indexOf('"portal_sou_contratante_financeiro"');
    const leitura = bloco.indexOf('.from("case_commercial_condition")');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(leitura);
  });

  it("falha do gate ou não-contratante cai no estado neutro (null)", () => {
    expect(bloco).toMatch(/gate\.error \|\| gate\.data !== true/);
    expect(bloco).toMatch(/catch \{\s*condicaoComercial = null;/);
  });
});
