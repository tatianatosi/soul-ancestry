import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P16 (26/09/2026) — autorização explícita: os 36 itens ESPECIFICACAO_PENDENTE
// (30 códigos CA-CID-XX-00N/CA-NAT-XX-00N do P9/P13 + 6 CA-GEN-MULTI do P6)
// saem do estado pendente porque a Proprietária confirmou que serão usados;
// os 4 países bálticos/Países Baixos (dedup'ados/adicionados no P12) entram
// no planejador/produtos-pai com o mesmo tratamento.
const migracao = readFileSync(
  "supabase/migrations/20260926120000_promove_pendentes_e_baltico_no_planejador.sql",
  "utf8",
);

describe("P16 — promoção dos 36 pendentes, sem fabricar preço homologado", () => {
  it("promove ESPECIFICACAO_PENDENTE para ATIVO_SEM_PRECO_HOMOLOGADO — mesmo estado já usado para os itens reais da Alemanha", () => {
    expect(migracao).toContain("set status_dictionary = 'ATIVO_SEM_PRECO_HOMOLOGADO'");
    expect(migracao).toContain("where status_dictionary = 'ESPECIFICACAO_PENDENTE'");
  });

  it("nunca promove para ATIVO_HOMOLOGADO nem grava preço/link — nenhuma decisão comercial fabricada", () => {
    const parte1 = migracao.slice(0, migracao.indexOf("Parte 2"));
    expect(parte1).not.toContain("ATIVO_HOMOLOGADO'");
    expect(parte1).not.toMatch(/price_status\s*=/);
  });
});

describe("P16 — Bálticos/Países Baixos trazidos ao planejador/produtos-pai, Bélgica fora", () => {
  it("cria exatamente 12 itens (3 fases × 4 países) para NL/EE/LV/LT", () => {
    for (const code of [
      "CA-CID-NL-001", "CA-CID-NL-002", "CA-CID-NL-003",
      "CA-CID-EE-001", "CA-CID-EE-002", "CA-CID-EE-003",
      "CA-CID-LV-001", "CA-CID-LV-002", "CA-CID-LV-003",
      "CA-CID-LT-001", "CA-CID-LT-002", "CA-CID-LT-003",
    ]) {
      expect(migracao).toContain(code);
    }
  });

  it("não traz Bélgica — decisão do P12 (detection_only) não revista aqui", () => {
    expect(migracao).not.toMatch(/CA-CID-BE-/);
  });

  it("os novos itens já nascem ATIVO_SEM_PRECO_HOMOLOGADO, mesmo tratamento dos 36 promovidos", () => {
    const parte2 = migracao.slice(migracao.indexOf("Parte 2"));
    expect(parte2).toContain("'ATIVO_SEM_PRECO_HOMOLOGADO'");
  });

  it("é idempotente (where not exists) — nunca duplica item já existente", () => {
    const parte2 = migracao.slice(migracao.indexOf("Parte 2"));
    expect(parte2).toContain("where not exists");
  });
});
