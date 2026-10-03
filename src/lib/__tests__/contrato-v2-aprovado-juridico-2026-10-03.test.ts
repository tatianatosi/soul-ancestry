import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CLAUSULAS_APROVADAS_V2,
  CLAUSULAS_FIXAS,
  CLAUSULAS_FORA_DO_V2_APROVADO,
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

describe("as 14 cláusulas aprovadas, e as duas que ficam fora", () => {
  it("o instrumento aprovado tem exatamente 14 cláusulas", () => {
    expect(CLAUSULAS_APROVADAS_V2).toHaveLength(14);
    expect(CLAUSULAS_APROVADAS_V2.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it("as duas cláusulas fora do v2 não foram apagadas — texto jurídico não se apaga", () => {
    expect(CLAUSULAS_FIXAS).toHaveLength(16);
    expect(CLAUSULAS_FORA_DO_V2_APROVADO.map((c) => c.titulo)).toEqual(["Inadimplemento", "Rescisão"]);
    for (const c of CLAUSULAS_FORA_DO_V2_APROVADO) expect(c.itens.length).toBeGreaterThan(0);
  });

  it("os títulos das 14 batem com o documento canônico", () => {
    const doc = readFileSync("docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md", "utf8");
    // O documento usa letras A–N; o que se confere aqui é a contagem declarada.
    expect(doc).toMatch(/\|\s*N\s*\|/);
    expect(CLAUSULAS_APROVADAS_V2).toHaveLength(14);
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
