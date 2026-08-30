import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao, inputCls } from "@/components/caso/campos";
import { listarFilaOps, salvarTarefa } from "@/lib/ops.functions";
import { ROTULO_PRIORIDADE, ROTULO_TAREFA } from "@/lib/ops.server";

/**
 * Tarefas/próximas ações deste caso — mesma fila do Desk Operacional
 * (tabela `tarefas`), filtrada por caso. Nenhuma tabela nova: é a mesma
 * fonte que alimenta a fila de Ops e o Painel Hoje.
 */
export function TarefasDoCaso({ caseId }: { caseId: string }) {
  const listar = useServerFn(listarFilaOps);
  const criar = useServerFn(salvarTarefa);
  const qc = useQueryClient();
  const chave = ["tarefas-do-caso", caseId];

  const q = useQuery({
    queryKey: chave,
    queryFn: () => listar({ data: { casoId: caseId } }),
  });

  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => criar({ data: { valores: { caso_id: caseId, titulo, tipo: "geral", status: "nao_iniciada", prioridade: "media" } } }),
    onSuccess: () => {
      setErro(null);
      setTitulo("");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao criar tarefa."),
  });

  const tarefas = (q.data?.tarefas ?? []) as Record<string, any>[];
  const abertas = tarefas.filter((t) => t.status !== "concluida" && t.status !== "cancelada");
  const concluidas = tarefas.filter((t) => t.status === "concluida" || t.status === "cancelada");

  return (
    <Secao titulo="Tarefas e próximas ações deste caso" descricao="Mesma fila do Desk Operacional e do Painel Hoje — filtrada por este caso.">
      {q.isLoading ? <p className="text-sm text-navy/55">Carregando tarefas…</p> : null}
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}

      {!q.isLoading && abertas.length === 0 ? (
        <p className="text-sm text-navy/55">Nenhuma tarefa aberta para este caso.</p>
      ) : (
        <ul className="space-y-2">
          {abertas.map((t) => (
            <li key={t.id} className="rounded-lg border border-navy/10 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-navy">{t.titulo}</p>
                <span className="text-[11px] uppercase tracking-wide text-navy/50">
                  {ROTULO_TAREFA[t.status] ?? t.status} · {ROTULO_PRIORIDADE[t.prioridade] ?? t.prioridade}
                </span>
              </div>
              {t.descricao ? <p className="mt-1 text-xs text-navy/60">{t.descricao}</p> : null}
              {t.prazo ? <p className="mt-1 text-xs text-navy/50">Prazo: {new Date(t.prazo).toLocaleDateString("pt-BR")}</p> : null}
            </li>
          ))}
        </ul>
      )}

      {concluidas.length > 0 ? (
        <p className="mt-2 text-xs text-navy/50">{concluidas.length} tarefa(s) concluída(s)/cancelada(s) neste caso.</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          className={inputCls}
          placeholder="Nova tarefa/próxima ação para este caso"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <button
          type="button"
          onClick={() => titulo.trim() && m.mutate()}
          disabled={m.isPending || !titulo.trim()}
          className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-cream disabled:opacity-50"
        >
          {m.isPending ? "Criando…" : "Criar tarefa"}
        </button>
      </div>
    </Secao>
  );
}
