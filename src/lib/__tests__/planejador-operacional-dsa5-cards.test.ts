import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * DSA-5 (corte C9 — Planejador/case_plans): quinto consumidor real do
 * Design System no Desk (DSA-1 a DSA-4). Mesma regra: não cria componente
 * novo, só aplica CaCard já existente ao estado "fechado" do Planejador do
 * caso (resumo + convite a preencher) em planejador-operacional.tsx. O
 * formulário do estado "aberto" continua com Painel — corte aditivo.
 */
const ARQUIVO = readFileSync("src/components/contrato/planejador-operacional.tsx", "utf8");

describe("DSA-5 — CaCard no estado fechado do Planejador do caso", () => {
  it("importa CaCard do módulo canônico, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
  });

  it('estado fechado ("!aberto") usa CaCard, não mais Painel', () => {
    const idx = ARQUIVO.indexOf("if (!aberto)");
    expect(idx).toBeGreaterThan(-1);
    const bloco = ARQUIVO.slice(idx, idx + 900);
    expect(bloco).toMatch(/<CaCard titulo="Planejador do caso" eyebrow="Cadeia Operacional · Elo 1">/);
    expect(bloco).toMatch(/<\/CaCard>/);
  });

  it("formulário do estado aberto continua com Painel (troca é aditiva, não reescrita)", () => {
    const ocorrencias = ARQUIVO.match(/<Painel titulo="Planejador do caso">/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });

  it("nenhum hex literal foi introduzido (regra 1 de regras-de-uso.md)", () => {
    expect(ARQUIVO).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });
});
