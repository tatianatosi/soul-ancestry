import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { onboardingLiberadoDoCaso } from "@/lib/onboarding-plano";

/*
 * Continuação da decisão da Proprietária, 2026-09-24: mapeamento do
 * vocabulário onboarding_planos.estado × case_plans confirmou que
 * `estado` é um campo derivado (estadoDoPlano só grava "bloqueado" ou
 * "liberado_preparacao" pela aplicação — nunca os outros 3 valores do
 * CHECK). Por isso `estado !== "bloqueado"` é matematicamente igual a
 * `motivos_bloqueio.length === 0`, e os dois leitores reais
 * (fechamento-caso.functions.ts, case-service-consolidacao.functions.ts)
 * passam a preferir case_plans.motivos_bloqueio (já espelhado), com
 * onboarding_planos.estado como fallback. Aprovado pela Proprietária
 * como "as 2 checagens comprovadamente equivalentes".
 */

describe("onboardingLiberadoDoCaso", () => {
  it("usa case_plans.motivos_bloqueio quando é a única fonte", () => {
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: [], estadoOnboardingPlanos: null })).toBe(true);
    expect(
      onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: ["Pagamento inicial confirmado pendente."], estadoOnboardingPlanos: null }),
    ).toBe(false);
  });

  /*
   * 24/09/2026 — regra conservadora antes de efetivar a migration: o
   * default de case_plans.motivos_bloqueio é []. Linha não espelhada ainda
   * não pode liberar um gate que onboarding_planos diz estar bloqueado.
   */
  it("com as duas fontes, divergência bloqueia; só libera quando ambas dizem liberado", () => {
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: [], estadoOnboardingPlanos: "bloqueado" })).toBe(false);
    expect(
      onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: ["Contrato assinado pendente."], estadoOnboardingPlanos: "liberado_preparacao" }),
    ).toBe(false);
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: [], estadoOnboardingPlanos: "liberado_preparacao" })).toBe(true);
  });

  it("cai para onboarding_planos.estado quando case_plans não tem a linha (fase onboarding) ainda", () => {
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: undefined, estadoOnboardingPlanos: "liberado_preparacao" })).toBe(true);
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: undefined, estadoOnboardingPlanos: "bloqueado" })).toBe(false);
  });

  it("sem plano nenhum (nem case_plans nem onboarding_planos), não libera", () => {
    expect(onboardingLiberadoDoCaso({})).toBe(false);
    expect(onboardingLiberadoDoCaso({ motivosBloqueioCasePlans: undefined, estadoOnboardingPlanos: null })).toBe(false);
  });
});

describe("fechamento-caso.functions.ts — usa a fonte compartilhada", () => {
  const fn = readFileSync("src/lib/fechamento-caso.functions.ts", "utf8");

  it("busca case_plans.motivos_bloqueio da fase onboarding e usa onboardingLiberadoDoCaso", () => {
    expect(fn).toContain('.from("case_plans")');
    expect(fn).toContain('.eq("fase_jornada", "onboarding")');
    expect(fn).toContain("onboardingLiberadoDoCaso({");
  });

  it("corrige o valor morto do domínio em onboardingMinimoConcluido (só 'em_andamento' existe no CHECK, não 'ativo'/'em_execucao')", () => {
    expect(fn).toContain('["concluido", "em_andamento"].includes(String(plano.estado ?? ""))');
    expect(fn).not.toContain('"ativo", "em_execucao"');
  });
});

describe("case-service-consolidacao.functions.ts — usa a fonte compartilhada", () => {
  const fn = readFileSync("src/lib/case-service-consolidacao.functions.ts", "utf8");

  it("busca case_plans.motivos_bloqueio da fase onboarding e usa onboardingLiberadoDoCaso", () => {
    expect(fn).toContain('.from("case_plans")');
    expect(fn).toContain('.eq("fase_jornada", "onboarding")');
    expect(fn).toContain("onboardingLiberadoDoCaso({");
  });
});
