/**
 * Fronteiras do App Cliente: Árvore, Documentos, Legado e Radar.
 *
 * O espelho do App só mostra conteúdo já publicado/liberado. Fonte de
 * pesquisa, evidência e achado interno não atravessam a fronteira.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { radarDoApp, radarSemConteudo, type ProjecaoPublicada } from "@/lib/golive-app";

const rota = readFileSync("src/routes/_authenticated/golive.app.tsx", "utf8");

describe("fronteiras do App Cliente", () => {
  it("não lê fontes de pesquisa, evidências nem achados internos", () => {
    expect(rota).not.toMatch(/fontesParaFamilia|fontesPorInstituicao/);
    expect(rota).not.toMatch(/evidenciasParaFamilia/);
    expect(rota).not.toMatch(/achadosParaFamilia/);
  });

  it("não navega para superfícies internas do Desk", () => {
    expect(rota).not.toMatch(/\/golive\/pesquisa/);
  });
});

describe("radar de seis dimensões", () => {
  const dims = (pubs: ProjecaoPublicada[], docs: { id: string; liberadoCliente?: boolean }[] = []) =>
    radarDoApp(pubs, docs);

  it("entrega exatamente seis dimensões", () => {
    expect(dims([]).map((d) => d.id)).toEqual([
      "documentacao",
      "origem",
      "conexoes",
      "elegibilidade",
      "memoria",
      "legado",
    ]);
  });

  it("fica vazio sem publicação nem documento liberado", () => {
    expect(radarSemConteudo(dims([]))).toBe(true);
  });

  it("ganha forma com conteúdo publicado e documento liberado", () => {
    const r = dims(
      [
        { id: "p1", tipo: "arvore", origem: "lineage", resumo: "Linha materna", em: "2026-09-01", pessoaId: "pessoa-1" },
        { id: "p2", tipo: "marco", origem: "milestone", resumo: "Etapa concluída", em: "2026-09-02" },
      ],
      [{ id: "d1", liberadoCliente: true }],
    );
    expect(radarSemConteudo(r)).toBe(false);
    // C4 (02/11/2026): arquivo liberado não vira 100%; sem checklist canônico, "não registrado".
    expect(r.find((d) => d.id === "documentacao")?.percentual).toBeNull();
    expect(r.find((d) => d.id === "documentacao")?.rotuloNumero).toBe("Não registrado");
    /*
      05/10/2026 — PREMISSA da Proprietária (não reabrir): Conexões Familiares
      usa pessoas mapeadas como denominador, nunca o teto ilustrativo de 31.
      Sem o 3º argumento (pessoasMapeadas), fica honesto em preparação — não
      finge percentual sobre denominador desconhecido.
    */
    expect(r.find((d) => d.id === "conexoes")?.percentual).toBeNull();
    expect(r.find((d) => d.id === "conexoes")?.estado).toBe("em_preparacao");
  });

  it("com pessoas mapeadas, Conexões Familiares mostra percentual real — nunca sobre 31", () => {
    const r = radarDoApp(
      [{ id: "p1", tipo: "arvore", origem: "lineage", resumo: "Linha materna", em: "2026-09-01", pessoaId: "pessoa-1" }],
      [],
      4,
    );
    const conexoes = r.find((d) => d.id === "conexoes")!;
    expect(conexoes.estado).toBe("percentual");
    expect(conexoes.percentual).toBe(25);
    expect(conexoes.comoCalculamos).toContain("mapeadas");
    expect(conexoes.comoCalculamos).not.toContain("31");
  });
});
