import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * D1 — a faixa de indicadores do Hoje na composição da prancha aprovada
 * (01-hoje.tsx do kit v4 · §11 do De-Para).
 *
 * O ponto deste corte não é "ter quatro números". É que dois dos quatro
 * indicadores do mockup NÃO têm regra publicada no modelo de dados, e a
 * regra da casa manda tornar a ausência explícita em vez de preencher por
 * dedução. Então dois saem da fonte real e dois dizem "Não registrado".
 *
 * Este teste existe para impedir as duas regressões opostas: alguém
 * inventar número para os que não têm regra, e alguém trocar os que têm
 * regra por texto genérico.
 */

const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("Hoje traz os quatro indicadores da prancha", () => {
  it("os quatro rótulos do kit estão na tela", () => {
    expect(painel).toContain('rotulo: "Decisões do dia"');
    expect(painel).toContain('rotulo: "Cadências vencidas"');
    expect(painel).toContain('rotulo: "Casos sem próxima ação"');
    expect(painel).toContain('rotulo: "Microentregas para revisão"');
  });

  it("a faixa é identificável na página", () => {
    expect(painel).toContain("data-hoje-indicadores");
  });
});

describe("número só onde existe regra", () => {
  it("cadências vencidas e casos sem próxima ação vêm da fonte real", () => {
    expect(painel).toContain("valor: hoje.vencidas");
    expect(painel).toContain("valor: hoje.semProxima");
  });

  it("os dois sem regra publicada não recebem número inventado", () => {
    expect(painel).toContain('rotulo: "Decisões do dia", valor: null');
    expect(painel).toContain('rotulo: "Microentregas para revisão", valor: null');
  });

  it("ausência aparece como texto explícito, não como zero", () => {
    // Zero seria mentira: diria "não há decisões hoje" quando o certo é
    // "não existe regra que defina isso".
    expect(painel).toContain('"Não registrado"');
  });

  it("cada ausência diz o motivo", () => {
    expect(painel).toContain("sem regra publicada");
    expect(painel).toContain("sem estado de revisão no modelo");
  });
});

describe("a fonte dos números que existem não foi trocada", () => {
  it("continua usando kpisHoje sobre carteira e tarefas reais", () => {
    expect(painel).toContain("kpisHoje(caso.carteira, caso.tarefas)");
  });

  it("os indicadores por frente seguem de pé", () => {
    expect(painel).toContain("Indicadores por frente");
    expect(painel).toContain("<CaCard");
  });
});
