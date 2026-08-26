import { describe, expect, it } from "vitest";

import {
  bloqueiosDeUso,
  checkoutHabilitado,
  linkConsistente,
  pendenciasDeHomologacao,
  podeAlimentarProposta,
  saneamentoDeCatalogo,
  valorInferido,
  type LinkCobrancaRef,
  type SkuCanonico,
} from "@/lib/catalogo-canonico";

function sku(over: Partial<SkuCanonico> = {}): SkuCanonico {
  return {
    id: "id-1",
    sku_codigo: "CA-SKU-001",
    produto: "Estudo Genealógico",
    categoria: "Pesquisa",
    subcategoria: null,
    estado_catalogo: "homologado_ativo",
    prioridade_portfolio: "top_10",
    responsavel_comercial: "Comercial",
    responsavel_operacional: "Operações",
    versao_catalogo: "v1",
    vigencia_inicio: "2026-01-01",
    vigencia_fim: null,
    preco: 1290,
    moeda: "BRL",
    preco_fonte: "planilha-mestre",
    preco_estado_homologacao: "homologado",
    tipo_cobranca: "avulsa",
    entregaveis: ["Relatório"],
    inclusoes: ["Pesquisa em base interna"],
    exclusoes: ["Tradução juramentada"],
    pre_requisitos: [],
    dependencias_externas: [],
    prazo_fonte_formal: null,
    escopo_aplicavel: ["individual"],
    regras_anexos: [],
    regra_uso: "Aplicável a requerente único",
    planilha_mestre_versao: "v1.0",
    planilha_mestre_identificador: "TOP30-001",
    responsavel_validacao_fonte: "Danilo",
    estado_reconciliacao: "reconciliado",
    homologado_por: "Danilo",
    homologado_em: "2026-01-05",
    substituido_por: null,
    dados_teste: false,
    atualizado_em: "2026-01-05",
    links: [],
    usos_pendentes: 2,
    ...over,
  };
}

function link(over: Partial<LinkCobrancaRef> = {}): LinkCobrancaRef {
  return {
    id: "l1",
    sku_codigo: "CA-SKU-001",
    estado_link: "ativo_validado",
    tipo_link: "checkout",
    referencia_url: "https://exemplo/ref",
    valor_validado: 1290,
    moeda: "BRL",
    validado_em: "2026-01-06",
    validado_por: "Financeiro",
    versao_sku_associada: "v1",
    versao_preco_associada: "v1",
    divergencia: null,
    observacao_interna: null,
    dados_teste: false,
    ...over,
  };
}

describe("catálogo canônico — homologação", () => {
  it("nunca infere preço ou prazo", () => {
    expect(valorInferido()).toBeNull();
  });

  it("SKU sem preço homologado não pode ser homologado nem usado em proposta", () => {
    const s = sku({ preco: null, preco_estado_homologacao: "nao_homologado", preco_fonte: null });
    expect(pendenciasDeHomologacao(s)).toContain("Preço sem fonte homologada");
    expect(podeAlimentarProposta(s)).toBe(false);
    expect(bloqueiosDeUso(s)).toContain("Preço sem homologação");
  });

  it("SKU sem entregável bloqueia homologação e uso", () => {
    const s = sku({ entregaveis: [] });
    expect(pendenciasDeHomologacao(s)).toContain("Sem entregáveis");
    expect(podeAlimentarProposta(s)).toBe(false);
  });

  it("SKU sem proprietário bloqueia uso", () => {
    expect(bloqueiosDeUso(sku({ responsavel_comercial: null }))).toContain("SKU sem proprietário");
  });

  it("SKU completo e homologado libera uso em proposta", () => {
    expect(podeAlimentarProposta(sku())).toBe(true);
    expect(pendenciasDeHomologacao(sku())).toEqual([]);
  });

  it("SKU marcado como TESTE nunca alimenta proposta real", () => {
    expect(bloqueiosDeUso(sku({ dados_teste: true }))).toContain("SKU marcado como TESTE");
  });
});

describe("catálogo canônico — links de cobrança (somente referência)", () => {
  it("link com valor divergente do preço homologado é inconsistente", () => {
    const r = linkConsistente(sku(), link({ valor_validado: 990 }));
    expect(r.consistente).toBe(false);
    expect(r.motivo).toBe("Valor do link divergente do preço homologado");
  });

  it("link de SKU não homologado é inconsistente", () => {
    expect(linkConsistente(sku({ estado_catalogo: "rascunho" }), link()).consistente).toBe(false);
  });

  it("checkout só habilita com exatamente um link coerente", () => {
    expect(checkoutHabilitado(sku({ links: [link()] }))).toBe(true);
    expect(checkoutHabilitado(sku({ links: [link(), link({ id: "l2" })] }))).toBe(false);
    expect(checkoutHabilitado(sku({ links: [] }))).toBe(false);
  });

  it("uso com exigência de checkout bloqueia sem link validado", () => {
    expect(bloqueiosDeUso(sku(), { exigeCheckout: true })).toContain(
      "Link de cobrança não validado",
    );
  });
});

describe("catálogo canônico — filas do Painel Hoje", () => {
  it("classifica as quatro filas e esconde TESTE por padrão", () => {
    const dados = [
      sku({ sku_codigo: "A", entregaveis: [] }),
      sku({ sku_codigo: "B", links: [link({ sku_codigo: "B", valor_validado: 1 })] }),
      sku({
        sku_codigo: "C",
        estado_catalogo: "em_revisao",
        links: [link({ sku_codigo: "C" })],
      }),
      sku({
        sku_codigo: "D",
        prioridade_portfolio: "fora_do_portfolio",
        tipo_cobranca: "sob_consulta",
      }),
      sku({ sku_codigo: "T", dados_teste: true, entregaveis: [] }),
    ];
    const { filas, indicadores } = saneamentoDeCatalogo(dados);
    expect(filas.bloqueia_proposta.map((i) => i.sku_codigo)).toContain("A");
    expect(filas.revisar_link.map((i) => i.sku_codigo)).toContain("B");
    expect(filas.pronto_homologacao.map((i) => i.sku_codigo)).toContain("C");
    expect(filas.portfolio_racionalizar.map((i) => i.sku_codigo)).toContain("D");
    const todos = Object.values(filas)
      .flat()
      .map((i) => i.sku_codigo);
    expect(todos).not.toContain("T");
    expect(indicadores.bloqueiam_proposta).toBe(filas.bloqueia_proposta.length);
  });

  it("um SKU aparece uma única vez por fila", () => {
    const { filas } = saneamentoDeCatalogo([sku({ entregaveis: [], inclusoes: [] })]);
    expect(filas.bloqueia_proposta).toHaveLength(1);
  });

  it("filtro explícito inclui registros de teste", () => {
    const { filas } = saneamentoDeCatalogo(
      [sku({ sku_codigo: "T", dados_teste: true, entregaveis: [] })],
      {
        incluirTeste: true,
      },
    );
    expect(filas.bloqueia_proposta.map((i) => i.sku_codigo)).toContain("T");
  });
});
