/**
 * Origem canônica dos links de autenticação (E1, laudo de prontidão de 23/10/2026).
 *
 * Problema corrigido: o destino do link de login do cliente (e das redefinições
 * de senha da equipe) era montado a partir dos cabeçalhos `Origin`/`Host`, que
 * quem chama controla, em endpoint público. Um `Host` forjado fazia a cliente
 * receber um e-mail legítimo cujo link apontava para o domínio do atacante.
 *
 * Regra: o endereço nunca vem da requisição. Só existe uma lista de PERMISSÃO
 * (allowlist) de origens exatas; qualquer valor fora dela cai na produção.
 * Pura e sem dependências do servidor, para ser testada isoladamente.
 */

/** Única produção (Decisão de Hospedagem Única, 23/10/2026). */
export const ORIGEM_PRODUCAO = "https://soul-ancestry.lovable.app";

/**
 * Origens aceitas como destino de links de autenticação, comparadas por igualdade
 * EXATA de `URL.origin`. Para ligar um domínio próprio, acrescente-o aqui, em PR,
 * depois de cadastrá-lo na lista de redirects permitidos do Supabase.
 */
export const ORIGENS_PERMITIDAS: readonly string[] = [ORIGEM_PRODUCAO];

/** Normaliza para `scheme://host[:porta]` ou devolve null se não for uma origem válida. */
function origemNormalizada(bruta: string | null | undefined): string | null {
  if (!bruta) return null;
  try {
    const u = new URL(bruta.trim());
    if (u.protocol !== "https:") return null;
    if (u.username || u.password) return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Origem a usar nos links. `candidata` (cabeçalho da requisição) só é aceita se
 * for IGUAL a uma origem permitida; em qualquer outro caso, a produção.
 */
export function origemDeAutenticacao(candidata?: string | null): string {
  const o = origemNormalizada(candidata);
  return o && ORIGENS_PERMITIDAS.includes(o) ? o : ORIGEM_PRODUCAO;
}

/** URL completa de retorno (ex.: "/acesso/confirmar"), sempre sob uma origem permitida. */
export function urlDeRetorno(caminho: string, candidata?: string | null): string {
  const p = caminho.startsWith("/") ? caminho : `/${caminho}`;
  return `${origemDeAutenticacao(candidata)}${p}`;
}
