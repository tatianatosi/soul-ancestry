import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * N9 do plano (01/11/2026): `/api/saude` respondia `sha: null` porque o deploy
 * do Lovable não injeta variável de CI. O build agora grava o commit no bundle
 * (`__BUILD_SHA__`, via `define` do Vite). Limite honesto: se o ambiente de
 * build não tiver `.git` nem variável de CI, o valor continua `null`.
 */
describe("SHA do build em /api/saude (01/11/2026)", () => {
  const vite = readFileSync("vite.config.ts", "utf8");
  const saude = readFileSync("src/routes/api/saude.ts", "utf8");

  it("o build injeta __BUILD_SHA__ a partir do ambiente ou do git", () => {
    expect(vite).toContain("__BUILD_SHA__");
    expect(vite).toContain("git rev-parse HEAD");
    expect(vite).toContain("GITHUB_SHA");
  });

  it("a rota usa o SHA do build só depois das variáveis de ambiente, sem inventar valor", () => {
    expect(saude).toContain('typeof __BUILD_SHA__ !== "undefined"');
    expect(saude).toContain("?? shaDoBuild ?? null");
    expect(saude).toContain("shaConhecida: sha !== null");
  });

  it("o SHA nunca é lido de entrada do usuário", () => {
    expect(saude).not.toContain("request.url");
    expect(saude).not.toContain("searchParams");
  });
});
