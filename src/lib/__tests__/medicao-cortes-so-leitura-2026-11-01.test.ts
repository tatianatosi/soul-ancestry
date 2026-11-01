import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("medição dos cortes C e H é só leitura (01/11/2026)", () => {
  const sql = readFileSync("docs/planos/medir-cortes-c-h.sql", "utf8");
  const semComentarios = sql
    .split("\n")
    .filter((linha) => !linha.trim().startsWith("--"))
    .join("\n")
    .toLowerCase();

  it("não contém nenhum comando que grave", () => {
    for (const proibido of ["insert ", "update ", "delete ", "drop ", "alter ", "truncate ", "create ", "grant "]) {
      expect(semComentarios, proibido).not.toContain(proibido);
    }
  });

  it("mede os números que o plano cobra: custo, prazo, aprovação de parâmetros e prévia final", () => {
    expect(semComentarios).toContain("estimated_cost_amount");
    expect(semComentarios).toContain("due_date");
    expect(semComentarios).toContain("aprovado_por");
    expect(semComentarios).toContain("contract_parameter_previews");
  });
});
