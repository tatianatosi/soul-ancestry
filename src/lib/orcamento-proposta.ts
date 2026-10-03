/**
 * Calculadora de orçamento da proposta (03/10/2026).
 *
 * ## O que estava documentado e não executado
 *
 * `preco-sugerido-canonico.ts` já diz, no próprio cabeçalho, que o preço
 * sugerido é "exibível e selecionável em Planejador, Comercial, **Proposta**,
 * Condição Comercial, Anexo I/OS, métricas e Painel Hoje". Medido em 03/10:
 * o único consumidor era um painel de leitura em `/catalogo`
 * (`preco-sugerido-operacional.tsx`). A proposta nunca compôs valor a partir
 * dele — o `proposals.valor` era digitado à mão, e `proposta-comercial.ts` só
 * lia esse número de volta para o contrato.
 *
 * A auditoria de 03/09 já tinha registrado a mesma lacuna como "Calculadora
 * de proposta/SKU/produto — não reaberto aqui". Documentado duas vezes,
 * executado zero. É o que esta calculadora fecha.
 *
 * ## O que ela faz, e o que nunca faz
 *
 * Soma linhas de orçamento a partir do preço sugerido canônico de cada SKU,
 * com quantidade (um requerente, três requerentes…), e devolve o total com o
 * selo obrigatório. SKU sem preço utilizável **não vira zero**: entra na lista
 * de bloqueados e o orçamento fica marcado como parcial.
 *
 * Nunca: inventa preço, aplica desconto por conta própria, deriva parcela ou
 * vencimento, homologa condição comercial, cria cobrança ou link de pagamento.
 * Condição particular (o caso da Ana, R$ 9.600) existe como campo explícito
 * com motivo — é decisão humana registrada, não cálculo.
 */
import {
  resolverPrecoSugerido,
  SELO_PRECO_SUGERIDO,
  type DivergenciaFonte,
  type EstadoPrecoSugerido,
  type SkuPrecoSugerido,
} from "@/lib/preco-sugerido-canonico";

export type ItemOrcamento = {
  skuId: string;
  code: string | null;
  nome: string | null;
  /** Quantas vezes o item entra (ex.: um por requerente). */
  quantidade: number;
  valorUnitario: number | null;
  valorTotal: number | null;
  moeda: string | null;
  estado: EstadoPrecoSugerido;
  origem: string | null;
  motivos: string[];
};

export type OrcamentoProposta = {
  itens: ItemOrcamento[];
  /** Itens que entram na soma (preço utilizável). */
  somados: ItemOrcamento[];
  /** Itens sem preço utilizável — declarados, nunca somados como zero. */
  bloqueados: ItemOrcamento[];
  moeda: string | null;
  subtotal: number;
  /** Diferença registrada pela equipe, com motivo. Zero quando não há. */
  ajuste: number;
  ajusteMotivo: string | null;
  total: number;
  /** true quando algum item ficou de fora: o total não é o orçamento inteiro. */
  parcial: boolean;
  selo: string;
  avisos: string[];
};

export type EntradaItem = {
  sku: SkuPrecoSugerido;
  quantidade?: number;
  divergencias?: DivergenciaFonte[];
};

export type EntradaOrcamento = {
  itens: readonly EntradaItem[];
  /** Condição particular aprovada por humano: diferença e motivo, juntos. */
  ajuste?: number;
  ajusteMotivo?: string;
  hoje?: Date;
};

export function formatarDinheiro(valor: number, moeda: string | null): string {
  const m = (moeda ?? "BRL").toUpperCase();
  try {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: m });
  } catch {
    return `${m} ${valor.toFixed(2)}`;
  }
}

/**
 * Calcula o orçamento. Função pura: nada grava, nada comunica.
 *
 * Moeda: se os itens somados misturarem moedas, o orçamento fica parcial e
 * avisa — somar BRL com EUR seria inventar câmbio.
 */
export function calcularOrcamento(entrada: EntradaOrcamento): OrcamentoProposta {
  const hoje = entrada.hoje ?? new Date();
  const avisos: string[] = [];

  const itens: ItemOrcamento[] = entrada.itens.map((e) => {
    const quantidade = Math.max(1, Math.trunc(Number(e.quantidade ?? 1)));
    const r = resolverPrecoSugerido(e.sku, e.divergencias ?? [], hoje);
    const utilizavel = r.selecionavel_internamente && r.valor !== null;
    return {
      skuId: e.sku.id,
      code: e.sku.code ?? null,
      nome: e.sku.nome ?? null,
      quantidade,
      valorUnitario: r.valor,
      valorTotal: utilizavel && r.valor !== null ? r.valor * quantidade : null,
      moeda: r.moeda,
      estado: r.estado,
      origem: r.origem,
      motivos: r.motivos.map((m) => m.descricao),
    };
  });

  const somados = itens.filter((i) => i.valorTotal !== null);
  const bloqueados = itens.filter((i) => i.valorTotal === null);

  const moedas = new Set(somados.map((i) => (i.moeda ?? "").toUpperCase()).filter(Boolean));
  let moeda: string | null = null;
  let subtotal = 0;
  let misturaDeMoeda = false;

  if (moedas.size > 1) {
    misturaDeMoeda = true;
    avisos.push(
      `Os itens estão em moedas diferentes (${[...moedas].join(", ")}). Não somo moedas distintas — ` +
        "converter exigiria câmbio, que não é decisão desta tela.",
    );
  } else {
    moeda = [...moedas][0] ?? null;
    subtotal = somados.reduce((s, i) => s + (i.valorTotal ?? 0), 0);
  }

  if (bloqueados.length > 0) {
    avisos.push(
      `${bloqueados.length} item(ns) sem preço utilizável ficaram fora da soma. O total abaixo é parcial: ` +
        "resolva a origem do preço antes de tratar como orçamento fechado.",
    );
  }

  const ajusteMotivo = String(entrada.ajusteMotivo ?? "").trim() || null;
  let ajuste = Number(entrada.ajuste ?? 0);
  if (!Number.isFinite(ajuste)) ajuste = 0;
  if (ajuste !== 0 && !ajusteMotivo) {
    avisos.push("Ajuste informado sem motivo registrado — o ajuste foi ignorado no total.");
    ajuste = 0;
  }

  const total = misturaDeMoeda ? 0 : subtotal + ajuste;

  return {
    itens,
    somados,
    bloqueados,
    moeda,
    subtotal,
    ajuste,
    ajusteMotivo: ajuste !== 0 ? ajusteMotivo : null,
    total,
    parcial: bloqueados.length > 0 || misturaDeMoeda || somados.length === 0,
    selo: SELO_PRECO_SUGERIDO,
    avisos,
  };
}

/**
 * O orçamento só pode ser aplicado à proposta quando fecha de verdade.
 * `null` = pode aplicar; string = o motivo da recusa, mostrado na tela.
 */
export function motivoParaNaoAplicar(o: OrcamentoProposta): string | null {
  if (o.somados.length === 0) return "Nenhum item com preço utilizável — não há orçamento a aplicar.";
  if (o.parcial)
    return "Orçamento parcial: há item sem preço utilizável ou moedas diferentes. Resolva antes de gravar na proposta.";
  if (o.total <= 0) return "O total precisa ser maior que zero.";
  if (!o.moeda) return "Sem moeda definida na fonte do preço — não grave valor sem moeda.";
  return null;
}

/** O que fica gravado em `proposals.escopo_estruturado` — a conta, item a item. */
export function escopoEstruturadoDoOrcamento(o: OrcamentoProposta) {
  return {
    origem: "calculadora de orçamento sobre preço sugerido canônico",
    selo: o.selo,
    moeda: o.moeda,
    subtotal: o.subtotal,
    ajuste: o.ajuste,
    ajuste_motivo: o.ajusteMotivo,
    total: o.total,
    itens: o.somados.map((i) => ({
      code: i.code,
      nome: i.nome,
      quantidade: i.quantidade,
      valor_unitario: i.valorUnitario,
      valor_total: i.valorTotal,
      origem_preco: i.origem,
    })),
  };
}
