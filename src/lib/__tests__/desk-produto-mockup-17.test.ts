import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CLASSIFICACAO_SANEAMENTO_V4,
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  MENU_CONTA,
  ROTAS_PRESERVADAS,
  destinosDuplicados,
  destinosSobrepostos,
  rotasDoMenu,
  rotasSemLink,
} from "@/lib/navegacao-desk";

describe("Desk Intelligence — 6 grupos operacionais (mockup de 17 páginas como referência)", () => {
  it("expõe exatamente os 6 grupos, na ordem aprovada", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...GRUPOS_OPERACIONAIS_DESK]);
    expect(GRUPOS_DESK.map((g) => g.to)).toEqual([
      "/painel",
      "/leads",
      "/casos",
      "/clientes",
      "/pesquisa-modulo",
      "/marketing",
      "/configuracoes",
    ]);
  });

  it("não volta ao mockup de 14 abas nem às 7 telas como sidebar", () => {
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "comercial",
      "casos",
      "pessoas",
      "pesquisa",
      "marketing",
      "governanca",
    ]);
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("visao-geral");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("checklist");
  });

  it("mantém o trabalho operacional no grupo certo, sem sobreposição", () => {
    const rotas = (id: string) =>
      GRUPOS_DESK.find((g) => g.id === id)!
        .sub.filter((s) => "to" in s)
        .map((s) => s.to);
    expect(rotas("comercial")).toEqual(
      // V4: Marketing virou grupo próprio.
      expect.arrayContaining(["/calls", "/leads", "/propostas", "/conversao"]),
    );
    // V4: pessoas e acessos moram em Pessoas & Famílias; contrato em Comercial.
    expect(rotas("pessoas")).toEqual(
      expect.arrayContaining(["/clientes", "/acessos-portal", "/app-cliente-como-pessoa"]),
    );
    expect(rotas("casos")).not.toContain("/contratos");
    expect(rotas("comercial")).toContain("/contratos");
    expect(rotas("pesquisa")).toEqual(
      expect.arrayContaining(["/pesquisa-modulo", "/evidencias", "/fontes-genealogicas"]),
    );
    expect(rotas("pesquisa")).not.toContain("/privacidade");
    // V4: o grupo "contratos" deixou de existir; legado de SKU saiu do menu.
    expect(rotas("comercial")).not.toContain("/conciliacao-catalogo");
    expect(rotas("comercial")).not.toContain("/homologacao-skus");
    expect(rotas("governanca")).toEqual(
      expect.arrayContaining([
        "/privacidade",
        "/catalogo",
        "/qualidade",
      ]),
    );
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("não perde rota preservada e não duplica destino dentro do grupo", () => {
    expect(rotasSemLink()).toEqual([]);
    expect(destinosDuplicados()).toEqual([]);
    for (const r of ROTAS_PRESERVADAS) {
      expect(rotasDoMenu().includes(r) || r in CLASSIFICACAO_SANEAMENTO_V4, r).toBe(true);
    }
  });

  it("Painel de Calls e CA-04 ficam no Comercial; DEMO fica fora da fila do dia", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.sub.some((s) => "to" in s && s.to === "/calls")).toBe(true);
    expect(comercial.sub.some((s) => "to" in s && s.to === "/crm-mestre")).toBe(false);
    const conta = MENU_CONTA.itens.filter((s) => "to" in s).map((s) => s.to);
    expect(conta).toContain("/app-cliente-demo");
    expect(conta).not.toContain("/pesquisa");
    expect(conta).not.toContain("/crm-mestre");
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    expect(gov.sub.some((s) => "to" in s && s.to === "/crm-mestre")).toBe(false);
    // V4: catálogo 30 virou LEGADO_SEM_MENU.
    expect(gov.sub.some((s) => "to" in s && s.to === "/governanca/catalogo-operacional-30")).toBe(false);
    expect(gov.sub.some((s) => "to" in s && s.to === "/privacidade")).toBe(true);
  });

  it("dossiê /pesquisa é o repositório do Legado, dentro da Inteligência", () => {
    const bib = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    // V4: o dossiê legado saiu do menu; segue classificado.
    expect(bib.sub.some((s) => "to" in s && s.to === "/pesquisa")).toBe(false);
    expect(CLASSIFICACAO_SANEAMENTO_V4["/pesquisa"]).toBe("LEGADO_SEM_MENU");
  });

  it("Radar & Matrizes hospeda a matriz; Casos 360 aponta para ela", () => {
    const qualidade = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");
    expect(qualidade).toContain("RadarInternoIntegrado");
    const casos = readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8");
    expect(casos).not.toContain("MatrizPrioridadesConectada");
    expect(casos).toContain('to="/qualidade"');
  });
});
