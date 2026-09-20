import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — item de prioridade média do
// levantamento do Lote 1: salvarPagamento (criar/editar pagamento) já
// gravava com gravarComVerificacao/inserirComVerificacao (erro/linha
// afetada cobertos) e não é ação externa/irreversível (só cadastro, sem
// liberar Portal) — não precisa de AcaoOperacional/acaoExterna. O único
// requisito que faltava era histórico: nenhuma criação/edição de pagamento
// deixava evento no caso.

const funcoes = readFileSync("src/lib/comercial.functions.ts", "utf8");

const trechoSalvar = funcoes.slice(
  funcoes.indexOf("export const salvarPagamento"),
  funcoes.indexOf("/** Conciliação manual"),
);

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — salvarPagamento registra histórico", () => {
  it("reaproveita a busca de caso pela fatura (casoDaFatura), sem tabela nova nem segundo escritor", () => {
    expect(funcoes).toContain("async function casoDaFatura(");
    expect(funcoes).toContain("if (error) throw new Error(error.message);");
  });

  it("registra evento ao editar pagamento existente, depois da escrita confirmada", () => {
    const posGravar = trechoSalvar.indexOf("await gravarComVerificacao(");
    const posTimeline = trechoSalvar.indexOf("registrarTimelineCaso(");
    expect(posGravar).toBeGreaterThan(-1);
    expect(posTimeline).toBeGreaterThan(posGravar);
    expect(trechoSalvar).toContain('"Pagamento atualizado"');
  });

  it("registra evento ao criar pagamento novo, depois da escrita confirmada", () => {
    const posInserir = trechoSalvar.indexOf("await inserirComVerificacao(");
    const posTimelineCriar = trechoSalvar.lastIndexOf("registrarTimelineCaso(");
    expect(posInserir).toBeGreaterThan(-1);
    expect(posTimelineCriar).toBeGreaterThan(posInserir);
    expect(trechoSalvar).toContain('"Pagamento registrado"');
  });

  it("não cria confirmação humana nova — cadastro de pagamento não é ação externa/irreversível", () => {
    expect(trechoSalvar).not.toContain("AcaoOperacional");
    expect(trechoSalvar).not.toContain("acaoExterna");
  });

  it("evento aponta para o pagamento, com sourceEntityType correto", () => {
    expect(trechoSalvar).toContain('sourceEntityType: "payments"');
  });

  it("import de registrarTimelineCaso presente no módulo", () => {
    expect(funcoes).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });
});
