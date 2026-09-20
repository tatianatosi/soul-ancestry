import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 4, batch 15 (prioridade Alta).
// ops/desk-operacional.tsx (Kanban de tarefas), acessos-portal.tsx (4 CTAs
// de acesso, além dos já corrigidos no Lote 2), propostas.tsx e
// casos.$caseId.contrato.preparar.tsx.

const desk = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");
const acessos = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");
const propostas = readFileSync("src/routes/_authenticated/propostas.tsx", "utf8");
const contrato = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");
const portalFn = readFileSync("src/lib/portal.functions.ts", "utf8");

describe("nenhum window.prompt() restante nos quatro arquivos do batch", () => {
  it.each([
    ["desk-operacional.tsx", desk],
    ["acessos-portal.tsx", acessos],
    ["propostas.tsx", propostas],
    ["casos.$caseId.contrato.preparar.tsx", contrato],
  ])("%s", (_nome, conteudo) => {
    expect(conteudo).not.toContain("window.prompt(");
  });
});

describe("ops/desk-operacional.tsx — bloquear/desbloquear/arquivar tarefa", () => {
  it("bloquear e desbloquear usam AcaoOperacional via tipoConfirmacaoStatus", () => {
    expect(desk).toContain("function tipoConfirmacaoStatus(t: Linha, status: string)");
    expect(desk).toContain('acaoExterna={tipo === "bloqueio" ? "bloquear_tarefa" : "desbloquear_tarefa"}');
  });

  it("arquivar tarefa usa AcaoOperacional", () => {
    expect(desk).toContain('acaoExterna="arquivar_ops"');
  });

  it("Kanban exclui destinos que exigem confirmação do select rápido", () => {
    const idx = desk.indexOf('"kanban"');
    const trecho = desk.slice(idx);
    expect(trecho).toContain("!tipoConfirmacaoStatus(t, s)");
  });
});

describe("acessos-portal.tsx — recusar/revogar, suspender, reativar, revogar", () => {
  it("os 4 CTAs usam AcaoOperacional", () => {
    expect(acessos).toContain('acaoExterna="revogar_ou_recusar_email_autorizado"');
    expect(acessos).toContain('acaoExterna="suspender_acesso_portal"');
    expect(acessos).toContain('acaoExterna="reativar_acesso_portal"');
    expect(acessos).toContain('acaoExterna="revogar_acesso_portal"');
  });
});

describe("portal.functions.ts::alterarStatusAcessoPortal — passou a registrar histórico por caso vinculado", () => {
  it("busca os casos vinculados via client_portal_case_access e registra evento em cada um", () => {
    const trecho = portalFn.slice(
      portalFn.indexOf("export const alterarStatusAcessoPortal"),
      portalFn.indexOf("export const definirCasoDoAcesso"),
    );
    expect(trecho).toContain('.from("client_portal_case_access")');
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
  });
});

describe("propostas.tsx — Arquivar/Restaurar", () => {
  it("usam AcaoOperacional", () => {
    expect(propostas).toContain('acaoExterna="arquivar_proposta"');
    expect(propostas).toContain('acaoExterna="restaurar_proposta"');
  });
});

describe("casos.$caseId.contrato.preparar.tsx — Congelar retorno para ajuste / versão final", () => {
  it("usam AcaoOperacional", () => {
    expect(contrato).toContain('acaoExterna="congelar_retorno_ajuste"');
    expect(contrato).toContain('acaoExterna="congelar_versao_final"');
  });
});
