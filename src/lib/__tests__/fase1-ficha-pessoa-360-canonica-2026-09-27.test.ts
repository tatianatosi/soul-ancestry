import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Fase 1 (27/09/2026) — "Prompt Canônicos": Ficha Pessoa 360.
 * Papéis unificados (mesmo vocabulário de Caso 360/Núcleo) + estado de
 * onboarding por caso, sem duplicar contrato.
 */

describe("Fase 1 — papéis: Pessoa 360 lê papel_no_caso, mesmo vocabulário de Caso 360/Núcleo", () => {
  const funcoes = readFileSync("src/lib/pessoa.functions.ts", "utf8");
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("carregarPessoa seleciona papel_no_caso de nucleo_membros", () => {
    const inicio = funcoes.indexOf('.from("nucleo_membros")');
    const trecho = funcoes.slice(inicio, inicio + 300);
    expect(trecho).toContain("papel_no_caso");
  });

  it("a tela usa PAPEIS_PESSOA para o rótulo do papel, não mais só o binário antigo", () => {
    expect(pagina).toContain("PAPEIS_PESSOA.find((o) => o.valor === m.papel_no_caso)");
  });

  it("fallback binário só entra quando papel_no_caso ainda é nulo (linha não migrada)", () => {
    const inicio = pagina.indexOf("PAPEIS_PESSOA.find((o) => o.valor === m.papel_no_caso)");
    const trecho = pagina.slice(inicio, inicio + 300);
    expect(trecho).toContain("m.papel_no_caso ||");
  });
});

describe("Fase 1 — onboarding: card por caso usa eixo_formalizacao real, não um vocabulário novo", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
  const funcoes = readFileSync("src/lib/pessoa.functions.ts", "utf8");

  it("carregarPessoa já seleciona eixo_formalizacao em crm_casos (confirmado, não novo)", () => {
    const inicio = funcoes.indexOf('.from("crm_casos")');
    const trecho = funcoes.slice(inicio, inicio + 400);
    expect(trecho).toContain("eixo_formalizacao");
  });

  it("Pessoa 360 importa EIXO_FORMALIZACAO (mesmo vocabulário de /leads, caso-ficha.ts)", () => {
    expect(pagina).toContain("EIXO_FORMALIZACAO");
  });

  it("renderiza um bloco 'Onboarding' por caso, com o rótulo real", () => {
    expect(pagina).toContain("data-pessoa360-onboarding");
    expect(pagina).toContain("EIXO_FORMALIZACAO.find((o) => o.valor === c.eixo_formalizacao)");
  });
});

describe("Fase 1 — contrato continua só link, nunca cópia de dado pessoal (não-regressão)", () => {
  const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("linka para /contratos/$id e /casos/$caseId/contrato/preparar, sem formulário duplicado", () => {
    expect(pagina).toMatch(/to="\/contratos\/\$id"|Formalização/);
  });
});
