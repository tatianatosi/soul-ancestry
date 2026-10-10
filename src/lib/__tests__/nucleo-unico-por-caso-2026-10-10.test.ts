import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const fonte = readFileSync("src/lib/nucleos-desk.functions.ts", "utf8");
const trecho = fonte.slice(fonte.indexOf("export const criarNucleo"), fonte.indexOf("export const salvarDossieNucleo"));

describe("Dossiê Familiar Único — criarNucleo (10/10/2026)", () => {
  it("recusa um segundo núcleo ativo para o mesmo caso", () => {
    expect(trecho).toContain('.eq("case_id", data.caseId)');
    expect(trecho).toContain('.is("archived_at", null)');
    expect(trecho).toContain("Este caso já tem um núcleo familiar ativo");
  });

  it("a checagem acontece antes do insert e é restrita à organização", () => {
    const checagem = trecho.indexOf("Este caso já tem um núcleo familiar ativo");
    const insert = trecho.indexOf('.insert({');
    expect(checagem).toBeGreaterThan(0);
    expect(insert).toBeGreaterThan(checagem);
    expect(trecho).toContain('.eq("organization_id", organization_id)');
  });
});
