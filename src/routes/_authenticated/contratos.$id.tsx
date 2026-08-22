import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell, useSaas } from "@/components/saas/shell";
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
  salvarItemContrato,
  salvarOrdemServico,
  solicitarRevisaoHumana,
  tentarEtapaExterna,
  visualizarVersaoInterna,
} from "@/lib/contratos.functions";

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

const ABAS = [
  "Resumo",
  "Partes",
  "Escopo",
  "Cláusulas",
  "Anexos",
  "Fontes",
  "Validações",
  "Versões",
  "Revisão",
  "Auditoria",
] as const;

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
  const externa = useServerFn(tentarEtapaExterna);

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

      <div className="mt-4 flex flex-wrap gap-2">
        <Acao onClick={() => mGerar.mutate((d.versoes as any[]).length ? prompt("Resumo das alterações desta versão:") ?? "" : undefined)}>
          Gerar rascunho interno
        </Acao>
        <Acao onClick={() => mValidar.mutate()}>Executar validações</Acao>
        <Acao onClick={() => mSolicitar.mutate()}>Solicitar revisão humana</Acao>
        <Acao
          onClick={async () => {
            const r = await externa({ data: { contract_id: id, etapa: "envio" } });
            setAviso(r.mensagem);
          }}
        >
          Enviar ao cliente (desabilitado)
        </Acao>
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

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-navy/10">
        {ABAS.map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`rounded-t-lg px-3 py-2 text-sm ${aba === a ? "bg-white font-medium text-navy" : "text-navy/60 hover:text-navy"}`}
          >
            {a}
          </button>
        ))}
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
        {aba === "Auditoria" ? <Auditoria dados={d} /> : null}
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

function Partes({ dados, contratoId, onSalvo }: { dados: any; contratoId: string; onSalvo: () => void }) {
  const { erro, salvar, arquivar } = useSalvarItem(contratoId, "contract_parties", onSalvo);
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState("contracting_client");
  return (
    <div className="space-y-4">
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <Tabela cabecalho={["Nome", "Papel", "Capacidade", "Assinatura", "Ações"]}>
        {(dados.partes as any[]).map((p) => (
          <tr key={p.id} className={`border-t border-navy/10 ${p.archived_at ? "opacity-50" : ""}`}>
            <td className="px-3 py-2">{p.person_name}</td>
            <td className="px-3 py-2">{ROTULO_PAPEL_PARTE[p.role] ?? p.role}</td>
            <td className="px-3 py-2">{p.legal_capacity_status}</td>
            <td className="px-3 py-2">{p.signature_required ? "requerida" : "não requerida"}</td>
            <td className="px-3 py-2 text-right">
              {!p.archived_at ? (
                <button onClick={() => arquivar(p.id)} className="text-xs text-navy/60 underline">
                  Arquivar
                </button>
              ) : (
                <span className="text-xs text-navy/50">arquivada</span>
              )}
            </td>
          </tr>
        ))}
      </Tabela>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          salvar({ person_name: nome, role: papel });
          setNome("");
        }}
      >
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da parte"
          className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
        />
        <select value={papel} onChange={(e) => setPapel(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {Object.entries(ROTULO_PAPEL_PARTE).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">Adicionar parte</button>
      </form>
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
          salvar(form);
        }}
      >
        <input required placeholder="Código da cláusula" value={form.clause_code} onChange={(e) => set("clause_code", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <input required placeholder="Título da cláusula" value={form.clause_title} onChange={(e) => set("clause_title", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
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
        <textarea placeholder="Texto proposto da cláusula" value={form.clause_text} onChange={(e) => set("clause_text", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm sm:col-span-2" />
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream sm:col-span-2">Registrar cláusula</button>
      </form>
      <p className="text-xs text-navy/60">
        Silêncio nunca altera o contrato-base. Substituição exige cláusula-base, justificativa, precedência e revisão humana.
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
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          salvar(form);
          setForm({ annex_code: "", title: "", annex_type: "scope", required_for_contract: true });
        }}
      >
        <input required placeholder="Código" value={form.annex_code} onChange={(e) => setForm({ ...form, annex_code: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <input required placeholder="Título do anexo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <select value={form.annex_type} onChange={(e) => setForm({ ...form, annex_type: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {Object.entries(ROTULO_TIPO_ANEXO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.required_for_contract} onChange={(e) => setForm({ ...form, required_for_contract: e.target.checked })} />
          obrigatório
        </label>
        <button className="rounded-lg bg-navy px-3 py-2 text-sm text-cream">Adicionar anexo</button>
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

function Validacoes({ dados }: { dados: any }) {
  const lista = dados.validacoes as any[];
  if (!lista.length) return <p className="text-sm text-navy/60">Nenhuma validação executada ainda.</p>;
  return (
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
  );
}

function Versoes({ dados, contratoId }: { dados: any; contratoId: string }) {
  const baixar = useServerFn(baixarVersaoInterna);
  const visualizar = useServerFn(visualizarVersaoInterna);
  const [erro, setErro] = useState<string | null>(null);
  const [previa, setPrevia] = useState<{ html: string; versao: number; rascunho: boolean } | null>(null);
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
                      setPrevia({ html: r.html, versao: r.versao, rascunho: r.rascunho });
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

function Auditoria({ dados }: { dados: any }) {
  return (
    <Tabela cabecalho={["Quando", "Evento", "Metadados mínimos"]}>
      {(dados.eventos as any[]).map((e) => (
        <tr key={e.id} className="border-t border-navy/10">
          <td className="px-3 py-2 text-xs">{new Date(e.occurred_at).toLocaleString("pt-BR")}</td>
          <td className="px-3 py-2">{e.event_type}</td>
          <td className="px-3 py-2 text-xs text-navy/60">{JSON.stringify(e.metadata)}</td>
        </tr>
      ))}
    </Tabela>
  );
}
