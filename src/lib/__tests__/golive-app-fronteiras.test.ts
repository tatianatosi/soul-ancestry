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
        { id: "p1", tipo: "arvore", origem: "lineage", resumo: "Linha materna", em: "2026-09-01" },
        { id: "p2", tipo: "marco", origem: "milestone", resumo: "Etapa concluída", em: "2026-09-02" },
      ],
      [{ id: "d1", liberadoCliente: true }],
    );
    expect(radarSemConteudo(r)).toBe(false);
    expect(r.find((d) => d.id === "documentacao")?.percentual).toBe(100);
    /*
     * 05/10/2026 — "Conexões Familiares" deixou de ter percentual por decisão
     * vinda do Lovable (ver o conflito registrado em
     * radar-reconciliado-6-app-4-desk-2026-10-03.test.ts): o teto ilustrativo
     * de 31 ancestrais não é o denominador desta família. O que o eixo tem de
     * mostrar com conteúdo publicado é a contagem real, não um percentual.
     */
    const conexoes = r.find((d) => d.id === "conexoes")!;
    expect(conexoes.percentual).toBeNull();
    expect(conexoes.rotuloNumero).toContain("registro");
    expect(conexoes.rotuloNumero).not.toBe("Em preparação");
  });
});
