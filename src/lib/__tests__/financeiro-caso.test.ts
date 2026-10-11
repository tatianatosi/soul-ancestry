import { describe, expect, it } from "vitest";
import { calcularResumoFinanceiroCaso } from "@/lib/financeiro-caso";

const HOJE = "2026-09-09";

describe("calcularResumoFinanceiroCaso — CA07-FINANCEIRO-SIMPLES", () => {
  it("sem proposta e sem fatura: sem_dados_suficientes, nada simulado", () => {
    const r = calcularResumoFinanceiroCaso([], [], [], HOJE);
    expect(r.valorContratado).toBeNull();
    expect(r.condicaoComercial).toBeNull();
    expect(r.saldoAberto).toBeNull();
    expect(r.status).toBe("sem_dados_suficientes");
    expect(r.proximaAcaoFinanceira).toBe("Sem dados suficientes");
  });

  it("proposta aprovada sem fatura ainda: sem_cobranca_emitida, próxima ação é preparar cobrança", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 10000, moeda: "BRL", forma_pagamento: "3x sem juros" }],
      [],
      [],
      HOJE,
    );
    expect(r.valorContratado).toBe(10000);
    expect(r.condicaoComercial).toBe("3x sem juros");
    expect(r.status).toBe("sem_cobranca_emitida");
    expect(r.proximaAcaoFinanceira).toBe("Preparar cobrança inicial");
  });

  it("valor recebido e saldo vêm só de invoices.valor_pago — nunca resomado de payments", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 9000, moeda: "BRL", forma_pagamento: "à vista" }],
      [
        { id: "f1", status: "paga", valor: 3000, valor_pago: 3000, moeda: "BRL", vencimento: "2026-08-01" },
        { id: "f2", status: "parcialmente_paga", valor: 3000, valor_pago: 1000, moeda: "BRL", vencimento: "2026-10-01" },
        { id: "f3", status: "emitida", valor: 3000, valor_pago: 0, moeda: "BRL", vencimento: "2026-11-01" },
      ],
      [],
      HOJE,
    );
    expect(r.valorRecebido).toBe(4000);
    expect(r.saldoAberto).toBe(5000);
    expect(r.status).toBe("parcialmente_pago");
  });

  it("próxima parcela é a fatura em aberto de vencimento mais próximo", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 6000, moeda: "BRL", forma_pagamento: "2x" }],
      [
        { id: "f1", status: "emitida", valor: 3000, valor_pago: 0, moeda: "BRL", vencimento: "2026-12-01" },
        { id: "f2", status: "emitida", valor: 3000, valor_pago: 0, moeda: "BRL", vencimento: "2026-09-20" },
      ],
      [],
      HOJE,
    );
    expect(r.proximaParcela?.faturaId).toBe("f2");
    expect(r.proximaAcaoFinanceira).toBe("Aguardar parcela de 2026-09-20");
  });

  it("fatura em aberto vencida vira status 'vencido' mesmo sem o campo status dizer isso — nunca inferido de outra forma além da data real", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 3000, moeda: "BRL", forma_pagamento: "à vista" }],
      [{ id: "f1", status: "emitida", valor: 3000, valor_pago: 0, moeda: "BRL", vencimento: "2026-01-01" }],
      [],
      HOJE,
    );
    expect(r.status).toBe("vencido");
    expect(r.proximaAcaoFinanceira).toBe("Cobrar parcela vencida");
  });

  it("saldo zerado e proposta com valor: quitado", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 3000, moeda: "BRL", forma_pagamento: "à vista" }],
      [{ id: "f1", status: "paga", valor: 3000, valor_pago: 3000, moeda: "BRL", vencimento: "2026-08-01" }],
      [],
      HOJE,
    );
    expect(r.status).toBe("quitado");
    expect(r.proximaAcaoFinanceira).toBe("Nenhuma ação financeira pendente");
  });

  it("fatura cancelada não entra em recebido, saldo nem em próxima parcela", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 3000, moeda: "BRL", forma_pagamento: "à vista" }],
      [{ id: "f1", status: "cancelada", valor: 3000, valor_pago: 0, moeda: "BRL", vencimento: "2026-01-01" }],
      [],
      HOJE,
    );
    expect(r.valorRecebido).toBe(0);
    expect(r.saldoAberto).toBe(3000);
    expect(r.proximaParcela).toBeNull();
    expect(r.status).toBe("sem_cobranca_emitida");
  });

  it("sem proposta aprovada usa a mais recente (primeira da lista, já ordenada por quem chama)", () => {
    const r = calcularResumoFinanceiroCaso(
      [
        { id: "p2", status: "enviada", valor: 5000, moeda: "BRL", forma_pagamento: "2x" },
        { id: "p1", status: "recusada", valor: 4000, moeda: "BRL", forma_pagamento: "à vista" },
      ],
      [],
      [],
      HOJE,
    );
    expect(r.valorContratado).toBe(5000);
  });

  it("despesas de terceiros nunca entram em valor contratado, recebido ou saldo — contam à parte", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 3000, moeda: "BRL", forma_pagamento: "à vista" }],
      [],
      [
        { id: "d1", estado: "aguardando_aprovacao" },
        { id: "d2", estado: "aprovada" },
      ],
      HOJE,
    );
    expect(r.valorContratado).toBe(3000);
    expect(r.despesasTerceiros).toEqual({ total: 2, aguardandoAprovacao: 1, aprovadasOuPagas: 1 });
  });

  it("sem despesa registrada, o campo é null — não vira zero fabricado", () => {
    const r = calcularResumoFinanceiroCaso([], [], [], HOJE);
    expect(r.despesasTerceiros).toBeNull();
  });

  it("resposta normativa 11/10/2026 (Cláusula 9): custos de busca do cliente nunca deduzem a margem — margem bruta é só o valor liquidado", () => {
    const r = calcularResumoFinanceiroCaso(
      [{ id: "p1", status: "aprovada", valor: 9600, moeda: "BRL", forma_pagamento: "10x" }],
      [{ id: "f1", status: "paga", valor: 3200, valor_pago: 3200, moeda: "BRL", vencimento: "2026-08-01" }],
      [{ id: "d1", estado: "paga_diretamente_pelo_cliente", valor_pago: 500 }],
      HOJE,
    );
    expect(r.custosBuscaCliente).toBe(500);
    expect(r.margemBruta).toBe(3200);
    expect(r.valorRecebido).toBe(3200);
  });

  it("sem lançamento de despesa de terceiro: custos de busca é 0, não null — vazio honesto, não ausência de campo", () => {
    const r = calcularResumoFinanceiroCaso([], [], [], HOJE);
    expect(r.custosBuscaCliente).toBe(0);
    expect(r.margemBruta).toBe(0);
  });
});
