import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * CRM Vivo & Discovery Calls V4 (Proprietária, 14/10/2026): depois do
 * merge do Comercial & Funil (/leads, PR #157), autorização explícita para
 * aplicar o mesmo padrão de prancha em /calls — 4 KPIs de atendimento,
 * Agenda de Discovery do Dia em grid aberto (sem <details>), roteiro SPIN
 * & Diagnóstico exposto em 4 blocos reais (S/P/I/N), Consentimento &
 * Gravação, mais o handoff real que já existe dentro de PainelCalls.
 * Segunda rodada (14/10/2026, "ESPECIFICAÇÃO DE UI CANÔNICA"): grade virou
 * grid de cards com "via preliminar" (via_juridica_preliminar, real,
 * rótulo já marca "hipótese... pendente de validação humana" — nunca
 * tratada como rota confirmada), e o roteiro SPIN passou de barras de
 * progresso soltas para 4 blocos com os campos reais do lead
 * (ROTULO_CAMPO_ROTEIRO), nunca texto fixo por bloco. Todos os blocos
 * leem leads reais (listarLeadsDesk, mesma queryKey "leads-desk" do
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

describe("Calls V4 — Agenda de Discovery do Dia (grid aberto, sem <details>)", () => {
  it("o grid lista horário, lead, canal, via preliminar e status reais, sem wrapper <details>/<summary>", () => {
    expect(rota).toContain("Agenda de Discovery do Dia");
    expect(rota).toContain("horarioCall(l.call_agendada_em)");
    expect(rota).toContain("<Pessoa nome={l.nome}");
    expect(rota).toMatch(/rotulo\("origem", l\.origem\)/);
    expect(rota).toContain("estadoCall(l)");
    expect(rota).toContain('rotulo("via_juridica_preliminar", l.via_juridica_preliminar)');
    expect(rota).not.toContain("<details");
    expect(rota).not.toContain("<summary");
  });

  it("filtra pelo dia real (mesmoDia/hojeStr), não lista fixa — e clicar num card seleciona o lead via ?lead=", () => {
    expect(rota).toContain("function mesmoDia(");
    expect(rota).toContain("agendaDoDia");
    expect(rota).toContain('search={{ lead: l.id }}');
    expect(rota).toContain("validateSearch");
  });
});

describe("Calls V4 — Roteiro SPIN & Diagnóstico: 4 blocos reais (S/P/I/N)", () => {
  it("cada bloco mostra os campos reais do roteiro (ROTULO_CAMPO_ROTEIRO), não uma descrição fixa redigitada", () => {
    expect(rota).toContain('from "@/lib/discovery-roteiro"');
    expect(rota).toContain("perguntasDaEtapa(etapa)");
    expect(rota).toContain("ROTULO_CAMPO_ROTEIRO[campo]");
    expect(rota).toContain("progressoSpin(selecionado)");
    expect(rota).toContain("ETAPAS_SPIN.map((e) =>");
  });

  it("não existe texto fixo tipo 'Falta de certidões, divergência de nomes ou barreiras consulares' no lugar do dado real do lead", () => {
    expect(rota).not.toMatch(/divergência de nomes|barreiras consulares|risco de perda de prazo/i);
  });
});

describe("Calls V4 — Consentimento & Gravação com tom semântico real", () => {
  it("lê consentimento_status/consentimento_canal/consentimento_em/gravacao_link_interno do lead selecionado", () => {
    expect(rota).toContain("Consentimento & Gravação");
    expect(rota).toContain('rotulo("consentimento_status"');
    expect(rota).toContain('rotulo("consentimento_canal"');
    expect(rota).toContain("selecionado.consentimento_em");
    expect(rota).toContain("selecionado.gravacao_link_interno");
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

describe("Calls V4 — ComercialConectado (funil + kanban conectado) presente", () => {
  it("a Proprietária pediu a restauração deste elemento aprovado — continua importado e renderizado", () => {
    expect(rota).toContain('import { ComercialConectado } from "@/components/desk/superficies-kit-conectadas"');
    expect(rota).toContain("<ComercialConectado />");
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
