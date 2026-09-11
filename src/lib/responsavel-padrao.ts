/**
 * Responsável padrão do Desk — Tatiana Melani Tosi.
 *
 * Em startup solo (e enquanto a equipe for só a proprietária), todo caso,
 * tarefa e próxima ação nascem com ela como responsável. Contratar alguém
 * depois não muda o default: o operador autenticado (admin) continua sendo
 * o fallback vivo; o nome canônico institucional é o abaixo.
 *
 * Não inventa user_id: o id vem da sessão. Só o nome textual usa o padrão
 * quando o staff ainda não tem full_name preenchido.
 */

export const NOME_RESPONSAVEL_PADRAO = "Tatiana Melani Tosi";
export const EMAIL_RESPONSAVEL_PADRAO = "tati@pluggedresearch.com";

/** Nome textual para `responsavel_principal` / rótulos. */
export function nomeResponsavelPadrao(existente?: string | null): string {
  const t = (existente ?? "").trim();
  return t || NOME_RESPONSAVEL_PADRAO;
}

/**
 * Resolve nome + userId para gravação.
 * Preferência: nome já informado → full_name/email do staff da sessão → constante.
 * O `responsavel_id` / `auth_user_id` é sempre o da sessão quando ausente.
 */
export function resolverResponsavelPadrao(entrada: {
  nomeInformado?: string | null;
  staffNome?: string | null;
  staffEmail?: string | null;
  userId: string;
}): { nome: string; userId: string } {
  const nome = nomeResponsavelPadrao(
    entrada.nomeInformado || entrada.staffNome || entrada.staffEmail || null,
  );
  return { nome, userId: entrada.userId };
}
