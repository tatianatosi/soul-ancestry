import { describe, expect, it } from "vitest";
import {
  AVANCO_INTERNO_MAXIMO,
  avancoPermitido,
  derivarEstadoGate,
  ehPapelProprietaria,
  validarOverrideInterno,
  type EntradaOverride,
} from "../gates-override";

const base = (over: Partial<EntradaOverride> = {}): EntradaOverride => ({
  organization_id: "org-1",
  entidade: "contracts",
  entidade_id: "c-1",
  gate: "aprovacao",
  valor_anterior: "pendente_bloqueante",
  valor_novo: "aprovado_internamente",
  motivo: "decisão da proprietária registrada com base na proposta aprovada",
  fonte: "proposta Canva aprovada, páginas 1–7",
  autora: "user-1",
  em: "2026-08-22T19:00:00.000Z",
  avanco_interno: "aprovacao_interna",
  papel: "admin",
  ...over,
});

const pendencia = { chave: "parcelas", rotulo: "Parcelas", motivo: "não localizado na proposta" };

describe("gates com três estados e override interno auditado", () => {
  it("papel canônico é a proprietária administradora", () => {
    expect(ehPapelProprietaria("proprietaria_administradora")).toBe(true);
    expect(ehPapelProprietaria("admin")).toBe(true);
    expect(ehPapelProprietaria("operacoes")).toBe(false);
  });

  it("os três estados são derivados sem apagar a pendência", () => {
    expect(derivarEstadoGate({ gate: "aprovacao", pendencia: null }).estado).toBe("atende_regra");
    expect(derivarEstadoGate({ gate: "aprovacao", pendencia }).estado).toBe("pendente_bloqueante");
    const superado = derivarEstadoGate({
      gate: "aprovacao",
      pendencia,
      override: {
        motivo: base().motivo,
        fonte: base().fonte,
        autora: "user-1",
        em: base().em,
        event_id: "ev-1",
        avanco_interno: "aprovacao_interna",
      },
    });
    expect(superado.estado).toBe("superado_por_decisao_proprietaria");
    expect(superado.pendencia).toEqual(pendencia);
    expect(superado.decisao?.event_id).toBe("ev-1");
  });

  it("recusa override de papel não proprietário", () => {
    const r = validarOverrideInterno(base({ papel: "operacoes" }));
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toContain("proprietária administradora");
  });

  /**
   * 06/09/2026 — este teste exigia que "ok" fosse RECUSADO como motivo, o que
   * só existia por causa do mínimo de 10 caracteres. A proprietária mandou
   * remover mínimo arbitrário de caracteres em motivo
   * (`hotfix_autonomia_operacional_proprietaria.md`), então "ok" agora é
   * motivo válido. O que o teste passa a proteger é o que continua valendo:
   * motivo em branco e fonte ausente seguem recusados — o registro precisa
   * existir, só não precisa ter um tamanho mínimo inventado.
   */
  it("aceita motivo curto mas recusa motivo em branco e fonte ausente", () => {
    expect(validarOverrideInterno(base({ motivo: "ok" })).valida).toBe(true);
    expect(validarOverrideInterno(base({ motivo: "   " })).valida).toBe(false);
    expect(validarOverrideInterno(base({ fonte: "" })).valida).toBe(false);
  });

  it("recusa registro de outra organização", () => {
    const r = validarOverrideInterno(base({ organizacao_da_entidade: "org-2" }));
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toContain("outra organização");
  });

  it("recusa qualquer ação externa por override", () => {
    for (const externa of [
      "solicitar_assinatura",
      "emitir_cobranca",
      "publicar_no_app_cliente",
      "enviar_whatsapp",
    ]) {
      expect(validarOverrideInterno(base({ avanco_interno: externa })).valida).toBe(false);
      expect(validarOverrideInterno(base({ gate: externa })).valida).toBe(false);
    }
  });

  it("assinatura, financeiro e portal param em aguardando_confirmacao_externa", () => {
    expect(avancoPermitido("assinatura", "assinado")).toBe("aguardando_confirmacao_externa");
    expect(avancoPermitido("financeiro", "cobranca_emitida")).toBe(
      "aguardando_confirmacao_externa",
    );
    expect(avancoPermitido("portal_onboarding", "publicado")).toBe(
      "aguardando_confirmacao_externa",
    );
    expect(AVANCO_INTERNO_MAXIMO.assinatura).toBe("aguardando_confirmacao_externa");
  });

  it("aceita override interno completo e mantém escopo interno", () => {
    const r = validarOverrideInterno(base());
    expect(r).toEqual({ valida: true, erros: [] });
    expect(avancoPermitido("aprovacao", "aprovacao_interna")).toBe("aprovacao_interna");
  });

  it("exige valor anterior e valor novo explícitos", () => {
    expect(validarOverrideInterno(base({ valor_anterior: undefined })).valida).toBe(false);
    expect(validarOverrideInterno(base({ valor_novo: undefined })).valida).toBe(false);
  });
});
