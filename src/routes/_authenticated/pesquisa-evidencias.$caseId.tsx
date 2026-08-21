import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  APROVACAO_CLIENTE,
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
import { SecaoFontesDocumentos } from "@/components/pesquisa/fontes-documentos";
import { LastroDeFontes } from "@/components/pesquisa/fontes-vinculos";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const [secao, setSecao] = useState<SecaoPesquisa>("documentos");
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

  const d = painel.data as any;
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

      {painel.isLoading && <p className="text-sm text-navy/60">Carregando área de pesquisa…</p>}
      {painel.error && <p className="text-sm text-terracotta">{String((painel.error as any).message)}</p>}

      {d && secao === "visao" && (
        <section className="grid gap-3 md:grid-cols-4">
          <Cartao titulo="Solicitações" valor={d.solicitacoes.length} nota="Pedidos documentais registrados." />
          <Cartao titulo="Evidências" valor={d.evidencias.length} nota="Itens na biblioteca do caso." />
          <Cartao titulo="Alertas abertos" valor={d.alertas.filter((a: any) => a.status === "aberto").length} nota="Pendências internas." />
          <Cartao
            titulo="Rascunhos"
            valor={d.comunicacoes.filter((c: any) => !c.sent_at).length}
            nota="Comunicações não enviadas, com aprovação humana pendente."
          />
        </section>
      )}

      {d && secao === "pessoas" && (
        <Lista
          titulo="Pessoas, famílias e ramos"
          nota="Origem canônica das pessoas do caso."
          itens={d.pessoas.map((p: any) => p.canonical_name)}
          link={{ to: "/pessoas-linhagens/$caseId", rotulo: "Abrir pessoas e linhagens →" }}
          caseId={caseId}
        />
      )}

      {d && secao === "fontes" && (
        <Lista
          titulo="Fontes e consultas"
          nota="Acervos registrados internamente. Nenhuma consulta externa é executada aqui."
          itens={d.fontes.map((f: any) => `${f.title} (${f.source_type})`)}
        />
      )}

      {d && secao === "evidencias" && (
        <div className="space-y-3">
        <Lista
          titulo="Evidências e validações"
          nota="Nada chega ao App sem projeção aprovada e conteúdo sanitizado."
          itens={d.evidencias.map((e: any) => `${e.title_internal} — ${e.workflow_status} / ${e.confidence_level}`)}
          link={{ to: "/biblioteca-evidencias/$caseId", rotulo: "Abrir biblioteca de evidências →" }}
          caseId={caseId}
        />
        <LastroDeFontes caseId={caseId} tipoAlvo="evidencia" />
        </div>
      )}

      {d && secao === "hipoteses" && (
        <Lista
          titulo="Hipóteses e lacunas"
          nota="Trabalho interno de pesquisa; nunca projetado ao cliente."
          itens={[]}
          link={{ to: "/pesquisa-modulo/$id", rotulo: "Abrir módulo de pesquisa →" }}
          caseId={caseId}
        />
      )}

      {d && secao === "relatorios" && (
        <div className="space-y-3">
          <Lista
            titulo="Relatórios de fase"
            nota="Consolidações internas por fase, sem juízo de mérito no material do cliente."
            itens={[]}
            link={{ to: "/pesquisa-modulo/$id", rotulo: "Abrir relatórios de pesquisa →" }}
            caseId={caseId}
          />
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

      {secao === "fontes_documentos" && <SecaoFontesDocumentos caseId={caseId} />}

      {d && secao === "documentos" && (
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
