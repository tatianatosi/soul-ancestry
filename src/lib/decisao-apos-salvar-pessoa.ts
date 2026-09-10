/**
 * P3 / PR #32 — depois de salvar pessoa, a operadora decide:
 * criar tarefa no mesmo caso, ou marcar sem nova ação.
 * O salvamento nunca é bloqueado por essa decisão.
 */

export function tituloTarefaAposSalvarPessoa(nome: string): string {
  const limpo = nome.trim() || "pessoa sem nome";
  return `Acompanhar após gravação da ficha: ${limpo}`;
}

export const CONFIRMACAO_SEM_NOVA_ACAO = "sem_nova_acao_necessaria";
