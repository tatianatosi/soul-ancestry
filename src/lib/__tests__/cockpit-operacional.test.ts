import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { INDICADORES_CANONICOS } from "@/lib/fontes-canonicas-indicadores";

const ler = (p: string) => readFileSync(p, "utf8");

describe("Cockpit — Hoje opera, Calls grava, Caso 360 sintetiza", () => {
  it("as 7 telas do Desk permanecem; não volta o mockup de 14 abas nem os 6 grupos como sidebar", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "visao-geral",
      "casos-360",
      "checklist",
      "validacao-juridica",
      "radar-interno",
      "alertas",
      "biblioteca-mestre",
    ]);
  });

  it("cartões do Painel Hoje são links para lista com ação", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    expect(painel).toContain("faixaCockpitHoje");
    expect(painel).toContain("c.destino.split");
    expect(painel).not.toContain('to={c.destino as "/tarefas"}');
    expect(painel).toContain("Buscar pessoa 360");
    expect(painel).toContain('to="/calls"');
  });

  it("o topo do Hoje usa KPIs vivos sem duplicar exceções nem receita", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    expect(painel).toContain('rotulo="Alertas pendentes"');
    expect(painel).toContain("qAlertas.isSuccess");
    expect(painel).toContain('rotulo="Leads sem próxima ação"');
    // Casos ativos: só etiqueta/link para /casos (sem segundo número via cadência).
    expect(painel).toContain('data-indicador-etiqueta="casos-ativos"');
    expect(painel).not.toContain('rotulo="Casos ativos"');
    // Uma só face de exceções: cardsHoje "Exceções críticas" (não o rótulo antigo duplicado).
    expect(painel).not.toContain('rotulo="Exceções e bloqueios"');
    expect(painel).toContain("excecoes_criticas");
    // Vencidos / Vence hoje vêm de cardsHoje (rótulo dinâmico c.rotulo), não hardcoded no TSX.
    expect(painel).not.toContain('rotulo="SLA em risco"');
    expect(painel).not.toContain('rotulo="Receita do mês"');
    expect(painel).not.toContain('rotulo="Taxa de conversão"');
  });

  it("dedup global: /ops não empilha MetricasJornada nem PainelCadencia", () => {
    const ops = ler("src/routes/_authenticated/ops.tsx");
    expect(ops).toContain("PainelOnboardingJornada");
    expect(ops).toContain("DeskOperacional");
    expect(ops).not.toContain("MetricasJornada");
    expect(ops).not.toContain("PainelCadencia");
    expect(ops).toContain('data-ops-dedup="cadencia"');
  });

  it("dedup global: pesquisa e financeiro não recontam métricas canônicas", () => {
    const pesquisa = ler("src/routes/_authenticated/pesquisa.index.tsx");
    expect(pesquisa).toContain('data-indicador-etiqueta="casos-em-pesquisa"');
    expect(pesquisa).toContain('data-indicador-etiqueta="casos-ativos"');
    expect(pesquisa).not.toContain('rotulo="Casos em pesquisa"');
    expect(pesquisa).not.toContain('rotulo="Casos ativos"');

    const financeiro = ler("src/routes/_authenticated/financeiro.tsx");
    expect(financeiro).toContain('data-indicador-etiqueta="cac-roi-cpl"');
    expect(financeiro).toContain("/marketing#indicadores");
    expect(financeiro).not.toContain('rotulo: "CAC"');
    expect(financeiro).not.toContain('rotulo: "CPL"');

    const conversao = ler("src/routes/_authenticated/conversao.tsx");
    expect(conversao).toContain('data-indicador-etiqueta="leads-sem-proxima-acao"');
  });

  it("indicadores canônicos de vencidos e sem responsável abrem a lista, não o próprio painel", () => {
    expect(INDICADORES_CANONICOS.find((i) => i.indicador === "Vencidos e vence hoje")?.rotaAcao).toBe(
      "/calls",
    );
    expect(INDICADORES_CANONICOS.find((i) => i.indicador === "Sem responsável")?.rotaAcao).toBe("/casos");
  });

  it("Painel de Calls grava o lead e recarrega o Hoje", () => {
    const calls = ler("src/components/crm/painel-calls.tsx");
    expect(calls).toContain("salvarLeadDesk");
    expect(calls).toContain('invalidateQueries({ queryKey: ["leads-desk"] })');
    expect(calls).toContain('invalidateQueries({ queryKey: ["painel-desk-hoje"] })');
    expect(calls).toContain("void refetch()");
    expect(calls).toContain("Gravar registro da call");
  });

  it("Caso 360 mantém síntese no topo e recolhe o restante técnico", () => {
    const ficha = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(ficha).toContain("Situação hoje");
    expect(ficha).toContain("FormularioTarefaCaso");
    expect(ler("src/components/caso/visao-geral.tsx")).toContain(
      "Dados técnicos e validações desta visão",
    );
  });

  it("Jornada do App Cliente aponta para Documentos e Legado, sem Entregas/Fase na barra", () => {
    const jornada = ler("src/routes/portal/jornada.tsx");
    expect(jornada).toContain('to="/portal/documentos"');
    expect(jornada).toContain('to="/portal/legado"');
    expect(jornada).not.toContain('to="/portal/entregas"');
    expect(jornada).not.toContain('to="/portal/fase-01"');
    expect(jornada).not.toContain('to="/portal/fase-02"');
    const shell = ler("src/components/portal/portal-shell.tsx");
    expect(shell).not.toContain("/portal/entregas");
    expect(shell).not.toContain("/portal/fase-01");
    expect(shell).not.toContain("/portal/fase-02");
  });

  it("prévia do App Cliente não espera sessão de cliente para visibilidade", () => {
    const visib = ler("src/components/portal/portal-visibilidade.tsx");
    expect(visib).toContain("enabled: previa === null");
    expect(visib).toContain("ESCOPO_PREVIA");
  });
});
