import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { prioridadeDaCarteira, ritmoSemanal, temRitmo } from "@/lib/golive-operacao";

/**
 * §11 linhas 8, 10 e 11 do De-Para. Nenhuma dessas contas é nova: as três já
 * existiam como função pura consumida pelas telas de /golive. O corte liga o
 * Hoje às mesmas funções, para que os números não possam divergir entre as
 * duas telas.
 */
const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

describe("os três cards vêm da função canônica, não de conta própria", () => {
  it("ritmo, prioridades e funil chamam as funções já existentes", () => {
    expect(painel).toContain("ritmoSemanal(caso.microentregas, 6)");
    expect(painel).toContain("prioridadeDaCarteira(caso.carteira)");
    expect(painel).toContain("kanbanPorEtapa(leads)");
  });

  it("o ritmo é de 6 semanas, como a prancha pede", () => {
    // A função aceita 7 por padrão; a prancha diz S1 a S6.
    // 17/10/2026 — "6 semanas" passou do eyebrow para o próprio título do
    // card ("Ritmo operacional · 6 semanas", mockup desk-01-hoje).
    expect(painel).toContain(", 6)");
    expect(painel).toContain('titulo="Ritmo operacional · 6 semanas"');
  });

  it("cada card diz sua métrica e sua unidade", () => {
    expect(painel).toContain("Microentregas concluídas por semana");
    expect(painel).toContain("Só casos ativos; encerrado não conta");
    expect(painel).toContain("Sem recorte de período: nenhum está definido na fonte");
  });

  it("nenhum card finge série ou período que a fonte não tem", () => {
    // Regra do componente permanente (Proprietária, 13/10/2026): sem
    // microentrega concluída com data, a linha continua desenhada em cinza,
    // rente à base, e o card diz "Sem dados suficientes". temRitmo decide o
    // rótulo; a série nunca recebe ponto inventado. O funil não inventa
    // "últimos 30 dias".
    expect(painel).toContain("const comRitmo = temRitmo(caso.microentregas);");
    expect(painel).toMatch(/comRitmo \? null : \(\s*<p[^>]*data-hoje-ritmo-vazio>\s*Sem dados suficientes/);
    expect(painel).not.toContain("últimos 30 dias");
  });
});

describe("as funções por trás dos cards continuam honrando suas regras", () => {
  it("sem microentrega concluída com data, não há ritmo", () => {
    expect(temRitmo([])).toBe(false);
    expect(temRitmo([{ id: "a", titulo: "x", status: "em_andamento" } as never])).toBe(false);
  });

  it("o ritmo de 6 semanas devolve exatamente 6 baldes", () => {
    expect(ritmoSemanal([], 6)).toHaveLength(6);
  });

  it("caso encerrado não entra na distribuição de prioridades", () => {
    const carteira = [
      { id: "1", prioridade: "critica", status: "ativo" },
      { id: "2", prioridade: "critica", status: "encerrado", ativo: false },
    ] as never[];
    const total = prioridadeDaCarteira(carteira).reduce((s, p) => s + p.valor, 0);
    expect(total).toBeLessThan(carteira.length);
  });
});
