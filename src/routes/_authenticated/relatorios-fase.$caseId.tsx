import { createFileRoute, Link } from "@tanstack/react-router";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
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
  projetarRelatorioParaApp,
  salvarRelatorioFase,
  vincularEvidenciaRelatorio,
  vincularMicroentregaRelatorio,
} from "@/lib/relatorios-fase.functions";
import { useAutoridade } from "@/components/saas/autoridade";
import { SaasShell, useSaas } from "@/components/saas/shell";

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
  errorComponent: ({ error }) => (
    <SaasShell titulo="Relatórios de fase" descricao="Falha ao carregar os relatórios.">
      <p role="alert" className="text-sm text-terracotta">{(error as Error).message}</p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Relatórios de fase" descricao="Caso não encontrado.">
      <p className="text-sm text-navy/70">Caso não encontrado.</p>
    </SaasShell>
  ),
});

const VAZIO: Record<string, unknown> = {
  report_type: "REPORT_F1_DIAGNOSTICO",
  report_status: "a_preparar",
  versao: 1,
  publicado_no_app: false,
  data_origin: "registro_interno",
};

function RelatoriosFase() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
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

  // P5 (26/09/2026) — ponte Relatório → App: cria a projeção em rascunho na
  // Biblioteca Mestre; publicar de fato continua exigindo aprovação humana lá.
  const projetar = useMutation({
    mutationFn: (v: { reportId: string }) => projetarRelatorioParaApp({ data: v }),
    onSuccess: (r) => {
      toast.success(
        r.criado
          ? "Projeção criada em rascunho — abra a Biblioteca Mestre para revisar e publicar."
          : "Este relatório já tem uma projeção — confira na Biblioteca Mestre.",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cards = useMemo(() => cardsDeFase((dados?.relatorios ?? []) as any[]), [dados]);
  // Autoridade operacional: o gate de papel do servidor deixa de travar os
  // controles; fica pendência declarada e o servidor revalida a gravação.
  const pendenciaPapel = dados && !dados.podeEditar
    ? "O servidor marcou os relatórios de fase deste caso como somente leitura para o seu vínculo — a gravação segue disponível por decisão sua."
    : null;
  const erros = validarRelatorio(form as any);

  const set = (campo: string, valor: unknown) =>
    setForm((f) => ({ ...f, [campo]: valor, fase_jornada: campo === "report_type" ? faseDoTipo(String(valor)) : f.fase_jornada }));

  // Nada de tela vazia silenciosa: sem leitura concluída, o estado é declarado.
  if (!dados)
    return (
      <div className="p-6">
        <EstadoDados
          carregando={painel.isLoading}
          erro={painel.error}
          dados={undefined}
          aoTentarNovamente={() => void painel.refetch()}
          recurso="os relatórios de fase deste caso"
        >
          {() => null}
        </EstadoDados>
      </div>
    );

  return (
    <SaasShell
      titulo="Relatórios de fase"
      descricao="Relatórios F1 a F5 e memória de legado ligados à ficha e às evidências."
    >
    <div>
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

      {pendenciaVinculo || !podeEscrever ? (
        <p className="mt-3 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}

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

      {/*
        CA21-BIBLIOTECA-MESTRE-CONECTADA (09/09/2026): a Biblioteca Mestre já
        governa "Modelos F1/F2" (master_library_items, categoria=modelos), mas
        nada aqui apontava para essa referência — quem elabora o relatório não
        via qual versão de modelo está homologada. case_reports não tem campo
        de vínculo, então isto é só leitura: mostra o modelo, não grava nada.
      */}
      <section className="mt-6 rounded-xl border border-navy/10 bg-cream/40 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-navy">Modelos F1/F2 homologados (Biblioteca Mestre)</h2>
          <Link to="/biblioteca" className="text-[11px] text-terracotta underline">
            Ver Biblioteca Mestre completa
          </Link>
        </div>
        {(dados.modelosBiblioteca ?? []).length === 0 ? (
          <p className="mt-1 text-xs text-navy/60">
            Sem dado — nenhum modelo cadastrado na Biblioteca Mestre (subárea Modelos) para esta organização.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs text-navy/70">
            {(dados.modelosBiblioteca ?? []).map((m: any) => (
              <li key={m.id}>
                <strong className="text-navy">{m.titulo}</strong> · versão {m.versao} ·{" "}
                {m.vigencia_estado === "homologado" || m.vigencia_estado === "vigente"
                  ? "homologado"
                  : "não homologado"}{" "}
                ({m.status})
              </li>
            ))}
          </ul>
        )}
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

        <div className="mt-4 flex flex-wrap gap-2">
          <AcaoOperacional
            rotulo={editandoId ? "Salvar alterações" : "Registrar relatório"}
            capacidade="avancar_pesquisa_evidencia_microentrega"
            pendenciaGate={
              [pendenciaPapel, erros.length ? erros.join(" · ") : null].filter(Boolean).join(" · ") || null
            }
            efeito="Grava o relatório de fase no registro interno. Nenhum PDF é gerado, nada é enviado ao cliente nem publicado no App."
            onConfirmar={async () => {
              await salvar.mutateAsync({
                id: editandoId ?? undefined,
                valores: { ...form, fase_jornada: form.fase_jornada ?? faseDoTipo(String(form.report_type ?? "")) },
              });
            }}
          />
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
        {pendenciaPapel ? (
          <p className="mb-3 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
            Pendência registrada: {pendenciaPapel}
          </p>
        ) : null}
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
                  {visivelNoApp(r) ? (
                    <AcaoOperacional
                      rotulo="Projetar para o App"
                      capacidade="avancar_pesquisa_evidencia_microentrega"
                      pendenciaGate={pendenciaPapel}
                      efeito="Cria (ou reaproveita) uma projeção em rascunho na Biblioteca Mestre a partir do resumo aprovado deste relatório. Não publica sozinho — a aprovação/publicação continua humana, na Biblioteca Mestre."
                      variant="outline"
                      size="sm"
                      onConfirmar={async () => {
                        await projetar.mutateAsync({ reportId: r.id });
                      }}
                    />
                  ) : null}
                  <AcaoOperacional
                    rotulo="Arquivar"
                    acaoExterna="excluir_registro_ou_versao"
                    pendenciaGate={pendenciaPapel}
                    efeito="Arquiva este relatório de fase. O registro continua consultável em arquivados."
                    variant="outline"
                    size="sm"
                    onConfirmar={async (motivo) => {
                      await arquivar.mutateAsync({ id: r.id, motivo });
                    }}
                  />
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
                    <AcaoOperacional
                      rotulo="Vincular"
                      capacidade="avancar_pesquisa_evidencia_microentrega"
                      pendenciaGate={
                        [
                          pendenciaPapel,
                          estado.evidenceId ? null : "Selecione a evidência antes de vincular.",
                        ]
                          .filter(Boolean)
                          .join(" · ") || null
                      }
                      efeito="Cria o vínculo interno entre relatório e evidência. Nada é publicado no App Cliente."
                      size="sm"
                      onConfirmar={async () => {
                        if (!estado.evidenceId) return;
                        await ligarEvidencia.mutateAsync({
                          reportId: r.id,
                          evidenceId: estado.evidenceId,
                          relacao: estado.relacao,
                        });
                      }}
                    />
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
                    <AcaoOperacional
                      rotulo="Vincular à fase"
                      capacidade="avancar_pesquisa_evidencia_microentrega"
                      pendenciaGate={
                        [pendenciaPapel, estado.micro ? null : "Selecione a micro-entrega antes de vincular."]
                          .filter(Boolean)
                          .join(" · ") || null
                      }
                      efeito="Vincula a micro-entrega ao relatório de fase. Micro-entrega nunca cria relatório novo."
                      variant="outline"
                      size="sm"
                      onConfirmar={async () => {
                        if (!estado.micro) return;
                        await ligarMicro.mutateAsync({ reportId: r.id, microentregaId: estado.micro });
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-navy/60">Micro-entrega nunca cria relatório novo.</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
    </SaasShell>
  );
}
