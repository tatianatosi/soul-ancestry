import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { BadgeDesk, BarraFiltros, CarregandoDesk, TabelaDesk, VazioDesk, type TomEstado } from "@/components/desk/ui-desk";
import { listarAlertas, type LinhaAlerta } from "@/lib/alertas.functions";
import { atualizarAlerta } from "@/lib/caso-canonico.functions";
import { salvarTarefa } from "@/lib/ops.functions";
import { ALERT_STATUS } from "@/lib/caso-ficha";

export const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas — Clube Ancestral" },
      {
        name: "description",
        content: "Lista completa e filtrável de sinais — sem duplicar tarefa, sem alterar próxima ação sem ação explícita.",
      },
      { property: "og:title", content: "Alertas — Clube Ancestral" },
      { property: "og:description", content: "Gestão de sinais do Desk Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AlertasPage,
});

const TOM_CRITICIDADE: Record<string, TomEstado> = {
  critica: "bloqueio",
  alta: "critico",
  atencao: "atencao",
};

function formatarData(v: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("pt-BR");
  } catch {
    return v;
  }
}

function AlertasPage() {
  const [status, setStatus] = useState<string>("");
  const [criticidade, setCriticidade] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const qc = useQueryClient();

  const carregar = useServerFn(listarAlertas);
  const q = useQuery({
    queryKey: ["alertas-completo", status, criticidade],
    queryFn: () => carregar({ data: { status: status || undefined, criticidade: criticidade || undefined } }),
  });

  const mudarAlerta = useServerFn(atualizarAlerta);
  const mAtualizar = useMutation({
    mutationFn: (v: { id: string; status: string; dueAt?: string | null }) => mudarAlerta({ data: v }),
    onSuccess: () => {
      setErro(null);
      void qc.invalidateQueries({ queryKey: ["alertas-completo"] });
    },
    onError: (e: Error) => setErro(e.message),
  });

  const criarTarefaFn = useServerFn(salvarTarefa);
  const mCriarTarefa = useMutation({
    mutationFn: (v: { casoId: string; titulo: string }) =>
      criarTarefaFn({ data: { valores: { caso_id: v.casoId, titulo: v.titulo, tipo: "alerta" } } }),
    onSuccess: () => {
      setErro(null);
      void qc.invalidateQueries({ queryKey: ["alertas-completo"] });
    },
    onError: (e: Error) => setErro(e.message),
  });

  const linhas = q.data ?? [];

  return (
    <SaasShell
      titulo="Alertas"
      descricao="Sinal sem duplicar tarefa. Lista completa e filtrável — a Visão Geral mostra só os prioritários de hoje."
    >
      {erro ? (
        <p className="mb-3 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

      <BarraFiltros>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-navy/20 bg-white px-2 py-1.5 text-sm"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status (exceto concluído)</option>
          {ALERT_STATUS.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <select
          value={criticidade}
          onChange={(e) => setCriticidade(e.target.value)}
          className="rounded-lg border border-navy/20 bg-white px-2 py-1.5 text-sm"
          aria-label="Filtrar por criticidade"
        >
          <option value="">Toda criticidade</option>
          <option value="critica">Crítica</option>
          <option value="alta">Alta</option>
          <option value="atencao">Atenção</option>
        </select>
      </BarraFiltros>

      {q.isLoading ? (
        <CarregandoDesk />
      ) : linhas.length === 0 ? (
        <VazioDesk titulo="Nenhum alerta neste filtro" descricao="Sem sinais pendentes para os filtros escolhidos." />
      ) : (
        <TabelaDesk cabecalho={["Caso", "Origem/Motivo", "Prioridade", "Data", "Tarefa", "Ação"]}>
          {linhas.map((a: LinhaAlerta) => (
            <tr key={a.id}>
              <td className="px-3 py-2 align-top">
                <Link to="/casos/$caseId" params={{ caseId: a.caseId }} className="font-medium text-navy underline">
                  {a.caseCodigo ?? a.caseTitulo ?? a.caseId}
                </Link>
                <span className="block text-[11px] text-navy/55">Responsável: {a.responsavel ?? "—"}</span>
              </td>
              <td className="px-3 py-2 align-top">
                <span className="block font-medium">{a.titulo}</span>
                <span className="block text-[11px] text-navy/55">
                  Origem: {a.origem} · {a.motivo ?? "—"}
                </span>
              </td>
              <td className="px-3 py-2 align-top">
                <BadgeDesk texto={a.criticidade} tom={TOM_CRITICIDADE[a.criticidade] ?? "neutro"} />
                <span className="block text-[11px] text-navy/55">{a.status}</span>
              </td>
              <td className="px-3 py-2 align-top text-[12px]">
                <span className="block">Ocorreu: {formatarData(a.dataOcorrencia)}</span>
                <span className="block">Prazo: {formatarData(a.dueAt)}</span>
              </td>
              <td className="px-3 py-2 align-top text-[12px]">
                {a.tarefaExistente ? (
                  <Link to="/tarefas" className="text-navy underline">
                    Abrir tarefa existente
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={mCriarTarefa.isPending}
                    onClick={() => mCriarTarefa.mutate({ casoId: a.caseId, titulo: a.titulo })}
                    className="rounded-md border border-navy/20 px-2 py-1 text-navy hover:bg-navy/5 disabled:opacity-50"
                  >
                    Abrir tarefa
                  </button>
                )}
              </td>
              <td className="px-3 py-2 align-top">
                <div className="flex flex-wrap gap-1.5">
                  {a.status !== "acknowledged" && a.status !== "completed" ? (
                    <button
                      type="button"
                      disabled={mAtualizar.isPending}
                      onClick={() => mAtualizar.mutate({ id: a.id, status: "acknowledged" })}
                      className="rounded-md border border-navy/20 px-2 py-1 text-xs text-navy hover:bg-navy/5 disabled:opacity-50"
                    >
                      Reconhecer
                    </button>
                  ) : null}
                  {a.status !== "completed" ? (
                    <button
                      type="button"
                      disabled={mAtualizar.isPending}
                      onClick={() => {
                        const nova = prompt("Nova data (AAAA-MM-DD):", (a.dueAt ?? "").slice(0, 10));
                        if (!nova?.trim()) return;
                        mAtualizar.mutate({ id: a.id, status: a.status, dueAt: new Date(`${nova}T12:00:00-03:00`).toISOString() });
                      }}
                      className="rounded-md border border-navy/20 px-2 py-1 text-xs text-navy hover:bg-navy/5 disabled:opacity-50"
                    >
                      Reprogramar
                    </button>
                  ) : null}
                  {a.tipo === "microentrega_pendente" ? (
                    <Link
                      to="/biblioteca-evidencias/$caseId"
                      params={{ caseId: a.caseId }}
                      className="rounded-md border border-navy/20 px-2 py-1 text-xs text-navy hover:bg-navy/5"
                    >
                      Preparar para revisão
                    </Link>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </TabelaDesk>
      )}
    </SaasShell>
  );
}
