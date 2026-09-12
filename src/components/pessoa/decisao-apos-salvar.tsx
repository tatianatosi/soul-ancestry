import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { marcarSemNovaAcaoNecessaria } from "@/lib/caso-canonico.functions";
import { tituloTarefaAposSalvarPessoa } from "@/lib/decisao-apos-salvar-pessoa";
import { salvarTarefa } from "@/lib/ops.functions";

export type CasoParaDecisao = { id: string; codigo?: string | null; titulo?: string | null };

/**
 * Aparece só depois da releitura confirmar o save.
 * Criar tarefa ou "sem nova ação" usam writers já existentes.
 */
export function DecisaoAposSalvarPessoa({
  nomePessoa,
  casos,
  onFechou,
}: {
  nomePessoa: string;
  casos: CasoParaDecisao[];
  onFechou: () => void;
}) {
  const criar = useServerFn(salvarTarefa);
  const semAcao = useServerFn(marcarSemNovaAcaoNecessaria);
  const [casoId, setCasoId] = useState(casos[0]?.id ?? "");

  const mTarefa = useMutation({
    mutationFn: () =>
      criar({
        data: {
          valores: {
            titulo: tituloTarefaAposSalvarPessoa(nomePessoa),
            caso_id: casoId,
            tipo: "atendimento",
            descricao: "Decisão humana após salvar a ficha da pessoa. O dado já está no banco.",
          },
        },
      }),
    onSuccess: (r: { reaproveitada?: boolean }) => {
      toast.success(r.reaproveitada ? "Tarefa já existia na fila — reaproveitada." : "Tarefa criada na fila de Ops.");
      onFechou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mSem = useMutation({
    mutationFn: () => semAcao({ data: { caseId: casoId } }),
    onSuccess: () => {
      toast.success("Sem nova ação necessária — gravado no caso.");
      onFechou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      role="status"
      className="mt-3 rounded-lg border border-gold/50 bg-gold/10 px-3 py-3 text-sm text-navy"
    >
      <p className="font-medium">Salvo e confirmado no banco.</p>
      <p className="mt-1 text-xs text-navy/70">
        O registro permanece gravado. Agora: criar tarefa de acompanhamento ou marcar que não há
        nova ação — nenhum dos dois desfaz o save.
      </p>

      {casos.length === 0 ? (
        <p className="mt-2 text-xs text-navy/60">
          Esta pessoa ainda não tem caso vinculado. A ficha está salva; a tarefa entra quando houver
          caso.
        </p>
      ) : casos.length > 1 ? (
        <label className="mt-2 block text-xs">
          Caso
          <select
            className="mt-1 w-full rounded-md border border-navy/20 bg-cream/40 px-2 py-1 text-sm"
            value={casoId}
            onChange={(e) => setCasoId(e.target.value)}
          >
            {casos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo || c.titulo || c.id}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!casoId || mTarefa.isPending}
          onClick={() => mTarefa.mutate()}
          className="rounded-md bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          {mTarefa.isPending ? "Criando…" : "Criar tarefa neste caso"}
        </button>
        <button
          type="button"
          disabled={!casoId || mSem.isPending}
          onClick={() => mSem.mutate()}
          className="rounded-md border border-navy/20 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
        >
          {mSem.isPending ? "Gravando…" : "Sem nova ação necessária"}
        </button>
        <button type="button" onClick={onFechou} className="px-2 text-xs text-navy/50">
          Fechar
        </button>
      </div>
    </div>
  );
}
