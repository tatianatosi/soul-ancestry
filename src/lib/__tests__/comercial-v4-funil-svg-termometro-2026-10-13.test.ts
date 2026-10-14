import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial V4 — quarta rodada (Proprietária, 13/10/2026): funil em
 * degraus/trapézio SVG de verdade (não barras simples), badge de canal nos
 * cartões do Quadro por etapa, e termômetro de conversão da carteira —
 * mesmo cálculo real já usado no KPI "Taxa de Conversão" do topo, nenhuma
 * meta mensal inventada.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const kit = readFileSync("src/components/prancha-v4/kit.tsx", "utf8");

describe("Comercial — Funil em degraus/trapézio (FunilVisualSvg)", () => {
  it("o Funil comercial usa FunilVisualSvg, não mais BarrasHorizontais", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-funil"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-funil")));
    expect(trecho).toContain("<FunilVisualSvg");
    expect(trecho).not.toContain("<BarrasHorizontais");
  });

  it("FunilVisualSvg desenha trapézios reais (polygon), largura proporcional ao valor recebido, nunca some em zero", () => {
    const trecho = kit.slice(kit.indexOf("export function FunilVisualSvg"), kit.indexOf("export function GraficoColunas"));
    expect(trecho).toContain("<polygon");
    expect(trecho).toContain("Math.max(8,");
  });
});

describe("Comercial — Quadro por etapa: badge de canal temático", () => {
  it("cada card do kanban mostra o canal real do lead com o tom de marca correspondente", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-quadro-etapas-colunas"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-quadro-etapas-colunas")));
    expect(trecho).toContain("CLASSE_BADGE_CANAL[tomDoCanal(l.origem)]");
    expect(trecho).toContain('rotulo("origem", l.origem)');
  });
});

describe("Comercial — Termômetro de conversão da carteira", () => {
  it("reaproveita o mesmo cálculo real do KPI do topo (contratoCount / pipelineLeads.length), nenhuma meta inventada", () => {
    expect(rota).toContain("data-leads-termometro-conversao");
    const trecho = rota.slice(rota.indexOf("data-leads-termometro-conversao") - 500, rota.indexOf("data-leads-termometro-conversao") + 700);
    expect(trecho).toContain("contratoCount");
    expect(trecho).toContain("pipelineLeads.length");
    expect(trecho).not.toMatch(/metaComercial|meta_comercial|meta_mensal|metaMensal/i);
  });

  it("a barra usa token de marca já existente (bg-gold), sem cor crua nova", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-termometro-conversao"), rota.indexOf("data-leads-termometro-conversao") + 700);
    expect(trecho).toContain("bg-gold");
    expect(trecho).not.toMatch(/rose-|amber-|emerald-|slate-\d|#[0-9A-Fa-f]{6}/);
  });
});
