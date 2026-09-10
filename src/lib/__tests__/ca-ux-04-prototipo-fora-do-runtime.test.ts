import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * CA-UX-04 — arquivamento do protótipo, revisto em 05/09/2026.
 *
 * A regra original tirava o mockup inteiro de `src/` e um teste impedia que
 * voltasse. Na pratica isso impedia a propria proprietaria de consultar o
 * layout que ela aprovou, enquanto o produto no ar divergia dele.
 *
 * Decisao da Proprietaria Administradora em 05/09/2026: a rota `/mockup`
 * volta como REFERENCIA VISUAL, isolada e sem dados operacionais. O que
 * continua proibido e o protótipo antigo (`desk-app`, `cliente-app`,
 * `/prototipo`) e qualquer import do mockup por tela de produto.
 */

function arquivosDeRuntime(dir = "src"): string[] {
  const saida: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === "__tests__" || nome === "integrations") continue;
      saida.push(...arquivosDeRuntime(caminho));
    } else if (/\.(ts|tsx)$/.test(nome) && nome !== "routeTree.gen.ts") {
      saida.push(caminho);
    }
  }
  return saida;
}

const RUNTIME = arquivosDeRuntime();

describe("arquivamento do protótipo", () => {
  it("removeu componentes e rotas de mockup de src/", () => {
    for (const caminho of [
      "src/components/desk-app.tsx",
      "src/components/cliente-app.tsx",
      "src/routes/prototipo.tsx",
      "src/routes/_authenticated/referencia-mockup-desk.tsx",
    ]) {
      expect(existsSync(caminho)).toBe(false);
    }
  });

  it("preservou o histórico em archive/mockups/", () => {
    for (const caminho of [
      "archive/mockups/componentes/desk-app.tsx",
      "archive/mockups/componentes/cliente-app.tsx",
      "archive/mockups/componentes/mockup/desk-mockup.tsx",
      "archive/mockups/rotas/prototipo.tsx",
      "archive/mockups/rotas/mockup.tsx",
      "archive/mockups/rotas/referencia-mockup-desk.tsx",
      "docs/historico/mockups/README.md",
    ]) {
      expect(existsSync(caminho)).toBe(true);
    }
  });
});

describe("import graph do runtime", () => {
  const IMPORTS_PROIBIDOS = [
    "@/components/desk-app",
    "@/components/cliente-app",
    "archive/mockups",
    "./cliente-app",
    "./desk-app",
  ];

  it("nenhum arquivo de src/ importa o protótipo", () => {
    for (const arquivo of RUNTIME) {
      // A rota de referencia /mockup pode importar os componentes de mockup.
      if (arquivo === "src/routes/mockup.tsx" || arquivo.startsWith("src/components/mockup/")) continue;
      const conteudo = readFileSync(arquivo, "utf8");
      for (const proibido of IMPORTS_PROIBIDOS) {
        expect(`${arquivo}:${conteudo.includes(proibido)}`).toBe(`${arquivo}:false`);
      }
    }
  });

  it("nenhuma rota /prototipo ou /referencia-mockup-desk é declarada", () => {
    for (const arquivo of RUNTIME) {
      const conteudo = readFileSync(arquivo, "utf8");
      for (const rota of [
        'createFileRoute("/prototipo")',
        "referencia-mockup-desk",
      ]) {
        if (arquivo.endsWith("descoberta-desk.ts")) continue; // apenas comentário histórico
        expect(`${arquivo}:${conteudo.includes(rota)}`).toBe(`${arquivo}:false`);
      }
    }
  });
});

describe("vitrine pública e navegação", () => {
  const home = readFileSync("src/routes/index.tsx", "utf8");
  const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");

  it("a home anônima não expõe rótulos ou controles internos", () => {
    for (const proibido of [
      "MÓDULOS INTERNOS",
      "Módulos internos",
      "Devolutivas (interno)",
      "VISUALIZAR (INTERNO)",
      "AppSwitcher",
      "DeskApp",
      "ClienteApp",
      "Demonstração / dados não operacionais",
    ]) {
      expect(home).not.toContain(proibido);
    }
  });

  it("o menu do Desk não cita mockup nem protótipo", () => {
    for (const proibido of ["mockup", "Mockup", "protótipo", "Protótipo"]) {
      expect(navegacao).not.toContain(proibido);
    }
  });
});
