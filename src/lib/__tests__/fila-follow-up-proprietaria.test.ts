import { describe, expect, it } from "vitest";

import {
  estadoCarregamentoFila,
  FIXTURE_ANA_LUIZA,
  FIXTURE_JOAO,
  FIXTURE_LARA,
  FIXTURES_FOLLOW_UP_PROPRIETARIA,
  montarFilaFollowUp,
  type EntradaFollowUp,
} from "../fila-follow-up-proprietaria";

describe("fila de follow-up da Proprietária (PROMPT 05)", () => {
  it("monta um item por pessoa/caso para as três fixtures conhecidas", () => {
    const itens = montarFilaFollowUp(FIXTURES_FOLLOW_UP_PROPRIETARIA);
    expect(itens).toHaveLength(3);
    expect(itens.map((i) => i.pessoa).sort()).toEqual(["Ana Luiza", "João", "Lara"]);
  });

  it("cada item explica motivo, evidência e recomendação — não é uma tarefa muda", () => {
    const [ana] = montarFilaFollowUp([FIXTURE_ANA_LUIZA]);
    expect(ana.motivo).toBe("vencimento_financeiro");
    expect(ana.estado).toMatch(/aceite formal/i);
    expect(ana.evidenciaOrigem).toMatch(/proposta/i);
    expect(ana.recomendacao).toMatch(/decidir/i);
    expect(ana.responsavel).toBe("Proprietária administradora");
  });

  it("deduplica: a mesma pessoa/caso nunca aparece duas vezes, mesmo com dois motivos aplicáveis", () => {
    const duplicado: EntradaFollowUp = { ...FIXTURE_ANA_LUIZA, motivo: "cadencia_vencida" };
    const itens = montarFilaFollowUp([FIXTURE_ANA_LUIZA, duplicado]);
    expect(itens.filter((i) => i.pessoaOuCasoId === FIXTURE_ANA_LUIZA.pessoaOuCasoId)).toHaveLength(
      1,
    );
  });

  it("precedência: vencimento_financeiro vence cadencia_vencida para o mesmo objeto", () => {
    const duplicado: EntradaFollowUp = { ...FIXTURE_ANA_LUIZA, motivo: "cadencia_vencida" };
    const [item] = montarFilaFollowUp([duplicado, FIXTURE_ANA_LUIZA]);
    expect(item.motivo).toBe("vencimento_financeiro");
  });

  it("precedência: confirmacao_formal_pendente vence reuniao_nao_agendada", () => {
    const reuniao: EntradaFollowUp = { ...FIXTURE_JOAO, motivo: "reuniao_nao_agendada" };
    const [item] = montarFilaFollowUp([reuniao, FIXTURE_JOAO]);
    expect(item.motivo).toBe("confirmacao_formal_pendente");
  });

  it("prioridade derivada: financeiro e confirmação formal são P1; reunião/proposta são P3", () => {
    const itens = montarFilaFollowUp(FIXTURES_FOLLOW_UP_PROPRIETARIA);
    const porPessoa = Object.fromEntries(itens.map((i) => [i.pessoa, i.prioridade]));
    expect(porPessoa["Ana Luiza"]).toBe(1);
    expect(porPessoa["João"]).toBe(1);
    expect(porPessoa["Lara"]).toBe(3);
  });

  it("cada item traz uma rota de destino e uma chave de deduplicação estável", () => {
    const [item] = montarFilaFollowUp([FIXTURE_LARA]);
    expect(item.rotaDestino).toBe("/propostas");
    expect(item.chave).toBe("reuniao_nao_agendada:lara-fixture");
  });

  it("não persiste nada e não expõe nenhum método de escrita — é um objeto de dados puro", () => {
    const itens = montarFilaFollowUp(FIXTURES_FOLLOW_UP_PROPRIETARIA);
    for (const i of itens) {
      expect(typeof i).toBe("object");
      expect((i as any).salvar).toBeUndefined();
      expect((i as any).enviar).toBeUndefined();
      expect((i as any).criarEvento).toBeUndefined();
    }
  });
});

describe("estado de carregamento da fila — nunca conclui pendência resolvida em falha", () => {
  it("carregando tem prioridade sobre erro e vazio", () => {
    expect(estadoCarregamentoFila({ carregando: true, erro: true, quantidade: 0 })).toBe(
      "carregando",
    );
  });

  it("erro nunca vira 'vazio' silenciosamente", () => {
    expect(estadoCarregamentoFila({ carregando: false, erro: true, quantidade: 0 })).toBe("erro");
  });

  it("vazio de verdade só quando não há erro nem carregamento", () => {
    expect(estadoCarregamentoFila({ carregando: false, erro: false, quantidade: 0 })).toBe("vazio");
  });

  it("pronto quando há itens e nenhuma falha", () => {
    expect(estadoCarregamentoFila({ carregando: false, erro: false, quantidade: 3 })).toBe(
      "pronto",
    );
  });
});
