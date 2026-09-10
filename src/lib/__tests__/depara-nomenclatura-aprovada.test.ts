import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { GRUPOS_DESK, LINKS_CONTEXTUAIS } from "@/lib/navegacao-desk";

/*
 * RESGATE DAS NOMENCLATURAS APROVADAS (09/09/2026) — de-para obrigatório:
 * Hoje → Visão Geral; Casos → Casos 360; Governança → Biblioteca Mestre.
 * Validação Jurídica, Radar Interno, Alertas já batiam com o aprovado.
 * Os 8 grupos operacionais reais (Hoje/Visão Geral, Marketing, Comercial,
 * Casos/Casos 360, Pesquisa, Contratos e financeiro, Cliente, Biblioteca/
 * Governança) continuam existindo e com as mesmas rotas — só o rótulo de
 * navegação principal mudou, nunca a URL nem a funcionalidade.
 */

describe("De-para de nomenclatura — Desk usa os nomes aprovados na navegação principal", () => {
  it("continua com exatamente 7 telas do mockup, mesmas rotas de entrada", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
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

  it("usa os rótulos aprovados: Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas, Biblioteca Mestre", () => {
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([
      "Visão Geral",
      "Casos 360",
      "Checklist",
      "Validação Jurídica",
      "Radar Interno",
      "Alertas",
      "Biblioteca Mestre",
    ]);
  });

  it("trabalho operacional (Marketing, Comercial, Pesquisa, Contratos) mora como submenu, não como tela concorrente", () => {
    const labels = GRUPOS_DESK.map((g) => g.label);
    expect(labels).not.toContain("Marketing");
    expect(labels).not.toContain("Comercial");
    expect(labels).not.toContain("Pesquisa");
    expect(labels).not.toContain("Contratos e financeiro");
    const visao = GRUPOS_DESK.find((g) => g.id === "visao-geral")!;
    expect(visao.sub.some((s) => "to" in s && s.to === "/marketing")).toBe(true);
    expect(visao.sub.some((s) => "to" in s && s.to === "/leads")).toBe(true);
  });

  it("Checklist é tela própria; o submenu usa o nome aprovado", () => {
    const checklist = GRUPOS_DESK.find((g) => g.id === "checklist")!;
    expect(checklist.label).toBe("Checklist");
    const tarefas = checklist.sub.find((s) => "to" in s && s.to === "/tarefas") as
      | { label: string }
      | undefined;
    expect(tarefas?.label).toContain("Checklist");
  });

  it("LINKS_CONTEXTUAIS referencia os grupos pelos rótulos aprovados (Biblioteca Mestre, Casos 360, Visão Geral)", () => {
    const origens = LINKS_CONTEXTUAIS.map((l) => l.origem);
    expect(origens).not.toContain("Governança");
    expect(origens).not.toContain("Hoje");
    for (const l of LINKS_CONTEXTUAIS) {
      expect(l.tambemEm).not.toContain("Casos");
    }
  });
});

describe("De-para de nomenclatura — cabeçalhos das telas batem com o rótulo aprovado", () => {
  const casos = [
    ["src/routes/_authenticated/painel.tsx", 'titulo="Visão Geral"'],
    ["src/routes/_authenticated/casos.index.tsx", 'titulo="Casos 360"'],
    ["src/routes/_authenticated/tarefas.tsx", 'titulo="Checklist"'],
    ["src/routes/_authenticated/matriz-juridica.tsx", 'titulo="Validação Jurídica"'],
    ["src/routes/_authenticated/qualidade.tsx", 'titulo="Radar Interno"'],
    ["src/routes/_authenticated/alertas.tsx", 'titulo="Alertas"'],
    ["src/routes/_authenticated/biblioteca.tsx", 'titulo="Biblioteca Mestre"'],
  ] as const;
  for (const [arquivo, trecho] of casos) {
    it(`${arquivo} usa o cabeçalho aprovado`, () => {
      expect(readFileSync(arquivo, "utf8")).toContain(trecho);
    });
  }
});

describe("De-para de nomenclatura — App Cliente segue com os 7 nomes aprovados (regressão)", () => {
  it("portal-shell.tsx não usa nomes técnicos do Desk como navegação principal do cliente", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    for (const nomeProibido of ["Hoje", "Comercial", "Pessoas & Famílias", "Marketing", "Configuração"]) {
      expect(shell).not.toContain(`label: "${nomeProibido}"`);
    }
    for (const aprovado of ["/portal/jornada", "/portal/radar", "/portal/arvore", "/portal/documentos", "/portal/legado", "/portal/conta"]) {
      expect(shell).toContain(aprovado);
    }
  });

  it('a primeira aba usa o rótulo aprovado "Home" (mockup de 17 páginas), não "Início"', () => {
    const copy = readFileSync("src/lib/portal-copy.ts", "utf8");
    expect(copy).toMatch(/home:\s*{\s*navegacao:\s*"Home"/);
    const bloco = copy.slice(copy.indexOf("casos: {"), copy.indexOf("casos: {") + 200);
    expect(bloco).toContain('navegacao: "Home"');
  });

  it('não renomeia Conta para "Acesso" nem Jornada para outro nome', () => {
    const copy = readFileSync("src/lib/portal-copy.ts", "utf8");
    expect(copy).not.toMatch(/conta:\s*{\s*navegacao:\s*"Acesso"/);
  });
});
