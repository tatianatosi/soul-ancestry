import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mensagemErroCriarNucleo } from "@/lib/nucleos-desk.functions";

const fonte = readFileSync("src/lib/nucleos-desk.functions.ts", "utf8");
const trecho = fonte.slice(fonte.indexOf("export const criarNucleo"), fonte.indexOf("export const salvarDossieNucleo"));

describe("Dossiê Familiar Único — criarNucleo (10/10/2026)", () => {
  it("recusa um segundo núcleo ativo para o mesmo caso (checagem prévia, melhor esforço)", () => {
    expect(trecho).toContain('.eq("case_id", data.caseId)');
    expect(trecho).toContain('.is("archived_at", null)');
    expect(trecho).toContain("Este caso já tem um núcleo familiar ativo");
  });

  it("a checagem prévia acontece antes do insert e é restrita à organização", () => {
    const checagem = trecho.indexOf("Este caso já tem um núcleo familiar ativo");
    const insert = trecho.indexOf('.insert({');
    expect(checagem).toBeGreaterThan(0);
    expect(insert).toBeGreaterThan(checagem);
    expect(trecho).toContain('.eq("organization_id", organization_id)');
  });

  it("delega a violação do erro para mensagemErroCriarNucleo", () => {
    // A checagem prévia (select + insert) não impede duas criações
    // simultâneas: ambas podem passar pelo maybeSingle() antes de inserir.
    // A garantia real contra essa corrida é o handler chamar a tradução do
    // erro de unicidade do banco, não apenas repetir a checagem prévia.
    expect(trecho).toContain("mensagemErroCriarNucleo(error)");
  });
});

/**
 * Comportamental, não de string: simula a condição de corrida real — a
 * checagem prévia não viu o concorrente (ambos passaram no maybeSingle),
 * e quem perde a corrida recebe a violação do índice único parcial do
 * banco (`nucleos_familiares_case_unico`, Postgres 23505). A função deve
 * traduzir isso na mesma mensagem amigável da checagem prévia, nunca
 * repassar o erro cru do Postgres.
 */
describe("mensagemErroCriarNucleo — tradução da corrida real (unicidade no banco)", () => {
  it("traduz a violação do índice único parcial na mensagem amigável", () => {
    const erroPostgres = {
      code: "23505",
      message:
        'duplicate key value violates unique constraint "nucleos_familiares_case_unico"',
    };
    expect(mensagemErroCriarNucleo(erroPostgres)).toBe(
      "Este caso já tem um núcleo familiar ativo. Use o núcleo existente ou arquive-o antes de criar outro.",
    );
  });

  it("não disfarça uma violação de unicidade de outra constraint qualquer", () => {
    const outraViolacao = {
      code: "23505",
      message: 'duplicate key value violates unique constraint "leads_codigo_uidx"',
    };
    expect(mensagemErroCriarNucleo(outraViolacao)).toBe(outraViolacao.message);
  });

  it("repassa qualquer outro erro do banco sem reescrever", () => {
    const outroErro = { code: "42501", message: "permission denied for table nucleos_familiares" };
    expect(mensagemErroCriarNucleo(outroErro)).toBe(outroErro.message);
  });

  it("nunca lança — é uma função pura de tradução", () => {
    expect(() => mensagemErroCriarNucleo({})).not.toThrow();
    expect(mensagemErroCriarNucleo({})).toBe("Erro desconhecido ao criar núcleo.");
  });
});
