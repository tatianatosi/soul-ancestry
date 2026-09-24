import { useState } from "react";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Campo, Gaveta, Selo, inputCls } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import {
  exportarCsv,
  listarChecklists,
  listarExportacoes,
  listarInconsistencias,
  marcarItemChecklist,
  previewExportacao,
  relatorioSemanal,
  rodarVarredura,
  sincronizarChecklist,
  tratarInconsistencia,
} from "@/lib/qualidade.functions";
import {
  CONJUNTOS_CSV,
  ROTULO_CHECKLIST,
  ROTULO_DOMINIO,
  ROTULO_SEVERIDADE,
  ROTULO_STATUS_ISSUE,
  SEVERIDADES,
} from "@/lib/qualidade.server";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

const ABAS = [
  { id: "inconsistencias", rotulo: "Inconsistências" },
  { id: "checklists", rotulo: "Checklists" },
  { id: "semanal", rotulo: "Relatório semanal" },
  { id: "exportar", rotulo: "Exportação CSV" },
] as const;

const TOM_SEVERIDADE: Record<string, "neutro" | "ok" | "alerta" | "erro"> = {
  critica: "erro",
  alta: "alerta",
  media: "neutro",
  baixa: "neutro",
};

function dataHora(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

function rotuloIndicador(chave: string) {
  return chave.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function PainelQualidade() {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("inconsistencias");

  return (
    <div className="space-y-4">
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

      {aba === "inconsistencias" && <AbaInconsistencias />}
      {aba === "checklists" && <AbaChecklists />}
      {aba === "semanal" && <AbaSemanal />}
      {aba === "exportar" && <AbaExportacao />}
    </div>
  );
}

/* ------------------------------ Inconsistências ------------------------------ */

function AbaInconsistencias() {
  const qc = useQueryClient();
  const fnListar = useServerFn(listarInconsistencias);
  const fnVarrer = useServerFn(rodarVarredura);
  const fnTratar = useServerFn(tratarInconsistencia);

  const [severidade, setSeveridade] = useState("");
  const [status, setStatus] = useState("");
  const [dominio, setDominio] = useState("");
  const [alvo, setAlvo] = useState<{ linha: Linha; acao: "reconhecer" | "resolver" | "falso_positivo" } | null>(
    null,
  );

  const autoridade = useAutoridade();
  const q = useQuery({
    queryKey: ["qualidade", "issues", severidade, status, dominio],
    queryFn: () => fnListar({ data: { severidade, status, dominio } }),
  });

  const resumo = q.data?.resumo ?? {};
  // Autoridade operacional: o gate de papel do servidor deixa de esconder a
  // ação de tratamento. Só falta de papel/organização bloqueia.
  const podeTratar = !autoridade.bloqueado({ capacidade: "resolver_divergencia" });
  const lista = q.data?.inconsistencias ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {SEVERIDADES.map((s) => (
          <div
            key={s}
            className={cn(
              "rounded-xl border p-3",
              s === "critica" ? "border-terracotta/50 bg-terracotta/10" : "border-navy/10 bg-cream/50",
            )}
          >
            <p className="text-xs uppercase tracking-wide text-navy/60">{ROTULO_SEVERIDADE[s]}</p>
            <p className="font-serif text-2xl">{resumo[s] ?? 0}</p>
            <p className="text-[11px] text-navy/50">
              {s === "critica" ? "Bloqueia ativação do caso" : "Em aberto ou reconhecida"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-navy/10 bg-cream/50 p-3">
        <Campo rotulo="Severidade">
          <select value={severidade} onChange={(e) => setSeveridade(e.target.value)} className={inputCls}>
            <option value="">Todas</option>
            {SEVERIDADES.map((s) => (
              <option key={s} value={s}>
                {ROTULO_SEVERIDADE[s]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Situação">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="">Em tratamento</option>
            {Object.entries(ROTULO_STATUS_ISSUE).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Domínio">
          <select value={dominio} onChange={(e) => setDominio(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {Object.entries(ROTULO_DOMINIO).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </Campo>
        {podeTratar && (
          <button
            onClick={async () => {
              try {
                const r = await fnVarrer({});
                toast.success(`Varredura concluída: ${r.abertas} em aberto, ${r.sanadas} sanadas.`);
                qc.invalidateQueries({ queryKey: ["qualidade"] });
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream"
          >
            Rodar varredura
          </button>
        )}
      </div>

      {q.isLoading && <p className="text-sm text-navy/60">Carregando…</p>}
      {q.error && (
        <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          {(q.error as Error).message}
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      )}

      <div className="space-y-2">
        {lista.length === 0 && !q.isLoading && (
          <p className="rounded-xl border border-navy/10 bg-cream/50 p-4 text-sm text-navy/60">
            Nenhuma inconsistência com esses filtros.
          </p>
        )}
        {lista.map((l: Linha) => (
          <article key={l["id"]} className="rounded-xl border border-navy/10 bg-cream/50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Selo texto={ROTULO_SEVERIDADE[l["severidade"]] ?? l["severidade"]} tom={TOM_SEVERIDADE[l["severidade"]]} />
              <Selo texto={ROTULO_DOMINIO[l["dominio"]] ?? l["dominio"]} />
              <Selo texto={ROTULO_STATUS_ISSUE[l["status"]] ?? l["status"]} />
              {l["crm_casos"] && <Selo texto={String(l["crm_casos"]["codigo"])} />}
              {l["exige_suspensao"] && <Selo texto="Suspensão requerida" tom="erro" />}
            </div>
            <h4 className="mt-2 font-medium">{l["titulo"]}</h4>
            <p className="text-sm text-navy/70">{l["detalhe"]}</p>
            <p className="mt-1 text-xs text-navy/50">
              Detectada em {dataHora(l["detectada_em"])}
              {l["resolvida_em"] ? ` · tratada em ${dataHora(l["resolvida_em"])}` : ""}
            </p>
            {l["resolucao_comentario"] && (
              <p className="mt-1 rounded-lg bg-cream px-3 py-2 text-xs text-navy/70">
                {l["resolucao_comentario"]}
                {l["resolucao_evidencia"] ? ` · evidência: ${l["resolucao_evidencia"]}` : ""}
              </p>
            )}
            {podeTratar && ["aberta", "reconhecida"].includes(l["status"]) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {l["status"] === "aberta" && (
                  <button
                    onClick={() => setAlvo({ linha: l, acao: "reconhecer" })}
                    className="rounded-lg border border-navy/20 px-3 py-1 text-xs"
                  >
                    Reconhecer
                  </button>
                )}
                <button
                  onClick={() => setAlvo({ linha: l, acao: "resolver" })}
                  className="rounded-lg bg-navy px-3 py-1 text-xs text-cream"
                >
                  Resolver
                </button>
                <button
                  onClick={() => setAlvo({ linha: l, acao: "falso_positivo" })}
                  className="rounded-lg border border-terracotta/40 px-3 py-1 text-xs text-terracotta"
                >
                  Falso positivo
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {alvo && (
        <Gaveta
          titulo={
            alvo.acao === "reconhecer"
              ? "Reconhecer inconsistência"
              : alvo.acao === "resolver"
                ? "Resolver inconsistência"
                : "Marcar como falso positivo"
          }
          aoFechar={() => setAlvo(null)}
        >
          <p className="text-sm text-navy/70">{alvo.linha["titulo"]}</p>
          <p className="text-xs text-navy/50">
            Nada é ocultado: a ação fica registrada com seu usuário, data e hora.
          </p>
          <form
            className="space-y-3"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              try {
                await fnTratar({
                  data: {
                    id: alvo.linha["id"],
                    acao: alvo.acao,
                    comentario: String(fd.get("comentario") ?? ""),
                    evidencia: String(fd.get("evidencia") ?? ""),
                  },
                });
                toast.success("Registro atualizado e auditado.");
                setAlvo(null);
                qc.invalidateQueries({ queryKey: ["qualidade"] });
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          >
            <Campo rotulo="Comentário obrigatório (mínimo 10 caracteres)">
              <textarea name="comentario" required minLength={10} className={cn(inputCls, "h-28")} />
            </Campo>
            <Campo
              rotulo={
                alvo.acao === "resolver" && ["critica", "alta"].includes(alvo.linha["severidade"])
                  ? "Evidência da resolução (obrigatória)"
                  : "Evidência da resolução (opcional)"
              }
            >
              <input
                name="evidencia"
                className={inputCls}
                required={alvo.acao === "resolver" && ["critica", "alta"].includes(alvo.linha["severidade"])}
                placeholder="Referência interna, número do documento ou registro"
              />
            </Campo>
            <button className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">Confirmar</button>
          </form>
        </Gaveta>
      )}
    </div>
  );
}

/* --------------------------------- Checklists -------------------------------- */

function AbaChecklists() {
  const qc = useQueryClient();
  const fnListar = useServerFn(listarChecklists);
  const fnSync = useServerFn(sincronizarChecklist);
  const fnMarcar = useServerFn(marcarItemChecklist);
  const [casoId, setCasoId] = useState("");

  const autoridade = useAutoridade();
  const q = useQuery({
    queryKey: ["qualidade", "checklists", casoId],
    queryFn: () => fnListar({ data: { casoId } }),
  });

  const casos = q.data?.casos ?? [];
  const itens = q.data?.itens ?? [];
  const modelos = q.data?.modelos ?? [];
  // Autoridade operacional: o gate de papel do servidor deixa de esconder a
  // ação de tratamento. Só falta de papel/organização bloqueia.
  const podeTratar = !autoridade.bloqueado({ capacidade: "resolver_divergencia" });

  const porFase = itens.reduce<Record<string, Linha[]>>((acc, i: Linha) => {
    const f = String(i["fase"] ?? "*");
    (acc[f] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-navy/10 bg-cream/50 p-3">
        <Campo rotulo="Caso">
          <select value={casoId} onChange={(e) => setCasoId(e.target.value)} className={inputCls}>
            <option value="">Selecione um caso…</option>
            {casos.map((c: Linha) => (
              <option key={c["id"]} value={c["id"]}>
                {c["codigo"]} — {c["titulo"]}
              </option>
            ))}
          </select>
        </Campo>
        {casoId && podeTratar && (
          <button
            onClick={async () => {
              try {
                const r = await fnSync({ data: { casoId } });
                toast.success(`${r.criados} item(ns) gerado(s) a partir dos modelos.`);
                qc.invalidateQueries({ queryKey: ["qualidade", "checklists"] });
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream"
          >
            Gerar itens do caso
          </button>
        )}
      </div>

      {!casoId && (
        <CaCard variante="compacto" titulo="Modelos por tipo de serviço e fase">
          <div className="space-y-2">
            {modelos.map((m: Linha) => (
              <div key={m["id"]} className="flex flex-wrap items-center gap-2 border-b border-navy/5 pb-2 text-sm">
                <Selo texto={String(m["fase"])} />
                <Selo texto={m["tipo_servico"] === "*" ? "Todos os serviços" : String(m["tipo_servico"])} />
                <span className="font-medium">{m["label"]}</span>
                <span className="text-navy/60">{m["descricao"]}</span>
                {m["obrigatorio"] && <Selo texto="Obrigatório" tom="alerta" />}
              </div>
            ))}
          </div>
        </CaCard>
      )}

      {casoId &&
        Object.entries(porFase).map(([fase, lista]) => (
          <CaCard variante="compacto" key={fase} titulo={`Fase: ${fase}`}>
            <div className="space-y-2">
              {lista.map((i) => (
                <div key={i["id"]} className="rounded-lg border border-navy/10 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Selo
                      texto={ROTULO_CHECKLIST[i["status"]] ?? i["status"]}
                      tom={i["status"] === "cumprido" ? "ok" : i["status"] === "pendente" ? "alerta" : "neutro"}
                    />
                    <span className="font-medium">{i["label"]}</span>
                    {i["obrigatorio"] && <Selo texto="Obrigatório" />}
                  </div>
                  {i["observacao"] && <p className="mt-1 text-xs text-navy/60">{i["observacao"]}</p>}
                  {i["concluido_em"] && (
                    <p className="text-[11px] text-navy/50">Registrado em {dataHora(i["concluido_em"])}</p>
                  )}
                  {podeTratar && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => marcar(i, "cumprido")}
                        className="rounded-lg border border-navy/20 px-3 py-1 text-xs"
                      >
                        Cumprido
                      </button>
                      <AcaoOperacional
                        rotulo="Não aplicável"
                        className="rounded-lg border border-navy/20 px-3 py-1 text-xs"
                        acaoExterna="marcar_item_checklist_nao_aplicavel"
                        efeito="Marca o item como não aplicável, com justificativa registrada."
                        onConfirmar={(justificativa) => marcar(i, "nao_aplicavel", justificativa)}
                      />
                      <button
                        onClick={() => marcar(i, "pendente")}
                        className="rounded-lg border border-navy/20 px-3 py-1 text-xs"
                      >
                        Reabrir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CaCard>
        ))}
    </div>
  );

  async function marcar(item: Linha, status: string, justificativa?: string) {
    const observacao = status === "nao_aplicavel" ? (justificativa ?? "") : (item["observacao"] ?? "");
    try {
      await fnMarcar({ data: { id: item["id"], status, observacao } });
      toast.success("Item atualizado.");
      qc.invalidateQueries({ queryKey: ["qualidade", "checklists"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
}

/* ------------------------------ Relatório semanal ----------------------------- */

function AbaSemanal() {
  const fnRelatorio = useServerFn(relatorioSemanal);
  const [inicio, setInicio] = useState("");
  const q = useQuery({
    queryKey: ["qualidade", "semanal", inicio],
    queryFn: () => fnRelatorio({ data: { inicio } }),
  });

  const rel = q.data?.relatorio ?? {};
  const numeros = Object.entries(rel).filter(([k, v]) => typeof v === "number" && k !== "inicio");
  const carga = (rel["carga_por_responsavel"] ?? []) as Linha[];
  const inconsistencias = (rel["inconsistencias"] ?? {}) as Record<string, number>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-navy/10 bg-cream/50 p-3">
        <Campo rotulo="Semana de referência">
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={inputCls} />
        </Campo>
        <p className="text-xs text-navy/60">
          Período: {dataHora(rel["inicio"])} até {dataHora(rel["fim"])}
        </p>
      </div>

      {q.isLoading && <p className="text-sm text-navy/60">Calculando…</p>}
      {q.error && (
        <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          {(q.error as Error).message}
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {numeros.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-navy/10 bg-cream/50 p-3">
            <p className="text-xs uppercase tracking-wide text-navy/60">{rotuloIndicador(k)}</p>
            <p className="font-serif text-2xl">{String(v)}</p>
          </div>
        ))}
      </div>

      <CaCard variante="compacto" titulo="Inconsistências em aberto por severidade">
        <div className="flex flex-wrap gap-2">
          {SEVERIDADES.map((s) => (
            <Selo key={s} texto={`${ROTULO_SEVERIDADE[s]}: ${inconsistencias[s] ?? 0}`} tom={TOM_SEVERIDADE[s]} />
          ))}
        </div>
      </CaCard>

      <CaCard variante="compacto" titulo="Carga por responsável">
        {carga.length === 0 && <p className="text-sm text-navy/60">Sem tarefas abertas na semana.</p>}
        <ul className="space-y-1 text-sm">
          {carga.map((c) => (
            <li key={String(c["responsavel"])} className="flex justify-between border-b border-navy/5 py-1">
              <span>{c["responsavel"]}</span>
              <span className="text-navy/60">{c["tarefas_abertas"]} tarefa(s) aberta(s)</span>
            </li>
          ))}
        </ul>
      </CaCard>
    </div>
  );
}

/* --------------------------------- Exportação -------------------------------- */

function AbaExportacao() {
  const qc = useQueryClient();
  const fnPreview = useServerFn(previewExportacao);
  const fnExportar = useServerFn(exportarCsv);
  const fnHistorico = useServerFn(listarExportacoes);

  const [conjunto, setConjunto] = useState("inconsistencias");
  const [confirmando, setConfirmando] = useState(false);

  const autoridade = useAutoridade();
  const previa = useQuery({
    queryKey: ["qualidade", "preview", conjunto],
    queryFn: () => fnPreview({ data: { conjunto } }),
  });
  const historico = useQuery({ queryKey: ["qualidade", "exportacoes"], queryFn: () => fnHistorico() });

  // Autoridade operacional: exportação deixa de ser escondida por flag de
  // admin; a restrição vira pendência declarada e o servidor revalida.
  const ehAdmin = !autoridade.bloqueado({ acaoExterna: "confirmar_acao_externa_pacote" });
  const pendenciaExportacao = previa.data && !previa.data.ehAdmin
    ? "O servidor não reconhece seu vínculo como administração — a exportação segue disponível por decisão sua e é revalidada no servidor."
    : null;

  return (
    <div className="space-y-4">
      <CaCard variante="compacto" titulo="Exportar em CSV">
        {pendenciaExportacao ? (
          <p className="mb-3 rounded-lg border border-navy/15 bg-navy/5 p-3 text-xs text-navy/70">
            Pendência registrada: {pendenciaExportacao}
          </p>
        ) : null}
        <Campo rotulo="Conjunto">
          <select value={conjunto} onChange={(e) => setConjunto(e.target.value)} className={inputCls}>
            {Object.entries(CONJUNTOS_CSV).map(([v, c]) => (
              <option key={v} value={v}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </Campo>
        <p className="mt-2 text-sm text-navy/70">{previa.data?.descricao}</p>
        <p className="mt-1 text-xs text-navy/50">
            Documentos, arquivos, links privados e dados sensíveis do titular nunca são exportados.
        </p>
        <button
          onClick={() => setConfirmando(true)}
          className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
        >
          Revisar campos e exportar
        </button>
      </CaCard>

      <CaCard variante="compacto" titulo="Histórico de exportações">
        {historico.isError ? (
          <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
            Não foi possível carregar o histórico de exportações — a lista está vazia por falha de consulta.
            <button
              type="button"
              onClick={() => void historico.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
            >
              Tentar novamente
            </button>
          </p>
        ) : null}
        {!historico.isLoading && !historico.isError && (historico.data?.exportacoes ?? []).length === 0 && (
          <p className="text-sm text-navy/60">Consulta concluída: nenhuma exportação registrada.</p>
        )}
        <ul className="space-y-1 text-sm">
          {(historico.data?.exportacoes ?? []).map((e: Linha) => (
            <li key={e["id"]} className="border-b border-navy/5 py-1">
              {dataHora(e["exportado_em"])} · {CONJUNTOS_CSV[e["conjunto"]]?.rotulo ?? e["conjunto"]} ·{" "}
              {e["linhas"]} linha(s) · {(e["campos"] ?? []).length} campo(s)
            </li>
          ))}
        </ul>
      </CaCard>

      {confirmando && (
        <Gaveta titulo="Confirmar exportação" aoFechar={() => setConfirmando(false)}>
          <p className="text-sm text-navy/70">
            {previa.data?.rotulo} — {previa.data?.linhas ?? 0} linha(s). Serão incluídos exatamente estes campos:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {(previa.data?.campos ?? []).map((c) => (
              <li key={c.chave}>{c.rotulo}</li>
            ))}
          </ul>
          <p className="text-xs text-navy/50">
            A exportação é registrada em auditoria com seu usuário, data e campos incluídos.
          </p>
          <button
            onClick={async () => {
              try {
                const r = await fnExportar({ data: { conjunto, confirmado: true } });
                const url = URL.createObjectURL(new Blob([r.csv], { type: "text/csv;charset=utf-8" }));
                const a = document.createElement("a");
                a.href = url;
                a.download = r.nome;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Exportadas ${r.linhas} linha(s).`);
                setConfirmando(false);
                qc.invalidateQueries({ queryKey: ["qualidade", "exportacoes"] });
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream"
          >
            Confirmar e baixar CSV
          </button>
        </Gaveta>
      )}
    </div>
  );
}
