import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("Caso 360 como página única", () => {
  it("não sobrou nenhuma aba independente", () => {
    // O defeito nomeado no documento de fluxo: "abas independentes que
    // disputam a mesma informação".
    expect(pagina).not.toMatch(/aba === "/);
    expect(pagina).not.toMatch(/setAba\(/);
  });

  it("as treze seções continuam existindo — nenhuma foi removida ou fundida", () => {
    const secoes = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(secoes).toHaveLength(13);
    for (const s of [
      "visao",
      "caso",
      "pessoas",
      "cadastro",
      "produto",
      "acao",
      "etiquetas",
      "onboarding",
      "fechamento",
      "jornada",
      "comercial",
      "tecnico",
      "log",
    ]) {
      expect(secoes, `seção "${s}" sumiu`).toContain(s);
    }
  });

  it("o índice segue a mesma ordem em que a página rola", () => {
    // Índice numa ordem e DOM em outra confunde quem rola.
    const doIndice = [...pagina.matchAll(/\{ id: "(\w+)", rotulo:/g)].map((m) => m[1]);
    const doDom = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(doIndice).toEqual(doDom);
  });

  it("cada seção tem âncora alcançável pelo índice", () => {
    const ids = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(pagina).toContain("href={`#secao-${a.id}`}");
    expect(pagina).toContain("id={`secao-${id}`}");
    expect(ids.length).toBeGreaterThan(0);
  });
});
