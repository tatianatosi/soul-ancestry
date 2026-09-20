import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 1 (Pagamento).
// conciliarPagamento gravava o próprio pagamento com gravarComVerificacao,
// mas a propagação para crm_casos.pagamento_confirmado — o campo que o gate
// de acesso ao Portal de fato lê — era uma escrita crua: sem checar erro,
// sem checar linha afetada, sem confirmação humana (mesma classe de bug já
// corrigida em assinatura, campo diferente) e sem evento de histórico no
// caso. Prova por leitura do código real, mesmo estilo já usado em
// sequencia-caso-contrato-financeiro-projecao.test.ts.

const funcoes = readFileSync("src/lib/comercial.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");

const trechoConciliar = funcoes.slice(
  funcoes.indexOf("export const conciliarPagamento"),
  funcoes.indexOf("export const arquivarComercial"),
);

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — servidor verifica cada escrita e registra histórico", () => {
  it("verifica erro e linha afetada na escrita em crm_casos.pagamento_confirmado — antes era disparada sem checagem", () => {
    expect(trechoConciliar).toContain('.update({ pagamento_confirmado: true })');
    expect(trechoConciliar).toContain("if (casoRes.error) throw new Error(casoRes.error.message);");
    expect(trechoConciliar).toContain("if (!casoRes.data?.length)");
    expect(trechoConciliar).toContain("revisão humana necessária antes de repetir a ação");
  });

  it("também verifica erro na leitura da fatura vinculada", () => {
    expect(trechoConciliar).toContain("if (erroFatura) throw new Error(erroFatura.message);");
  });

  it("registra evento de histórico no caso depois da escrita confirmada, nunca antes", () => {
    const posCaso = trechoConciliar.indexOf("casoRes.error");
    const posTimeline = trechoConciliar.indexOf("registrarTimelineCaso(");
    expect(posCaso).toBeGreaterThan(-1);
    expect(posTimeline).toBeGreaterThan(posCaso);
    expect(trechoConciliar).toContain('sourceEntityType: "payments"');
  });

  it("import de registrarTimelineCaso presente no módulo", () => {
    expect(funcoes).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("motivo ausente vira texto explícito de dívida, nunca silenciosamente vazio — mesmo padrão de assinatura", () => {
    expect(trechoConciliar).toContain("Motivo não informado (fluxo sem confirmação humana explícita).");
  });
});

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — interface exige confirmação humana explícita", () => {
  it("'Conciliar' não é mais um botão cru — está dentro de AcaoOperacional com acaoExterna", () => {
    const idx = rota.indexOf('rotulo="Conciliar"');
    expect(idx).toBeGreaterThan(-1);
    const trecho = rota.slice(Math.max(0, idx - 50), idx + 700);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="conciliar_pagamento"');
    expect(rota).not.toMatch(/<button[^>]*onClick=\{\(\)\s*=>\s*\n?\s*mConciliar\.mutate\(/);
  });

  it("bloqueia confirmação sem os três campos preenchidos (data, valor, referência)", () => {
    const idx = rota.indexOf('rotulo="Conciliar"');
    const trecho = rota.slice(idx, idx + 500);
    expect(trecho).toContain("validacaoFormulario={");
    expect(trecho).toContain("!conc.data");
    expect(trecho).toContain("!conc.valor");
    expect(trecho).toContain("!conc.referencia");
  });

  it("motivo digitado na confirmação é repassado ao servidor, não descartado", () => {
    expect(rota).toContain("onConfirmar={(motivo) => {");
    expect(rota).toMatch(/mConciliar\.mutate\(\{[\s\S]*?motivo,[\s\S]*?\}\)/);
  });
});
