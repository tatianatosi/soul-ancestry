import { describe, expect, it } from "vitest";

import {
  contarPor,
  escadaFormalizacao,
  estadoDaProjecao,
  estaPaga,
  porMes,
  porSemana,
  recebimentoPorMes,
  totaisFinanceiros,
} from "./golive-analitico";

const AGORA = new Date(2026, 8, 15, 10, 0, 0); // terça, 15/09/2026

const fatura = (p: Partial<Parameters<typeof estaPaga>[0]>) => ({
  id: "f",
  valor: 1000,
  valorPago: null,
  status: null,
  vencimento: null,
  pagaEm: null,
  ...p,
});

describe("contarPor", () => {
  it("agrupa pelo valor gravado", () => {
    expect(contarPor([{ s: "a" }, { s: "a" }, { s: "b" }], (i) => i.s)).toEqual([
      { rotulo: "a", valor: 2 },
      { rotulo: "b", valor: 1 },
    ]);
  });

  it("não esconde registro sem valor", () => {
    expect(contarPor([{ s: null }], (i) => i.s, "Sem situação")).toEqual([
      { rotulo: "Sem situação", valor: 1 },
    ]);
  });
});

describe("porSemana", () => {
  it("usa segunda como início e mantém domingo na semana anterior", () => {
    const serie = porSemana(
      [{ d: "2026-09-13" }, { d: "2026-09-14" }], // domingo e segunda
      (i) => i.d,
      2,
      AGORA,
    );
    expect(serie).toHaveLength(2);
    expect(serie[0]!.valor).toBe(1);
    expect(serie[1]!.valor).toBe(1);
  });

  it("ignora item sem data", () => {
    expect(porSemana([{ d: null }], (i) => i.d, 3, AGORA).every((s) => s.valor === 0)).toBe(true);
  });
});

describe("porMes", () => {
  it("soma valores no mês da data gravada", () => {
    const serie = porMes(
      [
        { d: "2026-09-02T12:00:00Z", v: 500 },
        { d: "2026-08-20T12:00:00Z", v: 300 },
      ],
      (i) => i.d,
      (i) => i.v,
      2,
      AGORA,
    );
    expect(serie[0]!.valor).toBe(300);
    expect(serie[1]!.valor).toBe(500);
  });

  it("ignora item sem valor numérico", () => {
    expect(porMes([{ d: "2026-09-02", v: null }], (i) => i.d, (i) => i.v, 1, AGORA)[0]!.valor).toBe(0);
  });
});

describe("financeiro", () => {
  it("reconhece fatura paga por data ou por situação", () => {
    expect(estaPaga(fatura({ pagaEm: "2026-09-01" }))).toBe(true);
    expect(estaPaga(fatura({ status: "quitada" }))).toBe(true);
    expect(estaPaga(fatura({ status: "aberta" }))).toBe(false);
  });

  it("separa contratado, pago, aberto e vencido", () => {
    const t = totaisFinanceiros(
      [
        fatura({ id: "1", valor: 1000, pagaEm: "2026-09-01", valorPago: 1000 }),
        fatura({ id: "2", valor: 500, vencimento: "2026-09-10" }),
        fatura({ id: "3", valor: 200, vencimento: "2026-09-30" }),
      ],
      [],
      AGORA,
    );
    expect(t).toEqual({ contratado: 1700, pago: 1000, emAberto: 700, vencido: 500 });
  });

  it("prefere pagamentos registrados no recebimento por mês", () => {
    const serie = recebimentoPorMes(
      [fatura({ id: "1", valor: 900, pagaEm: "2026-08-10" })],
      [{ id: "p", valor: 400, pagoEm: "2026-09-05" }],
      2,
      AGORA,
    );
    expect(serie[1]!.valor).toBe(400);
    expect(serie[0]!.valor).toBe(0);
  });

  it("fica vazio quando não há data de quitação nem pagamento", () => {
    expect(recebimentoPorMes([fatura({ status: "paga" })], [], 3, AGORA)).toEqual([]);
  });
});

describe("formalização e portal", () => {
  it("marca degrau só com registro gravado", () => {
    const e = escadaFormalizacao({ propostas: 1, escopo: 0, contratos: 1, assinados: 0, ordens: 0 });
    expect(e.map((i) => i.feito)).toEqual([true, false, true, false, false]);
  });

  it("humaniza a situação da projeção sem esconder o desconhecido", () => {
    expect(estadoDaProjecao("published")).toBe("Publicado");
    expect(estadoDaProjecao("draft")).toBe("Rascunho");
    expect(estadoDaProjecao("outro_estado")).toBe("Sem situação");
  });
});
