import { describe, expect, it } from "vitest";

import { lerODia, saudacaoDaHora } from "@/lib/painel-abertura";

const as = (h: number) => new Date(2026, 7, 26, h, 0, 0);

describe("abertura do Painel", () => {
  it("saúda pela hora local de quem lê", () => {
    expect(saudacaoDaHora(as(3))).toBe("Boa madrugada");
    expect(saudacaoDaHora(as(9))).toBe("Bom dia");
    expect(saudacaoDaHora(as(15))).toBe("Boa tarde");
    expect(saudacaoDaHora(as(21))).toBe("Boa noite");
  });

  it("põe o vencido na frente, que é a ordem em que a urgência importa", () => {
    const a = lerODia({ vencidos: 3, hoje: 2, semToque: 1, totalCasos: 40 }, as(9));
    expect(a.leitura).toMatch(
      /^Hoje o que pede você: 3 ações vencidas, 2 vencem hoje e 1 sem toque/,
    );
    expect(a.semDados).toBe(false);
  });

  it("concorda o singular", () => {
    const a = lerODia({ vencidos: 1, hoje: 0, semToque: 0, totalCasos: 10 }, as(9));
    expect(a.leitura).toContain("1 ação vencida");
    expect(a.leitura).not.toContain("ações vencidas");
  });

  it("sem nenhuma fonte, diz que não sabe ler o dia", () => {
    const a = lerODia({ vencidos: null, hoje: null, semToque: null, totalCasos: 0 }, as(9));
    expect(a.semDados).toBe(true);
    expect(a.leitura).toMatch(/não consigo ler o dia/);
  });

  it("não dá frase de calmaria quando falta fonte", () => {
    // O perigo era dizer "nada vencido" só porque a fonte não respondeu.
    const a = lerODia({ vencidos: 0, hoje: 0, semToque: null, totalCasos: 40 }, as(9));
    expect(a.semDados).toBe(true);
    expect(a.leitura).toMatch(/nem todas as fontes responderam/);
    expect(a.leitura).not.toMatch(/Nada vencido/);
  });

  it("com as três fontes e nada pendente, aí sim diz que o dia está livre", () => {
    const a = lerODia({ vencidos: 0, hoje: 0, semToque: 0, totalCasos: 40 }, as(9));
    expect(a.semDados).toBe(false);
    expect(a.leitura).toMatch(/Nada vencido e nada vencendo hoje/);
  });

  it("carteira vazia não vira dia livre", () => {
    const a = lerODia({ vencidos: 0, hoje: 0, semToque: 0, totalCasos: 0 }, as(9));
    expect(a.leitura).toMatch(/Nenhum caso ativo/);
  });
});
