import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * DSA-5 (corte C9 — Planejador/case_plans): quinto consumidor real do
 * Design System no Desk (DSA-1 a DSA-4). Mesma regra: não cria componente
 * novo, só aplica CaCard já existente ao estado "fechado" do Planejador do
 * caso (resumo + convite a preencher) em planejador-operacional.tsx.
 *
 * Atualizado em 23/09/2026 (DSA-10, iniciativa Painel → Cartão Canônico):
 * o formulário do estado "aberto", que continuava com `Painel` desde o
 * corte C9, migrou para `<CaCard variante="compacto">` — mesmo visual,
 * chamada direta ao componente canônico em vez do adapter.
 */
const ARQUIVO = readFileSync("src/components/contrato/planejador-operacional.tsx", "utf8");

describe("DSA-5 — CaCard no estado fechado do Planejador do caso", () => {
  it("importa CaCard do módulo canônico, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
  });

  it('estado fechado ("!aberto") usa CaCard, não mais Painel', () => {
    const idx = ARQUIVO.indexOf("if (!aberto)");
    expect(idx).toBeGreaterThan(-1);
    const fim = ARQUIVO.indexOf("</CaCard>", idx);
    expect(fim).toBeGreaterThan(idx);
    const bloco = ARQUIVO.slice(idx, fim);
    expect(bloco).toMatch(/<CaCard titulo="Planejador do caso" eyebrow="Cadeia Operacional · Elo 1">/);
  });

  it("formulário do estado aberto migrou para CaCard variante compacto (DSA-10), mesmo visual de Painel", () => {
    expect(ARQUIVO).not.toMatch(/<Painel[\s>]/);
    const ocorrencias = ARQUIVO.match(/<CaCard variante="compacto" titulo="Planejador do caso">/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });

  it("nenhum hex literal foi introduzido (regra 1 de regras-de-uso.md)", () => {
    expect(ARQUIVO).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });
});
