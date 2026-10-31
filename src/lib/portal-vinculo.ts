/**
 * Escolha do vínculo de acesso ao App quando a pessoa tem mais de uma linha
 * em `client_portal_access` (26/10/2026).
 *
 * Revogar/suspender não arquiva a linha antiga e o reconvite cria outra para o
 * mesmo e-mail/usuário. Com duas linhas, `.maybeSingle()` falhava e o cliente
 * reconvidado caía em "sem permissão". Regra: ativo > convidado > pendente >
 * o resto; empate, a linha mais recente.
 */
const PRIORIDADE: Record<string, number> = { active: 0, invited: 1, pending: 2 };

type ComStatus = { access_status?: string | null; updated_at?: string | null };

export function melhorVinculo<T extends ComStatus>(linhas: readonly T[] | null | undefined): T | null {
  const lista = [...(linhas ?? [])];
  if (lista.length === 0) return null;
  lista.sort((a, b) => {
    const pa = PRIORIDADE[a.access_status ?? ""] ?? 9;
    const pb = PRIORIDADE[b.access_status ?? ""] ?? 9;
    if (pa !== pb) return pa - pb;
    return String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""));
  });
  return lista[0] ?? null;
}

/** Adapta o resultado de uma consulta em lista para o formato de `.maybeSingle()`. */
export function comoUnico<T extends ComStatus>(res: { data: T[] | null; error: unknown }): {
  data: T | null;
  error: unknown;
} {
  return { data: melhorVinculo(res.data), error: res.error };
}
