import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial V4 — sexta rodada (Proprietária, 13/10/2026): o mockup de
 * referência pede botões "Filtros" e "+ Novo lead" no cabeçalho do funil.
 * Ambos reaproveitam ações reais já existentes na tela — nenhum botão
 * decorativo novo, nenhum dado fictício reintroduzido (números fixos do
 * funil, notas Alta/Boa/Média, badges Handoff/Onboarding sem fonte real).
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("Comercial — cabeçalho de ações do funil", () => {
  it("\"Filtros\" rola até a seção de filtros real (âncora), \"+ Novo lead\" abre o NovoLeadDialog real já existente", () => {
    expect(rota).toContain('href="#leads-filtros"');
    expect(rota).toContain('id="leads-filtros"');
    // 19/10/2026 — prancha V4 conferida rótulo a rótulo: o botão é "Novo
    // lead" (sem "+") dentro do cartão-cabeçalho "Funil comercial vivo".
    const inicio = rota.indexOf("data-leads-funil-cabecalho");
    const trecho = rota.slice(inicio, inicio + 1400);
    expect(trecho).toContain("Funil comercial vivo");
    expect(trecho).toContain("setNovoLeadAberto(true)");
    expect(trecho).toMatch(/>\s*Novo lead\s*</);
  });
});

describe("Comercial — recusa consistente de dado fictício (sexta rodada)", () => {
  it("o funil continua com percentuais/contagens reais, nunca os números fixos 58/31/18/7 do mockup", () => {
    expect(rota).not.toMatch(/\b58\b.*\b31\b.*\b18\b.*\b7\b/);
  });

  it("nenhuma nota qualitativa Alta/Boa/Média nem badge Handoff/Onboarding sem fonte real", () => {
    expect(rota).not.toMatch(/"Alta"|"Boa"|"Média"/);
    expect(rota).not.toContain('"Handoff"');
    expect(rota).not.toContain('"Onboarding"');
  });
});
