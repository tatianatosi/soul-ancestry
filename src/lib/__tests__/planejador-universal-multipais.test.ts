import { describe, expect, it } from "vitest";

import {
  ITENS_ARQUIVADOS_DECISAO_PROPRIETARIA,
  itemPermitidoEmRecomendacaoComercial,
  podeExporPrecoComercialmente,
  proibirPlanilhaMestreRuntime,
} from "@/lib/cadeia-catalogo-planejador";
import {
  DICIONARIO_SKUS_91,
  TOTAL_SKUS_DICIONARIO,
  ehAliasPacoteLegado,
  entradaSku91,
  preListaOperacionalSkus,
  skuArquivadoDecisao,
} from "@/lib/dicionario-skus-91";
import {
  CENARIO_ANA_LUIZA,
  CENARIO_DANILO,
  CENARIO_JOAO,
  ESPECIFICACOES_PAIS_PENDENTES,
  ITENS_GEN_MULTI_PENDENTES,
  calcularCustoMultipais,
  filtrarTrilhasReaisDanilo,
  gapResearchBaseDeclarado,
  microentregaVisivelNoApp,
  pagamentoAtivaCasoAutomaticamente,
  paisSemCtaLinkCobranca,
  podeAbrirCasoAtivoAposPagamento,
  propostaCanvaPodeLerFonte,
  recomendacaoComercialSemCurso,
  totalCondicaoCaso,
} from "@/lib/planejador-universal-multipais";
import {
  MATRIZ_PRECOS_RESGATADOS,
  PRECO_ANA_LUIZA_AT,
  PRECOS_DIVERGENTES_SPEC,
  PRECOS_ITENS_RESGATADOS,
  PRECOS_PENDENTES_HOMOLOGACAO,
  anaLuizaIsoladaDoCatalogo,
  avaliarExposicaoPrecoResgatado,
} from "@/lib/precos-resgatados-matriz";

describe("prompt v2.1 — cenários Ana / João / Danilo", () => {
  it("Ana Luiza: R$ 9.600 isolada do catálogo AT R$ 4.800", () => {
    expect(anaLuizaIsoladaDoCatalogo()).toBe(true);
    expect(PRECO_ANA_LUIZA_AT.amount).toBe(9600);
    expect(PRECO_ANA_LUIZA_AT.caseOnly).toBe(true);
    expect(avaliarExposicaoPrecoResgatado(PRECO_ANA_LUIZA_AT).podeExpor).toBe(false);
    expect(CENARIO_ANA_LUIZA.trilha.countryCode).toBe("AT");
    expect(CENARIO_ANA_LUIZA.referenciaCatalogoAt).toBe(4800);
  });

  it("João: Portugal sem via confirmada — pagamento não ativa caso sozinho", () => {
    expect(CENARIO_JOAO.countryCode).toBe("PT");
    expect(CENARIO_JOAO.viaConfirmada).toBe(false);
    expect(CENARIO_JOAO.aceiteVerbal).toBe(true);
    expect(
      pagamentoAtivaCasoAutomaticamente({
        pagamentoConfirmado: true,
        onboardingConcluido: false,
        decisaoOperacional: false,
      }),
    ).toBe(false);
    expect(
      podeAbrirCasoAtivoAposPagamento({
        pagamentoConfirmado: true,
        onboardingConcluido: true,
        decisaoOperacional: true,
      }),
    ).toBe(true);
  });

  it("Danilo: só Croácia real; remove IT/DE modelo", () => {
    const filtradas = filtrarTrilhasReaisDanilo([
      { countryCode: "HR", origem: "real" },
      { countryCode: "IT", origem: "modelo" },
      { countryCode: "DE", origem: "modelo" },
    ]);
    expect(filtradas).toEqual([{ countryCode: "HR", origem: "real" }]);
    expect([...CENARIO_DANILO.trilhasModeloARemover]).toEqual(["IT", "DE"]);
  });
});

describe("prompt v2.1 — multipaís, HU/LU/IE, curso, Canva", () => {
  it("IT+DE: uma research_base, base cobrada uma vez", () => {
    const r = calcularCustoMultipais({
      basePesquisaCompartilhada: 2000,
      researchBaseId: "rb-familia-1",
      trilhas: [
        { trackId: "t-it", countryCode: "IT", branchId: "paterno", researchBaseId: "rb-familia-1" },
        { trackId: "t-de", countryCode: "DE", branchId: "materno", researchBaseId: "rb-familia-1" },
      ],
      incrementais: [
        { trackId: "t-it", itemId: "CA-CID-001", amount: 247, approvalStatus: "aprovado" },
        { trackId: "t-de", itemId: "CA-CID-DE-001", amount: 247, approvalStatus: "aprovado" },
      ],
    });
    expect(r.baseCobradaVezes).toBe(1);
    expect(r.total).toBe(2494);
    expect(r.motivoBloqueio).toBeNull();
    expect(gapResearchBaseDeclarado()).toBe(true);
  });

  it("HU/LU/IE: sem CTA, link ou cobrança", () => {
    for (const cc of ["HU", "LU", "IE"] as const) {
      expect(paisSemCtaLinkCobranca(cc)).toBe(true);
    }
    expect(
      PRECOS_PENDENTES_HOMOLOGACAO.filter((p) => ["HU", "LU", "IE"].includes(p.countryCode ?? "")).every(
        (p) => p.amount === null && !avaliarExposicaoPrecoResgatado(p).podeExpor,
      ),
    ).toBe(true);
  });

  it("CA-CURSO-001 ausente de recomendação comercial", () => {
    expect(ITENS_ARQUIVADOS_DECISAO_PROPRIETARIA).toContain("CA-CURSO-001");
    expect(itemPermitidoEmRecomendacaoComercial("CA-CURSO-001")).toBe(false);
    expect(skuArquivadoDecisao("CA-CURSO-001")).toBe(true);
    expect(recomendacaoComercialSemCurso(["CA-CID-001", "CA-CURSO-001", "CA-ASS-001"])).toEqual([
      "CA-CID-001",
      "CA-ASS-001",
    ]);
  });

  it("Proposta Canva: só condição aprovada; bloqueia planilha legada", () => {
    expect(proibirPlanilhaMestreRuntime("planilha_mestre").permitido).toBe(false);
    expect(propostaCanvaPodeLerFonte("planilha_mestre").ok).toBe(false);
    expect(propostaCanvaPodeLerFonte("parametros_xlsx").ok).toBe(false);
    expect(propostaCanvaPodeLerFonte("commercial_conditions").ok).toBe(true);
    expect(
      totalCondicaoCaso({
        conditionId: "cc-1",
        caseId: "caso-ana",
        version: 1,
        approvalStatus: "aprovada",
        honorarios: 9600,
        despesasTerceiros: 0,
        taxasOficiais: 0,
        descontos: 0,
        fonteLeitura: "commercial_conditions",
      }),
    ).toBe(9600);
    expect(
      totalCondicaoCaso({
        conditionId: "cc-1",
        caseId: "caso-ana",
        version: 1,
        approvalStatus: "rascunho",
        honorarios: 9600,
        despesasTerceiros: 0,
        taxasOficiais: 0,
        descontos: 0,
        fonteLeitura: "commercial_conditions",
      }),
    ).toBeNull();
  });

  it("só HOMOLOGADO_CATALOGO pode expor; divergências e referências bloqueiam", () => {
    expect(podeExporPrecoComercialmente("HOMOLOGADO_CATALOGO")).toBe(true);
    expect(PRECOS_DIVERGENTES_SPEC.every((p) => !avaliarExposicaoPrecoResgatado(p).podeExpor)).toBe(true);
    expect(
      MATRIZ_PRECOS_RESGATADOS.filter((p) => p.priceStatus === "REFERENCIA_RESGATADA").every(
        (p) => !avaliarExposicaoPrecoResgatado(p).podeExpor,
      ),
    ).toBe(true);
  });
});

describe("prompt v2.1 — dicionário 91 SKUs e matriz expandida", () => {
  it("dicionário tem exatamente 91 SKUs; curso arquivado; PACOTE é alias", () => {
    expect(TOTAL_SKUS_DICIONARIO).toBe(91);
    expect(DICIONARIO_SKUS_91).toHaveLength(91);
    expect(entradaSku91("CA-CURSO-001")?.statusMotor).toBe("ARQUIVADO_DECISAO_PROPRIETARIA");
    expect(preListaOperacionalSkus().length).toBeGreaterThan(0);
    expect(ehAliasPacoteLegado("PACOTE-PT-01")).toBe(true);
    expect(ehAliasPacoteLegado("CA-CID-001")).toBe(false);
  });

  it("matriz inclui itens IT/DE/AT/ASS/WPP/FAM e specs GEN-MULTI pendentes", () => {
    const ids = PRECOS_ITENS_RESGATADOS.map((p) => p.itemId);
    for (const id of [
      "CA-CID-001",
      "CA-CID-002D",
      "CA-CID-019",
      "CA-CID-DE-003b",
      "CA-CID-AT-001",
      "CA-ASS-001",
      "CA-WPP-001",
      "CA-FAM-002",
    ]) {
      expect(ids).toContain(id);
    }
    expect(ITENS_GEN_MULTI_PENDENTES).toHaveLength(6);
    expect(ESPECIFICACOES_PAIS_PENDENTES).toContain("CA-CID-HU-001");
    expect(microentregaVisivelNoApp("PLANEJADA")).toBe(false);
    expect(microentregaVisivelNoApp("LIBERADA")).toBe(true);
  });
});
