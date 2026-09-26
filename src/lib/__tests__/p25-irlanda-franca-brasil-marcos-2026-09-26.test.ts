import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P25 (26/09/2026) — a verificação confirmou Irlanda e França genuinamente
// ausentes de citizenship_tracks/versioned_legal_rules/legal_reference_milestones,
// e Brasil com trilha mas sem regra/marco. Mesmo padrão conservador do P17
// (Bélgica): "Marco oficial a homologar", nenhuma fonte específica inventada.
const migracao = readFileSync(
  "supabase/migrations/20260926180000_irlanda_franca_tracks_e_marco_brasil.sql",
  "utf8",
);

describe("P25 — trilhas novas de Irlanda e França, conteúdo fino (nenhuma fonte fabricada)", () => {
  it("cria TRK-IE-DESC e TRK-FR-NATURALIZACAO com marco a homologar, nunca afirmando fonte legal específica", () => {
    expect(migracao).toContain("TRK-IE-DESC");
    expect(migracao).toContain("TRK-FR-NATURALIZACAO");
    const ocorrencias = migracao.match(/'Marco oficial a homologar'/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(2);
    expect(migracao).toContain("Não ofertar como rota concluída sem revisão jurídica.");
  });

  it("é idempotente (not exists) para as 2 trilhas novas", () => {
    const parte1e2 = migracao.slice(0, migracao.indexOf("Parte 3"));
    const ocorrencias = parte1e2.match(/not exists/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(2);
  });
});

describe("P25 — regra e marco jurídico para Brasil, Irlanda e França", () => {
  it("liga versioned_legal_rules e legal_reference_milestones às 3 trilhas (Brasil já existia sem regra/marco)", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"));
    expect(parte3).toContain("TRILHA_BRASIL_NATURALIZACAO");
    expect(parte3).toContain("TRK-IE-DESC");
    expect(parte3).toContain("TRK-FR-NATURALIZACAO");
    expect(parte3).toContain("insert into public.versioned_legal_rules");
    expect(parte3).toContain("insert into public.legal_reference_milestones");
  });

  it("nunca inventa citação de lei específica para Irlanda/França/Brasil", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"));
    expect(parte3).toContain("Marco oficial a homologar — sem citação confirmada");
    expect(parte3).not.toMatch(/Lei n[ºo°]/);
  });
});
