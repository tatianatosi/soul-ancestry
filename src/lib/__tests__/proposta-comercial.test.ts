import { describe, expect, it } from "vitest";

import { candidatosComerciaisDaProposta, propostaAptaParaPrecarga } from "@/lib/proposta-comercial";

const PROPOSTA_ANA = {
  id: "abb12c85-5065-4ee4-8b54-98768414a226",
  versao: 1,
  status: "aprovada",
  archived_at: null,
  valor: "9600.00",
  moeda: "BRL",
  forma_pagamento:
    "3 assinaturas mensais de R$ 320 por responsável, durante 10 meses — total R$ 9.600. Cada assinatura termina automaticamente após a 10ª cobrança.",
  escopo: "Pacote familiar de 3 pessoas e 3 processos individuais (§ 58c StbG).",
};

describe("proposta aprovada como fonte comercial", () => {
  const c = candidatosComerciaisDaProposta(PROPOSTA_ANA);
  const mapa = Object.fromEntries(c.map((x) => [x.campo, x.valor]));

  it("pré-carrega somente campos comerciais permitidos", () => {
    expect(c.map((x) => x.campo).sort()).toEqual(["forma_pagamento", "parcelas", "valor_total"]);
  });

  it("importa os valores estruturados do caso da Ana", () => {
    expect(mapa["valor_total"]).toBe("9600");
    expect(mapa["forma_pagamento"]).toBe("assinatura_mensal");
    expect(mapa["parcelas"]).toBe(
      "3 assinaturas mensais de 320 por responsável, durante 10 meses (total mensal 960)",
    );
  });

  it("nunca deriva datas de vencimento", () => {
    expect(c.some((x) => x.campo === "vencimentos")).toBe(false);
  });

  it("não importa parcelas quando a aritmética não fecha com o total", () => {
    const r = candidatosComerciaisDaProposta({ ...PROPOSTA_ANA, valor: "7000" });
    expect(r.some((x) => x.campo === "parcelas")).toBe(false);
  });

  it("importa regra de despesas externas apenas quando declarada", () => {
    expect(mapa["despesas_externas"]).toBeUndefined();
    const r = candidatosComerciaisDaProposta({
      ...PROPOSTA_ANA,
      exclusoes:
        "Despesas de terceiros (taxas, traduções e apostilas) são pagas diretamente pelo cliente, mediante comunicação e aprovação prévia.",
    });
    expect(r.find((x) => x.campo === "despesas_externas")?.valor).toBe("paga_direto");
  });

  it("proposta arquivada, substituída ou recusada não pré-carrega", () => {
    expect(propostaAptaParaPrecarga({ ...PROPOSTA_ANA, archived_at: "2026-08-18T00:00:00Z" })).toBe(
      false,
    );
    for (const status of ["substituida", "recusada", "rascunho", "enviada"]) {
      expect(candidatosComerciaisDaProposta({ ...PROPOSTA_ANA, status })).toEqual([]);
    }
  });

  it("registra referência e versão da proposta em cada campo importado", () => {
    for (const x of c) expect(x.detalhe).toContain(`v1 (aprovada)`);
  });
});
