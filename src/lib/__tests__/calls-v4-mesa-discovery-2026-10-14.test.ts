import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * CRM Vivo & Discovery Calls V4 (Proprietária, 14/10/2026): depois do
 * merge do Comercial & Funil (/leads, PR #157), autorização explícita para
 * aplicar o mesmo padrão de prancha em /calls — 4 KPIs de atendimento,
 * grade de reuniões sem <details>, roteiro SPIN exposto e consentimento,
 * mais o handoff real que já existe dentro de PainelCalls. Todos os blocos
 * novos leem leads reais (listarLeadsDesk, mesma queryKey "leads-desk" do
 * PainelCalls) — nenhuma call, lead ou taxa de exemplo.
 */
const rota = readFileSync("src/routes/_authenticated/calls.tsx", "utf8");
const painel = readFileSync("src/components/crm/painel-calls.tsx", "utf8");

describe("Calls V4 — 4 KPIs de atendimento, sobre dado real", () => {
  it("Calls Agendadas, Realizadas, No-Show e Taxa de Qualificação vêm de campos reais do lead", () => {
    expect(rota).toContain("Calls Agendadas");
    expect(rota).toContain("Realizadas");
    expect(rota).toContain("No-Show");
    expect(rota).toContain("Taxa de Qualificação");
    expect(rota).toContain("l.call_agendada_em");
    expect(rota).toContain("l.call_realizada_em");
    expect(rota).toContain('l.discovery_resultado === "no_show"');
    expect(rota).toContain('"aderente", "aderente_com_ressalva"');
  });

  it("nenhum KPI usa número fixo ou meta inventada", () => {
    expect(rota).not.toMatch(/metaComercial|meta_comercial|meta_mensal|metaMensal/i);
  });
});

describe("Calls V4 — Grade de reuniões aberta (sem <details>)", () => {
  it("a grade lista horário, lead, canal e status reais, sem wrapper <details>/<summary>", () => {
    expect(rota).toContain("Grade de reuniões");
    expect(rota).toContain("horarioCall(l.call_agendada_em)");
    expect(rota).toContain("<Pessoa nome={l.nome}");
    expect(rota).toMatch(/rotulo\("origem", l\.origem\)/);
    expect(rota).toContain("estadoCall(l)");
    expect(rota).not.toContain("<details");
    expect(rota).not.toContain("<summary");
  });

  it("clicar numa reunião seleciona o lead via search param real (?lead=), mesmo padrão do deep-link do Hoje", () => {
    expect(rota).toContain('search={{ lead: l.id }}');
    expect(rota).toContain("validateSearch");
  });
});

describe("Calls V4 — Roteiro SPIN exposto diretamente na tela", () => {
  it("usa ETAPAS_SPIN/progressoSpin reais (discovery-roteiro.ts), não uma lista redigitada", () => {
    expect(rota).toContain('from "@/lib/discovery-roteiro"');
    expect(rota).toContain("progressoSpin(selecionado)");
    expect(rota).toContain("ETAPAS_SPIN.map((e) => e.paraQue)");
  });
});

describe("Calls V4 — Consentimento com tom semântico real", () => {
  it("lê consentimento_status/consentimento_canal/consentimento_em do lead selecionado via rotulo()", () => {
    expect(rota).toContain('rotulo("consentimento_status"');
    expect(rota).toContain('rotulo("consentimento_canal"');
    expect(rota).toContain("selecionado.consentimento_em");
  });
});

describe("Calls V4 — Handoff rápido aponta para o handoff real já existente", () => {
  it('botão "Handoff" é âncora real para a seção de handoff dentro de PainelCalls, nenhum botão decorativo novo', () => {
    expect(rota).toContain('href="#calls-handoff"');
    expect(painel).toContain('id="calls-handoff"');
  });

  it("PainelCalls continua a única superfície que executa o handoff (executarHandoffDiscovery)", () => {
    expect(painel).toContain("executarHandoffDiscovery");
    expect(rota).not.toContain("executarHandoffDiscovery");
  });
});

describe("Calls V4 — recusa consistente de dado fictício", () => {
  it("nenhuma call, lead ou taxa de exemplo no arquivo da rota", () => {
    expect(rota).not.toMatch(/"Alta"|"Boa"|"Média"/);
    expect(rota).not.toMatch(/\b58\b|\b31\b|\b18\b/);
  });

  it("todos os blocos novos leem a mesma queryKey \"leads-desk\" que PainelCalls (cache compartilhado, não busca dupla)", () => {
    expect(rota).toContain('queryKey: ["leads-desk"]');
    expect(painel).toContain('queryKey: ["leads-desk"]');
  });
});
