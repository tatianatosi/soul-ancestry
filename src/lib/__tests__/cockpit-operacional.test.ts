import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { INDICADORES_CANONICOS } from "@/lib/fontes-canonicas-indicadores";

const ler = (p: string) => readFileSync(p, "utf8");

describe("Cockpit — Visão Geral opera, Calls grava, Caso 360 sintetiza", () => {
  it("as 7 telas do Desk permanecem; não volta o mockup de 14 abas", () => {
    expect(GRUPOS_DESK).toHaveLength(7);
    expect(GRUPOS_DESK.map((g) => g.id)).toEqual([
      "visao-geral",
      "casos",
      "checklist",
      "validacao",
      "radar",
      "alertas",
      "biblioteca",
    ]);
  });

  it("cartões do Painel Hoje são links para lista com ação", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    expect(painel).toContain("faixaCockpitHoje");
    expect(painel).toContain("to={c.destino as \"/tarefas\"}");
    expect(painel).toContain("Buscar pessoa 360");
    expect(painel).toContain('to="/calls"');
  });

  it("indicadores canônicos de vencidos e sem responsável abrem a lista, não o próprio painel", () => {
    expect(INDICADORES_CANONICOS.find((i) => i.indicador === "Vencidos e vence hoje")?.rotaAcao).toBe(
      "/tarefas",
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
