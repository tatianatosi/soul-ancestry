import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * DSA-3 (corte C7 — Pesquisa/Centro de Inteligência): terceiro consumidor
 * real do Design System no Desk (DSA-1 = qualidade.tsx, DSA-2 = painel.tsx).
 * Mesma regra: não cria componente novo, só aplica CaCard/EstadoVazio já
 * existentes ao bloco "Inconsistências de pesquisa em aberto" do módulo de
 * Pesquisa Genealógica e Evidências. Os demais blocos da tela (Painel
 * "Pesquisas em andamento" / "Abrir pesquisa para um caso existente")
 * continuam com o Painel/CardIndicador de sempre — troca é aditiva, não
 * uma reescrita da tela.
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/pesquisa-modulo.index.tsx", "utf8");

describe("DSA-3 — CaCard e EstadoVazio aplicados ao Centro de Inteligência (Pesquisa)", () => {
  it("importa CaCard e EstadoVazio dos módulos canônicos, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
    expect(ARQUIVO).toMatch(/import\s*\{\s*EstadoVazio,\s*SaasShell,\s*useSaas\s*\}\s*from\s*"@\/components\/saas\/shell"/);
  });

  it('bloco "Inconsistências de pesquisa em aberto" usa CaCard, não mais Painel', () => {
    expect(ARQUIVO).toMatch(/<CaCard titulo="Inconsistências de pesquisa em aberto"/);
  });

  it("estado sem inconsistências usa EstadoVazio, não um <p> solto", () => {
    expect(ARQUIVO).toMatch(/<EstadoVazio mensagem="Nenhuma inconsistência aberta\."\s*\/>/);
  });

  it("os demais blocos da tela continuam com Painel (troca é aditiva, não reescrita)", () => {
    expect(ARQUIVO).toMatch(/<Painel titulo="Pesquisas em andamento">/);
    expect(ARQUIVO).toMatch(/<Painel titulo="Abrir pesquisa para um caso existente">/);
  });

  it("nenhum hex literal foi introduzido (regra 1 de regras-de-uso.md)", () => {
    expect(ARQUIVO).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });
});
