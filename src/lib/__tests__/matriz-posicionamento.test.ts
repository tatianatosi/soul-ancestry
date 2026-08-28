import { describe, expect, it } from "vitest";

import {
  ELEGIBILIDADE_ORDEM,
  FAIXAS_URGENCIA,
  montarMatriz,
  posicionar,
  semPosicaoConfiavel,
} from "@/lib/matriz-posicionamento";

const base = { tipo: "caso" as const, responsavel: "u1", origem: "real" };
const HOJE = "2026-08-26";

describe("matriz de posicionamento", () => {
  it("prazo vencido cai na faixa vencida", () => {
    const p = posicionar(
      { ...base, id: "a", rotulo: "Ana", elegibilidade: "forte", prazo: "2026-08-01" },
      HOJE,
    );
    expect(p.urgencia).toBe("vencida");
    expect(p.sinal).toBe("critica");
  });

  it("caso sem prazo e sem cadência aparece como sem base, não some", () => {
    // Sumir da matriz seria pior: o caso existe e ninguém saberia dele.
    const p = posicionar({ ...base, id: "b", rotulo: "Bruno", elegibilidade: "provavel" }, HOJE);
    expect(p.urgencia).toBe("sem_base");
    expect(p.pendencias.length).toBeGreaterThan(0);
  });

  it("a posição é a decisão do motor, não um cálculo paralelo", () => {
    // A regra aplicada vem junto, para a matriz poder explicar a posição.
    const p = posicionar(
      { ...base, id: "c", rotulo: "Célia", elegibilidade: "forte", diasSemTouchpoint: 20 },
      HOJE,
    );
    expect(p.regra).toBeTruthy();
    expect(p.porque).toBeTruthy();
    expect(p.sinal).toBe("critica");
  });

  it("elegibilidade não registrada não vira 'forte' por conveniência", () => {
    const p = posicionar({ ...base, id: "d", rotulo: "Davi", prazo: "2026-09-30" }, HOJE);
    expect(p.elegibilidade).toBe("nao_avaliada");
  });

  it("a grade tem uma célula por combinação, e a vazia continua existindo", () => {
    const m = montarMatriz([]);
    expect(m).toHaveLength(FAIXAS_URGENCIA.length);
    for (const linha of m) expect(linha).toHaveLength(ELEGIBILIDADE_ORDEM.length);
    expect(m.flat().every((c) => c.casos.length === 0)).toBe(true);
  });

  it("cada caso entra em exatamente uma célula", () => {
    const casos = [
      posicionar(
        { ...base, id: "a", rotulo: "A", elegibilidade: "forte", prazo: "2026-08-01" },
        HOJE,
      ),
      posicionar({ ...base, id: "b", rotulo: "B", elegibilidade: "baixa" }, HOJE),
      posicionar(
        { ...base, id: "c", rotulo: "C", elegibilidade: "provavel", diasSemTouchpoint: 20 },
        HOJE,
      ),
    ];
    const total = montarMatriz(casos)
      .flat()
      .reduce((t, c) => t + c.casos.length, 0);
    expect(total).toBe(casos.length);
  });

  it("a matriz é lida de cima para baixo, do mais quente ao mais frio", () => {
    const m = montarMatriz([]);
    expect(m[0][0].urgencia).toBe("vencida");
    expect(m[m.length - 1][0].urgencia).toBe("sem_base");
  });

  it("separa quem não tem posição confiável, em vez de fingir posição", () => {
    const casos = [
      posicionar(
        { ...base, id: "a", rotulo: "A", elegibilidade: "forte", prazo: "2026-08-01" },
        HOJE,
      ),
      posicionar({ ...base, id: "b", rotulo: "B", elegibilidade: "provavel" }, HOJE),
    ];
    expect(semPosicaoConfiavel(casos).map((c) => c.id)).toEqual(["b"]);
  });
});
