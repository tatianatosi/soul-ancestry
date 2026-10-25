import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Checklist "make-interfaces-feel-better": "Use text-wrap: balance on
 * headings. Use text-wrap: pretty for body text to avoid orphans."
 *
 * Medido antes de mexer: 39 títulos só em src/routes/portal/ usam o padrão
 * `font-serif text-…` em h1/h2/h3 — trocar um por um arriscaria divergir de
 * className que algum teste faz match exato. Regra global aditiva em
 * styles.css cobre todos sem tocar composição nem className de tela nenhuma.
 */
const css = readFileSync("src/styles.css", "utf8");

describe("títulos não terminam com palavra órfã isolada", () => {
  it("h1/h2/h3 usam text-wrap: balance globalmente", () => {
    expect(css).toContain("h1, h2, h3 { text-wrap: balance; }");
  });

  it("parágrafos usam text-wrap: pretty, evitando órfã no corpo do texto", () => {
    expect(css).toContain("p { text-wrap: pretty; }");
  });

  it("a regra fica dentro do @layer base, junto da tipografia global existente", () => {
    const i = css.indexOf("@layer base");
    const j = css.indexOf("h1, h2, h3 { text-wrap: balance; }");
    const k = css.indexOf("}", j);
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(i);
    expect(k).toBeLessThan(css.indexOf("/* Patch global de responsividade"));
  });
});
