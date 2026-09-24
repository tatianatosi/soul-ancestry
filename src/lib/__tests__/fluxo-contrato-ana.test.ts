import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { avaliarFluxoContrato, proximoPassoContrato, PASSOS_CONTRATO, type MarcosContrato } from "@/lib/fluxo-contrato";
import type { ContextoGates } from "@/lib/gates-formalizacao";

/*
 * Inventário real do caso Ana (CA-CID-AT-FAM-2026-001), lido em 23–24/09/2026:
 * proposta v1 aprovada (R$ 9.600,00, Canva p. 1–7), contrato 2026-CB-0001 v1
 * em revisão humana, NÃO assinado; Anexos I/II ausentes, sem OS, sem
 * pagamento. Nada aqui grava ou consulta banco.
 */
const ctxAna: ContextoGates = {
  propostaValida: true,
  camposAusentes: [],
  conflitos: [],
  precoOk: true,
  caseServiceOk: true,
  cadastroCompleto: true,
  nucleoValidado: true,
  menorEnvolvido: false,
  representacaoRegistrada: false,
  revisaoJuridicaOk: false,
  contratoOsProntos: false,
  assinaturaRegistrada: false,
  pagamentoConfirmado: false,
  autorizacaoPesquisa: false,
  despesasAplicaveis: false,
  despesasPendentes: [],
};
const marcosAna: MarcosContrato = {
  preparado: false,
  revisado: false,
  aprovado: false,
  enviado: false,
  assinado: false,
  liberado: false,
};

describe("fluxo do contrato — seis passos com gates reais", () => {
  const fluxo = avaliarFluxoContrato(ctxAna, marcosAna);
  const por = Object.fromEntries(fluxo.map((p) => [p.passo, p]));

  it("tem exatamente Preparar, Revisar, Aprovar, Enviar, Registrar assinatura, Liberar, nesta ordem", () => {
    expect(fluxo.map((p) => p.rotulo)).toEqual([
      "Preparar",
      "Revisar",
      "Aprovar",
      "Enviar",
      "Registrar assinatura",
      "Liberar",
    ]);
    expect(PASSOS_CONTRATO).toHaveLength(6);
  });

  it("Ana: Preparar é o próximo passo e está disponível", () => {
    expect(por.preparar.estado).toBe("disponivel");
    expect(proximoPassoContrato(fluxo)?.passo).toBe("preparar");
  });

  it("Ana: Aprovar e Enviar bloqueiam por revisão jurídica e Contrato/OS", () => {
    expect(por.aprovar.estado).toBe("bloqueado");
    expect(por.aprovar.motivos.join(" ")).toContain("Revisão jurídica");
    expect(por.enviar.motivos.join(" ")).toContain("Contrato/OS ainda não preparados");
  });

  it("Ana: Registrar assinatura e Liberar bloqueiam; Liberar exige contrato assinado", () => {
    expect(por.registrar_assinatura.estado).toBe("bloqueado");
    expect(por.registrar_assinatura.motivos.join(" ")).toContain("Assinatura não registrada");
    expect(por.liberar.estado).toBe("bloqueado");
    expect(por.liberar.motivos).toContain("Liberação do App exige contrato assinado.");
  });

  it("não pula etapa: passo seguinte a um pendente fica bloqueado mesmo com gates verdes", () => {
    const tudoVerde: ContextoGates = {
      ...ctxAna,
      revisaoJuridicaOk: true,
      contratoOsProntos: true,
      assinaturaRegistrada: true,
      pagamentoConfirmado: true,
      autorizacaoPesquisa: true,
    };
    const f = avaliarFluxoContrato(tudoVerde, { ...marcosAna, preparado: true });
    expect(f[1].estado).toBe("disponivel");
    expect(f[2].estado).toBe("bloqueado");
    expect(f[2].motivos[0]).toContain("Passo anterior pendente: Revisar");
  });

  it("nenhum passo é automático nem emite cobrança; efeitos externos exigem confirmação humana", () => {
    for (const p of fluxo) {
      expect(p.automatico).toBe(false);
      expect(p.emiteCobranca).toBe(false);
    }
    expect(fluxo.filter((p) => p.exigeConfirmacaoHumana).map((p) => p.passo)).toEqual([
      "enviar",
      "registrar_assinatura",
      "liberar",
    ]);
  });

  it("o módulo é puro: não chama banco, fatura, pagamento nem envio", () => {
    const src = readFileSync("src/lib/fluxo-contrato.ts", "utf8");
    expect(src).not.toMatch(/\.from\(|\.insert\(|\.update\(|\.rpc\(|fetch\(|invoices|payments|asaas/i);
  });
});
