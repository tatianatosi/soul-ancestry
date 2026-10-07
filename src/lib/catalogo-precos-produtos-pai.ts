/**
 * Catálogo de produtos-pai com tabela de preços — camada pura (07/10/2026).
 *
 * `price_catalog_rescued` é a fonte única da calculadora de orçamento
 * (`orcamento-produtos-pai.functions.ts`, v3.0 04/10/2026) — já confirmado
 * por leitura: nenhum consumidor lê `product_catalog`/Top 30 para preço.
 * Este módulo valida o que a tela viva de gestão grava: criar, editar,
 * salvar e arquivar com motivo, nunca excluir fisicamente (consistente com a
 * ausência de política DELETE no banco — só archived_at/archive_motivo).
 *
 * `legacy_sku_mappings` permanece somente leitura no Desk, por decisão já
 * registrada na migration 20261004160000 ("v3.0 §8.3: o produto-pai rege
 * orçamento, proposta e jornada; o SKU não é chave de cálculo") — nenhum
 * escritor é criado aqui para essa tabela.
 */

export const PRICE_STATUS_VALUES = [
  "VIGENTE",
  "REFERENCIA_RESGATADA",
  "CONDICAO_PARTICULAR_DE_CASO",
  "HOMOLOGADO_CATALOGO",
  "PENDENTE_DE_HOMOLOGACAO",
  "DIVERGENTE",
  "ARQUIVADO",
] as const;
export type PriceStatus = (typeof PRICE_STATUS_VALUES)[number];

export const PRICE_COMPONENT_VALUES = ["honorarios", "despesas", "taxas", "outros", "parcelas_padrao"] as const;
export type PriceComponent = (typeof PRICE_COMPONENT_VALUES)[number];

export const ROTULO_PRICE_STATUS: Record<PriceStatus, string> = {
  VIGENTE: "Vigente",
  REFERENCIA_RESGATADA: "Referência resgatada",
  CONDICAO_PARTICULAR_DE_CASO: "Condição particular de caso",
  HOMOLOGADO_CATALOGO: "Homologado no catálogo",
  PENDENTE_DE_HOMOLOGACAO: "Pendente de homologação",
  DIVERGENTE: "Divergente",
  ARQUIVADO: "Arquivado",
};

export const ROTULO_PRICE_COMPONENT: Record<PriceComponent, string> = {
  honorarios: "Honorários",
  despesas: "Despesas (terceiros)",
  taxas: "Taxas oficiais",
  outros: "Outros",
  parcelas_padrao: "Parcelas (padrão)",
};

/** Mínimo de caracteres para um motivo de arquivamento ser aceito como declarado, não vazio. */
export const MINIMO_MOTIVO_ARQUIVAMENTO = 10;

export type EntradaNovoPreco = {
  price_component: string;
  price_status: string;
  source_type: string;
  source_reference: string;
  country_code?: string | null;
  item_id?: string | null;
  phase?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  source_date?: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
  case_only?: boolean;
  notes?: string | null;
};

export type ResultadoValidacao = { ok: true } | { ok: false; erro: string };

function amountValido(amount: unknown): ResultadoValidacao {
  if (amount === null || amount === undefined || amount === "") return { ok: true };
  const n = Number(amount);
  if (Number.isNaN(n)) return { ok: false, erro: "Valor precisa ser numérico (ou vazio, quando ainda sem preço)." };
  if (n < 0) return { ok: false, erro: "Valor não pode ser negativo." };
  return { ok: true };
}

function dataValida(valor: unknown, campo: string): ResultadoValidacao {
  if (valor === null || valor === undefined || valor === "") return { ok: true };
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return { ok: false, erro: `${campo} precisa estar no formato AAAA-MM-DD (ou vazio).` };
  }
  return { ok: true };
}

/** Valida uma nova linha de preço antes de criar (criarPrecoCatalogo). */
export function validarNovoPreco(input: EntradaNovoPreco): ResultadoValidacao {
  if (!PRICE_COMPONENT_VALUES.includes(input.price_component as PriceComponent)) {
    return { ok: false, erro: `Componente de preço inválido. Valores aceitos: ${PRICE_COMPONENT_VALUES.join(", ")}.` };
  }
  if (!PRICE_STATUS_VALUES.includes(input.price_status as PriceStatus)) {
    return { ok: false, erro: `Estado de preço inválido. Valores aceitos: ${PRICE_STATUS_VALUES.join(", ")}.` };
  }
  if (!input.source_type?.trim()) return { ok: false, erro: "Informe o tipo de fonte (origem do valor)." };
  if (!input.source_reference?.trim()) return { ok: false, erro: "Informe a referência da fonte (de onde veio este valor)." };
  const a = amountValido(input.amount);
  if (!a.ok) return a;
  const d1 = dataValida(input.source_date, "Data da fonte");
  if (!d1.ok) return d1;
  const d2 = dataValida(input.effective_from, "Vigência (início)");
  if (!d2.ok) return d2;
  const d3 = dataValida(input.effective_to, "Vigência (fim)");
  if (!d3.ok) return d3;
  if (input.country_code && !/^[A-Z]{2}$/.test(input.country_code)) {
    return { ok: false, erro: "País precisa ser o código de 2 letras (ex.: IT, PT, BR) ou vazio para item transversal." };
  }
  return { ok: true };
}

export type EntradaEdicaoPreco = {
  price_status?: string;
  amount?: number | string | null;
  currency?: string | null;
  source_date?: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
  notes?: string | null;
};

/** Valida a edição de uma linha já existente (nunca o componente/país/item — isso é recriar, não editar). */
export function validarEdicaoPreco(input: EntradaEdicaoPreco): ResultadoValidacao {
  if (input.price_status !== undefined && !PRICE_STATUS_VALUES.includes(input.price_status as PriceStatus)) {
    return { ok: false, erro: `Estado de preço inválido. Valores aceitos: ${PRICE_STATUS_VALUES.join(", ")}.` };
  }
  const a = amountValido(input.amount);
  if (!a.ok) return a;
  const d1 = dataValida(input.source_date, "Data da fonte");
  if (!d1.ok) return d1;
  const d2 = dataValida(input.effective_from, "Vigência (início)");
  if (!d2.ok) return d2;
  const d3 = dataValida(input.effective_to, "Vigência (fim)");
  if (!d3.ok) return d3;
  return { ok: true };
}

/** Arquivar exige motivo declarado — nunca silencioso, nunca exclusão física. */
export function validarMotivoArquivamento(motivo: string | null | undefined): ResultadoValidacao {
  const m = (motivo ?? "").trim();
  if (m.length < MINIMO_MOTIVO_ARQUIVAMENTO) {
    return {
      ok: false,
      erro: `Motivo do arquivamento é obrigatório (mínimo ${MINIMO_MOTIVO_ARQUIVAMENTO} caracteres) — nunca apaga a linha, só arquiva com rastro.`,
    };
  }
  return { ok: true };
}

export type LinhaPrecoCatalogo = {
  id: string;
  item_id: string | null;
  country_code: string | null;
  phase: string | null;
  price_component: string;
  amount: number | null;
  currency: string;
  source_type: string;
  source_reference: string;
  source_date: string | null;
  price_status: string;
  effective_from: string | null;
  effective_to: string | null;
  case_only: boolean;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
  archive_motivo: string | null;
};

export type GrupoPorPais = {
  pais: string;
  linhas: LinhaPrecoCatalogo[];
};

/**
 * Agrupa por país (processo completo), separando os itens transversais
 * (sem país — assinaturas/módulos de produto-pai) em um grupo nomeado.
 * Nunca mistura arquivada com vigente na mesma leitura — quem vê decide se
 * quer ver arquivadas (toggle na tela), mas o agrupamento é sempre o mesmo.
 */
export function agruparPrecosPorPais(linhas: LinhaPrecoCatalogo[]): GrupoPorPais[] {
  const porPais = new Map<string, LinhaPrecoCatalogo[]>();
  for (const l of linhas) {
    const chave = l.country_code?.trim() || "Transversal (sem país — módulo de produto-pai)";
    if (!porPais.has(chave)) porPais.set(chave, []);
    porPais.get(chave)!.push(l);
  }
  return [...porPais.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pais, lista]) => ({ pais, linhas: lista }));
}
