/**
 * Autorização de pesquisa do caso (crm_casos.estado_de_autorizacao_pesquisa).
 *
 * Vocabulário real do CHECK crm_casos_estado_autorizacao_pesquisa_chk (migration 20260821135341):
 * nao_autorizada | autorizada_interna | autorizada_externa | suspensa. Nenhum valor novo.
 */
export const ESTADOS_AUTORIZACAO_PESQUISA = [
  { valor: "nao_autorizada", rotulo: "Não autorizada" },
  { valor: "autorizada_interna", rotulo: "Autorizada — pesquisa no dossiê do caso" },
  { valor: "autorizada_externa", rotulo: "Autorizada — inclui consulta a acervos externos" },
  { valor: "suspensa", rotulo: "Suspensa" },
] as const;

export type EstadoAutorizacaoPesquisa = (typeof ESTADOS_AUTORIZACAO_PESQUISA)[number]["valor"];

export function rotuloAutorizacaoPesquisa(valor: string | null | undefined): string {
  return ESTADOS_AUTORIZACAO_PESQUISA.find((e) => e.valor === valor)?.rotulo ?? "Não registrado";
}
