import { describe, expect, it } from "vitest";
import { bloqueioDoCaso, type CasoPortal } from "@/lib/portal-elegibilidade";

const CASO_BASE: CasoPortal = {
  id: "caso-1",
  codigo: "CA-CID-AT-FAM-2026-001",
  titulo: "Caso teste",
  cliente_id: "cliente-1",
  contrato_assinado: false,
  pagamento_confirmado: false,
  documentos_minimos_ok: false,
  ativado_em: null,
  onboarding_iniciado_em: null,
  app_access_status: null,
  demo: false,
};

describe("bloqueioDoCaso — gate real do App Cliente (CA-P0-EXEC-001, critério A)", () => {
  it("bloqueia quando contrato_assinado é false, mesmo com os demais critérios atendidos", () => {
    const r = bloqueioDoCaso({
      ...CASO_BASE,
      contrato_assinado: false,
      pagamento_confirmado: true,
      documentos_minimos_ok: true,
      ativado_em: "2026-09-04T00:00:00Z",
    });
    expect(r.bloqueado).toBe(true);
    expect(r.motivos).toContain("Bloqueado: contrato não assinado");
  });

  it("libera quando contrato_assinado é true e os demais critérios também estão atendidos", () => {
    const r = bloqueioDoCaso({
      ...CASO_BASE,
      contrato_assinado: true,
      pagamento_confirmado: true,
      documentos_minimos_ok: true,
      ativado_em: "2026-09-04T00:00:00Z",
    });
    expect(r.bloqueado).toBe(false);
    expect(r.motivos).toHaveLength(0);
  });

  it("contrato_assinado sozinho não basta: pagamento e documentos continuam exigidos", () => {
    const r = bloqueioDoCaso({
      ...CASO_BASE,
      contrato_assinado: true,
      pagamento_confirmado: false,
      documentos_minimos_ok: false,
    });
    expect(r.bloqueado).toBe(true);
    expect(r.motivos).toEqual(
      expect.arrayContaining([
        "Bloqueado: pagamento inicial não confirmado",
        "Bloqueado: documentos mínimos pendentes",
      ]),
    );
    expect(r.motivos).not.toContain("Bloqueado: contrato não assinado");
  });

  it("sem ativado_em nem onboarding_iniciado_em, mesmo com contrato/pagamento/documentos ok, permanece bloqueado", () => {
    const r = bloqueioDoCaso({
      ...CASO_BASE,
      contrato_assinado: true,
      pagamento_confirmado: true,
      documentos_minimos_ok: true,
      ativado_em: null,
      onboarding_iniciado_em: null,
    });
    expect(r.bloqueado).toBe(true);
    expect(r.motivos).toContain("Bloqueado: falta decisão humana de ativação ou onboarding elegível");
  });
});
