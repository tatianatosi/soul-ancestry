import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { TRANSICOES } from "@/lib/estados";

const ler = (p: string) => readFileSync(p, "utf8");

/**
 * 28/08/2026 — a Ana Luiza viu "Requisitos de ativação" com os 14 itens
 * validados (verde) e mesmo assim "Ativação bloqueada: Transição de caso
 * não permitida: rascunho -> ativo". Causa: `ativarCasoComChecks` tentava
 * pular direto de "rascunho" para "ativo" num único UPDATE — a máquina de
 * estados (estados.ts, espelhada em trigger no banco) nunca permitiu esse
 * salto; sempre exigiu passar por um estado intermediário e por
 * "pronto_para_ativar". Os 14 requisitos de negócio estavam certos; faltava
 * caminhar pelos estados intermediários que a trava do banco exige.
 */
describe("Ativação de caso — caminha pelos estados intermediários exigidos pelo banco", () => {
  const fn = ler("src/lib/onboarding.functions.ts");

  it("nunca salta direto de rascunho para ativo na máquina de estados canônica", () => {
    expect(TRANSICOES.caso["rascunho"]).not.toContain("ativo");
  });

  it("ativarCasoComChecks não faz mais update direto para ativo sem checar o estado atual", () => {
    const trecho = fn.slice(fn.indexOf("export const ativarCasoComChecks"), fn.indexOf("export const suspenderCaso"));
    expect(trecho).not.toMatch(/\.update\(\{\s*status:\s*"ativo"/);
  });

  it("ativarCasoComChecks lê o status atual do caso antes de transicionar", () => {
    const trecho = fn.slice(fn.indexOf("export const ativarCasoComChecks"), fn.indexOf("export const suspenderCaso"));
    expect(trecho).toContain('.select("status")');
  });

  it("o caminho declarado até ativo respeita a máquina de estados canônica (estados.ts)", () => {
    const trecho = fn.slice(fn.indexOf("export const ativarCasoComChecks"), fn.indexOf("export const suspenderCaso"));
    const inicio = trecho.indexOf("caminhoAteAtivo: Record<string, string> = {");
    const bloco = trecho.slice(inicio, trecho.indexOf("};", inicio));
    const pares = [...bloco.matchAll(/(\w+):\s*"(\w+)"/g)].map((m) => [m[1], m[2]] as const);
    for (const [de, para] of pares) {
      expect(TRANSICOES.caso[de], `estados.ts não lista transições para "${de}"`).toBeDefined();
      expect(
        TRANSICOES.caso[de],
        `caminhoAteAtivo declara ${de} → ${para}, mas estados.ts não permite essa transição`,
      ).toContain(para);
    }
  });
});
