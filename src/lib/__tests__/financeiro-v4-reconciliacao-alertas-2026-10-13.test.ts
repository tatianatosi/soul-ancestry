import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Revisão do Financeiro V4 (Proprietária, 13/10/2026): faltavam
 * "Reconciliação", "Alertas financeiros contextualizados", o card "Fluxo
 * do contrato" (os 4 valores em lista) e a linha "previsto × confirmado",
 * presentes na Prancha Visual do Desk. Todos lêem faturas/pagamentos já
 * carregados — nenhuma query nova, nenhum dado fictício.
 */
const rota = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");

describe("Financeiro — Reconciliação", () => {
  it("conta payments.conciliacao_status real, sem query nova", () => {
    expect(rota).toContain("data-financeiro-reconciliacao");
    expect(rota).toContain('p["conciliacao_status"] === "conciliado"');
    expect(rota).toContain("Nenhuma cobrança é enviada a partir desta tela.");
  });
});

describe("Financeiro — Alertas financeiros contextualizados", () => {
  it("vazio honesto quando não há sinal nenhum", () => {
    expect(rota).toContain("data-financeiro-alertas");
    expect(rota).toContain("Nenhum vencimento próximo, vínculo pendente ou conciliação recente para mostrar.");
  });

  it("os três sinais citam o registro real, nunca nome de contrato inventado", () => {
    const trecho = rota.slice(rota.indexOf("const alertas: Alerta[]"), rota.indexOf("const previstoPorMes"));
    expect(trecho).toContain("rotuloRegistro(x.f)");
    expect(trecho).toContain('"Conferir vínculo"');
    expect(trecho).toContain('"Conciliada"');
    expect(trecho).not.toMatch(/Bianchi|Rossi|Costa/);
  });
});

describe("Financeiro — Fluxo do contrato (lista) e previsto × confirmado", () => {
  it("fluxo do contrato reaproveita contratada/recebida/vencidas, sem recalcular", () => {
    const trecho = rota.slice(
      rota.indexOf("data-financeiro-fluxo-contrato"),
      rota.indexOf("</CaCard>", rota.indexOf("data-financeiro-fluxo-contrato")),
    );
    expect(trecho).toContain("valor: contratada");
    expect(trecho).toContain("valor: recebida");
    expect(trecho).toContain("valor: vencidas");
  });

  it("previsto × confirmado usa porMes/recebimentoPorMes já existentes, gráfico sempre desenhado", () => {
    expect(rota).toContain("data-financeiro-previsto-confirmado");
    expect(rota).toContain("<GraficoLinhaSeries");
    expect(rota).toContain("porMes(faturasAdaptadas, (f) => f.vencimento, (f) => f.valor, 6)");
    expect(rota).toContain("recebimentoPorMes(faturasAdaptadas, pagamentosAdaptados, 6)");
    expect(rota).toContain("data-financeiro-previsto-confirmado-vazio");
  });
});
