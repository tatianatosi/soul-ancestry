import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial V4 — quinta rodada (Proprietária, 13/10/2026): o mockup de
 * referência pede 3 cards lado a lado (Aquisição por canal, Conversão por
 * etapa, Origem e qualidade). Reconstruído com dado real em grid de 3
 * colunas. "Origem e qualidade" do mockup (Alta/Boa/Média) não tinha fonte
 * real — substituído por taxa real de conversão a contrato por canal.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("Comercial — trio infográfico em grid de 3 colunas", () => {
  it("os 3 cards existem em grid lg:grid-cols-3", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-aquisicao-canal") - 400, rota.indexOf("data-leads-qualidade-canal") + 400);
    expect(trecho).toContain("lg:grid-cols-3");
    expect(trecho).toContain("data-leads-aquisicao-canal");
    expect(trecho).toContain("data-leads-funil");
    expect(trecho).toContain("data-leads-qualidade-canal");
  });

  it("Aquisição por canal usa GraficoColunas (colunas verticais) com totais reais, maior canal em destaque", () => {
    expect(rota).toContain("const aquisicaoPorCanal = leadsPorCanal.map");
    expect(rota).toContain("destaque: c.leads.length === maiorCanal");
    const trecho = rota.slice(rota.indexOf("data-leads-aquisicao-canal"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-aquisicao-canal")));
    expect(trecho).toContain("<GraficoColunas");
  });

  it("Qualidade por canal é taxa real de conversão a contrato (etapaPipeline), não uma nota Alta/Boa/Média inventada", () => {
    const trecho = rota.slice(rota.indexOf("const qualidadePorCanal"), rota.indexOf("const leadsAtivosTabela"));
    expect(trecho).toContain('etapaPipeline(l) === "contrato"');
    expect(rota).not.toMatch(/"Alta"|"Boa"|"Média"/);
  });

  it("não reintroduz canal/distribuição inventados — distribuicaoCanais antigo foi removido", () => {
    expect(rota).not.toContain("const distribuicaoCanais");
  });
});
