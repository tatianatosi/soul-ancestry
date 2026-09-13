import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
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
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...GRUPOS_OPERACIONAIS_DESK]);
    expect(GRUPOS_DESK.map((g) => g.to)).toEqual([
      "/painel",
      "/calls",
      "/casos",
      "/biblioteca",
      "/contratos",
      "/configuracoes",
    ]);
  });

  it("não volta ao mockup de 14 abas nem às 7 telas como sidebar", () => {
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "comercial",
      "casos",
      "pesquisa",
      "contratos",
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
      expect.arrayContaining(["/calls", "/leads", "/marketing", "/propostas", "/conversao"]),
    );
    expect(rotas("casos")).toEqual(
      expect.arrayContaining(["/clientes", "/acessos-portal", "/app-cliente-como-pessoa"]),
    );
    expect(rotas("casos")).not.toContain("/contratos");
    expect(rotas("contratos")).toContain("/contratos");
    expect(rotas("pesquisa")).toEqual(
      expect.arrayContaining(["/pesquisa-modulo", "/pesquisa", "/evidencias", "/matriz-juridica"]),
    );
    expect(rotas("pesquisa")).not.toContain("/privacidade");
    expect(rotas("contratos")).not.toContain("/conciliacao-catalogo");
    expect(rotas("contratos")).not.toContain("/homologacao-skus");
    expect(rotas("governanca")).toEqual(
      expect.arrayContaining([
        "/privacidade",
        "/homologacao-skus",
        "/conciliacao-catalogo",
        "/escopo-origem",
      ]),
    );
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("não perde rota preservada e não duplica destino dentro do grupo", () => {
    expect(rotasSemLink()).toEqual([]);
    expect(destinosDuplicados()).toEqual([]);
    for (const r of ROTAS_PRESERVADAS) expect(rotasDoMenu()).toContain(r);
  });

  it("Painel de Calls e CA-04 ficam no Comercial; DEMO fica fora da fila do dia", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.sub.some((s) => "to" in s && s.to === "/calls")).toBe(true);
    expect(comercial.sub.some((s) => "to" in s && s.to === "/crm-mestre")).toBe(true);
    const conta = MENU_CONTA.itens.filter((s) => "to" in s).map((s) => s.to);
    expect(conta).toContain("/app-cliente-demo");
    expect(conta).not.toContain("/pesquisa");
    expect(conta).not.toContain("/crm-mestre");
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    expect(gov.sub.some((s) => "to" in s && s.to === "/crm-mestre")).toBe(false);
    expect(gov.sub.some((s) => "to" in s && s.to === "/governanca/catalogo-operacional-30")).toBe(true);
    expect(gov.sub.some((s) => "to" in s && s.to === "/privacidade")).toBe(true);
  });

  it("dossiê /pesquisa é o repositório do Legado, dentro da Inteligência", () => {
    const bib = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    const item = bib.sub.find((s) => "to" in s && s.to === "/pesquisa") as { label: string };
    expect(item.label).toMatch(/Legado/i);
  });

  it("Radar Interno hospeda a matriz; Casos 360 aponta para ela", () => {
    const qualidade = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");
    expect(qualidade).toContain("RadarInternoIntegrado");
    const casos = readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8");
    expect(casos).not.toContain("MatrizPrioridadesConectada");
    expect(casos).toContain('to="/qualidade"');
  });
});
