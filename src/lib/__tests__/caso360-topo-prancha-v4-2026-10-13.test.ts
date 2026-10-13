import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * 13/10/2026 — Proprietária: Caso 360 na composição da Prancha V4 —
 * identidade do caso no topo, participantes, linha do tempo e estado real
 * do dossiê; "pendência informa, não impede".
 */
const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

describe("Caso 360 — topo da Prancha V4", () => {
  it("identidade vem primeiro, depois a grade de cartões, depois o hero de próxima ação", () => {
    const identidade = pagina.indexOf("data-caso360-identidade");
    const grade = pagina.indexOf("data-caso360-resumo-v4");
    const hero = pagina.indexOf("<CaseHealthHero");
    expect(identidade).toBeGreaterThan(-1);
    expect(grade).toBeGreaterThan(identidade);
    expect(hero).toBeGreaterThan(grade);
  });

  it("a identidade lê o caso real e mantém o chip de identidade canônico", () => {
    const trecho = pagina.slice(pagina.indexOf("data-caso360-identidade"), pagina.indexOf("data-caso360-resumo-v4"));
    expect(trecho).toContain('caso["titulo"]');
    expect(trecho).toContain('caso["codigo"]');
    expect(trecho).toContain("data-ordem2-identidade-desk");
    expect(trecho).toContain("<ChipIdentidadeCaso");
  });

  it("pendência aparece como etiqueta informativa, sem desabilitar nada", () => {
    const inicio = pagina.indexOf("data-caso360-pendencia-informativa");
    const trecho = pagina.slice(inicio - 400, inicio + 400);
    expect(trecho).toContain("informa, não impede");
    expect(trecho).not.toContain("disabled");
  });

  /*
   * Especificação canônica: docs/arquitetura/2026-10-13-reparacao-caso-360-padrao-golive-4-lotes.md.
   * Os 4 lotes organizam a Visão geral; as 8 SECOES seguem sendo a navegação.
   */
  it("a Visão geral segue os 4 lotes A–D, na ordem, sem mexer nas 8 seções", () => {
    const posicoes = ["A", "B", "C", "D"].map((l) => pagina.indexOf(`data-caso360-lote="${l}"`));
    for (const p of posicoes) expect(p).toBeGreaterThan(-1);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
    expect(pagina).toContain("Lote A · Entrada e caso");
    expect(pagina).toContain("Jornada D0–D365");
    expect(pagina).toContain("data-caso360-origem");
    for (const marca of ["data-caso360-formalizacao", "data-caso360-condicao", "data-caso360-prontidao-app", "data-caso360-acervo"]) {
      expect(pagina).toContain(marca);
    }
    const secoes = pagina.slice(pagina.indexOf("const SECOES = ["), pagina.indexOf("] as const;", pagina.indexOf("const SECOES = [")));
    expect(secoes.match(/\{ id: "/g)).toHaveLength(8);
  });

  it("a grade não traz dado de demonstração em memória", () => {
    const trecho = pagina.slice(pagina.indexOf("grade de cartões da Visão geral"), pagina.indexOf("Abrir requisitos de ativação"));
    for (const proibido of ["Bianchi", "Dados demonstrativos", "cases.ts", "valor: 64"]) {
      expect(trecho).not.toContain(proibido);
    }
    expect(trecho).toContain("q.data?.membros");
    expect(trecho).toContain("q.data?.timeline");
    expect(trecho).toContain("estadoDossieDoCaso");
  });
});
