import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAutoridade } from "@/components/saas/autoridade";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import {
  APROVACOES,
  CONFIANCAS,
  DISCLAIMER_PADRAO,
  IMPACTOS,
  RELEVANCIAS,
  STATUS_VALIDACAO,
  TIPOS_ACHADO,
  TIPOS_ENCONTRO,
  projetarEncontroParaCliente,
  validarAchado,
  validarEncontro,
} from "@/lib/achados-genealogicos";
import { arquivarRegistroG06, painelAchados, salvarAchado, salvarEncontro } from "@/lib/achados-genealogicos.functions";
import { criarMicroentregaCliente } from "@/lib/jornada-cliente.functions";
import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta, Indicador, type Tom } from "@/components/prancha-v4/kit";

export const Route = createFileRoute("/_authenticated/achados/$caseId")({
  component: Pagina,
  head: () => ({
    meta: [
      { title: "Achados genealógicos e encontros de linhagem | Desk Intelligence" },
      {
        name: "description",
        content:
          "Registro interno de achados genealógicos e encontros de linhagem, com evidência obrigatória, validação humana e nenhuma publicação automática.",
      },
      { property: "og:title", content: "Achados genealógicos e encontros de linhagem" },
      {
        property: "og:description",
        content: "Fonte, evidência, validação interna e projeção ao cliente apenas após aprovação humana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <SaasShell titulo="Achados genealógicos" descricao="Falha ao carregar os achados.">
      <p role="alert" className="text-sm text-terracotta">Não foi possível carregar os achados: {(error as Error).message}</p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Achados genealógicos" descricao="Caso não encontrado.">
      <p className="text-sm text-navy/70">Caso não encontrado.</p>
    </SaasShell>
  ),
});

const rotulo = (lista: { id: string; rotulo: string }[], id: unknown) =>
  lista.find((x) => x.id === id)?.rotulo ?? String(id ?? "—");

function Campo({ label, children, ajuda }: { label: string; children: React.ReactNode; ajuda?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">{label}</label>
      {children}
      {ajuda ? <p className="mt-1 text-xs text-navy/50">{ajuda}</p> : null}
    </div>
  );
}

// V4-04: tom do chip de estado — só leitura do vocabulário real (validação/aprovação).
const TOM_VALIDACAO: Record<string, Tom> = {
  rascunho: "neutro",
  em_revisao: "atencao",
  validado_internamente: "sucesso",
  divergente: "critico",
  arquivado: "neutro",
};
const TOM_APROVACAO: Record<string, Tom> = {
  nao_submetido: "neutro",
  em_aprovacao: "atencao",
  aprovado: "sucesso",
  recusado: "critico",
};

const inputCls = "w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold";

function MultiSelecao({
  itens,
  selecionados,
  onChange,
}: {
  itens: { id: string; label: string }[];
  selecionados: string[];
  onChange: (v: string[]) => void;
}) {
  if (itens.length === 0) {
    return <p className="rounded-lg border border-navy/10 bg-navy/5 px-3 py-2 text-xs text-navy/60">Nenhum item disponível.</p>;
  }
  return (
    <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-navy/15 bg-cream p-2">
      {itens.map((i) => (
        <label key={i.id} className="flex items-start gap-2 text-xs text-navy/80">
          <input
            type="checkbox"
            checked={selecionados.includes(i.id)}
            onChange={(e) =>
              onChange(e.target.checked ? [...selecionados, i.id] : selecionados.filter((x) => x !== i.id))
            }
          />
          <span>{i.label}</span>
        </label>
      ))}
    </div>
  );
}

function Bloqueios({ lista }: { lista: { codigo: string; mensagem: string }[] }) {
  if (lista.length === 0) return null;
  return (
    <ul className="space-y-1 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-terracotta">
      {lista.map((b) => (
        <li key={b.codigo}>
          <strong className="font-mono">{b.codigo}</strong> — {b.mensagem}
        </li>
      ))}
    </ul>
  );
}

/**
 * CA-ACHADO-MICROENTREGA (24/09/2026) — achado real: um achado marcado
 * elegível para entrega abria um alerta interno (`case_alerts`, via
 * `prepararConsequenciaAchado`) e parava aí. Não existia nenhum caminho de
 * UI que criasse a microentrega e gravasse `client_deliverable_id` de
 * volta — o campo já era gravável, só faltava quem preenchesse. O alerta
 * nunca se resolvia sozinho; dependia de alguém lembrar de ir a outra tela.
 *
 * Fecha o elo sem tabela/rota nova: cria a microentrega em rascunho
 * (`criarMicroentregaCliente`, publicação continua passo humano separado)
 * e, no sucesso, vincula o achado a ela — o que já dispara
 * `prepararConsequenciaAchado` de novo e resolve o alerta sozinho.
 */
function PainelMicroentregaAchado({
  achado,
  caseId,
  podeEditar,
  onCriada,
}: {
  achado: Record<string, unknown>;
  caseId: string;
  podeEditar: boolean;
  onCriada: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState(String(achado["title"] ?? ""));
  const [resumo, setResumo] = useState(
    String(achado["confirmed_facts"] ?? achado["internal_summary"] ?? ""),
  );
  const criarEntrega = useServerFn(criarMicroentregaCliente);
  const vincularAchado = useServerFn(salvarAchado);

  const mCriar = useMutation({
    mutationFn: async () => {
      const entrega = await criarEntrega({
        data: {
          casoId: caseId,
          tipo: "documento_localizado",
          tituloCliente: titulo.trim(),
          resumoAprovado: resumo.trim(),
          referenciaInterna: `achado:${String(achado["id"])}`,
        },
      });
      await vincularAchado({
        data: { id: String(achado["id"]), valores: { client_deliverable_id: entrega.id } },
      });
    },
    onSuccess: () => {
      toast.success("Micro-entrega criada em rascunho e vinculada ao achado. Publicação continua manual.");
      setAberto(false);
      onCriada();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (achado["archived_at"] || !achado["eligible_for_client_deliverable"]) return null;
  if (achado["client_deliverable_id"]) {
    return <p className="text-xs text-navy/50">Micro-entrega vinculada.</p>;
  }
  if (!podeEditar) return null;

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs text-navy underline underline-offset-4"
      >
        Criar micro-entrega a partir deste achado
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-gold/40 bg-gold/5 p-2">
      <p className="text-xs text-navy/60">
        Cria uma micro-entrega em rascunho (nunca publica sozinho) e vincula este achado a ela.
      </p>
      <Campo label="Título ao cliente">
        <input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </Campo>
      <Campo label="Resumo aprovado (revise antes de salvar — nada interno deve vazar)">
        <textarea className={inputCls} rows={3} value={resumo} onChange={(e) => setResumo(e.target.value)} />
      </Campo>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={mCriar.isPending || !titulo.trim() || !resumo.trim()}
          onClick={() => mCriar.mutate()}
          className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
        >
          Criar micro-entrega
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-xs text-navy/60 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Pagina() {
  const { caseId } = Route.useParams();
  const qc = useQueryClient();
  const carregar = useServerFn(painelAchados);
  const gravarAchado = useServerFn(salvarAchado);
  const gravarEncontro = useServerFn(salvarEncontro);
  const arquivar = useServerFn(arquivarRegistroG06);

  const q = useQuery({
    queryKey: ["g06", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  const [aba, setAba] = useState<"achados" | "encontros">("achados");
  const [achado, setAchado] = useState<Record<string, unknown>>({
    finding_type: "registro_civil",
    relevance: "media",
    validation_status: "rascunho",
    tree_impact: "nenhum",
    timeline_impact: "nenhum",
    evidence_links: [] as string[],
    source_links: [] as string[],
  });
  const [encontro, setEncontro] = useState<Record<string, unknown>>({
    encounter_type: "convergencia_documental",
    confidence_internal: "hipotese",
    validation_status: "rascunho",
    approval_status: "nao_submetido",
    tree_impact: "nenhum",
    timeline_impact: "nenhum",
    disclaimer_obrigatorio: false,
    evidence_links_a: [] as string[],
    evidence_links_b: [] as string[],
  });

  const invalidar = () => qc.invalidateQueries({ queryKey: ["g06", caseId] });

  const mAchado = useMutation({
    mutationFn: () => gravarAchado({ data: { valores: { ...achado, case_id: caseId } } }),
    onSuccess: () => {
      toast.success("Achado registrado (uso interno). Nada foi publicado nem enviado.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mEncontro = useMutation({
    mutationFn: () => gravarEncontro({ data: { valores: { ...encontro, case_id: caseId } } }),
    onSuccess: () => {
      toast.success("Encontro de linhagem registrado (uso interno).");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mArquivar = useMutation({
    mutationFn: (v: { tabela: "genealogical_findings" | "lineage_encounters"; id: string }) =>
      arquivar({ data: { ...v, motivo: "Arquivado pelo Desk" } }),
    onSuccess: () => {
      toast.success("Registro arquivado. Sem exclusão física.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const autoridade = useAutoridade();
  const evidencias = (q.data?.evidencias ?? []).map((e) => ({
    id: String(e["id"]),
    label: `${String(e["title"] ?? "Evidência")} · ${String(e["evidence_status"] ?? "")}`,
  }));
  const fontes = (q.data?.fontes ?? []).map((f) => ({
    id: String(f["id"]),
    label: `${String(f["title"] ?? "Fonte")} · ${String(f["source_type"] ?? "")}`,
  }));
  const nucleos = q.data?.nucleos ?? [];

  const bloqA = validarAchado(achado as never);
  const bloqE = validarEncontro(encontro as never);
  // Autoridade operacional: gate de domínio do servidor não trava mais campo
  // nem esconde formulário; vira pendência declarada.
  const podeEditar = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const pendenciaAchados =
    q.data && !q.data.podeEditar
      ? "O servidor marcou este caso como somente leitura para o seu vínculo — o registro segue disponível por decisão sua."
      : null;

  // V4-04: KPIs só com contagem real do painel já carregado (sem percentual).
  // "Validado internamente" é estado interno — não é conclusão jurídica nem publicação.
  const achadosAtivos = (q.data?.achados ?? []).filter((a) => !a["archived_at"]);
  const encontrosAtivos = (q.data?.encontros ?? []).filter((e) => !e["archived_at"]);
  const kpis = q.data
    ? [
        { rotulo: "Achados ativos", valor: achadosAtivos.length, apoio: "Não arquivados" },
        {
          rotulo: "Validados internamente",
          valor: achadosAtivos.filter((a) => a["validation_status"] === "validado_internamente").length,
          apoio: "Revisão interna — não é conclusão jurídica",
        },
        {
          rotulo: "Com micro-entrega vinculada",
          valor: achadosAtivos.filter((a) => a["client_deliverable_id"]).length,
          apoio: "Vínculo registrado — publicação é passo separado",
        },
        { rotulo: "Encontros de linhagem", valor: encontrosAtivos.length, apoio: "Não arquivados" },
      ]
    : null;

  const setA = (k: string, v: unknown) => setAchado((p) => ({ ...p, [k]: v }));
  const setE = (k: string, v: unknown) => setEncontro((p) => ({ ...p, [k]: v }));

  return (
    <SaasShell
      titulo="Achados genealógicos e encontros de linhagem"
      descricao="Registro interno com evidência obrigatória e nenhuma publicação automática."
    >
    <div className="space-y-6">
      <header className="space-y-1">
        <Link to="/casos/$caseId" params={{ caseId }} className="text-xs text-navy/50 hover:text-navy">
          ← Ficha do caso
        </Link>
        <p className="text-sm text-navy/60">
          Caso {String(q.data?.caso?.["codigo"] ?? caseId)} · Fonte → evidência → validação interna → achado → árvore/linha do
          tempo → micro-entrega ou relatório, se aprovado.
        </p>
        <p className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-navy/80">
          Registro interno. Nada aqui é publicado no App Cliente nem gera mensagem. Achado validado não equivale a conclusão
          jurídica ou cidadania reconhecida.
        </p>
      </header>

      {pendenciaAchados ? (
        <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaAchados}
        </p>
      ) : null}
      {kpis ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-achados-kpis>
          {kpis.map((k) => (
            <Indicador key={k.rotulo} rotulo={k.rotulo} valor={String(k.valor)} apoio={k.apoio} />
          ))}
        </div>
      ) : null}
      {q.isLoading ? <p className="text-sm text-navy/50">Carregando…</p> : null}
      {q.isError ? (
        <p className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 p-3 text-sm text-terracotta">
          Não foi possível carregar achados e encontros deste caso.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      <div className="flex gap-2">
        {(["achados", "encontros"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setAba(t)}
            className={"rounded-lg px-3 py-1.5 text-sm " + (aba === t ? "bg-navy text-cream" : "text-navy/60 hover:bg-navy/5")}
          >
            {t === "achados" ? "Achados" : "Encontros de linhagem"}
          </button>
        ))}
      </div>

      {aba === "achados" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <CaCard titulo="Novo achado" eyebrow="Achados · registro interno">
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Título">
                <input className={inputCls} value={String(achado["title"] ?? "")} onChange={(e) => setA("title", e.target.value)} />
              </Campo>
              <Campo label="Tipo do achado" ajuda={TIPOS_ACHADO.find((t) => t.id === achado["finding_type"])?.nota}>
                <select className={inputCls} value={String(achado["finding_type"])} onChange={(e) => setA("finding_type", e.target.value)}>
                  {TIPOS_ACHADO.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Geração">
                <input className={inputCls} value={String(achado["generation"] ?? "")} onChange={(e) => setA("generation", e.target.value)} />
              </Campo>
              <Campo label="Relação familiar (documentada)">
                <input
                  className={inputCls}
                  value={String(achado["family_relationship"] ?? "")}
                  onChange={(e) => setA("family_relationship", e.target.value)}
                />
              </Campo>
              <Campo label="Período inicial">
                <input type="date" className={inputCls} value={String(achado["period_start"] ?? "")} onChange={(e) => setA("period_start", e.target.value)} />
              </Campo>
              <Campo label="Período final">
                <input type="date" className={inputCls} value={String(achado["period_end"] ?? "")} onChange={(e) => setA("period_end", e.target.value)} />
              </Campo>
              <Campo label="Localidade">
                <input className={inputCls} value={String(achado["locality"] ?? "")} onChange={(e) => setA("locality", e.target.value)} />
              </Campo>
              <Campo label="Núcleo familiar">
                <select className={inputCls} value={String(achado["family_id"] ?? "")} onChange={(e) => setA("family_id", e.target.value || null)}>
                  <option value="">—</option>
                  {nucleos.map((n) => (
                    <option key={String(n["id"])} value={String(n["id"])}>
                      {String(n["nome"])}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Relevância">
                <select className={inputCls} value={String(achado["relevance"])} onChange={(e) => setA("relevance", e.target.value)}>
                  {RELEVANCIAS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Validação">
                <select className={inputCls} value={String(achado["validation_status"])} onChange={(e) => setA("validation_status", e.target.value)}>
                  {STATUS_VALIDACAO.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Impacto na árvore">
                <select className={inputCls} value={String(achado["tree_impact"])} onChange={(e) => setA("tree_impact", e.target.value)}>
                  {IMPACTOS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Impacto na linha do tempo">
                <select className={inputCls} value={String(achado["timeline_impact"])} onChange={(e) => setA("timeline_impact", e.target.value)}>
                  {IMPACTOS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo label="Evidências vinculadas" ajuda="Obrigatório ao menos uma evidência ou fonte.">
              <MultiSelecao itens={evidencias} selecionados={(achado["evidence_links"] as string[]) ?? []} onChange={(v) => setA("evidence_links", v)} />
            </Campo>
            <Campo label="Fontes vinculadas">
              <MultiSelecao itens={fontes} selecionados={(achado["source_links"] as string[]) ?? []} onChange={(v) => setA("source_links", v)} />
            </Campo>

            {achado["finding_type"] === "resultado_negativo_pesquisa" ? (
              <div className="grid gap-3 rounded-lg border border-navy/15 bg-navy/5 p-3 sm:grid-cols-2">
                <Campo label="Data da consulta à fonte">
                  <input
                    type="date"
                    className={inputCls}
                    value={String(achado["negative_source_consulted_at"] ?? "")}
                    onChange={(e) => setA("negative_source_consulted_at", e.target.value)}
                  />
                </Campo>
                <Campo label="Próxima ação alternativa">
                  <input
                    className={inputCls}
                    value={String(achado["negative_next_action"] ?? "")}
                    onChange={(e) => setA("negative_next_action", e.target.value)}
                  />
                </Campo>
              </div>
            ) : null}

            <Campo label="Resumo interno">
              <textarea className={inputCls} rows={3} value={String(achado["internal_summary"] ?? "")} onChange={(e) => setA("internal_summary", e.target.value)} />
            </Campo>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Fatos confirmados">
                <textarea className={inputCls} rows={2} value={String(achado["confirmed_facts"] ?? "")} onChange={(e) => setA("confirmed_facts", e.target.value)} />
              </Campo>
              <Campo label="Fatos a confirmar">
                <textarea className={inputCls} rows={2} value={String(achado["facts_to_confirm"] ?? "")} onChange={(e) => setA("facts_to_confirm", e.target.value)} />
              </Campo>
            </div>
            <Campo label="Impacto no planejamento">
              <textarea className={inputCls} rows={2} value={String(achado["planning_impact"] ?? "")} onChange={(e) => setA("planning_impact", e.target.value)} />
            </Campo>
            <Campo label="Notas internas">
              <textarea className={inputCls} rows={2} value={String(achado["internal_notes"] ?? "")} onChange={(e) => setA("internal_notes", e.target.value)} />
            </Campo>
            <label className="flex items-center gap-2 text-sm text-navy/80">
              <input
                type="checkbox"
                checked={Boolean(achado["eligible_for_client_deliverable"])}
                onChange={(e) => setA("eligible_for_client_deliverable", e.target.checked)}
              />
              Elegível para entrega ao cliente (só após validação interna)
            </label>

            <Bloqueios lista={bloqA} />
            <button
              disabled={mAchado.isPending}
              onClick={() => mAchado.mutate()}
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
            >
              Registrar achado
            </button>
          </section>
          </CaCard>

          <CaCard titulo="Achados do caso" eyebrow="Achados · lista">
          <section className="space-y-3">
            {!q.isLoading && !q.isError && (q.data?.achados ?? []).length === 0 ? (
              <EstadoVazio mensagem="Nenhum achado registrado." />
            ) : (
              (q.data?.achados ?? []).map((a) => (
                <article key={String(a["id"])} className="space-y-1 rounded-xl border border-navy/10 bg-cream/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-navy">{String(a["title"])}</h3>
                    <Etiqueta
                      texto={rotulo(STATUS_VALIDACAO, a["validation_status"])}
                      tom={TOM_VALIDACAO[String(a["validation_status"])] ?? "neutro"}
                    />
                  </div>
                  <p className="text-xs text-navy/60">
                    {rotulo(TIPOS_ACHADO, a["finding_type"])} · relevância {rotulo(RELEVANCIAS, a["relevance"])} ·{" "}
                    {String(a["locality"] ?? "sem localidade")}
                  </p>
                  <p className="text-xs text-navy/60">
                    Evidências: {((a["evidence_links"] as string[]) ?? []).length} · Fontes:{" "}
                    {((a["source_links"] as string[]) ?? []).length} · Árvore {rotulo(IMPACTOS, a["tree_impact"])} · Timeline{" "}
                    {rotulo(IMPACTOS, a["timeline_impact"])}
                  </p>
                  <PainelMicroentregaAchado
                    achado={a}
                    caseId={caseId}
                    podeEditar={podeEditar}
                    onCriada={invalidar}
                  />
                  {a["archived_at"] ? (
                    <p className="text-xs text-navy/50">Arquivado.</p>
                  ) : podeEditar ? (
                    <button
                      onClick={() => mArquivar.mutate({ tabela: "genealogical_findings", id: String(a["id"]) })}
                      className="text-xs text-terracotta hover:underline"
                    >
                      Arquivar
                    </button>
                  ) : null}
                </article>
              ))
            )}
          </section>
          </CaCard>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <CaCard titulo="Novo encontro de linhagem" eyebrow="Encontros · registro interno">
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Tipo" ajuda={TIPOS_ENCONTRO.find((t) => t.id === encontro["encounter_type"])?.nota}>
                <select className={inputCls} value={String(encontro["encounter_type"])} onChange={(e) => setE("encounter_type", e.target.value)}>
                  {TIPOS_ENCONTRO.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Data do marco">
                <input type="date" className={inputCls} value={String(encontro["data_marco"] ?? "")} onChange={(e) => setE("data_marco", e.target.value)} />
              </Campo>
              <Campo label="Título interno">
                <input className={inputCls} value={String(encontro["title_internal"] ?? "")} onChange={(e) => setE("title_internal", e.target.value)} />
              </Campo>
              <Campo label="Título para o cliente (rascunho)">
                <input className={inputCls} value={String(encontro["title_client"] ?? "")} onChange={(e) => setE("title_client", e.target.value)} />
              </Campo>
              <Campo label="Linha A (núcleo)">
                <select className={inputCls} value={String(encontro["lineage_path_a_id"] ?? "")} onChange={(e) => setE("lineage_path_a_id", e.target.value || null)}>
                  <option value="">—</option>
                  {nucleos.map((n) => (
                    <option key={String(n["id"])} value={String(n["id"])}>
                      {String(n["nome"])}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Linha B (núcleo)">
                <select className={inputCls} value={String(encontro["lineage_path_b_id"] ?? "")} onChange={(e) => setE("lineage_path_b_id", e.target.value || null)}>
                  <option value="">—</option>
                  {nucleos.map((n) => (
                    <option key={String(n["id"])} value={String(n["id"])}>
                      {String(n["nome"])}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Confiança interna">
                <select className={inputCls} value={String(encontro["confidence_internal"])} onChange={(e) => setE("confidence_internal", e.target.value)}>
                  {CONFIANCAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Validação">
                <select className={inputCls} value={String(encontro["validation_status"])} onChange={(e) => setE("validation_status", e.target.value)}>
                  {STATUS_VALIDACAO.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Aprovação">
                <select className={inputCls} value={String(encontro["approval_status"])} onChange={(e) => setE("approval_status", e.target.value)}>
                  {APROVACOES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Impacto na árvore">
                <select className={inputCls} value={String(encontro["tree_impact"])} onChange={(e) => setE("tree_impact", e.target.value)}>
                  {IMPACTOS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Impacto na linha do tempo">
                <select className={inputCls} value={String(encontro["timeline_impact"])} onChange={(e) => setE("timeline_impact", e.target.value)}>
                  {IMPACTOS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.rotulo}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Evidências da linha A">
                <MultiSelecao itens={evidencias} selecionados={(encontro["evidence_links_a"] as string[]) ?? []} onChange={(v) => setE("evidence_links_a", v)} />
              </Campo>
              <Campo label="Evidências da linha B" ajuda="Dispensada apenas em marco de origem.">
                <MultiSelecao itens={evidencias} selecionados={(encontro["evidence_links_b"] as string[]) ?? []} onChange={(v) => setE("evidence_links_b", v)} />
              </Campo>
            </div>

            <Campo label="Contexto histórico">
              <textarea className={inputCls} rows={2} value={String(encontro["contexto_historico"] ?? "")} onChange={(e) => setE("contexto_historico", e.target.value)} />
            </Campo>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Territórios migratórios">
                <textarea className={inputCls} rows={2} value={String(encontro["territorios_migratorios"] ?? "")} onChange={(e) => setE("territorios_migratorios", e.target.value)} />
              </Campo>
              <Campo label="Memória familiar (relatada)">
                <textarea className={inputCls} rows={2} value={String(encontro["memoria_familiar"] ?? "")} onChange={(e) => setE("memoria_familiar", e.target.value)} />
              </Campo>
              <Campo label="Práticas culturais documentadas">
                <textarea className={inputCls} rows={2} value={String(encontro["praticas_culturais_documentadas"] ?? "")} onChange={(e) => setE("praticas_culturais_documentadas", e.target.value)} />
              </Campo>
              <Campo label="Encontros no Brasil">
                <textarea className={inputCls} rows={2} value={String(encontro["encontros_no_brasil"] ?? "")} onChange={(e) => setE("encontros_no_brasil", e.target.value)} />
              </Campo>
            </div>
            <Campo label="Repertórios narrativos" ajuda="Sem linguagem determinista, terapêutica ou de traço psicológico.">
              <textarea className={inputCls} rows={2} value={String(encontro["repertorios_narrativos"] ?? "")} onChange={(e) => setE("repertorios_narrativos", e.target.value)} />
            </Campo>
            <Campo label="Resumo interno">
              <textarea className={inputCls} rows={2} value={String(encontro["resumo_interno"] ?? "")} onChange={(e) => setE("resumo_interno", e.target.value)} />
            </Campo>
            <Campo label="Resumo aprovado para o cliente (rascunho sanitizado)">
              <textarea className={inputCls} rows={3} value={String(encontro["resumo_aprovado_cliente"] ?? "")} onChange={(e) => setE("resumo_aprovado_cliente", e.target.value)} />
            </Campo>
            <label className="flex items-start gap-2 text-sm text-navy/80">
              <input type="checkbox" checked={Boolean(encontro["disclaimer_obrigatorio"])} onChange={(e) => setE("disclaimer_obrigatorio", e.target.checked)} />
              <span>{DISCLAIMER_PADRAO}</span>
            </label>

            <Bloqueios lista={bloqE} />
            <button
              disabled={mEncontro.isPending}
              onClick={() => mEncontro.mutate()}
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
            >
              Registrar encontro
            </button>
          </section>
          </CaCard>

          <CaCard titulo="Encontros do caso" eyebrow="Encontros · lista">
          <section className="space-y-3">
            {!q.isLoading && !q.isError && (q.data?.encontros ?? []).length === 0 ? (
              <EstadoVazio mensagem="Nenhum encontro registrado." />
            ) : (
              (q.data?.encontros ?? []).map((e) => {
                const proj = projetarEncontroParaCliente(e);
                return (
                  <article key={String(e["id"])} className="space-y-1 rounded-xl border border-navy/10 bg-cream/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-navy">{String(e["title_internal"])}</h3>
                      <Etiqueta
                        texto={rotulo(APROVACOES, e["approval_status"])}
                        tom={TOM_APROVACAO[String(e["approval_status"])] ?? "neutro"}
                      />
                    </div>
                    <p className="text-xs text-navy/60">
                      {rotulo(TIPOS_ENCONTRO, e["encounter_type"])} · confiança {rotulo(CONFIANCAS, e["confidence_internal"])} ·{" "}
                      {rotulo(STATUS_VALIDACAO, e["validation_status"])}
                    </p>
                    <div className="rounded-lg border border-navy/10 bg-navy/5 p-2 text-xs text-navy/70">
                      {proj ? (
                        <>
                          <p className="font-medium text-navy">Projeção cliente (rascunho): {proj.titulo}</p>
                          <p>{proj.resumo}</p>
                          <p className="mt-1 text-navy/50">{proj.disclaimer}</p>
                        </>
                      ) : (
                        <p>Sem projeção para o cliente: falta aprovação, disclaimer ou resumo sanitizado.</p>
                      )}
                    </div>
                    {e["archived_at"] ? (
                      <p className="text-xs text-navy/50">Arquivado.</p>
                    ) : podeEditar ? (
                      <button
                        onClick={() => mArquivar.mutate({ tabela: "lineage_encounters", id: String(e["id"]) })}
                        className="text-xs text-terracotta hover:underline"
                      >
                        Arquivar
                      </button>
                    ) : null}
                  </article>
                );
              })
            )}
          </section>
          </CaCard>
        </div>
      )}
    </div>
    </SaasShell>
  );
}
