import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  APROVACAO_CLIENTE,
  ESTADOS_VALIDACAO,
  CAMPOS_NUNCA_NO_APP,
  NIVEIS_ACESSO_PEDIDO,
  PRIORIDADES,
  rotulo,
  SECOES,
  STATUS_EXIGE_ACAO,
  STATUS_SOLICITACAO,
  TIPOS_SOLICITACAO,
  validarSolicitacao,
  type SecaoPesquisa,
} from "@/lib/documentos-solicitacoes";
import {
  arquivarSolicitacaoDocumental,
  painelPesquisaEvidencias,
  salvarSolicitacaoDocumental,
} from "@/lib/documentos-solicitacoes.functions";
import {
  CADEIA_PESQUISA,
  PROJECAO_ACHADO,
  STATUS_EVIDENCIA,
  STATUS_PESQUISA,
  STATUS_RELATORIO,
  gatilhosDaEvidencia,
  relatorioVisivelAoCliente,
} from "@/lib/pesquisa-cadeia";
import {
  cadeiaPesquisaDoCaso,
  mudarEstadoEvidencia,
  prepararAreaPesquisa,
} from "@/lib/pesquisa-cadeia.functions";
import { SecaoFontesDocumentos } from "@/components/pesquisa/fontes-documentos";
import { LastroDeFontes } from "@/components/pesquisa/fontes-vinculos";

/* eslint-disable @typescript-eslint/no-explicit-any */

function rotuloDe(lista: readonly { id: string; rotulo: string }[], id?: string | null) {
  return lista.find((x) => x.id === id)?.rotulo ?? id ?? "—";
}

export const Route = createFileRoute("/_authenticated/pesquisa-evidencias/$caseId")({
  head: () => ({
    meta: [
      { title: "Pesquisa Genealógica e Evidências — Clube Ancestral" },
      { name: "description", content: "Documentos, solicitações, evidências e pendências internas do caso." },
      { property: "og:title", content: "Pesquisa Genealógica e Evidências — Clube Ancestral" },
      { property: "og:description", content: "Área interna de pesquisa: documentos, solicitações e evidências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AreaPesquisaEvidencias,
});

const VAZIO: Record<string, unknown> = {
  status: "nao_solicitado",
  request_type: "certidao",
  priority: "media",
  access_level: "equipe_do_caso",
  client_approval_status: "nao_aplicavel",
  data_origin: "registro_interno",
};

function AreaPesquisaEvidencias() {
  const { caseId } = Route.useParams();
  const qc = useQueryClient();
  const [secao, setSecao] = useState<SecaoPesquisa>("visao");
  const [form, setForm] = useState<Record<string, unknown>>({ ...VAZIO, case_id: caseId });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const painel = useQuery({
    queryKey: ["g04", caseId],
    queryFn: () => painelPesquisaEvidencias({ data: { caseId } }),
  });

  const salvar = useMutation({
    mutationFn: (v: { id?: string; valores: Record<string, unknown> }) => salvarSolicitacaoDocumental({ data: v }),
    onMutate: () => toast.loading("Salvando solicitação…", { id: "g04" }),
    onSuccess: (r: any) => {
      if (r.divergentes?.length) {
        toast.error(`Divergência após recarga: ${r.divergentes.join(", ")}`, { id: "g04" });
      } else {
        toast.success("Solicitação salva e conferida.", { id: "g04" });
      }
      setEditandoId(null);
      setForm({ ...VAZIO, case_id: caseId });
      void qc.invalidateQueries({ queryKey: ["g04", caseId] });
    },
    onError: (e: any) => toast.error(String(e?.message ?? e), { id: "g04" }),
  });

  const arquivar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) => arquivarSolicitacaoDocumental({ data: v }),
    onSuccess: () => {
      toast.success("Solicitação arquivada.");
      void qc.invalidateQueries({ queryKey: ["g04", caseId] });
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  const cadeia = useQuery({
    queryKey: ["cadeia-pesquisa", caseId],
    queryFn: () => cadeiaPesquisaDoCaso({ data: { caseId } }),
  });

  const preparar = useMutation({
    mutationFn: (v: { caseId: string; objetivo: string }) => prepararAreaPesquisa({ data: v }),
    onSuccess: () => {
      toast.success("Área de pesquisa preparada (sem pesquisa externa).");
      void qc.invalidateQueries({ queryKey: ["cadeia-pesquisa", caseId] });
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  const mudarEvidencia = useMutation({
    mutationFn: (v: { id: string; status: string }) => mudarEstadoEvidencia({ data: v }),
    onSuccess: () => {
      toast.success("Situação da evidência atualizada.");
      void qc.invalidateQueries({ queryKey: ["cadeia-pesquisa", caseId] });
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  const d = painel.data as any;
  const c = cadeia.data as any;
  const check = validarSolicitacao(form);
  const exigeAcao = STATUS_EXIGE_ACAO.includes(String(form["status"]));

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-navy/60">Desk Intelligence</p>
        <h1 className="text-2xl font-semibold text-navy">Pesquisa Genealógica e Evidências</h1>
        <p className="text-sm text-navy/70">
          {d?.caso ? `${d.caso.codigo} — ${d.caso.titulo}` : "Carregando caso…"}
        </p>
        <p className="text-xs text-navy/60">
          Área interna. Nenhuma pesquisa externa, solicitação a instituição, despesa, cobrança, pasta, mensagem ou
          documento externo é disparada por esta tela.
        </p>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {SECOES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSecao(s.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
              secao === s.id ? "border-gold bg-navy text-cream" : "border-navy/20 text-navy/70"
            }`}
          >
            {s.rotulo}
          </button>
        ))}
      </nav>

      <p className="-mt-3 text-xs text-navy/60">
        {SECOES.find((s) => s.id === secao)?.funcao}
      </p>

      {painel.isLoading && <p className="text-sm text-navy/60">Carregando área de pesquisa…</p>}
      {painel.error && <p className="text-sm text-terracotta">{String((painel.error as any).message)}</p>}

      {d && secao === "visao" && (
        <section className="space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <Cartao titulo="Solicitações" valor={d.solicitacoes.length} nota="Pedidos documentais registrados." />
          <Cartao titulo="Evidências" valor={d.evidencias.length} nota="Itens na biblioteca do caso." />
          <Cartao titulo="Alertas abertos" valor={d.alertas.filter((a: any) => a.status === "aberto").length} nota="Pendências internas." />
          <Cartao
            titulo="Rascunhos"
            valor={d.comunicacoes.filter((c: any) => !c.sent_at).length}
            nota="Comunicações não enviadas, com aprovação humana pendente."
          />
        </div>
        <Bloco titulo="Dimensões da pesquisa">
          {!c?.pesquisa && (
            <p className="mb-3 rounded border border-gold/40 bg-gold/10 p-3 text-xs text-navy">
              Área de pesquisa ainda não preparada para este caso. A preparação cria apenas o registro interno em
              “preparação pendente”, com autorização de pesquisa externa pendente — nada é pesquisado, solicitado ou
              publicado.
              {d.podeEditar && (
                <button
                  type="button"
                  onClick={() =>
                    preparar.mutate({ caseId, objetivo: `Preparação interna da pesquisa do caso ${d.caso?.codigo ?? caseId}` })
                  }
                  className="ml-2 rounded-full border border-navy px-3 py-1 text-[11px] font-medium text-navy"
                >
                  Preparar área de pesquisa
                </button>
              )}
            </p>
          )}
          <dl className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
            {[
              { t: "Objetivo", v: c?.pesquisa?.research_objective ?? d.caso?.titulo ?? "—" },
              { t: "Trilha / caso", v: `${d.caso?.codigo ?? "—"} · ${c?.pesquisa?.country_context ?? d.caso?.pais ?? "—"}` },
              { t: "Status", v: rotuloDe(STATUS_PESQUISA, c?.pesquisa?.status) },
              {
                t: "Autorização",
                v: c?.pesquisa?.external_research_authorization_status ?? "pendente",
              },
              { t: "Responsável", v: c?.pesquisa?.assigned_researcher_user_id ?? "A definir" },
              { t: "Hipótese interna", v: c?.pesquisa?.internal_hypothesis ?? "Não registrada (uso interno)" },
              { t: "Próximo marco", v: c?.pesquisa?.next_milestone ?? "Não definido" },
              {
                t: "Próxima ação e prazo",
                v: c?.pesquisa?.next_research_action
                  ? `${c.pesquisa.next_research_action}${
                      c.pesquisa.next_research_action_due_at
                        ? ` — até ${String(c.pesquisa.next_research_action_due_at).slice(0, 10)}`
                        : ""
                    }`
                  : "Sem próxima ação registrada",
              },
              { t: "Alertas ativos", v: d.alertas.filter((a: any) => a.status === "aberto").length },
            ].map((x) => (
              <div key={x.t} className="rounded border border-navy/10 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-navy/50">{x.t}</dt>
                <dd className="text-sm text-navy">{String(x.v)}</dd>
              </div>
            ))}
          </dl>
        </Bloco>
        <Bloco titulo="Cadeia da pesquisa">
          <ol className="flex flex-wrap gap-2 text-xs">
            {CADEIA_PESQUISA.map((e, i) => (
              <li key={e.etapa} className="rounded-full border border-navy/20 px-3 py-1 text-navy/80">
                {i + 1}. {e.rotulo}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-navy/60">
            Nenhum elo é pulado: documento, evidência, achado e entrega ao cliente são registros distintos.
          </p>
        </Bloco>
        </section>
      )}

      {d && secao === "ficha" && (
        <section className="space-y-3">
          <Bloco titulo="Ficha genealógica do caso">
            <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-4">
              {[
                { t: "Pessoas", v: c?.pessoas.length ?? 0 },
                { t: "Variantes de nome", v: c?.variantes.length ?? 0 },
                { t: "Relações", v: c?.relacoes.length ?? 0 },
                { t: "Eventos", v: c?.eventos.length ?? 0 },
                { t: "Linhagens", v: c?.linhagens.length ?? 0 },
                { t: "Lacunas e pendências", v: c?.pendencias.filter((p: any) => p.status !== "resolvido").length ?? 0 },
              ].map((x) => (
                <div key={x.t} className="rounded border border-navy/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/50">{x.t}</p>
                  <p className="text-sm text-navy">{String(x.v)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-navy/60">
              Upload de fonte ou documento não cria pessoa, relação, evento nem linhagem. Cada registro exige evidência
              de origem ou marca explícita de hipótese interna.
            </p>
            <Link
              to="/pessoas-linhagens/$caseId"
              params={{ caseId }}
              className="mt-3 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4"
            >
              Abrir ficha genealógica interna →
            </Link>
          </Bloco>

          <Bloco titulo="Timeline interna derivada">
            {(c?.eventos.length ?? 0) === 0 ? (
              <p className="text-sm text-navy/60">Nenhum evento registrado. Nada é inferido automaticamente.</p>
            ) : (
              <ul className="space-y-1 text-sm text-navy">
                {c!.eventos
                  .slice()
                  .sort((a: any, b: any) => String(a.data_inicio ?? "9999").localeCompare(String(b.data_inicio ?? "9999")))
                  .map((e: any) => (
                    <li key={e.id} className="border-b border-navy/10 py-1">
                      <strong>{String(e.data_inicio ?? "data a confirmar").slice(0, 10)}</strong> — {e.tipo}
                      {e.titulo ? `: ${e.titulo}` : ""} {e.local ? `· ${e.local}` : ""}
                      <span className="ml-2 text-xs text-navy/60">
                        {e.confirmado ? "confirmado por evidência" : "hipótese interna"}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Bloco>

          <Bloco titulo="Árvore interna derivada (relações)">
            {(c?.relacoes.length ?? 0) === 0 ? (
              <p className="text-sm text-navy/60">Nenhuma relação registrada.</p>
            ) : (
              <ul className="space-y-1 text-sm text-navy">
                {c!.relacoes.map((r: any) => {
                  const a = c!.pessoas.find((p: any) => p.id === r.person_a_id)?.canonical_name ?? "—";
                  const b = c!.pessoas.find((p: any) => p.id === r.person_b_id)?.canonical_name ?? "—";
                  return (
                    <li key={r.id} className="border-b border-navy/10 py-1">
                      {a} → <em>{r.relationship_type}</em> → {b}
                      <span className="ml-2 text-xs text-navy/60">
                        confiança {r.confidence_level} · {r.supporting_evidence_count ?? 0} evidência(s)
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Bloco>
        </section>
      )}


      {d && secao === "validacao" && (
        <section className="space-y-3">
          <Bloco titulo="Situação das evidências">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
              {STATUS_EVIDENCIA.map((e) => (
                <div key={e.id} className="rounded border border-navy/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/50">{e.rotulo}</p>
                  <p className="text-lg font-semibold text-navy">
                    {(c?.evidencias ?? []).filter((x: any) => x.workflow_status === e.id).length}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-navy/60">
              Validar internamente não significa cidadania reconhecida, direito confirmado, conclusão jurídica nem via
              aprovada.
            </p>
          </Bloco>

          <Bloco titulo="Pendências derivadas (internas)">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
              {ESTADOS_VALIDACAO.map((e) => (
                <div key={e.id} className="rounded border border-navy/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/50">{e.rotulo}</p>
                  <p className="text-lg font-semibold text-navy">
                    {d.solicitacoes.filter((x: any) => x.status === e.id).length}
                  </p>
                </div>
              ))}
            </div>
            {(c?.pendencias.length ?? 0) > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-navy">
                {c!.pendencias.map((p: any) => (
                  <li key={p.id} className="border-b border-navy/10 py-1">
                    <strong>{p.title}</strong> — {p.status} / {p.severity}
                    {p.due_at ? ` — prazo ${String(p.due_at).slice(0, 10)}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </Bloco>
        </section>
      )}

      {d && secao === "achados" && (
        <section className="space-y-3">
          <Bloco titulo="Achados internos">
            <p className="text-xs text-navy/60">
              Achado interno → revisão → versão sanitizada separada → entrega ao cliente. Evidência nunca é projetada
              diretamente ao App Cliente.
            </p>
            {(c?.achados.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-navy/60">Nenhum achado registrado.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm text-navy">
                {c!.achados.map((a: any) => (
                  <li key={a.id} className="border-b border-navy/10 py-1">
                    <strong>{a.title}</strong> — revisão {a.validation_status} · confiança {a.confidence} · projeção{" "}
                    {rotuloDe(PROJECAO_ACHADO, a.client_projection_status)}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-4">
              <Link
                to="/achados/$caseId"
                params={{ caseId }}
                className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
              >
                Abrir achados genealógicos →
              </Link>
              <Link
                to="/biblioteca-evidencias/$caseId"
                params={{ caseId }}
                className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
              >
                Projeções autorizadas e microentregas →
              </Link>
            </div>
          </Bloco>
        </section>
      )}

      {d && secao === "pessoas" && (
        <section className="space-y-3">
          <Bloco titulo="Pessoas, famílias e ramos">
            {(c?.pessoas.length ?? 0) === 0 ? (
              <p className="text-sm text-navy/60">
                Nenhuma pessoa registrada. Pessoas, relações e linhagens não são criadas por suposição nem por upload.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-navy/60">
                    <tr>
                      <th className="py-2">Nome</th>
                      <th>Papel na linhagem</th>
                      <th>Geração</th>
                      <th>Linha de transmissão</th>
                      <th>País/localidade</th>
                      <th>Identificação</th>
                      <th>Variantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c!.pessoas.map((p: any) => (
                      <tr key={p.id} className="border-t border-navy/10">
                        <td className="py-2">{p.canonical_name}</td>
                        <td>{p.papel_na_linhagem ?? "—"}</td>
                        <td>{p.geracao ?? "—"}</td>
                        <td>{p.linha_transmissao ?? "—"}</td>
                        <td>{p.pais_localidade ?? "—"}</td>
                        <td>{p.identity_status ?? "—"}</td>
                        <td>{c!.variantes.filter((v: any) => v.person_id === p.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link
              to="/pessoas-linhagens/$caseId"
              params={{ caseId }}
              className="mt-3 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4"
            >
              Abrir pessoas e linhagens →
            </Link>
          </Bloco>
        </section>
      )}

      {d && secao === "fontes" && (
        <div className="space-y-3">
          <Bloco titulo="Fontes e documentos">
            <p className="text-xs text-navy/60">
              Material bruto e referências privadas do caso. Nenhuma consulta externa, contato com arquivo/cartório ou
              extração automática é executada aqui.
            </p>
            {(c?.fontes.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-navy/60">Nenhuma fonte registrada.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm text-navy">
                {c!.fontes.map((f: any) => (
                  <li key={f.id} className="border-b border-navy/10 py-1">
                    <strong>{f.title}</strong> — {f.source_type}
                    {f.repository_or_institution ? ` · ${f.repository_or_institution}` : ""}
                    {f.source_location ? ` · ${f.source_location}` : ""}
                    <span className="block text-xs text-navy/60">
                      acesso {f.access_level} · situação {f.source_status}
                      {f.consulted_at ? ` · consultada em ${String(f.consulted_at).slice(0, 10)}` : ""}
                      {f.archived_at ? ` · arquivada: ${f.archive_reason ?? "sem motivo"}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Bloco>
          <SecaoFontesDocumentos caseId={caseId} />
        </div>
      )}

      {d && secao === "evidencias" && (
        <div className="space-y-3">
          <Bloco titulo="Evidências e validação">
            {(c?.evidencias.length ?? 0) === 0 ? (
              <p className="text-sm text-navy/60">Nenhuma evidência registrada.</p>
            ) : (
              <ul className="space-y-2 text-sm text-navy">
                {c!.evidencias.map((e: any) => (
                  <li key={e.id} className="border-b border-navy/10 py-2">
                    <strong>{e.title_internal}</strong> — {rotuloDe(STATUS_EVIDENCIA, e.workflow_status)} · confiança{" "}
                    {e.confidence_level} · revisão jurídica {e.legal_review_status}
                    <span className="block text-xs text-navy/60">
                      {e.reviewed_at ? `revisada em ${String(e.reviewed_at).slice(0, 10)}` : "sem revisão registrada"}
                      {e.validation_notes_internal ? ` · nota interna: ${e.validation_notes_internal}` : ""}
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {gatilhosDaEvidencia(e.workflow_status).map((g) => (
                        <li key={g.titulo} className="text-xs text-navy/70">
                          Gatilho interno · {g.titulo} — {g.detalhe}
                          {g.prazoEmDias !== null ? ` (prazo interno ${g.prazoEmDias} dia(s))` : ""}
                        </li>
                      ))}
                    </ul>
                    {d.podeEditar && (
                      <select
                        aria-label={`Situação da evidência ${e.title_internal}`}
                        value={e.workflow_status}
                        onChange={(ev) => mudarEvidencia.mutate({ id: e.id, status: ev.target.value })}
                        className="mt-1 rounded border border-navy/20 px-2 py-1 text-xs"
                      >
                        {STATUS_EVIDENCIA.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.rotulo}
                          </option>
                        ))}
                      </select>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Bloco>
          <LastroDeFontes caseId={caseId} tipoAlvo="evidencia" />
        </div>
      )}

      {d && secao === "relatorios" && (
        <div className="space-y-3">
          <Bloco titulo="Relatórios F1/F2">
            {(c?.relatorios.length ?? 0) === 0 ? (
              <p className="text-sm text-navy/60">Nenhum relatório registrado para este caso.</p>
            ) : (
              <ul className="space-y-1 text-sm text-navy">
                {c!.relatorios.map((r: any) => (
                  <li key={r.id} className="border-b border-navy/10 py-1">
                    <strong>{r.report_type}</strong> — {r.title} · {rotuloDe(STATUS_RELATORIO, r.status)} · versão{" "}
                    {r.version}
                    <span className="block text-xs text-navy/60">
                      {relatorioVisivelAoCliente(r)
                        ? `publicado ao cliente em ${String(r.published_at ?? "").slice(0, 10)}`
                        : "não visível no App Cliente — exige aprovação e resumo sanitizado"}
                      {r.internal_reference ? ` · referência interna ${r.internal_reference}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Bloco>
          <LastroDeFontes caseId={caseId} tipoAlvo="relatorio" />
        </div>
      )}


      {d && secao === "alertas" && (
        <section className="space-y-3">
          <Bloco titulo="Alertas internos">
            {d.alertas.length === 0 && <p className="text-sm text-navy/60">Nenhum alerta registrado.</p>}
            {d.alertas.map((a: any) => (
              <p key={a.id} className="border-b border-navy/10 py-2 text-sm text-navy">
                <strong>{a.titulo}</strong> — {a.criticidade} / {a.status}
                {a.due_at ? ` — prazo ${String(a.due_at).slice(0, 10)}` : ""}
                {a.detalhe ? <span className="block text-xs text-navy/60">{a.detalhe}</span> : null}
              </p>
            ))}
          </Bloco>
          <Bloco titulo="Rascunhos de comunicação (sem envio)">
            {d.comunicacoes.length === 0 && <p className="text-sm text-navy/60">Nenhum rascunho.</p>}
            {d.comunicacoes.map((c: any) => (
              <p key={c.id} className="border-b border-navy/10 py-2 text-sm text-navy">
                <strong>{c.assunto}</strong> — {c.status} / canal sugerido {c.suggested_channel}
                {c.sent_at ? " — enviado" : " — não enviado, exige aprovação humana"}
                <span className="block text-xs text-navy/60">{c.corpo_rascunho}</span>
              </p>
            ))}
          </Bloco>
        </section>
      )}

      {d && secao === "evidencias" && (
        <section className="space-y-4">
          <LastroDeFontes caseId={caseId} tipoAlvo="solicitacao" />
          <Bloco titulo="Documentos e Solicitações">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-navy/60">
                  <tr>
                    <th className="py-2">Geração</th>
                    <th>Nome completo</th>
                    <th>Tipo de documento</th>
                    <th>Arquivo/Instituição</th>
                    <th>Data pedido</th>
                    <th>Status</th>
                    <th>Data recebimento</th>
                    <th>Observação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.solicitacoes.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-3 text-navy/60">
                        Nenhuma solicitação registrada.
                      </td>
                    </tr>
                  )}
                  {d.solicitacoes.map((s: any) => {
                    const pessoa = d.pessoas.find((p: any) => p.id === s.research_person_id);
                    return (
                      <tr key={s.id} className="border-t border-navy/10 align-top">
                        <td className="py-2">{s.generation ?? "—"}</td>
                        <td>{pessoa?.canonical_name ?? s.full_name_text ?? "—"}</td>
                        <td>{s.document_type}</td>
                        <td>{s.institution_or_archive ?? "—"}</td>
                        <td>{s.requested_at ?? "—"}</td>
                        <td>{rotulo(STATUS_SOLICITACAO, s.status)}</td>
                        <td>{s.received_at ?? "—"}</td>
                        <td className="max-w-[220px] text-xs text-navy/70">{s.observation_internal ?? "—"}</td>
                        <td className="whitespace-nowrap text-xs">
                          {d.podeEditar && !s.archived_at && (
                            <>
                              <button
                                type="button"
                                className="underline decoration-gold underline-offset-4"
                                onClick={() => {
                                  setEditandoId(s.id);
                                  const v: Record<string, unknown> = {};
                                  for (const k of Object.keys(VAZIO)) v[k] = s[k] ?? VAZIO[k];
                                  setForm({
                                    ...v,
                                    case_id: s.case_id,
                                    research_person_id: s.research_person_id,
                                    source_id: s.source_id,
                                    generation: s.generation,
                                    full_name_text: s.full_name_text,
                                    document_type: s.document_type,
                                    institution_or_archive: s.institution_or_archive,
                                    requested_at: s.requested_at,
                                    received_at: s.received_at,
                                    observation_internal: s.observation_internal,
                                    responsible_user_id: s.responsible_user_id,
                                    next_action: s.next_action,
                                    next_action_due: s.next_action_due,
                                    estimated_external_cost: s.estimated_external_cost,
                                    internal_link: s.internal_link,
                                  });
                                }}
                              >
                                editar
                              </button>{" "}
                              <button
                                type="button"
                                className="underline decoration-terracotta underline-offset-4"
                                onClick={() => {
                                  const motivo = window.prompt("Motivo do arquivamento:") ?? "";
                                  if (motivo.trim().length >= 5) arquivar.mutate({ id: s.id, motivo });
                                }}
                              >
                                arquivar
                              </button>
                            </>
                          )}
                          {s.archived_at && <span className="text-navy/50">arquivada</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Link interno e documento bruto ficam fora do App Cliente ({CAMPOS_NUNCA_NO_APP.length} campos bloqueados
              na projeção).
            </p>
          </Bloco>

          {d.podeEditar && (
            <Bloco titulo={editandoId ? "Editar solicitação" : "Nova solicitação documental"}>
              <div className="grid gap-3 md:grid-cols-3">
                <Campo label="Geração">
                  <input
                    type="number"
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["generation"] ?? "")}
                    onChange={(e) => set("generation", e.target.value === "" ? null : Number(e.target.value))}
                  />
                </Campo>
                <Campo label="Pessoa cadastrada">
                  <select
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["research_person_id"] ?? "")}
                    onChange={(e) => set("research_person_id", e.target.value || null)}
                  >
                    <option value="">— sem pessoa vinculada —</option>
                    {d.pessoas.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.canonical_name}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Nome completo (só sem pessoa cadastrada)">
                  <input
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    disabled={Boolean(form["research_person_id"])}
                    value={String(form["full_name_text"] ?? "")}
                    onChange={(e) => set("full_name_text", e.target.value)}
                  />
                </Campo>
                <Campo label="Tipo de documento">
                  <input
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["document_type"] ?? "")}
                    onChange={(e) => set("document_type", e.target.value)}
                  />
                </Campo>
                <Campo label="Arquivo/Instituição">
                  <input
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["institution_or_archive"] ?? "")}
                    onChange={(e) => set("institution_or_archive", e.target.value)}
                  />
                </Campo>
                <Campo label="Fonte">
                  <select
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["source_id"] ?? "")}
                    onChange={(e) => set("source_id", e.target.value || null)}
                  >
                    <option value="">— sem fonte vinculada —</option>
                    {d.fontes.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Tipo de solicitação">
                  <Selecao lista={TIPOS_SOLICITACAO} valor={form["request_type"]} onChange={(v) => set("request_type", v)} />
                </Campo>
                <Campo label="Status">
                  <Selecao lista={STATUS_SOLICITACAO} valor={form["status"]} onChange={(v) => set("status", v)} />
                </Campo>
                <Campo label="Prioridade">
                  <Selecao lista={PRIORIDADES} valor={form["priority"]} onChange={(v) => set("priority", v)} />
                </Campo>
                <Campo label="Data do pedido">
                  <input
                    type="date"
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["requested_at"] ?? "")}
                    onChange={(e) => set("requested_at", e.target.value)}
                  />
                </Campo>
                <Campo label="Data de recebimento">
                  <input
                    type="date"
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["received_at"] ?? "")}
                    onChange={(e) => set("received_at", e.target.value)}
                  />
                </Campo>
                <Campo label="Responsável">
                  <select
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["responsible_user_id"] ?? "")}
                    onChange={(e) => set("responsible_user_id", e.target.value || null)}
                  >
                    <option value="">— sem responsável —</option>
                    {d.equipe.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.nome ?? u.id}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label={`Próxima ação${exigeAcao ? " (obrigatória)" : ""}`}>
                  <input
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["next_action"] ?? "")}
                    onChange={(e) => set("next_action", e.target.value)}
                  />
                </Campo>
                <Campo label={`Prazo da próxima ação${exigeAcao ? " (obrigatório)" : ""}`}>
                  <input
                    type="date"
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["next_action_due"] ?? "")}
                    onChange={(e) => set("next_action_due", e.target.value)}
                  />
                </Campo>
                <Campo label="Previsão de custo externo (não gera cobrança)">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["estimated_external_cost"] ?? "")}
                    onChange={(e) =>
                      set("estimated_external_cost", e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </Campo>
                <Campo label="Aprovação do cliente">
                  <Selecao
                    lista={APROVACAO_CLIENTE}
                    valor={form["client_approval_status"]}
                    onChange={(v) => set("client_approval_status", v)}
                  />
                </Campo>
                <Campo label="Nível de acesso">
                  <Selecao
                    lista={NIVEIS_ACESSO_PEDIDO}
                    valor={form["access_level"]}
                    onChange={(v) => set("access_level", v)}
                  />
                </Campo>
                <Campo label="Link interno (nunca exibido no App)">
                  <input
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    value={String(form["internal_link"] ?? "")}
                    onChange={(e) => set("internal_link", e.target.value)}
                  />
                </Campo>
                <Campo label="Observação interna">
                  <textarea
                    className="w-full rounded border border-navy/20 p-2 text-sm"
                    rows={2}
                    value={String(form["observation_internal"] ?? "")}
                    onChange={(e) => set("observation_internal", e.target.value)}
                  />
                </Campo>
              </div>

              {!check.ok && (
                <ul className="mt-3 list-disc pl-5 text-xs text-terracotta">
                  {check.erros.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!check.ok || salvar.isPending}
                  className="rounded bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                  onClick={() =>
                    salvar.mutate({
                      ...(editandoId ? { id: editandoId } : {}),
                      valores: { ...form, case_id: caseId },
                    })
                  }
                >
                  {editandoId ? "Salvar alterações" : "Registrar solicitação"}
                </button>
                {editandoId && (
                  <button
                    type="button"
                    className="rounded border border-navy/20 px-4 py-2 text-sm text-navy"
                    onClick={() => {
                      setEditandoId(null);
                      setForm({ ...VAZIO, case_id: caseId });
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-navy/60">
                Situações de espera, divergência, não localizado e retificação criam alerta interno; ação dirigida ao
                cliente gera apenas rascunho com aprovação humana. Nenhum WhatsApp é enviado.
              </p>
            </Bloco>
          )}
        </section>
      )}
    </div>
  );
}

function Cartao({ titulo, valor, nota }: { titulo: string; valor: number; nota: string }) {
  return (
    <div className="rounded border border-navy/15 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-navy/60">{titulo}</p>
      <p className="text-2xl font-semibold text-navy">{valor}</p>
      <p className="text-xs text-navy/60">{nota}</p>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-navy/15 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-navy/70">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Selecao({
  lista,
  valor,
  onChange,
}: {
  lista: { id: string; rotulo: string }[];
  valor: unknown;
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="w-full rounded border border-navy/20 p-2 text-sm"
      value={String(valor ?? "")}
      onChange={(e) => onChange(e.target.value)}
    >
      {lista.map((o) => (
        <option key={o.id} value={o.id}>
          {o.rotulo}
        </option>
      ))}
    </select>
  );
}

function Lista({
  titulo,
  nota,
  itens,
  link,
  caseId,
}: {
  titulo: string;
  nota: string;
  itens: string[];
  link?: { to: string; rotulo: string };
  caseId?: string;
}) {
  return (
    <Bloco titulo={titulo}>
      <p className="mb-2 text-xs text-navy/60">{nota}</p>
      {itens.length === 0 ? (
        <p className="text-sm text-navy/60">Nenhum registro nesta seção.</p>
      ) : (
        <ul className="list-disc pl-5 text-sm text-navy">
          {itens.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
      {link && caseId && (
        <Link
          to={link.to as any}
          params={{ caseId, id: caseId } as any}
          className="mt-3 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          {link.rotulo}
        </Link>
      )}
    </Bloco>
  );
}
