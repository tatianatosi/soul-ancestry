import { describe, expect, it } from "vitest";

import {
  AVISO_VIGENTE,
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

  it("renderiza as 16 seções publicadas (14 originais + 15/16 de 07/09/2026)", () => {
    expect(doc.secoes).toHaveLength(16);
    expect(doc.secoes.map((s) => s.secao)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
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
      // 03/10/2026 — v2.0 aprovado pelo jurídico, por decisão da Proprietária.
      expect(s.versao).toBe("v2.0");
      expect(s.equivalenciaMatriz.length).toBeGreaterThan(0);
      expect(s.estadoVigencia).toBe("vigente");
    }
  });

  it("28/08/2026 — cabeçalho traz status vigente e aviso explícito, revisão jurídica concluída", () => {
    expect(doc.status).toBe("vigente");
    expect(doc.aviso).toBe(AVISO_VIGENTE);
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

  it("vigente habilita ações externas (assinatura), dentro dos demais gates do caso", () => {
    expect(acoesExternasHabilitadas()).toBe(true);
  });
});
