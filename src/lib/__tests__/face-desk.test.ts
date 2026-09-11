import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  FACE_DA_ROTA,
  FACE_DESK,
  GRUPOS_DESK,
  TELAS_DESK_MOCKUP,
  faceNavAtivo,
  internosDaFace,
  rotasDoMenu,
  rotasSemLink,
} from "@/lib/navegacao-desk";

describe("Face do Desk — 7 telas do mockup, 6 grupos por dentro", () => {
  it("a barra principal são as 7 telas aprovadas, nesta ordem", () => {
    expect(FACE_DESK.map((f) => f.label)).toEqual([...TELAS_DESK_MOCKUP]);
    expect(FACE_DESK.map((f) => f.to)).toEqual([
      "/painel",
      "/casos",
      "/tarefas",
      "/matriz-juridica",
      "/qualidade",
      "/alertas",
      "/biblioteca",
    ]);
  });

  it("os 6 grupos continuam como camada interna — não são a barra", () => {
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "comercial",
      "casos",
      "pesquisa",
      "contratos",
      "governanca",
    ]);
  });

  it("o shell renderiza FACE_DESK, não os 6 grupos como menu concorrente", () => {
    const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
    expect(shell).toContain("FACE_DESK");
    expect(shell).toContain("internosDaFace");
    expect(shell).toContain('data-face-desk="principal"');
    expect(shell).toContain("desktop && ativo");
    expect(shell).not.toMatch(/const NAV:.*GRUPOS_DESK/);
  });

  it("toda rota dos 6 grupos tem uma tela da face — nada some", () => {
    for (const g of GRUPOS_DESK) {
      expect(FACE_DA_ROTA[g.to], `entrada do grupo sem face: ${g.id} ${g.to}`).toBeDefined();
      for (const s of g.sub) {
        if (!("to" in s)) continue;
        expect(FACE_DA_ROTA[s.to], `rota sem face: ${s.to}`).toBeDefined();
      }
    }
    expect(rotasSemLink()).toEqual([]);
  });

  it("Mesa Discovery, pessoa, contrato, financeiro, pesquisa e config cabem em dois cliques", () => {
    const rotas = (id: (typeof FACE_DESK)[number]["id"]) => {
      const face = FACE_DESK.find((f) => f.id === id)!;
      return [face.to, ...internosDaFace(id).filter((s) => "to" in s).map((s) => s.to)];
    };
    expect(rotas("visao-geral")).toEqual(expect.arrayContaining(["/painel", "/calls", "/leads"]));
    expect(rotas("casos-360")).toEqual(
      expect.arrayContaining(["/casos", "/clientes", "/contratos", "/financeiro"]),
    );
    expect(rotas("checklist")).toEqual(expect.arrayContaining(["/tarefas", "/ops"]));
    expect(rotas("biblioteca-mestre")).toEqual(
      expect.arrayContaining(["/biblioteca", "/pesquisa-modulo", "/configuracoes"]),
    );
  });

  it("Alertas, Radar e Validação Jurídica são folhas — sem submenu concorrente", () => {
    const folhas = (id: (typeof FACE_DESK)[number]["id"]) =>
      internosDaFace(id).filter((s) => "to" in s);
    expect(folhas("alertas")).toEqual([]);
    expect(folhas("radar-interno")).toEqual([]);
    expect(folhas("validacao-juridica")).toEqual([]);
  });

  it("Calls não é item de primeiro nível; mora no submenu da Visão Geral", () => {
    expect(FACE_DESK.map((f) => f.to)).not.toContain("/calls");
    expect(internosDaFace("visao-geral").some((s) => "to" in s && s.to === "/calls")).toBe(true);
  });

  it("Governança não compete na barra — entra na Biblioteca", () => {
    expect(FACE_DESK.map((f) => f.label)).not.toContain("Governança & Administração");
    expect(internosDaFace("biblioteca-mestre").some((s) => "to" in s && s.to === "/configuracoes")).toBe(
      true,
    );
  });

  it("ao abrir /calls, a Visão Geral fica ativa — não um grupo Comercial", () => {
    const visao = FACE_DESK.find((f) => f.id === "visao-geral")!;
    const casos = FACE_DESK.find((f) => f.id === "casos-360")!;
    expect(faceNavAtivo("/calls", "", visao)).toBe(true);
    expect(faceNavAtivo("/calls", "", casos)).toBe(false);
  });

  it("rotas do menu ainda alcançam o acervo preservado", () => {
    expect(rotasDoMenu()).toEqual(expect.arrayContaining(["/calls", "/contratos", "/financeiro"]));
  });

  it("a tela de entrada descreve a face, não o grupo Comercial como menu", () => {
    const entrar = readFileSync("src/routes/equipe.entrar.tsx", "utf8");
    expect(entrar).toContain("Visão Geral");
    expect(entrar).toContain("Casos 360");
    expect(entrar).toContain("Biblioteca Mestre");
    expect(entrar).not.toContain("continua em Comercial");
  });
});
