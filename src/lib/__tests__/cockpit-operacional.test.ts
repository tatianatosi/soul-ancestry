import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { INDICADORES_CANONICOS } from "@/lib/fontes-canonicas-indicadores";

const ler = (p: string) => readFileSync(p, "utf8");

describe("Cockpit — Hoje opera, Calls grava, Caso 360 sintetiza", () => {
  it("os 6 grupos do Desk permanecem; não volta o mockup de 14 abas", () => {
    expect(GRUPOS_DESK).toHaveLength(6);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "hoje",
      "comercial",
      "casos",
      "pesquisa",
      "contratos",
      "governanca",
    ]);
  });

  it("cartões do Painel Hoje são os KPIs do mockup Visão Geral, com ação", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    expect(painel).toContain("faixaCockpitHoje");
    expect(painel).toContain("Radar da carteira");
    expect(painel).toContain('rotulo="Casos ativos"');
    expect(painel).toContain('rotulo="Alertas pendentes"');
    expect(painel).toContain("Buscar pessoa 360");
    expect(painel).toContain('to="/calls"');
    expect(painel).not.toContain('to={c.destino as "/tarefas"}');
  });

  it("o topo do Hoje segue o mockup: KPIs, funil e alertas — sem receita nem conversão DEMO", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    expect(painel).toContain("Radar da carteira");
    expect(painel).toContain('rotulo="Leads sem próxima ação"');
    expect(painel).toContain("faixa.map");
    expect(painel).not.toContain("GradeKpisVivos");
    expect(painel).not.toContain("KPIS_TRANSVERSAIS");
    expect(painel).not.toContain('rotulo="Receita do mês"');
    expect(painel).not.toContain('rotulo="Taxa de conversão"');
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

  it("Caso 360 mantém síntese no topo, Radar do caso e recolhe o restante técnico", () => {
    const ficha = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(ficha).toContain("Situação hoje");
    expect(ficha).toContain("Radar do caso");
    expect(ficha).toContain("FormularioTarefaCaso");
    expect(ler("src/components/caso/visao-geral.tsx")).toContain(
      "Dados técnicos e validações desta visão",
    );
  });

  it("Jornada do App Cliente abre Entregas e Fases sem promovê-las a aba", () => {
    const jornada = ler("src/routes/portal/jornada.tsx");
    expect(jornada).toContain('to="/portal/entregas"');
    expect(jornada).toContain('to="/portal/fase-01"');
    expect(jornada).toContain('to="/portal/fase-02"');
    const shell = ler("src/components/portal/portal-shell.tsx");
    expect(shell).not.toContain("/portal/entregas");
  });

  it("prévia do App Cliente não espera sessão de cliente para visibilidade", () => {
    const visib = ler("src/components/portal/portal-visibilidade.tsx");
    expect(visib).toContain("enabled: previa === null");
    expect(visib).toContain("ESCOPO_PREVIA");
  });
});
