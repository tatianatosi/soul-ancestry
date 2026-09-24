import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA-GATE-FINANCEIRO-OS (24/09/2026) — achado real: `contracts.
 * financial_gate_status` é o campo que a trigger de banco
 * `fn_service_orders_guard` exige em ('confirmed','not_applicable') para
 * uma Ordem de Serviço poder sair de "approved" para "active" — e nada no
 * repositório o propagava. `conciliarPagamento` já confirmava um pagamento
 * real e gravava `crm_casos.pagamento_confirmado=true`, mas nunca tocava o
 * gate do contrato do mesmo caso: a OS ficava bloqueada até um humano
 * visitar /contratos/$id e escolher manualmente no dropdown, sem nenhuma
 * pista na tela de que o pagamento já tinha acontecido.
 *
 * Fecha o elo dentro da própria conciliação, reaproveitando
 * gravarComVerificacao (mesmo padrão já usado para o pagamento e para o
 * caso, nesta mesma função) — nenhuma tabela/campo/migration novo.
 */

const funcoes = readFileSync("src/lib/comercial.functions.ts", "utf8");

const trechoConciliar = funcoes.slice(
  funcoes.indexOf("export const conciliarPagamento"),
  funcoes.indexOf("export const arquivarComercial"),
);

describe("CA-GATE-FINANCEIRO-OS — conciliação propaga o gate financeiro do contrato assinado", () => {
  it("busca o(s) contrato(s) assinado(s) do mesmo caso da fatura", () => {
    expect(trechoConciliar).toContain('.from("contracts")');
    expect(trechoConciliar).toContain('.eq("case_id", fatura.case_id)');
    expect(trechoConciliar).toContain('.eq("status", "signed")');
    expect(trechoConciliar).toContain("if (erroContratos) throw new Error(erroContratos.message);");
  });

  it("só propaga quando existe exatamente um contrato assinado — nunca adivinha entre vários", () => {
    expect(trechoConciliar).toContain("contratosAssinados?.length === 1");
  });

  it("grava financial_gate_status='confirmed' com gravarComVerificacao (grava, relê, compara)", () => {
    expect(trechoConciliar).toContain('tabela: "contracts"');
    expect(trechoConciliar).toContain('payload: { financial_gate_status: "confirmed" }');
  });

  it("não regrava quando o contrato já está confirmado (evita update sem necessidade)", () => {
    expect(trechoConciliar).toContain('contrato.financial_gate_status !== "confirmed"');
  });

  it("a propagação acontece depois de confirmar o caso, nunca antes (mesma ordem defensiva)", () => {
    const posCaso = trechoConciliar.indexOf("casoRes.error");
    const posGate = trechoConciliar.indexOf('.from("contracts")');
    expect(posCaso).toBeGreaterThan(-1);
    expect(posGate).toBeGreaterThan(posCaso);
  });

  it("ignora contratos arquivados na busca", () => {
    const idx = trechoConciliar.indexOf('.from("contracts")');
    const trecho = trechoConciliar.slice(idx, idx + 400);
    expect(trecho).toContain('.is("archived_at", null)');
  });
});
