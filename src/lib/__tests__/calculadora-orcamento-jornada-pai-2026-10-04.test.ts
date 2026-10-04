import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  calcularOrcamento,
  escopoEstruturadoDoOrcamento,
  motivoParaNaoAplicar,
  type EntradaItem,
} from "@/lib/orcamento-proposta";
import type { SkuPrecoSugerido } from "@/lib/preco-sugerido-canonico";

/**
 * Proprietária, 04/10/2026, literal: "em relação a calculadora de proposta no
 * momento só use todos os produtos específicos da jornada pai e planejador de
 * cidadania; quando digo como alimento que seja push pelo seletor, senão o
 * contrato da Ana vai ser bloqueado de novo, algo que já foi revisto
 * executado diversas vezes".
 *
 * Medido em 04/10, antes de mexer:
 *  - `product_catalog`: 118 linhas vivas, TODAS `estado_catalogo = rascunho`,
 *    TODAS com `produto_pai_id = NULL`, 90 com preço, 29 "elegíveis";
 *  - `planner_catalog_feed`: 99 itens vivos agrupados em 8 dos 9 produtos-pai,
 *    `price_status` nulo em todos — preço não é de catálogo;
 *  - a proposta da Ana: `aprovada`, R$ 9.600, BRL, `escopo_estruturado` nulo;
 *  - `motivoParaNaoAplicar` recusava QUALQUER orçamento com base legada — e,
 *    como todo o catálogo é legado, nada era aplicável. Era exatamente o
 *    travamento que ela previu.
 */

const SKU = (id: string, over: Partial<SkuPrecoSugerido> = {}): SkuPrecoSugerido => ({
  id,
  code: id,
  nome: `Item ${id}`,
  preco_sugerido: 1000,
  preco_atual: null,
  moeda: "BRL",
  fonte_versao: "v1",
  fonte_referencia: "CA · FIN · Planilha Mestre de Produtos OFICIAL 2.xlsx",
  vigencia_inicio: null,
  vigencia_fim: null,
  status_produto: "ativo",
  status_fonte: "ativo",
  ativo: true,
  archived_at: null,
  dados_teste: false,
  ...over,
});

const itemPlanejador = (id: string): EntradaItem => ({
  sku: SKU(id, { preco_sugerido: null, moeda: null, fonte_referencia: "planner_catalog_feed" }),
  origemItem: "planejador",
  quantidade: 1,
});

const itemAlimento = (id: string): EntradaItem => ({
  sku: SKU(id),
  origemItem: "alimento_legado",
  quantidade: 1,
  estadoCatalogo: "rascunho",
});

describe("alimento legado entra pelo seletor, mas não soma nem bloqueia", () => {
  it("item de alimento fica fora da soma e aparece na lista de alimento", () => {
    const o = calcularOrcamento({ itens: [itemAlimento("CA-CID-001")] });
    expect(o.alimento).toHaveLength(1);
    expect(o.somados).toHaveLength(0);
    expect(o.bloqueados).toHaveLength(0);
    expect(o.subtotal).toBe(0);
    expect(o.avisos.join(" ")).toContain("alimento");
  });

  it("alimento não é mais motivo de recusa quando há condição particular", () => {
    const o = calcularOrcamento({
      itens: [itemAlimento("CA-CID-001"), itemPlanejador("PP-03-ITEM")],
      condicaoParticular: { valor: 9600, moeda: "BRL", motivo: "Pacote familiar aprovado — 3 responsáveis × R$ 320 × 10 meses" },
    });
    expect(motivoParaNaoAplicar(o)).toBeNull();
  });
});

describe("condição particular aprovada é a base — o caso da Ana não trava", () => {
  const ANA = { valor: 9600, moeda: "BRL", motivo: "Pacote familiar aprovado — 3 responsáveis × R$ 320 × 10 meses" };

  it("com itens da jornada sem preço homologado, o total é o valor aprovado", () => {
    const o = calcularOrcamento({
      itens: [itemPlanejador("A"), itemPlanejador("B"), itemPlanejador("C")],
      condicaoParticular: ANA,
    });
    expect(o.total).toBe(9600);
    expect(o.moeda).toBe("BRL");
    expect(o.condicaoParticular?.motivo).toContain("Pacote familiar");
    expect(o.parcial).toBe(false);
    expect(motivoParaNaoAplicar(o)).toBeNull();
  });

  it("sem condição particular, item de jornada sem preço continua declarado, não vira zero", () => {
    const o = calcularOrcamento({ itens: [itemPlanejador("A")] });
    expect(o.somados).toHaveLength(0);
    expect(o.bloqueados).toHaveLength(1);
    expect(o.total).toBe(0);
    expect(motivoParaNaoAplicar(o)).toMatch(/Nenhum item com preço utilizável/);
  });

  it("condição particular sem motivo não é aplicada — e diz por quê", () => {
    const o = calcularOrcamento({
      itens: [itemPlanejador("A")],
      condicaoParticular: { valor: 9600, moeda: "BRL", motivo: "   " },
    });
    expect(o.condicaoParticular).toBeNull();
    expect(o.avisos.join(" ")).toContain("sem motivo registrado");
  });

  it("condição particular com valor zero ou negativo não entra", () => {
    for (const valor of [0, -100]) {
      const o = calcularOrcamento({ itens: [itemPlanejador("A")], condicaoParticular: { valor, moeda: "BRL", motivo: "teste" } });
      expect(o.condicaoParticular).toBeNull();
    }
  });

  it("a conta gravada registra a condição e o alimento, lado a lado", () => {
    const o = calcularOrcamento({ itens: [itemAlimento("CA-CID-001")], condicaoParticular: ANA });
    const escopo = escopoEstruturadoDoOrcamento(o) as unknown as Record<string, unknown>;
    expect((escopo.condicao_particular as { valor: number }).valor).toBe(9600);
    expect(escopo.alimento_legado).toHaveLength(1);
  });
});

describe("o seletor passou a ser a jornada do produto-pai", () => {
  const fonte = readFileSync("src/lib/orcamento-proposta.functions.ts", "utf8");
  const painel = readFileSync("src/components/contrato/calculadora-orcamento.tsx", "utf8");

  it("o leitor usa planner_catalog_feed, não o catálogo legado, como universo", () => {
    expect(fonte).toContain('from("planner_catalog_feed")');
    expect(fonte).toContain("produtoPaiPorId");
    expect(fonte).toContain("nomeDoProdutoPai");
  });

  it("o produto-pai do caso é empurrado para o topo, sem esconder os outros", () => {
    expect(fonte).toContain("doCaso");
    expect(fonte).toContain("a.doCaso ? -1 : 1");
  });

  it("o catálogo legado é devolvido como alimento, nunca utilizável", () => {
    expect(fonte).toContain('origemItem: "alimento_legado" as const');
    expect(fonte).toContain("fora da soma");
  });

  it("a tela separa jornada e alimento, e o alimento é opt-in pelo seletor", () => {
    expect(painel).toContain("data-itens-planejador");
    expect(painel).toContain("data-itens-alimento");
    expect(painel).toContain("data-abrir-alimento");
    expect(painel).toContain("Empurrar alimento pelo seletor");
  });

  it("a tela pede valor e motivo da condição particular aprovada", () => {
    expect(painel).toContain("Condição particular aprovada (valor do caso, em reais)");
    expect(painel).toContain("Motivo da condição particular");
    expect(painel).toContain("condicaoParticular");
  });
});
