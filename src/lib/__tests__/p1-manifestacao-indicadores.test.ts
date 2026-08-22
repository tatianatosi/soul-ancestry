import { describe, expect, it } from "vitest";

import { INDICADORES, MANIFESTACAO_INDICADOR } from "@/lib/indicadores-governanca";
import { agruparLinhasIndicadores, deduplicarLinhasIndicadores, type LinhaIndicadorDia } from "@/lib/painel-dia";

describe("P1 — manifestação dos indicadores", () => {
  it("os 16 indicadores têm componente_tipo, severidade e regra de sem dados", () => {
    expect(Object.keys(MANIFESTACAO_INDICADOR).length).toBeGreaterThanOrEqual(INDICADORES.length);
    for (const i of INDICADORES) {
      const m = MANIFESTACAO_INDICADOR[i.codigo];
      expect(m, i.codigo).toBeDefined();
      expect(["card", "fila", "badge", "filtro", "drawer", "detalhe"]).toContain(m!.componente_tipo);
      expect(["P0", "P1", "P2"]).toContain(m!.severidade);
      expect(m!.sem_dados.length).toBeGreaterThan(10);
    }
  });

  it("IND-COM-03 também se manifesta na biblioteca de mensagens", () => {
    expect(MANIFESTACAO_INDICADOR["IND-COM-03"]!.telas).toContain("/biblioteca-mensagens");
  });

  it("deduplica o mesmo registro na maior severidade", () => {
    const base: Omit<LinhaIndicadorDia, "severidade"> = {
      chave: "contratos_enviados_pendentes",
      grupo: "formalizacao",
      codigo: "IND-FIN-02",
      motivo: "contrato sem referência financeira",
      responsavel: null,
      prazo: "bloqueio de formalização",
    };
    const r = deduplicarLinhasIndicadores([
      { ...base, severidade: "P1" },
      { ...base, severidade: "P0" },
      { ...base, severidade: "P2" },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]!.severidade).toBe("P0");
  });

  it("agrupa nos cinco grupos compactos do Painel Hoje", () => {
    const g = agruparLinhasIndicadores([
      { chave: "a", grupo: "integridade", codigo: "IND-RAD-01", motivo: "m", responsavel: null, prazo: "p", severidade: "P1" },
      { chave: "b", grupo: "cliente", codigo: "IND-COM-03", motivo: "m", responsavel: "Tati", prazo: "p", severidade: "P2" },
    ]);
    expect(Object.keys(g)).toEqual(["integridade", "formalizacao", "operacao", "financeiro", "cliente"]);
    expect(g.integridade).toHaveLength(1);
    expect(g.cliente[0]!.responsavel).toBe("Tati");
  });
});
