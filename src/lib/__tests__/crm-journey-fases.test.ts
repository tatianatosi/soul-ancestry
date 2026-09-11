import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { FASES_CRM_JOURNEY, fasesMvp, hrefFase } from "@/lib/crm-journey-fases";

describe("CRM Journey — fases no schema real", () => {
  it("lista as fases MVP críticas do Journey §5", () => {
    const ids = fasesMvp().map((f) => f.id);
    expect(ids).toEqual([
      "lead_bruto",
      "lead_qualificado",
      "oportunidade",
      "proposta_aceita",
      "cliente_ativo",
      "cliente_pesquisa",
      "cliente_pesquisa_documento",
    ]);
  });

  it("não aponta WhatsApp para envio automático", () => {
    for (const f of FASES_CRM_JOURNEY) {
      expect(["communication_queue", "copia_manual", "bloqueado_auto"]).toContain(f.whatsapp.canal);
      expect(f.whatsapp.canal).not.toBe("webhook_auto");
    }
  });

  it("mapeia cada fase a rota Desk existente (sem crm_calls)", () => {
    for (const f of FASES_CRM_JOURNEY) {
      expect(f.rotaDesk.startsWith("/")).toBe(true);
      expect(hrefFase(f)).toContain(f.rotaDesk);
    }
    expect(readFileSync("src/lib/crm-journey-fases.ts", "utf8")).not.toMatch(/CREATE TABLE.*crm_calls/i);
    expect(readFileSync("src/lib/crm-journey-fases.ts", "utf8")).toContain('rotaDesk: "/calls"');
  });

  it("Conversão exibe a matriz de fases", () => {
    const src = readFileSync("src/routes/_authenticated/conversao.tsx", "utf8");
    expect(src).toContain("FASES_CRM_JOURNEY");
    expect(src).toContain("Fases do CRM Journey");
  });
});
