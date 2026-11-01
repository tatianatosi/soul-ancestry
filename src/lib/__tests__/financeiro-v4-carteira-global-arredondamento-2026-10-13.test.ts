import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Revisão do Financeiro V4 (Proprietária, 13/10/2026): os 4 KPIs do topo
 * são a carteira inteira da organização, não um cliente — o rótulo passa
 * a dizer isso. "Total a Vencer" exclui o que já venceu. Cartões ganham
 * bordas mais arredondadas (rounded-2xl/rounded-xl), escopados a este
 * arquivo — CaCard (componente compartilhado por outras telas) não foi
 * tocado.
 */
const rota = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");
const caCard = readFileSync("src/components/ui/ca-card.tsx", "utf8");
const listarComercial = readFileSync("src/lib/comercial.functions.ts", "utf8");

describe("Financeiro — carteira global, não cliente individual", () => {
  it("qFaturas usa listarComercial, que filtra só por organization_id, nunca por cliente", () => {
    expect(rota).toContain('queryFn: () => listar({ data: { recurso: "invoices" } })');
    const trecho = listarComercial.slice(
      listarComercial.indexOf("export const listarComercial"),
      listarComercial.indexOf("const { data: linhas, error } = await q;"),
    );
    expect(trecho).toContain('.eq("organization_id", organizationId)');
    expect(trecho).not.toContain('.eq("client_id"');
  });

  it("título do resumo diz 'carteira', não 'período' ambíguo", () => {
    expect(rota).toContain('titulo="Carteira global"');
    expect(rota).toContain("Toda a organização, não um cliente");
  });
});

describe("Financeiro — arredondamento escopado a esta tela", () => {
  it("todos os CaCard de financeiro.tsx têm rounded-2xl próprio via className", () => {
    const ocorrencias = rota.match(/className="rounded-2xl p-5 sm:p-6"/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(6);
  });

  it("a tabela de parcelas tem moldura arredondada própria", () => {
    expect(rota).toContain('className="overflow-x-auto rounded-xl border border-navy/10"');
  });

  it("CaCard compartilhado (outras telas) não foi alterado — raio continua rounded-lg", () => {
    expect(caCard).toContain("rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5");
  });
});
