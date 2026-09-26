import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P20 (26/09/2026) — a Proprietária colou de novo o Prompt Canônico do
// Planejador Universal Multipaís/Preços Resgatados, pedindo revisão e
// execução da fórmula de cálculo. Verificação item a item confirmou que
// price_catalog_rescued já tinha honorários/despesas/taxas de todos os 10
// países batendo exatamente — só faltava a contagem de parcelas.
const migracao = readFileSync(
  "supabase/migrations/20260926160000_price_catalog_rescued_parcelas_padrao.sql",
  "utf8",
);

describe("P20 — parcelas_padrao adicionadas só onde faltava, nenhum valor já existente tocado", () => {
  it("insere exatamente os 10 países com o número de parcelas do prompt canônico", () => {
    const pares: Array<[string, number]> = [
      ["IT", 6], ["HR", 4], ["PT", 10], ["ES", 5], ["DE", 6],
      ["PL", 6], ["RO", 6], ["AT", 10], ["BR", 3], ["FR", 3],
    ];
    for (const [pais, parcelas] of pares) {
      expect(migracao).toContain(`('${pais}', ${parcelas})`);
    }
  });

  it("usa price_component='parcelas_padrao' — valor já previsto no CHECK real, não vocabulário novo", () => {
    expect(migracao).toContain("'parcelas_padrao'");
  });

  it("é idempotente (where not exists) e não faz nenhum UPDATE em linha existente", () => {
    expect(migracao).toContain("where not exists");
    expect(migracao).not.toMatch(/^\s*update\s/im);
  });

  it("nota deixa claro que é referência, não regra de cobrança automática", () => {
    expect(migracao).toContain("não regra de cobrança automática");
  });
});
