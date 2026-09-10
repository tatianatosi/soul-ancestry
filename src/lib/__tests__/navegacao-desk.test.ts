import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  LACUNAS_CONHECIDAS,
  ROTAS_PRESERVADAS,
  destinosDuplicados,
  destinosSobrepostos,
  rotasDoMenu,
  rotasSemLink,
  rotasDoMenuConta,
  MENU_CONTA,
} from "@/lib/navegacao-desk";
import { MATRIZ_EQUIVALENCIA } from "@/lib/matriz-equivalencia";

describe("Navegação do Desk — 6 grupos operacionais", () => {
  it("expõe exatamente os 6 grupos aprovados", () => {
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...GRUPOS_OPERACIONAIS_DESK]);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "comercial",
      "casos",
      "pesquisa",
      "contratos",
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

  it("Marketing e Calls moram em Marketing & Comercial", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotas = comercial.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/marketing");
    expect(rotas).toContain("/calls");
    expect(rotas).toContain("/leads");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("administracao");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("visao-geral");
  });

  it("menu da conta só tem a sessão DEMO; administração mora em Governança", () => {
    expect(rotasDoMenuConta()).toEqual(["/app-cliente-demo"]);
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    const rotas = gov.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/configuracoes");
    expect(rotas).toContain("/equipe");
    expect(rotas).toContain("/crm-mestre");
  });

  it("Validação Jurídica mora na Inteligência; Radar Interno mora em Pessoas & Casos", () => {
    const pesquisa = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    const casos = GRUPOS_DESK.find((g) => g.id === "casos")!;
    expect(pesquisa.sub.some((s) => "to" in s && s.to === "/matriz-juridica")).toBe(true);
    expect(casos.sub.some((s) => "to" in s && s.to === "/qualidade")).toBe(true);
    expect(casos.sub.some((s) => "to" in s && s.to === "/matriz-juridica")).toBe(false);
  });

  it("aplica os rótulos humanos exigidos sem mudar URL", () => {
    const todos = GRUPOS_DESK.flatMap((g) => g.sub).filter((s) => "to" in s) as {
      to: string;
      label: string;
    }[];
    expect(
      todos.some((s) => s.to === "/qualidade" && s.label === "Radar Interno e Qualidade"),
    ).toBe(true);
    expect(todos.some((s) => s.to === "/matriz-juridica" && s.label === "Validação Jurídica")).toBe(
      true,
    );
    expect(
      todos.some(
        (s) => s.to === "/pesquisa-modulo" && s.label === "Pesquisa Genealógica e Evidências",
      ),
    ).toBe(true);
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

  it("cobre todas as rotas preservadas na lista de menu", () => {
    const menu = new Set(rotasDoMenu());
    for (const r of ROTAS_PRESERVADAS) expect(menu.has(r)).toBe(true);
  });

  it("mapeia cada grupo da matriz de equivalência para um dos 6 grupos", () => {
    const labels = new Set(GRUPOS_DESK.map((g) => g.label));
    for (const g of MATRIZ_EQUIVALENCIA) {
      expect(g.grupoNovo).toBeDefined();
      expect(labels.has(g.grupoNovo!)).toBe(true);
    }
  });

  it("consulta de legado fica em Governança, não no Hoje nem no Comercial", () => {
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    const rotasGov = gov.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasGov).toContain("/crm-mestre");
    expect(rotasGov).toContain("/governanca/dicionario-calls-crm");
    expect(rotasGov).toContain("/governanca/catalogo-operacional-30");
    const hoje = GRUPOS_DESK.find((g) => g.id === "hoje")!;
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    for (const g of [hoje, comercial]) {
      const rotas = g.sub.filter((s) => "to" in s).map((s) => s.to);
      expect(rotas).not.toContain("/crm-mestre");
    }
    expect(rotasDoMenuConta()).not.toContain("/crm-mestre");
  });

  it("Painel de Calls permanece na face de Marketing & Comercial", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotas = comercial.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/calls");
    expect(rotasDoMenu()).toContain("/calls");
  });
});
