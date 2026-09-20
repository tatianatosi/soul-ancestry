import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 10. Últimos gaps
// pontuais espalhados por arquivos já parcialmente corrigidos: ops.functions.ts
// (salvarTarefa/moverTarefa já tinham histórico do Lote 1), qualidade.functions.ts
// (nenhum escritor tinha), handoff-discovery.functions.ts (só o ramo de caso
// novo registrava, o de reaproveitar caso existente não), crm-desk.functions.ts
// (arquivarLeadDesk nunca checava se o lead já tinha caso) e
// portal.functions.ts (definirCasoDoAcesso tinha auditoria mas não histórico
// nem confirmação humana — só definirLiberacaoCaso, ao lado, tinha as duas).

const ops = readFileSync("src/lib/ops.functions.ts", "utf8");
const qualidade = readFileSync("src/lib/qualidade.functions.ts", "utf8");
const handoff = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");
const crmDesk = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const portalFn = readFileSync("src/lib/portal.functions.ts", "utf8");
const acessosRota = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");

function trechoDe(conteudo: string, nomeFn: string, proximaFn: string) {
  return conteudo.slice(conteudo.indexOf(`export const ${nomeFn}`), conteudo.indexOf(`export const ${proximaFn}`));
}

describe("ops.functions.ts — histórico nos escritores que faltavam", () => {
  it("salvarMicroentrega registra histórico na criação e na atualização", () => {
    const t = trechoDe(ops, "salvarMicroentrega", "arquivarOps");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("arquivarOps registra histórico (tarefas e ops_microentregas)", () => {
    const t = trechoDe(ops, "arquivarOps", "salvarRegraSla");
    expect(t).toContain('r.registro["caso_id"]');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarExcecao registra histórico quando vinculada a um caso", () => {
    const t = ops.slice(ops.indexOf("export const registrarExcecao"));
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("qualidade.functions.ts — histórico nos dois escritores case-scoped", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(qualidade).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("tratarInconsistencia registra histórico", () => {
    const t = trechoDe(qualidade, "tratarInconsistencia", "relatorioSemanal");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("marcarItemChecklist registra histórico", () => {
    const t = trechoDe(qualidade, "marcarItemChecklist", "previewExportacao");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("handoff-discovery.functions.ts — ramo de caso reaproveitado agora registra histórico", () => {
  it("executarHandoffDiscovery registra histórico ao reaproveitar caso existente (lead.case_id)", () => {
    const idx = handoff.indexOf("if (lead.case_id) {");
    const fimRamo = handoff.indexOf("clienteCriado: false,\n        casoCriado: false,");
    const trecho = handoff.slice(idx, fimRamo + 60);
    expect(trecho).toContain("Handoff Discovery reaproveitou caso já existente");
    expect(trecho).toContain("registrarTimelineCaso(");
  });
});

describe("crm-desk.functions.ts — arquivarLeadDesk registra histórico quando o lead já tem caso", () => {
  it("checa lead.case_id e registra histórico", () => {
    const t = crmDesk.slice(crmDesk.indexOf("export const arquivarLeadDesk"), crmDesk.indexOf("export const painelHojeDesk"));
    expect(t).toContain("if (lead.case_id)");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("portal.functions.ts — definirCasoDoAcesso agora tem histórico e exige motivo", () => {
  it("exige motivo (mesmo padrão de definirLiberacaoCaso) e registra histórico", () => {
    const t = portalFn.slice(
      portalFn.indexOf("export const definirCasoDoAcesso"),
      portalFn.indexOf("export const definirLiberacaoCaso"),
    );
    expect(t).toContain("Motivo não informado (fluxo sem confirmação humana explícita).");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("acessos-portal.tsx — Revogar/Reativar caso agora exigem confirmação humana", () => {
  it("'Revogar caso' está dentro de AcaoOperacional com acaoExterna", () => {
    expect(acessosRota).toContain('acaoExterna="revogar_caso_do_acesso_portal"');
    expect(acessosRota).not.toContain("window.prompt(\"Motivo da revogação do caso (opcional):\")");
  });

  it("'Reativar caso' está dentro de AcaoOperacional com acaoExterna", () => {
    expect(acessosRota).toContain('acaoExterna="reativar_caso_do_acesso_portal"');
  });
});
