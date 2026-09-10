import { describe, expect, it } from "vitest";

import { obterProximaAcaoCanonica, SELO_PROXIMA_ACAO } from "@/lib/caso-ficha";

/*
 * Corte A (09/09/2026) — a RPC proxima_acao_prioritaria já garante, por
 * construção, que sinal automático real (níveis 1-6) nunca fica escondido
 * atrás do override manual (nível 8): ela só chega ao nível 8 se nenhum dos
 * níveis anteriores encontrar nada. Esta função só empacota o resultado da
 * RPC num formato único, com selo de origem.
 */
describe("obterProximaAcaoCanonica", () => {
  it("1. ação automática (nível < 8) é a canônica, sem depender de override manual", () => {
    const c = obterProximaAcaoCanonica({
      caseId: "caso-1",
      rpc: { nivel: 2, motivo: "Tarefa vencida: enviar checklist", origem_tabela: "tarefas", origem_id: "t1", prazo: "2026-09-01" },
    });
    expect(c.origem).toBe("automatica");
    expect(c.acao).toBe("Tarefa vencida: enviar checklist");
    expect(c.podeVoltarAoAutomatico).toBe(false);
    expect(SELO_PROXIMA_ACAO[c.origem]).toBe("Sugerida pela operação");
  });

  it("2. override manual (nível 8) vence só quando não há sinal automático mais urgente, e pode ser revertido", () => {
    const c = obterProximaAcaoCanonica({
      caseId: "caso-1",
      rpc: { nivel: 8, motivo: "solicitar_dados_cadastrais", origem_tabela: "crm_casos", origem_id: "caso-1", prazo: "2026-09-10" },
      responsavelPrincipal: "Tatiana",
    });
    expect(c.origem).toBe("manual");
    expect(c.podeVoltarAoAutomatico).toBe(true);
    expect(c.responsavel).toBe("Tatiana");
    expect(SELO_PROXIMA_ACAO[c.origem]).toBe("Definida manualmente");
  });

  it("nível 1 (bloqueio de ativação) é P0 real — nunca é tratado como manual, mesmo com override presente", () => {
    const c = obterProximaAcaoCanonica({
      caseId: "caso-1",
      rpc: { nivel: 1, motivo: "Núcleo familiar não conferido", origem_tabela: "case_ativacao_bloqueios_reais", origem_id: null, prazo: null },
    });
    expect(c.origem).toBe("automatica");
    expect(c.prioridade).toBe(1);
  });

  it("sem nenhum resultado de RPC, cai no fallback seguro (nunca lança erro nem fica em branco)", () => {
    const c = obterProximaAcaoCanonica({ caseId: "caso-1", rpc: null });
    expect(c.acao).toBe("Definir próximo passo");
    expect(c.origem).toBe("automatica");
  });

  /*
   * Decisão 2 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — dependência e
   * critério de conclusão são metadados da mesma ação canônica, não um
   * bloco paralelo exclusivo da Lista de Casos.
   */
  it("dependência e critério de conclusão chegam como metadados da mesma ação, não como bloco à parte", () => {
    const c = obterProximaAcaoCanonica({
      caseId: "caso-1",
      rpc: { nivel: 8, motivo: "solicitar_dados_cadastrais", origem_tabela: "crm_casos", origem_id: "caso-1", prazo: "2026-09-10" },
      responsavelPrincipal: "Tatiana",
      dependencia: "Cliente enviar certidão de nascimento",
      criterioConclusao: "Certidão anexada e conferida",
    });
    expect(c.dependencia).toBe("Cliente enviar certidão de nascimento");
    expect(c.criterioConclusao).toBe("Certidão anexada e conferida");
  });

  it("sem dependência/critério informados, os campos vêm null (nunca undefined ou string vazia silenciosa)", () => {
    const c = obterProximaAcaoCanonica({
      caseId: "caso-1",
      rpc: { nivel: 2, motivo: "Tarefa vencida", origem_tabela: "tarefas", origem_id: "t1", prazo: null },
    });
    expect(c.dependencia).toBeNull();
    expect(c.criterioConclusao).toBeNull();
  });
});
