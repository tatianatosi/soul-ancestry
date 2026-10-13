import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial / CRM Vivo na Prancha V4 (Proprietária, 13/10/2026): Funil
 * comercial sobre os mesmos `leads` já carregados por `listarLeadsDesk` —
 * sem query nova, sem lead de exemplo. O funil usa o pipeline canônico já
 * existente (ETAPAS_PIPELINE/etapaPipeline, CRM Vivo 27/09/2026), nunca uma
 * etapa inventada. Cartões ganham rounded-2xl.
 *
 * Decisão executiva (13/10/2026): o setor Comercial ganhou duas telas —
 * /leads (carteira, funil, propostas, gestão de leads) e /calls (Discovery
 * Calls, SPIN, handoff). A Mesa de Discovery saiu de /leads para não
 * duplicar a dona do dado; cobertura dela passa a ser de /calls.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("Comercial — Funil comercial", () => {
  it("usa o pipeline canônico já existente, sem etapa inventada", () => {
    expect(rota).toContain("data-leads-funil");
    expect(rota).toContain("ETAPAS_PIPELINE.map");
    expect(rota).toContain("etapaPipeline(l) === etapa");
    expect(rota).toContain("<BarrasHorizontais");
  });

  it("sem lead válido no pipeline, mostra vazio honesto, não gráfico inventado", () => {
    expect(rota).toContain("data-leads-funil-vazio");
    expect(rota).toContain("Sem dados suficientes");
  });

  it("percentual é derivado de pipelineLeads (leadValidoParaIndicadores), sem query nova", () => {
    const trecho = rota.slice(rota.indexOf("const pipelineLeads"), rota.indexOf("const TOM_STATUS_CALL"));
    expect(trecho).toContain("leadValidoParaIndicadores");
    expect(trecho).toContain("pipelineLeads.length ? Math.round((total / pipelineLeads.length) * 100) : 0");
  });
});

describe("Comercial — Mesa de Discovery saiu de /leads", () => {
  it("não há mais Mesa de Discovery nesta tela — Discovery mora em /calls", () => {
    expect(rota).not.toContain("data-leads-mesa-discovery");
    expect(rota).not.toContain("const mesaDiscovery");
  });
});

describe("Comercial — arredondamento V4 escopado a esta tela", () => {
  it("os cartões V4 têm rounded-2xl próprio", () => {
    const ocorrencias = rota.match(/rounded-2xl p-5 sm:p-6/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(2);
  });
});
