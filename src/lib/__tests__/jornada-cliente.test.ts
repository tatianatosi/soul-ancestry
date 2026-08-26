import { describe, expect, it } from "vitest";

import {
  avaliarSituacaoCaso,
  calcularCadencia,
  checklistComEstado,
  entregasParaAppCliente,
  podeTransicionarEntrega,
  validarTouchpoint,
  type EstadoCaso,
} from "@/lib/jornada-cliente";

const baseAna: EstadoCaso = {
  aceiteComercial: true,
  cadastroCompleto: false,
  contratoPreparado: false,
  contratoEnviado: false,
  contratoAssinado: false,
  cobrancaCriada: false,
  pagamentoInicialConfirmado: false,
  dossieMae: false,
  ambienteDossie: false,
  nucleoFamiliar: false,
  requerentes: false,
  autorizacaoPesquisa: false,
  despesasTerceirosAprovadas: false,
  onboardingIniciado: false,
  onboardingMinimoConcluido: false,
};

describe("situação do caso (Ana Luiza — estado inicial)", () => {
  it("mantém aceite confirmado com formalização pendente e sete bloqueios", () => {
    const s = avaliarSituacaoCaso(baseAna);
    expect(s.rotuloCard).toBe("Aceite confirmado — formalização pendente");
    expect(s.bloqueios.map((b) => b.codigo)).toEqual([
      "CONTRATO_NAO_ASSINADO",
      "CADASTRO_PENDENTE",
      "PAGAMENTO_NAO_CONFIRMADO",
      "AUTORIZACAO_PESQUISA_AUSENTE",
      "DESPESAS_TERCEIROS_PENDENTES",
      "DOSSIE_MAE_NAO_VALIDADO",
      "NUCLEO_FAMILIAR_AUSENTE",
    ]);
    expect(s.permite).toEqual({
      onboarding: false,
      casoAtivo: false,
      dossieAtivo: false,
      pesquisaExterna: false,
    });
    expect(s.proximaAcao).toBe("Completar cadastro dos signatários");
  });

  it("libera onboarding só com contrato assinado e pagamento confirmado", () => {
    const s = avaliarSituacaoCaso({
      ...baseAna,
      contratoAssinado: true,
      pagamentoInicialConfirmado: true,
    });
    expect(s.permite.onboarding).toBe(true);
    expect(s.permite.casoAtivo).toBe(false);
  });

  it("caso ativo exige onboarding mínimo concluído", () => {
    const s = avaliarSituacaoCaso({
      ...baseAna,
      contratoAssinado: true,
      pagamentoInicialConfirmado: true,
      onboardingIniciado: true,
      onboardingMinimoConcluido: true,
    });
    expect(s.permite.casoAtivo).toBe(true);
    expect(s.estadoCaso).toBe("Caso ativo");
  });

  it("pesquisa externa exige autorização registrada", () => {
    const s = avaliarSituacaoCaso({
      ...baseAna,
      contratoAssinado: true,
      pagamentoInicialConfirmado: true,
    });
    expect(s.permite.pesquisaExterna).toBe(false);
    const t = avaliarSituacaoCaso({
      ...baseAna,
      contratoAssinado: true,
      pagamentoInicialConfirmado: true,
      autorizacaoPesquisa: true,
    });
    expect(t.permite.pesquisaExterna).toBe(true);
  });

  it("checklist tem 14 itens, todos pendentes no estado inicial", () => {
    const itens = checklistComEstado(baseAna);
    expect(itens).toHaveLength(14);
    expect(itens.every((i) => !i.feito)).toBe(true);
  });
});

describe("cadência e touchpoints", () => {
  const hoje = "2026-08-20T12:00:00.000Z";

  it("sem touchpoint algum é crítico", () => {
    expect(calcularCadencia({ hoje }).status).toBe("critico");
  });

  it("classifica regular, atenção e crítico por dias", () => {
    expect(calcularCadencia({ hoje, ultimoTouchpointEm: "2026-08-17T12:00:00.000Z" }).status).toBe(
      "regular",
    );
    expect(calcularCadencia({ hoje, ultimoTouchpointEm: "2026-08-09T12:00:00.000Z" }).status).toBe(
      "atencao",
    );
    expect(calcularCadencia({ hoje, ultimoTouchpointEm: "2026-08-01T12:00:00.000Z" }).status).toBe(
      "critico",
    );
  });

  it("espera externa comunicada mantém regular", () => {
    const r = calcularCadencia({
      hoje,
      ultimoTouchpointEm: "2026-07-01T12:00:00.000Z",
      aguardandoInstituicaoExterna: true,
      motivoEsperaExterna: "Aguardando resposta de arquivo paroquial",
    });
    expect(r.status).toBe("regular");
    expect(r.diasSemTouchpoint).toBeGreaterThan(14);
  });

  it("espera externa sem motivo não neutraliza a cadência", () => {
    expect(
      calcularCadencia({
        hoje,
        ultimoTouchpointEm: "2026-07-01T12:00:00.000Z",
        aguardandoInstituicaoExterna: true,
      }).status,
    ).toBe("critico");
  });

  it("touchpoint exige as quatro respostas", () => {
    expect(validarTouchpoint({ oQueFoiFeito: "a" }).faltando).toHaveLength(3);
    expect(
      validarTouchpoint({
        oQueFoiFeito: "a",
        oQueEstaAguardando: "b",
        oQueNaoDependeDoCliente: "c",
        proximoMarcoVerificavel: "d",
      }).valido,
    ).toBe(true);
  });
});

describe("micro-entregas", () => {
  it("só publicadas chegam ao App Cliente", () => {
    const itens = entregasParaAppCliente([
      { id: "1", approval_status: "aprovado", title_client: "T", summary_approved: "R" },
      {
        id: "2",
        approval_status: "publicado",
        title_client: "Documento validado",
        summary_approved: "Certidão conferida.",
      },
    ]);
    expect(itens.map((i) => i.id)).toEqual(["2"]);
  });

  it("descarta entregas com termos internos proibidos", () => {
    const itens = entregasParaAppCliente([
      {
        id: "3",
        approval_status: "publicado",
        title_client: "Hipótese confirmada",
        summary_approved: "ok",
      },
      {
        id: "4",
        approval_status: "publicado",
        title_client: "Atualização",
        summary_approved: "Score do caso subiu",
      },
    ]);
    expect(itens).toHaveLength(0);
  });

  it("não projeta referência interna", () => {
    const [item] = entregasParaAppCliente([
      {
        id: "5",
        approval_status: "publicado",
        title_client: "Árvore evoluída",
        summary_approved: "Novo ramo incluído.",
        internal_reference: "DOSSIE-INT-99",
      },
    ]);
    expect(JSON.stringify(item)).not.toContain("DOSSIE-INT-99");
  });

  it("respeita o fluxo de aprovação", () => {
    expect(podeTransicionarEntrega("rascunho", "publicado")).toBe(false);
    expect(podeTransicionarEntrega("aprovado", "publicado")).toBe(true);
    expect(podeTransicionarEntrega("publicado", "rascunho")).toBe(false);
    expect(podeTransicionarEntrega("arquivado", "rascunho")).toBe(false);
  });
});
