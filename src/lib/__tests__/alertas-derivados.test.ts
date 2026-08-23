import { describe, expect, it } from "vitest";
import {
  acaoPermitidaNaAbaAlertas,
  ACOES_PROIBIDAS_NA_ABA_ALERTAS,
  alertasVisiveisParaCliente,
  derivarAlertas,
  destinoDoAlerta,
  filtrarParaFila,
  recalcularApos,
  type EntradaAlertas,
} from "@/lib/alertas-derivados";

const base: EntradaAlertas = {
  casos: [
    {
      id: "caso-1",
      codigo: "CA-2026-ANA-001",
      responsavel_id: "user-1",
      dias_sem_touchpoint: 16,
      classificacao_origem: "real",
      gates_pendentes: ["consentimento"],
    },
  ],
  tarefas: [
    { id: "t-1", titulo: "Revisar dossiê", sla_status: "atrasada", responsavel_id: "user-1", status: "em_andamento" },
  ],
};

describe("alertas derivados", () => {
  it("1. alerta aponta para o objeto canônico", () => {
    const alertas = derivarAlertas(base);
    const cadencia = alertas.find((a) => a.chave === "cadencia:caso-1")!;
    expect(cadencia.origem.entidade).toBe("crm_casos");
    expect(destinoDoAlerta(cadencia)).toBe("/casos/caso-1");
    const tarefa = alertas.find((a) => a.chave === "sla-tarefa:t-1")!;
    expect(destinoDoAlerta(tarefa)).toContain("/tarefas");
  });

  it("2. resolver no registro canônico encerra o alerta", () => {
    expect(recalcularApos(base, "cadencia:caso-1")).toBe("ativo");
    const resolvido: EntradaAlertas = {
      ...base,
      casos: [{ ...base.casos![0]!, dias_sem_touchpoint: 0 }],
    };
    expect(recalcularApos(resolvido, "cadencia:caso-1")).toBe("resolvido");

    const tarefaOk: EntradaAlertas = { ...base, tarefas: [{ ...base.tarefas![0]!, status: "concluida" }] };
    expect(recalcularApos(tarefaOk, "sla-tarefa:t-1")).toBe("resolvido");
  });

  it("3. a aba Alertas não cria prazo, tarefa nem status", () => {
    for (const acao of ACOES_PROIBIDAS_NA_ABA_ALERTAS) {
      expect(acaoPermitidaNaAbaAlertas(acao)).toBe(false);
    }
    expect(acaoPermitidaNaAbaAlertas("abrir_registro_canonico")).toBe(true);
  });

  it("4. D10/D14 não duplicam como dois sinais", () => {
    const dez = derivarAlertas({ casos: [{ id: "c", dias_sem_touchpoint: 10, responsavel_id: "u", classificacao_origem: "real" }] });
    const catorze = derivarAlertas({ casos: [{ id: "c", dias_sem_touchpoint: 14, responsavel_id: "u", classificacao_origem: "real" }] });
    expect(dez.filter((a) => a.chave === "cadencia:c")).toHaveLength(1);
    expect(catorze.filter((a) => a.chave === "cadencia:c")).toHaveLength(1);
    expect(dez[0]!.criticidade).toBe("alta");
    expect(catorze[0]!.criticidade).toBe("critica");
    expect(catorze[0]!.chave).toBe(dez[0]!.chave);
  });

  it("5. um item não aparece duas vezes na mesma fila", () => {
    const alertas = derivarAlertas(base);
    const chaves = alertas.map((a) => a.chave);
    expect(new Set(chaves).size).toBe(chaves.length);

    // Presente no Painel Hoje: sai da fila de Alertas.
    const naFilaAlertas = filtrarParaFila(alertas, "alertas", (chave) =>
      chave === "sla-tarefa:t-1" ? { painel_hoje: true, alertas: true } : { alertas: true },
    );
    expect(naFilaAlertas.some((a) => a.chave === "sla-tarefa:t-1")).toBe(false);
  });

  it("6. nenhum alerta interno chega ao App Cliente", () => {
    expect(alertasVisiveisParaCliente(derivarAlertas(base))).toEqual([]);
  });

  it("classificação não-real projetada vira risco de exposição", () => {
    const alertas = derivarAlertas({
      casos: [{ id: "d", responsavel_id: "u", classificacao_origem: "demo", projetado_ao_cliente: true }],
    });
    expect(alertas.map((a) => a.motivo)).toContain("risco_exposicao_interna");
  });

  it("espera externa ativa suspende o sinal de cadência", () => {
    const alertas = derivarAlertas({
      casos: [{ id: "e", responsavel_id: "u", classificacao_origem: "real", dias_sem_touchpoint: 30, espera_externa_ativa: true }],
    });
    expect(alertas).toHaveLength(0);
  });
});
