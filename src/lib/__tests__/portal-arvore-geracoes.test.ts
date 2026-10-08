import { describe, expect, it } from "vitest";
import {
  GERACOES_ARVORE,
  painelArvoreGeracoes,
} from "@/lib/portal-arvore-geracoes";
import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

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
