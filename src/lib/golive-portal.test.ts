import { describe, expect, it } from "vitest";

import { acessoAoPortal, coberturaDoApp, estadoDaPublicacao, publicacaoPorEstado } from "./golive-portal";

describe("publicação por estado", () => {
  it("sem projeção, os quatro estados ficam em zero", () => {
    expect(publicacaoPorEstado([])).toEqual([
      { rotulo: "Rascunho", valor: 0 },
      { rotulo: "Em revisão", valor: 0 },
      { rotulo: "Aprovada", valor: 0 },
      { rotulo: "Publicada", valor: 0 },
    ]);
  });

  it("conta cada situação gravada", () => {
    const r = publicacaoPorEstado([
      { id: "1", estado: "draft" },
      { id: "2", estado: "in_review" },
      { id: "3", estado: "approved" },
      { id: "4", estado: "published" },
    ]);
    expect(r.map((i) => i.valor)).toEqual([1, 1, 1, 1]);
  });

  it("despublicada não conta como publicada", () => {
    const r = publicacaoPorEstado([{ id: "1", estado: "published", despublicadaEm: "2026-09-10" }]);
    expect(r.find((i) => i.rotulo === "Publicada")?.valor).toBe(0);
  });

  it("situação desconhecida não vira rascunho por engano", () => {
    expect(estadoDaPublicacao("estado_novo")).toBe("Sem situação");
  });
});

describe("acesso ao portal", () => {
  it("sem acesso, tudo zerado e sem último acesso", () => {
    expect(acessoAoPortal([], [])).toEqual({
      convitesAutorizados: 0,
      ativos: 0,
      revogados: 0,
      ultimoAcesso: null,
      total: 0,
    });
  });

  it("separa ativo de revogado e pega o último acesso mais recente", () => {
    const r = acessoAoPortal(
      [
        { id: "a", situacao: "active", ultimoAcesso: "2026-09-01T10:00:00Z", convidadoEm: "2026-08-20" },
        { id: "b", situacao: "active", ultimoAcesso: "2026-09-12T08:00:00Z" },
        { id: "c", situacao: "revoked", revogadoEm: "2026-09-05" },
      ],
      [{ id: "e", status: "aprovado" }],
    );
    expect(r.ativos).toBe(2);
    expect(r.revogados).toBe(1);
    expect(r.convitesAutorizados).toBe(2);
    expect(r.ultimoAcesso).toBe("2026-09-12T08:00:00Z");
  });

  it("acesso ativo sem último acesso registrado não inventa data", () => {
    expect(acessoAoPortal([{ id: "a", situacao: "active" }], []).ultimoAcesso).toBeNull();
  });
});

describe("cobertura do App", () => {
  it("as cinco abas sempre aparecem, mesmo em zero", () => {
    expect(coberturaDoApp([]).map((i) => i.rotulo)).toEqual([
      "Jornada",
      "Radar",
      "Árvore",
      "Documentos",
      "Legado",
    ]);
    expect(coberturaDoApp([]).every((i) => i.valor === 0)).toBe(true);
  });

  it("classifica a projeção publicada pela origem", () => {
    const r = coberturaDoApp([
      { id: "1", estado: "published", origem: "lineage" },
      { id: "2", estado: "published", origem: "evidence" },
      { id: "3", estado: "published", origem: "finding" },
      { id: "4", estado: "published", origem: "milestone" },
      { id: "5", estado: "draft", origem: "lineage" },
    ]);
    expect(r).toEqual([
      { rotulo: "Jornada", valor: 1 },
      { rotulo: "Radar", valor: 0 },
      { rotulo: "Árvore", valor: 1 },
      { rotulo: "Documentos", valor: 1 },
      { rotulo: "Legado", valor: 1 },
    ]);
  });
});
