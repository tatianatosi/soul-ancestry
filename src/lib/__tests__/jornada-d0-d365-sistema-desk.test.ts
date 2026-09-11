import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Jornada D0–D365 é sistema (não KPI): superfícies do Desk precisam deep-link
 * para caso/onboarding/propostas — ver ADENDO-JORNADA-D0-D365-E-SISTEMA-2026-09-11.
 */
describe("Jornada D0–D365 como sistema no Desk", () => {
  const ops = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");
  const painel = readFileSync("src/components/painel/painel-onboarding-jornada.tsx", "utf8");
  const calls = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
  const adendo = readFileSync("docs/politicas/ADENDO-JORNADA-D0-D365-E-SISTEMA-2026-09-11.md", "utf8");

  it("adendo declara sistema ≠ indicador", () => {
    expect(adendo).toMatch(/sistema operacional/i);
    expect(adendo).toMatch(/não indicador|não KPI|indicador órfão/i);
  });

  it("Ops deep-linka micro/tarefa ao caso", () => {
    expect(ops).toContain("function EloCaso");
    expect(ops).toContain('to="/casos/$caseId"');
  });

  it("painel onboarding abre caso e /onboarding/$id", () => {
    expect(painel).toContain('to="/casos/$caseId"');
    expect(painel).toContain('to="/onboarding/$id"');
  });

  it("Calls expõe CTA pós-handoff para propostas e onboarding (sem só KPI)", () => {
    expect(calls).toContain("Circuito pós-Discovery — sistema, não indicador");
    expect(calls).toContain('to="/propostas"');
    expect(calls).toContain('to="/onboarding/$id"');
    expect(calls).toContain("setPosHandoff");
    expect(calls).toContain("validarLead");
  });
});
