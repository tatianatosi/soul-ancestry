import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 3 (histórico
// sistêmico + confirmação). portal-atendimento.functions.ts é a tela
// /atendimento inteira: nenhum dos 9 escritores case-scoped registrava
// evento em case_timeline_events, e 2 deles (confirmarDocumentosMinimos,
// publicarProjecaoApp) disparavam direto no clique, sem confirmação.

const fn = readFileSync("src/lib/portal-atendimento.functions.ts", "utf8");
const rota = readFileSync("src/components/portal/atendimento-interno.tsx", "utf8");

function trechoDe(nomeFn: string, proximaFn: string) {
  return fn.slice(fn.indexOf(`export const ${nomeFn}`), fn.indexOf(`export const ${proximaFn}`));
}

describe("portal-atendimento.functions.ts — histórico em todos os escritores case-scoped", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(fn).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("criarSolicitacaoDocumento registra histórico", () => {
    expect(trechoDe("criarSolicitacaoDocumento", "cancelarSolicitacaoDocumento")).toContain("registrarTimelineCaso(");
  });

  it("cancelarSolicitacaoDocumento registra histórico", () => {
    expect(trechoDe("cancelarSolicitacaoDocumento", "revisarEnvioCliente")).toContain("registrarTimelineCaso(");
  });

  it("revisarEnvioCliente registra histórico", () => {
    expect(trechoDe("revisarEnvioCliente", "liberarEntregaCliente")).toContain("registrarTimelineCaso(");
  });

  it("liberarEntregaCliente registra histórico", () => {
    expect(trechoDe("liberarEntregaCliente", "liberarFaturaCliente")).toContain("registrarTimelineCaso(");
  });

  it("liberarFaturaCliente registra histórico", () => {
    expect(trechoDe("liberarFaturaCliente", "confirmarDocumentosMinimos")).toContain("registrarTimelineCaso(");
  });

  it("confirmarDocumentosMinimos registra histórico e exige motivo", () => {
    const t = trechoDe("confirmarDocumentosMinimos", "publicarProjecaoApp");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("publicarProjecaoApp exige motivo e registra histórico", () => {
    const t = trechoDe("publicarProjecaoApp", "despublicarProjecaoApp");
    expect(t).toContain("motivo?: string");
    expect(t).toContain("Motivo não informado (fluxo sem confirmação humana explícita).");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("despublicarProjecaoApp registra histórico", () => {
    expect(trechoDe("despublicarProjecaoApp", "ticketInterno")).toContain("registrarTimelineCaso(");
  });

  it("responderTicketEquipe registra histórico", () => {
    expect(trechoDe("responderTicketEquipe", "atualizarStatusTicket")).toContain("registrarTimelineCaso(");
  });

  it("atualizarStatusTicket registra histórico", () => {
    const t = fn.slice(fn.indexOf("export const atualizarStatusTicket"));
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("atendimento-interno.tsx — confirmação humana nas duas ações antes desprotegidas", () => {
  it("'Confirmar documentos mínimos deste caso' está dentro de AcaoOperacional com acaoExterna", () => {
    const idx = rota.indexOf("Confirmar documentos mínimos deste caso");
    expect(idx).toBeGreaterThan(-1);
    const trecho = rota.slice(Math.max(0, idx - 400), idx + 500);
    expect(trecho).toContain("<AcaoOperacional");
    expect(trecho).toContain('acaoExterna="confirmar_documentos_minimos"');
  });

  it("'Publicar' no App Cliente está dentro de AcaoOperacional com acaoExterna", () => {
    expect(rota).toContain('acaoExterna="publicar_projecao_app_cliente"');
    expect(rota).not.toMatch(/onClick=\{\(\) => publicar\.mutate\(\{ caseId: casoSelecionado\.id, tipo: publicacaoTipo, conteudo: publicacaoTexto \}\)\}/);
  });
});
