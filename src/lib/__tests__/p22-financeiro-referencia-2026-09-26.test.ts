import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { paramsDaReferenciaFinanceira } from "@/lib/financeiro-referencia";

// P22 (26/09/2026) — decisão explícita da Proprietária: "o ideal é deixar
// tudo remetendo aos dados atuais" — substitui o lookup estático PARAMETROS
// (src/data/casos.ts) por dado vivo (commercial_conditions/price_catalog_rescued)
// no único ponto do contrato que ainda o lia (parcelas/despesas externas).

describe("P22 — paramsDaReferenciaFinanceira nunca fabrica valor", () => {
  it("sem nenhuma referência, devolve array vazio (pendência, não zero inventado)", () => {
    expect(paramsDaReferenciaFinanceira(null, "detalhe")).toEqual([]);
  });

  it("condição do caso: usa o texto real de forma_pagamento, rotulado como particular do caso", () => {
    const linhas = paramsDaReferenciaFinanceira(
      { origem: "condicao_do_caso", formaPagamento: "3 assinaturas mensais de R$320", valorTotalReferencia: 9600 },
      "detalhe",
    );
    expect(linhas).toHaveLength(1);
    expect(linhas[0].campo).toBe("condicao_comercial_do_caso");
    expect(linhas[0].valor).toBe("3 assinaturas mensais de R$320");
    expect(linhas[0].detalhe).toContain("condição comercial particular deste caso");
  });

  it("condição do caso sem forma_pagamento preenchida: não gera linha nenhuma", () => {
    expect(
      paramsDaReferenciaFinanceira({ origem: "condicao_do_caso", formaPagamento: "  ", valorTotalReferencia: null }, "d"),
    ).toEqual([]);
  });

  it("referência da trilha: gera parcelas e despesas_externas só quando o dado existe, rotulado como referência resgatada", () => {
    const linhas = paramsDaReferenciaFinanceira(
      { origem: "referencia_da_trilha", honorarios: 4800, despesas: 1800, taxas: 600, parcelas: 10 },
      "detalhe",
    );
    const campos = linhas.map((l) => l.campo);
    expect(campos).toEqual(["parcelas", "despesas_externas"]);
    expect(linhas[0].valor).toBe("10x");
    expect(linhas[1].valor).toContain("Despesas previstas BRL 1800");
    expect(linhas[1].valor).toContain("taxas previstas BRL 600");
    for (const l of linhas) expect(l.detalhe).toContain("referência resgatada do país");
  });

  it("referência da trilha sem nenhum componente: array vazio", () => {
    expect(
      paramsDaReferenciaFinanceira(
        { origem: "referencia_da_trilha", honorarios: null, despesas: null, taxas: null, parcelas: null },
        "d",
      ),
    ).toEqual([]);
  });
});

describe("P22 — planejador-parametros.ts não lê mais o lookup estático legado", () => {
  it("não importa PARAMETROS de @/data/casos", () => {
    const arquivo = readFileSync("src/lib/planejador-parametros.ts", "utf8");
    expect(arquivo).not.toContain('from "@/data/casos"');
    expect(arquivo).not.toContain("PARAMETROS[");
  });

  it("recebe a referência financeira já resolvida pelo chamador (dado vivo)", () => {
    const arquivo = readFileSync("src/lib/planejador-parametros.ts", "utf8");
    expect(arquivo).toContain("referenciaFinanceira?: ReferenciaFinanceira");
    expect(arquivo).toContain("paramsDaReferenciaFinanceira(referenciaFinanceira ?? null, detalhe)");
  });
});

describe("P22 — resolvedor server prefere condição do caso, cai para referência do país", () => {
  it("consulta commercial_conditions antes de price_catalog_rescued", () => {
    const arquivo = readFileSync("src/lib/financeiro-referencia.server.ts", "utf8");
    const posCC = arquivo.indexOf('from("commercial_conditions")');
    const posPCR = arquivo.indexOf('from("price_catalog_rescued")');
    expect(posCC).toBeGreaterThan(-1);
    expect(posPCR).toBeGreaterThan(posCC);
  });

  it("price_catalog_rescued é filtrado por item_id null — nível país, não SKU específico", () => {
    const arquivo = readFileSync("src/lib/financeiro-referencia.server.ts", "utf8");
    expect(arquivo).toContain('.is("item_id", null)');
  });
});
