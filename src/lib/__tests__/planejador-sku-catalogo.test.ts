import { describe, expect, it } from "vitest";

import { parametrosDoPlanejador } from "@/lib/planejador-parametros";

describe("P7 — SKU do planejador confirma product_catalog (PR #68)", () => {
  it("sem consulta ao catálogo (undefined) ainda devolve o SKU da convenção — não quebra pré-carga de contrato", () => {
    const r = parametrosDoPlanejador("CA-CID-AT-FAM-001");
    const sku = r.parametros.find((p) => p.campo === "produto_sku");
    expect(sku?.valor).toMatch(/^CA-CID-AT-001/);
  });

  it("com SKU vivo no catálogo, usa o nome comercial de product_catalog", () => {
    const r = parametrosDoPlanejador("CA-CID-AT-FAM-001", {
      code: "CA-CID-AT-001",
      nome_comercial: "Cidadania austríaca — catálogo vivo",
    });
    const sku = r.parametros.find((p) => p.campo === "produto_sku");
    expect(sku?.valor).toBe("CA-CID-AT-001 — Cidadania austríaca — catálogo vivo");
    expect(sku?.detalhe).toMatch(/product_catalog/);
  });

  it("consulta vazia (null) deixa produto_sku pendente — não inventa SKU", () => {
    const r = parametrosDoPlanejador("CA-CID-AT-FAM-001", null);
    expect(r.parametros.find((p) => p.campo === "produto_sku")).toBeUndefined();
  });
});
