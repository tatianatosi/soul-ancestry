import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Conta: a linha de situação não some quando falta o dado (31/10/2026)", () => {
  const fonte = readFileSync("src/routes/portal/conta.tsx", "utf8");

  it("sem situação, mostra vazio honesto em vez de omitir a linha", () => {
    expect(fonte).toContain("ainda não informada pela equipe");
    expect(fonte).not.toMatch(/situacaoAcompanhamento \? <p/);
  });

  it("a linha é sempre renderizada", () => {
    expect(fonte).toMatch(/<p\s+data-conta-situacao[\s\S]*?Situação do acompanhamento:/);
  });
});
