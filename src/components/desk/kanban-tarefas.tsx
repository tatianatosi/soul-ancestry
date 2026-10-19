/**
 * Visão em colunas do Checklist (Prancha V4, 19/10/2026).
 *
 * As mesmas tarefas do CRUD abaixo, agrupadas por status em colunas —
 * leitura pura, sem arrastar: a mudança de status continua acontecendo
 * no formulário da tabela, com a gravação revalidada no servidor.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { KitCard } from "@/components/clube-ancestral-kit/base";
import { CrmKanban } from "@/components/clube-ancestral-kit/operacao";
import { EstadoDados } from "@/components/saas/estado-dados";
import { ESTADOS, PRIORIDADES } from "@/lib/estados";
import { listarRegistros } from "@/lib/saas.functions";

export function KanbanTarefas() {
  const carregar = useServerFn(listarRegistros);
  const q = useQuery({
    queryKey: ["tarefas-kanban"],
    queryFn: () => carregar({ data: { entidade: "tarefas" } }),
    retry: false,
  });

  const linhas = (Array.isArray(q.data) ? q.data : []) as any[];
  const colunas = ESTADOS.tarefa.map((estado) => ({
    id: estado.valor,
    title: estado.rotulo,
    items: linhas
      .filter((t) => (t.status ?? "nao_iniciada") === estado.valor)
      .map((t) => ({
        id: String(t.id),
        title: String(t.titulo ?? "Sem título"),
        context: PRIORIDADES.find((p) => p.valor === t.prioridade)?.rotulo
          ? `Prioridade ${PRIORIDADES.find((p) => p.valor === t.prioridade)!.rotulo.toLowerCase()}`
          : undefined,
        due: t.prazo ? String(t.prazo).slice(0, 10).split("-").reverse().join("/") : undefined,
        alert: t.bloqueio ? String(t.motivo_bloqueio ?? "Bloqueada") : undefined,
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
        {() => (
          <KitCard title="Tarefas em colunas" eyebrow="A mesma lista do Checklist, agrupada por status">
            <CrmKanban columns={colunas} />
            <p className="mt-3 text-[11px] text-navy/55">
              Visão de leitura: para mudar o status de uma tarefa, edite-a na tabela abaixo.
            </p>
          </KitCard>
        )}
      </EstadoDados>
    </div>
  );
}
