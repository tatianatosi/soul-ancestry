import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { agruparPorProdutoPai, PRODUTOS_PAI_CANONICOS } from "@/lib/planejador-produtos-pai";
import type { ItemPlannerCatalogFeed } from "@/lib/planejador-produtos-pai.functions";

/**
 * P6 (25/09/2026) — achado ao investigar "temos poucos produtos no
 * planejador": o seed original de `planner_catalog_feed`
 * (20260904180000) gravou `product_parent` com texto ligeiramente
 * diferente do nome canônico para 3 itens (`CA-GEN-MULTI-003/004/005`).
 * `agruparPorProdutoPai` agrupa por igualdade exata de texto — esses 3
 * itens sempre caíam em "fora da lista canônica de 9", esvaziando
 * visivelmente Pesquisa Genealógica por Ramo Familiar (PP-03) e História
 * de Família, Memória e Legado (PP-08) na tela /catalogo.
 */

function item(id: string, productParent: string | null): ItemPlannerCatalogFeed {
  return {
    item_id: id,
    prefix: "CA-GEN",
    name: id,
    status_dictionary: "ESPECIFICACAO_PENDENTE",
    product_parent: productParent,
    journey_phase_default: null,
    country_scope: [],
    commercial_model: null,
    price_status: null,
    reconciliation_note: null,
  };
}

describe("P6 — nome do produto-pai precisa bater exatamente com o canônico", () => {
  it("um product_parent com texto quase igual (mas não idêntico) ao canônico cai fora dos 9 grupos", () => {
    const grupos = agruparPorProdutoPai([item("x", "Pesquisa Genealógica por Ramo")]);
    const pp03 = grupos.find((g) => g.produtoPai?.id === "PP-03");
    expect(pp03?.itens).toHaveLength(0);
    const foraDaLista = grupos.find((g) => g.produtoPai?.faseDaVida === "Fora da lista canônica de 9");
    expect(foraDaLista?.itens.map((i) => i.item_id)).toContain("x");
  });

  it("com o nome canônico exato, o item entra no grupo certo (PP-03)", () => {
    const grupos = agruparPorProdutoPai([item("x", "Pesquisa Genealógica por Ramo Familiar")]);
    const pp03 = grupos.find((g) => g.produtoPai?.id === "PP-03");
    expect(pp03?.itens.map((i) => i.item_id)).toEqual(["x"]);
  });

  it("a migration corrige exatamente os 3 itens, para os 2 nomes canônicos certos", () => {
    const sql = readFileSync(
      "supabase/migrations/20260925140000_planner_catalog_feed_corrige_product_parent.sql",
      "utf8",
    );
    expect(sql).toMatch(/CA-GEN-MULTI-003.*CA-GEN-MULTI-004/s);
    expect(sql).toContain("'Pesquisa Genealógica por Ramo Familiar'");
    expect(sql).toContain("CA-GEN-MULTI-005");
    expect(sql).toContain("'História de Família, Memória e Legado'");
    // Os dois nomes de destino existem de fato entre os 9 canônicos.
    const nomesCanonicos = PRODUTOS_PAI_CANONICOS.map((p) => p.nome);
    expect(nomesCanonicos).toContain("Pesquisa Genealógica por Ramo Familiar");
    expect(nomesCanonicos).toContain("História de Família, Memória e Legado");
  });
});
