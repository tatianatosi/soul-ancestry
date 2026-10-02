import { describe, expect, it } from "vitest";

import {
  dataValida,
  enderecoCampoValido,
  formatarDataBr,
  nomeValido,
} from "@/lib/validacao-pessoa";

/**
 * Corte MÁSCARAS (02/10/2026) — nome, data de nascimento e endereço não
 * tinham validador nenhum no repo (confirmado por grep antes do corte).
 * Aqui travamos o comportamento: recusa só o comprovadamente inválido,
 * nunca barra formato legítimo de nome composto.
 */
describe("nomeValido", () => {
  it("recusa vazio, 1 caractere e dígito", () => {
    expect(nomeValido("")).toBe(false);
    expect(nomeValido("A")).toBe(false);
    expect(nomeValido("Ana2")).toBe(false);
  });

  it("aceita nome composto, partícula, acento, apóstrofo e hífen", () => {
    expect(nomeValido("Ana Luiza")).toBe(true);
    expect(nomeValido("Maria de Souza")).toBe(true);
    expect(nomeValido("José")).toBe(true);
    expect(nomeValido("D'Ávila")).toBe(true);
    expect(nomeValido("Maria-Clara")).toBe(true);
  });
});

describe("formatarDataBr / dataValida", () => {
  it("formata progressivamente DD/MM/AAAA", () => {
    expect(formatarDataBr("01011990")).toBe("01/01/1990");
    expect(formatarDataBr("0101")).toBe("01/01");
  });

  it("aceita DD/MM/AAAA e ISO válidos", () => {
    expect(dataValida("15/06/1990")).toBe(true);
    expect(dataValida("1990-06-15")).toBe(true);
  });

  it("recusa data futura, dia/mês inexistente e ano implausível", () => {
    const futuro = new Date();
    futuro.setFullYear(futuro.getFullYear() + 1);
    const bf = `${String(futuro.getDate()).padStart(2, "0")}/${String(futuro.getMonth() + 1).padStart(2, "0")}/${futuro.getFullYear()}`;
    expect(dataValida(bf)).toBe(false);
    expect(dataValida("31/02/1990")).toBe(false);
    expect(dataValida("01/01/1899")).toBe(false);
    expect(dataValida("")).toBe(false);
  });

  it("permitirFutura libera data futura quando explicitamente pedido", () => {
    const futuro = new Date();
    futuro.setFullYear(futuro.getFullYear() + 1);
    const bf = `${String(futuro.getDate()).padStart(2, "0")}/${String(futuro.getMonth() + 1).padStart(2, "0")}/${futuro.getFullYear()}`;
    expect(dataValida(bf, { permitirFutura: true })).toBe(true);
  });
});

describe("enderecoCampoValido", () => {
  it("recusa campo vazio", () => {
    expect(enderecoCampoValido("logradouro", "")).toBe(false);
    expect(enderecoCampoValido("cidade", "   ")).toBe(false);
  });

  it("número exige dígito ou S/N", () => {
    expect(enderecoCampoValido("numero", "123")).toBe(true);
    expect(enderecoCampoValido("numero", "S/N")).toBe(true);
    expect(enderecoCampoValido("numero", "sn")).toBe(true);
    expect(enderecoCampoValido("numero", "abc")).toBe(false);
  });

  it("logradouro/bairro/cidade só exigem não-vazio", () => {
    expect(enderecoCampoValido("logradouro", "Rua das Flores")).toBe(true);
    expect(enderecoCampoValido("bairro", "Centro")).toBe(true);
  });
});
