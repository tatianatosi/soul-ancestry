import { describe, expect, it } from "vitest";

import { derivarCadenciaDoPainel, RECOMENDACAO_POR_MOTIVO } from "@/lib/painel-cadencia-derivada";
import { MOTIVOS_FOLLOW_UP } from "@/lib/fila-follow-up-proprietaria";

const itemFila = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  rotulo: `Cliente ${id}`,
  detalhe: "Detalhe da fila",
  data: "2026-09-01",
  tipo: "caso" as const,
  responsavel: "Tati",
  ...extra,
});

const casoCadencia = (
  id: string,
  status: string,
  dias: number,
  extra: Record<string, unknown> = {},
) => ({
  id,
  codigo: `CA-${id}`,
  cadencia: {
    diasSemTouchpoint: dias,
    status,
    motivo: "14 dias ou mais sem atualização contextualizada.",
  },
  ...extra,
});

const vazio = { filas: [], casosCadencia: [] };

describe("derivação da cadência do Painel Hoje", () => {
  it("traduz fila de bloqueio em motivo de acompanhamento com recomendação", () => {
    const itens = derivarCadenciaDoPainel({
      ...vazio,
      filas: [{ chave: "pagamentos_aguardados", itens: [itemFila("c1")] }],
    });
    expect(itens).toHaveLength(1);
    expect(itens[0]?.motivo).toBe("vencimento_financeiro");
    expect(itens[0]?.recomendacao).toBe(RECOMENDACAO_POR_MOTIVO["vencimento_financeiro"]);
    expect(itens[0]?.rotaDestino).toBe("/casos/c1");
  });

  it("traduz caso com cadência vencida, com os dias como evidência", () => {
    const itens = derivarCadenciaDoPainel({
      ...vazio,
      casosCadencia: [casoCadencia("x", "critico", 21)],
    });
    expect(itens).toHaveLength(1);
    expect(itens[0]?.motivo).toBe("cadencia_vencida");
    expect(itens[0]?.evidenciaOrigem).toContain("21");
  });

  it("ignora caso com cadência regular", () => {
    const itens = derivarCadenciaDoPainel({
      ...vazio,
      casosCadencia: [casoCadencia("x", "regular", 2)],
    });
    expect(itens).toHaveLength(0);
  });

  it("não reexibe registro já mostrado em bloco anterior", () => {
    const entrada = {
      ...vazio,
      filas: [{ chave: "pagamentos_aguardados", itens: [itemFila("c1")] }],
      casosCadencia: [casoCadencia("c1", "critico", 30)],
    };
    expect(derivarCadenciaDoPainel(entrada)).toHaveLength(1);
    expect(derivarCadenciaDoPainel({ ...entrada, jaExibidos: new Set(["caso:c1"]) })).toHaveLength(
      0,
    );
  });

  it("aplica precedência: o mesmo caso em duas fontes aparece uma vez, pelo motivo mais forte", () => {
    const itens = derivarCadenciaDoPainel({
      ...vazio,
      // vencimento_financeiro precede cadencia_vencida na ordem do motor.
      filas: [{ chave: "pagamentos_aguardados", itens: [itemFila("c1")] }],
      casosCadencia: [casoCadencia("c1", "critico", 30)],
    });
    expect(itens).toHaveLength(1);
    expect(itens[0]?.motivo).toBe("vencimento_financeiro");
  });

  it("exclui fixtures de demonstração por padrão", () => {
    const filas = [
      { chave: "pagamentos_aguardados", itens: [itemFila("c1", { rotulo: "demo João" })] },
    ];
    expect(derivarCadenciaDoPainel({ ...vazio, filas })).toHaveLength(0);
    expect(derivarCadenciaDoPainel({ ...vazio, filas, incluirDemo: true })).toHaveLength(1);
  });

  it("ignora fila que não descreve cliente parado", () => {
    const itens = derivarCadenciaDoPainel({
      ...vazio,
      filas: [{ chave: "leads_sem_responsavel", itens: [itemFila("c1")] }],
    });
    expect(itens).toHaveLength(0);
  });

  it("cobre todos os motivos do motor com um texto de recomendação", () => {
    for (const motivo of MOTIVOS_FOLLOW_UP) {
      expect(RECOMENDACAO_POR_MOTIVO[motivo]?.length ?? 0).toBeGreaterThan(20);
    }
  });

  it("ordena por prioridade: o que trava o avanço vem antes do próximo passo", () => {
    const itens = derivarCadenciaDoPainel({
      ...vazio,
      filas: [
        { chave: "propostas_sem_followup", itens: [itemFila("b")] },
        { chave: "pagamentos_aguardados", itens: [itemFila("a")] },
      ],
    });
    expect(itens.map((i) => i.motivo)).toEqual(["vencimento_financeiro", "follow_up_vencido"]);
  });
});
