import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  diagnosticarVersaoContratual,
  GERADOR_COM_CLAUSULAS_DESDE,
  versaoMaisRecente,
} from "@/lib/versao-contratual-vazia";

/**
 * Contrato da Ana (03/10/2026) — "o certo é o contrato estudo genealógico v2
 * completo já verificado pelo jurídico e não o contrato base".
 *
 * Conteúdo real da única versão da Ana, lido do banco em 03/10.
 */
const VERSAO_DA_ANA = {
  version_number: 1,
  status: "working",
  review_decision: "rejected",
  created_at: "2026-08-21T15:14:54.778675+00:00",
  generated_content: {
    anexos: [],
    clausulas: [],
    escopo: [],
    contrato: {
      contract_number: "2026-CB-0001",
      contract_type: "contract_base",
      title: "Contrato-base familiar — Silveira / Friedmann-Reimer (Áustria)",
    },
    selos: ["RASCUNHO INTERNO — NÃO ENVIAR / NÃO ASSINAR"],
  },
};

describe("a versão da Ana é diagnosticada como vazia, não como contrato", () => {
  const dg = diagnosticarVersaoContratual(VERSAO_DA_ANA);

  it("é reconhecida como vazia", () => {
    expect(dg.vazia).toBe(true);
  });

  it("diz que o conteúdo se declara contrato-base, não o v2", () => {
    expect(dg.motivos.join(" ")).toMatch(/contrato-base, não o Contrato de Estudo Genealógico v2/);
  });

  it("aponta a data: gerada antes do gerador ler as cláusulas do modelo", () => {
    expect(dg.anteriorAoGerador).toBe(true);
    expect(dg.motivos.join(" ")).toContain(GERADOR_COM_CLAUSULAS_DESDE);
  });

  it("diz o que fazer, e que nada é apagado", () => {
    expect(dg.acao).toMatch(/Salvar rascunho/);
    expect(dg.acao).toMatch(/nada é apagado/);
  });
});

describe("não dispara falso positivo", () => {
  it("versão com cláusulas não é vazia", () => {
    const dg = diagnosticarVersaoContratual({
      version_number: 2,
      created_at: "2026-10-03T10:00:00+00:00",
      generated_content: { clausulas: [{ numero: 1 }], escopo: [{ item: "x" }], contrato: { contract_type: "estudo_genealogico_v2" } },
    });
    expect(dg.vazia).toBe(false);
    expect(dg.acao).toBeNull();
  });

  it("sem versão nenhuma, não acusa nada — a tela já diz que não há rascunho", () => {
    expect(diagnosticarVersaoContratual(null).vazia).toBe(false);
  });

  it("pega sempre a versão mais recente pelo número", () => {
    const v = versaoMaisRecente([{ version_number: 1 }, { version_number: 3 }, { version_number: 2 }]);
    expect(v?.version_number).toBe(3);
  });
});

describe("o aviso aparece na tela do contrato", () => {
  const tela = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

  it("usa o diagnóstico e marca o bloco", () => {
    expect(tela).toMatch(/diagnosticarVersaoContratual/);
    expect(tela).toMatch(/data-versao-vazia/);
  });

  it("é aviso, não bloqueio: a geração continua disponível", () => {
    expect(tela).toMatch(/Salvar rascunho/);
    expect(tela).toMatch(/role="alert"/);
  });
});
