import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import {
  APROVACOES,
  CONFIANCAS,
  DESTINOS,
  DISCLAIMER_PROJECAO,
  ESTADOS_EPISTEMICOS,
  FLUXO_EVIDENCIA,
  NATUREZAS,
  NIVEIS_ACESSO,
  ROTULO_ESTADO_MICROENTREGA,
  cadeiaDaEvidencia,
  conteudoProjetavel,
  estadoMicroentrega,
  evidenciaProjetavel,
  marcoJuridicoProjetavel,
  validarElevacaoConfianca,
  validarEvidencia,
} from "@/lib/biblioteca-evidencias";
import {
  aprovarProjecao,
  arquivarRegistroG03,
  despublicarProjecao,
  painelBibliotecaEvidencias,
  prepararAlertaProjecao,
  registrarValidacaoEvidencia,
  revisarProjecao,
  salvarEvidencia,
  salvarProjecao,
} from "@/lib/biblioteca-evidencias.functions";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { useAutoridade } from "@/components/saas/autoridade";
import { useSaas } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/biblioteca-evidencias/$caseId")({
  component: Pagina,
  head: () => ({
    meta: [
      { title: "Biblioteca de evidências e projeções | Desk Intelligence" },
      {
        name: "description",
        content:
          "Registro interno de evidências do caso, histórico de validação e projeções autorizadas ao App Cliente, one-page e PDF aprovado.",
      },
      { property: "og:title", content: "Biblioteca de evidências e projeções autorizadas" },
      {
        property: "og:description",
        content: "Integração invisível, evidência visível: nada chega ao cliente sem projeção aprovada e sanitizada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-terracotta">Não foi possível carregar a biblioteca: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm text-navy/70">Caso não encontrado.</div>,
});

const rotulo = (lista: { id: string; rotulo: string }[], id: unknown) =>
  lista.find((x) => x.id === id)?.rotulo ?? String(id ?? "—");

function Campo({ label, ajuda, children }: { label: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="font-medium text-navy">{label}</span>
      {children}
      {ajuda ? <span className="mt-1 block text-[11px] text-navy/60">{ajuda}</span> : null}
    </label>
  );
}

const inputCls = "mt-1 w-full rounded border border-navy/20 bg-white px-2 py-1.5 text-xs text-navy";

type Aba = "evidencias" | "nova" | "validacao" | "projecoes" | "cadeia";

function Pagina() {
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
  const carregar = useServerFn(painelBibliotecaEvidencias);
  const consulta = useQuery({
    queryKey: ["g03", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });
  const { data } = consulta;

  const [aba, setAba] = useState<Aba>("evidencias");
  const [selecionada, setSelecionada] = useState<string>("");

  const salvarEv = useServerFn(salvarEvidencia);
  const validarEv = useServerFn(registrarValidacaoEvidencia);
  const salvarProj = useServerFn(salvarProjecao);
  const aprovarProj = useServerFn(aprovarProjecao);
  const revisarProj = useServerFn(revisarProjecao);
  const despublicarProj = useServerFn(despublicarProjecao);
  const alertaProj = useServerFn(prepararAlertaProjecao);
  const arquivar = useServerFn(arquivarRegistroG03);

  const invalidar = () => qc.invalidateQueries({ queryKey: ["g03", caseId] });
  const erro = (e: unknown) => toast.error(e instanceof Error ? e.message : "Falha ao gravar.");

  const mNova = useMutation({
    mutationFn: (valores: Record<string, unknown>) => salvarEv({ data: { valores } }),
    onSuccess: () => {
      toast.success("Evidência registrada na biblioteca.");
      invalidar();
    },
    onError: erro,
  });
  const mValidar = useMutation({
    mutationFn: (v: { evidenceId: string; estadoNovo: string; confiancaNova: string; justificativa: string }) =>
      validarEv({ data: v }),
    onSuccess: () => {
      toast.success("Validação registrada com responsável, data e justificativa.");
      invalidar();
    },
    onError: erro,
  });
  const mProj = useMutation({
    mutationFn: (valores: Record<string, unknown>) => salvarProj({ data: { valores } }),
    onSuccess: () => {
      toast.success("Projeção criada como rascunho. Aprovação é humana.");
      invalidar();
    },
    onError: erro,
  });
  const mAprovar = useMutation({
    mutationFn: (v: { id: string; publicar: boolean }) => aprovarProj({ data: v }),
    onSuccess: () => {
      toast.success("Projeção atualizada.");
      invalidar();
    },
    onError: erro,
  });
  const mRevisar = useMutation({
    mutationFn: (v: { id: string }) => revisarProj({ data: v }),
    onSuccess: () => {
      toast.success("Projeção enviada para revisão.");
      invalidar();
    },
    onError: erro,
  });
  const mDespublicar = useMutation({
    mutationFn: (v: { id: string }) => despublicarProj({ data: v }),
    onSuccess: () => {
      toast.success("Projeção despublicada — some do App Cliente, continua aprovada.");
      invalidar();
    },
    onError: erro,
  });
  const mAlerta = useMutation({
    mutationFn: (v: { id: string; caseId: string; titulo: string }) => alertaProj({ data: v }),
    onSuccess: () => {
      toast.success("Alerta interno registrado. Nada foi enviado ao cliente.");
      invalidar();
    },
    onError: erro,
  });
  const mArquivar = useMutation({
    mutationFn: (v: { tabela: "evidences" | "app_projections"; id: string; motivo: string }) => arquivar({ data: v }),
    onSuccess: () => {
      toast.success("Registro arquivado. Não existe exclusão física.");
      invalidar();
    },
    onError: erro,
  });

  // Consulta sem payload é falha de carga, não base vazia (ver bloco `!data`).
  const evidencias = data ? data.evidencias : [];
  const projecoes = data ? data.projecoes : [];
  const validacoes = data ? data.validacoes : [];
  // Autoridade operacional (05/09/2026): o gate de papel do servidor deixou de
  // esconder as ações da biblioteca. Elas renderizam sempre; o que sobra é
  // estado do registro (rascunho/em revisão/arquivado), que é regra de negócio.
  const pendenciaPapel = data && !data.podeEditar
    ? "O servidor marcou esta biblioteca como somente leitura para o seu vínculo — as ações seguem disponíveis por decisão sua."
    : null;

  if (consulta.isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-sm text-navy/60" role="status">
        Carregando a biblioteca de evidências…
      </div>
    );
  }
  // Consulta sem erro e sem payload é falha de carga, não biblioteca vazia.
  if (consulta.isError || !data) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-6xl space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm"
      >
        <p className="font-medium text-destructive">
          Não foi possível carregar a biblioteca de evidências deste caso.
        </p>
        <p className="text-navy/80">
          {consulta.error instanceof Error
            ? consulta.error.message
            : "A consulta terminou sem retornar resultado nem erro. Isso é falha de carga: não significa que o caso esteja sem evidências."}
        </p>
        <button
          type="button"
          onClick={() => void consulta.refetch()}
          className="rounded-md border border-navy/20 px-2 py-1 text-xs font-medium text-navy hover:bg-navy/5"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-5">
        <p className="text-[11px] uppercase tracking-widest text-gold">G-03 · Uso interno</p>
        <h1 className="text-xl font-semibold text-navy">Biblioteca de evidências e projeções autorizadas</h1>
        <p className="mt-1 text-xs text-navy/70">
          {data?.caso ? `${data.caso["codigo"]} · ${data.caso["titulo"]}` : "Carregando caso…"} — integração invisível,
          evidência visível. Nada chega ao App Cliente sem projeção aprovada e sanitizada.
        </p>
      </header>

      {pendenciaVinculo || !podeEscrever ? (
        <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}

      <nav className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["evidencias", "Evidências"],
            ["nova", "Nova evidência"],
            ["validacao", "Validação e confiança"],
            ["projecoes", "Projeções autorizadas"],
            ["cadeia", "Cadeia evidência → projeção"],
          ] as [Aba, string][]
        ).map(([id, txt]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
              aba === id ? "border-gold bg-navy text-cream" : "border-navy/20 text-navy"
            }`}
          >
            {txt}
          </button>
        ))}
      </nav>

      {aba === "evidencias" ? (
        <section className="space-y-3">
          {evidencias.length === 0 ? (
            <p className="text-xs text-navy/60">Nenhuma evidência registrada para este caso.</p>
          ) : null}
          {evidencias.map((e) => (
            <article key={String(e["id"])} className="rounded border border-navy/15 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-navy">{String(e["title_internal"])}</h2>
                <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-navy">
                  {rotulo(NIVEIS_ACESSO, e["access_level"])}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-navy/70">
                {rotulo(NATUREZAS, e["evidence_nature"])} · {rotulo(FLUXO_EVIDENCIA, e["workflow_status"])} ·{" "}
                {rotulo(ESTADOS_EPISTEMICOS, e["epistemic_validation_status"])} · confiança{" "}
                {rotulo(CONFIANCAS, e["confidence_level"])}
              </p>
              {e["evidence_nature"] === "busca_negativa" ? (
                <p className="mt-1 text-[11px] text-navy/70">
                  Busca negativa em {String(e["negative_search_source"])} ({String(e["negative_search_date"])}). Próxima
                  ação: {String(e["negative_search_next_action"])}
                </p>
              ) : null}
              <p className="mt-1 text-[11px] text-navy/60">
                {evidenciaProjetavel(e).ok ? "Elegível a projeção autorizada." : evidenciaProjetavel(e).erros.join(" ")}
              </p>
              <div className="mt-2 flex gap-3 text-[11px]">
                <button
                  className="underline decoration-gold"
                  onClick={() => {
                    setSelecionada(String(e["id"]));
                    setAba("validacao");
                  }}
                >
                  Registrar validação
                </button>
                <button
                  className="underline decoration-terracotta text-terracotta"
                  onClick={() => {
                    const motivo = window.prompt("Motivo do arquivamento (opcional):");
                    if (motivo !== null)
                      mArquivar.mutate({ tabela: "evidences", id: String(e["id"]), motivo });
                  }}
                >
                  Arquivar
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {aba === "nova" ? <FormEvidencia caseId={caseId} data={data} onSalvar={(v) => mNova.mutate(v)} /> : null}

      {aba === "validacao" ? (
        <FormValidacao
          evidencias={evidencias}
          selecionada={selecionada}
          onSelecionar={setSelecionada}
          onRegistrar={(v) => mValidar.mutate(v)}
        />
      ) : null}

      {aba === "projecoes" ? (
        <section className="space-y-4">
          <FormProjecao
            caseId={caseId}
            evidencias={evidencias}
            marcosJuridicos={data.marcosJuridicos}
            onCriar={(v) => mProj.mutate(v)}
          />
          <div className="space-y-3">
            {projecoes.map((p) => {
              const estado = estadoMicroentrega({
                approval_status: p["approval_status"] as string,
                effective_from: p["effective_from"] as string | null,
              });
              return (
              <article key={String(p["id"])} className="rounded border border-navy/15 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-navy">{String(p["projection_type"])}</h3>
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-navy">
                    {rotulo(DESTINOS, p["destination"])} · {ROTULO_ESTADO_MICROENTREGA[estado]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-navy/80">{String(p["content_sanitized"])}</p>
                <p className="mt-1 text-[11px] text-navy/50">{DISCLAIMER_PROJECAO}</p>
                <div className="mt-2 flex flex-wrap items-start gap-3 text-[11px]">
                  {p["approval_status"] === "draft" ? (
                    <button className="underline decoration-gold" onClick={() => mRevisar.mutate({ id: String(p["id"]) })}>
                      Enviar para revisão
                    </button>
                  ) : null}
                  {["draft", "in_review"].includes(String(p["approval_status"])) ? (
                    <>
                      <AcaoOperacional
                        rotulo="Aprovar"
                        variant="link"
                        size="sm"
                        capacidade="aprovar_projecao_app_cliente"
                        pendenciaGate={pendenciaVinculo}
                        efeito="Aprova a projeção internamente. Nada é publicado no App Cliente por esta ação."
                        onConfirmar={() => mAprovar.mutate({ id: String(p["id"]), publicar: false })}
                      />
                      <AcaoOperacional
                        rotulo="Aprovar e publicar"
                        variant="link"
                        size="sm"
                        capacidade="aprovar_projecao_app_cliente"
                        acaoExterna="publicar_no_app_cliente"
                        pendenciaGate={pendenciaVinculo}
                        efeito="Aprova e publica esta projeção no App Cliente. Ação voltada ao cliente: exige confirmação com motivo registrado."
                        onConfirmar={() => mAprovar.mutate({ id: String(p["id"]), publicar: true })}
                      />
                    </>
                  ) : null}
                  {estado === "publicada" || estado === "liberada" ? (
                    <AcaoOperacional
                      rotulo="Despublicar"
                      variant="link"
                      size="sm"
                      capacidade="aprovar_projecao_app_cliente"
                      acaoExterna="despublicar_no_app_cliente"
                      pendenciaGate={pendenciaVinculo}
                      efeito="Remove a projeção do App Cliente imediatamente. A projeção continua aprovada, editável e pode ser republicada."
                      onConfirmar={() => mDespublicar.mutate({ id: String(p["id"]) })}
                    />
                  ) : null}
                  {estado !== "arquivada" ? (
                    <button
                      className="underline decoration-navy/40"
                      onClick={() =>
                        mAlerta.mutate({
                          id: String(p["id"]),
                          caseId,
                          titulo: `Microentrega "${String(p["projection_type"])}" aguarda atenção`,
                        })
                      }
                    >
                      Criar alerta interno
                    </button>
                  ) : null}
                </div>
                {String(p["approval_status"]) !== "archived" ? (
                  <button
                    className="mt-2 block text-[11px] text-terracotta underline"
                    onClick={() => {
                      const motivo = window.prompt("Motivo do arquivamento (opcional):");
                      if (motivo !== null)
                        mArquivar.mutate({ tabela: "app_projections", id: String(p["id"]), motivo });
                    }}
                  >
                    Arquivar projeção
                  </button>
                ) : null}
              </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {aba === "cadeia" ? (
        <section className="space-y-3">
          {evidencias.map((e) => {
            const c = cadeiaDaEvidencia(e, validacoes, projecoes);
            return (
              <article key={String(e["id"])} className="rounded border border-navy/15 bg-white p-3 text-xs text-navy">
                <p className="font-semibold">{String(e["title_internal"])}</p>
                <p className="mt-1 text-[11px] text-navy/70">
                  Evidência → {c.validacoes.length} validação(ões) → {c.projecoes.length} projeção(ões) ·{" "}
                  {c.publicadaNoApp ? "publicada no App" : "não publicada no App"}
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-navy/70">
                  {c.validacoes.map((v) => (
                    <li key={String(v["id"])}>
                      {String(v["confianca_anterior"])} → {String(v["confianca_nova"])} ·{" "}
                      {String(v["revisado_em"]).slice(0, 10)} · {String(v["justificativa"])}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

function FormEvidencia({
  caseId,
  data,
  onSalvar,
}: {
  caseId: string;
  /** Payload já carregado: a rota garante presença antes de renderizar. */
  data: { fontes: Record<string, unknown>[]; pessoas: Record<string, unknown>[] };
  onSalvar: (v: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState<Record<string, unknown>>({
    case_id: caseId,
    evidence_type: "",
    evidence_nature: "documental_oficial",
    title_internal: "",
    access_level: "equipe_do_caso",
    workflow_status: "registrada",
    epistemic_validation_status: "DADO_PESQUISA_INICIAL",
    confidence_level: "INICIAL",
  });
  const set = (k: string, val: unknown) => setV((x) => ({ ...x, [k]: val }));
  const check = validarEvidencia(v);

  return (
    <section className="grid gap-3 rounded border border-navy/15 bg-white p-4 md:grid-cols-2">
      <Campo label="Título interno">
        <input className={inputCls} value={String(v["title_internal"] ?? "")} onChange={(e) => set("title_internal", e.target.value)} />
      </Campo>
      <Campo label="Tipo de evidência" ajuda="Ex.: certidão de nascimento, lista de bordo, carta.">
        <input className={inputCls} value={String(v["evidence_type"] ?? "")} onChange={(e) => set("evidence_type", e.target.value)} />
      </Campo>
      <Campo label="Natureza" ajuda={NATUREZAS.find((n) => n.id === v["evidence_nature"])?.nota}>
        <select className={inputCls} value={String(v["evidence_nature"])} onChange={(e) => set("evidence_nature", e.target.value)}>
          {NATUREZAS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Nível de acesso" ajuda={NIVEIS_ACESSO.find((n) => n.id === v["access_level"])?.nota}>
        <select className={inputCls} value={String(v["access_level"])} onChange={(e) => set("access_level", e.target.value)}>
          {NIVEIS_ACESSO.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Estado no fluxo">
        <select className={inputCls} value={String(v["workflow_status"])} onChange={(e) => set("workflow_status", e.target.value)}>
          {FLUXO_EVIDENCIA.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Estado epistêmico" ajuda="Confiança nasce INICIAL ou BAIXO; elevação só por validação registrada.">
        <select
          className={inputCls}
          value={String(v["epistemic_validation_status"])}
          onChange={(e) => set("epistemic_validation_status", e.target.value)}
        >
          {ESTADOS_EPISTEMICOS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Data de referência">
        <input type="date" className={inputCls} value={String(v["reference_date"] ?? "")} onChange={(e) => set("reference_date", e.target.value || null)} />
      </Campo>
      <Campo label="Local de referência">
        <input className={inputCls} value={String(v["reference_location"] ?? "")} onChange={(e) => set("reference_location", e.target.value)} />
      </Campo>
      <Campo label="Fonte vinculada (opcional)">
        <select className={inputCls} value={String(v["source_id"] ?? "")} onChange={(e) => set("source_id", e.target.value || null)}>
          <option value="">—</option>
          {data.fontes.map((f) => (
            <option key={String(f["id"])} value={String(f["id"])}>
              {String(f["title"])}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Pessoa vinculada (opcional)">
        <select
          className={inputCls}
          value={String(v["research_person_id"] ?? "")}
          onChange={(e) => set("research_person_id", e.target.value || null)}
        >
          <option value="">—</option>
          {data.pessoas.map((p) => (
            <option key={String(p["id"])} value={String(p["id"])}>
              {String(p["canonical_name"])}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Referência interna de armazenamento" ajuda="Uso interno. Nunca compõe projeção ao cliente.">
        <input
          className={inputCls}
          value={String(v["storage_reference_internal"] ?? "")}
          onChange={(e) => set("storage_reference_internal", e.target.value)}
        />
      </Campo>
      <Campo label="Descrição interna">
        <textarea
          className={inputCls}
          rows={2}
          value={String(v["description_internal"] ?? "")}
          onChange={(e) => set("description_internal", e.target.value)}
        />
      </Campo>

      {v["evidence_nature"] === "busca_negativa" ? (
        <>
          <Campo label="Fonte consultada">
            <input
              className={inputCls}
              value={String(v["negative_search_source"] ?? "")}
              onChange={(e) => set("negative_search_source", e.target.value)}
            />
          </Campo>
          <Campo label="Data da consulta">
            <input
              type="date"
              className={inputCls}
              value={String(v["negative_search_date"] ?? "")}
              onChange={(e) => set("negative_search_date", e.target.value || null)}
            />
          </Campo>
          <Campo label="Próxima ação possível">
            <input
              className={inputCls}
              value={String(v["negative_search_next_action"] ?? "")}
              onChange={(e) => set("negative_search_next_action", e.target.value)}
            />
          </Campo>
        </>
      ) : null}

      <div className="md:col-span-2">
        {check.erros.length ? <ul className="mb-2 text-[11px] text-terracotta">{check.erros.map((e) => <li key={e}>• {e}</li>)}</ul> : null}
        <button
          onClick={() => onSalvar(v)}
          className="rounded bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          Registrar evidência
        </button>
      </div>
    </section>
  );
}

function FormValidacao({
  evidencias,
  selecionada,
  onSelecionar,
  onRegistrar,
}: {
  evidencias: Record<string, unknown>[];
  selecionada: string;
  onSelecionar: (id: string) => void;
  onRegistrar: (v: { evidenceId: string; estadoNovo: string; confiancaNova: string; justificativa: string }) => void;
}) {
  const alvo = evidencias.find((e) => e["id"] === selecionada);
  const [estadoNovo, setEstadoNovo] = useState("EM_VALIDACAO_DOCUMENTAL");
  const [confiancaNova, setConfiancaNova] = useState("BAIXO");
  const [justificativa, setJustificativa] = useState("");

  const check = validarElevacaoConfianca({
    anterior: String(alvo?.["confidence_level"] ?? "INICIAL"),
    nova: confiancaNova,
    justificativa,
    revisadoPor: "usuario_atual",
    revisadoEm: new Date().toISOString(),
  });

  return (
    <section className="grid gap-3 rounded border border-navy/15 bg-white p-4 md:grid-cols-2">
      <Campo label="Evidência">
        <select className={inputCls} value={selecionada} onChange={(e) => onSelecionar(e.target.value)}>
          <option value="">Selecione…</option>
          {evidencias.map((e) => (
            <option key={String(e["id"])} value={String(e["id"])}>
              {String(e["title_internal"])} ({rotulo(CONFIANCAS, e["confidence_level"])})
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Novo estado epistêmico">
        <select className={inputCls} value={estadoNovo} onChange={(e) => setEstadoNovo(e.target.value)}>
          {ESTADOS_EPISTEMICOS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Nova confiança" ajuda="Sem salto de inicial para alto: eleve por etapas.">
        <select className={inputCls} value={confiancaNova} onChange={(e) => setConfiancaNova(e.target.value)}>
          {CONFIANCAS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Justificativa" ajuda="Opcional. Fica no histórico com responsável e data.">
        <textarea className={inputCls} rows={2} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
      </Campo>
      <div className="md:col-span-2">
        {check.erros.length ? <ul className="mb-2 text-[11px] text-terracotta">{check.erros.map((e) => <li key={e}>• {e}</li>)}</ul> : null}
        <button
          disabled={!selecionada}
          onClick={() => onRegistrar({ evidenceId: selecionada, estadoNovo, confiancaNova, justificativa })}
          className="rounded bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          Registrar validação
        </button>
      </div>
    </section>
  );
}

function FormProjecao({
  caseId,
  evidencias,
  marcosJuridicos,
  onCriar,
}: {
  caseId: string;
  evidencias: Record<string, unknown>[];
  marcosJuridicos: Record<string, unknown>[];
  onCriar: (v: Record<string, unknown>) => void;
}) {
  const [origemTipo, setOrigemTipo] = useState<"evidence" | "legal_rule">("evidence");
  const [origem, setOrigem] = useState("");
  const [tipo, setTipo] = useState("marco_de_pesquisa");
  const [destino, setDestino] = useState("app");
  const [conteudo, setConteudo] = useState("");
  const evidencia = evidencias.find((e) => e["id"] === origem);
  const regra = marcosJuridicos.find((r) => r["id"] === origem);
  const checkTexto = conteudoProjetavel(conteudo);
  const checkOrigem =
    origemTipo === "evidence"
      ? evidencia
        ? evidenciaProjetavel(evidencia)
        : { ok: false, erros: ["Selecione a evidência de origem."] }
      : regra
        ? marcoJuridicoProjetavel(regra as { status?: string | null; archived_at?: string | null })
        : { ok: false, erros: ["Selecione o marco jurídico de origem."] };
  const checkEv = checkOrigem;

  return (
    <section className="grid gap-3 rounded border border-navy/15 bg-white p-4 md:grid-cols-2">
      <Campo label="Tipo de origem">
        <select
          className={inputCls}
          value={origemTipo}
          onChange={(e) => {
            setOrigemTipo(e.target.value as "evidence" | "legal_rule");
            setOrigem("");
          }}
        >
          <option value="evidence">Evidência de pesquisa</option>
          <option value="legal_rule">Marco/regra jurídica do caso</option>
        </select>
      </Campo>
      {origemTipo === "evidence" ? (
        <Campo label="Evidência de origem">
          <select className={inputCls} value={origem} onChange={(e) => setOrigem(e.target.value)}>
            <option value="">Selecione…</option>
            {evidencias.map((e) => (
              <option key={String(e["id"])} value={String(e["id"])}>
                {String(e["title_internal"])}
              </option>
            ))}
          </select>
        </Campo>
      ) : (
        <Campo
          label="Marco/regra jurídica de origem"
          ajuda="Só regra jurídica aprovada aparece aqui — mesma trava de evidência restrita."
        >
          <select className={inputCls} value={origem} onChange={(e) => setOrigem(e.target.value)}>
            <option value="">Selecione…</option>
            {marcosJuridicos.length === 0 ? (
              <option value="" disabled>
                Nenhuma regra jurídica aprovada para este caso
              </option>
            ) : null}
            {marcosJuridicos.map((r) => (
              <option key={String(r["id"])} value={String(r["id"])}>
                {String(r["tema"])} ({String(r["fonte_referencia"] ?? "sem fonte")})
              </option>
            ))}
          </select>
        </Campo>
      )}
      <Campo label="Tipo de projeção">
        <input className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)} />
      </Campo>
      <Campo label="Destino">
        <select className={inputCls} value={destino} onChange={(e) => setDestino(e.target.value)}>
          {DESTINOS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.rotulo}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Conteúdo sanitizado" ajuda="Sem link, arquivo, transcrição, hipótese, risco ou juízo de mérito.">
        <textarea className={inputCls} rows={3} value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
      </Campo>
      <div className="md:col-span-2">
        {[...checkTexto.erros, ...checkEv.erros].length ? (
          <ul className="mb-2 text-[11px] text-terracotta">
            {[...checkTexto.erros, ...checkEv.erros].map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        ) : null}
        <button

          onClick={() =>
            onCriar({
              case_id: caseId,
              source_entity_type: origemTipo,
              source_entity_id: origem,
              projection_type: tipo,
              destination: destino,
              content_sanitized: conteudo,
              approval_status: "draft",
              visibility_scope: "titular",
            })
          }
          className="rounded bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          Criar projeção como rascunho
        </button>
      </div>
    </section>
  );
}
