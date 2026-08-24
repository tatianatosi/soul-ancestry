import { describe, expect, it } from "vitest";

import {
  BRIEF_DISCOVERY,
  DECISOES_PENDENTES_CA04,
  EIXO_COMERCIAL_TRANSICOES,
  EIXO_FORMALIZACAO_TRANSICOES,
  LISTAS_BASE_CA04,
  MATRIZ_HANDOFF_CA04,
  ROTEIRO_DISCOVERY_V2,
  avaliarBloqueiosCA04,
  derivarResultadoComercial,
  roteiroSemLinguagemConclusiva,
  transicoesPermitidas,
  valorPermitido,
} from "../ca04-crm-mestre";

describe("CA-04 — listas controladas", () => {
  it("rejeita valor fora do vocabulário permitido", () => {
    expect(valorPermitido("Eixo Comercial", "Negociação")).toBe(true);
    expect(valorPermitido("Eixo Comercial", "Fechado")).toBe(false);
    expect(valorPermitido("Próxima ação", "")).toBe(false);
  });

  it("mantém as listas essenciais do dicionário v1.1", () => {
    expect(LISTAS_BASE_CA04["Eixo Formalização/Operação"]).toContain("Caso ativo");
    expect(LISTAS_BASE_CA04["Autorização para pesquisa prévia"]).toContain("Registrada");
    expect(LISTAS_BASE_CA04["Sinal de aderência preliminar"]).not.toContain("Elegível");
  });
});

describe("CA-04 — regras de dependência e bloqueio", () => {
  it("exige área, responsável nominal e próxima ação datada em lead ativo", () => {
    const b = avaliarBloqueiosCA04({ leadAtivo: true });
    expect(b.some((x) => x.regra === 1)).toBe(true);
  });

  it("bloqueia link de gravação com consentimento recusado ou não solicitado", () => {
    expect(avaliarBloqueiosCA04({ consentimentoGravacao: "Recusado", linkGravacao: "x" }).some((x) => x.regra === 3)).toBe(true);
    expect(avaliarBloqueiosCA04({ consentimentoGravacao: "Não solicitado", linkGravacao: "x" }).some((x) => x.regra === 4)).toBe(true);
  });

  it("exige data, canal e versão do aviso quando o consentimento é concedido", () => {
    expect(avaliarBloqueiosCA04({ consentimentoGravacao: "Concedido" }).some((x) => x.regra === 5)).toBe(true);
  });

  it("bloqueia pesquisa aplicável sem autorização registrada", () => {
    expect(avaliarBloqueiosCA04({ pesquisaAplicavel: true, autorizacaoPesquisaPrevia: "Pendente" }).some((x) => x.regra === 10)).toBe(true);
    expect(avaliarBloqueiosCA04({ pesquisaAplicavel: true, autorizacaoPesquisaPrevia: "Registrada" }).some((x) => x.regra === 10)).toBe(false);
  });

  it("não aceita pagamento confirmado sem referência transacional", () => {
    expect(avaliarBloqueiosCA04({ eixoFormalizacao: "Pagamento inicial confirmado" }).some((x) => x.regra === 14)).toBe(true);
  });

  it("registro completo não gera bloqueio", () => {
    expect(
      avaliarBloqueiosCA04({
        leadAtivo: true,
        areaResponsavel: "Comercial",
        responsavelNominal: "Pessoa cadastrada",
        proximaAcao: "Enviar proposta",
        dataProximaAcao: "2026-08-25",
      }),
    ).toEqual([]);
  });
});

describe("CA-04 — derivação do resultado comercial", () => {
  it("nunca deriva Convertido sem a decisão humana pendente", () => {
    const r = derivarResultadoComercial({ eixoComercial: "Negociação", eixoFormalizacao: "Cliente ativo" });
    expect(r.resultado).not.toBe("Convertido");
    expect(r.dependeDecisaoHumana).toBe(true);
  });

  it("desdobra perda pelo motivo registrado", () => {
    expect(derivarResultadoComercial({ eixoComercial: "Perdido", motivoPerda: "Preço" }).resultado).toBe("Perdido — preço");
  });

  it("mantém Em aberto antes da proposta", () => {
    expect(derivarResultadoComercial({ eixoComercial: "Triagem" }).resultado).toBe("Em aberto");
  });
});

describe("CA-04 — estados, discovery e handoff", () => {
  it("expõe apenas transições válidas do estado atual", () => {
    const t = transicoesPermitidas("comercial", "Negociação").map((x) => x.para);
    expect(t).toContain("Perdido");
    expect(t).toContain("Encerrado sem aderência");
    expect(t).not.toContain("Proposta enviada");
  });

  it("mantém a cadeia formal completa até Arquivado", () => {
    expect(EIXO_FORMALIZACAO_TRANSICOES.at(-1)?.para).toBe("Arquivado");
    expect(EIXO_COMERCIAL_TRANSICOES.length).toBeGreaterThanOrEqual(9);
  });

  it("roteiro de Discovery não usa linguagem jurídica conclusiva", () => {
    expect(ROTEIRO_DISCOVERY_V2).toHaveLength(16);
    expect(roteiroSemLinguagemConclusiva()).toBe(true);
    expect(roteiroSemLinguagemConclusiva(["Confirmar elegibilidade confirmada"])).toBe(false);
  });

  it("handoff termina no cliente somente após aprovação humana", () => {
    expect(MATRIZ_HANDOFF_CA04).toHaveLength(5);
    expect(MATRIZ_HANDOFF_CA04.at(-1)?.condicaoAprovacao).toMatch(/Revisão humana obrigatória/);
    expect(BRIEF_DISCOVERY.some((c) => c.campo === "Sinal de aderência preliminar" && c.retornaAoCrm)).toBe(true);
  });

  it("mantém as 13 decisões humanas pendentes", () => {
    expect(DECISOES_PENDENTES_CA04).toHaveLength(13);
  });
});
