import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Fila v2, bloco B (04/11/2026): contrato — B03 e B04. */
const ler = (p: string) => readFileSync(p, "utf8");
const funcoes = ler("src/lib/contratos.functions.ts");
const tela = ler("src/routes/_authenticated/contratos.$id.tsx");

describe("B03 — cancelar contrato com motivo, distinto de arquivar", () => {
  const fn = funcoes.slice(funcoes.indexOf("export const cancelarContrato"), funcoes.indexOf("/* ==================== ORDENS DE SERVIÇO"));

  it("grava status cancelled com cancellation_reason (vocabulário do CHECK), sem archived_at", () => {
    expect(fn).toContain('payload: { status: "cancelled", cancellation_reason: motivo }');
    expect(fn).not.toContain("archived_at");
    expect(fn).toContain('if (!motivo) throw new Error("Cancelamento exige motivo.")');
  });

  it("contrato assinado, já cancelado ou arquivado não é cancelado", () => {
    expect(funcoes).toContain('STATUS_QUE_NAO_CANCELAM = ["signed", "cancelled", "archived"]');
    expect(fn).toContain("Contrato assinado não é cancelado");
  });

  it("a tela oferece Cancelar contrato separado de Arquivar, com motivo", () => {
    expect(tela).toContain('rotulo="Cancelar contrato"');
    expect(tela).toContain("await cancelar({ data: { contract_id: id, motivo } })");
    expect(tela).toContain('rotulo="Arquivar"');
  });
});

describe("B04 — Enviar ao cliente abre a fila de atendimento no rascunho", () => {
  it("o servidor devolve o id do rascunho, criado agora ou já existente", () => {
    const envio = funcoes.slice(funcoes.indexOf("criarRascunhoSeNaoHouver(supabase"), funcoes.indexOf("export const arquivarContrato"));
    expect(envio.split("rascunhoId: fila.id").length - 1).toBe(2);
  });

  it("a tela navega para /atendimento?rascunho=<id>", () => {
    expect(tela).toContain('navigate({ to: "/atendimento", search: { rascunho: rascunhoId } })');
  });
});

