import { describe, expect, it } from "vitest";

import {
  itensRevisao,
  resumoRevisao,
  selecaoHomologavel,
  validarConfirmacaoLote,
  type DecisaoRevisao,
} from "@/lib/homologacao-revisao";
import type { SkuCanonico } from "@/lib/catalogo-canonico";

const base = (over: Partial<SkuCanonico>): SkuCanonico =>
  ({
    id: "id-1",
    sku_codigo: "SKU-001",
    produto: "Estudo genealógico",
    categoria: "Pesquisa",
    subcategoria: null,
    estado_catalogo: "rascunho",
    prioridade_portfolio: "cauda_longa",
    responsavel_comercial: "Tati",
    responsavel_operacional: "Tati",
    versao_catalogo: "v1",
    vigencia_inicio: "2026-01-01",
    vigencia_fim: null,
    preco: 1000,
    moeda: "BRL",
    preco_fonte: "Planilha mestre v3",
    preco_estado_homologacao: "nao_homologado",
    tipo_cobranca: "avulsa",
    entregaveis: ["Relatório"],
    inclusoes: ["Pesquisa"],
    exclusoes: ["Tradução"],
    pre_requisitos: [],
    dependencias_externas: [],
    prazo_fonte_formal: "60 dias",
    escopo_aplicavel: ["familiar"],
    regras_anexos: [],
    regra_uso: "Uso familiar",
    planilha_mestre_versao: "v3",
    planilha_mestre_identificador: "CAT-MESTRE",
    responsavel_validacao_fonte: "Tati",
    estado_reconciliacao: "reconciliado",
    homologado_por: null,
    homologado_em: null,
    substituido_por: null,
    dados_teste: false,
    atualizado_em: null,
    links: [],
    usos_pendentes: 0,
    ...over,
  }) as SkuCanonico;

describe("revisão item a item para homologação", () => {
  it("marca como elegível o SKU completo ainda não homologado", () => {
    const [i] = itensRevisao([base({})]);
    expect(i.pendencias).toEqual([]);
    expect(i.elegivel).toBe(true);
  });

  it("bloqueia SKU sem responsáveis, entregáveis ou fonte de preço", () => {
    const [i] = itensRevisao([
      base({
        id: "id-2",
        sku_codigo: "SKU-002",
        responsavel_comercial: null,
        entregaveis: [],
        preco_fonte: null,
      }),
    ]);
    expect(i.elegivel).toBe(false);
    expect(i.pendencias.length).toBeGreaterThan(0);
  });

  it("oculta SKU de teste e ordena por código", () => {
    const itens = itensRevisao([
      base({ id: "b", sku_codigo: "SKU-009" }),
      base({ id: "a", sku_codigo: "SKU-002" }),
      base({ id: "t", sku_codigo: "SKU-T", dados_teste: true }),
    ]);
    expect(itens.map((i) => i.sku)).toEqual(["SKU-002", "SKU-009"]);
  });

  it("exige decisão em todos os itens, motivo e confirmação explícita", () => {
    const itens = itensRevisao([
      base({ id: "a", sku_codigo: "SKU-002" }),
      base({ id: "b", sku_codigo: "SKU-003" }),
    ]);
    const decisoes: Record<string, DecisaoRevisao> = { a: "homologar" };
    const erros = validarConfirmacaoLote({ itens, decisoes, motivo: "curto", confirmado: false });
    expect(erros).toHaveLength(3);
  });

  it("recusa marcar item bloqueado como homologar", () => {
    const itens = itensRevisao([base({ id: "a", sku_codigo: "SKU-002", exclusoes: [] })]);
    const erros = validarConfirmacaoLote({
      itens,
      decisoes: { a: "homologar" },
      motivo: "homologação revisada item a item",
      confirmado: true,
    });
    expect(erros.some((e) => e.includes("pendência bloqueante"))).toBe(true);
  });

  it("aceita lote válido e devolve apenas os elegíveis", () => {
    const itens = itensRevisao([
      base({ id: "a", sku_codigo: "SKU-002" }),
      base({ id: "b", sku_codigo: "SKU-003" }),
    ]);
    const entrada = {
      itens,
      decisoes: { a: "homologar", b: "manter_rascunho" } as Record<string, DecisaoRevisao>,
      motivo: "homologação revisada item a item",
      confirmado: true,
    };
    expect(validarConfirmacaoLote(entrada)).toEqual([]);
    expect(selecaoHomologavel(entrada)).toEqual(["a"]);
    expect(resumoRevisao(itens, entrada.decisoes)).toMatchObject({
      total: 2,
      revisados: 2,
      marcados_homologar: 1,
      elegiveis: 2,
    });
  });
});
