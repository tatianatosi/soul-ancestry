import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 4 (histórico
// sistêmico). Varredura de caso-canonico.functions.ts (o núcleo do Caso
// 360) encontrou 8 escritores case-scoped sem registrarTimelineCaso;
// atualizarAlerta já tinha sido corrigido no Lote 1. saas.functions.ts::
// arquivarRegistro é o arquivamento genérico usado por várias telas do
// Desk (crm_casos, tarefas, case_members, evidencias, documents,
// consent_records, proposals, invoices, payments, eventos_financeiros) e
// nunca deixava rastro no histórico do caso.

const casoCanonico = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const saas = readFileSync("src/lib/saas.functions.ts", "utf8");

function trechoDe(conteudo: string, nomeFn: string, proximaFn: string) {
  return conteudo.slice(conteudo.indexOf(`export const ${nomeFn}`), conteudo.indexOf(`export const ${proximaFn}`));
}

describe("caso-canonico.functions.ts — histórico em todos os escritores case-scoped", () => {
  it("salvarCaseService registra histórico (criação e atualização)", () => {
    const t = trechoDe(casoCanonico, "salvarCaseService", "aplicarEtiqueta");
    expect(t).toContain("Serviço do caso atualizado");
    expect(t).toContain("Serviço do caso criado");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("aplicarEtiqueta registra histórico quando a entidade é o caso", () => {
    const t = trechoDe(casoCanonico, "aplicarEtiqueta", "removerEtiqueta");
    expect(t).toContain('data.entityType === "case"');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("removerEtiqueta registra histórico via reread do registro removido", () => {
    const t = trechoDe(casoCanonico, "removerEtiqueta", "registrarProximaAcao");
    expect(t).toContain('r.registro["entity_type"] === "case"');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("voltarProximaAcaoAoAutomatico registra histórico", () => {
    const t = trechoDe(casoCanonico, "voltarProximaAcaoAoAutomatico", "marcarSemNovaAcaoNecessaria");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("marcarSemNovaAcaoNecessaria registra histórico", () => {
    const t = trechoDe(casoCanonico, "marcarSemNovaAcaoNecessaria", "atualizarAlerta");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("atualizarAlerta já registrava histórico (Lote 1) — não regrediu", () => {
    const t = trechoDe(casoCanonico, "atualizarAlerta", "aprovarRascunho");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("aprovarRascunho registra histórico quando o rascunho tem caso vinculado", () => {
    const t = trechoDe(casoCanonico, "aprovarRascunho", "sincronizarMembrosDoCaso");
    expect(t).toContain('r.registro["case_id"]');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("atualizarItemOnboarding saiu (25/10/2026): o checklist de 14 itens não é mais escrito pelo Caso 360", () => {
    expect(casoCanonico).not.toContain("atualizarItemOnboarding");
  });

  it("sincronizarMembrosDoCaso registra histórico só quando cria membro novo", () => {
    const t = trechoDe(casoCanonico, "sincronizarMembrosDoCaso", "carregarMapaEtiquetas");
    expect(t).toContain("if (criados > 0)");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("saas.functions.ts — arquivarRegistro registra histórico quando a entidade é case-scoped", () => {
  const trecho = saas.slice(saas.indexOf("export const arquivarRegistro"), saas.indexOf("export const verificarCondicoesCaso"));

  it("resolve caseId por entidade (nomes de coluna divergentes entre tabelas)", () => {
    expect(trecho).toContain('data.entidade === "crm_casos"');
    expect(trecho).toContain('registro?.["caso_id"]');
    expect(trecho).toContain('registro?.["case_id"]');
  });

  it("eventos_financeiros seleciona caso_id no update manual", () => {
    expect(trecho).toContain('.select("id,caso_id")');
  });

  it("payments resolve caseId indiretamente via invoice_id -> invoices.case_id", () => {
    expect(trecho).toContain('data.entidade === "payments"');
    expect(trecho).toContain('.from("invoices")');
    expect(trecho).toContain('.select("case_id")');
  });

  it("registra evento de histórico só quando caseId foi resolvido", () => {
    expect(trecho).toContain("if (caseId) {");
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
    expect(trecho).toContain("Registro arquivado: ${data.entidade}");
  });
});
