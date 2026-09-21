import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * CA-VALIDACAO-CPF-CEP (21/09/2026): `cpfValido`/`cepValido`
 * (validacao-pessoa.ts) existiam desde 31/08/2026 mas nunca eram chamados —
 * as duas telas onde CPF/CEP são editáveis (Pessoa 360 e Caso → aba Pessoas)
 * só aplicavam a máscara (formatarCpf/formatarCep), nunca a validação de
 * dígito/tamanho. Este teste garante que o botão de salvar em cada tela
 * checa os dois campos antes de gravar, e que o CPF já correto de U1/U2
 * (Corte U1) não foi tocado.
 */

const pessoa360 = readFileSync(
  path.resolve(__dirname, "../../routes/_authenticated/pessoas.$clienteId.tsx"),
  "utf-8",
);
const caso360 = readFileSync(
  path.resolve(__dirname, "../../routes/_authenticated/casos.$caseId.index.tsx"),
  "utf-8",
);

describe("Pessoa 360 (pessoas.$clienteId.tsx) — CPF/CEP validados antes de salvar", () => {
  it("importa cpfValido e cepValido", () => {
    expect(pessoa360).toMatch(/import\s*{[^}]*cpfValido[^}]*}\s*from\s*"@\/lib\/validacao-pessoa"/);
    expect(pessoa360).toMatch(/import\s*{[^}]*cepValido[^}]*}\s*from\s*"@\/lib\/validacao-pessoa"/);
  });

  it("bloqueia CPF preenchido e inválido antes de chamar mSalvar.mutate", () => {
    expect(pessoa360).toContain("if (form.cpf && form.cpf.trim() && !cpfValido(form.cpf))");
    expect(pessoa360).toContain("CPF inválido");
  });

  it("bloqueia CEP preenchido e inválido antes de chamar mSalvar.mutate", () => {
    expect(pessoa360).toContain(
      "if (form.endereco_cep && form.endereco_cep.trim() && !cepValido(form.endereco_cep))",
    );
    expect(pessoa360).toContain("CEP inválido");
  });

  it("o botão Salvar chama a validação, não mSalvar.mutate(form) direto", () => {
    expect(pessoa360).toContain("onClick={salvarComValidacao}");
    expect(pessoa360).not.toContain("onClick={() => mSalvar.mutate(form)}");
  });

  it("não alterou a máscara já existente (formatarCpf/formatarCep continuam ativas)", () => {
    expect(pessoa360).toContain('{ chave: "cpf", rotulo: "CPF", mascara: formatarCpf }');
    expect(pessoa360).toContain(
      '{ chave: "endereco_cep", rotulo: "Endereço — CEP", mascara: formatarCep }',
    );
  });
});

describe("Caso → aba Pessoas (casos.$caseId.index.tsx) — CPF/CEP validados antes de salvar", () => {
  it("importa cpfValido e cepValido", () => {
    expect(caso360).toMatch(/import\s*{[^}]*cpfValido[^}]*}\s*from\s*"@\/lib\/validacao-pessoa"/);
    expect(caso360).toMatch(/import\s*{[^}]*cepValido[^}]*}\s*from\s*"@\/lib\/validacao-pessoa"/);
  });

  it("bloqueia CPF preenchido e inválido antes de chamar m.mutate()", () => {
    expect(caso360).toContain("if (cpf.trim() && !cpfValido(cpf))");
    expect(caso360).toContain("CPF inválido");
  });

  it("bloqueia CEP preenchido e inválido antes de chamar m.mutate()", () => {
    expect(caso360).toContain("if (cep.trim() && !cepValido(cep))");
    expect(caso360).toContain("CEP inválido");
  });

  it("o botão Salvar pessoa chama a validação, não m.mutate() direto", () => {
    expect(caso360).toContain("onClick={salvarComValidacao}");
    expect(caso360).not.toContain("onClick={() => m.mutate()}");
  });

  it("não alterou a máscara já existente nos onChange de cpf/cep", () => {
    expect(caso360).toContain('onChange={(x) => set("cpf", formatarCpf(x))}');
    expect(caso360).toContain('onChange={(x) => set("cep", formatarCep(x))}');
  });
});
