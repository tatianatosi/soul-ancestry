import { describe, expect, it } from "vitest";

import { itensEscopoDaOS, referenciaOrigemEscopo, type ConteudoOS } from "@/lib/cadeia-operacional";

const conteudo: ConteudoOS = {
  objetivo: "Estudo genealógico para cidadania italiana",
  escopo: ["Pesquisa documental em arquivos brasileiros"],
  inclusoes: ["Relatório final consolidado"],
  exclusoes: ["Tradução juramentada"],
  entregas: ["Dossiê inicial"],
  microentregas: ["Linha do tempo preliminar"],
  dependencias: ["Certidão de nascimento do requerente"],
  pessoas: [{ nome: "Ana Luiza", papel: "requerente" } as never],
  sku_codigo: "SKU-CID-AT-FAM",
  condicao_id: "cc-1",
};

const ref = {
  propostaVersao: 2,
  skuCodigo: "SKU-CID-AT-FAM",
  condicaoCodigo: "CC-001",
  osVersao: 1,
};

describe("origem dos itens de escopo contratual", () => {
  it("monta a referência completa da cadeia", () => {
    expect(referenciaOrigemEscopo(ref)).toBe(
      "proposta v2 · SKU SKU-CID-AT-FAM · condição CC-001 · OS v1",
    );
  });

  it("herda source_type proposal e a mesma referência em todos os itens", () => {
    const itens = itensEscopoDaOS(conteudo, ref);
    expect(itens.length).toBe(8);
    expect(itens.every((i) => i.source_type === "proposal")).toBe(true);
    expect(new Set(itens.map((i) => i.source_reference)).size).toBe(1);
  });

  it("classifica exclusões, entregas e dependências", () => {
    const itens = itensEscopoDaOS(conteudo, ref);
    expect(itens.find((i) => i.title === "Tradução juramentada")?.status).toBe("excluded");
    expect(itens.filter((i) => i.category === "deliverable")).toHaveLength(2);
    const dep = itens.find((i) => i.category === "dependency");
    expect(dep?.status).toBe("conditional");
    expect(dep?.requires_human_validation).toBe(true);
  });

  it("ignora títulos vazios e mantém ordem sequencial", () => {
    const itens = itensEscopoDaOS({ ...conteudo, escopo: ["", "  ", "Válido"] }, ref);
    expect(itens.some((i) => i.title === "Válido")).toBe(true);
    expect(itens.map((i) => i.display_order)).toEqual(itens.map((_, idx) => idx + 1));
  });
});
