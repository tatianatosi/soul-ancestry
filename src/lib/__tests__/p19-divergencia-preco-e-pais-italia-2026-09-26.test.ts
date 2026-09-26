import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P19 (26/09/2026) — decisão explícita da Proprietária sobre as 2
// divergências de preço deixadas em aberto pelo P18 ("Ca Cid 006 vira 249 e
// cá mem vira 197") + confirmação de país (Itália) para CA-CID-002A/B/C/D.
const migracao = readFileSync(
  "supabase/migrations/20260926150000_resolve_divergencia_preco_e_pais_italia_002x.sql",
  "utf8",
);

describe("P19 — divergências de preço resolvidas só por decisão explícita da Proprietária", () => {
  it("grava o preço vigente = preço sugerido só para os 2 códigos confirmados, comparando com o valor divergente", () => {
    const parte1 = migracao.slice(0, migracao.indexOf("Parte 2"));
    expect(parte1).toContain("preco_comercial_vigente = preco_sugerido_fonte");
    expect(parte1).toContain("code in ('CA-CID-006', 'CA-MEM-003')");
    expect(parte1).toContain("and preco_comercial_vigente <> preco_sugerido_fonte");
  });

  it("promoção de planner_catalog_feed continua data-driven (join), não lista fixa", () => {
    const parte2 = migracao.slice(migracao.indexOf("Parte 2"), migracao.indexOf("Parte 3"));
    expect(parte2).toContain("pc.elegivel_para_proposta = true");
    expect(parte2).toContain("and p.status_dictionary = 'ATIVO_SEM_PRECO_HOMOLOGADO'");
  });

  it("CA-CID-006 continua CONDICIONAL_POR_CASO — preço resolvido não muda o eixo de aplicabilidade", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"), migracao.indexOf("Parte 4"));
    expect(parte3).toContain("item_id = 'CA-CID-006'");
    expect(parte3).not.toContain("status_dictionary =");
  });
});

describe("P19 — família CA-CID-002x confirmada como Itália, fase preservada", () => {
  it("preenche country_scope=['IT'] só para os 5 códigos confirmados, só quando estava vazio", () => {
    const parte4 = migracao.slice(migracao.indexOf("Parte 4"));
    expect(parte4).toContain("country_scope = array['IT']");
    for (const code of ["CA-CID-002", "CA-CID-002A", "CA-CID-002B", "CA-CID-002C", "CA-CID-002D"]) {
      expect(parte4).toContain(`'${code}'`);
    }
    expect(parte4).toContain("and country_scope = '{}'");
  });

  it("não altera journey_phase_default — fase F2 já estava correta, não é tocada nesta migration", () => {
    expect(migracao).not.toContain("journey_phase_default =");
  });
});
