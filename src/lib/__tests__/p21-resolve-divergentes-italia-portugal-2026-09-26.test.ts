import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P21 (26/09/2026) — a Proprietária confirmou os valores vencedores das
// divergências de honorários-base (Itália R$4.700, Portugal R$4.800) já
// apontados na tabela do P20. Resolve as 6 linhas DIVERGENTE de
// price_catalog_rescued sem apagar nenhuma (arquivadas, rastreáveis).
const migracao = readFileSync(
  "supabase/migrations/20260926170000_resolve_divergentes_italia_portugal_price_catalog.sql",
  "utf8",
);

describe("P21 — promove a referência vencedora, nunca escolhe automaticamente", () => {
  it("promove só os 2 ids específicos (IT 4700, PT 4800) para HOMOLOGADO_CATALOGO", () => {
    expect(migracao).toContain("2cbb2828-33d0-430a-8a21-ffff23db40d4");
    expect(migracao).toContain("1f392d2e-626f-4a6e-b8dd-8d423868873a");
    const ocorrencias = migracao.match(/set price_status = 'HOMOLOGADO_CATALOGO'/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });

  it("nota registra que a decisão veio explicitamente da Proprietária", () => {
    expect(migracao).toContain("decisão explícita da Proprietária");
  });
});

describe("P21 — arquiva as alternativas perdedoras, nunca usa DELETE", () => {
  it("arquiva exatamente os 6 ids perdedores/duplicados com archived_at e archive_motivo", () => {
    const idsPerdedores = [
      "7df50c2b-0db6-4098-a6e0-7b53c64b8557",
      "75cecaad-757f-423b-9c46-036d8bbe5613",
      "fc7318d8-a12f-4fc5-8c18-303dd6a97ac4",
      "5cb15e2b-c931-4c26-b8e1-c975a41e62e1",
      "489485fd-ded1-41bd-8732-61716c9d5e9a",
      "41d29af0-b92d-4854-a373-7540dd6093f3",
    ];
    for (const id of idsPerdedores) {
      expect(migracao).toContain(id);
    }
    expect(migracao).toContain("archived_at = coalesce(archived_at, now())");
  });

  it("nunca usa DELETE", () => {
    expect(migracao).not.toMatch(/delete\s+from/i);
  });

  it("é idempotente (guarda de status/archived_at em cada UPDATE)", () => {
    expect(migracao).toContain("and price_status <> 'HOMOLOGADO_CATALOGO'");
    expect(migracao).toContain("and archived_at is null");
  });
});
