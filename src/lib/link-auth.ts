/**
 * Captura de links oficiais de autenticação (convite, definição de senha, link mágico).
 *
 * Quando o provedor não consegue usar o `redirect_to` solicitado, ele cai na URL
 * padrão do projeto (a home). O token continua válido, mas a pessoa aterrissa na
 * prévia do aplicativo em vez da tela pública de senha. Esta função decide, de
 * forma pura, para onde a aterrissagem deve ser reencaminhada preservando os
 * parâmetros oficiais — nunca inspecionando nem registrando o token.
 */

export const ROTA_SENHA_EQUIPE = "/equipe/redefinir-senha";
export const ROTA_ACESSO_CLIENTE = "/acesso/confirmar";

/** Rotas que já sabem consumir o token: não devem ser reencaminhadas. */
const ROTAS_TERMINAIS = [ROTA_SENHA_EQUIPE, ROTA_ACESSO_CLIENTE];

function params(entrada: string): URLSearchParams {
  return new URLSearchParams(entrada.replace(/^[?#]/, ""));
}

function normalizarPath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/** Tipo declarado pelo provedor no link (recovery, invite, magiclink, signup...). */
export function tipoDoLinkAuth(search: string, hash: string): string | null {
  const q = params(search);
  const h = params(hash);
  return h.get("type") ?? q.get("type") ?? null;
}

/** Há material de sessão/token oficial na URL? */
export function temTokenAuth(search: string, hash: string): boolean {
  const q = params(search);
  const h = params(hash);
  return Boolean(
    h.get("access_token") ||
      h.get("refresh_token") ||
      q.get("token_hash") ||
      q.get("token") ||
      q.get("code"),
  );
}

/**
 * Destino da aterrissagem, ou `null` quando não há nada a reencaminhar.
 * Preserva query e hash originais para que a rota de destino consuma o token.
 */
export function destinoLinkAuth(pathname: string, search: string, hash: string): string | null {
  if (!temTokenAuth(search, hash)) return null;

  const atual = normalizarPath(pathname);
  if (ROTAS_TERMINAIS.includes(atual)) return null;

  const tipo = tipoDoLinkAuth(search, hash);
  const destino = tipo === "magiclink" ? ROTA_ACESSO_CLIENTE : ROTA_SENHA_EQUIPE;
  if (destino === atual) return null;

  return `${destino}${search ?? ""}${hash ?? ""}`;
}
