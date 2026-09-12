/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useAutoridade } from "@/components/saas/autoridade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo, dataBr } from "@/components/comercial/base";
import { CAMPOS, rotulo, type Campo } from "@/components/pesquisa/modulo-campos";
import {
  arquivarRegistroPesquisa,
  carregarPesquisaModulo,
  criarTarefaDaPendencia,
  gerarRelatorioInterno,
  registrarLiberacaoExterna,
  resolverPendenciaPesquisa,
  rodarScanPesquisa,
  salvarBlocoPesquisa,
} from "@/lib/pesquisa-modulo.functions";
import type { BlocoRg } from "@/lib/pesquisa-modulo.server";
import { cn } from "@/lib/utils";

type Dados = Awaited<ReturnType<typeof carregarPesquisaModulo>>;

const ABAS: { chave: BlocoRg | "visao" | "auditoria"; titulo: string }[] = [
  { chave: "visao", titulo: "Visão geral" },
  { chave: "pessoas", titulo: "Pessoas" },
  { chave: "relacoes", titulo: "Relações" },
  { chave: "eventos", titulo: "Eventos" },
  { chave: "fontes", titulo: "Fontes" },
  { chave: "evidencias", titulo: "Evidências" },
  { chave: "hipoteses", titulo: "Hipóteses" },
  { chave: "pedidos", titulo: "Pedidos documentais" },
  { chave: "pendencias", titulo: "Pendências" },
  { chave: "relatorios", titulo: "Relatórios internos" },
  { chave: "resumos", titulo: "Resumo ao cliente" },
  { chave: "auditoria", titulo: "Auditoria" },
];

function nomePessoa(d: Dados, id: unknown) {
  const p = d.pessoas.find((x) => x["id"] === id);
  return (p?.["preferred_display_name"] as string) || (p?.["canonical_name"] as string) || "—";
}

function Aviso({ tom, children }: { tom: "info" | "bloqueio"; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-xs",
        tom === "bloqueio"
          ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
          : "border-navy/15 bg-navy/5 text-navy/70",
      )}
    >
      {children}
    </p>
  );
}

function Formulario({
  campos,
  inicial,
  dados,
  aoSalvar,
  aoCancelar,
  salvando,
}: {
  campos: Campo[];
  inicial: Record<string, any>;
  dados: Dados;
  aoSalvar: (v: Record<string, any>) => void;
  aoCancelar: () => void;
  salvando: boolean;
}) {
  const [valores, setValores] = useState<Record<string, any>>(inicial);
  const set = (k: string, v: any) => setValores((a) => ({ ...a, [k]: v }));

  const refLista = (ref: Campo["ref"]) => {
    const mapa: Record<string, { id: string; texto: string }[]> = {
      pessoas: dados.pessoas.map((p) => ({
        id: p["id"],
        texto: (p["preferred_display_name"] as string) || (p["canonical_name"] as string),
      })),
      fontes: dados.fontes.map((f) => ({ id: f["id"], texto: f["title"] })),
      relacoes: dados.relacoes.map((r) => ({
        id: r["id"],
        texto: `${nomePessoa(dados, r["person_a_id"])} → ${nomePessoa(dados, r["person_b_id"])}`,
      })),
      eventos: dados.eventos.map((e) => ({
        id: e["id"],
        texto: `${rotulo(e["event_type"])} · ${nomePessoa(dados, e["person_id"])}`,
      })),
      evidencias: dados.evidencias.map((e) => ({ id: e["id"], texto: e["title"] })),
      documentos: [],
    };
    return mapa[ref ?? "pessoas"] ?? [];
  };

  return (
    <form
      className="mt-3 grid gap-3 rounded-xl border border-navy/15 bg-cream/50 p-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        aoSalvar(valores);
      }}
    >
      {campos.map((c) => (
        <label key={c.nome} className={cn("text-xs text-navy/70", c.tipo === "area" && "md:col-span-2")}>
          {c.rotulo}
          {c.tipo === "area" ? (
            <textarea
              rows={3}
              value={valores[c.nome] ?? ""}
              onChange={(e) => set(c.nome, e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-2 py-1 text-sm text-navy"
            />
          ) : c.tipo === "bool" ? (
            <div className="mt-1">
              <input
                type="checkbox"
                checked={Boolean(valores[c.nome])}
                onChange={(e) => set(c.nome, e.target.checked)}
              />
            </div>
          ) : c.tipo === "select" || c.tipo === "ref" ? (
            <select
              value={valores[c.nome] ?? ""}
              onChange={(e) => set(c.nome, e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-2 py-1 text-sm text-navy"
            >
              <option value="">—</option>
              {(c.tipo === "select"
                ? (c.opcoes ?? []).map(([v, r]) => ({ id: v, texto: r }))
                : refLista(c.ref)
              ).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.texto}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={c.tipo === "data" ? "date" : "text"}
              value={valores[c.nome] ?? ""}
              onChange={(e) => set(c.nome, e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 bg-cream/40 px-2 py-1 text-sm text-navy"
            />
          )}
          {c.ajuda && <span className="mt-1 block text-[11px] text-navy/50">{c.ajuda}</span>}
        </label>
      ))}
      <div className="flex gap-2 md:col-span-2">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-navy px-3 py-1.5 text-sm text-cream disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button type="button" onClick={aoCancelar} className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function PainelPesquisaModulo({ researchCaseId }: { researchCaseId: string }) {
  const [aba, setAba] = useState<string>("visao");
  const [editando, setEditando] = useState<{ bloco: BlocoRg; id?: string } | null>(null);
  const qc = useQueryClient();

  const carregar = useServerFn(carregarPesquisaModulo);
  const salvar = useServerFn(salvarBlocoPesquisa);
  const arquivar = useServerFn(arquivarRegistroPesquisa);
  const resolver = useServerFn(resolverPendenciaPesquisa);
  const criarTarefa = useServerFn(criarTarefaDaPendencia);
  const gerar = useServerFn(gerarRelatorioInterno);
  const liberar = useServerFn(registrarLiberacaoExterna);
  const scan = useServerFn(rodarScanPesquisa);

  const chave = ["pesquisa-modulo", researchCaseId];
  const autoridade = useAutoridade();
  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { researchCaseId } }) });
  const recarregar = () => qc.invalidateQueries({ queryKey: chave });

  const mSalvar = useMutation({
    mutationFn: (v: { bloco: BlocoRg; id?: string; dados: Record<string, any> }) =>
      salvar({ data: { researchCaseId, ...v } }),
    onSuccess: () => {
      toast.success("Registro salvo.");
      setEditando(null);
      recarregar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const acao = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      toast.success("Ação registrada.");
      recarregar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = q.data;
  const pendAbertas = useMemo(
    () => (d?.pendencias ?? []).filter((p) => p["status"] !== "resolved"),
    [d],
  );

  if (q.isLoading) return <p className="text-sm text-navy/60">Carregando dossiê de pesquisa…</p>;
  if (q.error) return <p className="text-sm text-terracotta">{(q.error as Error).message}</p>;
  if (!d) return null;

  if (!d.detalhado) {
    return (
      <Painel titulo="Pesquisa genealógica">
        <Aviso tom="info">
          Seu papel acessa apenas o resumo desta pesquisa: situação <strong>{rotulo(d.pesquisa["status"])}</strong>.
          Pessoas, evidências e notas internas não são exibidas.
        </Aviso>
      </Painel>
    );
  }

  // Autoridade operacional: papel do servidor não esconde mais ação. Fica
  // pendência declarada; o servidor revalida.
  const podeEditar = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const pendenciaPapel = d.podeEditar
    ? null
    : "O servidor não reconhece seu papel como responsável desta pesquisa — as ações seguem disponíveis por decisão sua.";
  const gate = d.gate as any;

  const abrirNovo = (bloco: BlocoRg) => setEditando({ bloco });

  const linhaAcoes = (bloco: BlocoRg, item: Record<string, any>) =>
    podeEditar ? (
      <div className="flex gap-2 text-[11px]">
        <button className="text-navy/60 underline" onClick={() => setEditando({ bloco, id: item["id"] })}>
          Editar
        </button>
        <button
          className="text-terracotta underline"
          onClick={() => {
            const motivo = window.prompt("Motivo do arquivamento (opcional, não há exclusão física):");
            if (motivo === null) return;
            acao.mutate(() => arquivar({ data: { researchCaseId, bloco, id: item["id"], motivo } }));
          }}
        >
          Arquivar
        </button>
      </div>
    ) : null;

  const cabecalhoBloco = (bloco: BlocoRg, titulo: string) => (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-serif text-lg">{titulo}</h3>
      {podeEditar && (
        <button onClick={() => abrirNovo(bloco)} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
          Adicionar
        </button>
      )}
    </div>
  );

  const form = (bloco: BlocoRg) =>
    editando?.bloco === bloco ? (
      <Formulario
        campos={CAMPOS[bloco]}
        dados={d}
        inicial={
          editando.id
            ? ((d as any)[bloco] as Record<string, any>[]).find((x) => x["id"] === editando.id) ?? {}
            : {}
        }
        salvando={mSalvar.isPending}
        aoCancelar={() => setEditando(null)}
        aoSalvar={(valores) => mSalvar.mutate({ bloco, id: editando.id, dados: valores })}
      />
    ) : null;

  const cartao = (conteudo: React.ReactNode, key: string) => (
    <div key={key} className="rounded-xl border border-navy/10 bg-cream/40 p-3">
      {conteudo}
    </div>
  );

  return (
    <div className="space-y-4">
      <Painel titulo={`Pesquisa · ${String(d.caso["codigo"] ?? "caso")}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Selo texto={rotulo(d.pesquisa["status"])} tom="neutro" />
          <Selo
            texto={gate?.elegivel ? "Pesquisa externa liberada" : "Pesquisa externa bloqueada"}
            tom={gate?.elegivel ? "ok" : "erro"}
          />
          {pendenciaPapel ? <Selo texto="Pendência de papel registrada" tom="alerta" /> : null}
        </div>
        <p className="mt-2 text-sm text-navy/70">{String(d.pesquisa["research_objective"] || "Objetivo não descrito.")}</p>
        <Aviso tom={gate?.elegivel ? "info" : "bloqueio"}>
          {String(gate?.mensagem ?? "Situação das travas não avaliada.")}
        </Aviso>
        {podeEditar && !gate?.elegivel && (
          <p className="mt-2 text-xs text-navy/60">
            Nenhuma ação externa pode ser iniciada enquanto as travas de contrato, pagamento, autorização e qualidade
            não estiverem satisfeitas.
          </p>
        )}
        {podeEditar && gate?.elegivel && d.pesquisa["external_research_gate_status"] !== "released_by_authorized_user" && (
          <button
            className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
            onClick={() => {
              const j = window.prompt("Justificativa da liberação da pesquisa externa:");
              if (!j) return;
              acao.mutate(() => liberar({ data: { researchCaseId, justificativa: j } }));
            }}
          >
            Registrar liberação humana da pesquisa externa
          </button>
        )}
      </Painel>

      <div className="flex flex-nowrap gap-2 overflow-x-auto">
        {ABAS.map((a) => (
          <button
            key={a.chave}
            onClick={() => {
              setAba(a.chave);
              setEditando(null);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              aba === a.chave ? "border-navy bg-navy text-cream" : "border-navy/15 text-navy/70 hover:bg-navy/5",
            )}
          >
            {a.titulo}
          </button>
        ))}
      </div>

      {aba === "visao" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Painel titulo="Situação da pesquisa">
            <ul className="space-y-1 text-sm text-navy/70">
              <li>Pessoas mapeadas: {d.pessoas.length}</li>
              <li>Relações: {d.relacoes.length} (validadas: {d.relacoes.filter((r) => r["status"] === "validated").length})</li>
              <li>Evidências: {d.evidencias.length} (validadas: {d.evidencias.filter((e) => e["evidence_status"] === "validated").length})</li>
              <li>Hipóteses abertas: {d.hipoteses.filter((h) => ["open", "under_review"].includes(h["status"])).length}</li>
              <li>Pendências em aberto: {pendAbertas.length}</li>
            </ul>
            <Aviso tom="info">
              Hipótese não é conclusão. Nada aqui constitui parecer jurídico ou promessa de resultado.
            </Aviso>
          </Painel>
          <Painel titulo="Inconsistências detectadas">
            {d.inconsistencias.length === 0 && <p className="text-sm text-navy/60">Nenhuma inconsistência aberta.</p>}
            <ul className="space-y-2">
              {d.inconsistencias.map((i) => (
                <li key={i["id"]} className="text-sm">
                  <Selo texto={rotulo(i["severidade"])} tom={i["severidade"] === "critica" ? "erro" : "alerta"} />{" "}
                  {String(i["titulo"])}
                </li>
              ))}
            </ul>
            {podeEditar && (
              <button
                className="mt-3 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                onClick={() => acao.mutate(() => scan())}
              >
                Rodar verificação de qualidade da pesquisa
              </button>
            )}
          </Painel>
        </div>
      )}

      {aba === "pessoas" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("pessoas", "Pessoas e identidades")}
          {form("pessoas")}
          <div className="mt-3 space-y-2">
            {d.pessoas.map((p) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(p["preferred_display_name"] || p["canonical_name"])}</strong>
                    <Selo texto={rotulo(p["person_status"])} tom="neutro" />
                    <Selo
                      texto={`Identidade: ${rotulo(p["identity_status"])}`}
                      tom={p["identity_status"] === "confirmed" ? "ok" : "neutro"}
                    />
                    {p["sensitivity_level"] !== "standard" && (
                      <Selo texto={`Dados ${rotulo(p["sensitivity_level"])}`} tom="alerta" />
                    )}
                  </div>
                  <p className="text-xs text-navy/60">
                    Nascimento: {dataBr(p["birth_date"])} · Óbito: {dataBr(p["death_date"])} ·{" "}
                    {rotulo(p["living_status"])}
                    {p["is_minor"] ? " · menor de idade" : ""}
                  </p>
                  <p className="text-xs text-navy/50">
                    Variações de nome:{" "}
                    {d.variantes.filter((v) => v["person_id"] === p["id"]).map((v) => v["variant_name"]).join(", ") ||
                      "nenhuma registrada"}
                  </p>
                  {linhaAcoes("pessoas", p)}
                </>,
                p["id"],
              ),
            )}
            {d.pessoas.length === 0 && <p className="text-sm text-navy/60">Nenhuma pessoa registrada.</p>}
          </div>

          <div className="mt-6 border-t border-navy/10 pt-4">
            {cabecalhoBloco("variantes", "Variações de nome")}
            {form("variantes")}
            <ul className="mt-2 space-y-1 text-sm text-navy/70">
              {d.variantes.map((v) => (
                <li key={v["id"]} className="flex flex-wrap items-center gap-2">
                  <span>
                    {nomePessoa(d, v["person_id"])}: <strong>{String(v["variant_name"])}</strong> ·{" "}
                    {rotulo(v["status"])}
                  </span>
                  {linhaAcoes("variantes", v)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {aba === "relacoes" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("relacoes", "Relações familiares")}
          {form("relacoes")}
          <Aviso tom="info">Confirmar uma relação exige evidência validada vinculada — o banco recusa o contrário.</Aviso>
          <div className="mt-3 space-y-2">
            {d.relacoes.map((r) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">
                      {nomePessoa(d, r["person_a_id"])} — {rotulo(r["relationship_type"])} —{" "}
                      {nomePessoa(d, r["person_b_id"])}
                    </strong>
                    <Selo texto={rotulo(r["status"])} tom={r["status"] === "validated" ? "ok" : "neutro"} />
                    <Selo texto={`Confiança ${rotulo(r["confidence_level"])}`} />
                  </div>
                  {linhaAcoes("relacoes", r)}
                </>,
                r["id"],
              ),
            )}
            {d.relacoes.length === 0 && <p className="text-sm text-navy/60">Nenhuma relação registrada.</p>}
          </div>
        </section>
      )}

      {aba === "eventos" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("eventos", "Linha do tempo de eventos civis")}
          {form("eventos")}
          <ol className="mt-3 space-y-2 border-l border-navy/15 pl-4">
            {[...d.eventos]
              .sort((a, b) => String(a["event_date"] ?? "").localeCompare(String(b["event_date"] ?? "")))
              .map((e) => (
                <li key={e["id"]} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-navy/50">{dataBr(e["event_date"])}</span>
                    <strong>{rotulo(e["event_type"])}</strong>
                    <span className="text-navy/70">{nomePessoa(d, e["person_id"])}</span>
                    <Selo texto={rotulo(e["status"])} tom={e["status"] === "validated" ? "ok" : "neutro"} />
                    {e["event_date_precision"] !== "exact" && (
                      <Selo texto={`Data ${rotulo(e["event_date_precision"])}`} tom="alerta" />
                    )}
                  </div>
                  <p className="text-xs text-navy/50">{String(e["location_text"] ?? "local não informado")}</p>
                  {linhaAcoes("eventos", e)}
                </li>
              ))}
            {d.eventos.length === 0 && <p className="text-sm text-navy/60">Nenhum evento registrado.</p>}
          </ol>
        </section>
      )}

      {aba === "fontes" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("fontes", "Fontes")}
          {form("fontes")}
          <div className="mt-3 space-y-2">
            {d.fontes.map((f) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(f["title"])}</strong>
                    <Selo texto={rotulo(f["source_type"])} />
                    <Selo texto={rotulo(f["source_status"])} tom={f["source_status"] === "verified" ? "ok" : "neutro"} />
                    {f["external_source"] && <Selo texto="Externa" tom="alerta" />}
                  </div>
                  <p className="text-xs text-navy/60">{String(f["citation_text"] ?? "sem citação registrada")}</p>
                  <p className="text-xs text-navy/50">
                    {String(f["repository_or_institution"] ?? "instituição não informada")} · acesso{" "}
                    {dataBr(f["access_date"])}
                  </p>
                  {linhaAcoes("fontes", f)}
                </>,
                f["id"],
              ),
            )}
            {d.fontes.length === 0 && <p className="text-sm text-navy/60">Nenhuma fonte registrada.</p>}
          </div>
        </section>
      )}

      {aba === "evidencias" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("evidencias", "Matriz de evidências")}
          {form("evidencias")}
          <Aviso tom="info">
            Toda validação é humana: exige fonte vinculada, justificativa e revisor registrado.
          </Aviso>
          <div className="mt-3 space-y-2">
            {d.evidencias.map((e) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(e["title"])}</strong>
                    <Selo texto={rotulo(e["evidence_type"])} />
                    <Selo
                      texto={rotulo(e["evidence_status"])}
                      tom={
                        e["evidence_status"] === "validated"
                          ? "ok"
                          : ["rejected", "discarded"].includes(String(e["evidence_status"]))
                            ? "erro"
                            : "alerta"
                      }
                    />
                    <Selo texto={`Confiança ${rotulo(e["confidence_level"])}`} />
                    {e["sensitivity_level"] !== "standard" && <Selo texto="Sensível" tom="alerta" />}
                  </div>
                  <p className="text-xs text-navy/60">
                    Fonte: {d.fontes.find((f) => f["id"] === e["source_id"])?.["title"] ?? "não vinculada"} ·
                    Pessoa: {nomePessoa(d, e["person_id"])}
                  </p>
                  {e["validation_rationale"] && (
                    <p className="text-xs text-navy/50">Justificativa: {String(e["validation_rationale"])}</p>
                  )}
                  {e["discard_reason"] && (
                    <p className="text-xs text-terracotta">Descarte: {String(e["discard_reason"])}</p>
                  )}
                  {linhaAcoes("evidencias", e)}
                </>,
                e["id"],
              ),
            )}
            {d.evidencias.length === 0 && <p className="text-sm text-navy/60">Nenhuma evidência registrada.</p>}
          </div>
        </section>
      )}

      {aba === "hipoteses" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("hipoteses", "Hipóteses de pesquisa")}
          {form("hipoteses")}
          <Aviso tom="info">Hipótese é caminho de investigação, nunca conclusão jurídica ou promessa ao cliente.</Aviso>
          <div className="mt-3 space-y-2">
            {d.hipoteses.map((h) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(h["title"])}</strong>
                    <Selo texto={rotulo(h["status"])} tom={h["status"] === "not_supported" ? "erro" : "neutro"} />
                    <Selo texto={`Confiança ${rotulo(h["confidence_level"])}`} />
                  </div>
                  <p className="text-xs text-navy/60">{String(h["statement"] ?? "")}</p>
                  {linhaAcoes("hipoteses", h)}
                </>,
                h["id"],
              ),
            )}
            {d.hipoteses.length === 0 && <p className="text-sm text-navy/60">Nenhuma hipótese registrada.</p>}
          </div>
        </section>
      )}

      {aba === "pedidos" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("pedidos", "Pedidos documentais")}
          {form("pedidos")}
          {!gate?.elegivel && (
            <Aviso tom="bloqueio">
              Travas ativas: pedidos que exigem ação externa permanecem planejados ou bloqueados.
            </Aviso>
          )}
          <div className="mt-3 space-y-2">
            {d.pedidos.map((p) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(p["requested_document_type"] ?? rotulo(p["request_type"]))}</strong>
                    <Selo texto={rotulo(p["status"])} tom={p["status"] === "received" ? "ok" : "neutro"} />
                    {p["external_action_required"] && <Selo texto="Ação externa" tom="alerta" />}
                  </div>
                  <p className="text-xs text-navy/60">
                    {nomePessoa(d, p["person_id"])} · {String(p["target_institution"] ?? "instituição não definida")} ·{" "}
                    {String(p["target_location"] ?? "localidade não definida")} · prazo {dataBr(p["due_at"])}
                  </p>
                  {linhaAcoes("pedidos", p)}
                </>,
                p["id"],
              ),
            )}
            {d.pedidos.length === 0 && <p className="text-sm text-navy/60">Nenhum pedido registrado.</p>}
          </div>
        </section>
      )}

      {aba === "pendencias" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("pendencias", "Pendências e bloqueios")}
          {form("pendencias")}
          <div className="mt-3 space-y-2">
            {d.pendencias.map((p) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(p["title"])}</strong>
                    <Selo
                      texto={rotulo(p["severity"])}
                      tom={p["severity"] === "critical" ? "erro" : p["severity"] === "high" ? "alerta" : "neutro"}
                    />
                    <Selo texto={rotulo(p["status"])} tom={p["status"] === "resolved" ? "ok" : "neutro"} />
                    {p["due_at"] && new Date(p["due_at"]) < new Date() && p["status"] !== "resolved" && (
                      <Selo texto="Vencida" tom="erro" />
                    )}
                  </div>
                  <p className="text-xs text-navy/60">{String(p["description"] ?? "")}</p>
                  {podeEditar && p["status"] !== "resolved" && (
                    <div className="mt-1 flex gap-2 text-[11px]">
                      <button
                        className="text-navy/60 underline"
                        onClick={() =>
                          acao.mutate(() => criarTarefa({ data: { researchCaseId, id: p["id"] } }))
                        }
                      >
                        Criar tarefa no Desk
                      </button>
                      <button
                        className="text-navy/60 underline"
                        onClick={() => {
                          const nota = window.prompt("Como a pendência foi resolvida? (opcional)");
                          if (nota === null) return;
                          acao.mutate(() => resolver({ data: { researchCaseId, id: p["id"], nota } }));
                        }}
                      >
                        Resolver
                      </button>
                    </div>
                  )}
                  {linhaAcoes("pendencias", p)}
                </>,
                p["id"],
              ),
            )}
            {d.pendencias.length === 0 && <p className="text-sm text-navy/60">Nenhuma pendência registrada.</p>}
          </div>
        </section>
      )}

      {aba === "relatorios" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("relatorios", "Relatórios internos")}
          {form("relatorios")}
          <Aviso tom="bloqueio">Conteúdo interno. Não enviar ao cliente e não publicar.</Aviso>
          {podeEditar && (
            <button
              className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
              onClick={() => acao.mutate(() => gerar({ data: { researchCaseId } }))}
            >
              Gerar rascunho a partir dos dados estruturados
            </button>
          )}
          <div className="mt-3 space-y-2">
            {d.relatorios.map((r) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(r["title"])}</strong>
                    <Selo texto={rotulo(r["status"])} />
                  </div>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-navy/70">
                    {String(r["content"] ?? "")}
                  </pre>
                  {linhaAcoes("relatorios", r)}
                </>,
                r["id"],
              ),
            )}
            {d.relatorios.length === 0 && <p className="text-sm text-navy/60">Nenhum relatório gerado.</p>}
          </div>
        </section>
      )}

      {aba === "resumos" && (
        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          {cabecalhoBloco("resumos", "Resumo ao cliente")}
          {form("resumos")}
          <Aviso tom="info">
            Apenas fatos validados, linguagem simples, sem hipótese, sem juízo de mérito e sem dado sensível de
            terceiros.
          </Aviso>
          <div className="mt-3 space-y-2">
            {d.resumos.map((r) =>
              cartao(
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{String(r["title_client_facing"])}</strong>
                    <Selo texto={rotulo(r["status"])} tom={r["status"] === "released" ? "ok" : "neutro"} />
                  </div>
                  <p className="text-sm text-navy/70">{String(r["summary_client_facing"] ?? "")}</p>
                  {linhaAcoes("resumos", r)}
                </>,
                r["id"],
              ),
            )}
            {d.resumos.length === 0 && <p className="text-sm text-navy/60">Nenhum resumo preparado.</p>}
          </div>
        </section>
      )}

      {aba === "auditoria" && (
        <Painel titulo="Trilha de auditoria da pesquisa">
          <ol className="space-y-2 border-l border-navy/15 pl-4">
            {d.auditoria.map((a) => (
              <li key={a["id"]} className="text-sm">
                <span className="text-navy/50">{new Date(String(a["occurred_at"])).toLocaleString("pt-BR")}</span> —{" "}
                {String(a["event_type"])} em {String(a["entity_type"])}
              </li>
            ))}
            {d.auditoria.length === 0 && <p className="text-sm text-navy/60">Sem eventos registrados.</p>}
          </ol>
        </Painel>
      )}
    </div>
  );
}
