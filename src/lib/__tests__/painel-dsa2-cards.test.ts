import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * DSA-2: segundo consumidor real do Design System no Desk (o primeiro foi
 * `qualidade.tsx`, DSA-1). Mesma regra: não cria componente novo, só aplica
 * CaCard/EstadoVazio já existentes ao Painel Hoje (Visão Geral).
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("DSA-2 — CaCard e EstadoVazio aplicados ao Painel Hoje", () => {
  it("importa CaCard e EstadoVazio dos módulos canônicos, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
    expect(ARQUIVO).toMatch(/import\s*\{\s*EstadoVazio,\s*SaasShell\s*\}\s*from\s*"@\/components\/saas\/shell"/);
  });

  it("cada seção do painel consolidado usa CaCard, não um <article> ad-hoc", () => {
    expect(ARQUIVO).toMatch(/<CaCard/);
    expect(ARQUIVO).not.toMatch(/<article/);
    expect(ARQUIVO).not.toMatch(/border-t-2 border-gold/);
  });

  it("estado sem registros usa EstadoVazio, não um <p> solto", () => {
    expect(ARQUIVO).toMatch(/<EstadoVazio mensagem="Sem registros para consolidar/);
  });

  it("nenhum hex literal foi introduzido (regra 1 de regras-de-uso.md)", () => {
    expect(ARQUIVO).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it("CTA \"Abrir\" de cada seção continua indo para a rota certa (acao do CaCard)", () => {
    // FIDELIDADE-VISUAL-2026-09-23: a grade genérica de 7 seções
    // (`secoes.map`) que gerava este CTA dinamicamente foi removida — era o
    // segundo dashboard legado que competia com o cockpit oficial. O padrão
    // "acao do CaCard → Abrir" continua vivo nos cards do cockpit, cada um
    // com rota fixa e declarada, em vez de um array genérico.
    expect(ARQUIVO).toMatch(/acao=\{/);
    expect(ARQUIVO).toMatch(/<Link to="\/tarefas">Abrir<\/Link>/);
    expect(ARQUIVO).toMatch(/<Link to="\/golive\/aprovacoes">Abrir<\/Link>/);
  });
});
