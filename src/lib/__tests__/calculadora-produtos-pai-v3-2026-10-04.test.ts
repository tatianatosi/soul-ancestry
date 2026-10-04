import { describe, expect, it } from "vitest";

import {
  PRODUTOS_PAI_JORNADA,
  VALOR_NAO_CADASTRADO,
  calcularOrcamentoProdutoPai,
  produtoPaiDaJornada,
  semValorCadastrado,
  type ProcessoDoPais,
} from "@/lib/orcamento-produtos-pai";

/**
 * Executa os quatro cenários de teste do documento v3.0 da Proprietária
 * ("Calculadora de Orçamento por Produto-Pai e Tabela de Preços Vigente",
 * 04/10/2026, §7), que o próprio documento diz não ter podido rodar: "as
 * fórmulas da planilha não puderam ser recalculadas neste ambiente (o
 * LibreOffice não abriu nenhum arquivo); a lógica foi conferida por leitura e
 * por conta manual".
 *
 * Aqui elas rodam de verdade, contra a tabela de preços que ela declarou
 * vigente hoje.
 */

const PAIS = (p: Partial<ProcessoDoPais> & { pais: string }): ProcessoDoPais => ({
  honorarios: null,
  despesas_terceiros: null,
  taxas_oficiais: null,
  outros: 0,
  parcelas: null,
  ...p,
});

/** Tabela vigente do v3.0 §4, como está gravada em price_catalog_rescued. */
const DE = PAIS({ pais: "DE", honorarios: 4200, despesas_terceiros: 1500, taxas_oficiais: 500, parcelas: 6 });
const IT = PAIS({ pais: "IT", honorarios: 4700, despesas_terceiros: 1600, taxas_oficiais: 500, parcelas: 6 });
const AT = PAIS({ pais: "AT", honorarios: 4800, despesas_terceiros: 1800, taxas_oficiais: 600, parcelas: 10 });
const HU = PAIS({ pais: "HU", outros: null, parcelas: 6 });

describe("§7 — os quatro cenários de teste do v3.0", () => {
  it("Alemanha, processo completo: R$ 6.200 em 6 parcelas de R$ 1.033,33", () => {
    const o = calcularOrcamentoProdutoPai({ produtoPaiPrincipal: "CA-PROT-001", principal: DE });
    expect(o.totalFinal).toBe(6200);
    expect(o.componentes).toEqual({ honorarios: 4200, despesas_terceiros: 1500, taxas_oficiais: 500, outros: 0 });
    expect(o.parcelas).toBe(6);
    expect(o.valorDaParcela).toBe(1033.33);
    expect(o.sinal).toBeNull();
  });

  it("Itália + Alemanha, sem redução: R$ 13.000", () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-001",
      principal: IT,
      trilhasAdicionais: [{ processo: DE, reducaoBaseCompartilhada: 0 }],
    });
    expect(o.totalFinal).toBe(13000);
    expect(o.reducoesAplicadas).toEqual([]);
  });

  it("Ana Luiza (Áustria): total final R$ 9.600, ignorando a referência de R$ 7.200", () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-001",
      principal: AT,
      condicaoParticular: {
        valor: 9600,
        moeda: "BRL",
        motivo: "Pacote familiar aprovado — 3 responsáveis × R$ 320 × 10 meses",
      },
    });
    expect(o.totalReferencia).toBe(7200);
    expect(o.totalFinal).toBe(9600);
    expect(o.parcelas).toBe(10);
    expect(o.valorDaParcela).toBe(960);
    expect(o.avisos.join(" ")).toContain("fica só para auditoria");
  });

  it("Hungria sem valores: total 0 com alerta VALOR_NAO_CADASTRADO", () => {
    const o = calcularOrcamentoProdutoPai({ produtoPaiPrincipal: "CA-PROT-001", principal: HU });
    expect(o.sinal).toBe(VALOR_NAO_CADASTRADO);
    expect(o.totalFinal).toBe(0);
    expect(o.valorDaParcela).toBeNull();
    expect(o.avisos.join(" ")).toContain("sem valor de processo cadastrado");
  });
});

describe("base de pesquisa compartilhada — cobrada uma vez, redução só com aprovação", () => {
  it("redução sem aprovador registrado é recusada e dita", () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-001",
      principal: IT,
      trilhasAdicionais: [{ processo: DE, reducaoBaseCompartilhada: 1500 }],
    });
    expect(o.reducoesAplicadas).toEqual([]);
    expect(o.reducoesRecusadas[0]!.motivo).toContain("aprovação registrada");
    expect(o.totalFinal).toBe(13000);
  });

  it("com aprovador registrado, a redução entra e sai do total", () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-001",
      principal: IT,
      trilhasAdicionais: [
        { processo: DE, reducaoBaseCompartilhada: 1500, reducaoAprovadaPor: "tati@pluggedresearch.com" },
      ],
    });
    expect(o.reducoesAplicadas).toHaveLength(1);
    expect(o.totalFinal).toBe(11500);
  });
});

describe("módulos, participantes e descontos", () => {
  it("módulo com valor entra por quantidade; módulo sem valor fica fora e é declarado", () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-001",
      principal: IT,
      modulos: [
        { produtoPai: "CA-DOC-002", nome: "Pasta + checklist", pais: "IT", valor: 390, quantidade: 2 },
        { produtoPai: "CA-DOC-005", nome: "Tradução e apostilamento", pais: "IT", valor: null, quantidade: 1 },
      ],
    });
    expect(o.totalFinal).toBe(6800 + 780);
    expect(o.avisos.join(" ")).toContain("sem valor cadastrado e ficou fora da soma");
  });

  it("participante adicional (CA-PROT-003) soma por quantidade", () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-003",
      principal: IT,
      participantesAdicionais: { valor: 990, quantidade: 2 },
    });
    expect(o.totalFinal).toBe(6800 + 1980);
  });

  it("desconto sem motivo não é aplicado", () => {
    const o = calcularOrcamentoProdutoPai({ produtoPaiPrincipal: "CA-PROT-001", principal: DE, descontoAprovado: 500 });
    expect(o.descontoAprovado).toBe(0);
    expect(o.totalFinal).toBe(6200);
    expect(o.avisos.join(" ")).toContain("sem motivo registrado");
  });

  it("desconto com motivo sai do total, e também da condição particular", () => {
    const comum = { produtoPaiPrincipal: "CA-PROT-001", descontoAprovado: 200, descontoMotivo: "ajuste aprovado" } as const;
    expect(calcularOrcamentoProdutoPai({ ...comum, principal: DE }).totalFinal).toBe(6000);
    expect(
      calcularOrcamentoProdutoPai({
        ...comum,
        principal: AT,
        condicaoParticular: { valor: 9600, moeda: "BRL", motivo: "pacote familiar" },
      }).totalFinal,
    ).toBe(9400);
  });
});

describe("regras herdadas que a calculadora não pode quebrar", () => {
  it('"Europa geral" é marcada como fora da calculadora', () => {
    const o = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: "CA-PROT-001",
      principal: PAIS({ pais: "EU", honorarios: 3500, despesas_terceiros: 1400, taxas_oficiais: 500 }),
    });
    expect(o.avisos.join(" ")).toContain("fica fora da calculadora");
  });

  it("os quatro componentes nunca são fundidos num número só", () => {
    const o = calcularOrcamentoProdutoPai({ produtoPaiPrincipal: "CA-PROT-001", principal: AT });
    expect(Object.keys(o.componentes)).toEqual(["honorarios", "despesas_terceiros", "taxas_oficiais", "outros"]);
    expect(o.componentes.honorarios + o.componentes.despesas_terceiros + o.componentes.taxas_oficiais).toBe(7200);
  });

  it("o vocabulário é o do produto-pai, com as 7 jornadas do v3.0 §2", () => {
    expect(produtoPaiDaJornada("CA-DIAG-002")?.nome).toBe("Diagnóstico Familiar Multipaís");
    expect(produtoPaiDaJornada("PP-01")).toBeNull();
    const jornadas = [...new Set(PRODUTOS_PAI_JORNADA.map((p) => p.jornada))];
    expect(jornadas).toHaveLength(7);
    for (const p of PRODUTOS_PAI_JORNADA) expect(p.codigo).toMatch(/^CA-(DIAG|PESQ|DOC|PROT|POS|MEM|ASS)-\d{3}$/);
  });

  it("país sem nenhum componente é reconhecido como sem valor, não como zero", () => {
    expect(semValorCadastrado(HU)).toBe(true);
    expect(semValorCadastrado(DE)).toBe(false);
  });

  it("não há leitura de SKU, Planilha Mestre nem OPS nesta camada", () => {
    const fonte = JSON.stringify(Object.keys(calcularOrcamentoProdutoPai({ produtoPaiPrincipal: "x", principal: DE })));
    expect(fonte).not.toContain("sku");
    expect(fonte).not.toContain("planilha");
  });
});
