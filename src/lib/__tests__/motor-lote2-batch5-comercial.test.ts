import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 5. comercial.functions.ts
// cobre Propostas, Ordens de Serviço e Financeiro (faturas/ajustes/arquivamento).
// salvarPagamento/conciliarPagamento já tinham sido corrigidos no Lote 1 —
// aqui faltavam os outros 11 escritores case-scoped do mesmo arquivo.

const fn = readFileSync("src/lib/comercial.functions.ts", "utf8");

function trechoDe(nomeFn: string, proximaFn: string) {
  return fn.slice(fn.indexOf(`export const ${nomeFn}`), fn.indexOf(`export const ${proximaFn}`));
}

describe("propostas — histórico em todos os escritores", () => {
  it("salvarProposta registra histórico na criação e na atualização", () => {
    const t = trechoDe("salvarProposta", "mudarStatusProposta");
    expect(t).toContain("Proposta atualizada");
    expect(t).toContain("Proposta criada");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("mudarStatusProposta registra histórico com o novo status", () => {
    const t = trechoDe("mudarStatusProposta", "renovarValidadeProposta");
    expect(t).toContain('.select("status,validade,validade_renovada_em,case_id")');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("renovarValidadeProposta registra histórico", () => {
    const t = trechoDe("renovarValidadeProposta", "criarVersaoAjusteProposta");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("criarVersaoAjusteProposta registra histórico", () => {
    const t = trechoDe("criarVersaoAjusteProposta", "restaurarProposta");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("restaurarProposta registra histórico", () => {
    const t = trechoDe("restaurarProposta", "criarOrdemServico");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("ordens de serviço — histórico em todos os escritores", () => {
  it("criarOrdemServico registra histórico", () => {
    const t = trechoDe("criarOrdemServico", "atualizarObservacaoOrdem");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("atualizarObservacaoOrdem registra histórico", () => {
    const t = trechoDe("atualizarObservacaoOrdem", "mudarStatusOrdem");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("mudarStatusOrdem registra histórico com o novo status", () => {
    const t = trechoDe("mudarStatusOrdem", "salvarFatura");
    expect(t).toContain('.select("status,case_id")');
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("financeiro — histórico em faturas, ajustes e arquivamento", () => {
  it("salvarFatura registra histórico na criação e na atualização", () => {
    const t = trechoDe("salvarFatura", "registrarAjusteFatura");
    expect(t).toContain("Fatura atualizada");
    expect(t).toContain("Fatura criada");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("registrarAjusteFatura resolve o caso via casoDaFatura e registra histórico", () => {
    const t = trechoDe("registrarAjusteFatura", "listarAjustes");
    expect(t).toContain("await casoDaFatura(supabase, organizationId, data.invoice_id)");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("arquivarComercial resolve caseId por recurso (payments via casoDaFatura, resto via case_id) e registra histórico", () => {
    const t = trechoDe("arquivarComercial", "obterResumoFinanceiroCaso");
    expect(t).toContain('data.recurso === "payments"');
    expect(t).toContain("await casoDaFatura(supabase, organizationId,");
    expect(t).toContain('r.registro["case_id"]');
    expect(t).toContain("registrarTimelineCaso(");
  });
});
