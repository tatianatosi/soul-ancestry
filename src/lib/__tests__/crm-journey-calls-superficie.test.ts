import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Superfície CRM Journey × Calls (2026-09-11):
 * aviso operacional + CTA pós-handoff → propostas, sem inventar crm_calls.
 */
describe("CRM Journey — superfície Painel de Calls", () => {
  const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
  const propostas = readFileSync("src/routes/_authenticated/propostas.tsx", "utf8");
  const lib = readFileSync("src/lib/painel-calls.ts", "utf8");

  it("expõe avisosOperacionaisLeadAtivo e usa na Mesa", () => {
    expect(lib).toContain("export function avisosOperacionaisLeadAtivo");
    expect(painel).toContain("avisosOperacionaisLeadAtivo");
    expect(painel).toContain("Pendência operacional (informa — não trava a proprietária)");
  });

  it("após handoff oferece CTA para propostas e caso (não auto-navega só para caso)", () => {
    expect(painel).toContain("Abrir / registrar proposta");
    expect(painel).toContain('to="/propostas"');
    expect(painel).toContain("search={{ caso: posHandoff.casoId, lead: posHandoff.leadId }}");
    expect(painel).toContain("setPosHandoff");
    expect(painel).not.toMatch(/void navegar\(\{\s*to: "\/casos\/\$caseId"/);
  });

  it("propostas aceitam search caso/lead do handoff", () => {
    expect(propostas).toContain("validateSearch");
    expect(propostas).toContain("caso?: string");
    expect(propostas).toContain("lead?: string");
    expect(propostas).toContain("case_id: casoSearch");
  });
});
