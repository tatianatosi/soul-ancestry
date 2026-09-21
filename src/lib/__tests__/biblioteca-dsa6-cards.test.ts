import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * DSA-6 (corte C10 — Biblioteca/microentrega/publicação): sexto e último
 * consumidor real do Design System no Desk desta rodada (DSA-1 a DSA-5).
 * Mesma regra: não cria componente novo, só aplica CaCard já existente ao
 * mapa read-only "Centro de Inteligência" em biblioteca.tsx. Os demais
 * blocos da gestão (fila de publicação, cadeia de suprimento, entradas de
 * referência) e toda mutation continuam intocados.
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/biblioteca.tsx", "utf8");

describe("DSA-6 — CaCard no mapa Centro de Inteligência (Biblioteca Mestre)", () => {
  it("importa CaCard do módulo canônico, não recria", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*CaCard\s*\}\s*from\s*"@\/components\/ui\/ca-card"/);
  });

  it('bloco "Centro de Inteligência" usa CaCard, não mais <section> cru', () => {
    expect(ARQUIVO).toMatch(/<CaCard titulo="Centro de Inteligência" eyebrow="Biblioteca Mestre">/);
  });

  it("os demais blocos da gestão continuam com <section> (troca é aditiva, não reescrita)", () => {
    expect(ARQUIVO).toMatch(/<h2 className="font-serif text-lg text-navy">Da Biblioteca até o App Cliente<\/h2>/);
    expect(ARQUIVO).toMatch(/<FilaPublicacaoReal \/>/);
  });

  it("nenhum hex literal foi introduzido (regra 1 de regras-de-uso.md)", () => {
    expect(ARQUIVO).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });
});
