import { describe, expect, it } from "vitest";

import { REGRAS_BLOQUEIO, bloqueiosResolutivos, temBloqueioImpeditivo } from "@/lib/bloqueios-dicionario";

describe("bloqueios-dicionario — escopo_proposta", () => {
  it("tem regra própria, não cai no fallback genérico (achado real: bloqueava sem explicação nem âncora)", () => {
    expect(REGRAS_BLOQUEIO.escopo_proposta).toBeDefined();
    expect(REGRAS_BLOQUEIO.escopo_proposta.impeditivo).toBe(true);
    expect(REGRAS_BLOQUEIO.escopo_proposta.ancora).toBe("canva");
  });

  it("bloqueiosResolutivos devolve título legível e leva para a seção Canva, não para 'ficha'", () => {
    const [resolvido] = bloqueiosResolutivos(
      [{ chave: "escopo_proposta", motivo: "Proposta Canva: Páginas 1–7 incompletas: faltam 5, 6, 7." }],
      [],
    );
    expect(resolvido.titulo).not.toBe("escopo_proposta");
    expect(resolvido.ancora).toBe("canva");
    expect(resolvido.motivo).toContain("Páginas 1–7 incompletas");
    expect(temBloqueioImpeditivo([resolvido])).toBe(true);
  });
});
