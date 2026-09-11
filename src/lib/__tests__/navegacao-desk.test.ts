import { describe, expect, it } from "vitest";

import {
  GRUPOS_DESK,
  GRUPOS_OPERACIONAIS_DESK,
  TELAS_DESK_MOCKUP,
  LACUNAS_CONHECIDAS,
  ROTAS_PRESERVADAS,
  destinosDuplicados,
  destinosSobrepostos,
  rotasDoMenu,
  rotasSemLink,
  rotasDoMenuConta,
  rotasDoGrupoInterno,
  MENU_CONTA,
} from "@/lib/navegacao-desk";
import { MATRIZ_EQUIVALENCIA } from "@/lib/matriz-equivalencia";

const FACE = [
  "visao-geral",
  "casos",
  "checklist",
  "juridica",
  "radar",
  "alertas",
  "biblioteca",
] as const;

describe("Navegação do Desk — 7 telas de face + 6 grupos internos", () => {
  it("expõe exatamente as 7 telas do mockup, nesta ordem", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([...TELAS_DESK_MOCKUP]);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([...FACE]);
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

  it("mantém os 6 grupos só como metadado interno, nunca como 8ª tela", () => {
    expect(GRUPOS_OPERACIONAIS_DESK).toEqual([
      "Hoje",
      "Comercial",
      "Casos & Pessoas",
      "Pesquisa",
      "Formalização",
      "Governança",
    ]);
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("comercial");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("governanca");
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("hoje");
    expect(GRUPOS_DESK.some((g) => g.id === "administracao")).toBe(false);
  });

  it("dá descrição curta e humana a cada tela de face", () => {
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

  it("Marketing e Calls moram no Comercial interno, sob Visão Geral", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    const rotasFace = visao.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasFace).toContain("/marketing");
    expect(rotasFace).toContain("/calls");
    expect(rotasFace).toContain("/leads");
    expect(rotasDoGrupoInterno("comercial")).toEqual(
      expect.arrayContaining(["/marketing", "/calls", "/leads", "/propostas", "/conversao"]),
    );
  });

  it("menu da conta fica vazio; administração e DEMO moram em Governança interna", () => {
    expect(rotasDoMenuConta()).toEqual([]);
    const gov = rotasDoGrupoInterno("governanca");
    expect(gov).toContain("/configuracoes");
    expect(gov).toContain("/equipe");
    expect(gov).toContain("/governanca/catalogo-operacional-30");
    expect(gov).toContain("/crm-mestre");
    expect(gov).toContain("/app-cliente-demo");
    const bib = GRUPOS_DESK.find((g) => g.id === "biblioteca")!;
    expect(bib.sub.some((s) => "grupo" in s && s.grupo === "Governança")).toBe(true);
  });

  it("Validação Jurídica e Radar Interno são telas de face, não subitens de outra aba", () => {
    const juridica = GRUPOS_DESK.find((g) => g.id === "juridica")!;
    const radar = GRUPOS_DESK.find((g) => g.id === "radar")!;
    expect(juridica.to).toBe("/matriz-juridica");
    expect(juridica.sub).toEqual([]);
    expect(radar.to).toBe("/qualidade");
    expect(radar.sub).toEqual([]);
    expect(rotasDoMenu()).toContain("/matriz-juridica");
    expect(rotasDoMenu()).toContain("/qualidade");
  });

  it("aplica os rótulos humanos exigidos sem mudar URL", () => {
    expect(GRUPOS_DESK.some((g) => g.to === "/qualidade" && g.label === "Radar Interno")).toBe(true);
    expect(
      GRUPOS_DESK.some((g) => g.to === "/matriz-juridica" && g.label === "Validação Jurídica"),
    ).toBe(true);
    const todos = GRUPOS_DESK.flatMap((g) => g.sub).filter((s) => "to" in s) as {
      to: string;
      label: string;
    }[];
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

  it("mapeia cada grupo da matriz de equivalência para um dos 6 grupos internos", () => {
    const labels = new Set<string>(GRUPOS_OPERACIONAIS_DESK);
    for (const g of MATRIZ_EQUIVALENCIA) {
      expect(g.grupoNovo).toBeDefined();
      expect(labels.has(g.grupoNovo!)).toBe(true);
    }
  });

  it("CA-04 e o dicionário informam o Calls; no menu diário ficam em Governança interna", () => {
    const gov = rotasDoGrupoInterno("governanca");
    expect(gov).toContain("/governanca/catalogo-operacional-30");
    expect(gov).toContain("/crm-mestre");
    expect(gov).toContain("/governanca/dicionario-calls-crm");
    const comercial = rotasDoGrupoInterno("comercial");
    expect(comercial).toContain("/calls");
    expect(comercial).not.toContain("/crm-mestre");
    expect(comercial).not.toContain("/governanca/dicionario-calls-crm");
    const formalizacao = rotasDoGrupoInterno("contratos");
    expect(formalizacao).toContain("/financeiro");
    expect(formalizacao).not.toContain("/conciliacao-catalogo");
    expect(formalizacao).not.toContain("/homologacao-skus");
    const hoje = rotasDoGrupoInterno("hoje");
    expect(hoje).not.toContain("/crm-mestre");
    expect(rotasDoMenuConta()).not.toContain("/crm-mestre");
  });

  it("Painel de Calls permanece acessível em até dois cliques (Visão Geral → Mesa)", () => {
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    expect(visao.to).toBe("/painel");
    expect(
      visao.sub.some(
        (s) => "to" in s && s.to === "/calls" && s.label === "Painel de Calls — Mesa de Discovery",
      ),
    ).toBe(true);
    expect(rotasDoMenu()).toContain("/calls");
  });

  it("ações comuns cabem em até dois passos a partir da face", () => {
    const doisPassos = (telaId: string, rota: string) => {
      const tela = GRUPOS_DESK.find((g) => g.id === telaId)!;
      return tela.to === rota || tela.sub.some((s) => "to" in s && s.to === rota);
    };
    expect(doisPassos("casos", "/casos")).toBe(true);
    expect(doisPassos("casos", "/clientes")).toBe(true);
    expect(doisPassos("visao-geral", "/calls")).toBe(true);
    expect(doisPassos("casos", "/contratos")).toBe(true);
    expect(doisPassos("casos", "/financeiro")).toBe(true);
    expect(doisPassos("biblioteca", "/pesquisa-modulo")).toBe(true);
    expect(doisPassos("biblioteca", "/configuracoes")).toBe(true);
  });
});
