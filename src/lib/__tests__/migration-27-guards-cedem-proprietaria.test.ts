import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado (23/09/2026): a migration 20260905210000_guards_cerimonia_cedem_a_proprietaria.sql
 * só contém o helper fn_proprietaria_operando() — as 27 funções de guarda que o
 * comentário original descreve alterar nunca foram capturadas em arquivo
 * versionado. Confirmado direto no banco real (Lovable): nenhuma das 27 cedia
 * à proprietária. Esta migration nova (20260923180000) reconstrói as 27, lidas
 * do corpo real de cada função no banco antes de escrever o arquivo — nunca
 * reconstruídas de memória.
 */

const migration = readFileSync(
  "supabase/migrations/20260923180000_reconstroi_27_guards_cedem_a_proprietaria.sql",
  "utf8",
);

const GUARDS_27 = [
  "fn_artifact_guard",
  "fn_atendimento_solicitacao_guard",
  "fn_case_dependent_guard",
  "fn_case_service_promocao_guard",
  "fn_caso_ativacao_gates_guard",
  "fn_caso_ativo_guard",
  "fn_decisao_guard",
  "fn_evidence_guard",
  "fn_finding_projecao_guard",
  "fn_g02_evento_guard",
  "fn_g02_modulo_guard",
  "fn_g02_variante_guard",
  "fn_guard_consentimento_ativacao",
  "fn_guard_pesquisa_externa",
  "fn_lead_desk_guard",
  "fn_lead_dossie_guard",
  "fn_legal_clause_guard",
  "fn_legal_matrix_guard",
  "fn_nucleo_dossie_guard",
  "fn_piloto_contrato_guard",
  "fn_quality_guard_ativacao",
  "fn_research_case_estado_guard",
  "fn_rg_evento_guard",
  "fn_rg_relatorio_guard",
  "fn_rg_resumo_cliente_guard",
  "fn_sku_price_exception_guard",
  "fn_third_party_expense_guard",
];

describe("migration 20260923180000 — as 27 funções cedem à proprietária", () => {
  it("define exatamente as 27 funções esperadas", () => {
    for (const nome of GUARDS_27) {
      expect(migration).toContain(`CREATE OR REPLACE FUNCTION public.${nome}()`);
    }
  });

  it("cada função contém a cláusula de cessão documentada", () => {
    const trechoPorFuncao = migration.split(/CREATE OR REPLACE FUNCTION public\./).slice(1);
    expect(trechoPorFuncao.length).toBe(GUARDS_27.length);
    for (const trecho of trechoPorFuncao) {
      expect(trecho).toContain("public.fn_proprietaria_operando()");
    }
  });

  it("fn_legal_matrix_guard mantém o bloqueio de exclusão física ANTES da cessão — nunca permite exclusão, nem para a proprietária", () => {
    const trecho = migration.slice(
      migration.indexOf("CREATE OR REPLACE FUNCTION public.fn_legal_matrix_guard"),
      migration.indexOf("CREATE OR REPLACE FUNCTION public.fn_nucleo_dossie_guard"),
    );
    const posicaoBloqueioDelete = trecho.indexOf("Exclusão física não permitida");
    const posicaoCessao = trecho.indexOf("fn_proprietaria_operando()");
    expect(posicaoBloqueioDelete).toBeGreaterThan(-1);
    expect(posicaoCessao).toBeGreaterThan(-1);
    expect(posicaoBloqueioDelete).toBeLessThan(posicaoCessao);
  });

  it("Proprietária × usuário comum: em cada função, a cessão vem ANTES das validações originais — usuário comum continua barrado por elas, proprietária retorna antes de alcançá-las", () => {
    const trechoPorFuncao = migration.split(/CREATE OR REPLACE FUNCTION public\./).slice(1);
    for (const trecho of trechoPorFuncao) {
      const posicaoCessao = trecho.indexOf("fn_proprietaria_operando()");
      const posicaoPrimeiraExcecao = trecho.search(/RAISE EXCEPTION/i);
      expect(posicaoCessao).toBeGreaterThan(-1);
      // fn_legal_matrix_guard tem uma RAISE EXCEPTION de bloqueio de exclusão
      // física ANTES da cessão (deliberado); todas as outras 26 têm a cessão
      // antes de qualquer RAISE EXCEPTION de validação normal.
      if (trecho.startsWith("fn_legal_matrix_guard")) {
        expect(posicaoPrimeiraExcecao).toBeLessThan(posicaoCessao);
      } else if (posicaoPrimeiraExcecao !== -1) {
        expect(posicaoCessao).toBeLessThan(posicaoPrimeiraExcecao);
      }
    }
  });
});
