import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  LACUNAS_CONHECIDAS,
  CAMADAS_DESK,
  ROTAS_PRESERVADAS,
  ROTAS_LEGADO_MENU_GOVERNANCA,
  CLASSIFICACAO_SANEAMENTO_V4,
  destinosDuplicados,
  destinosSobrepostos,
  grupoDonoDaRota,
  rotasDoMenu,
  rotasSemLink,
  rotasDoMenuConta,
  MENU_CONTA,
} from "@/lib/navegacao-desk";
import { MATRIZ_EQUIVALENCIA } from "@/lib/matriz-equivalencia";

describe("Navegação do Desk — 7 grupos do V4 (03/10/2026)", () => {
  it("as três camadas não concorrem: abas, Mesa e KPIs", () => {
    expect(CAMADAS_DESK.map((c) => c.id)).toEqual(["abas", "mesa", "kpis"]);
    expect(CAMADAS_DESK.find((c) => c.id === "mesa")?.superficie).toBe("/calls");
    expect(CAMADAS_DESK.find((c) => c.id === "kpis")?.superficie).toBe("/painel");
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.to).toBe("/leads");
    expect(comercial.sub.some((s) => "to" in s && s.to === "/calls" && s.label === "Discovery")).toBe(true);
    expect(GRUPOS_DESK.find((g) => g.id === "hoje")?.to).toBe("/painel");
  });

  it("expõe exatamente os 7 grupos do V4", () => {
    expect(GRUPOS_DESK).toHaveLength(8); // 18/10/2026: 7 grupos V4 + Financeiro
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...GRUPOS_OPERACIONAIS_DESK]);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "comercial",
      "casos",
      "pessoas",
      "pesquisa",
      "marketing",
      "financeiro",
      "governanca",
    ]);
  });

  it("dá descrição curta e humana a cada grupo", () => {
    for (const g of GRUPOS_DESK) {
      expect(g.descricao.length).toBeGreaterThan(20);
      expect(g.descricao.length).toBeLessThan(160);
    }
  });

  it("preserva todas as rotas que já tinham link de menu", () => {
    expect(rotasSemLink()).toEqual([]);
  });

  it("não duplica destino dentro de um grupo nem sobrepõe entre grupos", () => {
    expect(destinosDuplicados()).toEqual([]);
    expect(destinosSobrepostos()).toEqual([]);
  });

  it("usa apenas rotas absolutas do Desk", () => {
    for (const r of rotasDoMenu()) expect(r.startsWith("/")).toBe(true);
  });

  it("Calls e Leads moram em Comercial; Marketing virou grupo próprio no V4", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotas = comercial.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).not.toContain("/marketing");
    expect(GRUPOS_DESK.find((g) => g.id === "marketing")!.to).toBe("/marketing");
    expect(rotas).toContain("/calls");
    expect(rotas).toContain("/leads");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("administracao");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("visao-geral");
  });

  it("menu da conta ficou sem a sessão DEMO; administração mora em Governança", () => {
    expect(rotasDoMenuConta()).toEqual([]);
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    const rotas = gov.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/configuracoes");
    expect(rotas).toContain("/equipe");
    // V4: catálogo operacional 30 saiu do menu como LEGADO_SEM_MENU.
    expect(rotas).not.toContain("/governanca/catalogo-operacional-30");
    expect(CLASSIFICACAO_SANEAMENTO_V4["/governanca/catalogo-operacional-30"]).toBe("LEGADO_SEM_MENU");
    expect(rotas).not.toContain("/crm-mestre");
  });

  it("18/10/2026: Validação jurídica mora em Configuração, ao lado de Radar e matrizes", () => {
    const casos = GRUPOS_DESK.find((g) => g.id === "casos")!;
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    expect(gov.sub.some((s) => "to" in s && s.to === "/matriz-juridica")).toBe(true);
    expect(GRUPOS_DESK.find((g) => g.id === "comercial")!.sub.some((s) => "to" in s && s.to === "/matriz-juridica")).toBe(false);
    expect(casos.sub.some((s) => "to" in s && s.to === "/matriz-juridica")).toBe(false);
    expect(gov.sub.some((s) => "to" in s && s.to === "/qualidade")).toBe(true);
  });

  it("aplica os rótulos humanos exigidos sem mudar URL", () => {
    const todos = GRUPOS_DESK.flatMap((g) => g.sub).filter((s) => "to" in s) as {
      to: string;
      label: string;
    }[];
    // Rótulos do V4, conforme a prancha enviada pela Proprietária em 03/10.
    /*
     * 04/10/2026 — decisão da Proprietária: "Retire todas as auditorias
     * repetidas do menu". O item passou de "Qualidade e auditoria" (rótulo da
     * prancha V4) para "Radar e matrizes", que é o que a rota realmente é. A
     * parte de qualidade/checklists continua dentro dela, recolhida.
     */
    expect(todos.some((s) => s.to === "/qualidade" && s.label === "Radar e matrizes")).toBe(true);
    expect(todos.some((s) => /auditoria/i.test(s.label))).toBe(false);
    expect(todos.some((s) => s.to === "/catalogo" && s.label === "Catálogo e preços")).toBe(true);
    expect(todos.some((s) => s.to === "/pesquisa-modulo" && s.label === "Painel de pesquisa")).toBe(true);
  });

  it("restringe equipe a admin", () => {
    const restritos = GRUPOS_DESK.flatMap((g) => g.sub)
      .filter((s): s is { to: string; label: string; adminOnly?: boolean } => "to" in s && Boolean(s.adminOnly))
      .map((s) => s.to);
    const restritosConta = MENU_CONTA.itens
      .filter((s): s is { to: string; label: string; adminOnly?: boolean } => "to" in s && Boolean(s.adminOnly))
      .map((s) => s.to);
    expect([...restritos, ...restritosConta].sort()).toEqual(["/equipe"]);
  });

  it("não referencia rotas do App Cliente nem do mockup como superfície operacional", () => {
    for (const r of rotasDoMenu()) {
      expect(r.startsWith("/portal")).toBe(false);
      expect(r.startsWith("/canvas")).toBe(false);
    }
  });

  it("declara o radar multi-país como lacuna, sem fonte simulada", () => {
    expect(LACUNAS_CONHECIDAS.some((l) => l.item === "Radar multi-país")).toBe(true);
  });

  it("nenhuma rota preservada some: ou está no menu, ou está classificada no V4", () => {
    const menu = new Set(rotasDoMenu());
    for (const r of ROTAS_PRESERVADAS) {
      expect(menu.has(r) || r in CLASSIFICACAO_SANEAMENTO_V4, r).toBe(true);
    }
  });

  it("mapeia cada grupo da matriz de equivalência para um dos 7 grupos", () => {
    const labels = new Set(GRUPOS_DESK.map((g) => g.label));
    for (const g of MATRIZ_EQUIVALENCIA) {
      expect(g.grupoNovo).toBeDefined();
      expect(labels.has(g.grupoNovo!)).toBe(true);
    }
  });

  it("V4: CA-04 e o dicionário saem do menu como alimento, sem sumir", () => {
    const todas = new Set(rotasDoMenu());
    for (const r of ["/crm-mestre", "/governanca/dicionario-calls-crm"]) {
      expect(todas.has(r), r).toBe(false);
      expect(CLASSIFICACAO_SANEAMENTO_V4[r], r).toBe("ALIMENTO_CONTEXTUAL");
    }
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.sub.filter((s) => "to" in s).map((s) => s.to)).toContain("/calls");
    expect(rotasDoMenuConta()).not.toContain("/crm-mestre");
  });

  it("Painel de Calls permanece na face de Comercial", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotas = comercial.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/calls");
    expect(rotasDoMenu()).toContain("/calls");
  });

  it("declara as três camadas sem criar aba nova", () => {
    expect(CAMADAS_DESK.map((c) => c.id)).toEqual(["abas", "mesa", "kpis"]);
    expect(GRUPOS_DESK).toHaveLength(8); // 18/10/2026: 7 grupos V4 + Financeiro
    expect(CAMADAS_DESK.find((c) => c.id === "mesa")?.rota).toBe("/calls");
    expect(CAMADAS_DESK.find((c) => c.id === "kpis")?.rota).toBe("/painel");
  });

  it("cada função mora em um único grupo — privacidade e SKU legado não são operação diária", () => {
    expect(grupoDonoDaRota("/calls")).toBe("Comercial");
    expect(grupoDonoDaRota("/leads")).toBe("Comercial");
    expect(grupoDonoDaRota("/casos")).toBe("Casos");
    expect(grupoDonoDaRota("/evidencias")).toBe("Pesquisa");
    // A prancha V4 põe condições comerciais e financeiro do caso em Comercial.
    expect(grupoDonoDaRota("/contratos")).toBe("Comercial");
    expect(grupoDonoDaRota("/financeiro")).toBe("Financeiro");
    expect(grupoDonoDaRota("/catalogo")).toBe("Configuração");
    expect(grupoDonoDaRota("/privacidade")).toBe("Configuração");
    // Legado de SKU/conciliação saiu do menu no V4 — sem dono de grupo, com classificação.
    for (const r of ["/homologacao-skus", "/conciliacao-catalogo", "/escopo-origem"]) {
      expect(grupoDonoDaRota(r) ?? undefined, r).toBeUndefined();
      expect(CLASSIFICACAO_SANEAMENTO_V4[r], r).toBe("LEGADO_SEM_MENU");
    }
    const pesquisa = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    expect(pesquisa.sub.some((s) => "to" in s && s.to === "/privacidade")).toBe(false);
  });

  it("V4: legado SKU/conciliação sai do menu, mas a rota continua e fica classificada", () => {
    const menu = new Set(rotasDoMenu());
    for (const r of ROTAS_LEGADO_MENU_GOVERNANCA) {
      expect(menu.has(r), r).toBe(false);
      expect(CLASSIFICACAO_SANEAMENTO_V4[r], r).toBe("LEGADO_SEM_MENU");
      expect(rotasDoMenuConta()).not.toContain(r);
    }
  });
});
