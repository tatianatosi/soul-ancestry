import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte 5 (27/09/2026): mapa sistêmico de dados lead→cliente/caso→contrato,
 * pedido explicitamente pela Proprietária. Confirma que o documento existe
 * e cobre a cadeia completa + os pontos de ruptura + o apêndice de
 * varredura de Pesquisa/Biblioteca Mestre.
 */
describe("Corte 5 — mapa de dados lead→cliente existe e cobre a cadeia completa", () => {
  const doc = readFileSync("docs/arquitetura/MAPA-DADOS-LEAD-A-CLIENTE-2026-09-27.md", "utf8");

  it("cobre as 6 fases da cadeia (Lead, Discovery, Handoff, Ficha Operacional, Ficha Piloto/Genealógica, Pessoa 360, Contrato)", () => {
    expect(doc).toContain("| **Lead**");
    expect(doc).toContain("| **Discovery / Mesa de Calls**");
    expect(doc).toContain("| **Handoff (conversão)**");
    expect(doc).toContain("| **Ficha Operacional**");
    expect(doc).toContain("| **Ficha Piloto**");
    expect(doc).toContain("| **Pessoa 360**");
    expect(doc).toContain("| **Ficha Contrato**");
  });

  it("inclui o exemplo concreto da Ana (poucos dados no lead até dados completos no contrato)", () => {
    expect(doc).toContain("O exemplo da Ana, na prática");
  });

  it("lista os 5 pontos de ruptura, com o de endereço marcado como fechado no Corte 4", () => {
    expect(doc).toContain("Pontos de ruptura encontrados — 1 fechado, 4 declarados");
    expect(doc).toContain("**Fechado no Corte 4**");
  });

  it("apêndice consolida a varredura de Pesquisa/Centro de Inteligência/Biblioteca Mestre desta rodada", () => {
    expect(doc).toContain("Assistente de Pesquisa Genealógica");
    expect(doc).toContain("Centro de Inteligência");
    expect(doc).toContain("Bases Genealógicas");
    expect(doc).toContain("Motor jurídico automático");
    expect(doc).toContain("Camada de leitura unificada do Caso 360");
  });

  it("declara as decisões humanas pendentes, sem resolvê-las sozinho", () => {
    expect(doc).toContain("Decisões humanas ainda pendentes");
    expect(doc).toContain("Qual dos 3 sistemas de hipótese");
  });
});
