import { describe, expect, it } from "vitest";
import {
  CASO_CANONICO,
  CASO_LEGADO,
  PASSOS_ACEITE_E2E,
  passoPorId,
  tabelasAuditoriaMonitoradas,
} from "../aceite-e2e-passos";

describe("roteiro E2E do aceite operacional (passos 3 a 8)", () => {
  it("cobre exatamente os passos 3 a 8", () => {
    expect(PASSOS_ACEITE_E2E.map((p) => p.numero)).toEqual([3, 4, 5, 6, 7, 8]);
    expect(PASSOS_ACEITE_E2E.map((p) => p.id)).toEqual([
      "P3",
      "P4",
      "P5",
      "P6",
      "P7",
      "P8",
    ]);
  });

  it("usa rotas internas autenticadas e capturas únicas", () => {
    const capturas = new Set<string>();
    for (const passo of PASSOS_ACEITE_E2E) {
      expect(passo.rota.startsWith("/")).toBe(true);
      expect(passo.rota).not.toMatch(/^https?:/);
      expect(passo.captura).toMatch(/^p[3-8]-[a-z0-9-]+\.png$/);
      expect(capturas.has(passo.captura)).toBe(false);
      capturas.add(passo.captura);
    }
  });

  it("declara ao menos uma tabela de auditoria por passo", () => {
    for (const passo of PASSOS_ACEITE_E2E) {
      expect(passo.tabelasAuditoria.length).toBeGreaterThan(0);
    }
    expect(tabelasAuditoriaMonitoradas()).toContain("owner_override_events");
    expect(tabelasAuditoriaMonitoradas()).toContain("audit_logs");
  });

  it("não executa ações externas — todos os passos são somente leitura", () => {
    expect(PASSOS_ACEITE_E2E.every((p) => p.somenteLeitura)).toBe(true);
  });

  it("resolve o caso da Ana pelo identificador legado", () => {
    const p3 = passoPorId("P3");
    expect(p3?.rota).toContain(CASO_LEGADO);
    expect(p3?.evidenciaTexto).toBe(CASO_CANONICO);
  });

  it("retorna undefined para passo inexistente", () => {
    expect(passoPorId("P9")).toBeUndefined();
  });
});
