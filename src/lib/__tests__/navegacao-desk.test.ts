import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  LACUNAS_CONHECIDAS,
  ROTAS_PRESERVADAS,
  destinosDuplicados,
  rotasDoMenu,
  rotasSemLink,
  rotasDoMenuConta,
  MENU_CONTA,
} from "@/lib/navegacao-desk";
import { MATRIZ_EQUIVALENCIA } from "@/lib/matriz-equivalencia";

describe("CA-UX-03 — navegação em 8 grupos", () => {
  it("expõe exatamente 8 grupos principais", () => {
    expect(GRUPOS_DESK).toHaveLength(8);
  });

  it("usa os rótulos canônicos e ids estáveis", () => {
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "marketing",
      "comercial",
      "casos",
      "pesquisa",
      "contratos",
      "cliente",
      "governanca",
    ]);
  });

  it("dá descrição curta e humana a cada grupo", () => {
    for (const g of GRUPOS_DESK) {
      expect(g.descricao.length).toBeGreaterThan(20);
      expect(g.descricao.length).toBeLessThan(140);
    }
  });

  it("preserva todas as rotas que já tinham link de menu", () => {
    expect(rotasSemLink()).toEqual([]);
  });

  it("não duplica destino (rota + hash) entre grupos", () => {
    expect(destinosDuplicados()).toEqual([]);
  });

  it("usa apenas rotas absolutas do Desk", () => {
    for (const r of rotasDoMenu()) expect(r.startsWith("/")).toBe(true);
  });

  it("expõe Marketing como aba 2 e mantém link contextual em Comercial", () => {
    expect(GRUPOS_DESK[1]!.id).toBe("marketing");
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    const rotas = comercial.sub.filter((s) => "to" in s).map((s) => (s as { to: string }).to);
    expect(rotas).toContain("/marketing");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("administracao");
  });

  it("move Configurações, Equipe e Perfis para o menu da conta, sem nona aba", () => {
    expect(GRUPOS_DESK).toHaveLength(8);
    const conta = rotasDoMenuConta();
    for (const r of ["/configuracoes", "/equipe", "/modo-proprietaria"]) expect(conta).toContain(r);
    for (const g of GRUPOS_DESK) {
      const rotas = g.sub.filter((s) => "to" in s).map((s) => (s as { to: string }).to);
      expect(rotas).not.toContain("/configuracoes");
    }
  });

  it("mantém Validação Jurídica em Governança com link contextual em Comercial e Casos", () => {
    const temJuridica = (id: string) =>
      GRUPOS_DESK.find((g) => g.id === id)!.sub.some((s) => "to" in s && s.to === "/matriz-juridica");
    expect(temJuridica("governanca")).toBe(true);
    expect(temJuridica("comercial")).toBe(true);
    expect(temJuridica("casos")).toBe(true);
  });

  it("aplica os rótulos humanos exigidos sem mudar URL", () => {
    const todos = GRUPOS_DESK.flatMap((g) => g.sub).filter((s) => "to" in s) as {
      to: string;
      label: string;
    }[];
    expect(todos.some((s) => s.to === "/qualidade" && s.label === "Radar Interno e Qualidade")).toBe(true);
    expect(todos.some((s) => s.to === "/matriz-juridica" && s.label === "Validação Jurídica")).toBe(true);
    expect(
      todos.some((s) => s.to === "/pesquisa-modulo" && s.label === "Pesquisa Genealógica e Evidências"),
    ).toBe(true);
  });

  it("restringe equipe e auditoria a admin", () => {
    const restritos = GRUPOS_DESK.flatMap((g) => g.sub)
      .filter((s) => "to" in s && s.adminOnly)
      .map((s) => (s as { to: string }).to);
    expect(restritos.sort()).toEqual(["/auditoria", "/equipe"]);
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

  it("mapeia cada grupo da matriz de equivalência para um grupo novo existente", () => {
    const labels = new Set(GRUPOS_DESK.map((g) => g.label));
    for (const g of MATRIZ_EQUIVALENCIA) {
      expect(g.grupoNovo).toBeDefined();
      expect(labels.has(g.grupoNovo!) || g.grupoNovo === MENU_CONTA.label).toBe(true);
    }
  });
});
