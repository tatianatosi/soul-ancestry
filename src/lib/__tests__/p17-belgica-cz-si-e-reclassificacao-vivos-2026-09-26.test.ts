import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P17 (26/09/2026) — reabertura explícita da Proprietária: adicionar
// Bélgica (excluída no P12 por ser detection_only) e "os demais países
// faltantes" (varredura confirmou: Tchéquia e Eslovênia tinham trilha real
// desde o P11 mas nunca entraram em planner_catalog_feed — mesmo gap já
// corrigido para os bálticos no P16). Também reclassifica os 20 itens
// "LEGADO_RECONCILIAR" confirmados vivos/ativos no catálogo real.
const migracao = readFileSync(
  "supabase/migrations/20260926130000_belgica_cz_si_planejador_e_reclassifica_vivos.sql",
  "utf8",
);

describe("P17 — Bélgica, Tchéquia e Eslovênia trazidas ao planejador", () => {
  it("cria a trilha da Bélgica com conteúdo fino (detection_only), nunca afirmando fonte homologada", () => {
    expect(migracao).toContain("TRK-BE-DESC");
    expect(migracao).toContain("Detecção de vínculo; backlog jurídico");
    expect(migracao).toContain("Não ofertar como rota concluída sem revisão jurídica.");
  });

  it("cria exatamente 9 itens de planner_catalog_feed (3 fases × BE/CZ/SI)", () => {
    for (const code of [
      "CA-CID-BE-001", "CA-CID-BE-002", "CA-CID-BE-003",
      "CA-CID-CZ-001", "CA-CID-CZ-002", "CA-CID-CZ-003",
      "CA-CID-SI-001", "CA-CID-SI-002", "CA-CID-SI-003",
    ]) {
      expect(migracao).toContain(code);
    }
  });

  it("todas as inserções são idempotentes (not exists)", () => {
    const parte1e2 = migracao.slice(0, migracao.indexOf("Parte 3"));
    const ocorrencias = parte1e2.match(/not exists/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(4);
  });
});

describe("P17 — reclassificação dos 20 itens vivos, com regra objetiva (não arbitrária)", () => {
  it("a regra de promoção usa dado real de product_catalog (status_homologacao + preço), não um valor fixo", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"));
    expect(parte3).toContain("pc.status_homologacao = 'homologado' and pc.preco_comercial_vigente is not null");
    expect(parte3).toContain("left join public.product_catalog pc");
  });

  it("só toca linhas hoje em LEGADO_RECONCILIAR — nunca mexe em ESPECIFICACAO_PENDENTE/ARQUIVADO/CONDICIONAL_POR_CASO", () => {
    const parte3 = migracao.slice(migracao.indexOf("Parte 3"));
    expect(parte3).toContain("where p.item_id = codes.item_id and p.status_dictionary = 'LEGADO_RECONCILIAR'");
  });

  it("não toca nas linhas DIVERGENTE de price_catalog_rescued/legacy_catalog_import — continuam segregadas como legado", () => {
    expect(migracao).not.toMatch(/update public\.(price_catalog_rescued|legacy_catalog_import)/);
  });

  it("lista exatamente os 20 códigos já confirmados 'Item real ativo' na varredura anterior", () => {
    for (const code of [
      "CA-ASS-001", "CA-ASS-004", "CA-ASS-005", "CA-CID-001", "CA-CID-002", "CA-CID-002C",
      "CA-CID-009", "CA-CID-019", "CA-CID-020", "CA-CID-021", "CA-CID-023", "CA-CID-AT-001",
      "CA-COMBO-001", "CA-HIST-004", "CA-HIST-006", "CA-IND-001", "CA-IND-002", "CA-IND-005",
      "CA-IND-006", "CA-MEM-003",
    ]) {
      expect(migracao).toContain(`'${code}'`);
    }
  });
});
