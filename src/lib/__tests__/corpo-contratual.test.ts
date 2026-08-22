import { describe, expect, it } from "vitest";

import {
  CORPO_CONTRATUAL_VERSAO,
  PREENCHIMENTO_FICHA,
  TEMAS_TEXTO_FIXO,
  montarCorpoContratual,
  temasSemTextoVersionado,
  violacoesCorpoPorCaso,
} from "@/lib/corpo-contratual";

describe("corpo contratual versionado", () => {
  it("cobre os 14 temas exigidos de texto fixo", () => {
    expect(TEMAS_TEXTO_FIXO).toHaveLength(14);
    expect(new Set(TEMAS_TEXTO_FIXO.map((t) => t.id)).size).toBe(14);
  });

  it("todo tema tem texto versionado no contrato-base e âncora na matriz", () => {
    expect(temasSemTextoVersionado()).toEqual([]);
    const corpo = montarCorpoContratual();
    for (const bloco of corpo.blocos) {
      expect(bloco.clausulas.length).toBeGreaterThan(0);
      expect(bloco.textoFixo).toBe(true);
      expect(bloco.origem).toContain("MODELO-ESTUDO + BASE-GEN-V2");
    }
  });

  it("preâmbulo e versão vêm do contrato-base, não do caso", () => {
    const corpo = montarCorpoContratual();
    expect(corpo.versao).toBe(CORPO_CONTRATUAL_VERSAO);
    expect(corpo.preambulo).toContain("Perfil Institucional vigente");
    expect(corpo.status).toBe("under_legal_review");
  });

  it("a ficha só preenche os sete grupos autorizados", () => {
    expect(PREENCHIMENTO_FICHA.map((p) => p.grupo)).toEqual([
      "Partes",
      "Serviço/escopo",
      "Entrega",
      "Comercial",
      "Anexos",
      "Prazo",
      "Referências",
    ]);
    const grupos = new Set(PREENCHIMENTO_FICHA.map((p) => p.grupo));
    for (const tema of TEMAS_TEXTO_FIXO) {
      for (const g of tema.preenchidoPelaFicha) expect(grupos.has(g as never)).toBe(true);
    }
  });

  it("texto livre de cláusula por caso é recusado", () => {
    expect(violacoesCorpoPorCaso({ clausulaId: "G", textoLivre: "Garantimos a cidadania." })).toHaveLength(1);
    expect(violacoesCorpoPorCaso({ clausulaId: "G", textoLivre: "" })).toEqual([]);
    expect(violacoesCorpoPorCaso({ clausulaId: "G" })).toEqual([]);
  });

  it("temas institucionais não são parametrizáveis por caso", () => {
    const corpo = montarCorpoContratual();
    const institucionais = ["T01", "T03", "T04", "T05", "T06", "T12"];
    for (const id of institucionais) {
      const bloco = corpo.blocos.find((b) => b.tema.id === id)!;
      expect(bloco.editavelPorCaso).toBe(false);
      expect(bloco.tema.preenchidoPelaFicha).toEqual([]);
    }
  });
});
