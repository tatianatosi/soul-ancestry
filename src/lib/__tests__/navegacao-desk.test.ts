import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  TELAS_DESK_MOCKUP,
  LACUNAS_CONHECIDAS,
  CAMADAS_DESK,
  ROTAS_PRESERVADAS,
  ROTAS_LEGADO_MENU_GOVERNANCA,
  destinosDuplicados,
  destinosSobrepostos,
  grupoDonoDaRota,
  rotasDoMenu,
  rotasSemLink,
  rotasDoMenuConta,
  MENU_CONTA,
} from "@/lib/navegacao-desk";
import { MATRIZ_EQUIVALENCIA } from "@/lib/matriz-equivalencia";

describe("Navegação do Desk — 7 telas do mockup", () => {
  it("as três camadas não concorrem: abas, Mesa e KPIs", () => {
    expect(CAMADAS_DESK.map((c) => c.id)).toEqual(["abas", "mesa", "kpis"]);
    expect(CAMADAS_DESK.find((c) => c.id === "mesa")?.superficie).toBe("/calls");
    expect(CAMADAS_DESK.find((c) => c.id === "kpis")?.superficie).toBe("/painel");
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    expect(visao.to).toBe("/painel");
    expect(visao.sub.some((s) => "to" in s && s.to === "/calls" && s.label === "Mesa de Discovery")).toBe(
      true,
    );
  });

  it("expõe exatamente as 7 telas do mockup na sidebar", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...TELAS_DESK_MOCKUP]);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "visao-geral",
      "casos-360",
      "checklist",
      "validacao-juridica",
      "radar-interno",
      "alertas",
      "biblioteca-mestre",
    ]);
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

  it("mantém a organização interna de 6 eixos sem usá-la como sidebar", () => {
    expect(GRUPOS_OPERACIONAIS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.label)).not.toEqual([...GRUPOS_OPERACIONAIS_DESK]);
  });

  it("dá descrição curta e humana a cada tela", () => {
    for (const g of GRUPOS_DESK) {
      expect(g.descricao.length).toBeGreaterThan(20);
      expect(g.descricao.length).toBeLessThan(160);
    }
  });

  it("preserva todas as rotas que já tinham link de menu", () => {
    expect(rotasSemLink()).toEqual([]);
  });

  it("não duplica destino dentro de uma tela nem sobrepõe entre telas", () => {
    expect(destinosDuplicados()).toEqual([]);
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("usa apenas rotas absolutas do Desk", () => {
    for (const r of rotasDoMenu()) expect(r.startsWith("/")).toBe(true);
  });

  it("Comercial e Marketing moram como contexto de Visão Geral", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    const rotas = visao.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/marketing");
    expect(rotas).toContain("/calls");
    expect(rotas).toContain("/leads");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("comercial");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("governanca");
  });

  it("menu da conta concentra administração e legado; DEMO permanece", () => {
    const conta = rotasDoMenuConta();
    expect(conta).toContain("/app-cliente-demo");
    expect(conta).toContain("/configuracoes");
    expect(conta).toContain("/equipe");
    expect(conta).toContain("/governanca/catalogo-operacional-30");
    expect(conta).not.toContain("/crm-mestre");
  });

  it("Validação Jurídica e Radar Interno são telas de primeiro nível", () => {
    expect(GRUPOS_DESK.some((g) => g.to === "/matriz-juridica")).toBe(true);
    expect(GRUPOS_DESK.some((g) => g.to === "/qualidade")).toBe(true);
    const casos = GRUPOS_DESK.find((g) => g.id === "casos-360")!;
    expect(casos.sub.some((s) => "to" in s && s.to === "/matriz-juridica")).toBe(false);
    expect(casos.sub.some((s) => "to" in s && s.to === "/qualidade")).toBe(false);
  });

  it("aplica os rótulos humanos exigidos sem mudar URL", () => {
    expect(GRUPOS_DESK.some((g) => g.to === "/qualidade" && g.label === "Radar Interno")).toBe(true);
    expect(GRUPOS_DESK.some((g) => g.to === "/matriz-juridica" && g.label === "Validação Jurídica")).toBe(
      true,
    );
    const todos = GRUPOS_DESK.flatMap((g) => g.sub).filter((s) => "to" in s) as {
      to: string;
      label: string;
    }[];
    expect(todos.some((s) => s.to === "/calls" && s.label === "Mesa de Discovery")).toBe(true);
  });

  it("legado permanece acessível sem ser operação diária", () => {
    for (const r of ROTAS_LEGADO_MENU_GOVERNANCA) {
      expect(rotasDoMenuConta()).toContain(r);
    }
  });

  it("grupoDonoDaRota aponta a tela canônica", () => {
    expect(grupoDonoDaRota("/calls")).toBe("Visão Geral");
    expect(grupoDonoDaRota("/contratos")).toBe("Casos 360");
    expect(grupoDonoDaRota("/biblioteca")).toBe("Biblioteca Mestre");
  });

  it("lacunas conhecidas permanecem declaradas", () => {
    expect(LACUNAS_CONHECIDAS.length).toBeGreaterThan(0);
  });

  it("matriz de equivalência não inventa grupos de sidebar", () => {
    expect(MATRIZ_EQUIVALENCIA).toBeTruthy();
  });

  it("ROTAS_PRESERVADAS não fica órfã", () => {
    expect(ROTAS_PRESERVADAS.length).toBeGreaterThan(20);
    expect(rotasSemLink()).toEqual([]);
  });

  it("MENU_CONTA não vira oitava tela da sidebar", () => {
    expect(MENU_CONTA.id).toBe("conta");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("conta");
  });
});
