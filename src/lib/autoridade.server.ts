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

/**
 * Verdadeiro quando quem executa é admin ativo. Para uso onde o papel não está
 * em escopo e só se tem `supabase` e `userId`.
 *
 * Nunca derruba o fluxo: se a leitura falhar, devolve falso e o gate original
 * segue valendo.
 */
export async function proprietariaOperando(
  supabase: { from: (t: string) => any },
  userId: string,
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("staff_access")
      .select("role,status")
      .eq("auth_user_id", userId)
      .is("archived_at", null)
      .maybeSingle();
    return data?.status === "active" && data?.role === "admin";
  } catch {
    return false;
  }
}

/** Variante assíncrona de `assumirOuRecusar` quando só se tem supabase e userId. */
export async function assumirOuRecusarComUsuario(
  supabase: { from: (t: string) => any },
  userId: string,
  pendencias: readonly string[],
  mensagem: string,
): Promise<string[]> {
  const lista = pendencias.filter((p) => Boolean(p && String(p).trim()));
  if (lista.length === 0) return [];
  if (await proprietariaOperando(supabase, userId)) return [...lista];
  throw new Error(mensagem);
}
