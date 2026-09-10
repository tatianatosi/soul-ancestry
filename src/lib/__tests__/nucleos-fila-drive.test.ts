import { describe, expect, it } from "vitest";
import { avaliarFilaDrive, podeTransicionar } from "@/lib/drive-provisioning";

/**
 * Fixa o contrato exato que `encaminharFilaDrive` (nucleos-desk.functions.ts)
 * depende: os gates do caso mapeados como contrato_assinado, pagamento_confirmado
 * e onboarding_aprovado (= caso.ativado_em), e a única transição que o botão
 * "Encaminhar para revisão" em /nucleos pode produzir (CA-P0-EXEC-001, critério C).
 */
describe("encaminharFilaDrive — gates do caso e transição da fila (CA-P0-EXEC-001, critério C)", () => {
  it("sem contrato/pagamento/ativação, a fila permanece bloqueada e a transição não é permitida", () => {
    const avaliacao = avaliarFilaDrive("onboarding_aprovado", {
      contrato_assinado: false,
      pagamento_confirmado: false,
      onboarding_aprovado: false,
    });
    expect(avaliacao.status).toBe("blocked");
    expect(avaliacao.executaDrive).toBe(false);
    expect(podeTransicionar("blocked", avaliacao.status).ok).toBe(false);
  });

  it("com contrato assinado, pagamento confirmado e caso ativado, a fila fica pronta para revisão e a transição blocked→ready_for_review é permitida sem contexto adicional", () => {
    const avaliacao = avaliarFilaDrive("onboarding_aprovado", {
      contrato_assinado: true,
      pagamento_confirmado: true,
      onboarding_aprovado: true,
    });
    expect(avaliacao.status).toBe("ready_for_review");
    expect(avaliacao.executaDrive).toBe(false);
    expect(podeTransicionar("blocked", avaliacao.status).ok).toBe(true);
  });

  it("um item que já saiu de 'blocked' nunca é avançado por este botão: approved/executed exigem decisão humana em outro fluxo", () => {
    expect(podeTransicionar("ready_for_review", "approved").ok).toBe(false);
    expect(podeTransicionar("ready_for_review", "approved", { aprovadoPor: "Tatiana Tosi" }).ok).toBe(true);
    expect(podeTransicionar("approved", "executed", {}).ok).toBe(false);
  });
});
