import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { despesaEsperadaDoItem } from "@/lib/dossie-58c";
import {
  calcularTetoDespesas,
  idDoItemPeloTitulo,
  paisIsoDoCaso,
  type AcaoParaTeto,
  type LinhaPrecoTeto,
} from "@/lib/teto-despesas-produto-pai";

/**
 * Corte C (31/10/2026): as planilhas de produtos-pai já estão no banco como
 * TETO de despesas e taxas por país, não custo por item do §58c. O painel só
 * mostra o teto e o confronta com o que o plano já aprovou: nunca reparte o
 * teto entre os itens.
 */

const AT: LinhaPrecoTeto[] = [
  {
    country_code: "AT",
    price_component: "despesas",
    amount: "1800.00",
    currency: "BRL",
    price_status: "VIGENTE",
  },
  {
    country_code: "AT",
    price_component: "taxas",
    amount: "600.00",
    currency: "BRL",
    price_status: "VIGENTE",
  },
  {
    country_code: "DE",
    price_component: "despesas",
    amount: "1500.00",
    currency: "BRL",
    price_status: "VIGENTE",
  },
];

const acao = (id: string, extra: Partial<AcaoParaTeto> = {}): AcaoParaTeto => ({
  titulo: `§58c ${id} — Documento`,
  custo: null,
  moeda: null,
  aprovacaoDespesa: "nao_submetida",
  ...extra,
});

describe("país do caso → código do catálogo", () => {
  it("usa a linha prioritária, depois o país, depois o contexto da pesquisa", () => {
    expect(paisIsoDoCaso({ linhaPrioritaria: "austria" })).toEqual({
      iso: "AT",
      origem: "linha_prioritaria",
    });
    expect(paisIsoDoCaso({ linhaPrioritaria: null, pais: "Áustria" })).toEqual({
      iso: "AT",
      origem: "pais",
    });
    expect(paisIsoDoCaso({ contextoPesquisa: "Áustria — § 58c StbG" })).toEqual({
      iso: "AT",
      origem: "contexto_pesquisa",
    });
  });

  it("multipaís e a definir não são país: seguem para a próxima fonte", () => {
    expect(paisIsoDoCaso({ linhaPrioritaria: "multipais", pais: "Portugal" })).toEqual({
      iso: "PT",
      origem: "pais",
    });
    expect(
      paisIsoDoCaso({ linhaPrioritaria: "a_definir", pais: null, contextoPesquisa: null }),
    ).toBeNull();
  });

  it("sem nenhuma fonte, devolve null — nunca chuta um país", () => {
    expect(paisIsoDoCaso({})).toBeNull();
  });
});

describe("cálculo do teto, do saldo e do contador", () => {
  const pais = { iso: "AT", origem: "linha_prioritaria" as const };

  it("soma despesas + taxas do país e só do país", () => {
    const r = calcularTetoDespesas({ pais, linhasPreco: AT, acoes: [] });
    expect(r).toMatchObject({
      estado: "ok",
      iso: "AT",
      moeda: "BRL",
      tetoDespesas: 1800,
      tetoTaxas: 600,
      tetoTotal: 2400,
    });
  });

  it("saldo = teto total − aprovadas com custo informado, na moeda do teto", () => {
    const r = calcularTetoDespesas({
      pais,
      linhasPreco: AT,
      acoes: [
        acao("2.1.heimatschein", { aprovacaoDespesa: "aprovada", custo: 500, moeda: "BRL" }),
        acao("2.1.nachweis", { aprovacaoDespesa: "aprovada", custo: 300, moeda: "BRL" }),
        acao("2.1.altmatrik", {
          aprovacaoDespesa: "aguardando_aprovacao",
          custo: 900,
          moeda: "BRL",
        }),
      ],
    });
    expect(r).toMatchObject({
      estado: "ok",
      aprovadoComCusto: 800,
      itensAprovadosComCusto: 2,
      saldo: 1600,
      excedido: false,
    });
  });

  it("marca o teto como excedido quando o aprovado passa do teto", () => {
    const r = calcularTetoDespesas({
      pais,
      linhasPreco: AT,
      acoes: [
        acao("2.1.heimatschein", { aprovacaoDespesa: "aprovada", custo: 2600, moeda: "BRL" }),
      ],
    });
    expect(r).toMatchObject({ estado: "ok", saldo: -200, excedido: true });
  });

  it("aprovado sem custo e aprovado em outra moeda não entram na soma, e são contados", () => {
    const r = calcularTetoDespesas({
      pais,
      linhasPreco: AT,
      acoes: [
        acao("2.1.heimatschein", { aprovacaoDespesa: "aprovada", custo: null }),
        acao("2.1.nachweis", { aprovacaoDespesa: "aprovada", custo: 100, moeda: "EUR" }),
        acao("2.1.altmatrik", { aprovacaoDespesa: "aprovada", custo: 100, moeda: null }),
      ],
    });
    expect(r).toMatchObject({
      estado: "ok",
      aprovadoComCusto: 0,
      aprovadosSemCusto: 1,
      aprovadosOutraMoeda: 2,
      saldo: 2400,
    });
  });

  it("conta quantos itens que esperam despesa ainda não têm custo estimado", () => {
    expect(despesaEsperadaDoItem("2.1.heimatschein")).toBe(true);
    expect(despesaEsperadaDoItem("3.2.arolsen")).toBe(false);
    expect(despesaEsperadaDoItem("nao.existe")).toBeNull();
    const r = calcularTetoDespesas({
      pais,
      linhasPreco: AT,
      acoes: [
        acao("2.1.heimatschein"), // espera despesa, sem custo
        acao("2.1.nachweis", { custo: 120, moeda: "BRL" }), // espera despesa, com custo
        acao("3.2.arolsen"), // não espera despesa
        acao("4.4.variantes_nome"), // interno, sem despesa
      ],
    });
    expect(r).toMatchObject({ estado: "ok", esperamCusto: 1 });
  });

  it("nunca reparte o teto: o custo por item continua nulo na entrada e na saída", () => {
    const acoes = [acao("2.1.heimatschein"), acao("2.1.nachweis")];
    const r = calcularTetoDespesas({ pais, linhasPreco: AT, acoes });
    expect(acoes.every((a) => a.custo === null)).toBe(true);
    expect(r).not.toHaveProperty("custoPorItem");
  });
});

describe("ausências ditas em voz alta, nunca silêncio", () => {
  it("sem país identificado", () => {
    expect(calcularTetoDespesas({ pais: null, linhasPreco: AT, acoes: [] })).toEqual({
      estado: "sem_pais",
    });
  });

  it("país sem teto vigente", () => {
    const r = calcularTetoDespesas({
      pais: { iso: "HU", origem: "pais" },
      linhasPreco: AT,
      acoes: [],
    });
    expect(r).toMatchObject({ estado: "sem_teto", iso: "HU" });
  });

  it("ignora linha arquivada ou que não é VIGENTE", () => {
    const r = calcularTetoDespesas({
      pais: { iso: "AT", origem: "pais" },
      linhasPreco: [
        {
          country_code: "AT",
          price_component: "despesas",
          amount: 999,
          currency: "BRL",
          price_status: "ARQUIVADO",
        },
        {
          country_code: "AT",
          price_component: "taxas",
          amount: 999,
          currency: "BRL",
          price_status: "VIGENTE",
          archived_at: "2026-10-01",
        },
      ],
      acoes: [],
    });
    expect(r.estado).toBe("sem_teto");
  });

  it("dois valores vigentes do mesmo componente: ambíguo, não escolhe um", () => {
    const r = calcularTetoDespesas({
      pais: { iso: "AT", origem: "pais" },
      linhasPreco: [
        ...AT,
        {
          country_code: "AT",
          price_component: "despesas",
          amount: 2000,
          currency: "BRL",
          price_status: "VIGENTE",
        },
      ],
      acoes: [],
    });
    expect(r.estado).toBe("ambiguo");
  });

  it("despesas e taxas em moedas diferentes: ambíguo, não soma moedas distintas", () => {
    const r = calcularTetoDespesas({
      pais: { iso: "AT", origem: "pais" },
      linhasPreco: [
        {
          country_code: "AT",
          price_component: "despesas",
          amount: 100,
          currency: "BRL",
          price_status: "VIGENTE",
        },
        {
          country_code: "AT",
          price_component: "taxas",
          amount: 100,
          currency: "EUR",
          price_status: "VIGENTE",
        },
      ],
      acoes: [],
    });
    expect(r.estado).toBe("ambiguo");
  });
});

describe("id do item pelo título gravado", () => {
  it("lê o id do template no título da instância", () => {
    expect(idDoItemPeloTitulo("§58c 2.1.heimatschein — Heimatschein · Otto")).toBe(
      "2.1.heimatschein",
    );
    expect(idDoItemPeloTitulo("Outra pendência qualquer")).toBeNull();
  });
});

describe("ligação: leitor, painel e somente leitura", () => {
  const servidor = readFileSync("src/lib/dossie-58c.functions.ts", "utf8");
  const painel = readFileSync("src/components/caso/dossie-consolidado.tsx", "utf8");
  const bloco = readFileSync("src/components/caso/teto-despesas-produto-pai.tsx", "utf8");

  it("o dossiê lê o catálogo de preços com organização, só VIGENTE e não arquivado", () => {
    expect(servidor).toContain('.from("price_catalog_rescued")');
    expect(servidor).toContain('.eq("price_status", "VIGENTE")');
    expect(servidor).toContain('.is("archived_at", null)');
    expect(servidor).toContain("calcularTetoDespesas(");
    expect(servidor).toContain("tetoDespesas,");
  });

  it("o bloco aparece no painel do dossiê, antes das ações de terceiro", () => {
    expect(painel).toContain("<TetoDespesasProdutoPai teto={d.tetoDespesas} />");
    expect(painel.indexOf("<TetoDespesasProdutoPai")).toBeLessThan(
      painel.indexOf("data-acoes-checklist"),
    );
  });

  it("nada escreve em price_catalog_rescued e o bloco diz que o teto não é repartido", () => {
    const trecho = servidor.slice(
      servidor.indexOf("Teto de despesas do produto-pai"),
      servidor.indexOf("Histórico: a timeline"),
    );
    expect(trecho).not.toMatch(/\.(insert|update|upsert|delete)\(/);
    expect(bloco).toContain("não reparte");
  });
});
