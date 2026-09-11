import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  FASES_CRM_JOURNEY,
  ctaPrincipalFase,
  fasePorId,
  faseVizinha,
  fasesMvp,
  hrefFase,
} from "@/lib/crm-journey-fases";

describe("crm-journey-fases", () => {
  it("expõe 9 fases do ciclo (MVP + backlog) sem inventar crm_calls", () => {
    expect(FASES_CRM_JOURNEY).toHaveLength(9);
    expect(fasesMvp().every((f) => f.statusPiloto === "mvp")).toBe(true);
    expect(fasesMvp().length).toBeGreaterThanOrEqual(7);
    expect(readFileSync("src/lib/crm-journey-fases.ts", "utf8")).not.toMatch(/CREATE TABLE.*crm_calls/i);
    expect(readFileSync("src/lib/crm-journey-fases.ts", "utf8")).toContain('rotaDesk: "/calls"');
  });

  it("mapeia cada fase para rota Desk e canal WhatsApp seguro", () => {
    for (const f of FASES_CRM_JOURNEY) {
      expect(f.rotaDesk.startsWith("/")).toBe(true);
      expect(["communication_queue", "copia_manual", "bloqueado_auto"]).toContain(f.whatsapp.canal);
      expect(hrefFase(f)).toContain(f.rotaDesk);
      const cta = ctaPrincipalFase(f);
      expect(cta.to.startsWith("/")).toBe(true);
      expect(cta.rotulo.length).toBeGreaterThan(0);
    }
  });

  it("navega hub e CTAs canônicos", () => {
    expect(fasePorId("lead_bruto").rotaDesk).toBe("/calls");
    expect(fasePorId("cliente_pesquisa").rotaDesk).toBe("/pesquisa-modulo");
    expect(fasePorId("cliente_recorrente").rotaDesk).toBe("/crm-journey");
    expect(fasePorId("inexistente").id).toBe("lead_bruto");
    expect(faseVizinha("lead_bruto", -1)).toBeNull();
    expect(faseVizinha("lead_bruto", 1)?.id).toBe("lead_qualificado");
    expect(faseVizinha("cliente_recorrente", 1)).toBeNull();
    expect(ctaPrincipalFase(fasePorId("oportunidade")).to).toBe("/propostas");
  });

  it("conversão e hub referenciam a matriz", () => {
    const conversao = readFileSync("src/routes/_authenticated/conversao.tsx", "utf8");
    expect(conversao).toContain("FASES_CRM_JOURNEY");
    expect(conversao).toContain("/crm-journey");
    const hub = readFileSync("src/routes/_authenticated/crm-journey.tsx", "utf8");
    expect(hub).toContain("JornadaCrmHub");
    const nav = readFileSync("src/lib/navegacao-desk.ts", "utf8");
    expect(nav).toContain('to: "/crm-journey"');
  });
});
