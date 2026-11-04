import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
import { validarContatoParte } from "./contratos.functions";

describe("C01 validação da parte no servidor", () => {
  it("recusa CPF inválido", () => {
    expect(() => validarContatoParte({ document_type: "cpf", document_number: "111.111.111-11" })).toThrow("CPF");
  });
  it("recusa e-mail inválido", () => {
    expect(() => validarContatoParte({ email: "ana@" })).toThrow("E-mail");
  });
  it("normaliza e-mail válido", () => {
    const s: Record<string, unknown> = { email: " Ana@Exemplo.com " };
    validarContatoParte(s);
    expect(s.email).toBe("ana@exemplo.com");
  });
});
