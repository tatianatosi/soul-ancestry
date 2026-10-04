import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  calcularOrcamento,
  escopoEstruturadoDoOrcamento,
  formatarDinheiro,
  motivoParaNaoAplicar,
} from "@/lib/orcamento-proposta";
import { SELO_PRECO_SUGERIDO, type SkuPrecoSugerido } from "@/lib/preco-sugerido-canonico";

/**
 * Calculadora de orçamento ligada à proposta (03/10/2026) — "tem uma
 * calculadora de valor para orçamento ligado a proposta revise e também
 * execute".
 *
 * A revisão achou a lacuna: a regra do preço sugerido canônico declarava
 * servir à Proposta desde sempre, e o único consumidor era um painel de
 * leitura em /catalogo. O proposals.valor era digitado à mão.
 */

// `...p` por último de propósito: `preco_sugerido: null` explícito tem de
// sobreviver (com `?? 3200` o próprio helper reintroduzia o preço e o teste
// de item bloqueado passava sem testar nada).
const sku = (p: Partial<SkuPrecoSugerido> = {}): SkuPrecoSugerido => ({
  id: "s1",
  code: "CA-CID-002",
  nome: "Montagem de Pasta",
  preco_sugerido: 3200,
  moeda: "BRL",
  fonte_versao: "v1",
  fonte_referencia: "catalogo.xlsx",
  vigencia_inicio: null,
  vigencia_fim: null,
  status_produto: "homologado",
  status_fonte: "ok",
  ativo: true,
  archived_at: null,
  dados_teste: false,
  preco_atual: null,
  ...p,
});

describe("soma pelo preço sugerido canônico, com quantidade", () => {
  it("3 requerentes × R$ 3.200 = R$ 9.600", () => {
    const o = calcularOrcamento({ itens: [{ sku: sku(), quantidade: 3 }] });
    expect(o.subtotal).toBe(9600);
    expect(o.total).toBe(9600);
    expect(o.parcial).toBe(false);
    expect(o.moeda).toBe("BRL");
  });

  it("quantidade ausente ou inválida vale 1, nunca 0", () => {
    expect(calcularOrcamento({ itens: [{ sku: sku() }] }).total).toBe(3200);
    expect(calcularOrcamento({ itens: [{ sku: sku(), quantidade: 0 }] }).total).toBe(3200);
    expect(calcularOrcamento({ itens: [{ sku: sku(), quantidade: -5 }] }).total).toBe(3200);
  });

  it("carrega sempre o selo obrigatório do preço sugerido", () => {
    expect(calcularOrcamento({ itens: [{ sku: sku() }] }).selo).toBe(SELO_PRECO_SUGERIDO);
  });
});

describe("item sem preço utilizável nunca entra como zero", () => {
  it("SKU sem valor fica fora da soma e o orçamento é parcial", () => {
    const o = calcularOrcamento({
      itens: [
        { sku: sku(), quantidade: 1 },
        { sku: sku({ id: "s2", code: "CA-DOC-005", preco_sugerido: null }), quantidade: 2 },
      ],
    });
    expect(o.subtotal).toBe(3200);
    expect(o.bloqueados.map((i) => i.code)).toEqual(["CA-DOC-005"]);
    expect(o.parcial).toBe(true);
    expect(o.avisos.join(" ")).toMatch(/parcial/);
  });

  it("divergência crítica de preço bloqueia o item", () => {
    const o = calcularOrcamento({
      itens: [{ sku: sku(), divergencias: [{ tipo: "conflito_preco_critico", resolvido: false }] }],
    });
    expect(o.somados).toHaveLength(0);
    expect(o.parcial).toBe(true);
  });

  it("não soma moedas diferentes — converter exigiria câmbio", () => {
    const o = calcularOrcamento({
      itens: [
        { sku: sku(), quantidade: 1 },
        { sku: sku({ id: "s2", code: "CA-HIST-001", moeda: "EUR" }), quantidade: 1 },
      ],
    });
    expect(o.total).toBe(0);
    expect(o.parcial).toBe(true);
    expect(o.avisos.join(" ")).toMatch(/moedas diferentes/);
  });
});

describe("condição particular é decisão humana registrada, não cálculo", () => {
  it("ajuste com motivo entra no total", () => {
    const o = calcularOrcamento({
      itens: [{ sku: sku(), quantidade: 3 }],
      ajuste: -600,
      ajusteMotivo: "Condição familiar aprovada pela Proprietária",
    });
    expect(o.total).toBe(9000);
    expect(o.ajusteMotivo).toMatch(/Condição familiar/);
  });

  it("ajuste SEM motivo é ignorado e avisado — nunca desconto silencioso", () => {
    const o = calcularOrcamento({ itens: [{ sku: sku(), quantidade: 3 }], ajuste: -5000 });
    expect(o.total).toBe(9600);
    expect(o.ajuste).toBe(0);
    expect(o.avisos.join(" ")).toMatch(/sem motivo registrado/);
  });
});

describe("só orçamento fechado chega à proposta", () => {
  it("recusa orçamento vazio, parcial e sem moeda", () => {
    expect(motivoParaNaoAplicar(calcularOrcamento({ itens: [] }))).toMatch(/Nenhum item/);
    const parcial = calcularOrcamento({
      itens: [{ sku: sku() }, { sku: sku({ id: "s2", preco_sugerido: null }) }],
    });
    expect(String(motivoParaNaoAplicar(parcial))).toMatch(/parcial/);
  });

  it("orçamento fechado passa", () => {
    expect(motivoParaNaoAplicar(calcularOrcamento({ itens: [{ sku: sku(), quantidade: 3 }] }))).toBeNull();
  });

  it("o escopo gravado guarda a conta item a item e a origem do preço", () => {
    const o = calcularOrcamento({ itens: [{ sku: sku(), quantidade: 3 }] });
    const e = escopoEstruturadoDoOrcamento(o);
    expect(e.total).toBe(9600);
    expect(e.selo).toBe(SELO_PRECO_SUGERIDO);
    expect(e.itens[0]).toMatchObject({ code: "CA-CID-002", quantidade: 3, valor_total: 9600 });
  });

  it("formata em real", () => {
    expect(formatarDinheiro(9600, "BRL").replace(/ /g, " ")).toBe("R$ 9.600,00");
  });
});

describe("o escritor respeita snapshot e não faz ação externa", () => {
  const fn = readFileSync("src/lib/orcamento-proposta.functions.ts", "utf8");

  it("recusa proposta enviada, aprovada ou substituída", () => {
    expect(fn).toMatch(/enviada_em \|\| proposta\.aprovada_em \|\| proposta\.substituida_em/);
    expect(fn).toMatch(/é snapshot/);
  });

  it("grava com releitura, auditoria e timeline", () => {
    expect(fn).toMatch(/gravarComVerificacao/);
    expect(fn).toMatch(/orcamento_calculado_aplicado_na_proposta/);
    expect(fn).toMatch(/registrarTimelineCaso/);
  });

  it("não envia, não aprova, não cobra", () => {
    expect(fn).not.toMatch(/asaas|enviada_em:|aprovada_em:|checkout|cobranca/i);
  });

  it("a prévia é calculada no servidor — a tela não pode divergir do que grava", () => {
    expect(fn).toMatch(/calcularOrcamentoDaProposta/);
    const painel = readFileSync("src/components/contrato/calculadora-orcamento.tsx", "utf8");
    expect(painel).toMatch(/calcularOrcamentoDaProposta/);
    expect(painel).not.toMatch(/calcularOrcamento\(/);
  });

  it("está montada em Caso 360", () => {
    const caso = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(caso).toMatch(/CalculadoraOrcamento/);
  });
});

/**
 * Correção de 03/10 — a Proprietária apontou o erro de raiz: "planilha mestre
 * é legado, sku não manda, a maioria que está lá é legado". Medição no banco:
 * as 118 linhas de `product_catalog` estão em `estado_catalogo = 'rascunho'` e
 * vêm de "CA · FIN · Planilha Mestre de Produtos OFICIAL 2.xlsx".
 */
describe("base legada não vira valor de proposta", () => {
  const legado = {
    sku: sku(),
    quantidade: 3,
    fonteArquivo: "CA · FIN · Planilha Mestre de Produtos OFICIAL 2.xlsx",
    estadoCatalogo: "rascunho",
  };

  it("reconhece a Planilha Mestre como fonte legada", () => {
    const o = calcularOrcamento({ itens: [legado] });
    expect(o.baseLegada).toBe(true);
  });

  it("reconhece catálogo em rascunho como não operável, mesmo sem o nome do arquivo", () => {
    const o = calcularOrcamento({ itens: [{ sku: sku(), estadoCatalogo: "rascunho" }] });
    expect(o.baseLegada).toBe(true);
  });

  it("mostra a conta, mas recusa aplicar na proposta, dizendo qual é a base certa", () => {
    const o = calcularOrcamento({ itens: [legado] });
    expect(o.subtotal).toBe(9600); // a conta continua visível
    const recusa = String(motivoParaNaoAplicar(o));
    expect(recusa).toMatch(/legado declarado/);
    expect(recusa).toMatch(/Planejador de Cidadania por nacionalidade/);
  });

  it("avisa, em texto, de onde veio o preço recusado", () => {
    const o = calcularOrcamento({ itens: [legado] });
    expect(o.avisos.join(" ")).toMatch(/Planilha Mestre/);
  });

  it("origem homologada e fora de rascunho não é barrada", () => {
    const o = calcularOrcamento({
      itens: [{ sku: sku({ fonte_referencia: "tabela-planejador-cidadania" }), quantidade: 3, estadoCatalogo: "homologado" }],
    });
    expect(o.baseLegada).toBe(false);
    expect(motivoParaNaoAplicar(o)).toBeNull();
  });

  /*
   * 04/10/2026 — decisão nova da Proprietária substitui o texto que este
   * teste travava: "só use todos os produtos específicos da jornada pai e
   * planejador de cidadania; quando digo como alimento, que seja push pelo
   * seletor, senão o contrato da Ana vai ser bloqueado de novo". O aviso
   * deixou de ser "base de preço pendente" (beco sem saída) e passou a dizer
   * de onde vem o valor: jornada do produto-pai no seletor, catálogo legado
   * como alimento, condição particular aprovada como base. A decisão anterior
   * (03/10: catálogo legado não sustenta orçamento) continua valendo — o
   * alimento não soma. Ver `calculadora-orcamento-jornada-pai-2026-10-04`.
   */
  it("a tela declara de onde vem o valor, sem fingir que o catálogo legado vale", () => {
    const painel = readFileSync("src/components/contrato/calculadora-orcamento.tsx", "utf8");
    expect(painel).toMatch(/jornada do produto-pai/);
    expect(painel).toMatch(/condição particular aprovada/);
    expect(painel).toMatch(/não soma e não bloqueia/);
  });
});
