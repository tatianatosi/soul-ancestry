import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { BadgeDesk, BarraFiltros, CarregandoDesk, TabelaDesk, VazioDesk, type TomEstado } from "@/components/desk/ui-desk";
import { listarAlertas, listarAlertasCentrais, type AlertaCentral, type LinhaAlerta } from "@/lib/alertas.functions";
import { atualizarAlerta } from "@/lib/caso-canonico.functions";
import { salvarTarefa } from "@/lib/ops.functions";
import { ALERT_STATUS } from "@/lib/caso-ficha";
import { CardIndicador, SectionHeader } from "@/components/desk/ui-desk";
import { Button } from "@/components/ui/button";
import "@/components/desk/mockup4-superficies.css";

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
  const carregarCentrais = useServerFn(listarAlertasCentrais);
  const centrais = useQuery({
    queryKey: ["alertas-centrais"],
    queryFn: () => carregarCentrais(),
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
  const filasCentrais = [
    {
      chave: "cadencias",
      titulo: "Cadências vencidas",
      descricao: "Casos em atenção ou críticos pelos limites D10/D14 da Jornada.",
      itens: centrais.data?.cadencias ?? [],
      destino: "/ops" as const,
    },
    {
      chave: "sem-acao",
      titulo: "Casos sem próxima ação",
      descricao: "Casos para os quais a regra canônica retorna “Definir próximo passo”.",
      itens: centrais.data?.casosSemAcao ?? [],
      destino: "/casos" as const,
    },
    {
      chave: "leads-parados",
      titulo: "Leads parados",
      descricao: "Ações vencidas, ausência de próxima ação e follow-ups pendentes no CRM.",
      itens: centrais.data?.leadsParados ?? [],
      destino: "/proximas-acoes" as const,
    },
  ];

  return (
    <SaasShell
      titulo="Alertas"
      descricao="Central operacional com a origem de cada sinal. Nenhuma fila cria registros ou dispara ações externas."
      visualKit="pantone"
    >
      {erro ? (
        <p className="mb-3 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

      <div data-desk-mockup4="alertas">
      <section className="mb-8 space-y-4" aria-labelledby="filas-centrais">
        <SectionHeader
          titulo="Filas centralizadas"
          descricao="Leitura ao vivo de Jornada, Caso 360 e CRM, sem duplicar os dados de origem."
        />
        {centrais.isLoading ? <CarregandoDesk linhas={3} rotulo="Carregando filas centralizadas" /> : null}
        {centrais.isError ? (
          <div role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
            <p>Não foi possível ler as filas de origem. Isto é uma falha de leitura, não uma fila vazia.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void centrais.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : null}
        {!centrais.isLoading && !centrais.isError ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <CardIndicador rotulo="Cadências vencidas" valor={centrais.data?.cadencias.length ?? 0} apoio="Origem: Jornada" tom="critico" />
              <CardIndicador rotulo="Casos sem próxima ação" valor={centrais.data?.casosSemAcao.length ?? 0} apoio="Origem: Caso 360" tom="atencao" />
              <CardIndicador rotulo="Leads parados" valor={centrais.data?.leadsParados.length ?? 0} apoio="Origem: CRM" tom="atencao" />
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {filasCentrais.map((fila) => (
                <article key={fila.chave} className="rounded-xl border border-navy/10 bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg text-navy">{fila.titulo}</h3>
                      <p className="mt-1 text-xs text-navy/60">{fila.descricao}</p>
                    </div>
                    <BadgeDesk texto={`${fila.itens.length} ${fila.itens.length ? "em atenção" : "pendentes"}`} tom={fila.itens.length ? "atencao" : "sucesso"} />
                  </div>
                  <ul className="mt-4 space-y-2">
                    {fila.itens.slice(0, 8).map((item: AlertaCentral) => (
                      <li key={item.id} className="rounded-lg border border-navy/10 bg-background/60 p-3 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          {item.caseId ? (
                            <Link to="/casos/$caseId" params={{ caseId: item.caseId }} className="font-medium text-navy underline decoration-gold underline-offset-4">
                              {item.codigo ?? item.titulo}
                            </Link>
                          ) : (
                            <span className="font-medium text-navy">{item.codigo ?? item.titulo}</span>
                          )}
                          <BadgeDesk texto={item.origem} />
                        </div>
                        <p className="mt-1 text-xs text-navy/70">{item.motivo}</p>
                        <p className="mt-2 text-[11px] text-navy/55">
                          Responsável: {item.responsavel ?? "não definido"}{item.prazo ? ` · Prazo: ${formatarData(item.prazo)}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {!fila.itens.length ? <p className="mt-4 text-sm text-navy/55">Nenhum sinal nesta fila.</p> : null}
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to={fila.destino}>Abrir origem</Link>
                  </Button>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section aria-labelledby="alertas-registrados">
      <SectionHeader
        titulo="Alertas registrados"
        descricao="Sinais persistidos com reconhecimento, reprogramação e tarefa vinculada."
      />
      <BarraFiltros>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-sm"
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
          className="rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-sm"
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
      ) : q.isError ? (
        // 26/10/2026 (auditoria): sem este ramo, falha de leitura caía no
        // mesmo "Nenhum alerta neste filtro" de uma fila realmente vazia.
        <div role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          <p>Não foi possível ler os alertas. Isto é uma falha de leitura, não ausência de alertas.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void q.refetch()}>
            Tentar novamente
          </Button>
        </div>
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
      </section>
      </div>
    </SaasShell>
  );
}
