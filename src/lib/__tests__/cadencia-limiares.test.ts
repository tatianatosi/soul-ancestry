import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  DIAS_CADENCIA_ATENCAO,
  DIAS_CADENCIA_CRITICA,
  DIAS_PRIMEIRA_MICROENTREGA,
} from "@/lib/cadencia-limiares";
import { CADENCIA, saudeDoPlano } from "@/lib/onboarding-jornada";
import { calcularCadencia } from "@/lib/jornada-cliente";

describe("P3 — limiares únicos de cadência (PR #80)", () => {
  it("D7 / D10 / D14 existem numa só fonte", () => {
    expect(DIAS_PRIMEIRA_MICROENTREGA).toBe(7);
    expect(DIAS_CADENCIA_ATENCAO).toBe(10);
    expect(DIAS_CADENCIA_CRITICA).toBe(14);
    expect(CADENCIA.primeiraMicroentregaDias).toBe(DIAS_PRIMEIRA_MICROENTREGA);
    expect(CADENCIA.atencaoDias).toBe(DIAS_CADENCIA_ATENCAO);
    expect(CADENCIA.criticoDias).toBe(DIAS_CADENCIA_CRITICA);
  });

  it("onboarding e jornada do cliente usam os mesmos números", () => {
    expect(saudeDoPlano(9)).toBe("regular");
    expect(saudeDoPlano(10)).toBe("atencao");
    expect(saudeDoPlano(14)).toBe("critico");
    expect(calcularCadencia({ hoje: "2026-09-10", ultimoTouchpointEm: null }).status).toBe("critico");
    expect(
      calcularCadencia({ hoje: "2026-09-10", ultimoTouchpointEm: "2026-08-27T00:00:00.000Z" }).status,
    ).toBe("critico");
    expect(
      calcularCadencia({ hoje: "2026-09-10", ultimoTouchpointEm: "2026-08-31T00:00:00.000Z" }).status,
    ).toBe("atencao");
  });

  it("TOP 30 e ficha do caso deixam de redeclarar 10/14", () => {
    const top30 = readFileSync("src/lib/catalogo-top30.functions.ts", "utf8");
    expect(top30).toContain("DIAS_CADENCIA_ATENCAO");
    expect(top30).toContain("DIAS_CADENCIA_CRITICA");
    expect(top30).not.toMatch(/dias_sem_touchpoint >= 10/);
    const ficha = readFileSync("src/lib/caso-ficha.ts", "utf8");
    expect(ficha).toContain("DIAS_CADENCIA_CRITICA");
    expect(ficha).toContain("DIAS_CADENCIA_ATENCAO");
  });

  it("não inventa cadence_runs", () => {
    const limiares = readFileSync("src/lib/cadencia-limiares.ts", "utf8");
    expect(limiares).toContain("Não criar");
    expect(limiares).toContain("cadence_runs");
  });
});
