import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * D1 — a faixa de indicadores do Hoje na composição da prancha aprovada
 * (01-hoje.tsx do kit v4 · §11 do De-Para).
 *
 * O ponto deste corte não é "ter quatro números". É que dois dos quatro
 * indicadores do mockup NÃO têm regra publicada no modelo de dados, e a
 * regra da casa manda tornar a ausência explícita em vez de preencher por
 * dedução. Os quatro têm fonte canônica desde 21/09/2026: cadências e
 * casos sem próxima ação vêm de `kpisHoje`, microentregas de `concluida`,
 * e decisões do dia de `filaDeAprovacoes`. Nenhum é "Não registrado".
 *
 * Este teste existe para impedir as duas regressões opostas: alguém
 * inventar número para os que não têm regra, e alguém trocar os que têm
 * regra por texto genérico.
 */

const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("Hoje traz os quatro indicadores da prancha", () => {
  it("os quatro rótulos do kit estão na tela", () => {
    expect(painel).toContain('rotulo: "Casos ativos"');
    expect(painel).toContain('rotulo: "Prazos imutáveis"');
    expect(painel).toContain('rotulo: "Alertas"');
    expect(painel).toContain('rotulo: "Microentregas"');
  });

  it("a faixa é identificável na página", () => {
    expect(painel).toContain("data-hoje-indicadores");
  });
});

describe("número só onde existe regra", () => {
  it("cadências vencidas e casos sem próxima ação vêm da fonte real", () => {
    expect(painel).toContain("valor: prazosImutaveis");
    expect(painel).toContain("valor: alertasPrioritarios");
  });

  it("todos os quatro têm número, nenhum inventado", () => {
    /*
      21/09/2026 — este teste já travou DOIS ausentes que eu havia declarado
      sem regra, e os dois estavam errados. Primeiro "Microentregas para
      revisão": /golive/microentregas já publicava a conta. Agora "Decisões
      do dia": `filaDeAprovacoes` já classificava o que pede decisão, e
      /golive/aprovacoes já a usava. Em ambos, a regra existia e era eu que
      não tinha procurado o suficiente.

      A trava muda de alvo, não de propósito: nenhum dos quatro pode ganhar
      número que não venha de uma função canônica já consumida por outra
      tela.
    */
    expect(painel).not.toContain("valor: null");
    expect(painel).toContain("valor: casosAtivos");
    expect(painel).toContain("valor: microentregasAguardandoRevisao");
  });

  it("microentregas para revisão tem número real, da função canônica", () => {
    expect(painel).toContain("valor: microentregasAguardandoRevisao");
    expect(painel).toContain('import { concluida } from "@/lib/golive-microentregas"');
  });

  it("decisões do dia tem número real, da mesma função de /golive/aprovacoes", () => {
    expect(painel).toContain('from "@/lib/golive-aprovacoes"');
    expect(painel).toContain("resumoAprovacoes(filaDecisoes).pendentes");
  });

  it("o ramo de ausência saiu com o último ausente", () => {
    // Enquanto havia KPI sem regra, "Não registrado" era o texto honesto.
    // Com os quatro numerados, virou ramo morto — e ramo morto num painel é
    // convite a voltar a exibir ausência onde já existe número.
    // Precisão importa: o texto ainda aparece nos comentários que contam a
    // história. O que não pode voltar é o RAMO que o renderiza.
    expect(painel).not.toContain('k.valor === null ? "Não registrado"');
    expect(painel).not.toContain("k.valor === null");
    expect(painel).toContain('<dd className="font-serif text-2xl text-navy">{k.valor}</dd>');
  });

  it("os quatro abrem a lista que os reconcilia", () => {
    // §11 linha 2: contagem clicável e reconciliada. Nenhum dos quatro pode
    // ser um número que não abre nada.
    expect(painel).toContain('to: "/golive/microentregas"');
    expect(painel).toContain('to: "/golive"');
  });
});

describe("a fonte dos números que existem não foi trocada", () => {
  it("continua usando kpisHoje sobre carteira e tarefas reais", () => {
    expect(painel).toContain("caso.proximasAcoesPrioritarias");
  });

  it("os indicadores por frente seguem de pé", () => {
    // v4: o título "Indicadores por frente" deu lugar à navegação dos módulos; a seção e as fontes seguem.
    expect(painel).toContain('aria-labelledby="painel-consolidado-titulo"');
    expect(painel).toContain("<CaCard");
  });
});
