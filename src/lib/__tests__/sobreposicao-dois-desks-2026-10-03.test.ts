import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";

/**
 * Sobreposição medida: existem DOIS Desks (03/10/2026).
 *
 * A Proprietária: "tem tanta sobreposição que já nem sei o que é real e
 * verdadeiro de tão confuso" e "não consegui nem encontrar a ficha única...
 * ou você está colocando no golive".
 *
 * A medição explica os dois. Não é opinião:
 *
 * | | Desk do menu (GRUPOS_DESK) | Desk paralelo /golive |
 * |---|---|---|
 * | porta de entrada | "Acesso da equipe" → login → 6 grupos | botão "Nova tela do Desk", na **home pública** |
 * | shell | SaasShell | GoLiveShell, com nav própria |
 * | Pessoa 360 | /pessoas/$clienteId | /golive/pessoa (outra) |
 * | Caso 360 | /casos/$caseId | /golive/caso (outra) |
 * | Ficha Única | **sim**, Caso 360 › Pesquisa | **não existe** |
 *
 * E o Painel Hoje do Desk do menu manda o usuário para dentro do paralelo.
 *
 * Este teste não decide qual é o canônico — isso é decisão da Proprietária,
 * e é a mesma família da dívida já declarada no AGENTS.md
 * (`painel-dia.tsx` × `/painel`). Ele **congela o tamanho** da sobreposição:
 * se alguém acrescentar tela ao Desk paralelo, ou mais links do Desk do menu
 * para dentro dele, o teste falha e a dívida reaparece em vez de crescer em
 * silêncio.
 */

const ROTAS = readdirSync("src/routes/_authenticated").filter((f) => f.endsWith(".tsx"));
const shellGoLive = readFileSync("src/components/golive/shell.tsx", "utf8");
const home = readFileSync("src/routes/index.tsx", "utf8");
const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("o tamanho da sobreposição, medido e congelado", () => {
  it("o Desk paralelo tem 19 rotas — e não pode crescer sem decisão", () => {
    const golive = ROTAS.filter((f) => f.startsWith("golive"));
    expect(golive.length).toBe(19);
  });

  it("o Desk paralelo tem nav própria de 19 telas", () => {
    const abas = shellGoLive.match(/\{ to: "\/golive/g) ?? [];
    expect(abas.length).toBe(19);
  });

  it("o Desk do menu continua com 6 grupos — o paralelo nunca virou o 7º", () => {
    expect(GRUPOS_DESK.length).toBe(8); // 18/10/2026: 7 V4 + Financeiro
    const rotasDoMenu = JSON.stringify(GRUPOS_DESK);
    expect(rotasDoMenu).not.toMatch(/"\/golive/);
  });

  it("a home pública ainda abre o Desk paralelo — porta declarada, não escondida", () => {
    expect(home).toMatch(/to="\/golive"/);
    expect(home).toMatch(/Nova tela do Desk/);
  });

  it("o Painel Hoje manda para dentro do paralelo em 7 pontos", () => {
    const links = painel.match(/"\/golive[^"]*"/g) ?? [];
    expect(links.length).toBe(7);
  });
});

describe("o que cada Desk tem, para a diferença parar de ser invisível", () => {
  it("a Ficha Única só existe no Desk do menu, dentro de Caso 360", () => {
    const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(caso360).toMatch(/PainelFichaUnica/);
    const golive = ROTAS.filter((f) => f.startsWith("golive"));
    for (const f of golive) {
      expect(readFileSync(`src/routes/_authenticated/${f}`, "utf8"), f).not.toMatch(/PainelFichaUnica/);
    }
  });

  it("os painéis publicados nesta rodada moram no Desk do menu, não no paralelo", () => {
    const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    for (const painelNovo of ["CalculadoraOrcamento", "PublicarAssinaturaApp", "OverrideComercial"]) {
      expect(caso360, painelNovo).toContain(painelNovo);
    }
    expect(readFileSync("src/routes/_authenticated/catalogo.tsx", "utf8")).toMatch(/DeParaSkuProdutoPai/);
    expect(readFileSync("src/routes/_authenticated/fontes-genealogicas.tsx", "utf8")).toMatch(/MarcosJuridicosPorPais/);
  });
});
