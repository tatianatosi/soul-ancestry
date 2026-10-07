import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { CLAUSULAS_FIXAS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import {
  BLOCOS_QUE_INCORPORAM_ANEXO_I,
  TITULO_SECAO_ANEXO_I_INCORPORADO,
} from "@/lib/contrato-blocos-incorporados";

/**
 * Corte B / D1 (07/10/2026) — "Troca mínima das cláusulas 1.3, 2.2 e 7.1, pela
 * Ordem de Serviço e Proposta aprovada incorporadas ao contrato. AUTORIZADA em
 * 07/10." Só estes três trechos mudam; nenhuma cláusula nova.
 */

function item(numero: number, prefixo: string): string {
  const clausula = CLAUSULAS_FIXAS.find((c) => c.numero === numero)!;
  return clausula.itens.find((i) => i.startsWith(prefixo))!;
}

describe("as três trocas autorizadas", () => {
  it("1.3 cita Ordem de Serviço e Proposta incorporadas, e não lista mais anexos retirados", () => {
    const texto = item(1, "1.3.");
    expect(texto).toBe(
      "1.3. Este Contrato-Base é complementado, quando aplicável, pela Ordem de Serviço e pela Proposta Comercial aprovada, incorporadas a este contrato, e pelos demais anexos condicionais aplicáveis.",
    );
    expect(texto).not.toContain("Anexo de Escopo");
    expect(texto).not.toContain("Anexo de Privacidade e Dados");
    expect(texto).not.toContain("Anexo Comercial");
    expect(texto).not.toContain("Anexo Individual");
    expect(texto).not.toContain("Anexo de Representação");
  });

  it("2.2 troca o Anexo de Escopo pela Ordem de Serviço e Proposta aprovada", () => {
    const texto = item(2, "2.2.");
    expect(texto).toContain("expressamente previstas na Ordem de Serviço e na Proposta aprovada, incorporadas a este contrato");
    expect(texto).not.toContain("Anexo de Escopo");
  });

  it("7.1 troca o Anexo de Privacidade e Dados pela política de privacidade vigente", () => {
    const texto = item(7, "7.1.");
    expect(texto).toContain("a política de privacidade vigente");
    expect(texto).not.toContain("Anexo de Privacidade e Dados");
    expect(texto).toContain("Lei nº 13.709/2018");
  });
});

describe("o que NÃO muda", () => {
  it("o modelo continua v2.0 com 16 cláusulas", () => {
    expect(CONTRATO_BASE_VERSAO).toBe("v2.0");
    expect(CLAUSULAS_FIXAS).toHaveLength(16);
    expect(CLAUSULAS_FIXAS.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  it("nenhuma cláusula fixa menciona mais os anexos retirados", () => {
    const tudo = CLAUSULAS_FIXAS.flatMap((c) => c.itens).join(" ");
    expect(tudo).not.toContain("Anexo de Escopo");
    expect(tudo).not.toContain("Anexo de Privacidade e Dados");
  });

  it("as cláusulas 3 e 10, que citam o Anexo I, continuam existindo", () => {
    expect(CLAUSULAS_FIXAS.find((c) => c.numero === 3)).toBeDefined();
    expect(CLAUSULAS_FIXAS.find((c) => c.numero === 10)).toBeDefined();
  });

  it("a contagem de cláusulas na tela acompanha o motor — nenhuma superfície diz 14", () => {
    const governanca = readFileSync("src/routes/_authenticated/governanca.modelos-contratuais.tsx", "utf8");
    const leitor = readFileSync("src/components/contrato/contrato-base-leitor.tsx", "utf8");
    expect(governanca).not.toContain("14 cláusulas");
    expect(leitor).not.toContain("14 cláusulas");
    expect(governanca).toContain("16 cláusulas");
    expect(leitor).toContain("16 cláusulas");
  });
});

describe("Ordem de Serviço (Anexo I) com título próprio no corpo", () => {
  const renderer = readFileSync("src/lib/contrato-corpo.server.ts", "utf8");

  it("o título existe e nomeia o Anexo I como incorporado", () => {
    expect(TITULO_SECAO_ANEXO_I_INCORPORADO).toBe("Ordem de Serviço (Anexo I) — incorporada a este contrato");
  });

  it("o corpo renderiza os 5 blocos da Ordem de Serviço sob esse título", () => {
    expect(renderer).toContain("TITULO_SECAO_ANEXO_I_INCORPORADO");
    expect(renderer).toContain("BLOCOS_QUE_INCORPORAM_ANEXO_I");
    expect(BLOCOS_QUE_INCORPORAM_ANEXO_I).toEqual(["escopo_individual", "servicos", "entregas", "valor", "pagamento"]);
  });
});
