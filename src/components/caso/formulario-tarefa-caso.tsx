import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { PRIORIDADES, ROTULO_PRIORIDADE, TIPOS_TAREFA, ROTULO_TIPO } from "@/lib/ops.server";
import { referenciasOps, salvarTarefa } from "@/lib/ops.functions";

/**
 * Formulário visível da ficha: cria tarefa no caso com responsável, prazo, prioridade
 * e bloqueio. Substitui o prompt() que só gravava o título.
 */
export function FormularioTarefaCaso({
  caseId,
  onCriada,
}: {
  caseId: string;
  onCriada: () => void;
}) {
  const criar = useServerFn(salvarTarefa);
  const refs = useServerFn(referenciasOps);
  const qRefs = useQuery({
    queryKey: ["ops-referencias", "form-tarefa"],
    queryFn: () => refs(),
  });

  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [tipo, setTipo] = useState("geral");
  const [responsavelId, setResponsavelId] = useState("");
  const [bloqueio, setBloqueio] = useState(false);
  const [motivoBloqueio, setMotivoBloqueio] = useState("");

  const m = useMutation({
    mutationFn: (tituloTrim: string) =>
      criar({
        data: {
          valores: {
            caso_id: caseId,
            titulo: tituloTrim,
            tipo,
            prioridade,
            prazo: prazo || null,
            responsavel_id: responsavelId || null,
            status: bloqueio ? "bloqueada" : "nao_iniciada",
            motivo_bloqueio: bloqueio ? motivoBloqueio : null,
          },
        },
      }),
    onSuccess: () => {
      toast.success("Tarefa criada/reaproveitada no caso.");
      setTitulo("");
      setPrazo("");
      setMotivoBloqueio("");
      setBloqueio(false);
      onCriada();
    },
    onError: (e: Error) =>
      toast.error("Não foi possível criar a tarefa", { description: e.message }),
  });

  return (
    <form
      id="form-tarefa-caso"
      className="mt-3 space-y-2 rounded-lg border border-navy/10 bg-navy/5 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const t = titulo.trim();
        if (!t) return;
        m.mutate(t);
      }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
        Nova tarefa do caso
      </p>
      <input
        required
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título da tarefa"
        className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs text-navy/70">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream px-2 py-1.5 text-sm"
          >
            {TIPOS_TAREFA.map((t) => (
              <option key={t} value={t}>
                {ROTULO_TIPO[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-navy/70">
          Prioridade
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream px-2 py-1.5 text-sm"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {ROTULO_PRIORIDADE[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-navy/70">
          Prazo
          <input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs text-navy/70">
          Responsável
          <select
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream px-2 py-1.5 text-sm"
          >
            <option value="">— sem responsável —</option>
            {(qRefs.data?.equipe ?? []).map((p: Record<string, unknown>) => (
              <option key={String(p["auth_user_id"])} value={String(p["auth_user_id"])}>
                {String(p["nome"] ?? p["email"] ?? p["auth_user_id"])}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs text-navy/80">
        <input type="checkbox" checked={bloqueio} onChange={(e) => setBloqueio(e.target.checked)} />
        Registrar como pendência/bloqueio
      </label>
      {bloqueio ? (
        <textarea
          required
          value={motivoBloqueio}
          onChange={(e) => setMotivoBloqueio(e.target.value)}
          placeholder="Motivo do bloqueio (obrigatório)"
          rows={2}
          className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm"
        />
      ) : null}
      <button
        type="submit"
        disabled={m.isPending}
        className="rounded-lg bg-navy px-3 py-1.5 text-sm text-cream disabled:opacity-40"
      >
        {m.isPending ? "Gravando…" : "Criar tarefa"}
      </button>
    </form>
  );
}
