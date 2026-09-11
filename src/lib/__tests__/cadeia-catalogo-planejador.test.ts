import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CADEIA_CATALOGO_NUNCA_COBRA,
  CADEIA_CATALOGO_NUNCA_LE_PLANILHA_RUNTIME,
  DE_PARA_ENTIDADES_CADEIA,
  ELOS_CADEIA_CATALOGO,
  ITENS_ARQUIVADOS_DECISAO_PROPRIETARIA,
  TABELAS_PROIBIDAS_INVENTAR,
  bloqueiaExposicaoComercial,
  ehFonteLegadoPlanilha,
  fonteOperacionalPermitida,
  itemPermitidoEmRecomendacaoComercial,
  podeExporPrecoComercialmente,
  proibirPlanilhaMestreRuntime,
} from "@/lib/cadeia-catalogo-planejador";
import {
  MATRIZ_PRECOS_RESGATADOS,
  PRECO_ANA_LUIZA_AT,
  PRECOS_DIVERGENTES_SPEC,
  PRECOS_PENDENTES_HOMOLOGACAO,
  anaLuizaIsoladaDoCatalogo,
  avaliarExposicaoPrecoResgatado,
} from "@/lib/precos-resgatados-matriz";
import { fonteOficialDePreco, REGRAS_PRECO_SKU } from "@/lib/precos-sku";
import { FONTES_CANONICAS_PRECO } from "@/lib/preco-canonico";
import { FONTES_PRECO_HOMOLOGADAS, precoDeFonteHomologada } from "@/lib/perfil-institucional";
import {
  CRM_VIVO_E_PROJECAO_DO_CASO_360,
  derivarHigienePrecoPainel,
  derivarRadarJuridicoPainel,
  excluirDemoDaFilaOperacional,
  type ItemOperacionalDia,
} from "@/lib/sistema-operacional-dia";

describe("cadeia Legado → Alimento → Planejador → Caso 360", () => {
  it("declara os elos na ordem correta", () => {
    expect(ELOS_CADEIA_CATALOGO[0]).toBe("legado_inventariado");
    expect(ELOS_CADEIA_CATALOGO).toContain("lista_alimento_versionada");
    expect(ELOS_CADEIA_CATALOGO).toContain("caso_360");
    expect(ELOS_CADEIA_CATALOGO.at(-1)).toBe("whatsapp_comunica_liberado");
  });

  it("mapeia para tabelas reais — sem inventar nomes do prompt", () => {
    expect(DE_PARA_ENTIDADES_CADEIA.lista_alimento).toBe("planner_catalog_feed");
    expect(DE_PARA_ENTIDADES_CADEIA.precos_resgatados).toBe("price_catalog_rescued");
    expect(DE_PARA_ENTIDADES_CADEIA.caso_planejador).toBe("case_plans");
    expect(TABELAS_PROIBIDAS_INVENTAR).toContain("legacy_catalog_import");
    expect(TABELAS_PROIBIDAS_INVENTAR).toContain("legal_framework");
  });

  it("proíbe Planilha Mestre em runtime", () => {
    expect(CADEIA_CATALOGO_NUNCA_LE_PLANILHA_RUNTIME).toBe(true);
    expect(ehFonteLegadoPlanilha("planilha_mestre")).toBe(true);
    expect(proibirPlanilhaMestreRuntime("planilha_mestre").permitido).toBe(false);
    expect(fonteOperacionalPermitida("planilha_mestre")).toBe(false);
    expect(fonteOperacionalPermitida("product_catalog")).toBe(true);
    expect(fonteOperacionalPermitida("planner_catalog_feed")).toBe(true);
  });

  it("CA-CURSO-001 fora de recomendação comercial", () => {
    expect(ITENS_ARQUIVADOS_DECISAO_PROPRIETARIA).toContain("CA-CURSO-001");
    expect(itemPermitidoEmRecomendacaoComercial("CA-CURSO-001")).toBe(false);
    expect(itemPermitidoEmRecomendacaoComercial("CA-CID-001")).toBe(true);
  });
});

describe("preços resgatados — exposição comercial", () => {
  it("só HOMOLOGADO_CATALOGO pode expor; demais bloqueiam", () => {
    expect(podeExporPrecoComercialmente("HOMOLOGADO_CATALOGO")).toBe(true);
    for (const s of [
      "REFERENCIA_RESGATADA",
      "DIVERGENTE",
      "PENDENTE_DE_HOMOLOGACAO",
      "CONDICAO_PARTICULAR_DE_CASO",
      "ARQUIVADO",
    ]) {
      expect(bloqueiaExposicaoComercial(s)).toBe(true);
      expect(podeExporPrecoComercialmente(s)).toBe(false);
    }
  });

  it("matriz do prompt: divergências IT/PT e pendentes HU/LU/IE não viram oferta", () => {
    expect(PRECOS_DIVERGENTES_SPEC.every((p) => !avaliarExposicaoPrecoResgatado(p).podeExpor)).toBe(
      true,
    );
    expect(PRECOS_PENDENTES_HOMOLOGACAO.every((p) => p.amount === null)).toBe(true);
    expect(
      PRECOS_PENDENTES_HOMOLOGACAO.every((p) => !avaliarExposicaoPrecoResgatado(p).podeExpor),
    ).toBe(true);
    expect(CADEIA_CATALOGO_NUNCA_COBRA).toBe(true);
  });

  it("Ana Luiza R$ 9.600 isolada do catálogo AT R$ 4.800", () => {
    expect(anaLuizaIsoladaDoCatalogo()).toBe(true);
    expect(PRECO_ANA_LUIZA_AT.caseOnly).toBe(true);
    expect(PRECO_ANA_LUIZA_AT.amount).toBe(9600);
    expect(avaliarExposicaoPrecoResgatado(PRECO_ANA_LUIZA_AT).podeExpor).toBe(false);
  });

  it("curso arquivado na matriz não pode expor", () => {
    const curso = MATRIZ_PRECOS_RESGATADOS.find((p) => p.itemId === "CA-CURSO-001");
    expect(curso).toBeTruthy();
    expect(avaliarExposicaoPrecoResgatado(curso!).podeExpor).toBe(false);
  });
});

describe("drift Planilha → product_catalog", () => {
  it("precos-sku alinhado a preco-canonico", () => {
    expect(fonteOficialDePreco("product_catalog")).toBe(true);
    expect(fonteOficialDePreco("excecao_comercial_aprovada")).toBe(true);
    expect(fonteOficialDePreco("planilha_mestre")).toBe(false);
    expect(FONTES_CANONICAS_PRECO).toContain("product_catalog");
    expect(REGRAS_PRECO_SKU.some((r) => /Planilha Mestre é legado/i.test(r))).toBe(true);
  });

  it("perfil institucional não homologa Planilha Mestre", () => {
    expect(FONTES_PRECO_HOMOLOGADAS).toContain("product_catalog");
    expect(FONTES_PRECO_HOMOLOGADAS as readonly string[]).not.toContain("planilha_mestre");
    expect(precoDeFonteHomologada("planilha_mestre")).toBe(false);
    expect(precoDeFonteHomologada("product_catalog")).toBe(true);
  });

  it("escritores comerciais não importam catalogo-fonte-mestre como preço vivo", () => {
    const arquivos = [
      "src/lib/precos-sku.ts",
      "src/lib/preco-canonico.ts",
      "src/lib/regra-comercial.functions.ts",
      "src/lib/conciliacao-catalogo.server.ts",
    ];
    for (const a of arquivos) {
      const txt = readFileSync(a, "utf8");
      expect(txt, a).not.toMatch(/from ["']@\/data\/catalogo-fonte-mestre["']/);
    }
  });
});

describe("projeção Painel / CRM Vivo", () => {
  it("declara CRM como projeção do Caso 360", () => {
    expect(CRM_VIVO_E_PROJECAO_DO_CASO_360).toMatch(/Caso 360/);
    expect(CRM_VIVO_E_PROJECAO_DO_CASO_360).toMatch(/Planilha Mestre/);
  });

  it("radar jurídico é somente leitura e exclui demo", () => {
    const itens = derivarRadarJuridicoPainel([
      {
        trackId: "trk-at",
        pais: "Áustria",
        via: "§58c",
        marcoTitulo: "StbG §58c",
        statusRegra: "aprovado",
        casosPotencialmenteAfetados: 1,
        responsavelRevisao: "Proprietária",
      },
      {
        trackId: "trk-demo",
        pais: "Demo",
        via: null,
        marcoTitulo: "Marco demo",
        statusRegra: "em_revisao",
        casosPotencialmenteAfetados: 0,
        responsavelRevisao: null,
        demo: true,
      },
    ]);
    expect(itens).toHaveLength(1);
    expect(itens[0]!.tipoAcao).toBe("somente_leitura");
    expect(itens[0]!.pais).toBe("Áustria");
  });

  it("higiene de preço divergente não vira CTA de cobrança", () => {
    const itens = derivarHigienePrecoPainel([
      {
        chave: "IT:div",
        countryCode: "IT",
        amount: 4500,
        priceStatus: "DIVERGENTE",
        caseOnly: false,
        notes: "divergência",
      },
    ]);
    expect(itens[0]!.tipoAcao).toBe("somente_leitura");
    expect(itens[0]!.categoria).toBe("falhas_dado_integracao");
    expect(itens[0]!.rotaDestino).toBe("/divergencias-catalogo");
  });

  it("exclui demo da fila operacional por padrão", () => {
    const base: ItemOperacionalDia = {
      id: "lead:1",
      categoria: "comercial_followup",
      prioridade: 6,
      estado: "pendente",
      objetoTipo: "lead",
      objetoId: "1",
      rotulo: "Lead real",
      motivo: "x",
      evidencia: "y",
      atualizadoEm: null,
      responsavel: "A",
      prazo: null,
      regraPrazo: null,
      proximaAcao: "z",
      rotaDestino: "/calls",
      tipoAcao: "acao_interna_permitida",
      origem: "real",
      dependeDe: null,
      classificacao: "OPERACIONAL",
    };
    const demo: ItemOperacionalDia = {
      ...base,
      id: "lead:demo",
      rotulo: "Demo Fixture",
      origem: "demo",
    };
    expect(excluirDemoDaFilaOperacional([base, demo])).toHaveLength(1);
    expect(excluirDemoDaFilaOperacional([base, demo], true)).toHaveLength(2);
  });
});
