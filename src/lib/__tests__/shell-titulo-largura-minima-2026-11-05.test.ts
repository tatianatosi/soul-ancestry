import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * 05/11/2026: no Caso 360 a 1280 px, as ações largas (seletor de casos, GoLive, salvar) espremiam o título
 * "Caso 360" até uma letra por linha. O título guarda largura mínima e a linha quebra.
 */
const shell = readFileSync("src/components/saas/shell.tsx", "utf8");

describe("Cabeçalho do Desk — título nunca espremido", () => {
  it("linha do cabeçalho quebra e o título tem largura mínima a partir de sm", () => {
    expect(shell).toContain("sm:flex-row sm:flex-wrap sm:items-end sm:justify-between");
    expect(shell).toMatch(/sm:min-w-\[14rem\] sm:flex-1/);
  });
});
