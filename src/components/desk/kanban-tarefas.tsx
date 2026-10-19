/**
 * Visão em colunas do Checklist (Prancha V4, 19/10/2026).
 *
 * As mesmas tarefas do CRUD abaixo, agrupadas por status em colunas —
 * leitura pura, sem arrastar: a mudança de status continua acontecendo
 * no formulário da tabela, com a gravação revalidada no servidor.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { CrmKanban } from "@/components/clube-ancestral-kit/operacao";
import { EstadoDados } from "@/components/saas/estado-dados";
import { ESTADOS, PRIORIDADES, rotuloEstado } from "@/lib/estados";
import { listarRegistros } from "@/lib/saas.functions";

const TOM_COLUNA = ["neutro", "gold", "attention", "success", "neutro"] as const;

export function KanbanTarefas() {
  const carregar = useServerFn(listarRegistros);
  const q = useQuery({
    queryKey: ["tarefas-kanban"],
    queryFn: () => carregar({ data: { entidade: "tarefas" } }),
    retry: false,
  });

  const linhas = ((q.data as any)?.registros ?? (q.data as any)?.linhas ?? []) as any[];
  const colunas = ESTADOS.tarefa.map((estado, i) => ({
    titulo: estado.rotulo,
    tom: TOM_COLUNA[i] ?? "neutro",
    itens: linhas
      .filter((t) => (t.status ?? "nao_iniciada") === estado.valor)
      .map((t) => ({
        id: String(t.id),
        titulo: String(t.titulo ?? "Sem título"),
        subtitulo: [
          PRIORIDADES.find((p) => p.valor === t.prioridade)?.rotulo ?? null,
          t.prazo ? `Prazo ${String(t.prazo).slice(0, 10).split("-").reverse().join("/")}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
        selo: t.bloqueio ? "Bloqueada" : rotuloEstado("tarefa", t.status),
      })),
  }));

  return (
    <div className="mb-6">
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="as tarefas em colunas"
        vazio="Nenhuma tarefa registrada."
      >
        <CrmKanban
          titulo="Tarefas em colunas"
          eyebrow="A mesma lista do Checklist, agrupada por status"
          colunas={colunas as any}
        />
        <p className="mt-2 text-[11px] text-navy/55">
          Visão de leitura: para mudar o status de uma tarefa, edite-a na tabela abaixo.
        </p>
      </EstadoDados>
    </div>
  );
}
