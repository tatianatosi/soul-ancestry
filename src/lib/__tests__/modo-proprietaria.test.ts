import { describe, expect, it } from "vitest";

import {
  ACOES_EXTERNAS,
  CAPACIDADES_PROPRIETARIA,
  assumirPendencia,
  bloqueiaAvanco,
  capacidadesDe,
  ehProprietariaAdministradora,
  exigeConfirmacaoFinal,
  montarConfirmacao,
  podeAssumirDecisao,
  validarDecisao,
} from "@/lib/modo-proprietaria";

describe("modo proprietária administradora", () => {
  it("só o papel admin da organização ativa o modo", () => {
    expect(ehProprietariaAdministradora("admin")).toBe(true);
    for (const p of ["operacoes", "comercial", "financeiro", "pesquisador", "leitura", null]) {
      expect(ehProprietariaAdministradora(p)).toBe(false);
      expect(capacidadesDe(p)).toEqual([]);
    }
    expect(capacidadesDe("admin")).toHaveLength(CAPACIDADES_PROPRIETARIA.length);
    expect(podeAssumirDecisao("admin", "homologar_sku")).toBe(true);
    expect(podeAssumirDecisao("operacoes", "homologar_sku")).toBe(false);
  });

  it("pendência não bloqueia a proprietária, mas continua visível", () => {
    const pend = [{ chave: "sku_em_revisao", rotulo: "SKU em revisão" }];
    const admin = bloqueiaAvanco("admin", pend);
    expect(admin.bloqueia).toBe(false);
    expect(admin.exigeDecisaoAuditada).toBe(true);
    expect(admin.pendencias).toHaveLength(1);

    const outro = bloqueiaAvanco("comercial", pend);
    expect(outro.bloqueia).toBe(true);
    expect(outro.pendencias).toHaveLength(1);
  });

  it("pendência assumida guarda autora, data e motivo, sem ser removida", () => {
    const a = assumirPendencia(
      { chave: "proposta_incompleta", rotulo: "Proposta incompleta" },
      { autora: "Tati", em: "2026-08-22T18:00:00Z", motivo: "Decisão administrativa registrada" },
    );
    expect(a.assumida).toBe(true);
    expect(a.chave).toBe("proposta_incompleta");
    expect(a.assumida_por).toBe("Tati");
    expect(a.motivo.length).toBeGreaterThanOrEqual(10);
  });

  it("decisão exige motivo, entidade e par valor anterior/novo", () => {
    expect(
      validarDecisao("admin", {
        acao: "homologar_sku",
        entidade: "product_catalog",
        campo: "status_homologacao",
        valor_anterior: "em_revisao",
        valor_novo: "homologado",
        motivo: "Homologação decidida na revisão comercial de 22/08",
      }),
    ).toEqual([]);

    expect(validarDecisao("admin", { acao: "x", entidade: "y", motivo: "curto" })).toContain(
      "Motivo obrigatório com pelo menos 10 caracteres.",
    );
    expect(
      validarDecisao("admin", {
        acao: "x",
        entidade: "y",
        campo: "preco",
        valor_novo: 10,
        motivo: "Motivo suficiente para auditoria",
      }),
    ).toContain("Valor anterior obrigatório quando um campo é corrigido.");
    expect(
      validarDecisao("operacoes", { acao: "x", entidade: "y", motivo: "Motivo suficiente auditado" }),
    ).toContain("Somente a proprietária administradora pode assumir esta decisão.");
  });

  it("todas as ações externas exigem confirmação final", () => {
    for (const a of ACOES_EXTERNAS) expect(exigeConfirmacaoFinal(a)).toBe(true);
    expect(exigeConfirmacaoFinal("editar_rascunho")).toBe(false);
  });

  it("confirmação lista ação, destinatário, conteúdo, valor, caso, anexos, impacto e dados", () => {
    const incompleta = montarConfirmacao({ acao: "enviar_contrato" });
    expect(incompleta.pronta).toBe(false);
    expect(incompleta.faltantes).toContain("destinatario");

    const c = montarConfirmacao({
      acao: "emitir_cobranca",
      destinatario: "cliente@exemplo.com",
      conteudo: "Fatura da parcela 1",
      valor: 1500,
      caso: "CA-2026-ANA-001",
      anexos: ["Anexo I"],
      impacto: "Gera cobrança externa",
      dados_enviados: { parcela: 1 },
    });
    expect(c.pronta).toBe(true);
    expect(c.faltantes).toEqual([]);
    expect(c.rotulo).toBe("Emitir cobrança");
    expect(c.campos.find((x) => x.campo === "valor")?.valor).toContain("1.500");
    expect(c.aviso.toLowerCase()).toContain("irreversível");
    expect(c.campos.map((x) => x.campo)).toEqual([
      "acao",
      "destinatario",
      "conteudo",
      "valor",
      "caso",
      "anexos",
      "impacto",
      "dados_enviados",
      "aviso_irreversibilidade",
    ]);
  });
});
