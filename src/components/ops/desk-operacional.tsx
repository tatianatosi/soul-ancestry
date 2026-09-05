import { useEffect, useMemo, useState } from "react";
import { useAutoridade } from "@/components/saas/autoridade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Campo, Gaveta, Painel, Selo, inputCls } from "@/components/comercial/base";
import {
  alertasOps,
  arquivarOps,
  listarFilaOps,
  listarMicroentregas,
  moverTarefa,
  painelOps,
  referenciasOps,
  salvarMicroentrega,
  salvarRegraSla,
  salvarTarefa,
} from "@/lib/ops.functions";
import {
  PRIORIDADES,
  ROTULO_MICRO,
  ROTULO_PRIORIDADE,
  ROTULO_SLA,
  ROTULO_TAREFA,
  ROTULO_TIPO,
  STATUS_MICRO,
  STATUS_TAREFA,
  TIPOS_TAREFA,
} from "@/lib/ops.server";
import { FASES_JORNADA, sugerirProximaMicroentrega } from "@/lib/onboarding-jornada";
import { rotuloFase } from "@/lib/fase-rotulo";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

const ABAS = [
  { id: "painel", rotulo: "Painel OPS" },
  { id: "fila", rotulo: "Fila de trabalho" },
  { id: "kanban", rotulo: "Kanban" },
  { id: "micro", rotulo: "Micro-entregas" },
  { id: "calendario", rotulo: "Calendário" },
  { id: "sla", rotulo: "SLA" },
] as const;

function tomSla(status: string): "neutro" | "ok" | "alerta" | "erro" {
  if (status === "atrasada") return "erro";
  if (status === "em_risco") return "alerta";
  if (status === "no_prazo") return "ok";
  return "neutro";
}

function dataBr(v: unknown) {
  if (!v) return "sem prazo";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "sem prazo" : d.toLocaleDateString("pt-BR");
}

export function DeskOperacional() {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("painel");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [novaTarefa, setNovaTarefa] = useState(false);
  const [novaMicro, setNovaMicro] = useState(false);
  const [editarMicro, setEditarMicro] = useState<Linha | null>(null);
  const [microCasoId, setMicroCasoId] = useState("");

  const qc = useQueryClient();
  const fnFila = useServerFn(listarFilaOps);
  const fnMicro = useServerFn(listarMicroentregas);
  const fnRefs = useServerFn(referenciasOps);
  const fnPainel = useServerFn(painelOps);
  const fnAlertas = useServerFn(alertasOps);
  const fnMover = useServerFn(moverTarefa);
  const fnSalvarTarefa = useServerFn(salvarTarefa);
  const fnSalvarMicro = useServerFn(salvarMicroentrega);
  const fnArquivar = useServerFn(arquivarOps);
  const fnSla = useServerFn(salvarRegraSla);

  const autoridade = useAutoridade();
  const refs = useQuery({ queryKey: ["ops", "refs"], queryFn: () => fnRefs() });
  const painel = useQuery({ queryKey: ["ops", "painel"], queryFn: () => fnPainel() });
  const alertas = useQuery({ queryKey: ["ops", "alertas"], queryFn: () => fnAlertas() });
  const fila = useQuery({ queryKey: ["ops", "fila", filtros], queryFn: () => fnFila({ data: filtros }) });
  const micro = useQuery({
    queryKey: ["ops", "micro", filtros],
    queryFn: () => fnMicro({ data: { casoId: filtros["casoId"], responsavelId: filtros["responsavelId"] } }),
  });

  const atualizar = () => qc.invalidateQueries({ queryKey: ["ops"] });

  const mover = useMutation({
    mutationFn: (v: { id: string; status: string; motivoBloqueio?: string; desbloqueioJustificativa?: string }) =>
      fnMover({ data: v }),
    onSuccess: () => {
      toast.success("Tarefa atualizada.");
      atualizar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const equipe = (refs.data?.equipe ?? []) as Linha[];
  const casos = (refs.data?.casos ?? []) as Linha[];

  useEffect(() => {
    if (novaMicro || editarMicro) setMicroCasoId(editarMicro?.["caso_id"] ?? "");
  }, [novaMicro, editarMicro]);

  const casoDaMicro = casos.find((c) => c["id"] === microCasoId);
  const sugestaoMicro = editarMicro
    ? null
    : sugerirProximaMicroentrega({
        eixoComercial: casoDaMicro?.["eixo_comercial"],
        eixoFormalizacao: casoDaMicro?.["eixo_formalizacao"],
      });
  // Autoridade operacional: vínculo somente leitura deixa de esconder as ações
  // do desk. Só falta de papel/organização bloqueia; o servidor revalida.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_fila_responsavel_prazo" });
  const pendenciaVinculo =
    refs.data && !refs.data.podeEscrever
      ? "Seu vínculo de equipe está marcado como somente leitura — as ações do desk seguem disponíveis por decisão sua."
      : null;
  const falhasConsulta = [
    refs.isError ? "referências (equipe, casos e regras de SLA)" : null,
    fila.isError ? "fila de tarefas" : null,
    micro.isError ? "microentregas" : null,
    alertas.isError ? "alertas operacionais" : null,
  ].filter(Boolean) as string[];
  const tarefas = (fila.data?.tarefas ?? []) as Linha[];
  const microentregas = (micro.data?.microentregas ?? []) as Linha[];

  const nomePessoa = (id: unknown) =>
    equipe.find((e) => e["auth_user_id"] === id)?.["nome"] ??
    equipe.find((e) => e["auth_user_id"] === id)?.["email"] ??
    "sem responsável";

  const calendario = useMemo(() => {
    const mapa = new Map<string, { tarefas: Linha[]; micro: Linha[] }>();
    for (const t of tarefas) {
      if (!t["prazo"]) continue;
      const k = String(t["prazo"]);
      if (!mapa.has(k)) mapa.set(k, { tarefas: [], micro: [] });
      mapa.get(k)!.tarefas.push(t);
    }
    for (const m of microentregas) {
      if (!m["prazo"]) continue;
      const k = String(m["prazo"]);
      if (!mapa.has(k)) mapa.set(k, { tarefas: [], micro: [] });
      mapa.get(k)!.micro.push(m);
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [tarefas, microentregas]);

  function pedirStatus(t: Linha, status: string) {
    if (status === "bloqueada") {
      const motivo = window.prompt("Motivo do bloqueio (opcional):");
      if (motivo === null) return;
      mover.mutate({ id: t["id"], status, motivoBloqueio: motivo });
      return;
    }
    const precisaDesbloqueio = t["status"] === "bloqueada" || (status === "concluida" && t["bloqueado_em"]);
    if (precisaDesbloqueio) {
      const just = window.prompt("Justificativa do desbloqueio (opcional):");
      if (just === null) return;
      mover.mutate({ id: t["id"], status, desbloqueioJustificativa: just });
      return;
    }
    mover.mutate({ id: t["id"], status });
  }

  const p = (painel.data ?? {}) as Linha;

  return (
    <div className="space-y-4">
      {pendenciaVinculo ? (
        <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}
      {falhasConsulta.length ? (
        <div role="alert" className="space-y-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          <p>
            Falha de consulta em: {falhasConsulta.join(", ")}. As listas abaixo estão incompletas por erro de leitura,
            não por ausência de registro.
          </p>
          <button
            type="button"
            onClick={() => {
              if (refs.isError) void refs.refetch();
              if (fila.isError) void fila.refetch();
              if (micro.isError) void micro.refetch();
              if (alertas.isError) void alertas.refetch();
            }}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-[11px] font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}
      {(alertas.data?.atrasadas.length || alertas.data?.emRisco.length || alertas.data?.microAtrasadas.length) ? (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
          <h2 className="font-serif text-lg">Alertas operacionais</h2>
          <ul className="mt-1 space-y-1 text-sm">
            {alertas.data!.atrasadas.slice(0, 5).map((t: Linha) => (
              <li key={t["id"]}>
                Atrasada: {t["titulo"]} · {t["caso_codigo"] ?? "sem caso"} · prazo {dataBr(t["prazo"])}
              </li>
            ))}
            {alertas.data!.emRisco.slice(0, 5).map((t: Linha) => (
              <li key={t["id"]}>SLA em risco: {t["titulo"]} · vence {dataBr(t["sla_prazo_em"])}</li>
            ))}
            {alertas.data!.microAtrasadas.slice(0, 5).map((m: Linha) => (
              <li key={m["id"]}>
                Micro-entrega atrasada: {m["titulo"]} · {m["caso_codigo"] ?? "sem caso"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <nav className="flex flex-wrap gap-2">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              aba === a.id ? "border-navy bg-navy text-cream" : "border-navy/15 text-navy/70 hover:bg-navy/5",
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aba !== "painel" && aba !== "sla" && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-white p-3">
          <select
            className={cn(inputCls, "w-auto")}
            value={filtros["responsavelId"] ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, responsavelId: e.target.value }))}
          >
            <option value="">Todos os responsáveis</option>
            {equipe.map((e) => (
              <option key={e["auth_user_id"]} value={e["auth_user_id"]}>
                {e["nome"] ?? e["email"]}
              </option>
            ))}
          </select>
          <select
            className={cn(inputCls, "w-auto")}
            value={filtros["casoId"] ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, casoId: e.target.value }))}
          >
            <option value="">Todos os casos</option>
            {casos.map((c) => (
              <option key={c["id"]} value={c["id"]}>
                {c["codigo"]} — {c["titulo"]}
              </option>
            ))}
          </select>
          <select
            className={cn(inputCls, "w-auto")}
            value={filtros["prioridade"] ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, prioridade: e.target.value }))}
          >
            <option value="">Todas as prioridades</option>
            {PRIORIDADES.map((x) => (
              <option key={x} value={x}>
                {ROTULO_PRIORIDADE[x]}
              </option>
            ))}
          </select>
          <select
            className={cn(inputCls, "w-auto")}
            value={filtros["sla"] ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, sla: e.target.value }))}
          >
            <option value="">Todos os SLAs</option>
            {["no_prazo", "em_risco", "atrasada", "sem_sla"].map((x) => (
              <option key={x} value={x}>
                {ROTULO_SLA[x]}
              </option>
            ))}
          </select>
          <input
            type="date"
            className={cn(inputCls, "w-auto")}
            value={filtros["ate"] ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, ate: e.target.value }))}
          />
          <button onClick={() => setFiltros({})} className="rounded-lg border border-navy/20 px-3 py-1 text-xs">
            Limpar filtros
          </button>
        </div>
      )}

      {aba === "painel" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              ["Casos ativos", p["casos_ativos"]],
              ["Casos bloqueados/pausados", p["casos_bloqueados"]],
              ["Tarefas vencidas", p["tarefas_vencidas"]],
              ["SLA em risco", p["sla_em_risco"]],
              ["Tarefas bloqueadas", p["tarefas_bloqueadas"]],
              ["Micro-entregas pendentes", p["micro_pendentes"]],
              ["Micro-entregas atrasadas", p["micro_atrasadas"]],
            ].map(([rotulo, valor]) => (
              <div key={String(rotulo)} className="rounded-xl border border-navy/10 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-navy/50">{String(rotulo)}</p>
                <p className="font-serif text-3xl">{Number(valor ?? 0)}</p>
              </div>
            ))}
          </div>
          <Painel titulo="Carga por responsável">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-navy/50">
                    <th className="py-2">Responsável</th>
                    <th>Tarefas abertas</th>
                    <th>Atrasadas</th>
                    <th>Micro-entregas abertas</th>
                  </tr>
                </thead>
                <tbody>
                  {((p["carga"] as Linha[]) ?? []).map((c) => (
                    <tr key={String(c["responsavel_id"])} className="border-t border-navy/10">
                      <td className="py-2">{c["nome"]}</td>
                      <td>{c["tarefas_abertas"]}</td>
                      <td className={Number(c["tarefas_atrasadas"]) > 0 ? "text-terracotta" : ""}>
                        {c["tarefas_atrasadas"]}
                      </td>
                      <td>{c["micro_abertas"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-navy/50">
              Indicadores e SLA são calculados no banco de dados, não pela cor da tela.
            </p>
          </Painel>
        </div>
      )}

      {aba === "fila" && (
        <Painel titulo="Fila de trabalho">
          {podeEscrever && (
            <button
              onClick={() => setNovaTarefa(true)}
              className="mb-3 rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
            >
              Nova tarefa
            </button>
          )}
          <div className="space-y-2">
            {tarefas.length === 0 && <p className="text-sm text-navy/60">Nenhuma tarefa com esses filtros.</p>}
            {tarefas.map((t) => (
              <div key={t["id"]} className="rounded-xl border border-navy/10 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{t["titulo"]}</strong>
                  <Selo texto={ROTULO_TAREFA[t["status"]] ?? t["status"]} />
                  <Selo texto={ROTULO_PRIORIDADE[t["prioridade"]] ?? t["prioridade"]} />
                  <Selo texto={ROTULO_TIPO[t["tipo"]] ?? t["tipo"]} />
                  <Selo texto={ROTULO_SLA[t["sla_status"]] ?? t["sla_status"]} tom={tomSla(t["sla_status"])} />
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  {t["caso_codigo"] ?? "sem caso"} · {nomePessoa(t["responsavel_id"])} · prazo {dataBr(t["prazo"])} ·
                  SLA até {dataBr(t["sla_prazo_em"])}
                </p>
                {t["status"] === "bloqueada" && (
                  <p className="mt-1 text-xs text-terracotta">
                    Bloqueada em {dataBr(t["bloqueado_em"])} — {t["motivo_bloqueio"]}
                  </p>
                )}
                {podeEscrever && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STATUS_TAREFA.filter((s) => s !== t["status"]).map((s) => (
                      <button
                        key={s}
                        onClick={() => pedirStatus(t, s)}
                        className="rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
                      >
                        {ROTULO_TAREFA[s]}
                      </button>
                    ))}
                    <button
                      onClick={async () => {
                        const motivo = window.prompt("Motivo do arquivamento (opcional):");
                        if (motivo === null) return;
                        try {
                          await fnArquivar({ data: { tabela: "tarefas", id: t["id"], motivo } });
                          toast.success("Tarefa arquivada.");
                          atualizar();
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                      className="rounded-lg border border-terracotta/40 px-2 py-1 text-[11px] text-terracotta"
                    >
                      Arquivar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Painel>
      )}

      {aba === "kanban" && (
        <div className="grid gap-3 lg:grid-cols-5">
          {STATUS_TAREFA.map((coluna) => (
            <div key={coluna} className="rounded-xl border border-navy/10 bg-white p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/60">
                {ROTULO_TAREFA[coluna]} ({tarefas.filter((t) => t["status"] === coluna).length})
              </h3>
              <div className="space-y-2">
                {tarefas
                  .filter((t) => t["status"] === coluna)
                  .map((t) => (
                    <div
                      key={t["id"]}
                      className={cn(
                        "rounded-lg border p-2 text-xs",
                        t["sla_status"] === "atrasada" && "border-terracotta bg-terracotta/5",
                        t["sla_status"] === "em_risco" && "border-gold bg-gold/10",
                        !["atrasada", "em_risco"].includes(String(t["sla_status"])) && "border-navy/10",
                      )}
                    >
                      <p className="font-medium">{t["titulo"]}</p>
                      <p className="text-navy/50">
                        {t["caso_codigo"] ?? "sem caso"} · {nomePessoa(t["responsavel_id"])}
                      </p>
                      <p className="text-navy/50">Prazo {dataBr(t["prazo"])}</p>
                      {podeEscrever && (
                        <select
                          className="mt-1 w-full rounded border border-navy/20 px-1 py-0.5 text-[11px]"
                          value=""
                          onChange={(e) => e.target.value && pedirStatus(t, e.target.value)}
                        >
                          <option value="">Mover para…</option>
                          {STATUS_TAREFA.filter((s) => s !== coluna).map((s) => (
                            <option key={s} value={s}>
                              {ROTULO_TAREFA[s]}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === "micro" && (
        <Painel titulo="Micro-entregas">
          {podeEscrever && (
            <button
              onClick={() => setNovaMicro(true)}
              className="mb-3 rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
            >
              Nova micro-entrega
            </button>
          )}
          <div className="space-y-2">
            {microentregas.length === 0 && <p className="text-sm text-navy/60">Nenhuma micro-entrega registrada.</p>}
            {microentregas.map((m) => (
              <div key={m["id"]} className="rounded-xl border border-navy/10 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{m["titulo"]}</strong>
                  <Selo texto={ROTULO_MICRO[m["status"]] ?? m["status"]} />
                  <Selo texto={rotuloFase(m["fase"])} />
                  <Selo texto={ROTULO_SLA[m["prazo_status"]] ?? m["prazo_status"]} tom={tomSla(m["prazo_status"])} />
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  {m["caso_codigo"] ?? "sem caso"} · {nomePessoa(m["responsavel_id"])} · prazo {dataBr(m["prazo"])}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  Critério de aceite: {m["criterio_aceite"] || "não preenchido"}
                </p>
                {podeEscrever && (
                  <button
                    onClick={() => setEditarMicro(m)}
                    className="mt-2 rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
                  >
                    Editar / concluir
                  </button>
                )}
              </div>
            ))}
          </div>
        </Painel>
      )}

      {aba === "calendario" && (
        <Painel titulo="Calendário de prazos">
          {calendario.length === 0 && <p className="text-sm text-navy/60">Nenhum prazo agendado.</p>}
          <div className="space-y-3">
            {calendario.map(([dia, itens]) => (
              <div key={dia} className="rounded-xl border border-navy/10 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">{dataBr(dia)}</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {itens.tarefas.map((t) => (
                    <li key={t["id"]}>
                      Tarefa: {t["titulo"]} · {ROTULO_SLA[t["sla_status"]] ?? t["sla_status"]}
                    </li>
                  ))}
                  {itens.micro.map((m) => (
                    <li key={m["id"]}>
                      Micro-entrega: {m["titulo"]} · {ROTULO_MICRO[m["status"]] ?? m["status"]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Painel>
      )}

      {aba === "sla" && (
        <Painel titulo="SLA por tipo de tarefa e prioridade">
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              try {
                await fnSla({
                  data: {
                    tipoTarefa: String(fd.get("tipo") ?? "*"),
                    prioridade: String(fd.get("prioridade") ?? "*"),
                    horasAlvo: Number(fd.get("horasAlvo") ?? 72),
                    horasAlerta: Number(fd.get("horasAlerta") ?? 24),
                    observacoes: String(fd.get("observacoes") ?? ""),
                  },
                });
                toast.success("Regra de SLA salva.");
                atualizar();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="mb-4 flex flex-wrap items-end gap-2"
          >
            <select name="tipo" className={cn(inputCls, "w-auto")} defaultValue="*">
              <option value="*">Todos os tipos</option>
              {TIPOS_TAREFA.map((t) => (
                <option key={t} value={t}>
                  {ROTULO_TIPO[t]}
                </option>
              ))}
            </select>
            <select name="prioridade" className={cn(inputCls, "w-auto")} defaultValue="media">
              <option value="*">Todas as prioridades</option>
              {PRIORIDADES.map((x) => (
                <option key={x} value={x}>
                  {ROTULO_PRIORIDADE[x]}
                </option>
              ))}
            </select>
            <input name="horasAlvo" type="number" min={1} defaultValue={72} className={cn(inputCls, "w-28")} />
            <input name="horasAlerta" type="number" min={0} defaultValue={24} className={cn(inputCls, "w-28")} />
            <input name="observacoes" placeholder="Observações" className={cn(inputCls, "w-56")} />
            <button className="rounded-lg bg-navy px-3 py-2 text-xs text-cream">Salvar regra</button>
          </form>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2">Tipo</th>
                <th>Prioridade</th>
                <th>Horas alvo</th>
                <th>Alerta (h antes)</th>
                <th>Ativa</th>
              </tr>
            </thead>
            <tbody>
              {(refs.data?.regras ?? []).map((r: Linha) => (
                <tr key={r["id"]} className="border-t border-navy/10">
                  <td className="py-2">{r["tipo_tarefa"] === "*" ? "Todos" : ROTULO_TIPO[r["tipo_tarefa"]]}</td>
                  <td>{r["prioridade"] === "*" ? "Todas" : ROTULO_PRIORIDADE[r["prioridade"]]}</td>
                  <td>{r["horas_alvo"]}</td>
                  <td>{r["horas_alerta"]}</td>
                  <td>{r["ativo"] ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Painel>
      )}

      {novaTarefa && (
        <Gaveta titulo="Nova tarefa" aoFechar={() => setNovaTarefa(false)}>
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              try {
                await fnSalvarTarefa({
                  data: {
                    valores: {
                      titulo: fd.get("titulo"),
                      descricao: fd.get("descricao"),
                      caso_id: fd.get("caso_id"),
                      tipo: fd.get("tipo"),
                      prioridade: fd.get("prioridade"),
                      prazo: fd.get("prazo"),
                      responsavel_id: fd.get("responsavel_id"),
                    },
                  },
                });
                toast.success("Tarefa criada com SLA calculado pelo banco.");
                setNovaTarefa(false);
                atualizar();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="space-y-3"
          >
            <Campo rotulo="Título">
              <input name="titulo" required maxLength={200} className={inputCls} />
            </Campo>
            <Campo rotulo="Caso">
              <select name="caso_id" className={inputCls} defaultValue="">
                <option value="">Sem caso</option>
                {casos.map((c) => (
                  <option key={c["id"]} value={c["id"]}>
                    {c["codigo"]} — {c["titulo"]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Tipo">
              <select name="tipo" className={inputCls} defaultValue="geral">
                {TIPOS_TAREFA.map((t) => (
                  <option key={t} value={t}>
                    {ROTULO_TIPO[t]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Prioridade">
              <select name="prioridade" className={inputCls} defaultValue="media">
                {PRIORIDADES.map((x) => (
                  <option key={x} value={x}>
                    {ROTULO_PRIORIDADE[x]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Responsável">
              <select name="responsavel_id" className={inputCls} defaultValue="">
                <option value="">Sem responsável</option>
                {equipe.map((e) => (
                  <option key={e["auth_user_id"]} value={e["auth_user_id"]}>
                    {e["nome"] ?? e["email"]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Prazo">
              <input type="date" name="prazo" className={inputCls} />
            </Campo>
            <Campo rotulo="Descrição">
              <textarea name="descricao" maxLength={2000} className={cn(inputCls, "h-24")} />
            </Campo>
            <button className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">Criar tarefa</button>
          </form>
        </Gaveta>
      )}

      {(novaMicro || editarMicro) && (
        <Gaveta
          titulo={editarMicro ? "Editar micro-entrega" : "Nova micro-entrega"}
          aoFechar={() => {
            setNovaMicro(false);
            setEditarMicro(null);
            setMicroCasoId("");
          }}
        >
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              try {
                await fnSalvarMicro({
                  data: {
                    id: editarMicro?.["id"],
                    valores: {
                      titulo: fd.get("titulo"),
                      descricao: fd.get("descricao"),
                      caso_id: fd.get("caso_id"),
                      fase: fd.get("fase"),
                      status: fd.get("status"),
                      prioridade: fd.get("prioridade"),
                      prazo: fd.get("prazo"),
                      responsavel_id: fd.get("responsavel_id"),
                      criterio_aceite: fd.get("criterio_aceite"),
                      evidencia_url: fd.get("evidencia_url"),
                      evidencia_descricao: fd.get("evidencia_descricao"),
                      justificativa_sem_evidencia: fd.get("justificativa_sem_evidencia"),
                    },
                  },
                });
                toast.success("Micro-entrega salva.");
                setNovaMicro(false);
                setEditarMicro(null);
                atualizar();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="space-y-3"
          >
            <p className="text-xs text-navy/60">
              Conclusão exige critério de aceite preenchido e evidência registrada ou justificativa. Caso pausado só
              recebe nova micro-entrega com exceção autorizada pela administração.
            </p>
            <Campo rotulo="Caso">
              <select
                name="caso_id"
                required
                value={microCasoId}
                onChange={(ev) => setMicroCasoId(ev.target.value)}
                className={inputCls}
              >
                <option value="">Selecione…</option>
                {casos.map((c) => (
                  <option key={c["id"]} value={c["id"]}>
                    {c["codigo"]} — {c["titulo"]} ({c["status"]})
                  </option>
                ))}
              </select>
            </Campo>
            {sugestaoMicro && (
              <div className="rounded-lg border border-navy/20 bg-navy/5 p-3 text-xs text-navy/80">
                <p className="font-semibold">
                  Sugestão pela jornada do caso: {sugestaoMicro.titulo}
                </p>
                <p className="mt-1 text-navy/60">{sugestaoMicro.motivo}</p>
              </div>
            )}
            <Campo rotulo="Título">
              <input
                key={`titulo-${editarMicro?.["id"] ?? microCasoId}`}
                name="titulo"
                required
                defaultValue={editarMicro?.["titulo"] ?? sugestaoMicro?.titulo ?? ""}
                className={inputCls}
              />
            </Campo>
            <Campo rotulo="Fase da jornada">
              <select
                key={`fase-${editarMicro?.["id"] ?? microCasoId}`}
                name="fase"
                required
                defaultValue={editarMicro?.["fase"] ?? sugestaoMicro?.fase ?? FASES_JORNADA[0].id}
                className={inputCls}
              >
                {FASES_JORNADA.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-navy/50">
                A microentrega nasce ligada à jornada — não é item solto. Mesma fase que o caso usa em{" "}
                <code>case_plans.fase_jornada</code>.
              </p>
            </Campo>
            <Campo rotulo="Status">
              <select name="status" defaultValue={editarMicro?.["status"] ?? "pendente"} className={inputCls}>
                {STATUS_MICRO.map((s) => (
                  <option key={s} value={s}>
                    {ROTULO_MICRO[s]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Prioridade">
              <select name="prioridade" defaultValue={editarMicro?.["prioridade"] ?? "media"} className={inputCls}>
                {PRIORIDADES.map((x) => (
                  <option key={x} value={x}>
                    {ROTULO_PRIORIDADE[x]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Responsável">
              <select
                name="responsavel_id"
                defaultValue={editarMicro?.["responsavel_id"] ?? ""}
                className={inputCls}
              >
                <option value="">Sem responsável</option>
                {equipe.map((e) => (
                  <option key={e["auth_user_id"]} value={e["auth_user_id"]}>
                    {e["nome"] ?? e["email"]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Prazo">
              <input type="date" name="prazo" defaultValue={editarMicro?.["prazo"] ?? ""} className={inputCls} />
            </Campo>
            <Campo rotulo="Critério de aceite">
              <textarea
                name="criterio_aceite"
                defaultValue={editarMicro?.["criterio_aceite"] ?? ""}
                className={cn(inputCls, "h-20")}
              />
            </Campo>
            <Campo rotulo="Evidência (link)">
              <input name="evidencia_url" defaultValue={editarMicro?.["evidencia_url"] ?? ""} className={inputCls} />
            </Campo>
            <Campo rotulo="Evidência (descrição)">
              <textarea
                name="evidencia_descricao"
                defaultValue={editarMicro?.["evidencia_descricao"] ?? ""}
                className={cn(inputCls, "h-20")}
              />
            </Campo>
            <Campo rotulo="Justificativa quando não há evidência">
              <textarea
                name="justificativa_sem_evidencia"
                defaultValue={editarMicro?.["justificativa_sem_evidencia"] ?? ""}
                className={cn(inputCls, "h-20")}
              />
            </Campo>
            <Campo rotulo="Descrição">
              <textarea
                name="descricao"
                defaultValue={editarMicro?.["descricao"] ?? ""}
                className={cn(inputCls, "h-20")}
              />
            </Campo>
            <button className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">Salvar</button>
          </form>
        </Gaveta>
      )}
    </div>
  );
}
