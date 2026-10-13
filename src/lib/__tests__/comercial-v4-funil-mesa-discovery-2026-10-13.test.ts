import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial / CRM Vivo na Prancha V4 (Proprietária, 13/10/2026): Funil
 * comercial e Mesa de Discovery sobre os mesmos `leads` já carregados por
 * `listarLeadsDesk` — sem query nova, sem lead de exemplo. O funil usa o
 * pipeline canônico já existente (ETAPAS_PIPELINE/etapaPipeline, CRM Vivo
 * 27/09/2026), nunca uma etapa inventada. Cartões ganham rounded-2xl.
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

describe("Comercial — Mesa de Discovery", () => {
  it("lista só leads com call agendada/realizada/status_call, campos reais", () => {
    expect(rota).toContain("data-leads-mesa-discovery");
    const trecho = rota.slice(rota.indexOf("const mesaDiscovery"), rota.indexOf("const visiveis"));
    expect(trecho).toContain("l.call_agendada_em || l.call_realizada_em || l.status_call");
    expect(trecho).toContain("!l.archived_at");
  });

  it("vazio honesto quando nenhuma Discovery foi agendada/realizada", () => {
    expect(rota).toContain("data-leads-mesa-discovery-vazio");
    expect(rota).toContain("Nenhuma Discovery agendada ou realizada ainda.");
  });

  it("status da call usa o rótulo real do catálogo (rotulo(\"status_call\", ...)), nunca texto livre", () => {
    const trecho = rota.slice(
      rota.indexOf("data-leads-mesa-discovery-lista"),
      rota.indexOf("</CaCard>", rota.indexOf("data-leads-mesa-discovery-lista")),
    );
    expect(trecho).toContain('rotulo("status_call", l.status_call)');
    expect(trecho).toContain("<Etiqueta");
  });
});

describe("Comercial — arredondamento V4 escopado a esta tela", () => {
  it("os dois novos cartões têm rounded-2xl próprio", () => {
    const ocorrencias = rota.match(/className="rounded-2xl p-5 sm:p-6"/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(2);
  });
});
