import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { elegivelParaPropostaReal } from "@/lib/catalogo-importacao";

// CA09-CATALOGO-PRODUTOS-PAI (09/09/2026): consolida a leitura de catálogo
// para Planejador/Produtos-Pai, sem SKU ou Planilha Mestre como trava.
const catalogoRota = readFileSync("src/routes/_authenticated/catalogo.tsx", "utf8");
const catalogoImportacaoFn = readFileSync("src/lib/catalogo-importacao.functions.ts", "utf8");
const catalogoImportacao = readFileSync("src/lib/catalogo-importacao.ts", "utf8");
const casoCanonicoFn = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const casoCanonicoServer = readFileSync("src/lib/caso-canonico.server.ts", "utf8");
const planejadorProdutosPai = readFileSync("src/lib/planejador-produtos-pai.ts", "utf8");

describe("elegivelParaPropostaReal — o gate real usa status_homologacao/elegivel_para_proposta", () => {
  it("homologado e elegível: permitido", () => {
    expect(elegivelParaPropostaReal({ status_homologacao: "homologado", elegivel_para_proposta: true })).toEqual({
      permitido: true,
      motivo: null,
    });
  });
  it("não homologado: bloqueado com motivo", () => {
    const r = elegivelParaPropostaReal({ status_homologacao: "em_revisao", elegivel_para_proposta: true });
    expect(r.permitido).toBe(false);
    expect(r.motivo).toContain("em_revisao");
  });
  it("homologado mas não elegível: bloqueado", () => {
    const r = elegivelParaPropostaReal({ status_homologacao: "homologado", elegivel_para_proposta: false });
    expect(r.permitido).toBe(false);
  });
});

describe("CA09-CATALOGO-PRODUTOS-PAI — Catálogo mostra produto-pai/contexto/status/origem, nunca SKU cru como decisão", () => {
  it("a página agrupa por produto-pai, não lista SKU como chave", () => {
    expect(catalogoRota).toContain("grupos");
    expect(catalogoRota).toContain("porProdutoPai");
    expect(catalogoRota).toContain("Sem produto-pai (pede reconciliação)");
  });

  it("mostra contexto (tipo_oferta), status de condição real e origem — SKU vira coluna técnica secundária", () => {
    expect(catalogoRota).toContain("Contexto");
    expect(catalogoRota).toContain("Status de condição");
    expect(catalogoRota).toContain("Origem");
    expect(catalogoRota).toContain("SKU (técnico)");
  });

  it("usa o gate real (elegivelParaPropostaReal), não mais o gate paralelo baseado na fonte importada", () => {
    expect(catalogoRota).toContain("elegivelParaPropostaReal(i)");
    expect(catalogoRota).not.toContain("selecionavelEmProposta(i)");
  });

  it("Planilha Mestre aparece só como origem/rastreabilidade, nunca como decisão de condição", () => {
    expect(catalogoRota).toContain("Origem (Planilha Mestre) é rastreabilidade, não decisão");
  });
});

describe("CA09-CATALOGO-PRODUTOS-PAI — nenhuma tabela nova, nenhum leitor operacional da Planilha Mestre", () => {
  it("lerCatalogoImportado lê só product_catalog e planner_catalog_feed — nenhuma tabela nova", () => {
    const trecho = catalogoImportacaoFn.slice(catalogoImportacaoFn.indexOf("export const lerCatalogoImportado"));
    expect(trecho).toContain('.from("product_catalog")');
    expect(trecho).toContain('.from("planner_catalog_feed")');
    expect(trecho).toContain('.from("catalog_source_divergences")');
    expect(trecho).not.toMatch(/create table|product_catalog_v2|planner_catalog_feed_v2/i);
  });

  it("nenhuma leitura de banco importa catalogo-fonte-mestre.ts como fallback operacional", () => {
    for (const arquivo of [catalogoImportacaoFn, casoCanonicoFn]) {
      expect(arquivo).not.toContain("catalogo-fonte-mestre");
    }
    // mapaFonteMestre/SKUS_TOP_PARETO (dados estáticos importados) só aparecem
    // em catalogo-importacao.ts, nunca com .from(...) de banco no mesmo trecho.
    expect(catalogoImportacao).toContain('from "@/data/catalogo-fonte-mestre"');
    expect(catalogoImportacao).not.toMatch(/\.from\(["']/);
  });

  it("Caso e Catálogo usam o mesmo enriquecimento de produto-pai (planejador-produtos-pai.ts) — nenhum cálculo duplicado", () => {
    expect(casoCanonicoFn).toContain('import { construirMapaProdutoPaiPorCodigo, produtoPaiDoCodigo } from "@/lib/planejador-produtos-pai"');
    expect(catalogoImportacaoFn).toContain('import { construirMapaProdutoPaiPorCodigo, produtoPaiDoCodigo } from "@/lib/planejador-produtos-pai"');
    expect(planejadorProdutosPai).toContain("export function construirMapaProdutoPaiPorCodigo");
  });
});

describe("CA09-CATALOGO-PRODUTOS-PAI — SKU não bloqueia trabalho interno", () => {
  it("salvarCaseService/payloadServico não exige product_catalog_id — rascunho sem SKU funciona", () => {
    expect(casoCanonicoServer).toContain('"product_catalog_id"');
    // O campo é opcional na lista de filtro — não há checagem de obrigatoriedade.
    expect(casoCanonicoServer).not.toMatch(/product_catalog_id.*obrigat[oó]rio/i);
    const trecho = casoCanonicoFn.slice(casoCanonicoFn.indexOf("export const salvarCaseService"));
    expect(trecho).toContain('if (payload["product_catalog_id"])');
  });
});
