import { describe, expect, it } from "vitest";

import {
  AVISO_UNDER_LEGAL_REVIEW,
  SELO_TEXTO_FIXO,
  acoesExternasHabilitadas,
  idSecaoContratoBase,
  lerContratoBase,
  letrasDaSecao,
  letrasSemSecaoPublicada,
} from "@/lib/contrato-base-leitor";
import { CLAUSULAS_MATRIZ } from "@/lib/matriz-clausulas";

describe("leitor do contrato-base", () => {
  const doc = lerContratoBase();

  it("renderiza as 14 seções publicadas", () => {
    expect(doc.secoes).toHaveLength(14);
    expect(doc.secoes.map((s) => s.secao)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it("cada seção tem texto não vazio, selo, versão e vínculo A–P", () => {
    for (const s of doc.secoes) {
      expect(s.paragrafos.length).toBeGreaterThan(0);
      const texto = s.paragrafos
        .flatMap((p) => p.itens)
        .join(" ")
        .trim();
      expect(texto.length).toBeGreaterThan(40);
      expect(s.selo).toBe(SELO_TEXTO_FIXO);
      expect(s.versao).toBe("v1.0");
      expect(s.equivalenciaMatriz.length).toBeGreaterThan(0);
      expect(s.estadoVigencia).toBe("under_legal_review");
    }
  });

  it("cabeçalho traz status under_legal_review e aviso explícito", () => {
    expect(doc.status).toBe("under_legal_review");
    expect(doc.aviso).toBe(AVISO_UNDER_LEGAL_REVIEW);
    expect(doc.titulo).toContain("Contrato-Base Consolidado v1.0");
  });

  it("a matriz cobre todas as cláusulas A–P e navega por âncora", () => {
    const cobertas = doc.secoes.flatMap((s) => letrasDaSecao(s.secao)).sort();
    expect(cobertas).toEqual(CLAUSULAS_MATRIZ.map((c) => c.id).sort());
    expect(letrasSemSecaoPublicada()).toEqual([]);
    for (const s of doc.secoes) expect(s.id).toBe(idSecaoContratoBase(s.secao));
  });

  it("não há seção ausente nesta versão", () => {
    expect(doc.erros).toEqual([]);
  });

  it("under_legal_review não habilita ações externas", () => {
    expect(acoesExternasHabilitadas()).toBe(false);
  });
});
