import { describe, expect, it } from "vitest";

import {
  abaDaPublicacao,
  marcosPublicados,
  publicacoesDaAba,
  situacaoDocumentos,
  ultimaPublicacao,
} from "./golive-app";

describe("distribuição por aba", () => {
  it("classifica pela origem canônica", () => {
    expect(abaDaPublicacao({ id: "1", tipo: "x", origem: "lineage" })).toBe("Árvore");
    expect(abaDaPublicacao({ id: "2", tipo: "x", origem: "evidence" })).toBe("Documentos");
    expect(abaDaPublicacao({ id: "3", tipo: "x", origem: "finding" })).toBe("Legado");
    expect(abaDaPublicacao({ id: "4", tipo: "x", origem: "milestone" })).toBe("Jornada");
  });

  it("origem desconhecida não é jogada em aba nenhuma", () => {
    expect(abaDaPublicacao({ id: "5", tipo: "outro", origem: "algo" })).toBeNull();
  });

  it("sem publicação, a aba fica vazia", () => {
    expect(publicacoesDaAba([], "Jornada")).toEqual([]);
    expect(ultimaPublicacao([])).toBeNull();
  });

  it("ordena da mais recente para a mais antiga", () => {
    const itens = [
      { id: "a", tipo: "t", origem: "milestone", em: "2026-01-01" },
      { id: "b", tipo: "t", origem: "milestone", em: "2026-05-01" },
    ];
    expect(publicacoesDaAba(itens, "Jornada").map((p) => p.id)).toEqual(["b", "a"]);
    expect(ultimaPublicacao(itens)?.id).toBe("b");
  });
});

describe("marcos da jornada", () => {
  it("no máximo seis marcos e o último é o atual", () => {
    const itens = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      tipo: "marco",
      origem: "milestone",
      em: `2026-0${(i % 9) + 1}-01`,
    }));
    const marcos = marcosPublicados(itens);
    expect(marcos.length).toBe(6);
    expect(marcos.filter((m) => m.atual).length).toBe(1);
    expect(marcos[marcos.length - 1]?.atual).toBe(true);
  });

  it("sem publicação, não há stepper", () => {
    expect(marcosPublicados([])).toEqual([]);
  });
});

describe("situação dos documentos", () => {
  it("separa pedido, conferência e liberado", () => {
    expect(
      situacaoDocumentos([
        { id: "1", titulo: "a", status: "solicitado" },
        { id: "2", titulo: "b", status: "em_revisao" },
        { id: "3", titulo: "c", status: "liberado" },
        { id: "4", titulo: "d", status: null },
      ]),
    ).toEqual({ solicitados: 1, emRevisao: 1, liberados: 1 });
  });

  it("lista vazia zera tudo", () => {
    expect(situacaoDocumentos([])).toEqual({ solicitados: 0, emRevisao: 0, liberados: 0 });
  });
});
