import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { montarChecklistJuridico } from "@/lib/checklist-juridico";
import {
  AvisoInstrumento,
  ROTULO_CATEGORIA_ESCOPO,
  ROTULO_PAPEL_PARTE,
  ROTULO_STATUS_ANEXO,
  ROTULO_STATUS_CONTRATO,
  ROTULO_STATUS_VERSAO,
  ROTULO_TIPO_ANEXO,
  ROTULO_TIPO_INSTRUMENTO,
  Selo,
} from "@/components/contratos/rotulos";
import {
  aprovarParaEnvio,
  arquivarContrato,
  arquivarItemContrato,
  atualizarContrato,
  baixarVersaoInterna,
  criarExcecao,
  executarValidacoes,
  gerarRascunhoInterno,
  obterContrato,
  registrarDecisaoRevisao,
  ressincronizarContratanteDaMatriz,
  salvarItemContrato,
  salvarOrdemServico,
  solicitarRevisaoHumana,
  visualizarVersaoInterna,
} from "@/lib/contratos.functions";
import { salvarTarefa } from "@/lib/ops.functions";

export const Route = createFileRoute("/_authenticated/contratos/$id")({
  head: () => ({
    meta: [
      { title: "Instrumento contratual — Clube Ancestral" },
      {
        name: "description",
        content: "Detalhe interno de instrumento contratual: partes, escopo, cláusulas, anexos, versões e validações.",
      },
      { property: "og:title", content: "Instrumento contratual — Clube Ancestral" },
      { property: "og:description", content: "Preparação e revisão humana de instrumentos contratuais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContratoDetalhe,
});

const ABAS_PRINCIPAIS = ["Resumo", "Partes", "Escopo", "Cláusulas", "Anexos", "Versões", "Revisão"] as const;
const ABAS_AVANCADAS = ["Fontes", "Validações"] as const;
const ABAS = [...ABAS_PRINCIPAIS, ...ABAS_AVANCADAS] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */

function ContratoDetalhe() {
  const { id } = Route.useParams();
  const { ehAdmin } = useSaas();
  const obter = useServerFn(obterContrato);
  const q = useQuery({ queryKey: ["contrato", id], queryFn: () => obter({ data: { id } }) });
  const [aba, setAba] = useState<(typeof ABAS)[number]>("Resumo");
  const [aviso, setAviso] = useState<string | null>(null);

  const recarregar = () => q.refetch();

  const gerar = useServerFn(gerarRascunhoInterno);
  const validar = useServerFn(executarValidacoes);
  const solicitar = useServerFn(solicitarRevisaoHumana);
  const arquivar = useServerFn(arquivarContrato);

  const mGerar = useMutation({
    mutationFn: (resumo?: string) => gerar({ data: { contract_id: id, change_summary: resumo } }),
    onSuccess: (r) =>
      setAviso(
        r.falhaRenderizacao
          ? `Versão ${r.versao} criada, mas a renderização falhou e foi registrada. A versão não está pronta.`
          : `Versão ${r.versao} gerada como rascunho interno.`,
      ),
    onError: (e: Error) => setAviso(e.message),
  });
  const mValidar = useMutation({
    mutationFn: () => validar({ data: { contract_id: id } }),
    onSuccess: (r) => setAviso(`${r.abertas} pendência(s), sendo ${r.bloqueios} bloqueante(s).`),
    onError: (e: Error) => setAviso(e.message),
  });
  const mSolicitar = useMutation({
    mutationFn: () => solicitar({ data: { contract_id: id } }),
    onSuccess: (r) =>
      setAviso(r.ok ? "Revisão humana solicitada." : `Bloqueado: ${r.bloqueios.join("; ")}`),
    onError: (e: Error) => setAviso(e.message),
  });
  const criarTarefaFn = useServerFn(salvarTarefa);
  const mTarefa = useMutation({
    mutationFn: (v: { titulo: string; caso_id: string | null }) =>
      criarTarefaFn({ data: { valores: { titulo: v.titulo, caso_id: v.caso_id, tipo: "contrato", status: "nao_iniciada", prioridade: "media" } } }),
    onSuccess: () => setAviso("Tarefa criada."),
    onError: (e: Error) => setAviso(e.message),
  });

  if (q.isLoading) return <SaasShell titulo="Instrumento contratual">Carregando…</SaasShell>;
  if (q.isError || !q.data)
    return (
      <SaasShell titulo="Instrumento contratual">
        <p className="text-sm text-terracotta">Instrumento indisponível nesta organização.</p>
      </SaasShell>
    );

  const d = q.data;
  const c = d.contrato as any;
  const versaoAtual = (d.versoes as any[])[0] ?? null;

  return (
    <SaasShell
      titulo={c.title}
      descricao={`${c.contract_number} · ${ROTULO_TIPO_INSTRUMENTO[c.contract_type]} · ${ROTULO_STATUS_CONTRATO[c.status]}`}
      acoes={
        <Link to="/contratos" className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          Voltar
        </Link>
      }
    >
      <AvisoInstrumento tipo={c.contract_type} status={c.status} />

      {d.contratoBase ? (
        <p className="mt-3 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm">
          Contrato-base vinculado: <strong>{(d.contratoBase as any).contract_number}</strong> —{" "}
          {(d.contratoBase as any).title}. Permanece íntegro e em leitura.
        </p>
      ) : null}

      {aviso ? (
        <p className="mt-3 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-navy">{aviso}</p>
      ) : null}

      <p className="mt-3 text-xs text-navy/50">
        Envio ao cliente, assinatura e cobrança seguem desabilitados nesta fase — não há fluxo de convite/revisão
        externa configurado ainda. Use "Solicitar revisão humana" para o acompanhamento interno.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Acao onClick={() => mGerar.mutate((d.versoes as any[]).length ? prompt("Resumo das alterações desta versão:") ?? "" : undefined)}>
          Salvar rascunho
        </Acao>
        <Acao
          onClick={() => {
            const titulo = prompt("Título da tarefa:");
            if (!titulo?.trim()) return;
            mTarefa.mutate({ titulo: titulo.trim(), caso_id: (c.case_id as string | null) ?? null });
          }}
        >
          Criar tarefa
        </Acao>
        <Acao onClick={() => mSolicitar.mutate()}>Solicitar revisão humana</Acao>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Acao onClick={() => mValidar.mutate()}>Executar validações</Acao>
        {ehAdmin ? (
          <Acao
            onClick={async () => {
              const motivo = prompt("Motivo do arquivamento:");
              if (!motivo) return;
              await arquivar({ data: { contract_id: id, motivo } });
              setAviso("Instrumento arquivado. Nenhum dado foi excluído.");
              recarregar();
            }}
          >
            Arquivar
          </Acao>
        ) : null}
      </div>

      <nav className="mt-6 flex flex-wrap items-center gap-1 overflow-x-auto border-b border-navy/10">
        {ABAS_PRINCIPAIS.map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`shrink-0 rounded-t-lg px-3 py-2 text-sm ${aba === a ? "bg-white font-medium text-navy" : "text-navy/60 hover:text-navy"}`}
          >
            {a}
          </button>
        ))}
        <details className="relative ml-auto shrink-0">
          <summary className="cursor-pointer list-none rounded-t-lg px-3 py-2 text-sm text-navy/50 hover:text-navy/70">
            Mais opções ▾
          </summary>
          <div className="absolute right-0 z-10 flex flex-col rounded-lg border border-navy/10 bg-white p-1 shadow-lg">
            {ABAS_AVANCADAS.map((a) => (
              <button
                key={a}
                onClick={() => setAba(a)}
                className={`rounded-md px-3 py-2 text-left text-sm ${aba === a ? "bg-navy/5 font-medium text-navy" : "text-navy/60 hover:bg-navy/5"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </details>
      </nav>

      <div className="rounded-b-xl rounded-tr-xl border border-navy/10 bg-white p-4">
        {aba === "Resumo" ? <Resumo dados={d} onSalvo={recarregar} /> : null}
        {aba === "Partes" ? <Partes dados={d} contratoId={id} onSalvo={recarregar} /> : null}
        {aba === "Escopo" ? <Escopo dados={d} contratoId={id} onSalvo={recarregar} /> : null}
        {aba === "Cláusulas" ? <Clausulas dados={d} contratoId={id} onSalvo={recarregar} /> : null}
        {aba === "Anexos" ? <Anexos dados={d} contratoId={id} onSalvo={recarregar} /> : null}
        {aba === "Fontes" ? <Fontes dados={d} contratoId={id} onSalvo={recarregar} /> : null}
        {aba === "Validações" ? <Validacoes dados={d} /> : null}
        {aba === "Versões" ? <Versoes dados={d} contratoId={id} /> : null}
        {aba === "Revisão" ? (
          <Revisao dados={d} contratoId={id} versao={versaoAtual} ehAdmin={ehAdmin} onSalvo={recarregar} setAviso={setAviso} />
        ) : null}
      </div>
    </SaasShell>
  );
}

function Acao({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5">
      {children}
    </button>
  );
}

function Campo({
  rotulo,
  valor,
  onSalvar,
  tipo = "text",
  opcoes,
}: {
  rotulo: string;
  valor: any;
  onSalvar: (v: any) => void;
  tipo?: "text" | "textarea" | "select" | "date" | "check";
  opcoes?: { valor: string; rotulo: string }[];
}) {
  const [v, setV] = useState(valor ?? "");
  const comum = "mt-1 w-full rounded-lg border border-navy/20 px-3 py-2 text-sm";
  return (
    <label className="block text-sm">
      <span className="text-navy/70">{rotulo}</span>
      {tipo === "textarea" ? (
        <textarea value={v} rows={3} onChange={(e) => setV(e.target.value)} onBlur={() => onSalvar(v)} className={comum} />
      ) : tipo === "select" ? (
        <select
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            onSalvar(e.target.value);
          }}
          className={comum}
        >
          {opcoes?.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      ) : tipo === "check" ? (
        <input
          type="checkbox"
          checked={Boolean(v)}
          onChange={(e) => {
            setV(e.target.checked);
            onSalvar(e.target.checked);
          }}
          className="ml-2"
        />
      ) : (
        <input type={tipo} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onSalvar(v)} className={comum} />
      )}
    </label>
  );
}

function Resumo({ dados, onSalvo }: { dados: any; onSalvo: () => void }) {
  const c = dados.contrato;
  const atualizar = useServerFn(atualizarContrato);
  const [erro, setErro] = useState<string | null>(null);
  const salvar = async (patch: Record<string, unknown>) => {
    try {
      await atualizar({ data: { id: c.id, patch } });
      setErro(null);
      onSalvo();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {erro ? <p className="text-sm text-terracotta sm:col-span-2">{erro}</p> : null}
      <Campo rotulo="Título" valor={c.title} onSalvar={(v) => salvar({ title: v })} />
      <Campo rotulo="Responsável pela revisão (usuário)" valor={c.review_owner_user_id} onSalvar={(v) => salvar({ review_owner_user_id: v || null })} />
      <Campo rotulo="Finalidade" tipo="textarea" valor={c.purpose_summary} onSalvar={(v) => salvar({ purpose_summary: v })} />
      <Campo rotulo="Resumo de escopo" tipo="textarea" valor={c.scope_summary} onSalvar={(v) => salvar({ scope_summary: v })} />
      <Campo rotulo="Exclusões" tipo="textarea" valor={c.exclusions_summary} onSalvar={(v) => salvar({ exclusions_summary: v })} />
      <Campo rotulo="Confirmo ausência de exclusões" tipo="check" valor={c.no_exclusions_confirmed} onSalvar={(v) => salvar({ no_exclusions_confirmed: v })} />
      <div className="sm:col-span-2">
        <Campo rotulo="Observações internas" tipo="textarea" valor={c.internal_notes} onSalvar={(v) => salvar({ internal_notes: v })} />
      </div>
      <Campo rotulo="Início da vigência" tipo="date" valor={c.effective_start_date} onSalvar={(v) => salvar({ effective_start_date: v || null })} />
      <Campo rotulo="Regra de vigência" valor={c.effective_rule} onSalvar={(v) => salvar({ effective_rule: v })} />
      <Campo
        rotulo="Tratamento de dados"
        tipo="select"
        valor={c.privacy_terms_status}
        opcoes={[
          { valor: "pending", rotulo: "Pendente" },
          { valor: "defined", rotulo: "Definido" },
          { valor: "not_applicable", rotulo: "Não aplicável" },
        ]}
        onSalvar={(v) => salvar({ privacy_terms_status: v })}
      />
      <Campo
        rotulo="Condição financeira (financeiro/admin)"
        tipo="select"
        valor={c.financial_change_status}
        opcoes={[
          { valor: "pending_review", rotulo: "Pendente de revisão" },
          { valor: "no_change", rotulo: "Sem alteração" },
          { valor: "expressly_changed", rotulo: "Alterada expressamente" },
          { valor: "not_applicable", rotulo: "Não aplicável" },
        ]}
        onSalvar={(v) => salvar({ financial_change_status: v })}
      />
      <Campo
        rotulo="Despesas de terceiros (financeiro/admin)"
        tipo="select"
        valor={c.external_expense_status}
        opcoes={[
          { valor: "not_applicable", rotulo: "Não aplicável" },
          { valor: "pending", rotulo: "Pendente" },
          { valor: "estimated", rotulo: "Estimada" },
          { valor: "approved", rotulo: "Aprovada" },
          { valor: "client_pays_directly", rotulo: "Cliente paga diretamente" },
          { valor: "partially_paid", rotulo: "Parcialmente paga" },
        ]}
        onSalvar={(v) => salvar({ external_expense_status: v })}
      />
      <Campo
        rotulo="Gate financeiro (financeiro/admin)"
        tipo="select"
        valor={c.financial_gate_status}
        opcoes={[
          { valor: "pending_contract", rotulo: "Aguardando contrato" },
          { valor: "pending_confirmation", rotulo: "Aguardando confirmação" },
          { valor: "confirmed", rotulo: "Confirmado" },
          { valor: "blocked", rotulo: "Bloqueado" },
          { valor: "not_applicable", rotulo: "Não aplicável" },
        ]}
        onSalvar={(v) => salvar({ financial_gate_status: v })}
      />
      <p className="text-xs text-navy/60 sm:col-span-2">
        Gate de pesquisa externa: {c.research_gate_status}. Cobrança, assinatura e pesquisa externa exigem gatilhos
        próprios e não são liberadas por rascunho contratual.
      </p>
    </div>
  );
}

function Tabela({ cabecalho, children }: { cabecalho: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
          <tr>
            {cabecalho.map((h) => (
              <th key={h} className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function useSalvarItem(contratoId: string, tabela: any, onSalvo: () => void) {
  const salvar = useServerFn(salvarItemContrato);
  const arquivar = useServerFn(arquivarItemContrato);
  const [erro, setErro] = useState<string | null>(null);
  return {
    erro,
    salvar: async (dados: Record<string, unknown>, id?: string) => {
      try {
        await salvar({ data: { tabela, contract_id: contratoId, id, dados } });
        setErro(null);
        onSalvo();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Falha ao salvar.");
      }
    },
    arquivar: async (id: string) => {
      const motivo = prompt("Motivo do arquivamento:");
      if (!motivo) return;
      try {
        await arquivar({ data: { tabela, contract_id: contratoId, id, motivo } });
        onSalvo();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Falha ao arquivar.");
      }
    },
  };
}

const TIPOS_DOCUMENTO_PARTE = [
  { valor: "", rotulo: "Não informado" },
  { valor: "cpf", rotulo: "CPF" },
  { valor: "cnpj", rotulo: "CNPJ" },
  { valor: "outro", rotulo: "Outro" },
] as const;

function FormularioParte({
  inicial,
  onSalvar,
  onCancelar,
  rotuloSalvar,
}: {
  inicial: { person_name: string; role: string; document_type: string; document_number: string; legal_capacity_status: string; signature_required: boolean };
  onSalvar: (v: typeof inicial) => void;
  onCancelar?: () => void;
  rotuloSalvar: string;
}) {
  const [form, setForm] = useState(inicial);
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      className="grid gap-2 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.person_name.trim()) return;
        onSalvar(form);
      }}
    >
      <input
        required
        value={form.person_name}
        onChange={(e) => set("person_name", e.target.value)}
        placeholder="Nome da parte"
        className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
      />
      <select value={form.role} onChange={(e) => set("role", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
        {Object.entries(ROTULO_PAPEL_PARTE).map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
      <select
        value={form.document_type}
        onChange={(e) => set("document_type", e.target.value)}
        className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
      >
        {TIPOS_DOCUMENTO_PARTE.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.rotulo}
          </option>
        ))}
      </select>
      <input
        value={form.document_number}
        onChange={(e) => set("document_number", e.target.value)}
        placeholder="Número do documento (CPF/CNPJ)"
        className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
      />
      <input
        value={form.legal_capacity_status}
        onChange={(e) => set("legal_capacity_status", e.target.value)}
        placeholder="Capacidade jurídica (opcional)"
        className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-navy/70">
        <input type="checkbox" checked={form.signature_required} onChange={(e) => set("signature_required", e.target.checked)} />
        Assinatura requerida
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">{rotuloSalvar}</button>
        {onCancelar ? (
          <button type="button" onClick={onCancelar} className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy/70">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Partes({ dados, contratoId, onSalvo }: { dados: any; contratoId: string; onSalvo: () => void }) {
  const { erro, salvar, arquivar } = useSalvarItem(contratoId, "contract_parties", onSalvo);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const partes = dados.partes as any[];

  const ressincronizar = useServerFn(ressincronizarContratanteDaMatriz);
  const [avisoSync, setAvisoSync] = useState<string | null>(null);
  const mSync = useMutation({
    mutationFn: () => ressincronizar({ data: { contract_id: contratoId } }),
    onSuccess: (r) => {
      setAvisoSync(r.criado ? "Parte contratante criada a partir da matriz de parâmetros." : "Parte contratante atualizada a partir da matriz de parâmetros.");
      onSalvo();
    },
    onError: (e: Error) => setAvisoSync(e.message),
  });

  const rotuloDocumento = (p: any) => {
    const tipo = TIPOS_DOCUMENTO_PARTE.find((t) => t.valor === p.document_type)?.rotulo ?? p.document_type;
    return p.document_number ? `${tipo ? `${tipo}: ` : ""}${p.document_number}` : "—";
  };

  const salvarEdicao = async (id: string, v: {
    person_name: string;
    role: string;
    document_type: string;
    document_number: string;
    legal_capacity_status: string;
    signature_required: boolean;
  }) => {
    await salvar(
      {
        person_name: v.person_name,
        role: v.role,
        document_type: v.document_type || null,
        document_number: v.document_number || null,
        legal_capacity_status: v.legal_capacity_status || null,
        signature_required: v.signature_required,
      },
      id,
    );
    setEditandoId(null);
  };

  return (
    <div className="space-y-4">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}

      {/* Mobile: cards empilhados — uma tabela horizontal não é operável no celular. */}
      <div className="space-y-2 md:hidden">
        {partes.map((p) =>
          editandoId === p.id ? (
            <div key={p.id} className="rounded-xl border border-gold/50 bg-white p-3">
              <FormularioParte
                inicial={{
                  person_name: p.person_name ?? "",
                  role: p.role,
                  document_type: p.document_type ?? "",
                  document_number: p.document_number ?? "",
                  legal_capacity_status: p.legal_capacity_status ?? "",
                  signature_required: Boolean(p.signature_required),
                }}
                onSalvar={(v) => salvarEdicao(p.id, v)}
                onCancelar={() => setEditandoId(null)}
                rotuloSalvar="Salvar parte"
              />
            </div>
          ) : (
            <div key={p.id} className={`rounded-xl border border-navy/10 bg-cream p-3 text-sm ${p.archived_at ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-navy">{p.person_name}</p>
                {!p.archived_at ? (
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditandoId(p.id)} className="rounded-lg border border-navy/20 px-2 py-1 text-xs text-navy/70">
                      Editar
                    </button>
                    <button onClick={() => arquivar(p.id)} className="rounded-lg border border-navy/20 px-2 py-1 text-xs text-navy/70">
                      Arquivar
                    </button>
                  </div>
                ) : (
                  <span className="shrink-0 text-xs text-navy/50">arquivada</span>
                )}
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-navy/70">
                <div>
                  <dt className="text-navy/50">Papel</dt>
                  <dd>{ROTULO_PAPEL_PARTE[p.role] ?? p.role}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Documento</dt>
                  <dd>{rotuloDocumento(p)}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Capacidade</dt>
                  <dd>{p.legal_capacity_status ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Assinatura</dt>
                  <dd>{p.signature_required ? "requerida" : "não requerida"}</dd>
                </div>
              </dl>
            </div>
          ),
        )}
        {partes.length === 0 ? <p className="text-sm text-navy/60">Nenhuma parte cadastrada.</p> : null}
      </div>

      {/* Desktop/tablet: tabela com scroll horizontal próprio. */}
      <div className="hidden md:block">
        <Tabela cabecalho={["Nome", "Papel", "Documento", "Capacidade", "Assinatura", "Ações"]}>
          {partes.map((p) => (
            <tr key={p.id} className={`border-t border-navy/10 align-top ${p.archived_at ? "opacity-50" : ""}`}>
              {editandoId === p.id ? (
                <td className="px-3 py-2" colSpan={6}>
                  <FormularioParte
                    inicial={{
                      person_name: p.person_name ?? "",
                      role: p.role,
                      document_type: p.document_type ?? "",
                      document_number: p.document_number ?? "",
                      legal_capacity_status: p.legal_capacity_status ?? "",
                      signature_required: Boolean(p.signature_required),
                    }}
                    onSalvar={(v) => salvarEdicao(p.id, v)}
                    onCancelar={() => setEditandoId(null)}
                    rotuloSalvar="Salvar parte"
                  />
                </td>
              ) : (
                <>
                  <td className="px-3 py-2">{p.person_name}</td>
                  <td className="px-3 py-2">{ROTULO_PAPEL_PARTE[p.role] ?? p.role}</td>
                  <td className="px-3 py-2">{rotuloDocumento(p)}</td>
                  <td className="px-3 py-2">{p.legal_capacity_status}</td>
                  <td className="px-3 py-2">{p.signature_required ? "requerida" : "não requerida"}</td>
                  <td className="px-3 py-2 text-right">
                    {!p.archived_at ? (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setEditandoId(p.id)} className="text-xs text-navy/60 underline">
                          Editar
                        </button>
                        <button onClick={() => arquivar(p.id)} className="text-xs text-navy/60 underline">
                          Arquivar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-navy/50">arquivada</span>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </Tabela>
      </div>

      {criando ? (
        <FormularioParte
          inicial={{ person_name: "", role: "contracting_client", document_type: "", document_number: "", legal_capacity_status: "", signature_required: false }}
          onSalvar={async (v) => {
            await salvar({
              person_name: v.person_name,
              role: v.role,
              document_type: v.document_type || null,
              document_number: v.document_number || null,
              legal_capacity_status: v.legal_capacity_status || null,
              signature_required: v.signature_required,
            });
            setCriando(false);
          }}
          onCancelar={() => setCriando(false)}
          rotuloSalvar="Adicionar parte"
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setCriando(true)} className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">
            Adicionar parte
          </button>
          <button
            onClick={() => mSync.mutate()}
            disabled={mSync.isPending}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-50"
          >
            {mSync.isPending ? "Ressincronizando…" : "Ressincronizar contratante da matriz"}
          </button>
        </div>
      )}
      {avisoSync ? <p className="text-xs text-navy">{avisoSync}</p> : null}
      <p className="text-xs text-navy/60">
        "Ressincronizar contratante da matriz" busca nome, documento e endereço da contratante na tela de Parâmetros do
        contrato (o motor) e atualiza a parte "Contratante" deste instrumento — a cópia automática só acontece uma vez, na
        criação do instrumento; edições feitas depois na matriz de parâmetros não chegam aqui sozinhas.
      </p>
      <p className="text-xs text-navy/60">
        Documento, endereço e telefone das partes são restritos: não vão ao portal do cliente, a exports padrão nem a logs.
      </p>
    </div>
  );
}

function Escopo({ dados, contratoId, onSalvo }: { dados: any; contratoId: string; onSalvo: () => void }) {
  const { erro, salvar, arquivar } = useSalvarItem(contratoId, "contract_scope_items", onSalvo);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("contracted_scope");
  const [status, setStatus] = useState("included");
  return (
    <div className="space-y-4">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <Tabela cabecalho={["Item", "Categoria", "Status", "Origem", "Ações"]}>
        {(dados.escopo as any[]).map((s) => (
          <tr key={s.id} className={`border-t border-navy/10 ${s.archived_at ? "opacity-50" : ""}`}>
            <td className="px-3 py-2">{s.title}</td>
            <td className="px-3 py-2">{ROTULO_CATEGORIA_ESCOPO[s.category] ?? s.category}</td>
            <td className="px-3 py-2">{s.status}</td>
            <td className="px-3 py-2">{s.source_type}</td>
            <td className="px-3 py-2 text-right">
              {!s.archived_at ? (
                <button onClick={() => arquivar(s.id)} className="text-xs text-navy/60 underline">
                  Arquivar
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </Tabela>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!titulo.trim()) return;
          salvar({ title: titulo, category: categoria, status });
          setTitulo("");
        }}
      >
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Item de escopo" className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {Object.entries(ROTULO_CATEGORIA_ESCOPO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {["included", "excluded", "pending", "conditional", "not_applicable"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">Adicionar item</button>
      </form>
    </div>
  );
}

function Clausulas({ dados, contratoId, onSalvo }: { dados: any; contratoId: string; onSalvo: () => void }) {
  const { erro, salvar } = useSalvarItem(contratoId, "contract_clause_overrides", onSalvo);
  const [form, setForm] = useState({
    clause_code: "",
    clause_title: "",
    action: "specify",
    base_contract_clause_reference: "",
    change_reason: "",
    precedence_statement: "",
    clause_text: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <Tabela cabecalho={["Cláusula", "Ação", "Cláusula-base", "Precedência"]}>
        {(dados.clausulas as any[]).map((c) => (
          <tr key={c.id} className="border-t border-navy/10 align-top">
            <td className="px-3 py-2">
              <strong>{c.clause_code}</strong> — {c.clause_title}
            </td>
            <td className="px-3 py-2">{c.action}</td>
            <td className="px-3 py-2">{c.base_contract_clause_reference ?? "—"}</td>
            <td className="px-3 py-2 text-navy/70">{c.precedence_statement ?? "—"}</td>
          </tr>
        ))}
      </Tabela>
      <form
        className="grid gap-2 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          salvar({ ...form, clause_code: form.clause_code.trim() || `CL-${Date.now().toString(36).toUpperCase()}` });
        }}
      >
        <input required placeholder="Título da cláusula" value={form.clause_title} onChange={(e) => set("clause_title", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm sm:col-span-2" />
        <textarea placeholder="Texto da cláusula" value={form.clause_text} onChange={(e) => set("clause_text", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm sm:col-span-2" />
        <details className="sm:col-span-2">
          <summary className="cursor-pointer text-xs text-navy/50 hover:text-navy/70">Detalhes avançados (opcional)</summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input placeholder="Código da cláusula (gerado automaticamente se vazio)" value={form.clause_code} onChange={(e) => set("clause_code", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
            <select value={form.action} onChange={(e) => set("action", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
              <option value="retain">Manter (retain)</option>
              <option value="specify">Especificar (specify)</option>
              <option value="replace">Substituir (replace)</option>
              <option value="add">Acrescentar (add)</option>
              <option value="remove_not_permitted">Não reproduzida (registro)</option>
            </select>
            <input placeholder="Referência da cláusula-base" value={form.base_contract_clause_reference} onChange={(e) => set("base_contract_clause_reference", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
            <input placeholder="Justificativa da alteração" value={form.change_reason} onChange={(e) => set("change_reason", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
            <input placeholder="Declaração de precedência" value={form.precedence_statement} onChange={(e) => set("precedence_statement", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
          </div>
        </details>
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream sm:col-span-2">Salvar cláusula</button>
      </form>
      <p className="text-xs text-navy/60">
        Só título e texto são obrigatórios para salvar um rascunho. Código, cláusula-base, justificativa e precedência
        ficam em "Detalhes avançados" e continuam recomendados antes de uma substituição ir para revisão humana.
      </p>
    </div>
  );
}

function Anexos({ dados, contratoId, onSalvo }: { dados: any; contratoId: string; onSalvo: () => void }) {
  const { erro, salvar } = useSalvarItem(contratoId, "contract_annexes", onSalvo);
  const [form, setForm] = useState({ annex_code: "", title: "", annex_type: "scope", required_for_contract: true });
  return (
    <div className="space-y-4">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <Tabela cabecalho={["Código", "Anexo", "Tipo", "Obrigatório", "Status"]}>
        {(dados.anexos as any[]).map((a) => (
          <tr key={a.id} className="border-t border-navy/10">
            <td className="px-3 py-2 font-mono text-xs">{a.annex_code}</td>
            <td className="px-3 py-2">{a.title}</td>
            <td className="px-3 py-2">{ROTULO_TIPO_ANEXO[a.annex_type] ?? a.annex_type}</td>
            <td className="px-3 py-2">{a.required_for_contract ? "sim" : "não"}</td>
            <td className="px-3 py-2">
              <select
                value={a.status}
                onChange={(e) => {
                  const status = e.target.value;
                  const motivo = status === "not_applicable" ? prompt("Motivo da não aplicabilidade:") ?? "" : undefined;
                  salvar({ status, ...(motivo !== undefined ? { reason_not_applicable: motivo } : {}) }, a.id);
                }}
                className="rounded-lg border border-navy/20 px-2 py-1 text-xs"
              >
                {Object.entries(ROTULO_STATUS_ANEXO)
                  .filter(([v]) => v !== "signed_with_contract")
                  .map(([v, r]) => (
                    <option key={v} value={v}>
                      {r}
                    </option>
                  ))}
              </select>
            </td>
          </tr>
        ))}
      </Tabela>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          salvar({ ...form, annex_code: form.annex_code.trim() || `ANEXO-${Date.now().toString(36).toUpperCase()}` });
          setForm({ annex_code: "", title: "", annex_type: "scope", required_for_contract: true });
        }}
      >
        <input required placeholder="Título do anexo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <select value={form.annex_type} onChange={(e) => setForm({ ...form, annex_type: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {Object.entries(ROTULO_TIPO_ANEXO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">Adicionar anexo</button>
        <details className="w-full">
          <summary className="cursor-pointer text-xs text-navy/50 hover:text-navy/70">Detalhes avançados (opcional)</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input placeholder="Código interno (gerado automaticamente se vazio)" value={form.annex_code} onChange={(e) => setForm({ ...form, annex_code: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.required_for_contract} onChange={(e) => setForm({ ...form, required_for_contract: e.target.checked })} />
              obrigatório
            </label>
          </div>
        </details>
      </form>
    </div>
  );
}

function Fontes({ dados, contratoId, onSalvo }: { dados: any; contratoId: string; onSalvo: () => void }) {
  const { erro, salvar } = useSalvarItem(contratoId, "contract_source_links", onSalvo);
  const [ref, setRef] = useState("");
  const [tipo, setTipo] = useState("proposal");
  return (
    <div className="space-y-4">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <Tabela cabecalho={["Origem", "Referência", "Acesso", "Verificada"]}>
        {(dados.fontes as any[]).map((f) => (
          <tr key={f.id} className="border-t border-navy/10">
            <td className="px-3 py-2">{f.source_type}</td>
            <td className="px-3 py-2">{f.source_reference}</td>
            <td className="px-3 py-2">{f.access_level}</td>
            <td className="px-3 py-2">
              <button onClick={() => salvar({ verified: !f.verified }, f.id)} className="text-xs underline">
                {f.verified ? "verificada" : "marcar verificada"}
              </button>
            </td>
          </tr>
        ))}
      </Tabela>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ref.trim()) return;
          salvar({ source_reference: ref, source_type: tipo });
          setRef("");
        }}
      >
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {["proposal", "case", "client", "dossie", "checklist", "prior_contract", "external_authorization", "other"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Referência segura da fonte" className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">Vincular fonte</button>
      </form>
      <p className="text-xs text-navy/60">Somente referência e vínculo. Conteúdo integral de fontes externas não é copiado.</p>
    </div>
  );
}

function ChecklistJuridico({ dados }: { dados: any }) {
  const r = montarChecklistJuridico({
    contrato: dados.contrato,
    partes: dados.partes,
    escopo: dados.escopo,
    clausulas: dados.clausulas,
    anexos: dados.anexos,
    versoes: dados.versoes,
  });
  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-semibold text-navy">Checklist jurídico automático</h3>
        <Selo
          texto={r.aptoParaRevisaoHumana ? "sem bloqueios formais" : `${r.bloqueios} bloqueio(s)`}
          tom={r.aptoParaRevisaoHumana ? "ok" : "alerta"}
        />
        <span className="text-xs text-navy/60">
          {r.conformes} de {r.total} conformes · {r.pendentes} pendência(s) não bloqueante(s)
        </span>
      </header>
      <p className="text-xs text-navy/60">
        Conferência formal do instrumento, derivada dos dados já cadastrados. Não altera dados, não emite juízo sobre o mérito do
        caso e não executa nenhuma ação externa.
      </p>
      <Tabela cabecalho={["Grupo", "Item", "Situação", "Observação"]}>
        {r.itens.map((i) => (
          <tr key={i.chave} className="border-t border-navy/10 align-top">
            <td className="px-3 py-2 text-xs text-navy/60">{i.grupo}</td>
            <td className="px-3 py-2">{i.label}</td>
            <td className="px-3 py-2">
              <Selo
                texto={i.estado === "ok" ? "conforme" : i.estado === "bloqueio" ? "bloqueio" : "pendente"}
                tom={i.estado === "ok" ? "ok" : "alerta"}
              />
            </td>
            <td className="px-3 py-2 text-navy/70">{i.detalhe}</td>
          </tr>
        ))}
      </Tabela>
    </section>
  );
}

function Validacoes({ dados }: { dados: any }) {
  const lista = dados.validacoes as any[];
  return (
    <div className="space-y-6">
      <ChecklistJuridico dados={dados} />
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-navy">Validações registradas</h3>
        {lista.length ? (
          <Tabela cabecalho={["Validação", "Severidade", "Situação"]}>
            {lista.map((v) => (
              <tr key={v.id} className="border-t border-navy/10">
                <td className="px-3 py-2">{v.label}</td>
                <td className="px-3 py-2">{v.severity}</td>
                <td className="px-3 py-2">
                  <Selo texto={v.status} tom={v.status === "open" ? "alerta" : "ok"} />
                </td>
              </tr>
            ))}
          </Tabela>
        ) : (
          <p className="text-sm text-navy/60">Nenhuma validação executada ainda.</p>
        )}
      </section>
    </div>
  );
}

function Versoes({ dados, contratoId }: { dados: any; contratoId: string }) {
  const baixar = useServerFn(baixarVersaoInterna);
  const visualizar = useServerFn(visualizarVersaoInterna);
  const [erro, setErro] = useState<string | null>(null);
  const [previa, setPrevia] = useState<{
    html: string;
    versao: number;
    rascunho: boolean;
    perfil: { versao: string | null; status: string | null; capturadoEm: string | null } | null;
  } | null>(null);
  return (
    <div className="space-y-3">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <Tabela cabecalho={["Versão", "Status", "Alterações", "Arquivo privado", "Ações"]}>
        {(dados.versoes as any[]).map((v) => (
          <tr key={v.id} className="border-t border-navy/10 align-top">
            <td className="px-3 py-2">v{v.version_number}</td>
            <td className="px-3 py-2">{ROTULO_STATUS_VERSAO[v.status] ?? v.status}</td>
            <td className="px-3 py-2 text-navy/70">{v.change_summary ?? "—"}</td>
            <td className="px-3 py-2 text-xs text-navy/60">
              {v.rendered_file_hash ? `hash ${String(v.rendered_file_hash).slice(0, 12)}…` : v.render_error ? "falha de renderização" : "—"}
            </td>
            <td className="px-3 py-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    try {
                      setErro(null);
                      const r = await visualizar({ data: { contract_id: contratoId, version_id: v.id } });
                      setPrevia({
                        html: r.html,
                        versao: r.versao,
                        rascunho: r.rascunho,
                        perfil: r.perfilInstitucional
                          ? {
                              versao: r.perfilInstitucional.versao,
                              status: r.perfilInstitucional.status,
                              capturadoEm: r.perfilInstitucional.capturadoEm,
                            }
                          : null,
                      });
                    } catch (e) {
                      setErro(e instanceof Error ? e.message : "Falha ao abrir a prévia.");
                    }
                  }}
                  className="text-xs underline"
                >
                  Ver prévia interna
                </button>
                {v.rendered_file_path ? (
                <button
                  onClick={async () => {
                    try {
                      const r = await baixar({ data: { contract_id: contratoId, version_id: v.id } });
                      window.open(r.url, "_blank", "noopener");
                    } catch (e) {
                      setErro(e instanceof Error ? e.message : "Falha ao abrir arquivo.");
                    }
                  }}
                  className="text-xs underline"
                >
                  Baixar arquivo
                </button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </Tabela>
      {previa ? (
        <section className="overflow-hidden rounded-lg border border-navy/15 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/10 bg-cream/60 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-navy">Prévia interna · versão {previa.versao}</p>
              <p className="text-xs text-terracotta">
                {previa.rascunho ? "RASCUNHO INTERNO — campos pendentes permanecem sinalizados" : "Versão aprovada para preparação interna"}
              </p>
              <p className="text-xs text-navy/60">
                {previa.perfil
                  ? `Perfil institucional ${previa.perfil.versao ?? "—"} · ${
                      previa.perfil.status === "vigente" ? "vigente" : "em revisão jurídica (não assinável)"
                    }`
                  : "Perfil institucional não snapshotado nesta versão."}
              </p>
            </div>
            <button onClick={() => setPrevia(null)} className="text-xs text-navy/70 underline">
              Fechar prévia
            </button>
          </div>
          <iframe
            title={`Prévia interna da versão ${previa.versao}`}
            srcDoc={previa.html}
            sandbox=""
            className="h-[65vh] min-h-[480px] w-full bg-white"
          />
        </section>
      ) : null}
      <p className="text-xs text-navy/60">
        A prévia interna permanece disponível mesmo com pendências e não envia, assina ou publica o documento. Arquivos ficam em
        armazenamento privado por organização e versão, sem URL pública. Versão congelada não é editada: gere uma nova versão de trabalho.
      </p>
    </div>
  );
}

function Revisao({
  dados,
  contratoId,
  versao,
  ehAdmin,
  onSalvo,
  setAviso,
}: {
  dados: any;
  contratoId: string;
  versao: any;
  ehAdmin: boolean;
  onSalvo: () => void;
  setAviso: (v: string) => void;
}) {
  const decidir = useServerFn(registrarDecisaoRevisao);
  const aprovar = useServerFn(aprovarParaEnvio);
  const excecao = useServerFn(criarExcecao);
  const os = useServerFn(salvarOrdemServico);

  if (!versao) return <p className="text-sm text-navy/60">Gere uma versão de trabalho antes da revisão.</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm">
          Versão em revisão: <strong>v{versao.version_number}</strong> · decisão atual: {versao.review_decision}
        </p>
        {ehAdmin ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {(["approved", "changes_requested", "rejected"] as const).map((d) => (
              <button
                key={d}
                onClick={async () => {
                  const notas = prompt("Notas de revisão (opcional):") ?? "";
                  await decidir({ data: { contract_id: contratoId, version_id: versao.id, decisao: d, notas } });
                  setAviso("Decisão de revisão registrada.");
                  onSalvo();
                }}
                className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
              >
                {d === "approved" ? "Aprovar revisão" : d === "changes_requested" ? "Solicitar ajustes" : "Rejeitar"}
              </button>
            ))}
            <button
              onClick={async () => {
                const r = await aprovar({ data: { contract_id: contratoId, version_id: versao.id } });
                setAviso(r.ok ? "Aprovado para envio futuro. Envio segue desabilitado nesta fase." : `Impedimentos: ${r.impedimentos.join("; ")}`);
                onSalvo();
              }}
              className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
            >
              Aprovar para envio (congela versão)
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-navy/60">Somente admin conclui revisão e aprova para envio.</p>
        )}
      </div>

      <div className="rounded-lg border border-navy/10 p-3">
        <h3 className="text-sm font-medium">Ordens de serviço</h3>
        <Tabela cabecalho={["Número", "Status", "Condição de início"]}>
          {(dados.ordens as any[]).map((o) => (
            <tr key={o.id} className="border-t border-navy/10">
              <td className="px-3 py-2 font-mono text-xs">{o.service_order_number}</td>
              <td className="px-3 py-2">{o.status}</td>
              <td className="px-3 py-2">{o.start_condition_status}</td>
            </tr>
          ))}
        </Tabela>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={async () => {
              const r = await os({ data: { contract_id: contratoId, scope_summary: "Execução vinculada ao instrumento." } });
              setAviso(r.mensagem ?? "Ordem de serviço criada.");
              onSalvo();
            }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
          >
            Criar ordem de serviço
          </button>
          {(dados.ordens as any[]).map((o) => (
            <button
              key={o.id}
              onClick={async () => {
                const r = await os({ data: { id: o.id, contract_id: contratoId, status: "active" } });
                setAviso(r.ok ? "Ordem de serviço ativada." : `Ativação bloqueada: ${r.mensagem}`);
                onSalvo();
              }}
              className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
            >
              Tentar ativar {o.service_order_number}
            </button>
          ))}
        </div>
      </div>

      {ehAdmin ? (
        <div className="rounded-lg border border-terracotta/30 p-3">
          <h3 className="text-sm font-medium">Exceções formais</h3>
          <p className="text-xs text-navy/60">Exceção não oculta validação: continua visível no painel de completude.</p>
          <button
            onClick={async () => {
              const reason = prompt("Motivo da exceção:");
              const impact = reason ? prompt("Impacto da exceção:") : null;
              if (!reason || !impact) return;
              await excecao({ data: { contract_id: contratoId, scope: "activation_gate", reason, impact } });
              setAviso("Exceção registrada e auditada.");
              onSalvo();
            }}
            className="mt-2 rounded-lg border border-terracotta/40 px-3 py-2 text-sm text-terracotta"
          >
            Registrar exceção de gate
          </button>
          <ul className="mt-2 space-y-1 text-xs text-navy/70">
            {(dados.excecoes as any[]).map((e) => (
              <li key={e.id}>
                {e.scope} · {e.reason} · {e.expires_at ? `expira em ${new Date(e.expires_at).toLocaleDateString("pt-BR")}` : "sem expiração"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

