import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial / CRM Vivo na Prancha V4 — terceira rodada (Proprietária,
 * 13/10/2026, PDF "Pranchas visuais exportáveis", 13/09/2026, rodapé "sem
 * dados reais"): o kit de referência mostra um quadro em colunas por etapa
 * do pipeline. Layout reconstruído aqui sobre `pipelineLeads` real,
 * agrupado por `etapaPipeline` — sem lead ou prazo de exemplo.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("Comercial — Quadro por etapa (kanban do pipeline real)", () => {
  it("agrupa pipelineLeads por etapaPipeline em colunas, mesmas ETAPAS_PIPELINE do funil", () => {
    expect(rota).toContain("data-leads-quadro-etapas");
    expect(rota).toContain("const colunasPipeline = ETAPAS_PIPELINE.map");
    expect(rota).toContain("pipelineLeads.filter((l) => etapaPipeline(l) === etapa)");
  });

  it("\"parado há N dias\" é calculado de ultimo_followup_em/created_at real, nunca fixo", () => {
    const trecho = rota.slice(rota.indexOf("const diasParado"), rota.indexOf("const colunasPipeline"));
    expect(trecho).toContain("l.ultimo_followup_em ?? l.created_at");
    expect(trecho).toContain("hojeIndicadores.getTime()");
  });

  it("badge de estagnação só aparece com 7+ dias reais, texto cita o próprio cálculo", () => {
    expect(rota).toContain('dias !== null && dias >= 7 ? <Etiqueta texto={`Lead parado há ${dias} dias`} tom="critico" /> : null');
  });

  /*
   * 26/10/2026 — achado da auditoria pré-lançamento: o card chamava
   * setSelecionado direto, trocando de lead e descartando rascunho sem
   * aviso. Passa a usar `trocarDeLead`, o mesmo guard de confirmação inline
   * já usado na lista de gestão abaixo — continua sendo a ficha real do
   * lead, sem link fictício, agora sem perder edição em andamento.
   */
  it("cada card abre a ficha real do lead pelo mesmo guard de rascunho pendente da gestão abaixo", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-quadro-etapas-colunas"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-quadro-etapas-colunas")));
    expect(trecho).toContain("trocarDeLead(l.id ?? null)");
  });

  it("vazio honesto quando não há lead no pipeline", () => {
    expect(rota).toContain("data-leads-quadro-etapas-vazio");
    expect(rota).toContain("Sem dados suficientes");
  });
});
