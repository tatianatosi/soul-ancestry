import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles.css", "utf8");
const raiz = css.slice(0, css.indexOf('\n[data-paleta="anterior"] {'));

describe("Desk — tokens oficiais (10/10/2026)", () => {
  it("a paleta aprovada é a base do CSS", () => {
    expect(raiz).toMatch(/--navy:\s*#13294B/i); // Pantone 2767 C
    expect(raiz).toMatch(/--navy-800:\s*#1B365D/i); // Pantone 534 C
    expect(raiz).toMatch(/--cream:\s*#F0EEE9/i); // Cloud Dancer
    expect(raiz).toMatch(/--gold:\s*#C2A84D/i); // Pantone 4019 C
    expect(raiz).toMatch(/--card:\s*#FFFFFF/i); // branco só em card elevado
  });

  it("o fundo de página é o Cloud Dancer, não um cinza", () => {
    expect(raiz).toMatch(/--background:\s*var\(--cream\)/);
  });

  it("nenhuma tela do Desk usa fundo cinza nomeado", () => {
    const { execSync } = require("node:child_process") as typeof import("node:child_process");
    const achados = execSync(
      "grep -rEl 'bg-(gray|slate|zinc|neutral|stone)-[0-9]+' src/routes/_authenticated src/components || true",
      { encoding: "utf8" },
    )
      .split("\n")
      .filter((f) => f && !f.includes("portal"));
    expect(achados).toEqual([]);
  });
});
