/**
 * Autoridade operacional no servidor.
 *
 * A interface já deixou de bloquear a proprietária, mas o servidor continuava
 * recusando por pendência de domínio — ela clicava, escrevia a justificativa e
 * nada acontecia. Era o caso da homologação de SKU, da promoção a cliente
 * ativo e da aprovação de prévia contratual.
 *
 * Regra: pendência informa, não impede. Para a proprietária administradora a
 * pendência é assumida e devolvida para registro em auditoria; para os demais
 * papéis segue bloqueando.
 */

export function ehProprietariaAdministradora(papel: string | null | undefined): boolean {
  return papel === "admin" || papel === "proprietaria_administradora";
}

/**
 * Decide entre recusar e assumir a pendência.
 *
 * Devolve a lista de pendências assumidas — vazia quando não havia pendência.
 * Lança para quem não é proprietária. Quem chama deve gravar o retorno na
 * auditoria: liberar não é apagar.
 */
export function assumirOuRecusar(
  papel: string | null | undefined,
  pendencias: readonly string[],
  mensagem: string,
): string[] {
  const lista = pendencias.filter((p) => Boolean(p && String(p).trim()));
  if (lista.length === 0) return [];
  if (ehProprietariaAdministradora(papel)) return [...lista];
  throw new Error(mensagem);
}
