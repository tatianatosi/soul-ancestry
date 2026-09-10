import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  LACUNAS_CONHECIDAS,
  ROTAS_PRESERVADAS,
  TELAS_DESK_MOCKUP,
  destinosDuplicados,
  rotasDoMenu,
  rotasSemLink,
  rotasDoMenuConta,
  MENU_CONTA,
} from "@/lib/navegacao-desk";
import { MATRIZ_EQUIVALENCIA } from "@/lib/matriz-equivalencia";

describe("Navegação do Desk — 7 telas do mockup (camada operacional interna)", () => {
  it("expõe exatamente as 7 telas aprovadas", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...TELAS_DESK_MOCKUP]);
  });

  it("dá descrição curta e humana a cada tela", () => {
    for (const g of GRUPOS_DESK) {
      expect(g.descricao.length).toBeGreaterThan(20);
      expect(g.descricao.length).toBeLessThan(140);
    }
  });

  it("preserva todas as rotas que já tinham link de menu", () => {
    expect(rotasSemLink()).toEqual([]);
  });

  it("não duplica destino (rota + hash) dentro de um grupo", () => {
    expect(destinosDuplicados()).toEqual([]);
  });

  it("usa apenas rotas absolutas do Desk", () => {
    for (const r of rotasDoMenu()) expect(r.startsWith("/")).toBe(true);
  });

  it("Marketing e Calls moram na Visão Geral, sem segundo grupo concorrente", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    const rotas = visao.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/marketing");
    expect(rotas).toContain("/calls");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("administracao");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("marketing");
  });

  it("move Configurações, Equipe e Perfis para o menu da conta, sem oitava aba", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    const conta = rotasDoMenuConta();
    for (const r of ["/configuracoes", "/equipe"]) expect(conta).toContain(r);
    for (const g of GRUPOS_DESK) {
      const rotas = g.sub.filter((s) => "to" in s).map((s) => s.to);
      expect(rotas).not.toContain("/configuracoes");
    }
  });

  it("Validação Jurídica e Radar Interno são telas próprias, não atalhos de governança", () => {
    expect(GRUPOS_DESK.find((g) => g.id === "validacao")?.to).toBe("/matriz-juridica");
    expect(GRUPOS_DESK.find((g) => g.id === "radar")?.to).toBe("/qualidade");
    const casos = GRUPOS_DESK.find((g) => g.id === "casos")!;
    const rotasCasos = casos.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasCasos).not.toContain("/matriz-juridica");
    expect(rotasCasos).not.toContain("/qualidade");
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

  it("mapeia cada grupo da matriz de equivalência para uma tela do mockup ou para a conta", () => {
    const labels = new Set(GRUPOS_DESK.map((g) => g.label));
    for (const g of MATRIZ_EQUIVALENCIA) {
      expect(g.grupoNovo).toBeDefined();
      expect(labels.has(g.grupoNovo!) || g.grupoNovo === MENU_CONTA.label).toBe(true);
    }
  });

  it("CRM Vivo (leads, propostas, conversão) aparece na Visão Geral", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    const rotas = visao.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/leads");
    expect(rotas).toContain("/propostas");
    expect(rotas).toContain("/conversao");
  });

  it("consulta de legado (CRM Mestre, dicionário, catálogo 30) fica no menu da conta, não na face", () => {
    const conta = MENU_CONTA.itens.filter((s) => "to" in s).map((s) => s.to);
    expect(conta).toContain("/crm-mestre");
    expect(conta).toContain("/governanca/dicionario-calls-crm");
    expect(conta).toContain("/governanca/catalogo-operacional-30");
    const rotasFace = GRUPOS_DESK.flatMap((g) =>
      g.sub.filter((s) => "to" in s).map((s) => s.to),
    );
    expect(rotasFace).not.toContain("/crm-mestre");
    expect(rotasFace).not.toContain("/governanca/dicionario-calls-crm");
    expect(rotasFace).not.toContain("/governanca/catalogo-operacional-30");
  });

  it("Painel de Calls permanece na face da Visão Geral", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    const rotas = visao.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotas).toContain("/calls");
    expect(rotasDoMenu()).toContain("/calls");
  });
});
