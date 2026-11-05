import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * J05 (05/11/2026): painéis de reconciliação de CPF, telefone e CEP visíveis na Pessoa 360, reaproveitando os
 * mesmos painéis e conferências do Caso 360 — sem segundo escritor nem regra paralela.
 */
const comp = readFileSync("src/components/pessoa/reconciliacao-civil-pessoa.tsx", "utf8");
const pessoa = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

describe("J05 — reconciliação civil na Pessoa 360", () => {
  it("a Pessoa 360 monta o componente com os casos da pessoa e relê a pessoa depois de gravar", () => {
    expect(pessoa).toContain('from "@/components/pessoa/reconciliacao-civil-pessoa"');
    expect(pessoa).toMatch(/<ReconciliacaoCivilPessoa[\s\S]*?casos=\{casos\.map/);
    expect(pessoa).toContain('queryKey: ["pessoa", clienteId]');
  });

  it("reaproveita os três painéis e as três conferências existentes (sem escritor novo)", () => {
    for (const nome of ["ReconciliarCpfMembrosCaso", "ReconciliarTelefoneMembrosCaso", "ReconciliarCepMembrosCaso"]) {
      expect(comp).toContain(`<${nome} `);
    }
    for (const fn of [
      "conferirDivergenciaCpfMembrosCaso",
      "conferirDivergenciaTelefoneMembrosCaso",
      "conferirDivergenciaCepMembrosCaso",
    ]) {
      expect(comp).toContain(`useServerFn(${fn})`);
    }
    expect(comp).not.toMatch(/supabase\s*\.from\(/);
  });

  it("conflito só se resolve membro a membro com motivo; erro aparece; sem caso, vazio honesto", () => {
    expect(comp).toContain("resolverMembroId: v.membroId, motivo: v.motivo");
    expect(comp).toContain("onError: (e: Error) => toast.error(e.message)");
    expect(comp).toContain("ainda não participa de nenhum caso");
    expect(comp).toContain("key={caseId}");
  });
});
