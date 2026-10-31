import { describe, expect, it } from "vitest";

import {
  ROTULO_CATEGORIA_ESCOPO,
  ROTULO_ESCOPO_EXCECAO,
  ROTULO_ORIGEM_ESCOPO,
  ROTULO_SEVERIDADE_VALIDACAO,
  ROTULO_SITUACAO_VALIDACAO,
  ROTULO_STATUS_ESCOPO,
} from "@/components/contratos/rotulos";

/**
 * 26/10/2026 — a Proprietária pediu, desde o início do projeto, tudo em
 * português do Brasil. Cinco posições da tela do instrumento contratual
 * (Desk → Contratos) exibiam o valor cru do banco, em inglês, para a
 * operadora ler: `included`/`excluded` em "Status", `annex`/`case` em
 * "Origem", `blocking`/`high` em "Severidade", `open`/`passed` em "Situação"
 * e `financial_gate` nas exceções. O dicionário já existia para a coluna
 * "Categoria", vizinha, na mesma linha de tabela — só não tinha sido aplicado
 * nessas cinco.
 *
 * Traduzir não basta: a próxima migration que acrescentar um valor ao CHECK
 * faria a tela voltar a mostrar inglês, de forma silenciosa, porque todas as
 * chamadas usam `?? valor` como piso. Este teste é a trava: cada dicionário
 * precisa cobrir TODOS os valores do CHECK vigente.
 *
 * Os valores abaixo foram lidos do banco de produção em 26/10/2026 via
 * `pg_constraint` (projeto `1a628b61-ec68-454f-85e1-671d6f297370`). Quando uma
 * migration alterar um desses CHECKs, este teste quebra de propósito: atualize
 * a lista E o dicionário na mesma entrega — nunca só a lista.
 */
const CHECK_VIGENTE: Record<string, { valores: readonly string[]; dicionario: Record<string, string> }> = {
  "contract_scope_items.status": {
    valores: ["included", "excluded", "pending", "conditional", "not_applicable"],
    dicionario: ROTULO_STATUS_ESCOPO,
  },
  "contract_scope_items.source_type": {
    valores: ["proposal", "case", "manual_review", "template", "annex"],
    dicionario: ROTULO_ORIGEM_ESCOPO,
  },
  "contract_scope_items.category": {
    valores: [
      "contracted_scope",
      "deliverable",
      "operational_condition",
      "customer_obligation",
      "club_obligation",
      "exclusion",
      "dependency",
      "external_expense",
    ],
    dicionario: ROTULO_CATEGORIA_ESCOPO,
  },
  "contract_validation_results.severity": {
    valores: ["blocking", "high", "medium", "low"],
    dicionario: ROTULO_SEVERIDADE_VALIDACAO,
  },
  "contract_validation_results.status": {
    valores: ["open", "passed", "waived", "resolved"],
    dicionario: ROTULO_SITUACAO_VALIDACAO,
  },
  "contract_exceptions.scope": {
    valores: ["financial_gate", "activation_gate", "validation_waiver", "other"],
    dicionario: ROTULO_ESCOPO_EXCECAO,
  },
};

describe("rótulos do contrato cobrem o CHECK do banco (nada em inglês escapa para a tela)", () => {
  for (const [coluna, { valores, dicionario }] of Object.entries(CHECK_VIGENTE)) {
    it(`${coluna}: todo valor do CHECK tem rótulo em português`, () => {
      const semRotulo = valores.filter((v) => !dicionario[v]);
      expect(semRotulo, `sem rótulo em ${coluna}: ${semRotulo.join(", ")}`).toEqual([]);
    });

    it(`${coluna}: nenhum rótulo é o próprio valor em inglês`, () => {
      const naoTraduzidos = valores.filter((v) => dicionario[v] === v);
      expect(naoTraduzidos, `rótulo igual ao valor cru em ${coluna}`).toEqual([]);
    });
  }

  it("a tela do instrumento aplica os dicionários, não imprime o valor cru", async () => {
    const { readFileSync } = await import("node:fs");
    const rota = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
    for (const cru of ["{s.status}", "{s.source_type}", "{v.severity}", "texto={v.status}"]) {
      expect(rota, `valor cru ainda impresso: ${cru}`).not.toContain(cru);
    }
    for (const dic of [
      "ROTULO_STATUS_ESCOPO[s.status]",
      "ROTULO_ORIGEM_ESCOPO[s.source_type]",
      "ROTULO_SEVERIDADE_VALIDACAO[v.severity]",
      "ROTULO_SITUACAO_VALIDACAO[v.status]",
      "ROTULO_ESCOPO_EXCECAO[e.scope]",
    ]) {
      expect(rota).toContain(dic);
    }
  });
});
