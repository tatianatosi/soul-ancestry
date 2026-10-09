import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  CAMPO_CHECKLIST_PARA_CLIENTE,
  resolvivelPelaPessoa360,
  valorCanonicoDoCampo,
} from "@/lib/cadastro-checklist";

/**
 * Bug medido no caso da Ana (CA-CID-AT-FAM-2026-001) em 09/10/2026 e
 * reportado com print: a aba "Pessoa e família" listava
 * "Ana Luiza · CPF: não informado", "Adair · RG: não informado",
 * "Adair · Endereço completo: não informado" — e o contrato ficava travado.
 *
 * Mas o dado ESTÁ no banco. Medido em `clientes`:
 *   Ana   — CPF ✓ RG ✓ endereço ✓ CEP ✓ telefone ✓ e-mail ✓ estado civil ✓
 *   Adair — CPF ✓ RG ✓ endereço ✓ telefone ✓ e-mail ✓ (sem CEP)
 *   Alice — endereço ✓ telefone ✓ e-mail ✓ (sem CPF, sem RG)
 *
 * Causa: `semearChecklistCadastral` criava TODA linha como "pendente" e
 * nunca consultava a pessoa canônica, mesmo já conhecendo o `cliente_id`.
 * E, como o upsert usa `ignoreDuplicates`, semear de novo jamais corrigiria
 * as linhas já criadas. A pendência era falsa.
 */

const ANA = {
  nome: "Ana Luiza Gomes Silveira Rodrigues",
  cpf: "000.000.000-00",
  rg_numero: "123456",
  profissao: null,
  estado_civil: "casada",
  endereco_logradouro: "Rua X",
  endereco_cidade: "São Paulo",
  endereco_uf: "SP",
  endereco_cep: "01000-000",
  telefone: "11999999999",
  email: "ana@exemplo.test",
};
const ALICE = { ...ANA, nome: "Alice", cpf: null, rg_numero: null, endereco_cep: null };

describe("o checklist lê a Pessoa 360 antes de dizer “não informado”", () => {
  it("campo com valor canônico é reconhecido", () => {
    for (const campo of ["nome_completo", "cpf", "rg", "estado_civil", "cep", "telefone", "email"]) {
      expect(valorCanonicoDoCampo(campo, ANA)).not.toBeNull();
    }
  });

  it("campo realmente vazio continua vazio — nada é inventado", () => {
    expect(valorCanonicoDoCampo("profissao", ANA)).toBeNull();
    expect(valorCanonicoDoCampo("cpf", ALICE)).toBeNull();
    expect(valorCanonicoDoCampo("rg", ALICE)).toBeNull();
    expect(valorCanonicoDoCampo("cep", ALICE)).toBeNull();
  });

  it("endereço exige logradouro, cidade e UF — endereço pela metade não conta", () => {
    expect(valorCanonicoDoCampo("endereco", ANA)).not.toBeNull();
    expect(valorCanonicoDoCampo("endereco", { ...ANA, endereco_uf: "" })).toBeNull();
    expect(valorCanonicoDoCampo("endereco", { ...ANA, endereco_cidade: null })).toBeNull();
  });

  it("sem pessoa canônica, nada é resolvido", () => {
    expect(valorCanonicoDoCampo("cpf", null)).toBeNull();
    expect(resolvivelPelaPessoa360({ campo: "cpf", status: "pendente", cliente_id: null }, ANA)).toBe(false);
    expect(resolvivelPelaPessoa360({ campo: "cpf", status: "pendente", cliente_id: "c1" }, null)).toBe(false);
  });

  it("o de-para não inventa coluna: endereço fica fora, por ser composto", () => {
    expect(CAMPO_CHECKLIST_PARA_CLIENTE["endereco"]).toBeUndefined();
    expect(CAMPO_CHECKLIST_PARA_CLIENTE["cpf"]).toBe("cpf");
    expect(CAMPO_CHECKLIST_PARA_CLIENTE["rg"]).toBe("rg_numero");
  });
});

describe("decisão humana registrada nunca é sobrescrita", () => {
  const base = { campo: "cpf", cliente_id: "c1" };
  it("só linha pendente é resolvida", () => {
    expect(resolvivelPelaPessoa360({ ...base, status: "pendente" }, ANA)).toBe(true);
  });

  for (const status of ["verificado", "nao_aplicavel", "aguarda_fonte_societaria", "recusado"]) {
    it(`status "${status}" fica como está`, () => {
      expect(resolvivelPelaPessoa360({ ...base, status }, ANA)).toBe(false);
    });
  }

  it("pendente sem valor canônico continua pendente", () => {
    expect(resolvivelPelaPessoa360({ campo: "profissao", status: "pendente", cliente_id: "c1" }, ANA)).toBe(false);
  });
});

describe("a correção está nas duas pontas: semear e ler", () => {
  const fn = readFileSync("src/lib/cadastro-checklist.functions.ts", "utf8");

  it("a leitura reconcilia as linhas já criadas (ignoreDuplicates não as corrigiria)", () => {
    expect(fn).toContain("async function resolverPelaPessoa360");
    expect(fn).toContain("await resolverPelaPessoa360(");
    expect(fn).toContain("gravarComVerificacao");
  });

  it("a semeadura consulta a Pessoa 360 em vez de criar tudo pendente", () => {
    expect(fn).toContain("valorCanonicoDoCampo(c.campo, clientesCanonicos.get(String(p.cliente)))");
    expect(fn).toContain("resolvidoPelaPessoa");
  });

  it("grava só fonte já existente no vocabulário — nenhuma inventada", () => {
    expect(fn).toContain('fonte: "crm"');
  });
});
