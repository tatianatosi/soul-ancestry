import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { PARES_APP_DESK, frasePar, parDoBloco } from "@/lib/par-app-desk";
import { ORDEM_BLOCOS_PAINEL } from "@/lib/painel-ordem";

describe("par App ↔ Desk", () => {
  it("todo bloco do Painel sabe que tela do App sustenta", () => {
    // É a regra do mockup "Intelligence Desk v2": mesmo bloco, duas
    // profundidades. Bloco novo sem par entra mudo — este teste impede.
    for (const b of ORDEM_BLOCOS_PAINEL) {
      expect(parDoBloco(b.chave), `bloco "${b.chave}" sem par declarado`).toBeTruthy();
    }
  });

  it("bloco que não chega ao cliente diz isso, em vez de fingir espelho", () => {
    const interno = PARES_APP_DESK.filter((p) => p.alcance === "nunca");
    expect(interno.length).toBeGreaterThan(0);
    for (const p of interno) {
      expect(p.telaApp).toBe("—");
      expect(frasePar(p.chave)).toMatch(/^Não chega ao cliente\./);
    }
  });

  it("bloco com espelho nomeia a tela e diz a diferença de profundidade", () => {
    const comEspelho = PARES_APP_DESK.filter((p) => p.alcance !== "nunca");
    for (const p of comEspelho) {
      expect(p.telaApp).not.toBe("—");
      expect(frasePar(p.chave)).toMatch(/^App mostra .+; aqui, .+\.$/);
    }
  });

  it("comercial e fila nunca declaram espelho no App", () => {
    // SKU, preço, ranking e fila interna não têm projeção — é a mesma trava
    // que já vale no portal.
    expect(parDoBloco("comercial")?.alcance).toBe("nunca");
    expect(parDoBloco("fila_priorizada")?.alcance).toBe("nunca");
  });

  it("bloco sem par não recebe frase inventada", () => {
    expect(parDoBloco("bloco_que_nao_existe")).toBeNull();
    expect(frasePar("bloco_que_nao_existe")).toBeNull();
  });

  it("não há par órfão apontando para bloco que saiu do Painel", () => {
    const chaves = new Set(ORDEM_BLOCOS_PAINEL.map((b) => b.chave));
    for (const p of PARES_APP_DESK) {
      expect(chaves.has(p.chave), `par órfão: "${p.chave}"`).toBe(true);
    }
  });

  it("a âncora é renderizada em todos os blocos do Painel", () => {
    const dir = "src/components/painel";
    const fontes = readdirSync(dir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => readFileSync(`${dir}/${f}`, "utf8"))
      .join("\n");
    const ancorados = new Set(
      [...fontes.matchAll(/<AncoraApp bloco="([a-z_]+)"/g)].map((m) => m[1]),
    );
    for (const b of ORDEM_BLOCOS_PAINEL) {
      expect(ancorados.has(b.chave), `bloco "${b.chave}" sem <AncoraApp>`).toBe(true);
    }
  });
});

describe("a frase preserva nome próprio", () => {
  it("não rebaixa a marca no meio do texto", () => {
    // toLowerCase() na string inteira escrevia "no desk" na tela.
    expect(frasePar("descoberta")).toContain("no Desk");
    expect(frasePar("descoberta")).not.toContain("no desk");
  });

  it("nenhuma frase gerada contém a marca em minúscula", () => {
    for (const p of PARES_APP_DESK) {
      const f = frasePar(p.chave) ?? "";
      expect(f, `frase de "${p.chave}"`).not.toMatch(/\bdesk\b/);
      expect(f).not.toMatch(/\bapp cliente\b/);
    }
  });
});
