import { describe, expect, it } from "vitest";
import { diagnosticarVersaoContratual } from "@/lib/versao-contratual-vazia";

/**
 * A regra antiga era `vazia = clausulas === 0`, e marcava como vazia uma versão
 * correta: `clausulas` guarda só overrides por contrato, que ficam vazios quando
 * o instrumento usa o texto do modelo aprovado sem alterar nada.
 */

const v1Vazia = {
  version_number: 1,
  status: "working",
  created_at: "2026-08-21T15:14:00Z",
  generated_content: {
    contrato: {
      contract_type: "contract_base",
      title: "Contrato-base familiar — Silveira / Friedmann-Reimer (Áustria)",
    },
    clausulas: [],
    escopo: [],
  },
};

const v2Correta = {
  version_number: 2,
  status: "working",
  created_at: "2026-10-09T14:45:00Z",
  generated_content: {
    contrato: {
      contract_type: "contract_base",
      title: "Contrato de Estudo Genealógico v2 — Silveira / Friedmann-Reimer (Áustria)",
    },
    clausulas: [],
    escopo: new Array(21).fill({ title: "item" }),
    html: "<section><h2>Cláusulas indicadas</h2><p>Cláusula 1 …</p></section>",
  },
};

describe("versão vazia × versão sem override", () => {
  it("a v1 de 21/08 continua sendo diagnosticada como vazia", () => {
    const d = diagnosticarVersaoContratual(v1Vazia);
    expect(d.vazia).toBe(true);
    expect(d.anteriorAoGerador).toBe(true);
    expect(d.acao).toBeTruthy();
  });

  it("a v2 regenerada NÃO é vazia, mesmo com zero override de cláusula", () => {
    const d = diagnosticarVersaoContratual(v2Correta);
    expect(d.vazia).toBe(false);
    expect(d.acao).toBeNull();
  });

  it("escopo preenchido sem html e sem override também não é 'vazia'", () => {
    const d = diagnosticarVersaoContratual({
      ...v2Correta,
      generated_content: { ...v2Correta.generated_content, html: undefined },
    });
    expect(d.vazia).toBe(false);
  });

  it("sem override, sem html e sem escopo, é vazia", () => {
    const d = diagnosticarVersaoContratual({
      version_number: 3,
      created_at: "2026-10-09T00:00:00Z",
      generated_content: { contrato: {}, clausulas: [], escopo: [] },
    });
    expect(d.vazia).toBe(true);
  });

  it("sem versão nenhuma, não inventa diagnóstico", () => {
    expect(diagnosticarVersaoContratual(null).vazia).toBe(false);
  });

  /*
   * Esta asserção estava invertida quando foi escrita, mais cedo em 09/10/2026:
   * ela exigia que a v2 CORRETA fosse sinalizada como contrato-base. O motivo
   * olhava `contract_type`, cujo CHECK só admite `contract_base`,
   * `contract_complement` e `amendment` — então `contract_base` é o único
   * valor válido para o instrumento principal e o sinal disparava em todos os
   * contratos-base, sempre. Quem distingue é o título.
   */
  it("o título 'Contrato-base familiar' da v1 é sinalizado como motivo", () => {
    const d = diagnosticarVersaoContratual(v1Vazia);
    expect(d.motivos.some((m) => /contrato-base/i.test(m))).toBe(true);
  });

  it("a v2 com título próprio NÃO é sinalizada como contrato-base, apesar de contract_type='contract_base'", () => {
    const d = diagnosticarVersaoContratual(v2Correta);
    expect(d.tipoDeclarado).toBe("contract_base");
    expect(d.motivos.some((m) => /contrato-base/i.test(m))).toBe(false);
    expect(d.vazia).toBe(false);
  });

  it("contract_type sozinho nunca basta para acusar contrato-base", () => {
    const d = diagnosticarVersaoContratual({
      version_number: 4,
      created_at: "2026-10-09T00:00:00Z",
      generated_content: {
        contrato: { contract_type: "contract_base", title: "Contrato de Estudo Genealógico v2" },
        clausulas: [],
        escopo: new Array(3).fill({ title: "item" }),
        html: "<p>Cláusula 1 …</p>",
      },
    });
    expect(d.motivos.some((m) => /contrato-base/i.test(m))).toBe(false);
  });
});
