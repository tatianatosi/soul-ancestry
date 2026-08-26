import { describe, expect, it } from "vitest";

import {
  avaliarCondicao,
  avaliarElegibilidadePreco,
  avaliarPlanoInicial,
  avaliarPromocaoCaseService,
  divergenciasDeValor,
  validarGravacaoPreco,
  type CondicaoComercial,
  type CriterioRegistro,
  type ProdutoHomologacao,
} from "@/lib/condicao-comercial";

const HOJE = new Date("2026-08-25T00:00:00Z");

const produtoOk: ProdutoHomologacao = {
  id: "p1",
  code: "PROD-DIAG-FAM-MULTI",
  status_homologacao: "homologado",
  preco_comercial_vigente: 9600,
  homologado_por: "Tatiana Tosi",
  homologado_em: "2026-08-01",
  vigencia_inicio: "2026-08-01",
  vigencia_fim: "2026-12-31",
  ativo: true,
};

const condicaoCompleta: CondicaoComercial = {
  codigo: "COND-01",
  forma_pagamento: "pix",
  parcelas: 4,
  valor_parcela: 2400,
  valor_total_referencia: 9600,
  vencimento_dia: 10,
  primeiro_vencimento: "2026-09-10",
  condicao_aplicavel: "à vista ou 4x sem juros",
  status: "homologada",
  homologado_por: "Tatiana Tosi",
  homologado_em: "2026-08-20",
};

const criterio = (over: Partial<CriterioRegistro> = {}): CriterioRegistro => ({
  criterio_codigo: "CRIT-1",
  obrigatorio: true,
  status: "aceito",
  decidido_por: "Tatiana",
  decidido_em: "2026-08-21",
  justificativa: "conferido",
  evidencia_interna: "dossiê interno",
  ...over,
});

describe("ANA-C-01 — condição comercial e consolidação", () => {
  it("1. produto sem homologador/data/vigência bloqueia a condição comercial", () => {
    const eleg = avaliarElegibilidadePreco(
      { ...produtoOk, homologado_por: null, vigencia_inicio: null },
      HOJE,
    );
    expect(eleg.elegivel).toBe(false);
    expect(eleg.uso_contratual_financeiro).toBe("bloqueado");
    const av = avaliarCondicao(condicaoCompleta, eleg);
    expect(av.homologada).toBe(false);
    expect(av.bloqueios.map((b) => b.codigo)).toContain("PRECO_NAO_HOMOLOGADO");
  });

  it("2. divergência de valor gera bloqueio e não ajuste automático", () => {
    const divs = divergenciasDeValor(
      [
        { origem: "proposta_canva", valor: 9800 },
        { origem: "case_service", valor: 9600 },
      ],
      9600,
    );
    expect(divs).toHaveLength(1);
    expect(divs[0].codigo).toBe("VALOR_DIVERGENTE");
    expect(divs[0].descricao).toMatch(/nenhum valor foi ajustado/i);

    const prom = avaliarPromocaoCaseService({
      criterios: [criterio()],
      condicao: avaliarCondicao(condicaoCompleta, avaliarElegibilidadePreco(produtoOk, HOJE)),
      referenciaContratualInterna: "REF-INTERNA-01",
      divergencias: divs,
    });
    expect(prom.statusPermitido).toBe("draft");
  });

  it("3. critério pendente impede promoção do case service", () => {
    const eleg = avaliarElegibilidadePreco(produtoOk, HOJE);
    const prom = avaliarPromocaoCaseService({
      criterios: [
        criterio(),
        criterio({ criterio_codigo: "CRIT-2", status: "pendente_decisao_humana" }),
      ],
      condicao: avaliarCondicao(condicaoCompleta, eleg),
      referenciaContratualInterna: "REF-INTERNA-01",
      divergencias: [],
    });
    expect(prom.statusPermitido).toBe("draft");
    expect(prom.bloqueios.map((b) => b.codigo)).toContain("CRITERIO_ACEITE_PENDENTE");
  });

  it("3b. tudo completo libera aprovação", () => {
    const eleg = avaliarElegibilidadePreco(produtoOk, HOJE);
    const prom = avaliarPromocaoCaseService({
      criterios: [criterio()],
      condicao: avaliarCondicao(condicaoCompleta, eleg),
      referenciaContratualInterna: "REF-INTERNA-01",
      divergencias: [],
    });
    expect(prom.statusPermitido).toBe("approved");
  });

  it("4. plano vazio não satisfaz o plano inicial", () => {
    const vazio = avaliarPlanoInicial({
      responsavelUserId: null,
      caseServiceStatusPermitido: "draft",
      proximaAcao: null,
      checklistItens: 0,
      onboardingLiberado: false,
      primeiraEntrega: null,
    });
    expect(vazio.ok).toBe(false);
    expect(vazio.pendentes).toHaveLength(5);

    const semOnboarding = avaliarPlanoInicial({
      responsavelUserId: "u1",
      caseServiceStatusPermitido: "approved",
      proximaAcao: { descricao: "Conferir documentos", data: "2026-09-01" },
      checklistItens: 4,
      onboardingLiberado: false,
      primeiraEntrega: { titulo: "Dossiê-mãe", data: "2026-09-10" },
    });
    expect(semOnboarding.ok).toBe(false);
    expect(semOnboarding.criterios.at(-1)!.detalhe).toMatch(/Onboarding não liberado/);
  });

  it("5. nenhum campo de preço pode ser gravado livremente", () => {
    const eleg = avaliarElegibilidadePreco(produtoOk, HOJE);
    expect(
      validarGravacaoPreco({
        campos: { preco_acordado: 8000 },
        precoCatalogo: 9600,
        elegibilidade: eleg,
      }).permitido,
    ).toBe(false);
    expect(
      validarGravacaoPreco({
        campos: { valor_total_referencia: 9600 },
        precoCatalogo: 9600,
        elegibilidade: eleg,
      }).permitido,
    ).toBe(true);
    const semHomolog = avaliarElegibilidadePreco({ ...produtoOk, homologado_em: null }, HOJE);
    expect(
      validarGravacaoPreco({
        campos: { preco_acordado: 9600 },
        precoCatalogo: 9600,
        elegibilidade: semHomolog,
      }).permitido,
    ).toBe(false);
    expect(
      validarGravacaoPreco({
        campos: {},
        precoCatalogo: 9600,
        elegibilidade: eleg,
        parcelamento: { parcelas: 3, valor_parcela: 2400 },
      }).permitido,
    ).toBe(false);
  });
});
