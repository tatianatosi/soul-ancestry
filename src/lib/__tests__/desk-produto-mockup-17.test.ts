import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  TELAS_DESK_MOCKUP,
  MENU_CONTA,
  ROTAS_PRESERVADAS,
  destinosDuplicados,
  destinosSobrepostos,
  rotasDoMenu,
  rotasSemLink,
  rotasDoGrupoInterno,
} from "@/lib/navegacao-desk";

describe("Desk Intelligence — 7 telas do mockup + 6 grupos internos recolhidos", () => {
  it("expõe exatamente as 7 telas aprovadas, na ordem do mockup", () => {
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
    expect(GRUPOS_OPERACIONAIS_DESK).toHaveLength(6);
  });

  it("não volta às 8 grupos nem às 6 abas como sidebar", () => {
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "visao-geral",
      "casos",
      "checklist",
      "juridica",
      "radar",
      "alertas",
      "biblioteca",
    ]);
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("hoje");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("comercial");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("governanca");
  });

  it("mantém o trabalho operacional no contexto certo, sem sobreposição", () => {
    expect(rotasDoGrupoInterno("comercial")).toEqual(
      expect.arrayContaining(["/calls", "/leads", "/marketing", "/propostas", "/conversao"]),
    );
    expect(rotasDoGrupoInterno("casos")).toEqual(
      expect.arrayContaining(["/clientes", "/acessos-portal", "/app-cliente-como-pessoa"]),
    );
    expect(rotasDoGrupoInterno("casos")).not.toContain("/contratos");
    expect(rotasDoGrupoInterno("contratos")).toContain("/contratos");
    expect(rotasDoGrupoInterno("pesquisa")).toEqual(
      expect.arrayContaining(["/pesquisa-modulo", "/pesquisa", "/evidencias"]),
    );
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("não perde rota preservada e não duplica destino dentro da tela", () => {
    expect(rotasSemLink()).toEqual([]);
    expect(destinosDuplicados()).toEqual([]);
    for (const r of ROTAS_PRESERVADAS) expect(rotasDoMenu()).toContain(r);
  });

  it("Painel de Calls opera no Comercial interno; CA-04 e DEMO não disputam a fila do dia", () => {
    expect(rotasDoGrupoInterno("comercial")).toContain("/calls");
    expect(rotasDoGrupoInterno("comercial")).not.toContain("/crm-mestre");
    const conta = MENU_CONTA.itens.filter((s) => "to" in s).map((s) => s.to);
    expect(conta).not.toContain("/app-cliente-demo");
    expect(rotasDoGrupoInterno("governanca")).toContain("/app-cliente-demo");
    expect(conta).not.toContain("/pesquisa");
    expect(conta).not.toContain("/crm-mestre");
    expect(rotasDoGrupoInterno("governanca")).toContain("/crm-mestre");
    expect(rotasDoGrupoInterno("governanca")).toContain("/governanca/catalogo-operacional-30");
  });

  it("dossiê /pesquisa é o repositório do Legado, dentro da Biblioteca", () => {
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
