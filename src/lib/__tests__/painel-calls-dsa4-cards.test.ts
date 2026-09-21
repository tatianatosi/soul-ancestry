import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * DSA-4 (corte C8 — CRM Vivo/Painel de Calls): quarto consumidor real do
 * Design System no Desk (DSA-1 = qualidade.tsx, DSA-2 = painel.tsx,
 * DSA-3 = pesquisa-modulo.index.tsx). Mesma regra: não cria componente
 * novo, só aplica CaCard já existente ao grid de 5 números-resumo da Mesa
 * de Discovery (dentro de painel-calls.tsx). O Kanban do CRM Vivo
 * (clube-ancestral-kit) e o restante da tela permanecem intocados.
 */
const ARQUIVO = readFileSync("src/components/crm/painel-calls.tsx", "utf8");

describe("DSA-4 — CaCard aplicado ao resumo da Mesa de Discovery (CRM Vivo)", () => {
  it("importa CaCard do módulo canônico, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
  });

  it("o grid de números-resumo (Calls de hoje, etc.) está dentro de um CaCard", () => {
    const idx = ARQUIVO.indexOf('"Calls de hoje"');
    expect(idx).toBeGreaterThan(-1);
    const antes = ARQUIVO.slice(Math.max(0, idx - 400), idx);
    expect(antes).toMatch(/<CaCard/);
  });

  it("o Kanban do CRM Vivo (clube-ancestral-kit) continua fora deste corte", () => {
    expect(ARQUIVO).toMatch(/CrmKanban/);
    expect(ARQUIVO).toMatch(/from "@\/components\/clube-ancestral-kit"/);
  });

  it("nenhum hex literal foi introduzido (regra 1 de regras-de-uso.md)", () => {
    expect(ARQUIVO).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });
});
