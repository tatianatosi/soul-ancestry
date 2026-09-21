import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * de-para-pessoa-unificada.md, item 4 (`case_members`), ponto 3: "e-mail
 * cru" e "estado civil cru (<Texto> livre — mesmo conceito é lista fechada
 * em clientes/pessoas.$clienteId.tsx)" na ficha do caso
 * (casos.$caseId.index.tsx, aba Pessoas). Mesmo mecanismo já usado no
 * Corte U1 (tipo="email") e mesmos 5 valores já usados em
 * pessoas.$clienteId.tsx para estado civil — sem inventar validador novo,
 * sem alterar o schema de `case_members` (continua coluna `text`, sem
 * check novo).
 */

const casoTsx = readFileSync(
  "src/routes/_authenticated/casos.$caseId.index.tsx",
  "utf8",
);
const casoFichaTs = readFileSync("src/lib/caso-ficha.ts", "utf8");

describe("caso-ficha.ts — ESTADO_CIVIL canônico", () => {
  it("define os mesmos 5 valores já usados em pessoas.$clienteId.tsx", () => {
    expect(casoFichaTs).toContain("export const ESTADO_CIVIL: Opcao[]");
    for (const valor of ["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]) {
      expect(casoFichaTs).toContain(`valor: "${valor}"`);
    }
  });
});

describe("Ficha do caso — aba Pessoas (case_members): e-mail e estado civil", () => {
  it("importa ESTADO_CIVIL de @/lib/caso-ficha", () => {
    expect(casoTsx).toMatch(/import\s*{[^}]*ESTADO_CIVIL[^}]*}\s*from\s*"@\/lib\/caso-ficha"/);
  });

  it("campo E-mail usa tipo=email (mesmo mecanismo do Corte U1)", () => {
    expect(casoTsx).toContain('label="E-mail"\n          tipo="email"');
  });

  it("campo Estado civil virou Selecao com a lista fechada, não <Texto> livre", () => {
    expect(casoTsx).toContain('label="Estado civil"\n          valor={v("estado_civil")}\n          opcoes={ESTADO_CIVIL}');
  });

  it("CPF/CEP/telefone continuam com as máscaras já existentes (não regrediu o corte anterior)", () => {
    expect(casoTsx).toContain('onChange={(x) => set("cpf", formatarCpf(x))}');
    expect(casoTsx).toContain('onChange={(x) => set("cep", formatarCep(x))}');
    expect(casoTsx).toContain('onChange={(x) => set("telefone", formatarTelefone(x))}');
  });
});
