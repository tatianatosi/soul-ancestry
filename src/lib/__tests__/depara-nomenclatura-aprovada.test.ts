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

describe("De-para de nomenclatura — face 7 + 6 grupos internos", () => {
  it("expõe os 6 grupos, com rotas de entrada já existentes", () => {
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.to)).toEqual([
      "/painel",
      "/calls",
      "/casos",
      "/biblioteca",
      "/contratos",
      "/configuracoes",
    ]);
  });

  it("usa os rótulos dos 6 grupos internos (decisão 2026-09-11)", () => {
    expect(GRUPOS_DESK.map((g) => g.label)).toEqual([
      "Hoje",
      "Comercial",
      "Casos & Pessoas",
      "Pesquisa",
      "Formalização",
      "Governança",
    ]);
  });

  it("Marketing e CRM Vivo moram no grupo comercial, sem segunda face", () => {
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial")!;
    expect(comercial.sub.some((s) => "to" in s && s.to === "/marketing")).toBe(true);
    expect(comercial.sub.some((s) => "to" in s && s.to === "/leads")).toBe(true);
  });

  it("Checklist continua no submenu de Casos & Pessoas, com o nome aprovado", () => {
    const casos = GRUPOS_DESK.find((g) => g.id === "casos")!;
    const tarefas = casos.sub.find((s) => "to" in s && s.to === "/tarefas") as
      | { label: string }
      | undefined;
    expect(tarefas?.label).toContain("Checklist");
  });

  it("sem links contextuais sobrepostos entre grupos", () => {
    expect(LINKS_CONTEXTUAIS).toEqual([]);
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
