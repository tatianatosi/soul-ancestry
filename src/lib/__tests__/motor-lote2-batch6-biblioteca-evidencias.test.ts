import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 6. Biblioteca Mestre
// (evidences/app_projections) já tinha aprovarProjecao/despublicarProjecao
// corrigidos; faltavam salvarEvidencia, registrarValidacaoEvidencia,
// salvarProjecao, revisarProjecao (que nem alerta de histórico tinha, só
// alerta interno) e arquivarRegistroG03.

const fn = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");

function trechoDe(nomeFn: string, proximaFn: string) {
  return fn.slice(fn.indexOf(`export const ${nomeFn}`), fn.indexOf(`export const ${proximaFn}`));
}

describe("biblioteca-evidencias.functions.ts — histórico em todos os escritores case-scoped", () => {
  it("salvarEvidencia registra histórico na criação e na atualização", () => {
    const t = trechoDe("salvarEvidencia", "registrarValidacaoEvidencia");
    expect(t).toContain('.select("id,case_id")');
    expect(t).toContain("Evidência atualizada");
    expect(t).toContain("Evidência registrada");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarValidacaoEvidencia registra histórico com a transição de estado", () => {
    const t = trechoDe("registrarValidacaoEvidencia", "salvarProjecao");
    expect(t).toContain("epistemic_validation_status,confidence_level,case_id");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("salvarProjecao registra histórico na criação e na atualização", () => {
    const t = trechoDe("salvarProjecao", "projetarMicroentregaParaApp");
    expect(t).toContain("Projeção de conteúdo atualizada");
    expect(t).toContain("Projeção de conteúdo criada");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("aprovarProjecao e despublicarProjecao já tinham sido corrigidos (Lote 1) — não regrediram", () => {
    const aprova = trechoDe("aprovarProjecao", "revisarProjecao");
    expect(aprova).toContain("registrarTimelineCaso(");
    const despublica = trechoDe("despublicarProjecao", "prepararAlertaProjecao");
    expect(despublica).toContain("registrarTimelineCaso(");
  });

  it("revisarProjecao registra histórico (antes só criava alerta interno, sem evento de caso)", () => {
    const t = trechoDe("revisarProjecao", "despublicarProjecao");
    expect(t).toContain("Projeção enviada para revisão");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("arquivarRegistroG03 registra histórico para evidences e app_projections", () => {
    const t = trechoDe("arquivarRegistroG03", "registrarCompartilhamentoAchado");
    expect(t).toContain('r.registro["case_id"]');
    expect(t).toContain("registrarTimelineCaso(");
  });
});
