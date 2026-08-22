/**
 * Leitura operacional do catálogo já saneado (Planilha Mestre de Produtos).
 *
 * Regras institucionais:
 * - A planilha mestre é a ÚNICA fonte de verdade de SKU, preço, status e Pareto.
 * - Nada é recriado, reprecificado, renomeado, fundido, pausado ou arquivado aqui.
 * - Campo inexistente na fonte NUNCA é inventado: vira exceção de importação.
 * - Asaas é somente reconciliação de estado. Nenhuma chamada, criação ou alteração.
 */

import {
  FONTE_MESTRE_ABA,
  FONTE_MESTRE_ARQUIVO,
  FONTE_MESTRE_COLUNAS,
  FONTE_MESTRE_COLUNAS_AUSENTES,
  FONTE_MESTRE_TOTais,
  FONTE_MESTRE_VERSAO,
  SKUS_TOP_PARETO,
  type SkuFonteMestre,
} from "@/data/catalogo-fonte-mestre";

export type TipoDivergencia = "divergencia_preco" | "reconciliacao_asaas" | "campo_ausente_na_fonte";

export const ROTULO_DIVERGENCIA: Record<TipoDivergencia, string> = {
  divergencia_preco: "Divergência de preço praticado vs. sugerido",
  reconciliacao_asaas: "Reconciliação Asaas pendente",
  campo_ausente_na_fonte: "Campo ausente na fonte",
};

export const ROTULO_LINK_FONTE: Record<string, string> = {
  link_criado: "Link criado",
  pendente_criar_link: "Pendente criar link",
  revisar_manual: "Revisar manual",
};

export interface ItemCatalogoImportado {
  sku: string;
  produto: string;
  categoria: string | null;
  subcategoria: string | null;
  pareto: string | null;
  faixa: string | null;
  status_fonte: string | null;
  status_produto: string;
  preco_sugerido: number | null;
  preco_atual_fonte: number | null;
  moeda: string;
  status_link_asaas_fonte: string | null;
  link_asaas: string | null;
  fonte_arquivo: string | null;
  fonte_aba: string | null;
  fonte_versao: string | null;
  fonte_linha: number | null;
  importado_em: string | null;
}

/** Mapa somente-leitura da fonte canônica, antes de qualquer gravação. */
export function mapaFonteMestre() {
  return {
    arquivo: FONTE_MESTRE_ARQUIVO,
    aba: FONTE_MESTRE_ABA,
    versao: FONTE_MESTRE_VERSAO,
    totais: FONTE_MESTRE_TOTais,
    colunasEncontradas: [...FONTE_MESTRE_COLUNAS],
    colunasAusentes: [...FONTE_MESTRE_COLUNAS_AUSENTES],
    skusTopPareto: SKUS_TOP_PARETO.length,
  };
}

export type LinhaPrevia = {
  sku: string;
  acao: "criar" | "atualizar" | "inalterado";
  motivo: string;
};

/**
 * Prévia (dry-run) da importação: não grava nada, apenas descreve o que ocorreria.
 * `existentes` é o estado atual do catálogo por SKU (versão da fonte já importada).
 */
export function previaImportacao(existentes: ReadonlyArray<{ sku: string; fonte_versao: string | null }>): {
  linhas: LinhaPrevia[];
  resumo: { total: number; criar: number; atualizar: number; inalterado: number };
} {
  const mapa = new Map(existentes.map((e) => [e.sku, e.fonte_versao]));
  const linhas: LinhaPrevia[] = SKUS_TOP_PARETO.map((s) => {
    if (!mapa.has(s.sku)) return { sku: s.sku, acao: "criar", motivo: "SKU ausente no catálogo" };
    if (mapa.get(s.sku) !== FONTE_MESTRE_VERSAO)
      return { sku: s.sku, acao: "atualizar", motivo: "Nova versão da fonte" };
    return { sku: s.sku, acao: "inalterado", motivo: "Mesma versão da fonte — idempotente" };
  });
  return {
    linhas,
    resumo: {
      total: linhas.length,
      criar: linhas.filter((l) => l.acao === "criar").length,
      atualizar: linhas.filter((l) => l.acao === "atualizar").length,
      inalterado: linhas.filter((l) => l.acao === "inalterado").length,
    },
  };
}

/** Divergências derivadas da fonte — nunca corrigidas automaticamente. */
export function divergenciasDaFonte(s: SkuFonteMestre): { tipo: TipoDivergencia; detalhe: string }[] {
  const out: { tipo: TipoDivergencia; detalhe: string }[] = [];
  if (s.precoAtual !== null && s.precoSugerido !== null && s.precoAtual !== s.precoSugerido) {
    out.push({
      tipo: "divergencia_preco",
      detalhe: `Preço praticado ${s.precoAtual} difere do preço sugerido oficial ${s.precoSugerido}.`,
    });
  }
  if (s.statusLinkAsaas !== "link_criado") {
    out.push({
      tipo: "reconciliacao_asaas",
      detalhe: `Estado do link na fonte: ${s.statusLinkAsaas}. Nenhuma chamada ao Asaas foi executada.`,
    });
  }
  out.push({
    tipo: "campo_ausente_na_fonte",
    detalhe: `Colunas ausentes na fonte: ${FONTE_MESTRE_COLUNAS_AUSENTES.join(", ")}. Nenhum valor foi inventado.`,
  });
  return out;
}

/** Seleção em proposta/condição comercial: somente SKU existente, ativo e com preço na fonte. */
export function selecionavelEmProposta(
  item: Pick<ItemCatalogoImportado, "sku" | "status_fonte" | "status_produto" | "preco_sugerido"> | undefined,
): { permitido: boolean; motivo: string | null } {
  if (!item) return { permitido: false, motivo: "SKU inexistente no catálogo importado." };
  if (item.status_produto !== "ativo" || item.status_fonte !== "Ativo")
    return { permitido: false, motivo: "SKU inativo ou arquivado na fonte mestre." };
  if (item.preco_sugerido === null || item.preco_sugerido === undefined)
    return { permitido: false, motivo: "SKU sem preço sugerido oficial na fonte mestre." };
  return { permitido: true, motivo: null };
}

/** Preço sempre lido da fonte. Não existe preço livre. */
export function precoDaFonte(item: Pick<ItemCatalogoImportado, "preco_sugerido" | "moeda">) {
  return { valor: item.preco_sugerido, moeda: item.moeda, origem: FONTE_MESTRE_VERSAO };
}

/** Parcelas e vencimentos jamais são inferidos. */
export function parcelamentoInferido(): null {
  return null;
}

/** Mensagem operacional exibida no Painel Hoje (sem catálogo, sem edição). */
export function mensagemBloqueioCaso(motivo: string): string {
  return `Condição comercial bloqueada: ${motivo}`;
}

export { SKUS_TOP_PARETO, FONTE_MESTRE_VERSAO, FONTE_MESTRE_ARQUIVO, FONTE_MESTRE_ABA };
export type { SkuFonteMestre };
