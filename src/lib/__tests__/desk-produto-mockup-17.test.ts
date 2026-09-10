import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  GRUPOS_DESK,
  MENU_CONTA,
  ROTAS_PRESERVADAS,
  TELAS_DESK_MOCKUP,
  rotasDoMenu,
  rotasSemLink,
  destinosDuplicados,
} from "@/lib/navegacao-desk";

describe("Desk Intelligence — face do mockup de 17 páginas", () => {
  it("expõe exatamente as 7 telas do mockup, na ordem aprovada", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...TELAS_DESK_MOCKUP]);
    expect(GRUPOS_DESK.map((g) => g.to)).toEqual([
      "/painel",
      "/casos",
      "/tarefas",
      "/matriz-juridica",
      "/qualidade",
      "/alertas",
      "/biblioteca",
    ]);
  });

  it("não promove Marketing, Comercial, Pesquisa, Contratos nem Cliente a primeiro nível", () => {
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "visao-geral",
      "casos",
      "checklist",
      "validacao",
      "radar",
      "alertas",
      "biblioteca",
    ]);
    expect(GRUPOS_DESK.map((g) => g.label)).not.toContain("Marketing");
    expect(GRUPOS_DESK.map((g) => g.label)).not.toContain("Comercial");
    expect(GRUPOS_DESK.map((g) => g.label)).not.toContain("Pesquisa");
    expect(GRUPOS_DESK.map((g) => g.label)).not.toContain("Contratos e financeiro");
    expect(GRUPOS_DESK.map((g) => g.label)).not.toContain("Cliente");
  });

  it("mantém o trabalho operacional como submenu da tela certa", () => {
    const rotas = (id: string) =>
      GRUPOS_DESK.find((g) => g.id === id)!
        .sub.filter((s) => "to" in s)
        .map((s) => s.to);
    expect(rotas("visao-geral")).toEqual(
      expect.arrayContaining(["/calls", "/leads", "/marketing", "/propostas", "/conversao"]),
    );
    expect(rotas("casos")).toEqual(
      expect.arrayContaining([
        "/contratos",
        "/clientes",
        "/acessos-portal",
        "/app-cliente-como-pessoa",
      ]),
    );
    expect(rotas("checklist")).toContain("/tarefas");
    expect(rotas("biblioteca")).toEqual(
      expect.arrayContaining(["/pesquisa-modulo", "/pesquisa", "/evidencias"]),
    );
  });

  it("não perde rota preservada e não duplica destino dentro do grupo", () => {
    expect(rotasSemLink()).toEqual([]);
    expect(destinosDuplicados()).toEqual([]);
    for (const r of ROTAS_PRESERVADAS) expect(rotasDoMenu()).toContain(r);
  });

  it("Painel de Calls permanece na face da Visão Geral; consulta de legado fica na conta", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    expect(visao.sub.some((s) => "to" in s && s.to === "/calls")).toBe(true);
    const conta = MENU_CONTA.itens.filter((s) => "to" in s).map((s) => s.to);
    expect(conta).toContain("/crm-mestre");
    expect(conta).toContain("/app-cliente-demo");
    expect(conta).not.toContain("/pesquisa");
  });

  it("dossiê /pesquisa é o repositório do Legado, dentro da Biblioteca Mestre", () => {
    const bib = GRUPOS_DESK.find((g) => g.id === "biblioteca")!;
    const item = bib.sub.find((s) => "to" in s && s.to === "/pesquisa") as { label: string };
    expect(item.label).toMatch(/Legado/i);
  });

  it("Radar Interno hospeda a matriz; Casos 360 aponta para ela", () => {
    const qualidade = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");
    expect(qualidade).toContain("MatrizPrioridadesConectada");
    const casos = readFileSync("src/routes/_authenticated/casos.index.tsx", "utf8");
    expect(casos).not.toContain("MatrizPrioridadesConectada");
    expect(casos).toContain('to="/qualidade"');
  });
});
