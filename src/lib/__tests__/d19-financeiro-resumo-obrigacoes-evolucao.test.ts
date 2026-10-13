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
  it("renderiza os 4 indicadores reais, com os rótulos de carteira global (Proprietária, 13/10/2026)", () => {
    expect(rota).toContain("data-financeiro-resumo-periodo");
    expect(rota).toContain('contratado: "Valor Total Contratado"');
    expect(rota).toContain('recebido: "Total Já Recebido"');
    expect(rota).toContain('aVencer: "Total a Vencer"');
    expect(rota).toContain('vencido: "Total Vencido"');
    expect(rota).toContain("DIVERGÊNCIA REGISTRADA (§29)");
  });

  it("\"Total a Vencer\" exclui o que já está vencido — não soma os dois", () => {
    expect(rota).toContain("const aVencer = Math.max(contratada - recebida - vencidas, 0);");
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

describe("Financeiro — Obrigações e Evolução (§19): agregação real onde a fonte sustenta", () => {
  it("Obrigações agrega despesas de terceiro por toda a organização (autorizado pela Proprietária, 13/10/2026)", () => {
    expect(rota).toContain("data-financeiro-obrigacoes");
    expect(rota).toContain("listarDespesasTerceiros");
    const trecho = rota.slice(
      rota.indexOf("data-financeiro-obrigacoes") - 600,
      rota.indexOf("data-financeiro-obrigacoes") + 1600,
    );
    expect(trecho).toContain("Aguardando aprovação");
    expect(trecho).toContain("Aprovadas ou pagas");
    expect(trecho).toContain("EstadoVazio");
  });

  it("situação das faturas é rosca real (situacaoDasFaturas), nunca some sem fatura", () => {
    // Regra do componente permanente (Proprietária, 13/10/2026): a rosca
    // roda sobre a mesma `faturas` de qFaturas (sem query nova) e, sem
    // registro, desenha anel neutro com "Sem dados suficientes" — nunca
    // troca o gráfico por um EstadoVazio de texto.
    expect(rota).toContain("data-financeiro-situacao-faturas");
    expect(rota).toContain("situacaoDasFaturas(faturasAdaptadas)");
    expect(rota).toContain("<DonutEstados");
    expect(rota).toContain("data-financeiro-situacao-vazio");
  });

  it("fluxo do contrato (parcelas) roda sobre as mesmas faturas, sem query nova", () => {
    expect(rota).toContain("data-financeiro-fluxo-contrato");
    expect(rota).toContain("planoDeParcelas(faturasAdaptadas, null)");
    expect(rota).toContain("Sem parcela registrada.");
  });
});

describe("Financeiro — vínculo fatura → caso (já existente, não regredido)", () => {
  it("a gaveta de detalhe da fatura continua linkando para o caso vinculado", () => {
    expect(rota).toContain("data-financeiro-vinculo-caso");
    expect(rota).toContain('to="/casos/$caseId"');
  });
});
