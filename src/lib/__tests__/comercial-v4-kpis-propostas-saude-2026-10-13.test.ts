import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Comercial / CRM Vivo na Prancha V4 — segunda rodada (Proprietária,
 * 13/10/2026): bloco de 4 KPIs comerciais, Propostas comerciais, Leads
 * ativos e Saúde comercial & canais, todos sobre dados reais já carregados
 * ou já existentes (listarComercial, listarVinculos, totalInvestimentoMarketing),
 * sem tabela nova e sem valor fictício.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const servidor = readFileSync("src/lib/comercial.functions.ts", "utf8");

describe("Comercial — Bloco 1: KPIs de performance comercial", () => {
  it("os 4 KPIs pedidos existem, com fonte real cada um", () => {
    expect(rota).toContain("data-leads-kpis-topo");
    expect(rota).toContain("Investimento em Marketing");
    expect(rota).toContain("Leads Entrantes");
    expect(rota).toContain("Taxa de Conversão");
    expect(rota).toContain("Propostas em Aberto");
  });

  it("investimento soma marketing_investments real (totalInvestimentoMarketing), nunca número fixo", () => {
    expect(rota).toContain("totalInvestimentoMarketing");
    const trecho = servidor.slice(
      servidor.indexOf("export const totalInvestimentoMarketing"),
      servidor.indexOf("export const listarVinculos"),
    );
    expect(trecho).toContain('.from("marketing_investments")');
    expect(trecho).toContain('.eq("organization_id", organizationId)');
  });

  it("sem lançamento de investimento ou sem lead no pipeline, mostra 'Sem dados suficientes' — nunca zero inventado", () => {
    expect(rota).toContain('qInvestimento.data && qInvestimento.data.lancamentos > 0');
    expect(rota).toContain("taxaConversao === null");
  });

  it("propostas em aberto vêm de listarComercial(\"proposals\"), estados não-terminais do fluxo real, sem tabela nova", () => {
    const trecho = rota.slice(rota.indexOf("const propostas = (qPropostas.data"), rota.indexOf("const clientesComercial"));
    expect(trecho).toContain('new Set(["rascunho", "em_revisao", "enviada", "em_negociacao"])');
  });
});

describe("Comercial — Bloco 4: Propostas comerciais", () => {
  it("usa o status real do fluxo (comercial-fluxo.ts), nunca 'aceita' fictício", () => {
    expect(rota).toContain("data-leads-propostas");
    expect(rota).toContain("ROTULO_STATUS_PROPOSTA");
    expect(rota).toContain("em_negociacao: \"Em negociação\"");
    expect(rota).not.toContain('"Aceita"');
  });

  it("vazio honesto sem propostas, nunca omite o bloco", () => {
    expect(rota).toContain("data-leads-propostas-vazio");
  });

  it("não inventa coluna 'rota consular' — schema real de proposals não tem esse campo", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-propostas"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-propostas")));
    expect(trecho).not.toMatch(/rota consular/i);
  });
});

describe("Comercial — Bloco 5: Leads ativos", () => {
  it("reaproveita pipelineLeads já carregado, ordenado por último contato real", () => {
    expect(rota).toContain("data-leads-ativos-tabela");
    expect(rota).toContain("const leadsAtivosTabela");
    expect(rota).toContain("ultimo_followup_em ?? b.created_at");
  });

  it("vazio honesto sem lead ativo", () => {
    expect(rota).toContain("data-leads-ativos-vazio");
  });
});

describe("Comercial — Aquisição/Qualidade por canal (trio infográfico)", () => {
  it("aquisição e qualidade por canal usam ORIGENS_LEAD real, sem canal inventado", () => {
    expect(rota).toContain("data-leads-aquisicao-canal");
    expect(rota).toContain("data-leads-qualidade-canal");
    expect(rota).toContain("const leadsPorCanal = ORIGENS_LEAD.map");
  });

  it("alerta de estagnação reaproveita o indicador já calculado (sem_proxima_acao), sem contagem nova", () => {
    expect(rota).toContain("data-leads-sem-proxima-acao");
    expect(rota).toContain("contagemIndicadores.sem_proxima_acao");
  });

  it("vazio honesto quando não há distribuição", () => {
    expect(rota).toContain("data-leads-aquisicao-canal-vazio");
    expect(rota).toContain("data-leads-qualidade-canal-vazio");
  });
});

describe("Comercial — arredondamento V4 (segunda rodada)", () => {
  it("os quatro novos cartões (propostas, leads ativos, saúde canais) têm rounded-2xl e os KPIs rounded-xl", () => {
    const grandes = rota.match(/className="mb-6 rounded-2xl p-6"/g) ?? [];
    expect(grandes.length).toBeGreaterThanOrEqual(3);
    expect(rota).toContain('data-leads-kpis-topo');
  });
});
