/**
 * Regras puras de superfície interna (P0.1).
 *
 * Autenticar NÃO é autorizar: sessão existente não libera Desk nem rótulos internos.
 * Só é "interno" quem tem papel de equipe em `public.user_roles` (leitura possível
 * apenas para membro da organização, por RLS).
 *
 * O controle real de dados continua no banco (RLS); estas regras controlam apenas
 * a superfície visual e o roteamento.
 */

export const PAPEIS_INTERNOS = [
  "admin",
  "operacoes",
  "pesquisador",
  "comercial",
  "financeiro",
  "leitura",
] as const;

export type PapelInterno = (typeof PAPEIS_INTERNOS)[number];

export function ehPapelInterno(papel: string | null | undefined): papel is PapelInterno {
  return typeof papel === "string" && (PAPEIS_INTERNOS as readonly string[]).includes(papel);
}

export interface EstadoSessao {
  autenticado: boolean;
  /** Papéis lidos de user_roles para o usuário atual. */
  papeis: readonly (string | null | undefined)[];
  /** Verdadeiro quando a leitura de papéis falhou (rede/infra). */
  erroLeitura?: boolean;
}

/** Superfície interna (rótulos "(interno)", alternador, caso-modelo). Padrão: falso. */
export function decidirSuperficieInterna(estado: EstadoSessao): boolean {
  if (!estado.autenticado) return false;
  if (estado.erroLeitura) return false; // sem prova de papel interno, não expõe nada
  return estado.papeis.some(ehPapelInterno);
}

export type DecisaoDesk = "permitir" | "entrar" | "portal";

/**
 * Acesso às rotas do Desk.
 * - sem sessão => tela de entrada da equipe;
 * - sessão sem papel interno comprovado => App Cliente (portal);
 * - falha de leitura => mantém a sessão (RLS segue barrando dados), sem derrubar a equipe.
 */
export function decidirAcessoDesk(estado: EstadoSessao): DecisaoDesk {
  if (!estado.autenticado) return "entrar";
  if (estado.papeis.some(ehPapelInterno)) return "permitir";
  if (estado.erroLeitura) return "permitir";
  return "portal";
}
