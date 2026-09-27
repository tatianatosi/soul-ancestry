import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Fase 4 (27/09/2026) — "Prompt Canônicos": Ficha Lead/CRM Vivo e Mesa
 * Discovery. Reorganização em 7 blocos guiados dentro de /calls, sem novo
 * writer e sem tocar /leads.
 */
describe("Fase 4 — Mesa Discovery (/calls) organizada em 7 blocos", () => {
  const pagina = readFileSync("src/components/crm/painel-calls.tsx", "utf8");

  it("bloco 1 — contexto do lead: resumo de origem/país-linha/responsável/próxima ação antes de tudo", () => {
    expect(pagina).toContain("Origem</p>");
    expect(pagina).toContain("País/linha de interesse</p>");
    expect(pagina).toContain("Responsável · estágio</p>");
    expect(pagina).toContain("Próxima ação atual</p>");
  });

  it("bloco 2 — preparação pré-call: consentimento separado do registro da call", () => {
    const inicio = pagina.indexOf('titulo="Preparação pré-call"');
    expect(inicio).toBeGreaterThan(-1);
    const trecho = pagina.slice(inicio, inicio + 1100);
    expect(trecho).toContain("Consentimento de gravação");
    expect(trecho).toContain("Canal do consentimento");
    expect(trecho).toContain("Consentimento registrado em");
    // não deve ter os campos de "Registro da call" dentro do mesmo bloco
    expect(trecho).not.toContain("Status da call");
  });

  it("bloco 3 — varredura/transcrição (VarreduraWhatsApp) e bloco 4 — SPIN guiado (MesaDiscovery) continuam intactos", () => {
    expect(pagina).toContain("<VarreduraWhatsApp");
    expect(pagina).toContain("<MesaDiscovery");
    expect(pagina).toContain("renderCampoRoteiro");
  });

  it("bloco 5 — síntese de Discovery: novo bloco usando sinaisQualidadeLead (mesmo cálculo de /leads)", () => {
    expect(pagina).toContain('titulo="Síntese de Discovery"');
    expect(pagina).toContain("sinaisQualidadeLead(lead");
    const inicio = pagina.indexOf('titulo="Síntese de Discovery"');
    const trecho = pagina.slice(inicio, inicio + 500);
    expect(trecho).toContain("sinaisQualidade");
  });

  it("bloco 6 — decisão e handoff: renomeado, com resumo de próxima ação/prazo/responsável", () => {
    expect(pagina).toContain('titulo="Decisão e handoff"');
    const inicio = pagina.indexOf('titulo="Decisão e handoff"');
    const trecho = pagina.slice(inicio, inicio + 1800);
    expect(trecho).toContain("Próxima ação:");
    expect(trecho).toContain("Responsável:");
  });

  it("bloco 7 — histórico (TrilhaDoLead) continua intacto", () => {
    expect(pagina).toContain("<TrilhaDoLead");
  });
});

describe("Fase 4 — nenhum writer novo, /leads não perdeu campo nem ganhou escritor", () => {
  const painelCalls = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
  const leads = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

  it("painel-calls continua usando só o writer existente (salvarLeadDesk / mutar)", () => {
    expect(painelCalls).toContain("salvar(");
    expect(painelCalls).not.toContain("salvarLeadDeskNovo");
  });

  it("sinaisQualidadeLead continua importado e calculado em /leads (não removido de lá)", () => {
    expect(leads).toContain("sinaisQualidadeLead");
  });
});
