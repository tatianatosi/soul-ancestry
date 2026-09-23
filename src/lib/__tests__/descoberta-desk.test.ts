import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

import {
  ATALHOS_DESCOBERTA,
  ROTULOS_HUMANOS,
  ROTULO_PRIORIDADE,
  rotuloHumano,
} from "@/lib/descoberta-desk";
import { ORDEM_BLOCOS_PAINEL, validarOrdemPainel } from "@/lib/painel-ordem";

const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
// A navegação passou a viver no registro canônico CA-UX-03.
const navegacao = readFileSync("src/lib/navegacao-desk.ts", "utf8");
const painel = readFileSync("src/components/painel/painel-dia.tsx", "utf8");

describe("nomenclatura humana", () => {
  it("mapeia rotas técnicas para rótulos humanos sem mudar a URL", () => {
    expect(rotuloHumano("/qualidade")).toBe("Radar & Matrizes");
    expect(rotuloHumano("/matriz-juridica")).toBe("Validação Jurídica");
    expect(ROTULO_PRIORIDADE).toBe("Prioridade dos casos");
    expect(Object.keys(ROTULOS_HUMANOS).every((r) => r.startsWith("/"))).toBe(true);
  });

  it("exibe os rótulos na navegação do Desk real", () => {
    expect(navegacao).toContain('{ to: "/qualidade", label: "Radar & Matrizes" }');
    expect(navegacao).toContain('{ to: "/matriz-juridica", label: "Validação Jurídica" }');
  });

  it("mantém os cabeçalhos das telas alinhados ao rótulo humano", () => {
    expect(readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8")).toContain(
      'titulo="Radar & Matrizes"',
    );
    expect(readFileSync("src/routes/_authenticated/matriz-juridica.tsx", "utf8")).toContain(
      'titulo="Validação Jurídica"',
    );
  });
});

describe("atalhos de descoberta", () => {
  const rotasExistentes = new Set([
    "/qualidade",
    "/matriz-juridica",
    "/casos",
    "/pesquisa-modulo",
    "/integracoes",
    "/acessos-portal",
  ]);

  it("aponta apenas para rotas existentes, sem duplicar", () => {
    const rotas = ATALHOS_DESCOBERTA.map((a) => a.rota);
    expect(new Set(rotas).size).toBe(rotas.length);
    for (const r of rotas) expect(rotasExistentes.has(r)).toBe(true);
  });

  it("cobre exatamente os seis módulos operacionais, sem referência histórica", () => {
    expect(ATALHOS_DESCOBERTA).toHaveLength(6);
    expect(ATALHOS_DESCOBERTA.some((a) => a.rotulo.toLowerCase().includes("mockup"))).toBe(false);
  });

  it("é descoberta pura: nenhum atalho carrega ação, mutação ou status", () => {
    for (const a of ATALHOS_DESCOBERTA) {
      expect(Object.keys(a).sort()).toEqual(["onde", "rota", "rotulo"]);
    }
    expect(painel).toContain('data-painel-bloco="descoberta"');
    expect(painel).not.toContain("ATALHOS_DESCOBERTA.map((a) => a.acao");
  });

  it("o atalho aponta para a aba dona da função, não para o nome antigo do grupo", () => {
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/qualidade")?.onde).toBe("Pessoas & Casos");
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/matriz-juridica")?.onde).toBe(
      "Inteligência & Pesquisa",
    );
    expect(ATALHOS_DESCOBERTA.find((a) => a.rota === "/integracoes")?.onde).toBe(
      "Governança & Administração",
    );
    expect(painel).toContain('to: "/calls"');
    expect(painel).toContain("Mesa de Discovery");
  });

  it("mantém o bloco no fim da ordem canônica, sem quebrar exceções → sinais", () => {
    const chaves = ORDEM_BLOCOS_PAINEL.map((b) => b.chave);
    expect(chaves[chaves.length - 1]).toBe("descoberta");
    expect(validarOrdemPainel(chaves)).toEqual([]);
  });
});

describe("superfícies preservadas", () => {
  it("mantém os 6 grupos na navegação do Desk", () => {
    const grupos = [
      "Hoje",
      "Marketing & Comercial",
      "Pessoas & Casos",
      "Inteligência & Pesquisa",
      "Formalização & Financeiro",
      "Governança & Administração",
    ];
    for (const g of grupos) expect(navegacao).toContain(`label: "${g}"`);
    expect(shell).toContain("GRUPOS_DESK");
  });

  it("o protótipo antigo saiu do runtime; o mockup aprovado volta como referência (CA-UX-04, revisto 05/09/2026)", () => {
    expect(existsSync("src/components/desk-app.tsx")).toBe(false);
    expect(existsSync("src/components/cliente-app.tsx")).toBe(false);
    expect(existsSync("src/routes/prototipo.tsx")).toBe(false);
    expect(existsSync("src/routes/_authenticated/referencia-mockup-desk.tsx")).toBe(false);
    // Rota de referencia visual do mockup aprovado, isolada e sem dados.
    // Corte D (09/09/2026): movida para dentro de _authenticated — a rota
    // vivia fora de qualquer guard e era alcançável por visitante sem login.
    expect(existsSync("src/routes/_authenticated/mockup.tsx")).toBe(false);
    expect(existsSync("archive/mockups/rotas/mockup-authenticated.tsx")).toBe(true);
    expect(existsSync("archive/mockups/componentes/desk-app.tsx")).toBe(true);
    expect(existsSync("archive/mockups/rotas/prototipo.tsx")).toBe(true);
  });

  it("a rota / é vitrine institucional limpa, sem mockup nem rótulos internos", () => {
    const raiz = readFileSync("src/routes/index.tsx", "utf8");
    for (const proibido of [
      "referencia-mockup-desk",
      "DeskApp",
      "ClienteApp",
      "AppSwitcher",
      "Módulos internos",
    ]) {
      expect(raiz).not.toContain(proibido);
    }
  });

  it("nenhum registro de navegação cita o protótipo antigo de 14 abas", () => {
    expect(navegacao).not.toContain("protótipo");
    expect(navegacao).not.toContain("Protótipo");
    expect(navegacao).not.toContain("14 abas");
  });
});
