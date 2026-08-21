import { setResponseHeaders } from "@tanstack/react-start/server";

/**
 * Respostas autenticadas com dados pessoais não podem ficar em cache de
 * navegador, CDN ou proxy: troca de usuário, sessão ou organização não pode
 * reexibir registros de outra origem. Chamar no início do handler.
 */
export function semCache(): void {
  try {
    setResponseHeaders({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
      Vary: "Authorization, Cookie",
    });
  } catch {
    /* fora de um contexto de requisição (ex.: chamada interna) */
  }
}
