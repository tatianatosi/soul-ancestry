import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * §11 e §26 do De-Para: a contagem do Hoje tem de ser CLICÁVEL e
 * reconciliada com a lista de origem. Número que não abre nada é painel
 * decorativo.
 *
 * Correção de rumo registrada aqui: no corte anterior marquei
 * "Microentregas para revisão" como "Não registrado" por concluir que o
 * vocabulário não tinha estado de revisão. Estava errado —
 * `/golive/microentregas` já publica "Aguardando revisão" com fonte e
 * fórmula declaradas ("Itens ainda não concluídos"). O número existe; era
 * eu que não tinha achado. Agora sai da mesma função canônica.
 */

const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("toda contagem com regra abre sua origem", () => {
  it("cadências vencidas e casos sem próxima ação abrem /golive", () => {
    // /golive publica exatamente "Vencidas" e "Sem próxima ação" dos
    // mesmos kpis — abrir ali reconcilia, não leva a lista parecida.
    expect(painel).toContain('apoio: "pedem retomada", to: "/golive"');
    expect(painel).toContain('apoio: "precisam de decisão", to: "/golive"');
  });

  it("microentregas abre a fila de microentregas", () => {
    expect(painel).toContain('to: "/golive/microentregas"');
  });

  it("o card vira link quando há destino", () => {
    expect(painel).toContain("k.to ? (");
    expect(painel).toContain("<Link key={k.rotulo} to={k.to}");
  });
});

describe("microentregas para revisão passou a ter número real", () => {
  it("usa a função canônica, não um critério reimplementado", () => {
    expect(painel).toContain('import { concluida } from "@/lib/golive-microentregas"');
    expect(painel).toContain("caso.microentregas.filter((m) => !concluida(m)).length");
  });

  it("não é mais 'Não registrado'", () => {
    expect(painel).toContain("valor: microentregasAguardandoRevisao");
    expect(painel).not.toContain('rotulo: "Microentregas para revisão", valor: null');
  });
});

describe("o que não tem regra continua sem número e sem link", () => {
  it("decisões do dia segue como ausência explícita", () => {
    expect(painel).toContain('rotulo: "Decisões do dia", valor: null');
    expect(painel).toContain('apoio: "sem regra publicada", to: null');
  });

  it("sem regra não há lista para abrir, então não vira link", () => {
    // Linkar para uma lista que não corresponde ao número seria pior que
    // não linkar: daria a impressão de reconciliação que não existe.
    expect(painel).toContain('"Não registrado"');
  });
});
