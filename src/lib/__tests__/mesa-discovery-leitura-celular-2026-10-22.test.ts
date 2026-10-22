import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Mesa de Discovery (/calls) — leitura no celular (22/10/2026).
 *
 * O laudo de design mediu a rota em 375 px e achou um único defeito real:
 * "Uma coluna, mas tela longa (8.237 px)". A composição em si — duas colunas
 * no desktop, topo sem Kanban, três momentos — foi HOMOLOGADA COMO FINAL pela
 * Proprietária em 14/10/2026, na sétima rodada, e não é tocada aqui: ver
 * `calls-v4-mesa-discovery-2026-10-14.test.ts`, que continua valendo integralmente.
 *
 * O que muda é só o quanto o cabeçalho ocupa antes do trabalho começar:
 *  - os 4 KPIs param de empilhar um por linha no celular (duas colunas desde 375 px);
 *  - os 3 cartões descritivos, que repetiam a navegação de momentos logo acima
 *    deles, deixam de empilhar os três no celular — aparece o do momento ativo.
 *
 * Nenhum conteúdo foi removido: os três cartões continuam no documento e voltam
 * juntos a partir de sm:.
 */
const rota = readFileSync("src/routes/_authenticated/calls.tsx", "utf8");

describe("Mesa de Discovery — os 4 KPIs não empilham um por linha no celular", () => {
  it("a faixa abre em duas colunas desde 375 px e só vira quatro no desktop", () => {
    expect(rota).toContain('className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"');
    // A grade antiga (uma coluna até sm:) não volta.
    expect(rota).not.toContain('className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"');
  });

  it("cada cartão de KPI respira menos no celular e o número acompanha", () => {
    expect(rota.match(/p-4 shadow-sm sm:p-6/g)?.length).toBe(4);
    expect(rota.match(/font-serif text-2xl text-navy sm:text-3xl/g)?.length).toBe(4);
  });
});

describe("Mesa de Discovery — os 3 cartões de momento não se repetem no celular", () => {
  it("no celular fica o cartão do momento ativo; os três voltam a partir de sm:", () => {
    for (const valor of ["antes", "durante", "revisao"]) {
      expect(rota).toContain(`sm:block ${"${"}momento === "${valor}" ? "" : "hidden"}\``);
    }
  });

  it("nada foi removido: os três textos descritivos continuam na página", () => {
    expect(rota).toContain("1 · Antes da call");
    expect(rota).toContain("2 · Durante");
    expect(rota).toContain("3 · Revisão");
    expect(rota).toContain('<ol className="mb-6 grid gap-3 sm:grid-cols-3" data-l04-momentos>');
  });

  it("a composição homologada em 14/10 segue intacta — 2 colunas e nenhum <details>", () => {
    expect(rota).toContain('className="mb-6 grid gap-6 lg:grid-cols-2"');
    expect(rota).not.toContain("<details");
    expect(rota).not.toContain("<summary");
  });
});
