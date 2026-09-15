import { describe, expect, it } from "vitest";

import { origemDaCondicao, planoDeParcelas } from "./golive-analitico";

const lead = {
  callRealizada: "2026-08-10",
  statusCall: "realizada",
  discoveryResultado: "aderente",
  resumoCall: "Núcleo familiar confirmado.",
};

const fatura = (id: string, vencimento: string | null, numero: string | null = null) => ({
  id,
  numero,
  valor: 1000,
  valorPago: null,
  status: "aberta",
  vencimento,
  pagaEm: null,
});

describe("call ligada ao plano de parcelas", () => {
  it("devolve a origem só quando há call realizada gravada", () => {
    expect(origemDaCondicao(lead)?.callEm).toBe("2026-08-10");
    expect(origemDaCondicao({ callRealizada: null })).toBeNull();
    expect(origemDaCondicao(null)).toBeNull();
  });

  it("ordena parcelas por vencimento e mede os dias após a call", () => {
    const p = planoDeParcelas(
      [fatura("b", "2026-10-10", "2026-02"), fatura("a", "2026-09-10", "2026-01")],
      lead,
      new Date("2026-09-01T12:00:00Z"),
    );
    expect(p.map((i) => i.id)).toEqual(["a", "b"]);
    expect(p[0]?.diasAposCall).toBe(31);
    expect(p[1]?.diasAposCall).toBe(61);
  });

  it("não infere distância sem call ou sem vencimento", () => {
    expect(planoDeParcelas([fatura("a", "2026-09-10")], null)[0]?.diasAposCall).toBeNull();
    expect(planoDeParcelas([fatura("a", null)], lead)[0]?.diasAposCall).toBeNull();
  });

  it("sem faturas gravadas, o plano fica vazio", () => {
    expect(planoDeParcelas([], lead)).toEqual([]);
  });
});
