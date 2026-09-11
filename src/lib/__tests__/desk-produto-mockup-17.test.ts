import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  MENU_CONTA,
  TELAS_DESK_MOCKUP,
  ROTAS_PRESERVADAS,
  destinosDuplicados,
  destinosSobrepostos,
  rotasDoMenu,
  rotasDoMenuConta,
  rotasSemLink,
} from "@/lib/navegacao-desk";

describe("Desk Intelligence — 7 telas do mockup (17 páginas como referência visual)", () => {
  it("expõe exatamente as 7 telas, na ordem aprovada", () => {
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

  it("não volta aos 6 grupos operacionais como sidebar", () => {
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "visao-geral",
      "casos-360",
      "checklist",
      "validacao-juridica",
      "radar-interno",
      "alertas",
      "biblioteca-mestre",
    ]);
    expect(GRUPOS_DESK.map((g) => g.label)).not.toEqual([...GRUPOS_OPERACIONAIS_DESK]);
    expect(GRUPOS_OPERACIONAIS_DESK).toHaveLength(6);
  });

  it("mantém o trabalho operacional na tela certa, sem sobreposição", () => {
    const rotas = (id: string) =>
      GRUPOS_DESK.find((g) => g.id === id)!
        .sub.filter((s) => "to" in s)
        .map((s) => s.to);
    expect(rotas("visao-geral")).toEqual(
      expect.arrayContaining(["/calls", "/leads", "/marketing", "/propostas", "/conversao"]),
    );
    expect(rotas("casos-360")).toEqual(
      expect.arrayContaining(["/clientes", "/acessos-portal", "/app-cliente-como-pessoa", "/contratos"]),
    );
    expect(rotas("biblioteca-mestre")).toEqual(
      expect.arrayContaining(["/pesquisa-modulo", "/pesquisa", "/evidencias"]),
    );
    expect(rotas("biblioteca-mestre")).not.toContain("/matriz-juridica");
    expect(rotas("biblioteca-mestre")).not.toContain("/privacidade");
    expect(rotasDoMenuConta()).toEqual(
      expect.arrayContaining([
        "/privacidade",
        "/homologacao-skus",
        "/conciliacao-catalogo",
        "/escopo-origem",
      ]),
    );
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("não perde rota preservada e não duplica destino dentro da tela", () => {
    expect(rotasSemLink()).toEqual([]);
    expect(destinosDuplicados()).toEqual([]);
    for (const r of ROTAS_PRESERVADAS) expect(rotasDoMenu()).toContain(r);
  });

  it("Painel de Calls e CA-04 ficam no contexto comercial de Visão Geral; DEMO fica fora da fila do dia", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    expect(visao.sub.some((s) => "to" in s && s.to === "/calls")).toBe(true);
    expect(visao.sub.some((s) => "to" in s && s.to === "/crm-mestre")).toBe(true);
    const conta = MENU_CONTA.itens.filter((s) => "to" in s).map((s) => s.to);
    expect(conta).toContain("/app-cliente-demo");
    expect(conta).not.toContain("/pesquisa");
    expect(conta).not.toContain("/crm-mestre");
    expect(conta).toContain("/governanca/catalogo-operacional-30");
    expect(conta).toContain("/privacidade");
  });

  it("dossiê /pesquisa é o repositório do Legado, dentro da Biblioteca Mestre", () => {
    const bib = GRUPOS_DESK.find((g) => g.id === "biblioteca-mestre")!;
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
