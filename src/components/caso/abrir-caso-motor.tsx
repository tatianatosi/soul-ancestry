import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { abrirCasoOperacional } from "@/lib/abrir-caso-operacional.functions";
import { SERVICOS_CASO_OPERACIONAL } from "@/lib/abrir-caso-operacional";
import { listarRegistros } from "@/lib/saas.functions";
import { semFixtures, type LinhaComOrigem } from "@/lib/fixtures";

/**
 * Corte vertical da Fase 1: selecionar cliente, título e serviço → persiste crm_casos.
 * Não substitui o CRUD da lista; é a entrada operacional que o EntidadeCrud não fecha sozinho.
 */
export function AbrirCasoMotor() {
  const navigate = useNavigate();
  const listar = useServerFn(listarRegistros);
  const abrir = useServerFn(abrirCasoOperacional);
  const [clienteId, setClienteId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [resumo, setResumo] = useState("");

  const qClientes = useQuery({
    queryKey: ["clientes", "abrir-caso"],
    queryFn: () => listar({ data: { entidade: "clientes" } }),
  });

  const m = useMutation({
    mutationFn: () =>
      abrir({
        data: {
          cliente_id: clienteId,
          titulo,
          tipo_servico: tipoServico,
          resumo: resumo || undefined,
        },
      }),
    onSuccess: (r) => {
      toast.success(r.codigo ? `Caso ${r.codigo} aberto.` : "Caso aberto e persistido.");
      void navigate({ to: "/casos/$caseId", params: { caseId: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clientes = qClientes.data ?? [];

  return (
    <section id="abrir-caso-operacional" className="rounded-xl border border-gold/40 bg-gold/10 p-4">
      <h2 className="font-serif text-lg text-navy">Abrir caso operacional</h2>
      <p className="mt-1 text-xs text-navy/60">
        Cliente, serviço e título são obrigatórios. O caso nasce em rascunho, com primeira tarefa e
        próxima ação. Depois disto, o planejador da ficha grava o plano em <code>case_plans</code>.
      </p>
      <form
        className="mt-3 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Cliente *
          </span>
          <select
            required
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy"
          >
            <option value="">— selecionar cliente —</option>
            {(semFixtures(clientes as LinhaComOrigem[]) as typeof clientes).map((c) => (
              <option key={String(c["id"])} value={String(c["id"])}>
                {String(c["nome"] ?? c["id"])}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Título do caso *
          </span>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Serviço *
          </span>
          <select
            required
            value={tipoServico}
            onChange={(e) => setTipoServico(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy"
          >
            <option value="">— selecionar serviço —</option>
            {SERVICOS_CASO_OPERACIONAL.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Resumo interno (opcional)
          </span>
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={m.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-40"
          >
            {m.isPending ? "Abrindo…" : "Abrir caso"}
          </button>
          <Link
            to="/clientes"
            className="text-sm text-navy underline decoration-gold underline-offset-4"
          >
            Cadastrar cliente antes
          </Link>
        </div>
      </form>
      {qClientes.isError ? (
        <p className="mt-2 text-xs text-terracotta">Não foi possível carregar os clientes.</p>
      ) : null}
    </section>
  );
}
