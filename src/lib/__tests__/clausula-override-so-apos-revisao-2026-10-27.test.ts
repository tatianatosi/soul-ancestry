import { describe, expect, it } from "vitest";

import { renderCorpoContratual, type ClausulaOverride } from "@/lib/contrato-corpo.server";

/**
 * Fase 2 das edições de cláusula (27/10/2026). A fase 1
 * (gravar/listar/escalar em `contract_clause_overrides`) existia desde
 * antes; este montador nunca lia a tabela — a edição era salva e
 * simplesmente não aparecia no documento, sem explicação (o "texto que
 * editei não aparece" investigado na auditoria de 27/10).
 *
 * Decisão da Proprietária, perguntada nominalmente: "override só depois da
 * revisão humana". `revisado` é `reviewed_at` preenchido no banco.
 */
const entrada = {
  caseId: "CASE-TESTE",
  casoCodigo: "CA-2026-TESTE-001",
  clienteNome: "Cliente TESTE",
  responsavel: "Operações",
  valores: [],
  anexosInternos: [],
};

const overridePendente: ClausulaOverride = {
  clauseCode: "4.2",
  clauseTitle: "Execução e cronograma",
  action: "replace",
  clauseText: "TEXTO AINDA NÃO REVISADO — não deve aparecer no corpo.",
  changeReason: "Pedido do cliente",
  precedenceStatement: null,
  revisado: false,
};

const overrideRevisado: ClausulaOverride = {
  ...overridePendente,
  clauseCode: "1.2",
  clauseText: "TEXTO JÁ REVISADO — deve substituir a redação base da cláusula 1.",
  revisado: true,
};

describe("Override de cláusula só entra no documento depois de revisão humana", () => {
  it("sem overrides, o corpo sai como antes (redação base, sem seção de pendências)", () => {
    const html = renderCorpoContratual(entrada).html;
    expect(html).not.toContain("aguardando revisão humana");
  });

  it("override NÃO revisado nunca aparece no texto da cláusula", () => {
    const html = renderCorpoContratual({ ...entrada, clausulaOverrides: [overridePendente] }).html;
    expect(html).not.toContain("TEXTO AINDA NÃO REVISADO");
  });

  it("override não revisado é declarado como pendente, não some em silêncio", () => {
    const html = renderCorpoContratual({ ...entrada, clausulaOverrides: [overridePendente] }).html;
    expect(html).toContain("Edições de cláusula aguardando revisão humana");
    expect(html).toContain("4.2");
    expect(html).toContain("Pedido do cliente");
  });

  it("override revisado substitui a redação base da cláusula correspondente", () => {
    const html = renderCorpoContratual({ ...entrada, clausulaOverrides: [overrideRevisado] }).html;
    expect(html).toContain("TEXTO JÁ REVISADO");
    expect(html).toContain("revisada");
  });

  it("override revisado não aparece na seção de pendências", () => {
    const html = renderCorpoContratual({ ...entrada, clausulaOverrides: [overrideRevisado] }).html;
    expect(html).not.toContain("aguardando revisão humana");
  });

  it("remove_not_permitted não revisado some sem registrar, mas revisado é declarado como bloqueado", () => {
    const bloqueio: ClausulaOverride = {
      clauseCode: "1.1",
      clauseTitle: "Partes e estrutura",
      action: "remove_not_permitted",
      clauseText: null,
      changeReason: null,
      precedenceStatement: null,
      revisado: true,
    };
    const html = renderCorpoContratual({ ...entrada, clausulaOverrides: [bloqueio] }).html;
    expect(html).toContain("Remoção solicitada para 1.1 e não permitida");
  });
});
