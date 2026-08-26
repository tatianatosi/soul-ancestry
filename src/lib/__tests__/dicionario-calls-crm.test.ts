import { describe, expect, it } from "vitest";

import {
  CAMPOS_DICIONARIO_CALLS,
  FORMATACAO_CONDICIONAL_CALLS,
  LISTAS_BASE_CALLS,
  avaliarBloqueiosCalls,
  valorPermitidoCalls,
  type RegistroCallsCrm,
} from "@/lib/dicionario-calls-crm";
import {
  SUBSTITUICOES_OBRIGATORIAS,
  VOCABULARIO_OFICIAL,
  revisarTerminologiaCliente,
} from "@/lib/glossario-oficial";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";

const base: RegistroCallsCrm = { dataRegistro: "2026-08-24" };

describe("Dicionário de validações Calls → CRM", () => {
  it("todo campo classificatório aponta para uma lista existente", () => {
    const classificatorios = CAMPOS_DICIONARIO_CALLS.filter((c) => c.tipo.startsWith("Dropdown"));
    expect(classificatorios.length).toBeGreaterThan(20);
    for (const c of classificatorios) {
      if (c.tipo === "Dropdown dependente") continue;
      expect(c.lista, c.campo).toBeTruthy();
      expect(LISTAS_BASE_CALLS[c.lista!], c.campo).toBeTruthy();
    }
  });

  it("rejeita valor fora da lista controlada", () => {
    expect(valorPermitidoCalls("Etapa do funil", "Negociação")).toBe(true);
    expect(valorPermitidoCalls("Etapa do funil", "Quase fechando")).toBe(false);
    expect(valorPermitidoCalls("Lista inexistente", "x")).toBe(false);
  });

  it("bloqueia SKU sem produto recomendado ou fora da Planilha Mestre", () => {
    const r = avaliarBloqueiosCalls({ ...base, skuRecomendado: "CA-CID-001" });
    expect(r.filter((b) => b.regra === 1)).toHaveLength(2);
    const ok = avaliarBloqueiosCalls({
      ...base,
      skuRecomendado: "CA-CID-001",
      produtosRecomendados: ["Diagnóstico"],
      skuAtivoNaPlanilhaMestre: true,
    });
    expect(ok.filter((b) => b.regra === 1)).toHaveLength(0);
  });

  it("exige contrato, pagamento e dossiê para Convertido e motivo para perda", () => {
    expect(
      avaliarBloqueiosCalls({ ...base, resultadoComercial: "Convertido" }).some(
        (b) => b.regra === 2,
      ),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({
        ...base,
        resultadoComercial: "Convertido",
        contratoAssinado: true,
        pagamentoInicialConfirmado: true,
        linkDossie: "https://interno/dossie",
      }).some((b) => b.regra === 2),
    ).toBe(false);
    expect(
      avaliarBloqueiosCalls({ ...base, resultadoComercial: "Perdido — preço" }).some(
        (b) => b.regra === 5,
      ),
    ).toBe(true);
  });

  it("aplica as travas de etapa, call realizada e elegibilidade forte", () => {
    expect(
      avaliarBloqueiosCalls({ ...base, etapaFunil: "Contrato assinado" }).some(
        (b) => b.regra === 3,
      ),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, etapaFunil: "Onboarding" }).some((b) => b.regra === 4),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, statusCall: "Realizada" }).some((b) => b.regra === 6),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, elegibilidadePreliminar: "Forte" }).some(
        (b) => b.regra === 7,
      ),
    ).toBe(true);
  });

  it("bloqueia oferta de protocolo em via encerrada, despesa aprovada sem lastro e gravação sem consentimento", () => {
    expect(
      avaliarBloqueiosCalls({
        ...base,
        statusVia: "Encerrada para novos pedidos",
        ofertaProtocoloAssessoria: true,
      }).some((b) => b.regra === 8),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, statusDespesasTerceiros: "Aprovadas" }).some(
        (b) => b.regra === 9,
      ),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, linkGravacao: "https://x" }).some((b) => b.regra === 10),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, fazParteDeNucleo: true }).some((b) => b.regra === 11),
    ).toBe(true);
  });

  it("exige responsável, etapa e próxima ação datada em lead ativo e prazo não retroativo", () => {
    expect(
      avaliarBloqueiosCalls({ ...base, leadAtivo: true }).some((b) => b.campo === "Lead ativo"),
    ).toBe(true);
    expect(
      avaliarBloqueiosCalls({ ...base, prazoProximaAcao: "2026-08-20" }).some(
        (b) => b.campo === "Prazo da próxima ação",
      ),
    ).toBe(true);
  });

  it("mantém a formatação condicional e a rota no menu Comercial", () => {
    expect(FORMATACAO_CONDICIONAL_CALLS).toHaveLength(10);
    const comercial = GRUPOS_DESK.find((g) => g.id === "comercial");
    const rotas = comercial?.sub.filter((s) => "to" in s).map((s) => (s as { to: string }).to);
    expect(rotas).toContain("/governanca/dicionario-calls-crm");
  });
});

describe("Glossário oficial", () => {
  it("registra os 17 termos oficiais e as substituições obrigatórias", () => {
    expect(VOCABULARIO_OFICIAL).toHaveLength(17);
    expect(SUBSTITUICOES_OBRIGATORIAS.length).toBeGreaterThanOrEqual(10);
  });

  it("aponta termo bloqueado e substituição em texto cliente-facing", () => {
    const avisos = revisarTerminologiaCliente(
      "A linha confirmada indica via judicial para o caso.",
    );
    expect(avisos.some((a) => a.includes("via judicial"))).toBe(true);
    expect(avisos.some((a) => a.includes("linha confirmada"))).toBe(true);
  });

  it("não sinaliza texto já sanitizado", () => {
    expect(
      revisarTerminologiaCliente(
        "Linha familiar em análise. Próximo passo recomendado: enviar documento.",
      ),
    ).toEqual([]);
  });
});
