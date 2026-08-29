import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  cardsDeFase,
  faseDoTipo,
  RELACOES_EVIDENCIA,
  rotuloStatus,
  rotuloTipo,
  STATUS_RELATORIO,
  TIPOS_RELATORIO,
  validarRelatorio,
  visivelNoApp,
} from "@/lib/relatorios-fase";
import {
  arquivarRelatorioFase,
  painelRelatoriosFase,
  salvarRelatorioFase,
  vincularEvidenciaRelatorio,
  vincularMicroentregaRelatorio,
} from "@/lib/relatorios-fase.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Route = createFileRoute("/_authenticated/relatorios-fase/$caseId")({
  head: () => ({
    meta: [
      { title: "Relatórios de fase — Clube Ancestral" },
      { name: "description", content: "Relatórios F1 a F5 e memória de legado ligados à ficha, evidências e jornada do caso." },
      { property: "og:title", content: "Relatórios de fase — Clube Ancestral" },
      { property: "og:description", content: "Registro interno dos relatórios de fase e seus vínculos com evidências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelatoriosFase,
});

const VAZIO: Record<string, unknown> = {
  report_type: "REPORT_F1_DIAGNOSTICO",
  report_status: "a_preparar",
  versao: 1,
  publicado_no_app: false,
  data_origin: "registro_interno",
};

function RelatoriosFase() {
  const { caseId } = Route.useParams();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ ...VAZIO, case_id: caseId });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [vinculo, setVinculo] = useState<Record<string, { evidenceId: string; relacao: string; micro: string }>>({});

  const painel = useQuery({ queryKey: ["g05", caseId], queryFn: () => painelRelatoriosFase({ data: { caseId } }) });
  const dados = painel.data;
  const invalidar = () => qc.invalidateQueries({ queryKey: ["g05", caseId] });

  const salvar = useMutation({
    mutationFn: (v: { id?: string; valores: Record<string, unknown> }) => salvarRelatorioFase({ data: v }),
    onSuccess: (r) => {
      toast.success(r.divergentes.length ? `Salvo com ajuste do banco em: ${r.divergentes.join(", ")}` : "Relatório salvo.");
      setEditandoId(null);
      setForm({ ...VAZIO, case_id: caseId });
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ligarEvidencia = useMutation({
    mutationFn: (v: { reportId: string; evidenceId: string; relacao: string }) => vincularEvidenciaRelatorio({ data: v }),
    onSuccess: (r) => {
      toast.success(r.atualizado ? "Vínculo já existia — relação atualizada, sem duplicar." : "Evidência vinculada.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ligarMicro = useMutation({
    mutationFn: (v: { reportId: string; microentregaId: string }) => vincularMicroentregaRelatorio({ data: v }),
    onSuccess: (r) => {
      toast.success(r.duplicado ? "Micro-entrega já estava vinculada." : "Micro-entrega vinculada ao relatório existente.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const arquivar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) => arquivarRelatorioFase({ data: v }),
    onSuccess: () => {
      toast.success("Relatório arquivado.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cards = useMemo(() => cardsDeFase((dados?.relatorios ?? []) as any[]), [dados]);
  const erros = validarRelatorio(form as any);

  const set = (campo: string, valor: unknown) =>
    setForm((f) => ({ ...f, [campo]: valor, fase_jornada: campo === "report_type" ? faseDoTipo(String(valor)) : f.fase_jornada }));

  if (painel.isLoading) return <p className="p-6 text-sm text-navy/70">Carregando relatórios de fase…</p>;
  if (painel.error) return <p className="p-6 text-sm text-terracotta">{(painel.error as Error).message}</p>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Link
        to="/casos/$caseId"
        params={{ caseId }}
        className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
      >
        ← Voltar à ficha do caso
      </Link>

      <h1 className="mt-3 font-serif text-2xl text-navy">Relatórios de fase</h1>
      <p className="mt-1 text-sm text-navy/70">
        {dados?.caso?.codigo ? `${dados.caso.codigo} — ` : ""}
        {dados?.caso?.titulo ?? "Caso"}. Registro interno. Nenhum PDF é gerado, nenhum envio ao cliente e nenhuma publicação no App
        nesta entrega.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <article key={c.tipo} className="rounded-xl border border-navy/15 bg-cream p-4">
            <p className="text-sm font-semibold text-navy">{c.rotulo}</p>
            <p className="mt-1 text-xs text-navy/70">{c.descricao}</p>
            <p className="mt-2 text-xs text-navy/60">
              {c.existentes ? `${c.existentes} registro(s)` : "Sem registro — não iniciado"}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-navy/15 p-4">
        <h2 className="font-serif text-lg text-navy">{editandoId ? "Editar relatório" : "Registrar relatório existente"}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-navy/70">
            Tipo
            <select
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.report_type ?? "")}
              onChange={(e) => set("report_type", e.target.value)}
            >
              {TIPOS_RELATORIO.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-navy/70">
            Situação
            <select
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.report_status ?? "")}
              onChange={(e) => set("report_status", e.target.value)}
            >
              {STATUS_RELATORIO.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-navy/70">
            Versão
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={Number(form.versao ?? 1)}
              onChange={(e) => set("versao", Number(e.target.value))}
            />
          </label>
          <label className="text-xs text-navy/70">
            Título interno
            <input
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.titulo ?? "")}
              onChange={(e) => set("titulo", e.target.value)}
            />
          </label>
          <label className="text-xs text-navy/70">
            Responsável
            <select
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.responsavel_id ?? "")}
              onChange={(e) => set("responsavel_id", e.target.value)}
            >
              <option value="">—</option>
              {(dados?.equipe ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome ?? p.id}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-navy/70">
            Revisor
            <select
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.revisor_id ?? "")}
              onChange={(e) => set("revisor_id", e.target.value)}
            >
              <option value="">—</option>
              {(dados?.equipe ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome ?? p.id}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-navy/70">
            Data de aprovação interna
            <input
              type="date"
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.data_aprovacao ?? "")}
              onChange={(e) => set("data_aprovacao", e.target.value)}
            />
          </label>
          <label className="text-xs text-navy/70">
            Data de entrega
            <input
              type="date"
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.data_entrega ?? "")}
              onChange={(e) => set("data_entrega", e.target.value)}
            />
          </label>
          <label className="text-xs text-navy/70 sm:col-span-2">
            Link interno (nunca exibido ao cliente)
            <input
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.link_interno ?? "")}
              onChange={(e) => set("link_interno", e.target.value)}
            />
          </label>
          <label className="text-xs text-navy/70 sm:col-span-2">
            Resumo aprovado para o cliente (sanitizado, sem juízo de mérito)
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.resumo_aprovado_cliente ?? "")}
              onChange={(e) => set("resumo_aprovado_cliente", e.target.value)}
            />
          </label>
          <label className="text-xs text-navy/70 sm:col-span-2">
            Observação interna
            <textarea
              rows={2}
              className="mt-1 w-full rounded border border-navy/20 p-2 text-sm"
              value={String(form.observacao_interna ?? "")}
              onChange={(e) => set("observacao_interna", e.target.value)}
            />
          </label>
        </div>

        {erros.length ? (
          <ul className="mt-3 list-disc pl-5 text-xs text-terracotta">
            {erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={!dados?.podeEditar || erros.length > 0 || salvar.isPending}
            onClick={() =>
              salvar.mutate({
                id: editandoId ?? undefined,
                valores: { ...form, fase_jornada: form.fase_jornada ?? faseDoTipo(String(form.report_type ?? "")) },
              })
            }
            className="rounded bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
          >
            {editandoId ? "Salvar alterações" : "Registrar relatório"}
          </button>
          {editandoId ? (
            <button
              type="button"
              className="rounded border border-navy/20 px-4 py-2 text-sm text-navy"
              onClick={() => {
                setEditandoId(null);
                setForm({ ...VAZIO, case_id: caseId });
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-serif text-lg text-navy">Relatórios do caso</h2>
        {(dados?.relatorios ?? []).length === 0 ? (
          <p className="text-sm text-navy/70">Nenhum relatório registrado. Nada é iniciado automaticamente.</p>
        ) : null}

        {(dados?.relatorios ?? []).map((r: any) => {
          const links = (dados?.vinculos ?? []).filter((v: any) => v.report_id === r.id);
          const micros = (dados?.microVinculos ?? []).filter((v: any) => v.report_id === r.id);
          const estado = vinculo[r.id] ?? { evidenceId: "", relacao: "principal", micro: "" };
          return (
            <article key={r.id} className="rounded-xl border border-navy/15 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {rotuloTipo(r.report_type)} · v{r.versao}
                  </p>
                  <p className="text-xs text-navy/70">
                    {rotuloStatus(r.report_status)} · fase {r.fase_jornada} ·{" "}
                    {visivelNoApp(r) ? "publicado no App" : "não publicado no App"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border border-navy/20 px-3 py-1 text-xs text-navy"
                    onClick={() => {
                      setEditandoId(r.id);
                      setForm({
                        case_id: caseId,
                        report_type: r.report_type,
                        report_status: r.report_status,
                        fase_jornada: r.fase_jornada,
                        versao: r.versao,
                        titulo: r.titulo ?? "",
                        responsavel_id: r.responsavel_id ?? "",
                        revisor_id: r.revisor_id ?? "",
                        data_aprovacao: r.data_aprovacao ?? "",
                        data_entrega: r.data_entrega ?? "",
                        link_interno: r.link_interno ?? "",
                        resumo_aprovado_cliente: r.resumo_aprovado_cliente ?? "",
                        observacao_interna: r.observacao_interna ?? "",
                        publicado_no_app: r.publicado_no_app,
                        data_origin: r.data_origin,
                      });
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded border border-terracotta/40 px-3 py-1 text-xs text-terracotta"
                    onClick={() => {
                      const motivo = window.prompt("Motivo do arquivamento (opcional):");
                      if (motivo !== null) arquivar.mutate({ id: r.id, motivo });
                    }}
                  >
                    Arquivar
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">Evidências vinculadas</p>
                  <ul className="mt-1 space-y-1 text-sm text-navy/80">
                    {links.length === 0 ? <li className="text-xs text-navy/60">Nenhuma.</li> : null}
                    {links.map((v: any) => {
                      const ev = (dados?.evidencias ?? []).find((e: any) => e.id === v.evidence_id);
                      return (
                        <li key={v.id}>
                          {ev?.title_internal ?? v.evidence_id} — {v.relacao}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      className="rounded border border-navy/20 p-1 text-xs"
                      value={estado.evidenceId}
                      onChange={(e) => setVinculo((s) => ({ ...s, [r.id]: { ...estado, evidenceId: e.target.value } }))}
                    >
                      <option value="">Selecionar evidência…</option>
                      {(dados?.evidencias ?? []).map((e: any) => (
                        <option key={e.id} value={e.id}>
                          {e.title_internal}
                        </option>
                      ))}
                    </select>
                    <select
                      className="rounded border border-navy/20 p-1 text-xs"
                      value={estado.relacao}
                      onChange={(e) => setVinculo((s) => ({ ...s, [r.id]: { ...estado, relacao: e.target.value } }))}
                    >
                      {RELACOES_EVIDENCIA.map((x) => (
                        <option key={x.valor} value={x.valor}>
                          {x.rotulo}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!estado.evidenceId || !dados?.podeEditar}
                      className="rounded bg-navy px-3 py-1 text-xs text-cream disabled:opacity-50"
                      onClick={() =>
                        ligarEvidencia.mutate({ reportId: r.id, evidenceId: estado.evidenceId, relacao: estado.relacao })
                      }
                    >
                      Vincular
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">Micro-entregas vinculadas</p>
                  <ul className="mt-1 space-y-1 text-sm text-navy/80">
                    {micros.length === 0 ? <li className="text-xs text-navy/60">Nenhuma.</li> : null}
                    {micros.map((v: any) => {
                      const m = (dados?.microentregas ?? []).find((x: any) => x.id === v.microentrega_id);
                      return <li key={v.id}>{m?.titulo ?? v.microentrega_id}</li>;
                    })}
                  </ul>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      className="rounded border border-navy/20 p-1 text-xs"
                      value={estado.micro}
                      onChange={(e) => setVinculo((s) => ({ ...s, [r.id]: { ...estado, micro: e.target.value } }))}
                    >
                      <option value="">Selecionar micro-entrega…</option>
                      {(dados?.microentregas ?? []).map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.titulo}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!estado.micro || !dados?.podeEditar}
                      className="rounded border border-navy/20 px-3 py-1 text-xs text-navy disabled:opacity-50"
                      onClick={() => ligarMicro.mutate({ reportId: r.id, microentregaId: estado.micro })}
                    >
                      Vincular à fase
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-navy/60">Micro-entrega nunca cria relatório novo.</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
