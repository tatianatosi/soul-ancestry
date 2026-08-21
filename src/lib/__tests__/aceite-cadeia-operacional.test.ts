import { describe, expect, it } from "vitest";

import { elegibilidadeAtivacao } from "@/lib/clientes-lista";
import {
  ACEITE_VERBAL_NAO_LIBERA,
  aceiteVerbalLibera,
  confirmacaoFormalLibera,
  validarOportunidade,
} from "@/lib/crm-fluxo";
import {
  TRANSICOES_EVIDENCIA,
  achadoProjetavel,
  podeGravarRelacaoOuEvento,
  relatorioVisivelAoCliente,
  validarTransicaoEvidencia,
} from "@/lib/pesquisa-cadeia";

describe("testes de aceite — cadeia operacional", () => {
  it("oportunidade sem responsável, próxima ação ou prazo vira exceção de saúde comercial", () => {
    const pend = validarOportunidade({
      objetivo_declarado: "Cidadania italiana",
      contact_id: "c1",
      etapa_comercial: "proposta_enviada",
    } as never);
    expect(pend.map((p) => p.campo).sort()).toEqual(["prazo_proxima_acao", "proxima_acao", "responsavel"]);
  });

  it("nenhum aceite concede cliente ativo nem operação externa", () => {
    for (const alvo of ACEITE_VERBAL_NAO_LIBERA) {
      expect(aceiteVerbalLibera(alvo)).toBe(false);
    }
    expect(confirmacaoFormalLibera("contrato_assinado")).toBe(false);
    expect(confirmacaoFormalLibera("cobranca")).toBe(false);
    expect(confirmacaoFormalLibera("pesquisa_externa")).toBe(false);
    expect(confirmacaoFormalLibera("app_cliente")).toBe(false);

    const el = elegibilidadeAtivacao({
      status_comercial: "confirmacao_formal",
      contrato_assinado: false,
      pagamento_confirmado: false,
      is_demo: false,
    } as never);
    expect(el.pode).toBe(false);
  });

  it("estados de evidência só avançam por transições permitidas, com autor, justificativa e origem", () => {
    const base = { autor: "u1", justificativa: "Conferido com certidão original", origem: "documental_oficial" };
    expect(validarTransicaoEvidencia({ de: "em_revisao", para: "validada_internamente", ...base }).ok).toBe(true);
    expect(validarTransicaoEvidencia({ de: "recebida", para: "publicada_ao_cliente", ...base }).ok).toBe(false);
    expect(validarTransicaoEvidencia({ de: "em_revisao", para: "validada_internamente", ...base, autor: null }).ok).toBe(false);
    expect(
      validarTransicaoEvidencia({ de: "em_revisao", para: "validada_internamente", ...base, justificativa: "ok" }).ok,
    ).toBe(false);
    expect(validarTransicaoEvidencia({ de: "em_revisao", para: "validada_internamente", ...base, origem: "" }).ok).toBe(false);
  });

  it("evidência divergente não é sobrescrita silenciosamente por validação ou publicação", () => {
    const saidas = TRANSICOES_EVIDENCIA["divergente"] ?? [];
    expect(saidas).not.toContain("validada_internamente");
    expect(saidas).not.toContain("aprovada_para_entrega_cliente");
    expect(saidas).not.toContain("publicada_ao_cliente");
  });

  it("nó derivado sempre aponta para evidência ou hipótese interna explícita", () => {
    expect(podeGravarRelacaoOuEvento({}).ok).toBe(false);
    expect(podeGravarRelacaoOuEvento({ evidenceId: "e1" }).ok).toBe(true);
    expect(podeGravarRelacaoOuEvento({ hipoteseInterna: true }).ok).toBe(true);
  });

  it("relatório F1/F2 não aparece no App Cliente sem publicação explícita", () => {
    expect(relatorioVisivelAoCliente({ status: "aprovado_interno", approved_summary_client: "Resumo", approved_at: "2026-08-01" })).toBe(false);
    expect(relatorioVisivelAoCliente({ status: "publicado_cliente", approved_summary_client: "", approved_at: "2026-08-01" })).toBe(false);
    expect(relatorioVisivelAoCliente({ status: "publicado_cliente", approved_summary_client: "Resumo", approved_at: null })).toBe(false);
    expect(relatorioVisivelAoCliente({ status: "publicado_cliente", approved_summary_client: "Resumo", approved_at: "2026-08-01" })).toBe(true);
    expect(achadoProjetavel({ validation_status: "validado", client_projection_status: "aprovado_interno" })).toBe(false);
  });
});
