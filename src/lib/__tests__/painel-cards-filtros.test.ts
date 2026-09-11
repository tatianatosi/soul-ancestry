import { describe, expect, it } from "vitest";

import {
  aplicarFiltrosDia,
  cadenciaRelevante,
  cardsHoje,
  consolidarDia,
  faixaCockpitHoje,
  itensNaoExibidos,
  MAPA_BLOCOS_PAINEL_HOJE,
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

  it("cada cartão de decisão aponta para uma lista com ação, nunca para si mesmo", () => {
    const cards = cardsHoje(filas);
    for (const c of cards) {
      expect(c.destino.startsWith("/")).toBe(true);
      expect(c.destino).not.toBe("/painel");
      expect(c.acao.length).toBeGreaterThan(8);
    }
    expect(cards.find((c) => c.chave === "acoes_vencidas")?.destino).toBe("/calls");
    expect(cards.find((c) => c.chave === "sem_responsavel")?.destino).toBe("/casos");
    // Bloqueios de fila → bloco #excecoes deste painel (não ops_excecoes).
    expect(cards.find((c) => c.chave === "excecoes_criticas")?.destino).toBe("/painel#excecoes");
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

describe("faixa do cockpit no Hoje", () => {
  it("atalhos únicos — sem recontação de leads, bloqueios nem cadência D10/D14", () => {
    const faixa = faixaCockpitHoje(filas, { cadenciasAtrasadas: 2 });
    expect(faixa.map((f) => f.chave)).toEqual(["cadencias", "calls_hoje", "propostas"]);
    // Cadência: contagem canônica em /ops — faixa só linka (null).
    expect(faixa.find((f) => f.chave === "cadencias")?.total).toBeNull();
    expect(faixa.find((f) => f.chave === "cadencias")?.destino).toBe("/ops");
    expect(faixa.find((f) => f.chave === "calls_hoje")?.destino).toBe("/calls");
    expect(faixa.every((f) => f.destino.startsWith("/") && f.destino !== "/painel")).toBe(true);
    // Removidos por duplicação com mockup KPI / Exceções críticas.
    expect(faixa.find((f) => f.chave === "leads_sem_acao")).toBeUndefined();
    expect(faixa.find((f) => f.chave === "documentos")).toBeUndefined();
    expect(faixa.find((f) => f.chave === "contratos")).toBeUndefined();
  });
});

describe("mapa dos blocos do Painel Hoje", () => {
  it("classifica cada bloco como kpi, fila, cadencia, descoberta ou tecnico", () => {
    expect(MAPA_BLOCOS_PAINEL_HOJE.length).toBeGreaterThanOrEqual(8);
    for (const b of MAPA_BLOCOS_PAINEL_HOJE) {
      expect(["kpi", "fila", "cadencia", "descoberta", "tecnico"]).toContain(b.tipo);
      expect(b.titulo.length).toBeGreaterThan(3);
      expect(b.papel.length).toBeGreaterThan(10);
    }
    expect(MAPA_BLOCOS_PAINEL_HOJE.find((b) => b.bloco === "excecoes")?.tipo).toBe("fila");
    expect(MAPA_BLOCOS_PAINEL_HOJE.find((b) => b.bloco === "prazos")?.tipo).toBe("cadencia");
    expect(MAPA_BLOCOS_PAINEL_HOJE.find((b) => b.bloco === "descoberta")?.tipo).toBe("descoberta");
  });
});
