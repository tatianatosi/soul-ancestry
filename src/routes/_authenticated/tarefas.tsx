import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Filter, User } from "lucide-react";
import { useAutoridade } from "@/components/saas/autoridade";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { BotaoTentarNovamente, EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { Etiqueta, Indicador } from "@/components/prancha-v4/kit";
import { ESTADOS, PRIORIDADES, rotuloEstado } from "@/lib/estados";
import { listarFilaOps, referenciasOps } from "@/lib/ops.functions";
import { listarRegistros } from "@/lib/saas.functions";
import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { Link } from "@tanstack/react-router";
import { BadgeDesk } from "@/components/desk/ui-desk";
import { Button } from "@/components/ui/button";
import "@/components/desk/mockup4-superficies.css";

export const Route = createFileRoute("/_authenticated/tarefas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Checklist — Clube Ancestral" },
      { name: "description", content: "Tarefas operacionais da pesquisa genealógica e da jornada de cidadania." },
      { property: "og:title", content: "Checklist — Clube Ancestral" },
      { property: "og:description", content: "Tarefas operacionais no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TarefasPage,
});

function TarefasPage() {
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura não trava mais o CRUD.
  // Só falta de papel ou de organização bloqueia; o servidor revalida.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_fila_responsavel_prazo" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua.";
  return (
    <SaasShell
      titulo="Checklist / Kanban operacional"
      descricao="Tarefas dos casos: próxima ação, responsável, prazo e bloqueio por status real."
    >
      {pendenciaVinculo ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}
      {/*
        19/10/2026 — reconciliação com o Lovable: FonteAlimento (contexto
        visível) do Lovable por fora; `KanbanTarefas` continua sendo a
        implementação única e rica da branch (SLA, filtros, exclusão de
        fixtures) — não a versão simplificada que o Lovable criou em
        src/components/desk/kanban-tarefas.tsx (não usada aqui, para não
        duplicar o mesmo nome/conceito).
      */}
      <FonteAlimento
        fonte="Checklist operacional da equipe"
        consumidor="Painel Hoje, Caso 360 e a próxima ação de cada caso"
        detalheTecnico="tarefas · listarRegistros"
      />
      <KanbanTarefas />
      <div id="checklist-registros" className="scroll-mt-6" data-desk-mockup4="checklist">
      <EntidadeCrud
        entidade="tarefas"
        titulo="Checklist"
        podeEscrever={podeEscrever}
        dominio="tarefa"
        colunas={[
          { chave: "titulo", rotulo: "Título" },
          { chave: "prioridade", rotulo: "Prioridade", render: (l) => <BadgeDesk texto={String(l["prioridade"] ?? "Não registrada")} tom={l["prioridade"] === "alta" ? "critico" : "neutro"} /> },
          { chave: "status", rotulo: "Status", render: (l) => rotuloEstado("tarefa", l["status"]) },
          {
            chave: "motivo_bloqueio",
            rotulo: "Bloqueio",
            render: (l) => (l["bloqueio"] ? String(l["motivo_bloqueio"] ?? "bloqueada") : "—"),
          },
          { chave: "prazo", rotulo: "Prazo" },
        ]}
        extra={(linha) => linha["caso_id"] ? <Button asChild variant="outline" size="sm"><Link to="/casos/$caseId" params={{ caseId: String(linha["caso_id"]) }}>Abrir caso</Link></Button> : null}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          { chave: "descricao", rotulo: "Descrição", tipo: "area" },
          {
            chave: "caso_id",
            rotulo: "Caso vinculado",
            tipo: "select",
            obrigatorio: true,
            origem: { entidade: "crm_casos", rotuloChave: "titulo" },
          },
          {
            chave: "tipo",
            rotulo: "Tipo",
            tipo: "select",
            opcoes: [
              { valor: "geral", rotulo: "Geral" },
              { valor: "documental", rotulo: "Documental" },
              { valor: "pesquisa", rotulo: "Pesquisa" },
              { valor: "juridico", rotulo: "Jurídico" },
              { valor: "atendimento", rotulo: "Atendimento" },
              { valor: "financeiro", rotulo: "Financeiro" },
            ],
          },
          { chave: "responsavel_id", rotulo: "Responsável (UUID da equipe)" },
          { chave: "prioridade", rotulo: "Prioridade", tipo: "select", opcoes: PRIORIDADES },
          {
            chave: "status",
            rotulo: "Status",
            tipo: "select",
            estado: true,
            opcoes: ESTADOS.tarefa,
          },
          { chave: "motivo_bloqueio", rotulo: "Motivo do bloqueio", tipo: "area" },
          { chave: "prazo", rotulo: "Prazo", tipo: "data" },
        ]}
      />
      </div>
    </SaasShell>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type LinhaTarefa = Record<string, any>;

const STATUS_ABERTO = new Set(["nao_iniciada", "em_andamento", "bloqueada"]);

function dataCurta(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
}

/** Dias desde a última atualização real da tarefa (`updated_at`). */
function diasParada(t: LinhaTarefa): number | null {
  const ref = t["updated_at"] ?? t["created_at"];
  if (!ref) return null;
  const d = new Date(String(ref));
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

/*
  V4-02 — Checklist / Kanban operacional (mockup aprovado). Somente leitura:
  colunas = vocabulário REAL de `tarefas.status` (CHECK tarefas_status_chk:
  nao_iniciada, em_andamento, bloqueada, concluida, cancelada — o mesmo de
  ESTADOS.tarefa). Leitores existentes: `listarFilaOps` (v_ops_tarefas, SLA
  calculado no banco), `referenciasOps` (nome da equipe) e `listarRegistros`
  de crm_casos (próxima ação do caso). A chave da fila inclui o
  `dataUpdatedAt` da lista do Checklist abaixo — mesma chave de cache do
  EntidadeCrud — para que criar/editar/arquivar lá redesenhe o quadro.
  Edição de status continua no Checklist (Editar), que valida transições.
  19/10/2026 — conferência com a prancha V4 (kanban.png): "Confirmar · itens
  concluídos" conta as tarefas com status `concluida` (o próprio apoio da
  prancha diz o que é); "Em revisão" não existe no vocabulário real e fica
  "—", sem status novo. As 5 colunas aparecem sempre, com "0" e vazio
  honesto; o cabeçalho "Trabalho dos casos" é um cartão próprio, como na
  prancha, e o quadro vem logo abaixo.
*/
function KanbanTarefas() {
  const fnFila = useServerFn(listarFilaOps);
  const fnRefs = useServerFn(referenciasOps);
  const fnListar = useServerFn(listarRegistros);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [fResponsavel, setFResponsavel] = useState("");
  const [fPrioridade, setFPrioridade] = useState("");

  const lista = useQuery({
    queryKey: ["saas", "tarefas", false],
    queryFn: () => fnListar({ data: { entidade: "tarefas", incluirArquivados: false } }),
  });
  const casosQ = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => fnListar({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    staleTime: 30_000,
  });
  const fila = useQuery({
    queryKey: ["ops", "fila", "checklist", lista.dataUpdatedAt],
    queryFn: () => fnFila({ data: {} }),
  });
  const refs = useQuery({ queryKey: ["ops", "refs"], queryFn: () => fnRefs() });

  // Fixture/demonstração nunca entra em fila operacional (lib/fixtures.ts):
  // nem a tarefa marcada, nem a tarefa de caso de demonstração.
  const todas = semFixtures((fila.data?.tarefas ?? []) as LinhaTarefa[]).filter(
    (t) => !ehFixtureLinha({ codigo: t["caso_codigo"], titulo: t["caso_titulo"] }),
  );
  const nomeEquipe = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of (refs.data?.equipe ?? []) as LinhaTarefa[])
      m.set(String(e["auth_user_id"]), String(e["nome"] || e["email"] || ""));
    return m;
  }, [refs.data]);
  const proximaDoCaso = useMemo(() => {
    const m = new Map<string, string>();
    const linhas = (Array.isArray(casosQ.data) ? casosQ.data : []) as LinhaTarefa[];
    for (const c of linhas) if (c["proxima_acao"]) m.set(String(c["id"]), String(c["proxima_acao"]));
    return m;
  }, [casosQ.data]);

  const tarefas = todas.filter(
    (t) =>
      (!fResponsavel || String(t["responsavel_id"] ?? "") === fResponsavel) &&
      (!fPrioridade || t["prioridade"] === fPrioridade),
  );
  const filtroAtivo = Boolean(fResponsavel || fPrioridade);
  const apoioFiltro = filtroAtivo ? "no filtro atual" : "tarefas não arquivadas";

  const pendenteCritico = tarefas.filter(
    (t) => t["prioridade"] === "critica" && STATUS_ABERTO.has(String(t["status"])),
  ).length;
  const slaEmRisco = tarefas.filter((t) => t["sla_status"] === "em_risco").length;
  const concluidas = tarefas.filter((t) => t["status"] === "concluida").length;
  const kpisComDado = fila.isSuccess;

  const responsaveisNaFila = Array.from(
    new Set(todas.map((t) => String(t["responsavel_id"] ?? "")).filter(Boolean)),
  );

  return (
    <div className="mb-6 space-y-4" data-tarefas-kanban-v4>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-tarefas-kpis>
        <Indicador
          rotulo="Confirmar"
          valor={kpisComDado ? String(concluidas) : "sem dado"}
          apoio={kpisComDado ? `itens concluídos${filtroAtivo ? " · no filtro atual" : ""}` : "Fila não carregada"}
        />
        <Indicador rotulo="Em revisão" valor="—" apoio="esta semana · status inexistente no vocabulário real" />
        <Indicador
          rotulo="Pendente crítico"
          valor={kpisComDado ? String(pendenteCritico) : "sem dado"}
          apoio={kpisComDado ? `exige decisão · ${apoioFiltro}` : "Fila não carregada"}
        />
        <Indicador
          rotulo="SLA em risco"
          valor={kpisComDado ? String(slaEmRisco) : "sem dado"}
          apoio={kpisComDado ? `prazo próximo · SLA calculado pelo banco` : "Fila não carregada"}
        />
      </dl>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm" data-tarefas-cabecalho>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-xl text-navy">Trabalho dos casos</h2>
            <p className="mt-1 text-xs text-navy/60">Próxima ação, responsável, prazo e bloqueio em uma única leitura</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltrosAbertos((v) => !v)}
              aria-expanded={filtrosAbertos}
              className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
            >
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Filtros{filtroAtivo ? " •" : ""}
            </button>
            <a
              href="#checklist-registros"
              className="rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy-soft"
              data-tarefas-nova
            >
              Nova tarefa
            </a>
          </div>
        </div>
        {filtrosAbertos ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3" data-tarefas-filtros>
            <label className="text-xs text-navy/70">
              Responsável
              <select
                value={fResponsavel}
                onChange={(e) => setFResponsavel(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 bg-card px-2 py-1.5 text-sm"
              >
                <option value="">Todos</option>
                {responsaveisNaFila.map((id) => (
                  <option key={id} value={id}>
                    {nomeEquipe.get(id) || `#${id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-navy/70">
              Prioridade
              <select
                value={fPrioridade}
                onChange={(e) => setFPrioridade(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 bg-card px-2 py-1.5 text-sm"
              >
                <option value="">Todas</option>
                {PRIORIDADES.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.rotulo}
                  </option>
                ))}
              </select>
            </label>
            {filtroAtivo ? (
              <button
                type="button"
                onClick={() => {
                  setFResponsavel("");
                  setFPrioridade("");
                }}
                className="self-end rounded-md border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {fila.isLoading ? (
        <EstadoVazio mensagem="Carregando tarefas…" />
      ) : fila.isError ? (
        <EstadoVazio
          mensagem="Não foi possível carregar a fila de tarefas."
          acao={<BotaoTentarNovamente aoClicar={() => void fila.refetch()} />}
        />
      ) : tarefas.length === 0 ? (
        <p className="text-sm text-navy/60" data-tarefas-vazio>
          {filtroAtivo ? "Nenhuma tarefa com esses filtros." : "Nenhuma tarefa registrada ainda."}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-tarefas-kanban-colunas>
        {ESTADOS.tarefa.map((coluna) => {
          const daColuna = fila.isSuccess ? tarefas.filter((t) => t["status"] === coluna.valor) : [];
          return (
            <div key={coluna.valor} className="min-w-0 rounded-2xl border border-navy/10 bg-cream/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-serif text-[11px] uppercase tracking-wide text-navy/70">{coluna.rotulo}</span>
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-card px-1.5 text-[10px] font-semibold text-navy shadow-sm">
                  {fila.isSuccess ? daColuna.length : "—"}
                </span>
              </div>
              <div className="space-y-2">
                {daColuna.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-navy/15 px-2 py-3 text-center text-[11px] text-navy/45">
                    Nenhuma tarefa neste status.
                  </p>
                ) : (
                  daColuna.map((t) => {
                    const aberta = STATUS_ABERTO.has(String(t["status"]));
                    const dias = aberta ? diasParada(t) : null;
                    const bloqueada = t["status"] === "bloqueada" || t["bloqueio"] === true;
                    const proxima = t["caso_id"] ? proximaDoCaso.get(String(t["caso_id"])) : undefined;
                    const responsavel = t["responsavel_id"]
                      ? nomeEquipe.get(String(t["responsavel_id"])) || "Responsável sem nome"
                      : "Sem responsável";
                    const prazo = dataCurta(t["prazo"]);
                    return (
                      <article
                        key={t["id"]}
                        className="rounded-xl border border-navy/10 bg-card p-3 shadow-sm"
                        data-tarefa-cartao
                      >
                        <p className="text-sm font-semibold text-navy">{t["titulo"]}</p>
                        <p className="mt-0.5 truncate text-[11px] text-navy/55">
                          {t["caso_codigo"]
                            ? `${t["caso_codigo"]}${t["caso_titulo"] ? ` · ${t["caso_titulo"]}` : ""}`
                            : "Sem caso vinculado"}
                        </p>
                        <p className="mt-2 border-t border-navy/5 pt-2 text-[11px] text-navy/70">
                          <span className="font-semibold text-navy">Próximo passo:</span>{" "}
                          {proxima ?? "não registrado no caso"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {aberta ? (
                            <Etiqueta
                              texto={
                                PRIORIDADES.find((p) => p.valor === t["prioridade"])?.rotulo ??
                                (t["prioridade"] ? String(t["prioridade"]) : "Sem prioridade")
                              }
                              tom={t["prioridade"] === "critica" ? "critico" : t["prioridade"] === "alta" ? "atencao" : "neutro"}
                            />
                          ) : null}
                          {dias !== null && dias >= 7 ? (
                            <Etiqueta texto={`Atividade parada há ${dias} dias`} tom="atencao" />
                          ) : null}
                          {t["sla_status"] === "em_risco" ? <Etiqueta texto="SLA em risco" tom="atencao" /> : null}
                          {t["sla_status"] === "atrasada" ? <Etiqueta texto="SLA vencido" tom="critico" /> : null}
                          {bloqueada ? (
                            <Etiqueta
                              texto={t["motivo_bloqueio"] ? `Bloqueio: ${t["motivo_bloqueio"]}` : "Bloqueio"}
                              tom="critico"
                            />
                          ) : null}
                          {t["status"] === "concluida" ? <Etiqueta texto="Concluída" tom="sucesso" /> : null}
                          {t["status"] === "cancelada" ? <Etiqueta texto="Histórico" tom="neutro" /> : null}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-navy/5 pt-2 text-[10px] text-navy/55">
                          <span className="flex min-w-0 items-center gap-1">
                            <User className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{responsavel}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1 tabular-nums">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {prazo ?? "Sem prazo"}
                          </span>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
