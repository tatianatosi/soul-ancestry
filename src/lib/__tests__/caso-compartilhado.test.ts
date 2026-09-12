import { describe, expect, it } from "vitest";

import {
  identidadeDeCrmCaso,
  identidadeDeDemo,
  identidadeDePortalCaso,
  mesmoCaso,
} from "@/lib/caso-compartilhado";
import {
  CASO_DEMO_CASE_ID,
  CASO_DEMO_CODIGO,
  IDENTIDADE_DEMO_SOPHIA,
} from "@/lib/portal-demo-sophia";

describe("caso-compartilhado — Ordem 2 caseId", () => {
  it("demo e portal/crm com o mesmo UUID são o mesmo caso", () => {
    const portalId = identidadeDePortalCaso({
      id: CASO_DEMO_CASE_ID,
      codigo: CASO_DEMO_CODIGO,
      titulo: "x",
    });
    const crmId = identidadeDeCrmCaso({
      id: CASO_DEMO_CASE_ID,
      codigo: CASO_DEMO_CODIGO,
      titulo: "x",
    });
    expect(mesmoCaso(IDENTIDADE_DEMO_SOPHIA, portalId)).toBe(true);
    expect(mesmoCaso(IDENTIDADE_DEMO_SOPHIA, crmId)).toBe(true);
    expect(IDENTIDADE_DEMO_SOPHIA.caseId).toBe(CASO_DEMO_CASE_ID);
    expect(IDENTIDADE_DEMO_SOPHIA.codigo).toBe(CASO_DEMO_CODIGO);
  });

  it("código humano diferente não muda a igualdade — só o UUID conta", () => {
    const a = identidadeDeDemo({
      caseId: CASO_DEMO_CASE_ID,
      codigo: "A",
      titulo: "t",
    });
    const b = identidadeDeCrmCaso({
      id: CASO_DEMO_CASE_ID,
      codigo: "B",
      titulo: "t",
    });
    expect(mesmoCaso(a, b)).toBe(true);
  });

  it("UUIDs diferentes não são o mesmo caso", () => {
    const a = identidadeDeCrmCaso({ id: "11111111-1111-1111-1111-111111111111" });
    const b = identidadeDeCrmCaso({ id: "22222222-2222-2222-2222-222222222222" });
    expect(mesmoCaso(a, b)).toBe(false);
  });
});
