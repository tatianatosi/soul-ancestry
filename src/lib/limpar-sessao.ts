/**
 * Logout/expiração: remove resíduos da sessão anterior guardados na origem,
 * para que troca de usuário ou de organização não reexiba dados.
 *
 * IMPORTANTE: nunca usar `localStorage.clear()`. A chave de sessão do provedor
 * (`sb-<projeto>-auth-token`) é compartilhada por todas as abas da mesma
 * origem; apagá-la em bloco derruba automaticamente sessões válidas abertas em
 * outras abas (por exemplo, sair do App Cliente deslogava o Desk da
 * proprietária). O encerramento da sessão é responsabilidade exclusiva do
 * `supabase.auth.signOut()`, que remove apenas a própria chave.
 */

/** A chave pertence ao provedor de autenticação e não deve ser apagada aqui. */
export function ehChaveDeSessaoDoProvedor(chave: string): boolean {
  return /^sb-.*-auth-token(-code-verifier|\.\d+)?$/.test(chave) || chave.startsWith("supabase.auth.");
}

/** Decide, de forma pura e testável, quais chaves de aplicação são removidas. */
export function chavesParaRemover(chaves: readonly string[]): string[] {
  return chaves.filter((chave) => !ehChaveDeSessaoDoProvedor(chave));
}

export function limparArmazenamentoDaSessao(): void {
  if (typeof window === "undefined") return;
  try {
    for (const chave of chavesParaRemover(Object.keys(window.localStorage))) {
      window.localStorage.removeItem(chave);
    }
    window.sessionStorage.clear();
  } catch {
    /* armazenamento indisponível */
  }
}
