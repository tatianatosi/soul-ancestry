import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Desk Operacional (/ops) — Kanban, leitura no celular (22/10/2026).
 *
 * Mesma leitura aplicada à Mesa de Discovery (`/calls`): a composição do
 * Kanban foi HOMOLOGADA COMO FINAL pela Proprietária em 14/10/2026 — 5
 * colunas por `STATUS_TAREFA`, KPIs derivados do mesmo array `tarefas`,
 * selo de texto para SLA/prioridade — e não é tocada aqui (ver
 * `d4d5-comercial-pipeline-kanban-risco.test.ts`, que continua valendo
 * integralmente). O único ajuste é o quanto a faixa de 4 KPIs ocupa antes
 * das colunas: ela empilhava um por linha em 375px; agora abre em 2
 * colunas desde o celular.
 */
const arquivo = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");

describe("Kanban de /ops — os 4 KPIs não empilham um por linha no celular", () => {
  it("a faixa abre em duas colunas desde 375 px e só vira quatro no desktop", () => {
    expect(arquivo).toContain('className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" data-kanban-indicadores');
    expect(arquivo).not.toContain('className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-kanban-indicadores');
  });

  it("cada cartão de KPI respira menos no celular e o número acompanha", () => {
    expect(arquivo).toContain('className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"');
    expect(arquivo).toContain('className="font-serif text-2xl text-navy sm:text-3xl"');
  });

  it("a homologação de 14/10 segue intacta: 5 colunas, KPIs sobre o array de tarefas", () => {
    expect(arquivo).toContain("const kpisKanban = useMemo(");
    expect(arquivo).toContain('rotulo: "Microentregas no ciclo"');
    expect(arquivo).toContain('rotulo: "Travadas / Bloqueadas"');
    expect(arquivo).toContain('rotulo: "Concluídas no mês"');
    expect(arquivo).toContain("DIVERGÊNCIA REGISTRADA");
  });

  it("os gráficos e as 5 colunas do board não tiveram a grade tocada", () => {
    expect(arquivo).toContain('className="mb-4 grid gap-3 lg:grid-cols-3"');
    expect(arquivo).toContain('<div className="grid gap-3 lg:grid-cols-5">');
  });
});
