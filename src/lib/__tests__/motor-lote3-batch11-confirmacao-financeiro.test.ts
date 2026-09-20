import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 3, batch 11 (confirmação
// humana em Financeiro). O Lote 2 (histórico) já cobria estas telas;
// faltava a confirmação: 5 CTAs financeiras usavam botão cru ou
// window.prompt() encadeado em vez de <AcaoOperacional>.

const financeiro = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("financeiro.tsx — confirmação humana nas ações que faltavam", () => {
  it("Mover status da fatura está dentro de AcaoOperacional", () => {
    const idx = financeiro.indexOf("Mover status");
    const trecho = financeiro.slice(idx, idx + 700);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="mudar_status_fatura"');
  });

  it("Registrar ajuste de fatura está dentro de AcaoOperacional e exige motivo pelo modal", () => {
    const idx = financeiro.indexOf("Ajuste de valor (fatura paga)");
    const trecho = financeiro.slice(idx, idx + 1200);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="registrar_ajuste_fatura"');
    expect(trecho).not.toContain('<Campo rotulo="Motivo">');
  });

  it("Salvar fatura/pagamento está dentro de AcaoOperacional", () => {
    const idx = financeiro.lastIndexOf("<AcaoOperacional");
    const trecho = financeiro.slice(idx, idx + 400);
    expect(trecho).toContain('acaoExterna={aba === "faturas" ? "salvar_fatura" : "salvar_pagamento"}');
  });

  it("nenhum botão cru restante nos três blocos corrigidos", () => {
    expect(financeiro).not.toMatch(/onClick=\{\(\) =>\s*\n?\s*mSalvar\.mutate\(\{ id: String\(detalhe\["id"\]\), dados: \{ status: destino \} \}\)/);
  });
});

describe("casos.$caseId.index.tsx — confirmação humana em pagamento/cobrança do caso", () => {
  it("Registrar pagamento não usa mais window.prompt() encadeado", () => {
    const idx = caso360.indexOf("rascunhoPagamento");
    expect(idx).toBeGreaterThan(-1);
    expect(caso360).not.toContain('prompt("Valor pago:"');
    expect(caso360).not.toContain('prompt("Data do pagamento');
    expect(caso360).not.toContain('prompt("Referência externa do pagamento');
  });

  it("Confirmar pagamento está dentro de AcaoOperacional com acaoExterna", () => {
    expect(caso360).toContain('acaoExterna="registrar_pagamento_caso"');
  });

  it("Preparar cobrança não usa mais window.prompt() encadeado", () => {
    expect(caso360).not.toContain('prompt("Valor da cobrança');
    expect(caso360).not.toContain('prompt("Vencimento (AAAA-MM-DD):")');
    expect(caso360).not.toContain('prompt("Descrição interna da cobrança:")');
  });

  it("Confirmar preparação de cobrança está dentro de AcaoOperacional com acaoExterna", () => {
    expect(caso360).toContain('acaoExterna="preparar_cobranca_caso"');
  });

  it("conciliarPagamento recebe o motivo vindo do modal de confirmação", () => {
    const idx = caso360.indexOf("mRegistrarPagamento.mutate({");
    const trecho = caso360.slice(idx, idx + 400);
    expect(trecho).toContain("motivo,");
  });
});
