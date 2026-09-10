import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { calcularResumoFinanceiroCaso } from "@/lib/financeiro-caso";

/*
 * CA16-FINANCEIRO-E-CAMPANHAS (09/09/2026) — payments.status='estornado' já
 * existia no schema e já era excluído de valorRecebido pelo trigger
 * fn_payments_pos, mas nenhuma leitura financeira por caso mostrava que um
 * reembolso tinha acontecido: o caso simplesmente voltava a parecer "sem
 * cobrança" ou "saldo aberto", sem explicação. Reembolso nunca é receita,
 * despesa de terceiro ou custo — ganha sua própria classificação, honesta
 * (Sem dados suficientes quando não há estorno).
 *
 * Investimento de campanha (marketing_investments, CA10) e despesa de
 * terceiro (third_party_expenses, CA15) já são tabelas e leituras
 * completamente separadas de receita (invoices/payments) — verificado aqui
 * para confirmar que esta rodada não introduziu nenhuma mistura.
 */

const propostaBase = [{ id: "p1", status: "aprovada", valor: 10000, moeda: "BRL", forma_pagamento: "à vista" }];
const faturaBase = [{ id: "f1", status: "paga", valor: 10000, valor_pago: 10000, moeda: "BRL", vencimento: "2026-08-01" }];

describe("CA16 — reembolso (payments.status='estornado') ganha classificação própria e visível", () => {
  it("sem nenhum pagamento estornado, reembolsos é null (Sem dados suficientes)", () => {
    const r = calcularResumoFinanceiroCaso(propostaBase, faturaBase, [], "2026-09-09", [
      { id: "pay1", invoice_id: "f1", status: "confirmado", valor: 10000, moeda: "BRL" },
    ]);
    expect(r.reembolsos).toBeNull();
  });

  it("com pagamento estornado, mostra total e valor — nunca soma a valorRecebido", () => {
    const r = calcularResumoFinanceiroCaso(propostaBase, faturaBase, [], "2026-09-09", [
      { id: "pay1", invoice_id: "f1", status: "confirmado", valor: 6000, moeda: "BRL" },
      { id: "pay2", invoice_id: "f1", status: "estornado", valor: 4000, moeda: "BRL" },
    ]);
    expect(r.reembolsos).toEqual({ total: 1, valor: 4000 });
  });

  it("sem o parâmetro pagamentos (chamador antigo), continua funcionando — reembolsos fica null", () => {
    const r = calcularResumoFinanceiroCaso(propostaBase, faturaBase, [], "2026-09-09");
    expect(r.reembolsos).toBeNull();
    expect(r.valorContratado).toBe(10000);
  });

  it("múltiplos estornos são somados corretamente", () => {
    const r = calcularResumoFinanceiroCaso(propostaBase, faturaBase, [], "2026-09-09", [
      { id: "pay1", invoice_id: "f1", status: "estornado", valor: 1000, moeda: "BRL" },
      { id: "pay2", invoice_id: "f1", status: "estornado", valor: 500, moeda: "BRL" },
    ]);
    expect(r.reembolsos).toEqual({ total: 2, valor: 1500 });
  });
});

describe("CA16 — comercial.functions.ts busca payments por invoice_id do próprio caso", () => {
  const arquivo = readFileSync("src/lib/comercial.functions.ts", "utf8");

  it("busca payments só quando há faturas do caso, filtrando por invoice_id", () => {
    const bloco = arquivo.slice(arquivo.indexOf("idsFaturas"), arquivo.indexOf("idsFaturas") + 700);
    expect(bloco).toContain('.from("payments")');
    expect(bloco).toContain('.in("invoice_id", idsFaturas)');
  });

  it("passa os pagamentos para calcularResumoFinanceiroCaso", () => {
    const bloco = arquivo.slice(arquivo.indexOf("return calcularResumoFinanceiroCaso"));
    expect(bloco.slice(0, 300)).toContain("pagamentos.data");
  });
});

describe("CA16 — investimento de campanha e despesa de terceiro continuam em tabelas e leituras separadas de receita", () => {
  it("financeiro-caso.ts nunca lê marketing_investments nem attribution_records", () => {
    const arquivo = readFileSync("src/lib/financeiro-caso.ts", "utf8");
    expect(arquivo).not.toMatch(/marketing_investments|attribution_records/);
  });

  it("Caso 360 e Visão Geral mostram o novo campo Reembolsos com o mesmo cálculo", () => {
    const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    const visaoGeral = readFileSync("src/components/caso/visao-geral.tsx", "utf8");
    expect(caso360).toContain("Reembolsos (pagamentos estornados)");
    expect(visaoGeral).toContain("Reembolsos (pagamentos estornados)");
  });
});
