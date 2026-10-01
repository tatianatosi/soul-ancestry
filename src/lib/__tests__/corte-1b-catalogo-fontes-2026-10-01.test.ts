import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ESTAGIOS, MODOS_USO, NIVEIS_FONTE, STATUS_DOCUMENTACAO } from "@/lib/fontes-genealogicas";

/**
 * Corte 1b (01/10/2026) — o catálogo de fontes deixou de ser documento e virou
 * dado. Só as 4 fontes que o Bloco 5A documenta; a 5ª e a ordem de prioridade
 * seguem pendentes de decisão (D-04) e NÃO foram inventadas.
 */
const sql = readFileSync(
  "supabase/migrations/20261001160000_catalogo_fontes_bloco_5a_quatro_documentadas.sql",
  "utf8",
);

describe("semente do catálogo: só o documentado", () => {
  it("grava exatamente as 4 fontes do Bloco 5A, nenhuma a mais", () => {
    for (const nome of [
      "Cartórios brasileiros",
      "Arquivo ou registro civil brasileiro aplicável",
      "Portale Antenati",
      "Comune, arquivo distrital, paróquia ou arquivo local italiano aplicável",
    ])
      expect(sql, nome).toContain(nome);
    // 4 tuplas na VALUES — uma por fonte.
    expect((sql.match(/11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid/g) ?? []).length).toBe(4);
  });

  it("usa o de-para M1/M2 do documento, com vocabulário real do CHECK", () => {
    expect(sql).toContain("'primaria'");
    expect(sql).toContain("'institucional'");
    expect(sql).toContain("'indice'");
    expect(sql).toContain("'manual'");
    expect(sql).toContain("'metadados_linkout'");
    for (const v of ["primaria", "institucional", "indice"]) expect(NIVEIS_FONTE).toHaveProperty(v);
    for (const v of ["manual", "metadados_linkout"]) expect(MODOS_USO).toHaveProperty(v);
  });

  it("nenhuma fonte entra homologada — D-04 ainda não decidiu", () => {
    expect(sql).toContain("'CATALOGADA'");
    expect(sql).toContain("'termos_a_confirmar'");
    expect(ESTAGIOS).toHaveProperty("CATALOGADA");
    expect(STATUS_DOCUMENTACAO).toHaveProperty("termos_a_confirmar");
    for (const proibido of ["HOMOLOGADA_MANUAL", "HOMOLOGADA_API", "ELEGIVEL_PARA_PILOTO"])
      expect(sql, proibido).not.toContain(proibido);
  });

  it("não ranqueia: prioridade fica no default, porque ordenar seria fabricar a decisão", () => {
    // O que importa é a lista de colunas do INSERT: `prioridade` não está lá,
    // então as 4 ficam no default do banco. A palavra aparece só no comentário
    // que explica por que não foi atribuída.
    const colunas = sql.slice(sql.indexOf("INSERT INTO"), sql.indexOf("SELECT v."));
    expect(colunas).not.toContain("prioridade");
    expect(sql).toContain("D-04 pendente");
  });

  it("não inventa URL nem a 5ª fonte", () => {
    expect(sql).not.toMatch(/https?:\/\//);
    expect(sql.toLowerCase()).not.toContain("familysearch");
    expect(sql.toLowerCase()).not.toContain("ancestry");
  });

  it("é idempotente e só toca a organização real", () => {
    expect(sql).toContain("WHERE NOT EXISTS");
    expect(sql).toContain("g.organization_id = v.organization_id AND g.nome = v.nome");
  });
});
