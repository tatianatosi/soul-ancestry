import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado 28 da design critique do Desk V4 (27/10/2026): a barra de
 * navegação mobile do Desk (8 setores) usava h-12/text-[8px]/ícone de 16px
 * — bem mais densa que a barra mobile do App Cliente (7 abas,
 * min-h-[4rem]/text-[11px]/ícone de 17-19px, em portal-shell.tsx), sem que
 * a diferença de contagem de itens (8 vs. 7) exigisse essa discrepância.
 *
 * Fix: a barra do Desk passa a usar min-h-14/text-[10px]/ícone de 18px —
 * aproxima a densidade da do App, dentro do espaço que 8 colunas ainda
 * permitem, sem reduzir setores nem quebrar em duas linhas.
 */
const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
const portalShell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");

describe("Barra de navegação mobile do Desk — densidade aproximada à do App", () => {
  const trechoNav = shell.slice(
    shell.indexOf("data-desk-nav-movel") - 400,
    shell.indexOf("data-desk-nav-movel") + 1200,
  );

  it("não usa mais os tamanhos minúsculos originais (h-12/text-[8px]/ícone 16px)", () => {
    expect(trechoNav).not.toContain("h-12 min-w-0");
    expect(trechoNav).not.toContain("text-[8px]");
    expect(trechoNav).not.toContain('h-4 w-4" aria-hidden="true" />');
  });

  it("usa tamanhos maiores, mais próximos da barra do App", () => {
    expect(trechoNav).toContain("min-h-14");
    expect(trechoNav).toContain("text-[10px]");
    expect(trechoNav).toContain("h-[18px] w-[18px]");
  });

  it("a barra do App continua com o próprio padrão (referência, não tocada)", () => {
    expect(portalShell).toContain("min-h-[4rem]");
    expect(portalShell).toContain("text-[11px]");
  });
});
