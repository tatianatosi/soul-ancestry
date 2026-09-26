/**
 * Referência financeira de pré-carga do contrato — substitui o antigo
 * lookup estático `PARAMETROS` (src/data/casos.ts) por dado real e vivo,
 * a pedido explícito da Proprietária (2026-09-26, P22): "o ideal é deixar
 * tudo remetendo aos dados atuais".
 *
 * Duas fontes possíveis, nunca combinadas nem fabricadas:
 * - `condicao_do_caso`: condição comercial particular já aprovada para
 *   este caso (`commercial_conditions`) — sempre prevalece quando existe.
 * - `referencia_da_trilha`: referência de honorários/despesas/taxas/parcelas
 *   do país (`price_catalog_rescued`, nível país, `item_id is null`) — só
 *   usada quando não há condição particular de caso.
 *
 * Continua sendo só pré-carga de campo vazio (nunca sobrescreve valor já
 * persistido/validado) — a mesma regra que já vale para `parametrosDoPlanejador`.
 */

export type ReferenciaFinanceiraCondicaoDoCaso = {
  origem: "condicao_do_caso";
  formaPagamento: string;
  valorTotalReferencia: number | null;
};

export type ReferenciaFinanceiraTrilha = {
  origem: "referencia_da_trilha";
  honorarios: number | null;
  despesas: number | null;
  taxas: number | null;
  parcelas: number | null;
};

export type ReferenciaFinanceira = ReferenciaFinanceiraCondicaoDoCaso | ReferenciaFinanceiraTrilha | null;

export type ParamPlanejadorFinanceiro = { campo: string; valor: string; detalhe: string };

/**
 * Converte a referência financeira já resolvida (pelo servidor) em linhas
 * no mesmo formato de `parametrosDoPlanejador`. Nunca fabrica valor: cada
 * campo só entra quando o dado de origem existe.
 */
export function paramsDaReferenciaFinanceira(
  ref: ReferenciaFinanceira,
  detalheBase: string,
): ParamPlanejadorFinanceiro[] {
  if (!ref) return [];

  if (ref.origem === "condicao_do_caso") {
    const texto = ref.formaPagamento.trim();
    if (!texto) return [];
    return [
      {
        campo: "condicao_comercial_do_caso",
        valor: texto,
        detalhe: `${detalheBase} · condição comercial particular deste caso (commercial_conditions), não regra geral do país`,
      },
    ];
  }

  const linhas: ParamPlanejadorFinanceiro[] = [];
  const detalheTrilha = `${detalheBase} · referência resgatada do país (price_catalog_rescued) — não é homologação comercial`;
  if (ref.parcelas != null) {
    linhas.push({ campo: "parcelas", valor: `${ref.parcelas}x`, detalhe: detalheTrilha });
  }
  if (ref.despesas != null || ref.taxas != null) {
    linhas.push({
      campo: "despesas_externas",
      valor: `Despesas previstas BRL ${ref.despesas ?? 0} · taxas previstas BRL ${ref.taxas ?? 0} (reembolsáveis conforme comprovação)`,
      detalhe: detalheTrilha,
    });
  }
  return linhas;
}
