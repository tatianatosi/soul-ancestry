import { describe, expect, it } from "vitest";

import { aplicarFiltrosDia, cadenciaRelevante, cardsHoje, consolidarDia, itensNaoExibidos, opcoesFiltroDia } from "@/lib/painel-dia";

const item = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  rotulo: id,
  detalhe: "detalhe",
  data: "2026-08-22",
  tipo: "lead" as const,
  responsavel: "Tati",
  area: "comercial",
  etapa: "proposta_enviada",
  ...extra,
});

const filas = [
  { chave: "acoes_vencidas", rotulo: "Ações vencidas", criticidade: 1, itens: [item("l1")] },
  { chave: "contratos_enviados_pendentes", rotulo: "Contratos", criticidade: 2, itens: [item("l2", { rotulo: "demo João" })] },
] as never[];

describe("cards e filtros do Painel Hoje", () => {
  it("expõe os oito cards canônicos na ordem definida", () => {
    const cards = cardsHoje(filas);
    expect(cards.map((c) => c.chave)).toEqual([
      "acoes_vencidas",
      "acoes_hoje",
      "leads_sem_responsavel",
      "propostas_sem_followup",
      "contratos_enviados_pendentes",
      "pagamentos_aguardados",
      "onboardings_pendentes",
      "casos_pendencia_documental",
    ]);
  });

  it("exclui fixtures de demonstração por padrão", () => {
    expect(cardsHoje(filas).find((c) => c.chave === "contratos_enviados_pendentes")?.total).toBe(0);
    expect(cardsHoje(filas, { incluirDemo: true }).find((c) => c.chave === "contratos_enviados_pendentes")?.total).toBe(1);
  });

  it("deriva opções de filtro dos próprios itens e restringe a fila", () => {
    const itens = consolidarDia(filas);
    expect(opcoesFiltroDia(itens)).toEqual({ responsaveis: ["Tati"], areas: ["comercial"], etapas: ["proposta_enviada"] });
    expect(aplicarFiltrosDia(itens, { area: "operacoes" })).toHaveLength(0);
    expect(aplicarFiltrosDia(itens, { area: "comercial", responsavel: "Tati" })).toHaveLength(1);
  });
});

describe("deduplicação de resumos", () => {
  it("não repete item já presente na fila e oculta demonstrações", () => {
    const usados = new Set(["lead:1"]);
    const itens = [
      { id: "1", tipo: "lead", rotulo: "Lead A" },
      { id: "2", tipo: "lead", rotulo: "Lead B" },
      { id: "3", tipo: "lead", rotulo: "Lead DEMO" },
    ];
    expect(itensNaoExibidos(itens, usados).map((i) => i.id)).toEqual(["2"]);
  });

  it("cadência ignora casos já exibidos na fila", () => {
    const casos = [
      { id: "c1", cadencia: { status: "critico", diasSemTouchpoint: 20 } },
      { id: "c2", cadencia: { status: "critico", diasSemTouchpoint: 30 } },
    ];
    expect(cadenciaRelevante(casos, 6, new Set(["caso:c2"])).map((c) => c["id"])).toEqual(["c1"]);
  });
});
