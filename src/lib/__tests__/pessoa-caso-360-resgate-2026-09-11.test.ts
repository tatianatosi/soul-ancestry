import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const pessoaFn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
const pessoaPg = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
const casoPg = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("Pessoa 360 × Caso 360 — resgate operacional 2026-09-11", () => {
  it("Pessoa carrega próxima ação canônica em lote", () => {
    expect(pessoaFn).toContain('rpc("proxima_acao_prioritaria_lote"');
    expect(pessoaFn).toContain("proxima_acao_responsavel");
    expect(pessoaFn).toContain("proximaAcaoCanonica");
  });

  it("Pessoa 360 exibe próxima ação e links de formalização/jornada", () => {
    expect(pessoaPg).toContain("obterProximaAcaoCanonica");
    expect(pessoaPg).toContain("Formalização");
    expect(pessoaPg).toContain("/casos/$caseId/contrato/preparar");
    expect(pessoaPg).toContain("Abrir Caso 360");
  });

  it("Caso 360 liga de volta para Pessoa 360", () => {
    expect(casoPg).toContain("Abrir Pessoa 360");
    expect(casoPg).toContain('to="/pessoas/$clienteId"');
  });
});
