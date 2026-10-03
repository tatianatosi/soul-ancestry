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
 * ## Correção de 03/10, depois de um erro meu
 *
 * A primeira versão desta calculadora somava `product_catalog.preco_sugerido_fonte`
 * como se fosse base válida de orçamento. Está errado, e a Proprietária apontou:
 * "planilha mestre é legado, sku não manda, a maioria que está lá é legado".
 * O `AGENTS.md` já dizia isso em regra inegociável — "a planilha mestre... é
 * passado. Proibido usá-la como premissa arquitetural, motor de priorização,
 * dashboard operacional, CRM, planner ou razão do negócio" — e eu usei como
 * premissa de preço mesmo assim.
 *
 * A medição no banco (03/10) confirma: as **118 linhas** de `product_catalog`
 * estão em `estado_catalogo = 'rascunho'` e a única fonte é o arquivo
 * "CA · FIN · Planilha Mestre de Produtos OFICIAL 2.xlsx". Não há uma linha
 * sequer de catálogo homologado fora da planilha legada.
 *
 * Então a calculadora passa a **recusar** base legada em vez de somá-la. Ela
 * continua existindo e mostrando a conta, para a equipe ver o que existe — mas
 * não aplica na proposta e diz o que falta: a tabela de preços do Planejador
 * de Cidadania, por nacionalidade, que ainda não existe como dado.
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
  /** Arquivo de onde o preço veio. É isto que denuncia base legada. */
  fonteArquivo: string | null;
  /** Estado do item no catálogo: `rascunho` nunca é base de orçamento. */
  estadoCatalogo: string | null;
  legado: boolean;
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
  /** true quando a conta se apoia em fonte legada (Planilha Mestre, rascunho). */
  baseLegada: boolean;
  selo: string;
  avisos: string[];
};

export type EntradaItem = {
  sku: SkuPrecoSugerido;
  quantidade?: number;
  divergencias?: DivergenciaFonte[];
  /** `product_catalog.fonte_arquivo` e `estado_catalogo`, lidos sem interpretar. */
  fonteArquivo?: string | null;
  estadoCatalogo?: string | null;
};

export type EntradaOrcamento = {
  itens: readonly EntradaItem[];
  /** Condição particular aprovada por humano: diferença e motivo, juntos. */
  ajuste?: number;
  ajusteMotivo?: string;
  hoje?: Date;
};

/**
 * Fontes que o AGENTS.md declara legado e proíbe como premissa operacional.
 * Casar por trecho do nome do arquivo, não por igualdade: o nome muda de
 * versão ("OFICIAL 2.xlsx"), a natureza não.
 */
export const FONTES_LEGADAS = ["planilha mestre", "planilha_mestre", "dre", "asaas legado"];

/** Estados de catálogo que não sustentam orçamento, por não serem homologados. */
export const ESTADOS_CATALOGO_NAO_OPERAVEIS = ["rascunho", "legado_referencia", "arquivado"];

export function baseLegada(fonteArquivo?: string | null, estadoCatalogo?: string | null): boolean {
  const f = String(fonteArquivo ?? "").toLowerCase();
  if (FONTES_LEGADAS.some((t) => f.includes(t))) return true;
  const e = String(estadoCatalogo ?? "").trim().toLowerCase();
  return ESTADOS_CATALOGO_NAO_OPERAVEIS.includes(e);
}

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
    const legado = baseLegada(e.fonteArquivo ?? e.sku.fonte_referencia, e.estadoCatalogo);
    return {
      skuId: e.sku.id,
      fonteArquivo: e.fonteArquivo ?? e.sku.fonte_referencia ?? null,
      estadoCatalogo: e.estadoCatalogo ?? null,
      legado,
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

  const comLegado = somados.filter((i) => i.legado);
  if (comLegado.length > 0) {
    avisos.push(
      `${comLegado.length} item(ns) têm preço vindo de fonte legada (${[...new Set(comLegado.map((i) => i.fonteArquivo ?? i.estadoCatalogo ?? "origem não registrada"))].join(", ")}). ` +
        "A Planilha Mestre e o catálogo em rascunho são legado declarado e não sustentam orçamento de proposta. " +
        "A base correta é a tabela de preços do Planejador de Cidadania por nacionalidade, que ainda não existe como dado.",
    );
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
    baseLegada: comLegado.length > 0,
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
  if (o.baseLegada) {
    return (
      "O preço destes itens vem da Planilha Mestre / catálogo em rascunho, que é legado declarado e não pode " +
      "virar valor de proposta. A base correta é a tabela do Planejador de Cidadania por nacionalidade — ela " +
      "ainda não existe como dado neste sistema."
    );
  }
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
