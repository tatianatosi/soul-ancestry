/**
 * CA-UX-03 Fase B — Regra canônica de "X leads aguardando ação".
 *
 * Registro puro e read-only: não consulta banco, não cria fila, status ou
 * lógica de negócio. Apenas soma, sem repetição, o resultado já deduplicado de
 * `comercialHoje` (src/lib/painel-dia.ts).
 *
 * Definição canônica:
 *   leads aguardando ação = |calls de hoje ∪ propostas sem follow-up ∪ leads
 *   sem próxima ação|, considerando somente itens com data ≤ hoje+7, excluídos
 *   os registros já exibidos em filas anteriores do Painel Hoje (precedência
 *   fila priorizada → exceções → comercial) e, por padrão, os registros demo.
 *
 * O número só pode ser contado em `/painel`. Qualquer outra superfície exibe
 * etiqueta ou link para `/conversao`.
 */

export type ResumoComercialEntrada = {
  calls: readonly { id: string; tipo?: string }[];
  propostas: readonly { id: string; tipo?: string }[];
  semDisciplina: readonly { id: string; tipo?: string }[];
};

export const ROTA_DETALHE_COMERCIAL = "/conversao";

/** Conta leads aguardando ação sem repetir o mesmo registro entre as três origens. */
export function contarLeadsAguardandoAcao(entrada: ResumoComercialEntrada): number {
  const chaves = new Set<string>();
  for (const grupo of [entrada.calls, entrada.propostas, entrada.semDisciplina]) {
    for (const item of grupo) chaves.add(`${item.tipo ?? "lead"}:${item.id}`);
  }
  return chaves.size;
}

/** Frase única exibida no Painel Hoje (bloco "Comercial hoje"). */
export function fraseComercialHoje(total: number): string {
  return `Comercial hoje: ${total} ${total === 1 ? "lead aguardando ação" : "leads aguardando ação"}`;
}
