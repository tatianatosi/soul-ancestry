import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * R3 (autorização explícita da Proprietária, 2026-09-23): /calls vira a
 * única superfície editável de call, Discovery, triagem e elegibilidade
 * preliminar. /leads tinha o único writer destes campos, mas nunca era a
 * tela usada durante a call — mesmo defeito já corrigido para SPIN em
 * 09/09/2026. Nenhum campo é apagado: o formulário de edição muda de
 * tela, o dado e o histórico em `leads` continuam os mesmos.
 */

const leads = readFileSync(resolve(__dirname, "../../routes/_authenticated/leads.tsx"), "utf8");
const calls = readFileSync(resolve(__dirname, "../../components/crm/painel-calls.tsx"), "utf8");

describe("R3 · /leads não edita mais call_agendada_em, discovery_resultado, elegibilidade_preliminar", () => {
  it("nenhum onChange={set(...)} para os três campos em leads.tsx", () => {
    expect(leads).not.toMatch(/onChange=\{set\("call_agendada_em"\)\}/);
    expect(leads).not.toMatch(/onChange=\{set\("discovery_resultado"\)\}/);
    expect(leads).not.toMatch(/onChange=\{set\("elegibilidade_preliminar"\)\}/);
  });

  it("os três campos aparecem só como leitura (via rotulo/valor direto), nunca em <Selecao>/<Texto> editável", () => {
    expect(leads).not.toMatch(/<Selecao[^>]*elegibilidade_preliminar/);
    expect(leads).not.toMatch(/<Texto[^>]*call_agendada_em/);
    expect(leads).not.toMatch(/<Selecao[^>]*discovery_resultado/);
  });

  it("aponta para /calls com link claro", () => {
    const idx = leads.indexOf("Discovery e triagem preliminar");
    const trecho = leads.slice(idx, idx + 1500);
    expect(trecho).toMatch(/to="\/calls"/);
  });

  it("nenhum campo de triagem some do código — os 14 campos originais ainda aparecem em algum lugar do arquivo (leitura aqui, edição em /calls)", () => {
    for (const campo of [
      "status_call",
      "discovery_resultado",
      "call_agendada_em",
      "elegibilidade_preliminar",
    ]) {
      expect(leads).toContain(campo);
    }
  });
});

describe("R3 · /calls edita todos os campos de Discovery e Triagem preliminar", () => {
  it("call_agendada_em, discovery_resultado e elegibilidade_preliminar têm onChange={set(...)} em painel-calls.tsx", () => {
    expect(calls).toMatch(/onChange=\{set\("call_agendada_em"\)\}/);
    expect(calls).toMatch(/onChange=\{set\("discovery_resultado"\)\}/);
    expect(calls).toMatch(/onChange=\{set\("elegibilidade_preliminar"\)\}/);
  });

  it("os 11 campos de triagem que só existiam em /leads agora têm writer em /calls", () => {
    const idx = calls.indexOf('titulo="Triagem preliminar (Discovery)"');
    expect(idx).toBeGreaterThan(-1);
    const trecho = calls.slice(idx, idx + 3000);
    for (const campo of [
      "confianca_triagem",
      "geracao_ascendente",
      "linha_transmissao",
      "risco_ruptura",
      "complexidade_documental",
      "estado_documental_inicial",
      "pendencia_documental_prioritaria",
      "exige_idioma_entrevista",
      "requerentes_potenciais",
      "estrutura_familiar",
      "objecao_predominante",
      "nivel_intencao",
    ]) {
      expect(trecho).toContain(`set("${campo}")`);
    }
  });
});
