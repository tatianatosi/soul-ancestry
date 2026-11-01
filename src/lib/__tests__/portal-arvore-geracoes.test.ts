import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  GERACOES_ARVORE,
  geracaoArvore,
  painelArvoreGeracoes,
} from "@/lib/portal-arvore-geracoes";
import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

/*
 * 01/11/2026 — rótulos por extenso aprovados pela Proprietária: o rótulo de
 * cada geração segue o parentesco real em relação a "Você" (G1). De G6 em
 * diante fica neutro ("Nª geração") — "tetravós"/"pentavós" não estão
 * aprovados em documento algum.
 */
describe("rótulos por extenso das gerações", () => {
  it("segue o parentesco real aprovado (Pais, Avós, Bisavós, Ancestrais)", () => {
    expect(GERACOES_ARVORE.map((g) => g.rotulo)).toEqual([
      "G1 · Você",
      "G2 · Pais",
      "G3 · Avós",
      "G4 · Bisavós",
      "G5 · Ancestrais",
      "G6 · 6ª geração",
      "G7 · 7ª geração",
      "G8 · 8ª geração",
      "G9 · 9ª geração",
      "G10 · 10ª geração",
    ]);
  });

  it("genograma e fallback da aba Árvore desenham o rótulo da escala canônica", () => {
    const genograma = readFileSync("src/components/portal/genograma-familiar.tsx", "utf8");
    expect(genograma).toContain("geracaoArvore(r.geracao).rotulo");
    expect(genograma).not.toContain('" · Você" : ""');
    const aba = readFileSync("src/routes/portal/arvore.tsx", "utf8");
    expect(aba).toContain("{geracao.rotulo}");
    expect(aba).not.toContain("Você (âncora)");
  });

  it("gerações acima da escala continuam neutras, sem termo de parentesco", () => {
    expect(geracaoArvore(11).rotulo).toBe("G11 · 11ª geração");
  });
});

describe("painelArvoreGeracoes", () => {
  it("cobre ao menos G1–G10, em ordem, sem teto para gerações futuras", () => {
    const painel = painelArvoreGeracoes([]);
    expect(painel.geracoes.map((g) => g.id).slice(0, 10)).toEqual([
      "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10",
    ]);
    expect(GERACOES_ARVORE.length).toBeGreaterThanOrEqual(10);
  });

  it("não inventa notas quando não há publicação de árvore", () => {
    const painel = painelArvoreGeracoes([
      {
        id: "x",
        tipo: "marco",
        tipoRotulo: "Marco",
        conteudo: "Abertura",
        publicadoEm: "2026-06-02",
        ehPessoa: false,
      },
    ]);
    expect(painel.temPublicacao).toBe(false);
    expect(painel.notasPublicadas).toEqual([]);
  });

  it("repassa só publicações tipo arvore já sanitizadas", () => {
    const nota: PublicacaoCliente = {
      id: "a1",
      tipo: "arvore",
      ehPessoa: false,
      tipoRotulo: "Árvore",
      conteudo: "Quatro gerações com documento.",
      publicadoEm: "2026-08-05",
    };
    const painel = painelArvoreGeracoes([nota]);
    expect(painel.temPublicacao).toBe(true);
    expect(painel.notasPublicadas).toEqual([nota]);
  });
});
