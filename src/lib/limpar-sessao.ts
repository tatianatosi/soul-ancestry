/**
 * Logout/expiração: remove qualquer resíduo da sessão anterior guardado na
 * origem, para que troca de usuário ou de organização não reexiba dados.
 * Não substitui os cabeçalhos no-store das respostas autenticadas.
 */
export function limparArmazenamentoDaSessao(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    /* armazenamento indisponível */
  }
}
