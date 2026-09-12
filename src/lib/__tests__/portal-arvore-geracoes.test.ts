import { describe, expect, it } from "vitest";
import {
  GERACOES_ARVORE,
  painelArvoreGeracoes,
} from "@/lib/portal-arvore-geracoes";
import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

describe("painelArvoreGeracoes", () => {
  it("sempre expõe G1–G5 na ordem do mockup", () => {
    const painel = painelArvoreGeracoes([]);
    expect(painel.geracoes.map((g) => g.id)).toEqual(["G1", "G2", "G3", "G4", "G5"]);
    expect(GERACOES_ARVORE).toHaveLength(5);
  });

  it("não inventa notas quando não há publicação de árvore", () => {
    const painel = painelArvoreGeracoes([
      {
        id: "x",
        tipo: "marco",
        tipoRotulo: "Marco",
        conteudo: "Abertura",
        publicadoEm: "2026-06-02",
      },
    ]);
    expect(painel.temPublicacao).toBe(false);
    expect(painel.notasPublicadas).toEqual([]);
  });

  it("repassa só publicações tipo arvore já sanitizadas", () => {
    const nota: PublicacaoCliente = {
      id: "a1",
      tipo: "arvore",
      tipoRotulo: "Árvore",
      conteudo: "Quatro gerações com documento.",
      publicadoEm: "2026-08-05",
    };
    const painel = painelArvoreGeracoes([nota]);
    expect(painel.temPublicacao).toBe(true);
    expect(painel.notasPublicadas).toEqual([nota]);
  });
});
