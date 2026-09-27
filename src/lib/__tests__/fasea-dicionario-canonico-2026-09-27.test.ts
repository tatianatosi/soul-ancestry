import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Fase A (27/09/2026): dicionário canônico executável — transforma o mapa
 * de campos em cadeia com dono/writer/readers/propagação/snapshot/
 * conflito/visibilidade/estado por grupo de campos.
 */
describe("Fase A — dicionário canônico existe e cobre os 8 grupos + regra absoluta", () => {
  const doc = readFileSync(
    "docs/arquitetura/2026-09-27_dicionario-canonico-lead-pessoa-caso-pesquisa-contrato.md",
    "utf8",
  );

  it("declara a regra absoluta (sinais de reconciliação, Pessoa Canônica, snapshot, fronteira do App)", () => {
    expect(doc).toContain("sinais de reconciliação");
    expect(doc).toContain("Pessoa Canônica");
    expect(doc).toContain("fn_contract_parties_guard");
    expect(doc).toContain("App nunca lê");
  });

  it("cobre os 8 grupos de campos com dono/writer/readers/propagação/snapshot/conflito/visibilidade/estado", () => {
    for (const grupo of [
      "Identificação básica",
      "CPF / documento",
      "Endereço estruturado",
      "Papel no caso",
      "Dados de pesquisa/genealogia",
      "SPIN, objeção, hipótese, score",
      "Contrato (`contract_parties`)",
      "Visibilidade do App",
    ]) {
      expect(doc).toContain(grupo);
    }
  });

  it("declara explicitamente os campos que nunca podem ser copiados entre camadas", () => {
    expect(doc).toContain("Campos que NÃO podem ser copiados entre camadas");
    expect(doc).toContain("SPIN");
    expect(doc).toContain("Evidência interna");
  });

  it("nunca declara fusão automática por nome/CPF/e-mail/telefone", () => {
    expect(doc).not.toMatch(/funde automaticamente/);
    expect(doc).toContain("merge automático");
  });
});
