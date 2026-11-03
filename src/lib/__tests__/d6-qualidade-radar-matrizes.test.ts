import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * §16 do De-Para (Desk — Radar & Matrizes). Teste de comportamento em
 * arquivo, verificando que os 3 gaps identificados no plano foram fechados:
 *   1. título renomeado de "Radar Interno" → "Radar & Matrizes";
 *   2. legenda de ordem de atendimento com contagem por sinal + chip
 *      "Sem dados reais" quando a carteira está vazia;
 *   3. botão "Abrir próxima ação" no Radar Individual.
 * Sem inventar sinal: os rótulos vêm de `ROTULO_SINAL` (prioridade-matriz.ts),
 * fonte já canônica.
 */

const ROTA = resolve(__dirname, "../../routes/_authenticated/qualidade.tsx");
const MATRIZ = resolve(__dirname, "../../components/desk/matriz-prioridades-conectada.tsx");
const RADAR = resolve(__dirname, "../../components/desk/radar-interno-integrado.tsx");

describe("D6 Radar & Matrizes — descrição da rota alinhada ao De-Para §16", () => {
  const rota = readFileSync(ROTA, "utf8");

  it("título renomeado para Radar & Matrizes nas 4 fontes canônicas (D6, 23/09/2026)", () => {
    expect(rota).toMatch(/titulo="Radar & Matrizes"/);
    expect(rota).not.toContain('titulo="Radar Interno"');
  });

  it("descreve a sincronização matriz × radar individual, sem inventar promessa", () => {
    expect(rota).toMatch(/sincronizados/i);
  });
});

describe("D6 Radar & Matrizes — legenda de ordem por sinal na Matriz", () => {
  const matriz = readFileSync(MATRIZ, "utf8");

  it("reusa ROTULO_SINAL de prioridade-matriz.ts, não redefine rótulo", () => {
    expect(matriz).toMatch(/from "@\/lib\/prioridade-matriz"/);
    expect(matriz).toContain("ROTULO_SINAL");
  });

  it("marca a legenda com data-radar-legenda-ordem para o Lovable achar", () => {
    expect(matriz).toContain("data-radar-legenda-ordem");
  });

  it("expõe cada sinal em data-attribute (não só em cor)", () => {
    expect(matriz).toContain("data-radar-chip-sinal=");
  });

  it("mostra chip Dados insuficientes quando a carteira canônica está vazia", () => {
    // 31/10/2026 — o editor trocou "Sem dados reais" por "Dados insuficientes" (mesmo estado, vazio honesto).
    expect(matriz).toContain("data-radar-chip-sem-dados");
    expect(matriz).toMatch(/Dados insuficientes/);
  });

  it("conta casos por sinal a partir do array já posicionado, sem query nova", () => {
    expect(matriz).toContain("contarPorSinal(casos)");
  });
});

describe("D6 Radar & Matrizes — Abrir próxima ação no Radar Individual", () => {
  const radar = readFileSync(RADAR, "utf8");

  it("botão marcado com data-radar-abrir-proxima-acao aponta para hash proxima-acao", () => {
    expect(radar).toContain("data-radar-abrir-proxima-acao");
    expect(radar).toMatch(/hash="proxima-acao"/);
  });

  it("continua oferecendo Abrir Caso 360 e Ver jornada, sem substituir por só um link", () => {
    expect(radar).toMatch(/Abrir Caso 360/);
    expect(radar).toMatch(/Ver jornada e ações/);
  });
});
