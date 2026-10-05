import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * A1 Home — reversão autorizada explicitamente pela Proprietária
 * (2026-09-23): o card "MICROENTREGA" público e autônomo (adicionado em
 * bc92174d) foi removido. Microentrega permanece interna — cadência
 * D0–D365, Desk, onboarding e fila de revisão. No App, resultado publicado
 * de microentrega só pode aparecer como Achado, Atualização da Jornada/
 * Próxima atualização, ou conteúdo no Legado — nunca como card próprio.
 */

const ROTA = resolve(__dirname, "../../routes/portal/index.tsx");
const codigo = readFileSync(ROTA, "utf8");

describe("A1 Home — card Microentrega público removido", () => {
  it("não existe mais seção própria de microentrega", () => {
    expect(codigo).not.toContain("data-microentrega-home");
  });

  it("não chama mais microentregaPublicada nesta rota", () => {
    expect(codigo).not.toContain("microentregaPublicada");
  });

  it("microentrega publicada aparece só em linha editorial, sem cartão próprio", () => {
    expect(codigo).toMatch(/microentrega=\{microentrega\}/);
    expect(codigo).toContain('border-t border-gold/30 pt-4');
    expect(codigo).not.toMatch(/\bmicentrega\?:/);
  });

  it("achados continua a única lista de publicações recentes na Home", () => {
    expect(codigo).toContain("achados={achadosPublicados.slice(0, 3)");
  });
});

describe("microentregaPublicada continua existindo como função pura (cadência interna)", () => {
  it("segue definida em portal-dados-vivos.ts, mesmo sem consumidor no App", () => {
    const modulo = readFileSync(resolve(__dirname, "../portal-dados-vivos.ts"), "utf8");
    expect(modulo).toContain("export function microentregaPublicada");
  });
});
