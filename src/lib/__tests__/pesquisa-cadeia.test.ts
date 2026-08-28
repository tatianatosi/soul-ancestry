import { describe, expect, it } from "vitest";

import {
  CADEIA_PESQUISA,
  CAMPOS_INTERNOS_BLOQUEADOS,
  achadoProjetavel,
  gatilhosDaEvidencia,
  podeGravarRelacaoOuEvento,
  relatorioVisivelAoCliente,
  uploadCriaGenealogia,
  validacaoConcluiDireito,
  validarArquivamentoPesquisa,
} from "@/lib/pesquisa-cadeia";

describe("cadeia da pesquisa genealógica", () => {
  it("mantém a ordem canônica ficha → fonte → evidência → validação → achado → relatório → app", () => {
    expect(CADEIA_PESQUISA.map((e) => e.etapa)).toEqual([
      "ficha",
      "fonte",
      "evidencia",
      "validacao",
      "achado",
      "relatorio",
      "app",
    ]);
  });

  it("validar internamente não conclui direito e upload não cria genealogia", () => {
    expect(validacaoConcluiDireito()).toBe(false);
    expect(uploadCriaGenealogia()).toBe(false);
  });

  it("não grava relação ou evento sem evidência nem marca de hipótese", () => {
    expect(podeGravarRelacaoOuEvento({ evidenceId: null, hipoteseInterna: false }).ok).toBe(false);
    expect(podeGravarRelacaoOuEvento({ evidenceId: null, hipoteseInterna: true }).ok).toBe(true);
    expect(podeGravarRelacaoOuEvento({ evidenceId: "e1", hipoteseInterna: false }).ok).toBe(true);
  });

  it("gera gatilhos internos para evidência recebida, divergente e em retificação", () => {
    expect(gatilhosDaEvidencia("recebida").length).toBeGreaterThan(0);
    expect(gatilhosDaEvidencia("divergente").some((g) => g.criticidade === "alta")).toBe(true);
    expect(gatilhosDaEvidencia("requer_retificacao").length).toBeGreaterThan(0);
  });

  it("relatório só é visível ao cliente quando publicado e aprovado", () => {
    expect(relatorioVisivelAoCliente({ status: "rascunho_interno" })).toBe(false);
    expect(
      relatorioVisivelAoCliente({
        status: "publicado_cliente",
        approved_summary_client: "",
        approved_at: null,
      }),
    ).toBe(false);
    expect(
      relatorioVisivelAoCliente({
        status: "publicado_cliente",
        approved_summary_client: "Resumo sanitizado",
        approved_at: "2026-08-21",
      }),
    ).toBe(true);
  });

  it("achado só é projetável após validação e autorização de projeção", () => {
    expect(
      achadoProjetavel({ validation_status: "em_revisao", client_projection_status: "autorizado" }),
    ).toBe(false);
    expect(
      achadoProjetavel({
        validation_status: "validado",
        client_projection_status: "nao_projetado",
      }),
    ).toBe(false);
    expect(
      achadoProjetavel({
        validation_status: "validado",
        client_projection_status: "publicado_cliente",
      }),
    ).toBe(true);
  });

  it("bloqueia campos internos na projeção ao cliente", () => {
    expect(CAMPOS_INTERNOS_BLOQUEADOS.length).toBeGreaterThan(0);
    expect(CAMPOS_INTERNOS_BLOQUEADOS).toContain("internal_hypothesis");
  });

  it("exige motivo para arquivamento lógico", () => {
    expect(validarArquivamentoPesquisa("").ok).toBe(false);
    expect(validarArquivamentoPesquisa("Duplicidade confirmada pela equipe").ok).toBe(true);
  });
});
