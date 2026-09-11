import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const lista = readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8");
const crud = readFileSync("src/components/saas/entidade-crud.tsx", "utf8");
const propostas = readFileSync("src/routes/_authenticated/propostas.tsx", "utf8");
const goLive = readFileSync("src/components/desk-go-live.tsx", "utf8");
const modulos = readFileSync("src/lib/desk-modulos.ts", "utf8");

describe("Auditoria 2026-09-11 — Casos cards, Propostas Canva, Go-live fora", () => {
  it("Casos 360 usa apresentação em cards com próxima ação", () => {
    expect(crud).toContain('apresentacao?: "tabela" | "cards"');
    expect(lista).toContain('apresentacao="cards"');
    expect(lista).toContain("renderCard=");
    expect(lista).toContain("obterProximaAcaoCanonica");
  });

  it("Propostas apontam Canva e produtos-pai; SKU fica recolhido", () => {
    expect(propostas).toContain("montada no Canva");
    expect(propostas).toContain('to="/catalogo"');
    expect(propostas).toContain("Conferência comercial legada (SKU)");
    expect(propostas).toContain("/casos/$caseId/contrato/preparar");
  });

  it("Go-live não é produto: módulo vira Fechamento e fixture avisa legado", () => {
    expect(modulos).toContain('nome: "Fechamento e ativação"');
    expect(goLive).toContain("Arquivo histórico — fora da operação");
    expect(goLive).toContain("saiu do vocabulário de produto");
  });
});
