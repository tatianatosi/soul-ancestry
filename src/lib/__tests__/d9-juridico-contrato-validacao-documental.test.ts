import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * D9 (§20 do De-Para — Desk Jurídico & Contrato, zona 4 "Validação
 * jurídica": "cadeia documental completa validada... estados claros").
 *
 * `crm_casos.documentos_minimos_ok` já existia e já é o gate real que o
 * portal do cliente consulta (AGENTS.md: preservar o escritor
 * `confirmarDocumentosMinimos`), mas nunca era lido nem exibido na tela
 * de contrato do mesmo caso — a validação documental "desaparecia" ao
 * sair do portal. Este corte só lê e exibe o campo, sem gate novo,
 * sem mutation nova, sem inventar um segundo booleano.
 */

const LOADER = resolve(__dirname, "../contrato-preparar.functions.ts");
const ROTA = resolve(__dirname, "../../routes/_authenticated/casos.$caseId.contrato.preparar.tsx");

describe("D9 · loader inclui documentos_minimos_ok no select e no retorno", () => {
  const loader = readFileSync(LOADER, "utf8");

  it("select de crm_casos inclui a coluna real", () => {
    expect(loader).toMatch(/\.select\(\s*\n?\s*"[^"]*documentos_minimos_ok[^"]*"/);
  });

  it("objeto `caso` retornado expõe documentos_minimos_ok sem renomear", () => {
    expect(loader).toMatch(/documentos_minimos_ok: caso\.documentos_minimos_ok/);
  });
});

describe("D9 · rota exibe estado de validação documental, nunca oculto", () => {
  const rota = readFileSync(ROTA, "utf8");

  it("marca o bloco com data-contrato-validacao-documental", () => {
    expect(rota).toContain("data-contrato-validacao-documental");
  });

  it("dois estados claros: completo (ok) vs pendente (alerta) — nunca terceiro estado inventado", () => {
    expect(rota).toMatch(/Validação jurídica: cadeia documental completa/);
    expect(rota).toMatch(/Validação jurídica: documentos mínimos pendentes/);
    expect(rota).toMatch(/tom=\{d\.caso\.documentos_minimos_ok \? "ok" : "alerta"\}/);
  });

  it("está na faixa de status do cabeçalho, ao lado de Completude/Modelo/Base — não escondido em aba secundária", () => {
    const idxCabecalho = rota.indexOf("Caso em preparação:");
    const idxValidacao = rota.indexOf("data-contrato-validacao-documental");
    const idxFimFaixa = rota.indexOf("</div>", idxValidacao);
    expect(idxCabecalho).toBeGreaterThan(0);
    expect(idxValidacao).toBeGreaterThan(idxCabecalho);
    expect(idxFimFaixa).toBeGreaterThan(idxValidacao);
  });
});
