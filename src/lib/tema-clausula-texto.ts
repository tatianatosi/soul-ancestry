/**
 * De-para tema jurídico → cláusula real do contrato-base.
 *
 * 08/09/2026 — achado da proprietária: "Estou no escuro, não sei o que estou
 * aprovando". A tela de Validação Jurídica pedia decisão por TEMA e declarava
 * explicitamente que "não guarda redação de cláusula" — ou seja, a única
 * pessoa juridicamente responsável aprovava sem ver o texto que estava
 * aprovando.
 *
 * O texto sempre existiu (`CLAUSULAS_FIXAS` em contrato-base-consolidado.ts),
 * só nunca tinha sido ligado ao tema correspondente. Este arquivo faz essa
 * ligação, para leitura apenas.
 *
 * Regra preservada: a matriz continua NÃO armazenando redação — ela referencia
 * a cláusula vigente do contrato-base. Aprovar um tema é aprovar o texto abaixo
 * na versão indicada, não criar texto novo.
 */
import { CLAUSULAS_FIXAS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";

/** Cláusulas do contrato-base que cada tema normativo governa. */
export const CLAUSULAS_POR_TEMA: Record<string, number[]> = {
  natureza_servico: [2],
  nao_garantia: [6],
  limite_relatorio: [3, 6],
  retencao_dados: [7],
  suspensao_prazo: [10],
  encerramento: [11],
  inadimplemento: [15],
  rescisao: [16],
  foro: [14],
  parcelamento: [8],
  despesas_terceiros: [9],
  dependentes_representacao: [1],
};

export type ClausulaDoTema = { numero: number; titulo: string; itens: string[] };

/**
 * Texto vigente que o tema governa. Lista vazia significa que o tema ainda não
 * tem cláusula correspondente no contrato-base — e isso deve aparecer na tela
 * como ausência declarada, nunca como silêncio.
 */
export function clausulasDoTema(temaCodigo: string): ClausulaDoTema[] {
  const numeros = CLAUSULAS_POR_TEMA[temaCodigo] ?? [];
  return numeros
    .map((n) => CLAUSULAS_FIXAS.find((c) => c.numero === n))
    .filter((c): c is ClausulaDoTema => Boolean(c));
}

/** Versão do contrato-base a que o texto exibido pertence. */
export const VERSAO_TEXTO_EXIBIDO = CONTRATO_BASE_VERSAO;
