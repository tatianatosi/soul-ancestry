import { describe, expect, it } from "vitest";

import {
  aplicarFiltrosDia,
  cadenciaRelevante,
  cardsHoje,
  consolidarDia,
  itensNaoExibidos,
  opcoesFiltroDia,
} from "@/lib/painel-dia";

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
  {
    chave: "contratos_enviados_pendentes",
    rotulo: "Contratos",
    criticidade: 2,
    itens: [item("l2", { rotulo: "demo João" })],
  },
] as never[];

describe("cards e filtros do Painel Hoje", () => {
  it("expõe as cinco métricas de decisão do CA-UX-02 §7, nesta ordem", () => {
    const cards = cardsHoje(filas);
    expect(cards.map((c) => c.chave)).toEqual([
      "acoes_vencidas",
      "acoes_hoje",
      "sem_responsavel",
      "excecoes_criticas",
      "sla_em_risco",
    ]);
  });

  it("nenhum cartão reconta um número já exibido por outro bloco da tela", () => {
    // As filas de bloqueio deixaram de ter um cartão cada e passaram a
    // consolidar em "Exceções críticas" — o bloco Comercial só linka.
    const chaves = cardsHoje(filas).map((c) => c.chave);
    for (const fila of [
      "contratos_enviados_pendentes",
      "pagamentos_aguardados",
      "onboardings_pendentes",
      "casos_pendencia_documental",
      "propostas_sem_followup",
    ]) {
      expect(chaves).not.toContain(fila);
    }
  });

  it("exclui fixtures de demonstração por padrão", () => {
    const criticas = (o?: { incluirDemo: boolean }) =>
      cardsHoje(filas, o).find((c) => c.chave === "excecoes_criticas")?.total;
    expect(criticas()).toBe(0);
    expect(criticas({ incluirDemo: true })).toBe(1);
  });

  it("conta registro distinto, não ocorrência, em exceções críticas", () => {
    const mesmo = item("dup", { rotulo: "Lead travado" });
    const emDuasFilas = [
      {
        chave: "contratos_enviados_pendentes",
        rotulo: "Contratos",
        criticidade: 2,
        itens: [mesmo],
      },
      { chave: "pagamentos_aguardados", rotulo: "Pagamentos", criticidade: 2, itens: [mesmo] },
    ] as never[];
    expect(cardsHoje(emDuasFilas).find((c) => c.chave === "excecoes_criticas")?.total).toBe(1);
  });

  it("declara ausência de dado em SLA em risco, nunca zero", () => {
    // A consulta do Painel Hoje ainda não carrega sla_status; o cartão precisa
    // dizer "sem dados suficientes" em vez de afirmar que não há risco.
    expect(cardsHoje(filas).find((c) => c.chave === "sla_em_risco")?.total).toBeNull();
  });

  it("deriva opções de filtro dos próprios itens e restringe a fila", () => {
    const itens = consolidarDia(filas);
    expect(opcoesFiltroDia(itens)).toEqual({
      responsaveis: ["Tati"],
      areas: ["comercial"],
      etapas: ["proposta_enviada"],
    });
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
