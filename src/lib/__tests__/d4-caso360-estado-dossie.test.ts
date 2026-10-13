import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { estadoDossieDoCaso } from "@/lib/pesquisa-cadeia";

/**
 * §14 do De-Para (Caso 360, linha 6): Estado do dossiê — Confirmados, Em
 * revisão, Pendentes; donut; "deve reconciliar com o dossiê real".
 *
 * Regra: cada evidência está em exatamente um bucket, e a soma dos três é o
 * total real.
 */
const arquivo = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("estadoDossieDoCaso é uma partição — cada evidência em um único bucket", () => {
  it("comprovadas (aprovada_para_entrega / publicada)", () => {
    const r = estadoDossieDoCaso([
      { workflow_status: "aprovada_para_entrega" },
      { workflow_status: "publicada" },
    ]);
    expect(r.confirmados).toBe(2);
    expect(r.emRevisao).toBe(0);
    expect(r.pendentes).toBe(0);
  });

  it("em revisão (em_revisao, divergente, insuficiente)", () => {
    const r = estadoDossieDoCaso([
      { workflow_status: "em_revisao" },
      { workflow_status: "divergente" },
      { workflow_status: "insuficiente" },
    ]);
    expect(r.emRevisao).toBe(3);
    expect(r.confirmados).toBe(0);
    expect(r.pendentes).toBe(0);
  });

  it("qualquer outro estado do CHECK vira pendente", () => {
    const r = estadoDossieDoCaso([
      { workflow_status: "recebida" },
      { workflow_status: "registrada" },
      { workflow_status: "requer_complemento" },
      { workflow_status: "requer_retificacao" },
      { workflow_status: "requer_traducao_apostila" },
      { workflow_status: "rejeitada_inaplicavel" },
    ]);
    expect(r.pendentes).toBe(6);
  });

  it("nulo/vazio/desconhecido vira pendente (nunca 'outros')", () => {
    const r = estadoDossieDoCaso([
      { workflow_status: null },
      { workflow_status: undefined },
      { workflow_status: "" },
      { workflow_status: "estado_inventado" },
      {},
    ]);
    expect(r.pendentes).toBe(5);
    // "confirmados + emRevisao + pendentes" bate com total.
    expect(r.confirmados + r.emRevisao + r.pendentes).toBe(r.total);
  });

  it("array vazio devolve zeros — não lança e não fabrica", () => {
    const r = estadoDossieDoCaso([]);
    expect(r).toEqual({ confirmados: 0, emRevisao: 0, pendentes: 0, total: 0 });
  });

  it("total sempre bate com o comprimento do array recebido", () => {
    const misto = [
      { workflow_status: "publicada" },
      { workflow_status: "em_revisao" },
      { workflow_status: "requer_complemento" },
      { workflow_status: null },
    ];
    const r = estadoDossieDoCaso(misto);
    expect(r.confirmados + r.emRevisao + r.pendentes).toBe(misto.length);
    expect(r.total).toBe(misto.length);
  });
});

describe("Visão Geral do Caso 360 usa a partição e renderiza donut acessível", () => {
  it("chama estadoDossieDoCaso na aba de pesquisa/entregas", () => {
    expect(arquivo).toContain("estadoDossieDoCaso(evidencias)");
  });

  it("renderiza 'Soma bate com o dossiê real' — reconciliação explícita", () => {
    expect(arquivo).toContain("Soma bate com o dossiê real");
  });

  it("donut tem data-attribute e role=img com aria-label completo", () => {
    expect(arquivo).toContain("data-caso360-dossie-donut");
    expect(arquivo).toContain('role="img"');
    expect(arquivo).toContain("confirmados, ${dossie.emRevisao} em revisão");
  });

  it("rosca nunca some: caso sem evidência desenha anel neutro com 'Sem dados suficientes'", () => {
    const inicio = arquivo.indexOf("const donut = (() => {");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("})();", inicio));
    expect(trecho).not.toContain("return null");
    expect(arquivo).toContain("data-caso360-dossie-vazio");
    expect(arquivo).toContain("Sem dados suficientes");
    expect(arquivo).toContain("Nenhuma evidência registrada no caso ainda.");
  });

  it("caso vazio desenha anel cinza sem fatia e mostra a contagem real, sem travessão", () => {
    const inicio = arquivo.indexOf("if (semEvidencia) {");
    const ramoVazio = arquivo.slice(inicio, arquivo.indexOf("const g1", inicio));
    expect(ramoVazio).not.toContain("conic-gradient");
    expect(ramoVazio).not.toContain("—");
    expect(arquivo).not.toContain('semEvidencia ? "—"');
    expect(arquivo).toContain("{dossie.confirmados}</span>");
    expect(arquivo).toContain("{dossie.emRevisao}</span>");
    expect(arquivo).toContain("{dossie.pendentes}</span>");
  });

  it("três segmentos proporcionais visíveis, cores semânticas", () => {
    expect(arquivo).toContain("bg-emerald-600"); // confirmados
    expect(arquivo).toContain("bg-gold"); // em revisão
    expect(arquivo).toContain("bg-terracotta/70"); // pendentes
  });
});
