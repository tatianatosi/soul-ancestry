import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * 05/11/2026: a prévia ficou em branco porque `equipe.functions.ts` tinha uma função comum, fora de handler,
 * lendo o cabeçalho da requisição; a proteção de importação do TanStack Start barrou o pacote do navegador.
 * A leitura passa a ser só do servidor, preservando a origem canônica dos links de redefinição (E1).
 */
const equipe = readFileSync("src/lib/equipe.functions.ts", "utf8");

describe("equipe.functions — origem lida só no servidor", () => {
  it("origem() é createServerOnlyFn, não função comum de módulo", () => {
    expect(equipe).toContain('const origem = createServerOnlyFn(() => origemDeAutenticacao(getRequestHeader("origin")));');
    expect(equipe).not.toMatch(/^function origem\(/m);
  });

  it("getRequestHeader não aparece fora da função só de servidor", () => {
    expect(equipe.match(/getRequestHeader\(/g)?.length).toBe(1);
  });
});
