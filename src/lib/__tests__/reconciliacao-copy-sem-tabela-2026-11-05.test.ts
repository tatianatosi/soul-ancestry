import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** 05/11/2026: fluxo principal nunca exibe nome técnico de tabela — os painéis de conferência citavam "`clientes`". */
describe("Painéis de conferência de CPF, telefone e CEP sem nome de tabela", () => {
  for (const dado of ["cpf", "telefone", "cep"]) {
    it(dado, () => {
      const f = readFileSync(`src/components/caso/reconciliar-${dado}-membros-caso.tsx`, "utf8");
      expect(f).not.toContain("(`clientes`)");
      expect(f).toContain("pessoa cadastrada na Pessoa 360");
    });
  }
});
