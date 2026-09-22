import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { RESULTADOS_DISCOVERY, CONSENTIMENTO_STATUS } from "@/lib/crm-desk";

/**
 * D2 (§12) e D3 (§13) — profundidade funcional.
 *
 * D2: bloqueio no card do pipeline deriva de vocabulário canônico
 *     (RESULTADOS_DISCOVERY, CONSENTIMENTO_STATUS). Chip de qualidade de
 *     dados no cabeçalho.
 * D3: card do kanban tem próximo passo legível (tarefas.descricao), não
 *     escondido em tooltip.
 */
const crm = readFileSync("src/components/desk/superficies-kit-conectadas.tsx", "utf8");
const kanban = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");

describe("D2 · pipeline expõe bloqueio derivado do vocabulário real", () => {
  it("bloqueio 'sem aderência' vem de RESULTADOS_DISCOVERY", () => {
    expect(RESULTADOS_DISCOVERY.some((o) => o.valor === "sem_aderencia")).toBe(true);
    expect(crm).toContain('lead["discovery_resultado"] === "sem_aderencia"');
  });

  it("bloqueio 'consentimento recusado' vem de CONSENTIMENTO_STATUS", () => {
    expect(CONSENTIMENTO_STATUS.some((o) => o.valor === "recusado")).toBe(true);
    expect(crm).toContain('lead["consentimento_status"] === "recusado"');
  });

  it("bloqueio prioriza sobre falta de responsável/próxima ação", () => {
    expect(crm).toContain("Bloqueado: ${bloqueios.join");
    expect(crm).toContain("bloqueios.length");
    expect(crm).toContain("Sem ${faltando.join");
  });

  it("card com bloqueio recebe tom de atenção, não neutro", () => {
    expect(crm).toContain('tone: "attention" as const');
  });
});

describe("D2 · chip de qualidade de dados no cabeçalho §12", () => {
  it("existe e é identificável", () => {
    expect(crm).toContain("data-crm-chip-qualidade");
  });

  it("mostra data de última atualização quando existe", () => {
    expect(crm).toContain("ultimaAtualizacao");
    expect(crm).toContain("`Atualizado em ${");
  });

  it("mostra 'Sem leads reais' quando a lista vem vazia", () => {
    expect(crm).toContain('"Sem leads reais"');
  });

  it("mostra tom de atenção quando não há data de atualização", () => {
    expect(crm).toContain("sem data de atualização");
  });
});

describe("D3 · card do kanban traz próximo passo legível §13 linha 5", () => {
  it("descricao aparece no cartão, entre título e contexto", () => {
    // Extrai só o card do kanban (não o card da aba Lista, que já mostrava
    // motivo_bloqueio separadamente).
    const kanbanCard = kanban.slice(
      kanban.indexOf('{aba === "kanban" &&'),
      kanban.indexOf('{aba === "micro" &&'),
    );
    expect(kanbanCard).toContain('t["descricao"] ? (');
    expect(kanbanCard).toContain('String(t["descricao"]).trim()');
  });

  it("§13 proíbe esconder em tooltip: descricao é <p>, não title/aria-label", () => {
    const kanbanCard = kanban.slice(
      kanban.indexOf('{aba === "kanban" &&'),
      kanban.indexOf('{aba === "micro" &&'),
    );
    // A leitura tem que ser texto visível, nunca só title="…"
    expect(kanbanCard).not.toMatch(/title=\{String\(t\["descricao"\]/);
  });
});
