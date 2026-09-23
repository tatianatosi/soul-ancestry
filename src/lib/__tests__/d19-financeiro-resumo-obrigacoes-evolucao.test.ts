import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * §19 do De-Para (Desk — Financeiro): Resumo (previsto/recebido/vencido/
 * saldo), Obrigações (custos/fornecedores) e Gráficos (evolução). Onde a
 * fonte real não sustenta um indicador (dois estados de atraso distintos,
 * agregação org-wide de despesas de terceiro, série mensal), o corte
 * declara a divergência (§29) e usa EstadoVazio — nunca inventa valor.
 */

const rota = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");

describe("Financeiro — Resumo do período (§19)", () => {
  it("renderiza os 4 indicadores reais, sem inventar 'em atraso' separado de 'vencido'", () => {
    expect(rota).toContain("data-financeiro-resumo-periodo");
    expect(rota).toContain('rotulo: "Previsto"');
    expect(rota).toContain('rotulo: "Recebido"');
    expect(rota).toContain('rotulo: "Vencido"');
    expect(rota).toContain('rotulo: "Saldo em aberto"');
    expect(rota).toContain("DIVERGÊNCIA REGISTRADA (§29)");
  });

  it("cada indicador do resumo é clicável e abre a lista/origem (troca aba+status), nenhum é decorativo", () => {
    const trecho = rota.slice(
      rota.indexOf("data-financeiro-resumo-periodo"),
      rota.indexOf("</CaCard>", rota.indexOf("data-financeiro-resumo-periodo")),
    );
    expect(trecho).toContain("onClick={() => {");
    expect(trecho).toContain("setAba(item.aba)");
    expect(trecho).toContain("setStatus(item.status)");
  });

  it("reaproveita contratada/recebida/vencidas já calculados (sem query nova para o resumo)", () => {
    const posicaoCalculo = rota.indexOf("const vencidas = soma(faturas");
    const posicaoResumo = rota.indexOf("data-financeiro-resumo-periodo");
    expect(posicaoCalculo).toBeGreaterThan(-1);
    expect(posicaoResumo).toBeGreaterThan(posicaoCalculo);
  });
});

describe("Financeiro — Obrigações e Evolução (§19): EstadoVazio honesto onde a fonte não sustenta", () => {
  it("Obrigações declara que despesas de terceiro são por caso, sem agregação org-wide inventada", () => {
    expect(rota).toContain("data-financeiro-obrigacoes");
    const trecho = rota.slice(
      rota.indexOf("data-financeiro-obrigacoes") - 600,
      rota.indexOf("data-financeiro-obrigacoes") + 400,
    );
    expect(trecho).toContain("DIVERGÊNCIA REGISTRADA (§29)");
    expect(trecho).toContain("EstadoVazio");
  });

  it("Evolução não desenha gráfico decorativo sem série mensal real", () => {
    expect(rota).toContain("data-financeiro-evolucao");
    const trecho = rota.slice(
      rota.indexOf("data-financeiro-evolucao") - 600,
      rota.indexOf("data-financeiro-evolucao") + 400,
    );
    expect(trecho).toContain("EstadoVazio");
    expect(trecho).not.toMatch(/BarChart|LineChart|<svg/);
  });
});

describe("Financeiro — vínculo fatura → caso (já existente, não regredido)", () => {
  it("a gaveta de detalhe da fatura continua linkando para o caso vinculado", () => {
    expect(rota).toContain("data-financeiro-vinculo-caso");
    expect(rota).toContain('to="/casos/$caseId"');
  });
});
