import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { CadeiaFormalizacao } from "@/components/contrato/cadeia-formalizacao";
import { EstadoDados } from "@/components/saas/estado-dados";
import { montarChecklistJuridico } from "@/lib/checklist-juridico";
import {
  AvisoInstrumento,
  ROTULO_CATEGORIA_ESCOPO,
  ROTULO_GATE_PESQUISA,
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
import { listarEquipe } from "@/lib/equipe.functions";

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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_os_anexos_previa" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const { id } = Route.useParams();
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
          : r.pendenciasConciliacao?.length
            ? `Versão ${r.versao} gerada como rascunho interno. Pendente para envio (não impede o rascunho): ${r.pendenciasConciliacao.join(" · ")}`
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

  // Pendência do checklist não trava mais botão: vira gate auditado na confirmação.
  const checklist = montarChecklistJuridico({
    contrato: d.contrato as any,
    partes: d.partes as any,
    escopo: d.escopo as any,
    clausulas: d.clausulas as any,
    anexos: d.anexos as any,
    versoes: d.versoes as any,
    valorReferencia: (d as any).valorReferencia,
    prazoReferencia: (d as any).prazoReferencia,
  });
  const pendenciaChecklist = checklist.aptoParaRevisaoHumana
    ? null
    : `${checklist.bloqueios} bloqueio(s) formal(is) no checklist jurídico.`;

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
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <AvisoInstrumento tipo={c.contract_type} status={c.status} />

      {d.contratoBase ? (
        <p className="mt-3 rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm">
          Contrato-base vinculado: <strong>{(d.contratoBase as any).contract_number}</strong> —{" "}
          {(d.contratoBase as any).title}. Permanece íntegro e em leitura.
        </p>
      ) : null}

      {d.parametrosId ? (
        <p className="mt-3 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-navy">
          Este caso já tem parâmetros capturados pelo Planejador (nome, documento, endereço, valor, escopo).{" "}
          <Link
            to="/contrato-parametros/$id"
            params={{ id: d.parametrosId }}
            className="font-medium underline underline-offset-2"
          >
            Ver/editar parâmetros do Planejador
          </Link>
        </p>
      ) : null}

      {aviso ? (
        <p className="mt-3 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-navy">{aviso}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-start gap-2">
        <AcaoOperacional
          rotulo="Gerar rascunho interno"
          capacidade="criar_versao_derivada"
          variant="outline"
          efeito="Cria uma nova versão de trabalho do instrumento. Nada é enviado ao cliente."
          onConfirmar={(motivo) =>
            mGerar.mutate(
              (d.versoes as any[]).length ? motivo || "Nova versão de trabalho." : undefined,
            )
          }
        />
        <AcaoOperacional
          rotulo="Executar validações"
          capacidade="editar_rascunho"
          variant="outline"
          efeito="Recalcula e registra as validações formais deste instrumento."
          onConfirmar={() => mValidar.mutate()}
        />
        <AcaoOperacional
          rotulo="Solicitar revisão humana"
          capacidade="avancar_caso_planejador_tarefa"
          pendenciaGate={pendenciaChecklist}
          variant="outline"
          efeito="Coloca a versão atual na fila de revisão humana."
          onConfirmar={() => mSolicitar.mutate()}
        />
        <AcaoOperacional
          rotulo="Enviar ao cliente"
          acaoExterna="enviar_contrato"
          variant="outline"
          efeito="Tenta a etapa de envio do instrumento ao cliente. Nada sai sem esta confirmação."
          onConfirmar={async () => {
            const r = await externa({ data: { contract_id: id, etapa: "envio" } });
            setAviso(r.mensagem);
          }}
        />
        <AcaoOperacional
          rotulo="Arquivar"
          acaoExterna="excluir_registro_ou_versao"
          variant="outline"
          efeito="Arquiva o instrumento. Nenhum dado é excluído; o registro sai da operação corrente."
          onConfirmar={async (motivo) => {
            await arquivar({ data: { contract_id: id, motivo } });
            setAviso("Instrumento arquivado. Nenhum dado foi excluído.");
            recarregar();
          }}
        />
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
          <Revisao dados={d} contratoId={id} versao={versaoAtual} onSalvo={recarregar} setAviso={setAviso} />
        ) : null}
      </div>
    </SaasShell>
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
  const carregarEquipe = useServerFn(listarEquipe);
  const [erro, setErro] = useState<string | null>(null);
  const equipe = useQuery({ queryKey: ["equipe-revisao"], queryFn: () => carregarEquipe() });
  const salvar = async (patch: Record<string, unknown>) => {
    try {
      await atualizar({ data: { id: c.id, patch } });
      setErro(null);
      onSalvo();
      // 06/09/2026: campo salvava por autosave silencioso (só no blur), sem
      // nenhuma confirmação visível — quem editava não tinha como saber se a
      // gravação persistiu sem recarregar a página manualmente.
      toast.success("Salvo.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
      toast.error("Não foi possível salvar esta alteração.");
    }
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {erro ? <p className="text-sm text-terracotta sm:col-span-2">{erro}</p> : null}
      <Campo rotulo="Título" valor={c.title} onSalvar={(v) => salvar({ title: v })} />
      <EstadoDados
        carregando={equipe.isLoading}
        erro={equipe.error}
        dados={equipe.data?.membros as any[] | undefined}
        aoTentarNovamente={() => void equipe.refetch()}
        recurso="a equipe de revisão"
        vazio="Nenhum membro de equipe cadastrado para assumir a revisão."
      >
        {(membros) => (
          <Campo
            rotulo="Responsável pela revisão (usuário)"
            tipo="select"
            valor={c.review_owner_user_id ?? ""}
            opcoes={[
              { valor: "", rotulo: "Não definido" },
              // 06/09/2026: listarEquipe() vem de staff_access, cuja PK (id) NAO
              // e o auth_user_id real. Usar m.id aqui gravava
              // review_owner_user_id apontando pra uma linha de staff_access, nao
              // pra um usuario/profile real - salvava "com sucesso" um id
              // orfao, sem erro visivel, e sem corresponder a ninguem de verdade.
              ...(membros as any[])
                .filter((m) => m.auth_user_id)
                .map((m) => ({
                  valor: m.auth_user_id as string,
                  rotulo: (m.full_name as string) || (m.email as string),
                })),
            ]}
            onSalvar={(v) => salvar({ review_owner_user_id: v || null })}
          />
        )}
      </EstadoDados>
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
        Gate de pesquisa externa: {ROTULO_GATE_PESQUISA[c.research_gate_status] ?? c.research_gate_status}. Cobrança,
        assinatura e pesquisa externa exigem gatilhos próprios e não são liberadas por rascunho contratual.
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
    arquivar: async (id: string, motivo: string) => {
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
      <EstadoDados
        dados={dados.partes as any[] | undefined}
        aoTentarNovamente={onSalvo}
        recurso="as partes do instrumento"
        vazio="Nenhuma parte cadastrada neste instrumento."
      >
        {(partes) => (
          <Tabela cabecalho={["Nome", "Papel", "Capacidade", "Assinatura", "Ações"]}>
            {(partes as any[]).map((p) => (
              <tr key={p.id} className={`border-t border-navy/10 ${p.archived_at ? "opacity-50" : ""}`}>
                <td className="px-3 py-2">{p.person_name}</td>
                <td className="px-3 py-2">{ROTULO_PAPEL_PARTE[p.role] ?? p.role}</td>
                <td className="px-3 py-2">{p.legal_capacity_status}</td>
                <td className="px-3 py-2">{p.signature_required ? "requerida" : "não requerida"}</td>
                <td className="px-3 py-2 text-right">
                  {!p.archived_at ? (
                    <AcaoOperacional
                      rotulo="Arquivar parte"
                      acaoExterna="excluir_registro_ou_versao"
                      variant="ghost"
                      size="sm"
                      efeito={`Arquiva a parte ${p.person_name}. O registro permanece no histórico.`}
                      onConfirmar={(motivo) => arquivar(p.id, motivo)}
                    >
                      Arquivar
                    </AcaoOperacional>
                  ) : (
                    <span className="text-xs text-navy/50">arquivada</span>
                  )}
                </td>
              </tr>
            ))}
          </Tabela>
        )}
      </EstadoDados>
      <div className="flex flex-wrap items-start gap-2">
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
        <AcaoOperacional
          rotulo="Adicionar parte"
          capacidade="corrigir_pessoas_dependentes_representacao"
          validacaoFormulario={nome.trim() ? null : "Informe o nome da parte antes de adicionar."}
          efeito="Cadastra a parte neste instrumento contratual."
          onConfirmar={async () => {
            if (!nome.trim()) return;
            await salvar({ person_name: nome, role: papel });
            setNome("");
          }}
        />
      </div>
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
      <EstadoDados
        dados={dados.escopo as any[] | undefined}
        aoTentarNovamente={onSalvo}
        recurso="os itens de escopo"
        vazio="Nenhum item de escopo cadastrado neste instrumento."
      >
        {(itens) => (
          <Tabela cabecalho={["Item", "Categoria", "Status", "Origem", "Ações"]}>
            {(itens as any[]).map((s) => (
              <tr key={s.id} className={`border-t border-navy/10 ${s.archived_at ? "opacity-50" : ""}`}>
                <td className="px-3 py-2">{s.title}</td>
                <td className="px-3 py-2">{ROTULO_CATEGORIA_ESCOPO[s.category] ?? s.category}</td>
                <td className="px-3 py-2">{s.status}</td>
                <td className="px-3 py-2">{s.source_type}</td>
                <td className="px-3 py-2 text-right">
                  {!s.archived_at ? (
                    <AcaoOperacional
                      rotulo="Arquivar item de escopo"
                      acaoExterna="excluir_registro_ou_versao"
                      variant="ghost"
                      size="sm"
                      efeito={`Arquiva o item de escopo “${s.title}”. O registro permanece no histórico.`}
                      onConfirmar={(motivo) => arquivar(s.id, motivo)}
                    >
                      Arquivar
                    </AcaoOperacional>
                  ) : null}
                </td>
              </tr>
            ))}
          </Tabela>
        )}
      </EstadoDados>
      <div className="flex flex-wrap items-start gap-2">
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
        <AcaoOperacional
          rotulo="Adicionar item"
          capacidade="corrigir_proposta_escopo_preco"
          validacaoFormulario={titulo.trim() ? null : "Informe o título do item de escopo antes de adicionar."}
          efeito="Cadastra o item de escopo neste instrumento."
          onConfirmar={async () => {
            if (!titulo.trim()) return;
            await salvar({ title: titulo, category: categoria, status });
            setTitulo("");
          }}
        />
      </div>
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
      <EstadoDados
        dados={dados.clausulas as any[] | undefined}
        aoTentarNovamente={onSalvo}
        recurso="as cláusulas"
        vazio="Nenhuma cláusula específica registrada neste instrumento."
      >
        {(clausulas) => (
          <Tabela cabecalho={["Cláusula", "Ação", "Cláusula-base", "Precedência"]}>
            {(clausulas as any[]).map((c) => (
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
        )}
      </EstadoDados>
      <div className="grid gap-2 sm:grid-cols-2">
        <input placeholder="Título da cláusula" value={form.clause_title} onChange={(e) => set("clause_title", e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm sm:col-span-2" />
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
        <div className="sm:col-span-2">
          <AcaoOperacional
            rotulo="Salvar cláusula"
            capacidade="editar_rascunho"
            validacaoFormulario={form.clause_title.trim() ? null : "Informe o título da cláusula antes de salvar."}
            efeito="Grava a cláusula específica no rascunho deste instrumento."
            onConfirmar={async () => {
              if (!form.clause_title.trim()) return;
              await salvar({
                ...form,
                clause_code: form.clause_code.trim() || `CL-${Date.now().toString(36).toUpperCase()}`,
              });
            }}
          />
        </div>
      </div>
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
      <EstadoDados
        dados={dados.anexos as any[] | undefined}
        aoTentarNovamente={onSalvo}
        recurso="os anexos"
        vazio="Nenhum anexo cadastrado neste instrumento."
      >
        {(anexos) => (
          <Tabela cabecalho={["Código", "Anexo", "Tipo", "Obrigatório", "Status"]}>
        {(anexos as any[]).map((a) => (
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
                  salvar({ status }, a.id);
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
        )}
      </EstadoDados>
      <div className="flex flex-wrap items-start gap-2">
        <input placeholder="Título do anexo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <select value={form.annex_type} onChange={(e) => setForm({ ...form, annex_type: e.target.value })} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {Object.entries(ROTULO_TIPO_ANEXO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <AcaoOperacional
          rotulo="Adicionar anexo"
          capacidade="corrigir_os_anexos_previa"
          validacaoFormulario={form.title.trim() ? null : "Informe o título do anexo antes de adicionar."}
          efeito="Cadastra o anexo neste instrumento."
          onConfirmar={async () => {
            if (!form.title.trim()) return;
            await salvar({
              ...form,
              annex_code: form.annex_code.trim() || `ANEXO-${Date.now().toString(36).toUpperCase()}`,
            });
            setForm({ annex_code: "", title: "", annex_type: "scope", required_for_contract: true });
          }}
        />
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
      </div>
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
      <EstadoDados
        dados={dados.fontes as any[] | undefined}
        aoTentarNovamente={onSalvo}
        recurso="as fontes vinculadas"
        vazio="Nenhuma fonte vinculada a este instrumento."
      >
        {(fontes) => (
          <Tabela cabecalho={["Origem", "Referência", "Acesso", "Verificada"]}>
            {(fontes as any[]).map((f) => (
              <tr key={f.id} className="border-t border-navy/10">
                <td className="px-3 py-2">{f.source_type}</td>
                <td className="px-3 py-2">{f.source_reference}</td>
                <td className="px-3 py-2">{f.access_level}</td>
                <td className="px-3 py-2">
                  <AcaoOperacional
                    rotulo={f.verified ? "Desmarcar verificação" : "Marcar verificada"}
                    capacidade="editar_rascunho"
                    variant="ghost"
                    size="sm"
                    efeito="Altera a marcação de fonte verificada neste instrumento."
                    onConfirmar={() => salvar({ verified: !f.verified }, f.id)}
                  >
                    {f.verified ? "verificada" : "marcar verificada"}
                  </AcaoOperacional>
                </td>
              </tr>
            ))}
          </Tabela>
        )}
      </EstadoDados>
      <div className="flex flex-wrap items-start gap-2">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          {["proposal", "case", "client", "dossie", "checklist", "prior_contract", "external_authorization", "other"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Referência segura da fonte" className="rounded-lg border border-navy/20 px-3 py-2 text-sm" />
        <AcaoOperacional
          rotulo="Vincular fonte"
          capacidade="editar_rascunho"
          validacaoFormulario={ref.trim() ? null : "Informe a referência da fonte antes de vincular."}
          efeito="Vincula a referência de fonte ao instrumento. Nenhum conteúdo externo é copiado."
          onConfirmar={async () => {
            if (!ref.trim()) return;
            await salvar({ source_reference: ref, source_type: tipo });
            setRef("");
          }}
        />
      </div>
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
    valorReferencia: dados.valorReferencia,
    prazoReferencia: dados.prazoReferencia,
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
        <EstadoDados
          dados={lista}
          recurso="as validações"
          vazio="Nenhuma validação executada ainda."
        >
          {(itens) => (
            <Tabela cabecalho={["Validação", "Severidade", "Situação"]}>
              {(itens as any[]).map((v) => (
                <tr key={v.id} className="border-t border-navy/10">
                  <td className="px-3 py-2">{v.label}</td>
                  <td className="px-3 py-2">{v.severity}</td>
                  <td className="px-3 py-2">
                    <Selo texto={v.status} tom={v.status === "open" ? "alerta" : "ok"} />
                  </td>
                </tr>
              ))}
            </Tabela>
          )}
        </EstadoDados>
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
      <EstadoDados
        dados={dados.versoes as any[] | undefined}
        recurso="as versões do instrumento"
        vazio="Nenhuma versão gerada ainda. Use “Gerar rascunho interno”."
      >
        {(versoes) => (
      <Tabela cabecalho={["Versão", "Status", "Alterações", "Arquivo privado", "Ações"]}>
        {(versoes as any[]).map((v) => (
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
        )}
      </EstadoDados>
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
  onSalvo,
  setAviso,
}: {
  dados: any;
  contratoId: string;
  versao: any;
  onSalvo: () => void;
  setAviso: (v: string) => void;
}) {
  const decidir = useServerFn(registrarDecisaoRevisao);
  const aprovar = useServerFn(aprovarParaEnvio);
  const excecao = useServerFn(criarExcecao);
  const os = useServerFn(salvarOrdemServico);
  // 06/09/2026: "Aprovar para envio" recusava com "Escopo contratado definido" e
  // "condicao comercial nao persistida a partir da proposta aprovada", mas quem
  // corrige isso (derivar o Anexo I da proposta) so existia na tela do caso
  // (/casos/$caseId/contrato/preparar), sem link nenhum a partir daqui. Trazendo
  // o motor pra dentro da propria aba de Revisao: zero navegacao, um clique.
  const autoridadeAnexo = useAutoridade();
  const podeEscreverAnexo = !autoridadeAnexo.bloqueado({ capacidade: "aprovar_proposta_os_anexo_previa" });

  if (!versao) return <p className="text-sm text-navy/60">Gere uma versão de trabalho antes da revisão.</p>;

  return (
    <div className="space-y-5">
      {dados.contrato?.case_id ? (
        <CadeiaFormalizacao caseId={dados.contrato.case_id} podeEscrever={podeEscreverAnexo} />
      ) : null}
      <div>
        <p className="text-sm">
          Versão em revisão: <strong>v{versao.version_number}</strong> · decisão atual: {versao.review_decision}
        </p>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          {(["approved", "changes_requested", "rejected"] as const).map((d) => (
            <AcaoOperacional
              key={d}
              rotulo={d === "approved" ? "Aprovar revisão" : d === "changes_requested" ? "Solicitar ajustes" : "Rejeitar"}
              capacidade="aprovar_proposta_os_anexo_previa"
              variant="outline"
              efeito={`Registra a decisão de revisão na versão v${versao.version_number}. As notas ficam auditadas.`}
              onConfirmar={async (motivo) => {
                await decidir({
                  data: { contract_id: contratoId, version_id: versao.id, decisao: d, notas: motivo },
                });
                setAviso("Decisão de revisão registrada.");
                onSalvo();
              }}
            />
          ))}
          <AcaoOperacional
            rotulo="Aprovar para envio (congela versão)"
            capacidade="aprovar_proposta_os_anexo_previa"
            efeito="Congela a versão para envio futuro. Nenhum envio ao cliente acontece aqui."
            onConfirmar={async () => {
              const r = await aprovar({ data: { contract_id: contratoId, version_id: versao.id } });
              setAviso(
                r.ok
                  ? "Aprovado para envio futuro. O envio continua sendo uma ação externa confirmada à parte."
                  : `Impedimentos: ${r.impedimentos.join("; ")}`,
              );
              onSalvo();
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-navy/10 p-3">
        <h3 className="text-sm font-medium">Ordens de serviço</h3>
        <EstadoDados
          dados={dados.ordens as any[] | undefined}
          aoTentarNovamente={onSalvo}
          recurso="as ordens de serviço"
          vazio="Nenhuma ordem de serviço vinculada a este instrumento."
        >
          {(ordens) => (
            <>
              <Tabela cabecalho={["Número", "Status", "Condição de início"]}>
                {(ordens as any[]).map((o) => (
                  <tr key={o.id} className="border-t border-navy/10">
                    <td className="px-3 py-2 font-mono text-xs">{o.service_order_number}</td>
                    <td className="px-3 py-2">{o.status}</td>
                    <td className="px-3 py-2">{o.start_condition_status}</td>
                  </tr>
                ))}
              </Tabela>
              <div className="mt-2 flex flex-wrap items-start gap-2">
                {(ordens as any[]).map((o) => (
                  <AcaoOperacional
                    key={o.id}
                    rotulo={`Ativar ${o.service_order_number}`}
                    capacidade="avancar_caso_planejador_tarefa"
                    variant="outline"
                    efeito="Tenta ativar a ordem de serviço. Condições de início continuam visíveis."
                    onConfirmar={async () => {
                      const r = await os({ data: { id: o.id, contract_id: contratoId, status: "active" } });
                      setAviso(r.ok ? "Ordem de serviço ativada." : `Ativação bloqueada: ${r.mensagem}`);
                      onSalvo();
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </EstadoDados>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <AcaoOperacional
            rotulo="Criar ordem de serviço"
            capacidade="corrigir_os_anexos_previa"
            variant="outline"
            efeito="Cria uma ordem de serviço vinculada a este instrumento."
            onConfirmar={async () => {
              const r = await os({
                data: { contract_id: contratoId, scope_summary: "Execução vinculada ao instrumento." },
              });
              setAviso(r.mensagem ?? "Ordem de serviço criada.");
              onSalvo();
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-terracotta/30 p-3">
        <h3 className="text-sm font-medium">Exceções formais</h3>
        <p className="text-xs text-navy/60">Exceção não oculta validação: continua visível no painel de completude.</p>
        <div className="mt-2">
          <AcaoOperacional
            rotulo="Registrar exceção de gate"
            capacidade="resolver_divergencia"
            variant="outline"
            efeito="Registra uma exceção formal ao gate de ativação. O motivo informado fica auditado e a validação continua visível."
            onConfirmar={async (motivo) => {
              await excecao({
                data: {
                  contract_id: contratoId,
                  scope: "activation_gate",
                  reason: motivo,
                  impact: motivo,
                },
              });
              setAviso("Exceção registrada e auditada.");
              onSalvo();
            }}
          />
        </div>
        <EstadoDados
          dados={dados.excecoes as any[] | undefined}
          aoTentarNovamente={onSalvo}
          recurso="as exceções formais"
          vazio="Nenhuma exceção registrada."
        >
          {(excecoes) => (
            <ul className="mt-2 space-y-1 text-xs text-navy/70">
              {(excecoes as any[]).map((e) => (
                <li key={e.id}>
                  {e.scope} · {e.reason} ·{" "}
                  {e.expires_at ? `expira em ${new Date(e.expires_at).toLocaleDateString("pt-BR")}` : "sem expiração"}
                </li>
              ))}
            </ul>
          )}
        </EstadoDados>
      </div>
    </div>
  );
}

