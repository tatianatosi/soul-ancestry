import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CLAUSULAS_APROVADAS_V2,
  CLAUSULAS_FIXAS,
  CLAUSULAS_FORA_DO_V2_APROVADO,
  DECISAO_CLAUSULAS_15_16,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
} from "@/lib/contrato-base-consolidado";

/**
 * Decisão da Proprietária, 03/10/2026: "Contrato da Ana correto é v2.0 com 14
 * cláusulas e já foi revisado e aprovado pelo jurídico."
 *
 * O que estava divergente, medido antes de corrigir:
 * - código: CONTRATO_BASE_VERSAO = "v1.0";
 * - banco (`contract_templates.default_clauses`): versao "v1.0",
 *   status "under_legal_review";
 * - documento canônico: já dizia v2.0, mas com status under_legal_review;
 * - código: 16 cláusulas, banco e documento: 14.
 */

describe("v2.0 vigente, com revisão jurídica concluída", () => {
  it("a versão do instrumento é v2.0", () => {
    expect(CONTRATO_BASE_VERSAO).toBe("v2.0");
  });

  it("o status é vigente, não em revisão jurídica", () => {
    expect(CONTRATO_BASE_STATUS).toBe("vigente");
  });

  it("o modelo de geração continua o mesmo — não se trocou o instrumento", () => {
    expect(CONTRATO_BASE_MODELO).toBe("MODELO-ESTUDO + BASE-GEN-V2");
  });

  it("o documento canônico registra a aprovação e não apaga o estado anterior", () => {
    const doc = readFileSync("docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md", "utf8");
    expect(doc).toMatch(/\*\*Versão:\*\* v2\.0/);
    expect(doc).toMatch(/revisão jurídica concluída/i);
    expect(doc).toMatch(/O status anterior era\s*\n?\s*`under_legal_review`/);
  });
});

describe("cláusulas aprovadas — 14 em 03/10, as 16 em 04/10", () => {
  /*
   * Decisão da Proprietária em 04/10/2026: "pode aprovar as demais cláusulas
   * de inadimplemento e rescisão". A decisão de 03/10 (14 cláusulas) fica
   * registrada como etapa anterior, não apagada.
   */
  it("o conjunto aprovado passa a ter as 16 cláusulas, Inadimplemento e Rescisão incluídas", () => {
    expect(CLAUSULAS_APROVADAS_V2).toHaveLength(16);
    expect(CLAUSULAS_APROVADAS_V2.map((c) => c.numero)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    expect(CLAUSULAS_APROVADAS_V2.map((c) => c.titulo)).toEqual(
      expect.arrayContaining(["Inadimplemento", "Rescisão"]),
    );
  });

  it("nenhuma cláusula do módulo fica fora do aprovado, e nada foi apagado", () => {
    expect(CLAUSULAS_FIXAS).toHaveLength(16);
    expect(CLAUSULAS_FORA_DO_V2_APROVADO).toEqual([]);
    for (const c of CLAUSULAS_FIXAS) expect(c.itens.length).toBeGreaterThan(0);
  });

  it("a aprovação de 15 e 16 está registrada com data e autoria", () => {
    expect(DECISAO_CLAUSULAS_15_16.aprovadoEm).toBe("2026-10-04");
    expect(DECISAO_CLAUSULAS_15_16.aprovadoPor).toBe("tati@pluggedresearch.com");
    expect([...DECISAO_CLAUSULAS_15_16.temas]).toEqual(["Inadimplemento", "Rescisão"]);
  });

  it("a numeração não foi deslocada: 15 e 16 seguem depois de Disposições finais", () => {
    expect(CLAUSULAS_FIXAS[13]?.titulo).toMatch(/Disposições finais/i);
    expect(CLAUSULAS_FIXAS[14]?.titulo).toBe("Inadimplemento");
    expect(CLAUSULAS_FIXAS[15]?.titulo).toBe("Rescisão");
  });

  it("o documento canônico continua sendo a fonte do texto das cláusulas A–N", () => {
    const doc = readFileSync("docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md", "utf8");
    expect(doc).toMatch(/\|\s*N\s*\|/);
    expect(doc).toMatch(/Inadimplemento/);
    expect(doc).toMatch(/Rescisão/);
  });
});

describe("vigência não autoriza ato externo", () => {
  it("o documento diz, em texto, que cobrança/assinatura/envio seguem com gate", () => {
    const doc = readFileSync("docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md", "utf8");
    expect(doc.replace(/\n> /g, " ")).toMatch(/Vigência não é, por si, autorização de ato externo/);
  });

  it("nenhuma cláusula foi reescrita neste corte: o texto continua vindo do módulo canônico", () => {
    const mod = readFileSync("src/lib/contrato-base-consolidado.ts", "utf8");
    expect(mod).toMatch(/CLAUSULAS_APROVADAS_V2 = CLAUSULAS_FIXAS\.filter/);
    expect(mod).toMatch(/texto jurídico não se apaga/);
  });
});
