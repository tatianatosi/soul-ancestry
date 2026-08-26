import { describe, expect, it } from "vitest";

import { ehFixtureLinha, rotuloIndicaDemo, semFixtures } from "@/lib/fixtures";

describe("detecção determinística de DEMO/TESTE", () => {
  it("reconhece coluna booleana em qualquer variante", () => {
    expect(ehFixtureLinha({ demo: true })).toBe(true);
    expect(ehFixtureLinha({ is_demo: true })).toBe(true);
    expect(ehFixtureLinha({ dados_teste: true })).toBe(true);
    expect(ehFixtureLinha({ data_origin: "fixture_demo" })).toBe(true);
  });

  it("reconhece rótulo marcado como TESTE mesmo com booleano ainda falso", () => {
    expect(rotuloIndicaDemo("CA-TESTE-VAL-2026-001")).toBe(true);
    expect(
      ehFixtureLinha({
        codigo: "CA-TESTE-VAL-2026-001",
        titulo: "TESTE - Validacao do motor contratual",
        demo: false,
      }),
    ).toBe(true);
  });

  it("não marca registro real como fixture", () => {
    const real = {
      codigo: "CA-CID-AT-FAM-2026-001",
      titulo: "Projeto familiar — Ana Luiza (piloto real)",
      demo: false,
    };
    expect(ehFixtureLinha(real)).toBe(false);
    expect(semFixtures([real, { codigo: "CA-TESTE-VAL-2026-001" }])).toHaveLength(1);
  });
});
