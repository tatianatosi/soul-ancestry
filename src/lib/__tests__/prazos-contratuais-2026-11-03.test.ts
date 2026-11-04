import { describe, expect, it } from "vitest";
import { alertasDoContrato, diasRestantes, estadoPrazo, proximoVencimento } from "@/lib/prazos-contratuais";

const HOJE = new Date(2026, 10, 3); // 03/11/2026

describe("prazos contratuais", () => {
  it("conta dias restantes até a validade da proposta da Ana", () => {
    expect(diasRestantes("2026-11-30", HOJE)).toBe(27);
    expect(estadoPrazo("2026-11-30", HOJE)).toBe("futuro");
  });
  it("marca hoje", () => expect(estadoPrazo("2026-11-03", HOJE)).toBe("hoje"));
  it("marca expirado", () => {
    expect(diasRestantes("2026-10-30", HOJE)).toBe(-4);
    expect(estadoPrazo("2026-10-30", HOJE)).toBe("expirado");
  });
  it("sem data não inventa prazo", () => {
    expect(diasRestantes(null, HOJE)).toBeNull();
    expect(estadoPrazo("", HOJE)).toBe("sem_data");
  });
  it("fatura paga não gera lembrete", () => {
    const f = [{ id: "a", status: "paga", valor: 320, valor_pago: 320, vencimento: "2026-10-01" }];
    expect(proximoVencimento(f)).toBeNull();
    expect(alertasDoContrato({ validadeProposta: null, fimVigencia: null, faturas: f, hoje: HOJE })).toEqual([]);
  });
  it("previsão sem fatura registrada não vira dívida", () => {
    expect(alertasDoContrato({ validadeProposta: "2026-11-30", fimVigencia: null, faturas: [], hoje: HOJE })).toEqual([]);
  });
  it("usa a próxima fatura real não paga", () => {
    const f = [
      { id: "x", status: "aberta", valor: 320, valor_pago: 0, vencimento: "2026-12-10" },
      { id: "y", status: "aberta", valor: 320, valor_pago: 0, vencimento: "2026-11-10" },
      { id: "z", status: "aberta", valor: 320, valor_pago: 0, vencimento: null },
    ];
    expect(proximoVencimento(f)?.id).toBe("y");
  });
});
