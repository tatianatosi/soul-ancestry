import { describe, expect, it } from "vitest";

import {
  aplicarSinal,
  calcularPrioridade,
  etiquetaParaFila,
  excecoesDaMatriz,
  filtrarPorOrigem,
  geraAlerta,
  origemVisivel,
  prioridadeVisivelParaCliente,
  EFEITOS_COLATERAIS_AUTORIZADOS,
} from "@/lib/prioridade-matriz";

const HOJE = "2026-08-23";

/** Dado FICTÍCIO marcado — não corresponde a caso real do ambiente. */
const casoFicticio = {
  tipo: "caso" as const,
  id: "ficticio-1",
  elegibilidade: "provavel",
  prazo: "2026-08-20",
  diasSemTouchpoint: 3,
  bloqueios: [],
  responsavel: "Tatiana Tosi",
  origem: "real",
};

describe("matriz elegibilidade × urgência", () => {
  it("1. prioridade é explicável pelos fatores mostrados", () => {
    const r = calcularPrioridade(casoFicticio, HOJE);
    expect(r.sinal).toBe("critica");
    expect(r.regra).toBe("R1_urgencia_vencida");
    expect(r.explicacao).toContain("2026-08-20");
    expect(r.fatores.map((f) => f.codigo)).toEqual([
      "elegibilidade",
      "prazo",
      "urgencia",
      "sla",
      "bloqueios",
      "responsavel",
      "origem",
    ]);
  });

  it("2. dados insuficientes não recebem score inventado", () => {
    const r = calcularPrioridade({ tipo: "caso", id: "ficticio-2", responsavel: "Tati" }, HOJE);
    expect(r.sinal).toBe("sem_dados");
    expect(r).not.toHaveProperty("score");
    expect(r.faltantes.join(" ")).toContain("hipótese de elegibilidade");
  });

  it("3. a matriz não altera o status de um caso", () => {
    const registro = { id: "ficticio-1", status: "em_andamento", ativo: false };
    const r = calcularPrioridade(casoFicticio, HOJE);
    expect(aplicarSinal(registro, r)).toEqual({
      id: "ficticio-1",
      status: "em_andamento",
      ativo: false,
    });
    expect(EFEITOS_COLATERAIS_AUTORIZADOS).toEqual([]);
  });

  it("4. um item não duplica entre Painel Hoje, Checklist e Alertas", () => {
    const r = calcularPrioridade(casoFicticio, HOJE);
    const jaExibidos = new Set(["caso:ficticio-1"]);
    expect(etiquetaParaFila(r, jaExibidos)?.texto).toBe("Prioridade crítica");
    // já exibido no Painel Hoje ⇒ não vira linha nova em outra fila
    expect(excecoesDaMatriz([r], jaExibidos)).toEqual([]);
    // sem exceção definida, prioridade crítica sozinha não vira alerta
    expect(geraAlerta(r)).toBe(false);
    // fora da fila não há etiqueta duplicada
    expect(etiquetaParaFila(r, new Set())).toBeNull();
  });

  it("5. demo não aparece sem filtro", () => {
    const demo = calcularPrioridade({ ...casoFicticio, id: "ficticio-demo", origem: "demo" }, HOJE);
    expect(filtrarPorOrigem([demo])).toEqual([]);
    expect(filtrarPorOrigem([demo], { incluirDemo: true })).toHaveLength(1);
  });

  it("6. campos internos não vazam ao App Cliente", () => {
    const r = calcularPrioridade(casoFicticio, HOJE);
    expect(prioridadeVisivelParaCliente(r)).toBeNull();
    expect(origemVisivel(r, false)).toBeNull();
    expect(origemVisivel(r, true)).toBe("real");
  });

  it("7. ausência de responsável é tratada como exceção, sem atribuição automática", () => {
    const r = calcularPrioridade({ ...casoFicticio, responsavel: null }, HOJE);
    expect(r.excecoes[0]).toContain("Sem responsável");
    expect(geraAlerta(r)).toBe(true);
    expect(r.fatores.find((f) => f.codigo === "responsavel")?.valor).toBeNull();
    expect(excecoesDaMatriz([r], new Set())).toHaveLength(1);
  });

  it("cadência D10/D14 e janela de 7 dias seguem a regra declarada", () => {
    const d10 = calcularPrioridade(
      { tipo: "caso", id: "f3", diasSemTouchpoint: 10, responsavel: "T" },
      HOJE,
    );
    expect([d10.sinal, d10.regra]).toEqual(["atencao", "R3_janela_proxima"]);
    const d14 = calcularPrioridade(
      { tipo: "caso", id: "f4", diasSemTouchpoint: 14, responsavel: "T" },
      HOJE,
    );
    expect([d14.sinal, d14.regra]).toEqual(["critica", "R1_urgencia_vencida"]);
    const espera = calcularPrioridade(
      {
        tipo: "caso",
        id: "f5",
        diasSemTouchpoint: 20,
        esperaExternaAtiva: true,
        responsavel: "T",
        prazo: "2026-12-01",
      },
      HOJE,
    );
    expect(espera.sinal).toBe("acompanhada");
  });
});
