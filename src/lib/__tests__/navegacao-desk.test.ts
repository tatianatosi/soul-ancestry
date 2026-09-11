import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  LACUNAS_CONHECIDAS,
  ROTAS_ARQUIVO_GITHUB,
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

describe("Navegação do Desk — 6 grupos operacionais", () => {
  it("as três camadas não concorrem: abas, Painel de Calls e KPIs", () => {
    expect(CAMADAS_DESK.map((c) => c.id)).toEqual(["abas", "mesa", "kpis"]);
    expect(CAMADAS_DESK.find((c) => c.id === "mesa")?.superficie).toBe("/calls");
    expect(CAMADAS_DESK.find((c) => c.id === "kpis")?.superficie).toBe("/painel");
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.to).toBe("/calls");
    expect(comercial.sub.some((s) => "to" in s && s.to === "/calls" && s.label === "Painel de Calls")).toBe(
      true,
    );
    expect(GRUPOS_DESK.find((g) => g.id === "hoje")?.to).toBe("/painel");
  });

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
    expect(rotas).not.toContain("/governanca/catalogo-operacional-30");
    expect(rotas).not.toContain("/crm-mestre");
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

  it("CA-04 e o dicionário moram no Comercial com as Calls; catálogo legado não volta ao Desk", () => {
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    const rotasGov = gov.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasGov).not.toContain("/governanca/catalogo-operacional-30");
    expect(rotasGov).not.toContain("/crm-mestre");
    expect(rotasGov).not.toContain("/governanca/dicionario-calls-crm");
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotasComercial = comercial.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasComercial).toContain("/calls");
    expect(rotasComercial).toContain("/crm-mestre");
    expect(rotasComercial).toContain("/governanca/dicionario-calls-crm");
    const contratos = GRUPOS_DESK.find((g) => g.id === "contratos")!;
    const rotasContratos = contratos.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasContratos).toContain("/catalogo");
    expect(rotasContratos).toContain("/financeiro");
    expect(rotasContratos).not.toContain("/conciliacao-catalogo");
    expect(rotasContratos).not.toContain("/homologacao-skus");
    expect(rotasContratos).not.toContain("/escopo-origem");
    const hoje = GRUPOS_DESK.find((g) => g.id === "hoje")!;
    const rotasHoje = hoje.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasHoje).not.toContain("/crm-mestre");
    expect(rotasDoMenuConta()).not.toContain("/crm-mestre");
  });

  it("Planilha, conciliação e SKU legado não voltam ao menu do Desk", () => {
    const menu = new Set(rotasDoMenu());
    for (const r of ROTAS_ARQUIVO_GITHUB) expect(menu.has(r)).toBe(false);
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("legado");
    expect(
      GRUPOS_DESK.flatMap((g) => g.sub).some(
        (s) => "grupo" in s && /legado/i.test(s.grupo),
      ),
    ).toBe(false);
    expect(ROTAS_PRESERVADAS).not.toEqual(expect.arrayContaining([...ROTAS_ARQUIVO_GITHUB]));
    expect(existsSync("archive/github/2026-09-10-legado-catalogo-desk/README.md")).toBe(true);
    for (const arquivo of [
      "governanca.catalogo-operacional-30.tsx",
      "conciliacao-catalogo.tsx",
      "divergencias-catalogo.tsx",
      "homologacao-skus.tsx",
      "escopo-origem.tsx",
    ]) {
      expect(existsSync(`archive/github/2026-09-10-legado-catalogo-desk/rotas/${arquivo}`)).toBe(true);
    }
  });

  it("Painel de Calls permanece na face de Marketing & Comercial", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotas = comercial.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/calls");
    expect(rotasDoMenu()).toContain("/calls");
  });

  it("declara as três camadas sem criar aba nova", () => {
    expect(CAMADAS_DESK.map((c) => c.id)).toEqual(["abas", "mesa", "kpis"]);
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(CAMADAS_DESK.find((c) => c.id === "mesa")?.rota).toBe("/calls");
    expect(CAMADAS_DESK.find((c) => c.id === "kpis")?.rota).toBe("/painel");
  });

  it("cada função mora em um único grupo — privacidade não é operação diária", () => {
    expect(grupoDonoDaRota("/calls")).toBe("Marketing & Comercial");
    expect(grupoDonoDaRota("/leads")).toBe("Marketing & Comercial");
    expect(grupoDonoDaRota("/casos")).toBe("Pessoas & Casos");
    expect(grupoDonoDaRota("/evidencias")).toBe("Inteligência & Pesquisa");
    expect(grupoDonoDaRota("/contratos")).toBe("Formalização & Financeiro");
    expect(grupoDonoDaRota("/financeiro")).toBe("Formalização & Financeiro");
    expect(grupoDonoDaRota("/catalogo")).toBe("Formalização & Financeiro");
    expect(grupoDonoDaRota("/privacidade")).toBe("Governança & Administração");
    expect(grupoDonoDaRota("/homologacao-skus")).toBeNull();
    expect(grupoDonoDaRota("/conciliacao-catalogo")).toBeNull();
    expect(grupoDonoDaRota("/escopo-origem")).toBeNull();
    expect(grupoDonoDaRota("/governanca/catalogo-operacional-30")).toBeNull();
    const pesquisa = GRUPOS_DESK.find((g) => g.id === "pesquisa")!;
    expect(pesquisa.sub.some((s) => "to" in s && s.to === "/privacidade")).toBe(false);
    const contratos = GRUPOS_DESK.find((g) => g.id === "contratos")!;
    const rotasContratos = contratos.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasContratos).not.toContain("/homologacao-skus");
    expect(rotasContratos).not.toContain("/conciliacao-catalogo");
    expect(rotasContratos).not.toContain("/escopo-origem");
  });

  it("legado de Governança sai do menu e fica só no arquivo GitHub", () => {
    const gov = GRUPOS_DESK.find((g) => g.id === "governanca")!;
    const rotasGov = gov.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasGov).toContain("/privacidade");
    expect(gov.sub.some((s) => "grupo" in s && /legado/i.test(s.grupo))).toBe(false);
    expect(gov.sub.some((s) => "to" in s && /legado/i.test(s.label))).toBe(false);
    for (const r of ROTAS_LEGADO_MENU_GOVERNANCA) {
      expect(grupoDonoDaRota(r)).toBeNull();
      expect(rotasGov).not.toContain(r);
      expect(rotasDoMenu()).not.toContain(r);
      expect(rotasDoMenuConta()).not.toContain(r);
    }
    for (const r of ROTAS_ARQUIVO_GITHUB) expect(rotasDoMenu()).not.toContain(r);
  });
});
