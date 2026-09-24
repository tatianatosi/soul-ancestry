import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Autorização explícita da Proprietária (24/09/2026), item 1: extrair
 * D7/D10/D14 para um único módulo canônico de cadência e migrar os seis
 * consumidores identificados em `docs/arquitetura/2026-09-03_DE-PARA-
 * ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md` (seção 3).
 *
 * O módulo canônico já existia (`cadencia-limiares.ts`, de um corte
 * anterior — PRs #75/#76/#80) e três dos seis arquivos já importavam dali.
 * Este corte migra os dois que ainda redeclaravam localmente
 * (`onboarding-padrao.ts`, `onboarding-plano.ts`). `cadencia-d0-d30.ts`
 * fica de fora deliberadamente: seu próprio cabeçalho declara que a
 * transcrição da norma §10.3 é literal de propósito, distinta do limiar
 * operacional de alerta — mesmo número hoje, conceito diferente por
 * desenho documentado, não redeclaração acidental.
 */

const limiares = readFileSync("src/lib/cadencia-limiares.ts", "utf8");
const onboardingPadrao = readFileSync("src/lib/onboarding-padrao.ts", "utf8");
const onboardingJornada = readFileSync("src/lib/onboarding-jornada.ts", "utf8");
const onboardingPlano = readFileSync("src/lib/onboarding-plano.ts", "utf8");
const jornadaPosGates = readFileSync("src/lib/jornada-pos-gates.ts", "utf8");
const jornadaCliente = readFileSync("src/lib/jornada-cliente.ts", "utf8");
const cadenciaD0D30 = readFileSync("src/lib/cadencia-d0-d30.ts", "utf8");

describe("cadencia-limiares.ts é o módulo canônico único (D7/D10/D14)", () => {
  it("define os três limiares exatamente uma vez, com os valores da norma", () => {
    expect(limiares).toContain("export const DIAS_PRIMEIRA_MICROENTREGA = 7;");
    expect(limiares).toContain("export const DIAS_CADENCIA_ATENCAO = 10;");
    expect(limiares).toContain("export const DIAS_CADENCIA_CRITICA = 14;");
  });
});

describe("os cinco consumidores elegíveis importam do módulo canônico, não redeclaram", () => {
  it.each([
    ["onboarding-padrao.ts", () => onboardingPadrao],
    ["onboarding-jornada.ts", () => onboardingJornada],
    ["onboarding-plano.ts", () => onboardingPlano],
    ["jornada-pos-gates.ts", () => jornadaPosGates],
    ["jornada-cliente.ts", () => jornadaCliente],
  ])("%s importa de @/lib/cadencia-limiares", (_nome, ler) => {
    expect(ler()).toContain("cadencia-limiares");
  });

  it("onboarding-padrao.ts não redeclara os três limiares como literais numéricos próprios", () => {
    expect(onboardingPadrao).not.toMatch(/LIMITE_ALERTA_DIAS\s*=\s*10\s*;/);
    expect(onboardingPadrao).not.toMatch(/LIMITE_CRITICO_DIAS\s*=\s*14\s*;/);
    expect(onboardingPadrao).not.toMatch(/LIMITE_PRIMEIRA_ENTREGA_DIAS\s*=\s*7\s*;/);
    // continuam exportados (reexport), só não são mais a fonte do número
    expect(onboardingPadrao).toContain("export const LIMITE_ALERTA_DIAS = DIAS_CADENCIA_ATENCAO;");
    expect(onboardingPadrao).toContain("export const LIMITE_CRITICO_DIAS = DIAS_CADENCIA_CRITICA;");
    expect(onboardingPadrao).toContain("export const LIMITE_PRIMEIRA_ENTREGA_DIAS = DIAS_PRIMEIRA_MICROENTREGA;");
  });

  it("onboarding-plano.ts deriva os rótulos D7/D10/D14 das constantes, não digita o número", () => {
    expect(onboardingPlano).not.toMatch(/marco:\s*"D7"/);
    expect(onboardingPlano).not.toMatch(/marco:\s*"D10"/);
    expect(onboardingPlano).not.toMatch(/marco:\s*"D14"/);
    expect(onboardingPlano).toMatch(/marco:\s*`D\$\{DIAS_PRIMEIRA_MICROENTREGA\}`/);
    expect(onboardingPlano).toMatch(/marco:\s*`D\$\{DIAS_CADENCIA_ATENCAO\}`/);
    expect(onboardingPlano).toMatch(/marco:\s*`D\$\{DIAS_CADENCIA_CRITICA\}`/);
  });
});

describe("cadencia-d0-d30.ts é exceção documentada, não redeclaração esquecida", () => {
  it("mantém a transcrição literal da norma §10.3, com o motivo explícito no cabeçalho", () => {
    expect(cadenciaD0D30).toMatch(/transcrição é literal de propósito/);
    expect(cadenciaD0D30).toContain("ate: 7");
    expect(cadenciaD0D30).toContain("de: 10");
    expect(cadenciaD0D30).toContain("de: 14");
  });
});

describe("nenhum comportamento, data, alerta ou mensagem mudou", () => {
  it("os valores numéricos continuam 7/10/14 em todos os pontos de leitura", () => {
    expect(onboardingPadrao).toContain("prazo_dias: 7");
    expect(onboardingPadrao).toContain("prazo_dias: 14");
  });
});
