import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P13 (25/09/2026): revisão do "Prompt Canônico — Planejador Universal
// Multipaís/Produtos-Pai/Preços Resgatados" pedida pela Proprietária.
// Achado: quase todo o documento já estava executado nesta base (9
// produtos-pai canônicos, price_catalog_rescued com os mesmos valores/
// divergências/pendências descritos, 30 itens ESPECIFICACAO_PENDENTE por
// país, os 6 CA-GEN-MULTI, CA-CURSO-001 arquivado). O único gap real e
// verificado: `planner_catalog_feed.legacy_aliases` existia como coluna mas
// estava vazia em toda a tabela — a regra "preservar identificadores
// antigos como alias legado" nunca tinha sido cumprida para os PACOTE-*/
// NAT-BR-01.
const migracao = readFileSync(
  "supabase/migrations/20260925200000_planner_catalog_feed_legacy_aliases_pacotes.sql",
  "utf8",
);

describe("P13 — PACOTE-*/NAT-BR-01 preservados como legacy_aliases, nunca como taxonomia nova", () => {
  it("mapeia os 8 códigos legados exatamente como o DICIONARIO_DE_SKUS.csv já documentava (nenhum inventado)", () => {
    const pares: [string, string][] = [
      ["CA-CID-HR-001", "PACOTE-CROACIA-01"],
      ["CA-CID-PT-001", "PACOTE-PT-01"],
      ["CA-CID-ES-001", "PACOTE-ES-01"],
      ["CA-CID-DE-001", "PACOTE-DE-01"],
      ["CA-CID-PL-001", "PACOTE-PL-01"],
      ["CA-CID-RO-001", "PACOTE-RO-01"],
      ["CA-NAT-FR-001", "PACOTE-FR-01"],
      ["CA-NAT-BR-001", "NAT-BR-01"],
    ];
    for (const [itemId, alias] of pares) {
      expect(migracao).toContain(`('${itemId}', '${alias}')`);
    }
  });

  it("não atribui alias a PACOTE-EU-01 (Europa geral já é referência sem item_id, por desenho) nem inventa PACOTE-AT-*", () => {
    const corpo = migracao.slice(migracao.indexOf("update public.planner_catalog_feed"));
    expect(corpo).not.toContain("PACOTE-EU-01");
    expect(corpo).not.toMatch(/PACOTE-AT-/);
  });

  it("é uma escrita idempotente (guarda contra reaplicação) — nunca um DELETE/DROP", () => {
    expect(migracao).toContain("not (coalesce(");
    expect(migracao).not.toMatch(/drop table|delete from/i);
  });

  it("não cria taxonomia PACOTE-* nova — só grava dentro do array de aliases de um item_id já existente", () => {
    expect(migracao).not.toMatch(/insert into public\.planner_catalog_feed/i);
    expect(migracao).toContain("update public.planner_catalog_feed");
  });
});
