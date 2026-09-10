import { describe, expect, it } from "vitest";

import { exigirTitularEFinalidadeSensivel } from "@/lib/documentos.server";

/*
 * Decisão da Proprietária (09/09/2026) — "documento é individual por
 * padrão": categoria sensível (identificação/certidão/documento civil ou
 * financeiro) exige titular explícito e finalidade registrada. Antes, sem
 * titular escolhido, o documento virava por padrão associado ao cliente
 * contratante do caso — não à pessoa real a quem o documento pertence.
 */
describe("exigirTitularEFinalidadeSensivel", () => {
  it("categoria sensível sem titular é recusada", () => {
    expect(() =>
      exigirTitularEFinalidadeSensivel({ categoria: "certidao", clienteId: null, finalidade: "instrução do processo" }),
    ).toThrow(/titular/i);
  });

  it("categoria sensível com titular mas sem finalidade é recusada", () => {
    expect(() =>
      exigirTitularEFinalidadeSensivel({ categoria: "identificacao", clienteId: "cliente-1", finalidade: "" }),
    ).toThrow(/finalidade/i);
  });

  it("categoria sensível com titular e finalidade passa", () => {
    expect(() =>
      exigirTitularEFinalidadeSensivel({
        categoria: "documento_civil",
        clienteId: "cliente-1",
        finalidade: "instrução do processo de cidadania",
      }),
    ).not.toThrow();
  });

  it("categoria não-sensível não exige titular nem finalidade", () => {
    expect(() =>
      exigirTitularEFinalidadeSensivel({ categoria: "contrato", clienteId: null, finalidade: null }),
    ).not.toThrow();
    expect(() =>
      exigirTitularEFinalidadeSensivel({ categoria: "interno", clienteId: undefined, finalidade: undefined }),
    ).not.toThrow();
  });

  it("todas as quatro categorias sensíveis exigem titular", () => {
    for (const categoria of ["identificacao", "certidao", "documento_civil", "documento_financeiro"]) {
      expect(() => exigirTitularEFinalidadeSensivel({ categoria, clienteId: null })).toThrow(/titular/i);
    }
  });
});
