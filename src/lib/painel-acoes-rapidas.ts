/**
 * Regra de exibição das ações rápidas da Proprietária Administradora no
 * Painel Hoje.
 *
 * A visibilidade vem sempre do estado de sessão devolvido pelo servidor
 * (`estadoModoProprietaria`), nunca de estado local, papel escrito à mão na
 * interface ou dado do navegador. Enquanto a sessão não respondeu, ou se a
 * chamada falhou, as ações permanecem ocultas.
 */

export type EstadoSessaoPainel = {
  ativo?: boolean;
  papel?: string | null;
} | null | undefined;

/** Papel canônico que libera as ações rápidas. `admin` é o portador do papel. */
export const PAPEIS_ACOES_RAPIDAS = ["proprietaria_administradora", "admin"] as const;

export function podeExibirAcoesRapidas(estado: EstadoSessaoPainel): boolean {
  if (!estado) return false;
  if (estado.ativo !== true) return false;
  return (PAPEIS_ACOES_RAPIDAS as readonly string[]).includes(estado.papel ?? "");
}
