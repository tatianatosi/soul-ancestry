import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { compararPersistencia, normalizarValor } from "@/lib/verificacao-persistencia";

/**
 * 24/09/2026 — lacunas técnicas de releitura fechadas (P4, P6, D7). Antes:
 * o recálculo do plano de onboarding e a criação das micro-entregas só
 * conferiam o id afetado. Agora gravam, relêem e comparam — e a comparação
 * de jsonb não acusa divergência falsa por ordem de chave.
 */

describe("normalizarValor — jsonb com chaves reordenadas pelo Postgres", () => {
  it("mesmo objeto em ordens diferentes é equivalente", () => {
    const enviado = [{ item: "Contrato assinado no caso", responsavel: "Comercial", status: "ok" }];
    const devolvidoPeloBanco = [{ item: "Contrato assinado no caso", status: "ok", responsavel: "Comercial" }];
    expect(normalizarValor(enviado)).toBe(normalizarValor(devolvidoPeloBanco));
    expect(compararPersistencia({ checklist_inicial: enviado }, { checklist_inicial: devolvidoPeloBanco })).toEqual([]);
  });
  it("objeto aninhado também", () => {
    expect(normalizarValor({ b: { y: 1, x: 2 }, a: 1 })).toBe(normalizarValor({ a: 1, b: { x: 2, y: 1 } }));
  });
  it("valor diferente continua divergindo", () => {
    const d = compararPersistencia(
      { checklist_inicial: [{ item: "Primeira micro-entrega planejada", status: "ok" }] },
      { checklist_inicial: [{ status: "pendente", item: "Primeira micro-entrega planejada" }] },
    );
    expect(d.map((x) => x.campo)).toEqual(["checklist_inicial"]);
  });
});

describe("writers com releitura", () => {
  const plano = readFileSync("src/lib/onboarding-plano.functions.ts", "utf8");
  const jornada = readFileSync("src/lib/jornada-cliente.functions.ts", "utf8");

  it("P4: recalcularPlanoOnboarding grava onboarding_planos com gravarComVerificacao", () => {
    const trecho = plano.slice(
      plano.indexOf("export const recalcularPlanoOnboarding"),
      plano.indexOf("export const criarPrimeiraMicroentregaOnboarding"),
    );
    expect(trecho).toContain("gravarComVerificacao({");
    expect(trecho).toContain('tabela: "onboarding_planos"');
    expect(trecho).not.toMatch(/\.from\("onboarding_planos"\)\s*\.update\(/);
  });

  it("D7: criarPrimeiraMicroentregaOnboarding insere com inserirComVerificacao e atualiza o checklist com releitura", () => {
    const trecho = plano.slice(plano.indexOf("export const criarPrimeiraMicroentregaOnboarding"));
    expect(trecho).toContain("inserirComVerificacao({");
    expect(trecho).toContain('tabela: "ops_microentregas"');
    expect(trecho).toContain("gravarComVerificacao({");
    expect(trecho).not.toMatch(/\.insert\(|\.update\(/);
  });

  it("P6: criarMicroentregaCliente insere com inserirComVerificacao e devolve o registro relido", () => {
    const trecho = jornada.slice(
      jornada.indexOf("export const criarMicroentregaCliente"),
      jornada.indexOf("export const transicionarMicroentrega"),
    );
    expect(trecho).toContain("inserirComVerificacao({");
    expect(trecho).toContain('approval_status: "rascunho"');
    expect(trecho).toContain("return criada.registro");
    expect(trecho).not.toMatch(/\.insert\(/);
  });
});
