import { describe, expect, it } from "vitest";

import { CAT_FORMA_ASSINATURA } from "@/lib/parametros-catalogos";

/**
 * 07/10/2026 — decisão literal da Proprietária: "mude ... o método de
 * assinatura eletrônica gov.br". O catálogo de forma de assinatura
 * (`contract_parameter_values.campo = 'forma_assinatura'`, dropdown
 * controlado) só tinha "eletrônica em plataforma externa" e "física
 * digitalizada" — nenhum dos dois nomeia o gov.br. Nova opção aditiva
 * (nenhuma removida), aplicada ao contrato real da Ana via
 * `contract_parameter_values` (grava→relê, auditado em `audit_logs`).
 */
describe("CAT_FORMA_ASSINATURA inclui gov.br", () => {
  it("tem a opção eletronica_govbr, sem remover as já existentes", () => {
    const valores = CAT_FORMA_ASSINATURA.map((o) => o.valor);
    expect(valores).toContain("eletronica_govbr");
    expect(valores).toContain("eletronica_externa");
    expect(valores).toContain("fisica_digitalizada");
  });

  it("o rótulo nomeia gov.br explicitamente", () => {
    const opcao = CAT_FORMA_ASSINATURA.find((o) => o.valor === "eletronica_govbr")!;
    expect(opcao.rotulo).toMatch(/gov\.br/i);
  });
});
