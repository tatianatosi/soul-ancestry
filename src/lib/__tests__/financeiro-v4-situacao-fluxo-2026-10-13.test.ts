import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { planoDeParcelas, situacaoDasFaturas, type FaturaGoLive } from "@/lib/golive-analitico";

/*
 * Financeiro na Prancha V4 (Proprietária, 13/10/2026): rosca de situação
 * das faturas e tabela de fluxo do contrato (parcelas previstas), ambos
 * sempre desenhados, lendo as faturas já carregadas por qFaturas — sem
 * consulta nova. Regra do componente permanente: nenhum gráfico vira texto.
 */
const rota = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");

describe("Financeiro — rosca de situação das faturas", () => {
  it("sem faturas, desenha anel neutro com 'Sem dados suficientes', sem fatia inventada", () => {
    expect(situacaoDasFaturas([])).toEqual([]);
    const trecho = rota.slice(rota.indexOf("<DonutEstados"), rota.indexOf("</CaCard>", rota.indexOf("<DonutEstados")));
    expect(trecho).toContain("Sem fatura carregada");
    expect(trecho).not.toContain("return null");
  });

  it("3 faturas (aberta, vencida, paga) viram 3 fatias reais, sem duplicar nem inventar estado", () => {
    const agora = new Date("2026-10-13T12:00:00Z");
    const faturas: FaturaGoLive[] = [
      { id: "a", valor: 100, valorPago: null, status: "emitida", vencimento: "2026-12-01", pagaEm: null },
      { id: "b", valor: 200, valorPago: null, status: "vencida", vencimento: "2026-01-01", pagaEm: null },
      { id: "c", valor: 300, valorPago: 300, status: "paga", vencimento: "2026-05-01", pagaEm: "2026-05-01" },
    ];
    const r = situacaoDasFaturas(faturas, agora);
    expect(r.map((s) => s.rotulo).sort()).toEqual(["Aberta", "Paga", "Vencida"]);
    expect(r.reduce((s, i) => s + i.valor, 0)).toBe(3);
  });
});

describe("Financeiro — fluxo do contrato (parcelas previstas)", () => {
  it("sem faturas, a tabela mostra 'Sem parcela registrada', não some", () => {
    expect(planoDeParcelas([], null)).toEqual([]);
    expect(rota).toContain("Sem parcela registrada.");
  });

  it("tags de situação usam verde (paga) e tom neutro para aberta — nenhuma cor inventada fora do kit", () => {
    const trecho = rota.slice(rota.indexOf("data-financeiro-fluxo-contrato"), rota.indexOf("</CaCard>", rota.indexOf("data-financeiro-fluxo-contrato")));
    expect(trecho).toContain('tom={p.situacao === "Paga" ? "sucesso" : p.situacao === "Vencida" ? "critico" : "neutro"}');
  });
});
