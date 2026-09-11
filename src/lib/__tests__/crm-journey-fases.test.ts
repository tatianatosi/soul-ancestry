import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  FASES_CRM_JOURNEY,
  SEQUENCIA_COMERCIAL_CRM_VIVO,
  ctaPrincipalFase,
  fasePorId,
  faseVizinha,
  fasesMvp,
  hrefFase,
} from "@/lib/crm-journey-fases";

describe("crm-journey-fases", () => {
  it("expõe a cadeia comercial canônica na ordem da proprietária", () => {
    expect(SEQUENCIA_COMERCIAL_CRM_VIVO.map((p) => p.id)).toEqual([
      "lead",
      "call_discovery",
      "oportunidade",
      "proposta",
      "confirmacao",
      "handoff",
      "pessoa_caso",
      "planejador_universal",
    ]);
    expect(SEQUENCIA_COMERCIAL_CRM_VIVO.map((p) => p.passo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(SEQUENCIA_COMERCIAL_CRM_VIVO[0]?.rotaDesk).toBe("/leads");
    expect(SEQUENCIA_COMERCIAL_CRM_VIVO[1]?.rotaDesk).toBe("/calls");
    expect(SEQUENCIA_COMERCIAL_CRM_VIVO[3]?.rotaDesk).toBe("/propostas");
    expect(SEQUENCIA_COMERCIAL_CRM_VIVO[7]?.rotulo).toMatch(/Planejador Universal/i);
  });

  it("expõe o ciclo Desk completo sem inventar crm_calls", () => {
    expect(FASES_CRM_JOURNEY.length).toBeGreaterThanOrEqual(11);
    expect(fasesMvp().every((f) => f.statusPiloto === "mvp")).toBe(true);
    expect(fasesMvp().length).toBeGreaterThanOrEqual(8);
    const src = readFileSync("src/lib/crm-journey-fases.ts", "utf8");
    expect(src).not.toMatch(/CREATE TABLE.*crm_calls/i);
    expect(src).toContain("SEQUENCIA_COMERCIAL_CRM_VIVO");
    expect(src).toContain('rotaDesk: "/calls"');
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

  it("navega hub: Lead → Discovery → oportunidade → proposta → confirmação → handoff → planejador", () => {
    expect(fasePorId("lead_bruto").rotaDesk).toBe("/leads");
    expect(fasePorId("lead_qualificado").rotaDesk).toBe("/calls");
    expect(fasePorId("oportunidade").rotaDesk).toBe("/conversao");
    expect(fasePorId("proposta").rotaDesk).toBe("/propostas");
    expect(fasePorId("confirmacao").rotaDesk).toBe("/propostas");
    expect(fasePorId("handoff_pessoa_caso").rotaDesk).toBe("/calls");
    expect(fasePorId("planejador_universal").rotaDesk).toBe("/casos");
    expect(faseVizinha("lead_bruto", -1)).toBeNull();
    expect(faseVizinha("lead_bruto", 1)?.id).toBe("lead_qualificado");
    expect(ctaPrincipalFase(fasePorId("lead_bruto")).to).toBe("/leads");
    expect(ctaPrincipalFase(fasePorId("proposta")).to).toBe("/propostas");
    expect(ctaPrincipalFase(fasePorId("planejador_universal")).to).toBe("/casos");
  });

  it("hub e conversão referenciam a matriz e a sequência", () => {
    const conversao = readFileSync("src/routes/_authenticated/conversao.tsx", "utf8");
    expect(conversao).toContain("FASES_CRM_JOURNEY");
    expect(conversao).toContain("/crm-journey");
    const hub = readFileSync("src/components/crm/jornada-crm.tsx", "utf8");
    expect(hub).toContain("SEQUENCIA_COMERCIAL_CRM_VIVO");
    expect(hub).toContain("Planejador Universal");
    expect(hub).toContain("confirmação");
    const nav = readFileSync("src/lib/navegacao-desk.ts", "utf8");
    expect(nav).toContain('to: "/crm-journey"');
  });
});
