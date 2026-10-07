import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * 07/10/2026 — "segue com os mesmos problemas do planejador universal e
 * sku": medido no banco. O dicionário TypeScript (parametros-dicionario.ts)
 * já tratava produto_sku como opcional desde o Corte A (06/10) — mas o
 * cálculo real de completude/pendências do contrato nunca lia esse
 * dicionário. Ele lê `contract_parameter_definicoes()`, uma função SQL
 * separada e nunca sincronizada, que ainda marcava produto_sku como
 * obrigatorio=true. Medido no caso real da Ana: completude 91% com
 * produto_sku "vazio" bloqueando, CAT_PRODUTO_SKU com uma única opção
 * fabricada que não corresponde a nenhum SKU real nem ao produto-pai PP-03
 * do caso (case_plans.produto_pai_id). Corrigido via migration; verificado
 * ao vivo: completude sobe para 95%, produto_sku sai da lista de
 * pendências, resta só ancestral_referencia (decisão humana genuína —
 * qual ancestral ancora a reparação histórica austríaca —, não um bug).
 */
const migracao = readFileSync(
  "supabase/migrations/20261007150000_contract_parameter_sku_nao_obrigatorio.sql",
  "utf8",
);

describe("contract_parameter_definicoes() — produto_sku deixa de ser obrigatorio", () => {
  it("a definição canônica marca produto_sku como obrigatorio=false", () => {
    expect(migracao).toContain("('objeto','produto_sku','Produto / SKU contratado',false,20)");
  });

  it("os demais campos já opcionais continuam opcionais (8) + produto_sku agora (9 no total)", () => {
    const bloco = migracao.slice(migracao.indexOf("SELECT * FROM"), migracao.indexOf("AS t(grupo"));
    const ocorrenciasFalse = bloco.match(/,false,\d+\)/g) ?? [];
    expect(ocorrenciasFalse.length).toBe(9);
  });

  it("reconcilia linhas já existentes (contract_parameter_values.obrigatorio) sem tocar valor/status/origem", () => {
    expect(migracao).toContain("UPDATE public.contract_parameter_values v");
    expect(migracao).toContain("SET obrigatorio = d.obrigatorio");
    expect(migracao).not.toMatch(/SET[^;]*\b(valor|status|origem)\s*=/i);
  });

  it("nunca usa DELETE — reconciliação é sempre UPDATE aditivo", () => {
    expect(migracao).not.toMatch(/delete\s+from/i);
  });
});
