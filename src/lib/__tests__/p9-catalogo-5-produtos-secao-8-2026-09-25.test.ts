import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * P9 (25/09/2026) — 5 dos ~12 códigos da seção 8 (CA-DECISOES-CANONICAS,
 * 33 produtos-pai por jornada) genuinamente ausentes do catálogo real
 * foram criados, conservadores (em_revisao, não elegível para proposta,
 * sem preço). CA-MEM-004 foi excluído por colisão de código real
 * ("Livro da Historia Familiar") — nenhum code já em uso é reaproveitado.
 */
const migracao = readFileSync(
  "supabase/migrations/20260925150000_product_catalog_5_novos_produtos_secao_8.sql",
  "utf8",
);

describe("P9 — 5 produtos novos, conservadores, sem colisão de código", () => {
  it("insere exatamente os 5 códigos aprovados", () => {
    for (const codigo of ["CA-DIAG-003", "CA-DOC-005", "CA-PROT-002", "CA-PROT-004", "CA-MEM-006"]) {
      expect(migracao).toContain(`'${codigo}'`);
    }
  });

  it("nunca insere CA-MEM-004 (colisão com produto real já existente)", () => {
    expect(migracao).not.toContain("'CA-MEM-004'");
  });

  it("nunca insere os códigos tratados como não-comerciais ou agregadores", () => {
    for (const codigo of ["CA-DIAG-004", "CA-DOC-001", "CA-PESQ-003", "CA-DOC-004", "CA-POS-001", "CA-POS-004"]) {
      expect(migracao).not.toContain(`'${codigo}'`);
    }
  });

  it("todos os 5 novos produtos entram em_revisao e não elegíveis para proposta", () => {
    expect(migracao).toContain("'em_revisao'");
    expect(migracao).toContain("false");
    expect(migracao).not.toMatch(/status_homologacao.*'homologado'/);
  });

  it("insere de forma idempotente (guard not exists por code)", () => {
    expect(migracao).toMatch(/not exists[\s\S]*p\.code = v\.code/);
  });

  it("é aditiva: nunca faz update/delete em product_catalog", () => {
    expect(migracao).not.toMatch(/update\s+public\.product_catalog/i);
    expect(migracao).not.toMatch(/delete\s+from\s+public\.product_catalog/i);
  });
});
