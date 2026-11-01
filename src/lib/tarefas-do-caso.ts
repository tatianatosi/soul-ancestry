import { ROTULO_PRIORIDADE, ROTULO_TAREFA } from "@/lib/ops.server";

/**
 * Leitura do cartão "Tarefas" da ficha do Caso 360 (resgate da PR #32).
 *
 * A fila é a mesma do Desk Operacional (`v_ops_tarefas`), filtrada por caso.
 * O cartão mostrava o código cru do status ("nao_iniciada") e contava tarefa
 * concluída ou cancelada como aberta. Aqui as abertas se separam das
 * encerradas e o rótulo vem do vocabulário real do CHECK, sem texto novo.
 */
export type TarefaDoCaso = {
  id?: string;
  titulo?: string | null;
  status?: string | null;
  prioridade?: string | null;
};

const ENCERRADAS = new Set(["concluida", "cancelada"]);

export function separarTarefasDoCaso<T extends TarefaDoCaso>(
  tarefas: readonly T[] | null | undefined,
): { abertas: T[]; encerradas: T[] } {
  const abertas: T[] = [];
  const encerradas: T[] = [];
  for (const t of tarefas ?? []) {
    (ENCERRADAS.has(String(t.status ?? "")) ? encerradas : abertas).push(t);
  }
  return { abertas, encerradas };
}

/** "Em andamento · Alta"; vocabulário desconhecido aparece como veio, nunca inventado. */
export function rotuloTarefaDoCaso(t: TarefaDoCaso): string {
  const status = String(t.status ?? "");
  const prioridade = String(t.prioridade ?? "");
  return [
    status ? (ROTULO_TAREFA[status] ?? status) : "",
    prioridade ? (ROTULO_PRIORIDADE[prioridade] ?? prioridade) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
