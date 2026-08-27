import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("Caso 360 como página única", () => {
  it("não sobrou nenhuma aba independente", () => {
    // O defeito nomeado no documento de fluxo: "abas independentes que
    // disputam a mesma informação".
    expect(pagina).not.toMatch(/aba === "/);
    expect(pagina).not.toMatch(/setAba\(/);
  });

  it("Indicadores e Próxima ação se fundiram — decisão da Proprietária, não regressão", () => {
    // 27/08/2026 — a página única resolveu "abas que disputam a mesma
    // informação", mas por dentro cada seção continuava sendo o componente
    // isolado de antes, só empilhado. A Proprietária pediu o passo seguinte:
    // separar indicador de contexto e reduzir quantas seções existem, uma de
    // cada vez, sem apagar campo nenhum — só mudar onde cada coisa mora.
    // "acao" (Próxima ação e alertas) foi a primeira a se fundir: é sinal,
    // não formulário, e agora vive dentro de "visao" junto com o sinal de
    // prioridade.
    const secoes = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(secoes).toHaveLength(12);
    expect(secoes, "acao deveria ter se fundido em visao, não sumido nem sobrado solto").not.toContain("acao");
    for (const s of [
      "visao",
      "caso",
      "pessoas",
      "cadastro",
      "produto",
      "etiquetas",
      "onboarding",
      "fechamento",
      "jornada",
      "comercial",
      "tecnico",
      "log",
    ]) {
      expect(secoes, `seção "${s}" sumiu`).toContain(s);
    }
  });

  it("AbaProximaAcao continua renderizada — fundir seção não é apagar funcionalidade", () => {
    expect(pagina).toContain("<AbaProximaAcao");
  });

  it("o índice segue a mesma ordem em que a página rola", () => {
    // Índice numa ordem e DOM em outra confunde quem rola.
    const doIndice = [...pagina.matchAll(/\{ id: "(\w+)", rotulo:/g)].map((m) => m[1]);
    const doDom = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(doIndice).toEqual(doDom);
  });

  it("cada seção tem âncora alcançável pelo índice", () => {
    const ids = [...pagina.matchAll(/<SecaoAncora id="(\w+)"/g)].map((m) => m[1]);
    expect(pagina).toContain("href={`#secao-${a.id}`}");
    expect(pagina).toContain("id={`secao-${id}`}");
    expect(ids.length).toBeGreaterThan(0);
  });
});
