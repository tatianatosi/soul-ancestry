import { describe, expect, it } from "vitest";
import { construirMapaProdutoPaiPorCodigo, produtoPaiDoCodigo } from "@/lib/planejador-produtos-pai";

describe("construirMapaProdutoPaiPorCodigo / produtoPaiDoCodigo — CA09-CATALOGO-PRODUTOS-PAI", () => {
  it("mapeia por item_id e por cada legacy_alias", () => {
    const mapa = construirMapaProdutoPaiPorCodigo([
      { item_id: "CA-CID-010", product_parent: "Diagnóstico Familiar Multipaís", status_dictionary: "ATIVO_HOMOLOGADO", legacy_aliases: ["CA-OLD-010"] },
    ]);
    expect(produtoPaiDoCodigo("CA-CID-010", mapa)).toEqual({ produto_pai: "Diagnóstico Familiar Multipaís", status_reconciliacao: "ATIVO_HOMOLOGADO" });
    expect(produtoPaiDoCodigo("CA-OLD-010", mapa)).toEqual({ produto_pai: "Diagnóstico Familiar Multipaís", status_reconciliacao: "ATIVO_HOMOLOGADO" });
  });

  it("código fora da lista-alimento nunca é inventado — ambos nulos", () => {
    const mapa = construirMapaProdutoPaiPorCodigo([]);
    expect(produtoPaiDoCodigo("CA-INEXISTENTE", mapa)).toEqual({ produto_pai: null, status_reconciliacao: null });
    expect(produtoPaiDoCodigo(null, mapa)).toEqual({ produto_pai: null, status_reconciliacao: null });
  });

  it("sem legacy_aliases não quebra o mapeamento do código principal", () => {
    const mapa = construirMapaProdutoPaiPorCodigo([{ item_id: "CA-CID-020", product_parent: "Estratégia de Via e Composição Familiar", status_dictionary: null }]);
    expect(produtoPaiDoCodigo("CA-CID-020", mapa).produto_pai).toBe("Estratégia de Via e Composição Familiar");
  });
});
