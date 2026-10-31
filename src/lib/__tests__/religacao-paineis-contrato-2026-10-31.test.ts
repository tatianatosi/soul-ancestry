import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { avancosDoContrato, estadoDeEdicaoDoContrato } from "@/lib/avanco-contrato";
import type { PassoContrato } from "@/lib/contrato-prontidao";
import { etapasContratuaisDosPassos } from "@/lib/etapas-contrato-timeline";

const ler = (p: string) => readFileSync(p, "utf8");

const passo = (chave: string, estado: PassoContrato["estado"]): PassoContrato =>
  ({
    chave,
    rotulo: chave,
    estado,
    detalhe: `detalhe ${chave}`,
    ancora: `#${chave}`,
  }) as PassoContrato;

describe("etapasContratuaisDosPassos", () => {
  it("mapeia ok/bloqueado e marca só o primeiro pendente como em andamento", () => {
    const e = etapasContratuaisDosPassos([
      passo("proposta", "ok"),
      passo("partes", "pendente"),
      passo("escopo", "pendente"),
      passo("comercial", "bloqueado"),
    ]);
    expect(e.map((x) => x.status)).toEqual([
      "concluido",
      "em_andamento",
      "aguardando",
      "bloqueado",
    ]);
    expect(e.every((x) => x.data === "" && x.responsavel === "")).toBe(true);
  });
});

describe("avancosDoContrato", () => {
  it("lista os 3 atos de avanço e nunca bloqueia salvar rascunho", () => {
    const passos = [passo("proposta", "pendente"), passo("partes", "pendente")];
    const linhas = avancosDoContrato(passos, "admin");
    expect(linhas.map((l) => l.operacao)).toEqual([
      "aprovar_proposta",
      "congelar_previa",
      "solicitar_assinatura",
    ]);
    expect(estadoDeEdicaoDoContrato(passos)).toBe("rascunho_editavel");
  });
});

describe("peças de contrato montadas nas telas", () => {
  const preparar = ler("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
  it("preparar monta painel-preparacao, painel-instrumentos, avanço, timeline e auditoria", () => {
    for (const nome of [
      "PainelPreparacao",
      "PainelInstrumentos",
      "AvancoDoContrato",
      "TimelineContratualDesk",
      "AuditoriaDaPreparacao",
    ]) {
      expect(preparar).toContain(`<${nome}`);
    }
  });
  it("inventário exporta CSV e mantém o V4 sem o painel de 7 contadores", () => {
    const idx = ler("src/routes/_authenticated/contratos.index.tsx");
    expect(idx).not.toContain("<PainelEstadoContratual"); // decisão V4 de 21/10 mantida
    expect(idx).toContain("baixarCsvInventario");
  });
});
