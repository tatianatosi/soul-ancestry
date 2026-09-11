import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Eye, EyeOff, Lock, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";

import { CardIndicador } from "@/components/desk/ui-desk";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import {
  atualizarStatusTicket,
  cancelarSolicitacaoDocumento,
  confirmarDocumentosMinimos,
  criarSolicitacaoDocumento,
  liberarEntregaCliente,
  liberarFaturaCliente,
  painelAtendimento,
  publicarProjecaoApp,
  responderTicketEquipe,
  revisarEnvioCliente,
  ticketInterno,
} from "@/lib/portal-atendimento.functions";
import {
  CATEGORIAS_SOLICITACAO,
  CLASSIFICACAO_ENTREGA_LABEL,
  FINALIDADES_SOLICITACAO,
  STATUS_ENVIO,
  STATUS_SOLICITACAO,
  STATUS_TICKET,
  VISIBILIDADE_ENTREGA_LABEL,
  VISIBILIDADE_FATURA_LABEL,
  bloqueioAtendimento,
  bloqueioFatura,
  estadoCasoAtendimento,
  rotuloPrazo,
  type CasoAtendimento,
} from "@/lib/atendimento";

type Confirmacao = {
  tipo: "entrega" | "fatura";
  liberar: boolean;
  id: string;
  caso: string;
  item: string;
  classificacao: string;
  visibilidade: string;
  responsavel: string;
  versaoAtual?: string | null;
};


/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls = "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm";

function Painel({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-4">
      <h2 className="font-serif text-lg">{titulo}</h2>
      {descricao ? <p className="mt-0.5 text-sm text-navy/60">{descricao}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Selo({ texto, tom = "neutro" }: { texto: string; tom?: "neutro" | "alerta" | "ok" }) {
  const cls =
    tom === "alerta"
      ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
      : tom === "ok"
        ? "border-gold/50 bg-gold/15 text-navy"
        : "border-navy/15 bg-cream text-navy/70";
  return <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{texto}</span>;
}

/**
 * Pendência visível. Não desabilita nada: informa o que falta e segue registrada
 * quando a proprietária decide agir mesmo assim.
 */
function Pendencia({ motivos }: { motivos: string[] }) {
  if (motivos.length === 0) return null;
  return (
    <p className="mt-1 flex items-start gap-1.5 text-xs text-terracotta">
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>Pendência: {motivos.join("; ")}.</span>
    </p>
  );
}

/**
 * Lista vinda da consulta. `null` significa leitura não concluída ou fora de
 * contrato — nunca lista vazia. Substitui o coalescimento para lista vazia que
 * fazia falha de leitura parecer ausência de registro.
 */
function lista<T = any>(valor: unknown): T[] | null {
  return Array.isArray(valor) ? (valor as T[]) : null;
}

export function AtendimentoInterno() {
  const queryClient = useQueryClient();
  const carregar = useServerFn(painelAtendimento);
  const criar = useServerFn(criarSolicitacaoDocumento);
  const cancelar = useServerFn(cancelarSolicitacaoDocumento);
  const revisar = useServerFn(revisarEnvioCliente);
  const liberarDoc = useServerFn(liberarEntregaCliente);
  const liberarFat = useServerFn(liberarFaturaCliente);
  const confirmarDocsMinimos = useServerFn(confirmarDocumentosMinimos);
  const publicarProjecao = useServerFn(publicarProjecaoApp);

  const [casoId, setCasoId] = useState<string>("");
  const [publicacaoTipo, setPublicacaoTipo] = useState<"marco" | "arvore">("marco");
  const [publicacaoTexto, setPublicacaoTexto] = useState("");
  const [form, setForm] = useState({
    titulo: "",
    categoria: "certidao",
    finalidade: "instrucao_processo",
    participante: "",
    responsavelId: "",
    prazo: "",
    descricao: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [ticketAberto, setTicketAberto] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError: falhaLeitura,
    refetch: recarregarLeitura,
  } = useQuery({
    queryKey: ["atendimento", casoId],
    queryFn: () => carregar({ data: casoId ? { casoId } : {} }),
  });

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["atendimento"] });
  }
  function falhar(e: unknown) {
    setErro((e as Error).message);
  }
  function confirmar(mensagem: string) {
    return () => {
      toast.success(mensagem);
      recarregar();
    };
  }

  const casosLidos = lista<CasoAtendimento>(data?.casos);
  const casos = casosLidos ? casosLidos : [];
  const casoPorId = useMemo(() => new Map(casos.map((c) => [c.id, c])), [casos]);
  const bloqueio = (id: string | null) => {
    const c = id ? casoPorId.get(id) : undefined;
    return c ? bloqueioAtendimento(c) : { bloqueado: true, motivos: ["Caso não vinculado"] };
  };
  const nomeCaso = (id: string) => {
    const c = casoPorId.get(id);
    return c ? `${c.codigo ? `${c.codigo} · ` : ""}${c.titulo ?? "Caso"}` : "—";
  };
  const nomePessoa = (id: string | null | undefined) => {
    if (!id) return "sem responsável";
    const equipe = lista(data?.equipe);
    if (!equipe) return "responsável não lido";
    return equipe.find((e: any) => e.auth_user_id === id)?.full_name ?? "responsável interno";
  };

  const participantes = useMemo(() => {
    if (!casoId) return [] as { id: string | null; nome: string }[];
    const caso = casoPorId.get(casoId);
    const clientes = lista(data?.clientes);
    const dependentes = lista(data?.dependentes);
    const titular = clientes ? clientes.find((c: any) => c.id === caso?.cliente_id) : undefined;
    const deps = dependentes
      ? dependentes
          .filter((d: any) => d.case_id === casoId)
          .map((d: any) => ({ id: d.id as string, nome: `${d.nome_completo} (${d.vinculo_com_titular ?? "participante"})` }))
      : [];
    return [
      ...(titular ? [{ id: null, nome: `${titular.nome} (titular)` }] : []),
      ...deps,
    ];
  }, [casoId, casoPorId, data]);

  const bloqueioSelecionado = casoId ? bloqueio(casoId) : null;
  const casoSelecionado = casoId ? casoPorId.get(casoId) : undefined;
  const estadoSelecionado = casoSelecionado ? estadoCasoAtendimento(casoSelecionado) : null;
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [confVersao, setConfVersao] = useState("");
  const [confMotivo, setConfMotivo] = useState("");
  const [confSubstituta, setConfSubstituta] = useState("");

  function abrirConfirmacao(c: Confirmacao) {
    setConfVersao("");
    setConfMotivo("");
    setConfSubstituta("");
    setConfirmacao(c);
  }


  const novaSolicitacao = useMutation({
    mutationFn: () => {
      const p = participantes.find((x) => x.nome === form.participante);
      return criar({
        data: {
          casoId,
          titulo: form.titulo,
          categoria: form.categoria,
          finalidade: form.finalidade,
          participanteNome: form.participante,
          participanteId: p?.id ?? null,
          responsavelId: form.responsavelId,
          prazo: form.prazo,
          descricao: form.descricao,
        },
      });
    },
    onSuccess: () => {
      setForm({ ...form, titulo: "", descricao: "", prazo: "" });
      setErro(null);
      toast.success("Solicitação registrada.");
      recarregar();
    },
    onError: falhar,
  });

  const cancelarSolic = useMutation({
    mutationFn: (p: { solicitacaoId: string; motivo: string }) => cancelar({ data: p }),
    onSuccess: confirmar("Solicitação cancelada."),
    onError: falhar,
  });

  const revisarEnvio = useMutation({
    mutationFn: (p: { documentoId: string; decisao: "aceito" | "recusado"; motivo?: string }) => revisar({ data: p }),
    onSuccess: confirmar("Documento revisado."),
    onError: falhar,
  });

  const alternarEntrega = useMutation({
    mutationFn: (p: {
      documentoId: string;
      liberar: boolean;
      versao?: string;
      responsavelId?: string;
      motivo?: string;
      versaoSubstituta?: string | null;
    }) => liberarDoc({ data: p }),
    onSuccess: confirmar("Liberação do documento atualizada."),
    onError: falhar,
  });

  const alternarFatura = useMutation({
    mutationFn: (p: { faturaId: string; liberar: boolean; motivo?: string }) => liberarFat({ data: p }),
    onSuccess: confirmar("Liberação da fatura atualizada."),
    onError: falhar,
  });

  const confirmarDocumentos = useMutation({
    mutationFn: (p: { caseId: string; motivo?: string }) => confirmarDocsMinimos({ data: p }),
    onSuccess: confirmar("Documentos mínimos confirmados."),
    onError: falhar,
  });

  const publicar = useMutation({
    mutationFn: (p: { caseId: string; tipo: "marco" | "arvore"; conteudo: string }) => publicarProjecao({ data: p }),
    onSuccess: () => {
      setPublicacaoTexto("");
      toast.success("Projeção publicada.");
      recarregar();
    },
    onError: falhar,
  });

  /**
   * Campos obrigatórios do formulário — continua desabilitando, porque sem eles
   * não há o que gravar. A pendência do caso saiu daqui: virou pendência visível
   * no botão.
   */
  const camposFaltando = [
    !casoId ? "caso" : null,
    !form.titulo.trim() ? "documento solicitado" : null,
    !form.participante ? "participante" : null,
    !form.responsavelId ? "responsável interno" : null,
    !form.prazo ? "prazo" : null,
  ].filter((x): x is string => Boolean(x));

  const envios = lista(data?.envios);
  const solicitacoes = lista(data?.solicitacoes);
  const tickets = lista(data?.tickets);
  const faturas = lista(data?.faturas);
  const enviosPendentes = envios ? envios.filter((e: any) => e.status === "pendente_de_revisao").length : null;
  const solicitacoesAbertas = solicitacoes
    ? solicitacoes.filter((s: any) => s.status === "pendente" || s.status === "enviado").length
    : null;
  const ticketsAbertos = tickets
    ? tickets.filter((t: any) => !["resolvido", "fechado"].includes(t.status)).length
    : null;
  const faturasAguardandoLiberacao = faturas ? faturas.filter((f: any) => !f.liberada_cliente).length : null;

  return (
    <div className="space-y-5">
      {falhaLeitura ? (
        <p className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          Não foi possível carregar o atendimento. As listas abaixo estão incompletas — não trate
          como ausência de registro.
          <button
            type="button"
            onClick={() => void recarregarLeitura()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CardIndicador
          rotulo="Envios pendentes de revisão"
          valor={enviosPendentes}
          tom={enviosPendentes ? "atencao" : "sucesso"}
        />
        <CardIndicador
          rotulo="Solicitações abertas"
          valor={solicitacoesAbertas}
          tom={solicitacoesAbertas ? "atencao" : "sucesso"}
        />
        <CardIndicador
          rotulo="Tickets abertos"
          valor={ticketsAbertos}
          tom={ticketsAbertos ? "atencao" : "sucesso"}
        />
        <CardIndicador
          rotulo="Faturas aguardando liberação"
          valor={faturasAguardandoLiberacao}
          tom="neutro"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-navy/60">Caso</label>
          <select value={casoId} onChange={(e) => setCasoId(e.target.value)} className={`${inputCls} max-w-xl`}>
            <option value="">Todos os casos</option>
            {(["apto", "demo", "bloqueado"] as const).map((situacao) => {
              const grupo = casos.filter((c) => estadoCasoAtendimento(c).situacao === situacao);
              if (grupo.length === 0) return null;
              return (
                <optgroup
                  key={situacao}
                  label={
                    situacao === "apto"
                      ? "Aptos ao portal"
                      : situacao === "demo"
                        ? "Demonstração (isolada dos indicadores reais)"
                        : "Bloqueados para conteúdo client-facing"
                  }
                >
                  {grupo.map((c) => {
                    const e = estadoCasoAtendimento(c);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.codigo ? `${c.codigo} · ` : ""}
                        {c.titulo} — {e.rotulo}
                      </option>
                    );
                  })}
                </optgroup>
              );
            })}
          </select>
          {estadoSelecionado ? (
            <Selo
              texto={estadoSelecionado.rotulo}
              tom={estadoSelecionado.situacao === "bloqueado" ? "alerta" : "ok"}
            />
          ) : null}
        </div>
        {bloqueioSelecionado ? <Pendencia motivos={bloqueioSelecionado.motivos} /> : null}
        {casoSelecionado && casoSelecionado.documentos_minimos_ok !== true ? (
          <button
            type="button"
            disabled={confirmarDocumentos.isPending}
            onClick={() => confirmarDocumentos.mutate({ caseId: casoSelecionado.id })}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 disabled:opacity-50"
          >
            {confirmarDocumentos.isPending ? "Confirmando…" : "Confirmar documentos mínimos deste caso"}
          </button>
        ) : null}
        {casoSelecionado ? (
          <div id="publicacao" className="rounded-lg border border-navy/15 bg-cream/40 p-3 scroll-mt-24">
            <p className="text-xs font-medium text-navy">Publicar no App Cliente</p>
            <p className="mt-0.5 text-[11px] text-navy/60">
              Grava uma atualização de Jornada ou um registro de Árvore, aprovado e publicado no mesmo instante — o
              cliente vê ao recarregar. Escreva já em linguagem de cliente, sem termo interno.
            </p>
            <div className="mt-2 flex flex-wrap items-start gap-2">
              <select
                value={publicacaoTipo}
                onChange={(e) => setPublicacaoTipo(e.target.value as "marco" | "arvore")}
                className="rounded border border-navy/20 px-2 py-1.5 text-xs"
              >
                <option value="marco">Jornada (marco)</option>
                <option value="arvore">Árvore da família</option>
              </select>
              <textarea
                value={publicacaoTexto}
                onChange={(e) => setPublicacaoTexto(e.target.value)}
                placeholder={
                  publicacaoTipo === "marco"
                    ? "Ex.: A equipe concluiu a análise da certidão de nascimento e avançou para a próxima etapa."
                    : "Ex.: Confirmado o vínculo entre você e seu bisavô Giuseppe, nascido em 1887 na Itália."
                }
                rows={2}
                className="min-w-[16rem] flex-1 rounded border border-navy/20 px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                disabled={publicar.isPending || !publicacaoTexto.trim()}
                onClick={() => publicar.mutate({ caseId: casoSelecionado.id, tipo: publicacaoTipo, conteudo: publicacaoTexto })}
                className="rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-50"
              >
                {publicar.isPending ? "Publicando…" : "Publicar"}
              </button>
            </div>
            {publicar.isSuccess ? <p className="mt-1 text-[11px] text-navy/60">Publicado.</p> : null}
          </div>
        ) : null}
        <ul className="grid gap-1.5 md:grid-cols-3">
          {casos.map((c) => {
            const e = estadoCasoAtendimento(c);
            return (
              <li
                key={c.id}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  e.situacao === "bloqueado"
                    ? "border-terracotta/30 bg-terracotta/5"
                    : e.situacao === "demo"
                      ? "border-dashed border-gold/50 bg-gold/5"
                      : "border-navy/10 bg-white"
                }`}
              >
                <p className="font-medium text-navy">
                  {c.codigo ? `${c.codigo} · ` : ""}
                  {c.titulo}
                </p>
                <p className="mt-0.5 text-navy/60">{e.rotulo}</p>
                <p className="mt-0.5 text-navy/45">
                  {e.situacao === "bloqueado"
                    ? "Sem solicitação documental, entrega, fatura ou ticket de portal."
                    : e.situacao === "demo"
                      ? "Apenas ambiente demonstrativo."
                      : "Ações client-facing liberadas com confirmação."}
                </p>
              </li>
            );
          })}
        </ul>
      </div>


      {isLoading ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <Painel
        titulo="Solicitar documento ao cliente"
        descricao="Só casos com portal elegível recebem pedido. Finalidade, categoria, participante, prazo e responsável são obrigatórios."
      >
        <div className="grid gap-2 md:grid-cols-3">
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Documento solicitado"
            className={inputCls}
          />
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className={inputCls}
          >
            {Object.entries(CATEGORIAS_SOLICITACAO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={form.finalidade}
            onChange={(e) => setForm({ ...form, finalidade: e.target.value })}
            className={inputCls}
          >
            {Object.entries(FINALIDADES_SOLICITACAO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={form.participante}
            onChange={(e) => setForm({ ...form, participante: e.target.value })}
            className={inputCls}
            disabled={!casoId}
          >
            <option value="">Participante…</option>
            {participantes.map((p) => (
              <option key={p.nome} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>
          <select
            value={form.responsavelId}
            onChange={(e) => setForm({ ...form, responsavelId: e.target.value })}
            className={inputCls}
          >
            <option value="">Responsável interno…</option>
            {lista(data?.equipe)?.map((e: any) => (
              <option key={e.auth_user_id} value={e.auth_user_id}>
                {e.full_name ?? e.email} · {e.role}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.prazo}
            onChange={(e) => setForm({ ...form, prazo: e.target.value })}
            className={inputCls}
          />
          <input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Orientação objetiva ao cliente"
            className={`${inputCls} md:col-span-3`}
          />
        </div>
        {camposFaltando.length ? (
          <div className="mt-3">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream opacity-60"
            >
              <Plus className="h-4 w-4" /> Solicitar
            </button>
            <p className="mt-1 text-xs text-navy/60">Preencha para solicitar: {camposFaltando.join(", ")}.</p>
          </div>
        ) : (
          <div className="mt-3">
            <AcaoOperacional
              rotulo={novaSolicitacao.isPending ? "Solicitando…" : "Solicitar"}
              capacidade="editar_fila_responsavel_prazo"
              pendenciaGate={bloqueioSelecionado?.bloqueado ? bloqueioSelecionado.motivos.join("; ") : null}
              efeito="Registra a solicitação documental no caso. Nenhum e-mail, WhatsApp ou mensagem externa é disparado aqui."
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream"
              onConfirmar={() => {
                if (novaSolicitacao.isPending) return;
                novaSolicitacao.mutate();
              }}
            />
          </div>
        )}

        <EstadoDados
          carregando={isLoading}
          erro={falhaLeitura ? "A consulta do atendimento falhou." : undefined}
          dados={solicitacoes}
          aoTentarNovamente={() => void recarregarLeitura()}
          recurso="as solicitações documentais"
          vazio="Nenhuma solicitação documental registrada."
        >
          {(itens) => (
            <ul className="mt-4 space-y-2">
              {(itens as any[]).map((s: any) => {
                const b = bloqueio(s.case_id);
                return (
              <li key={s.id} className="rounded-lg border border-navy/10 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{s.titulo}</p>
                    <p className="text-xs text-navy/50">
                      {nomeCaso(s.case_id)} · {CATEGORIAS_SOLICITACAO[s.categoria] ?? s.categoria ?? "categoria não informada"} ·{" "}
                      {FINALIDADES_SOLICITACAO[s.finalidade] ?? s.finalidade ?? "finalidade não informada"} ·{" "}
                      {s.participante_nome ?? "participante não informado"} · {nomePessoa(s.responsavel_id)} ·{" "}
                      {rotuloPrazo(s.prazo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Selo texto={STATUS_SOLICITACAO[s.status] ?? s.status} />
                    {["pendente", "recusado"].includes(s.status) ? (
                      <button
                        onClick={() => {
                          const motivo = window.prompt("Motivo do cancelamento (opcional):");
                          if (motivo !== null) cancelarSolic.mutate({ solicitacaoId: s.id, motivo });
                        }}
                        className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </div>
                <Pendencia motivos={b.motivos} />
              </li>
                );
              })}
            </ul>
          )}
        </EstadoDados>
      </Painel>

      <Painel
        titulo="Envios do cliente pendentes de revisão"
        descricao="Todo envio chega como pendente de revisão. Aceitar valida o recebimento internamente — não publica nem libera o arquivo."
      >
        {enviosPendentes === 0 ? (
          <p className="text-sm text-navy/60">Nenhum envio aguardando revisão.</p>
        ) : null}
        <EstadoDados
          carregando={isLoading}
          erro={falhaLeitura ? "A consulta do atendimento falhou." : undefined}
          dados={envios}
          aoTentarNovamente={() => void recarregarLeitura()}
          recurso="os envios do cliente"
          vazio="Nenhum envio do cliente registrado."
        >
          {(itens) => (
            <ul className="space-y-2">
              {(itens as any[]).map((d: any) => (
            <li key={d.id} className="rounded-lg border border-navy/10 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{d.titulo}</p>
                  <p className="text-xs text-navy/50">
                    {nomeCaso(d.case_id)} · recebido em {new Date(d.created_at).toLocaleString("pt-BR")}
                    {d.revisado_em ? ` · revisado em ${new Date(d.revisado_em).toLocaleString("pt-BR")}` : ""}
                  </p>
                  {d.revisao_motivo ? <p className="mt-1 text-xs text-navy/60">Orientação: {d.revisao_motivo}</p> : null}
                </div>
                <Selo
                  texto={STATUS_ENVIO[d.status] ?? d.status}
                  tom={d.status === "pendente_de_revisao" ? "alerta" : "neutro"}
                />
              </div>
              {d.status === "pendente_de_revisao" ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => revisarEnvio.mutate({ documentoId: d.id, decisao: "aceito" })}
                    className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" /> Aceitar recebimento
                  </button>
                  <button
                    onClick={() => {
                      const motivo = window.prompt("O que o cliente precisa reenviar? (orientação objetiva)") ?? "";
                      if (motivo.trim()) revisarEnvio.mutate({ documentoId: d.id, decisao: "recusado", motivo });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
                  >
                    <X className="h-3.5 w-3.5" /> Pedir reenvio
                  </button>
                </div>
              ) : null}
            </li>
              ))}
            </ul>
          )}
        </EstadoDados>
      </Painel>

      <Painel
        titulo="Entregas ao cliente"
        descricao={`Liberar exige admin ou operações, classificação "${CLASSIFICACAO_ENTREGA_LABEL}", versão e responsável. Recolher exige justificativa e preserva o histórico.`}
      >
        <EstadoDados
          carregando={isLoading}
          erro={falhaLeitura ? "A consulta do atendimento falhou." : undefined}
          dados={lista(data?.entregas)}
          aoTentarNovamente={() => void recarregarLeitura()}
          recurso="as entregas ao cliente"
          vazio="Nenhuma entrega registrada."
        >
          {(itens) => (
            <ul className="space-y-2">
              {(itens as any[]).map((d: any) => {
                const b = bloqueio(d.case_id);
                const liberada = !!d.entrega_cliente;
                return (
              <li key={d.id} className="rounded-lg border border-navy/10 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{d.titulo}</p>
                    <p className="text-xs text-navy/50">
                      {nomeCaso(d.case_id)}
                      {d.entrega_versao ? ` · versão ${d.entrega_versao}` : ""}
                      {d.entrega_responsavel_id ? ` · ${nomePessoa(d.entrega_responsavel_id)}` : ""}
                      {d.liberado_em && liberada ? ` · liberado em ${new Date(d.liberado_em).toLocaleString("pt-BR")}` : ""}
                      {d.recolhido_em && !liberada
                        ? ` · recolhido em ${new Date(d.recolhido_em).toLocaleString("pt-BR")}`
                        : ""}
                    </p>
                    {!liberada && d.recolhimento_motivo ? (
                      <p className="mt-1 text-xs text-navy/60">
                        Recolhida: {d.recolhimento_motivo}
                        {d.versao_substituta ? ` · substituída pela versão ${d.versao_substituta}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Selo texto={liberada ? "Visível ao cliente" : "Interna"} tom={liberada ? "ok" : "neutro"} />
                    <button
                      onClick={() =>
                        abrirConfirmacao({
                          tipo: "entrega",
                          liberar: !liberada,
                          id: d.id,
                          caso: nomeCaso(d.case_id),
                          item: d.titulo,
                          classificacao: CLASSIFICACAO_ENTREGA_LABEL,
                          visibilidade: VISIBILIDADE_ENTREGA_LABEL,
                          responsavel: nomePessoa(form.responsavelId || d.entrega_responsavel_id),
                          versaoAtual: d.entrega_versao ?? null,
                        })
                      }

                      className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                    >
                      {liberada ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {liberada ? "Recolher" : "Liberar ao cliente"}
                    </button>
                  </div>
                </div>
                {!liberada ? <Pendencia motivos={b.motivos} /> : null}
                {!liberada && !form.responsavelId ? (
                  <p className="mt-1 text-xs text-navy/50">Escolha o responsável interno no bloco acima antes de liberar.</p>
                ) : null}
              </li>
                );
              })}
            </ul>
          )}
        </EstadoDados>
      </Painel>

      <Painel
        titulo="Faturas visíveis ao cliente"
        descricao="Somente admin e financeiro. Exige caso vinculado, portal elegível e acesso autorizado ativo."
      >
        <EstadoDados
          carregando={isLoading}
          erro={falhaLeitura ? "A consulta do atendimento falhou." : undefined}
          dados={faturas}
          aoTentarNovamente={() => void recarregarLeitura()}
          recurso="as faturas"
          vazio="Nenhuma fatura registrada."
        >
          {(itens) => (
            <ul className="space-y-2">
              {(itens as any[]).map((f: any) => {
                const caso = f.case_id ? casoPorId.get(f.case_id) : undefined;
                const b = bloqueioFatura(caso);
                return (
              <li key={f.id} className="rounded-lg border border-navy/10 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{f.descricao ?? f.numero ?? "Fatura"}</p>
                    <p className="text-xs text-navy/50">
                      {f.case_id ? nomeCaso(f.case_id) : "sem caso vinculado"} ·{" "}
                      {f.vencimento ? rotuloPrazo(f.vencimento) : "sem vencimento"} · {f.status ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Selo texto={f.liberada_cliente ? "Visível" : "Oculta"} tom={f.liberada_cliente ? "ok" : "neutro"} />
                    <button
                      onClick={() =>
                        abrirConfirmacao({
                          tipo: "fatura",
                          liberar: !f.liberada_cliente,
                          id: f.id,
                          caso: f.case_id ? nomeCaso(f.case_id) : "sem caso vinculado",
                          item: f.descricao ?? f.numero ?? "Fatura",
                          classificacao: "fatura vinculada ao caso autorizado",
                          visibilidade: VISIBILIDADE_FATURA_LABEL,
                          responsavel: "membro autenticado",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                    >
                      {f.liberada_cliente ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {f.liberada_cliente ? "Ocultar" : "Liberar ao cliente"}
                    </button>
                  </div>
                </div>
                {!f.liberada_cliente ? <Pendencia motivos={b.motivos} /> : null}
              </li>
                );
              })}
            </ul>
          )}
        </EstadoDados>
      </Painel>

      <Painel
        titulo="Atendimentos e tickets"
        descricao="Mensagens do cliente geram alerta interno. Nada é enviado por e-mail, WhatsApp ou automação externa."
      >
        <EstadoDados
          carregando={isLoading}
          erro={falhaLeitura ? "A consulta do atendimento falhou." : undefined}
          dados={tickets}
          aoTentarNovamente={() => void recarregarLeitura()}
          recurso="os tickets de atendimento"
          vazio="Nenhum ticket registrado."
        >
          {(itens) => (
            <ul className="space-y-2">
              {(itens as any[]).map((t: any) => {
                const b = bloqueio(t.case_id);
                return (
              <li key={t.id} className="rounded-lg border border-navy/10 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button className="text-left" onClick={() => setTicketAberto(ticketAberto === t.id ? null : t.id)}>
                    <p className="font-medium">{t.assunto}</p>
                    <p className="text-xs text-navy/50">
                      {nomeCaso(t.case_id)} · {nomePessoa(t.responsavel_id)} ·{" "}
                      {new Date(t.ultima_mensagem_em ?? t.created_at).toLocaleString("pt-BR")}
                    </p>
                  </button>
                  <Selo texto={STATUS_TICKET[t.status] ?? t.status} />
                </div>
                {b.bloqueado ? <Pendencia motivos={b.motivos} /> : null}
                {ticketAberto === t.id ? (
                  <Conversa ticketId={t.id} pendencias={b.bloqueado ? b.motivos : []} onErro={falhar} />
                ) : null}
              </li>
                );
              })}
            </ul>
          )}
        </EstadoDados>
      </Painel>

      {confirmacao ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-navy/10 bg-white p-4">
            <h3 className="font-serif text-lg">
              {confirmacao.liberar ? "Confirmar liberação ao cliente" : "Confirmar recolhimento"}
            </h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-cream p-3 text-xs text-navy/80">
              {[
                `Caso: ${confirmacao.caso}`,
                `Item: ${confirmacao.item}`,
                `Classificação: ${confirmacao.classificacao}`,
                `Visibilidade: ${confirmacao.visibilidade}`,
                `Ação: ${confirmacao.liberar ? "liberar publicação" : "recolher publicação"}`,
                `Responsável: ${confirmacao.responsavel}`,
                `Registro: ${new Date().toLocaleString("pt-BR", { timeZoneName: "short" })}`,
              ].join("\n")}
            </pre>

            {confirmacao.tipo === "entrega" && confirmacao.liberar ? (
              <input
                value={confVersao}
                onChange={(e) => setConfVersao(e.target.value)}
                placeholder="Versão do conteúdo (ex.: v1.0)"
                className={`${inputCls} mt-3`}
              />
            ) : null}
            {!confirmacao.liberar ? (
              <>
                <textarea
                  value={confMotivo}
                  onChange={(e) => setConfMotivo(e.target.value)}
                  rows={2}
                  placeholder="Justificativa objetiva do recolhimento"
                  className={`${inputCls} mt-3`}
                />
                {confirmacao.tipo === "entrega" ? (
                  <input
                    value={confSubstituta}
                    onChange={(e) => setConfSubstituta(e.target.value)}
                    placeholder="Versão substituta (opcional)"
                    className={`${inputCls} mt-2`}
                  />
                ) : null}
              </>
            ) : null}

            <p className="mt-3 text-xs text-navy/50">
              A decisão fica auditada com autor, papel, data e hora com fuso, caso, versão, classificação de
              visibilidade e resultado (liberado, recolhido, recusado ou bloqueado).
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmacao(null)}
                className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={
                  (confirmacao.tipo === "entrega" && confirmacao.liberar && !confVersao.trim()) ||
                  (!confirmacao.liberar && !confMotivo.trim())
                }
                onClick={() => {
                  if (confirmacao.tipo === "entrega") {
                    alternarEntrega.mutate(
                      confirmacao.liberar
                        ? {
                            documentoId: confirmacao.id,
                            liberar: true,
                            versao: confVersao,
                            responsavelId: form.responsavelId || undefined,
                          }
                        : {
                            documentoId: confirmacao.id,
                            liberar: false,
                            motivo: confMotivo,
                            versaoSubstituta: confSubstituta.trim() || null,
                          },
                    );
                  } else {
                    alternarFatura.mutate({
                      faturaId: confirmacao.id,
                      liberar: confirmacao.liberar,
                      motivo: confirmacao.liberar ? undefined : confMotivo,
                    });
                  }
                  setConfirmacao(null);
                }}
                className="rounded-lg bg-navy px-3 py-1.5 text-sm text-cream disabled:opacity-60"
              >
                {confirmacao.liberar ? "Liberar publicação" : "Recolher"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>

  );
}

function Conversa({
  ticketId,
  pendencias,
  onErro,
}: {
  ticketId: string;
  /** Pendências do caso. Informam a decisão; não travam a resposta. */
  pendencias: string[];
  onErro: (e: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const carregar = useServerFn(ticketInterno);
  const responder = useServerFn(responderTicketEquipe);
  const mudarStatus = useServerFn(atualizarStatusTicket);
  const [texto, setTexto] = useState("");
  const temPendencia = pendencias.length > 0;
  const [interna, setInterna] = useState(temPendencia);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ticket-interno", ticketId],
    queryFn: () => carregar({ data: { ticketId } }),
  });

  const enviar = useMutation({
    mutationFn: () => responder({ data: { ticketId, mensagem: texto, interna } }),
    onSuccess: () => {
      setTexto("");
      toast.success(interna ? "Nota interna registrada." : "Resposta enviada.");
      queryClient.invalidateQueries({ queryKey: ["ticket-interno", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["atendimento"] });
    },
    onError: onErro,
  });

  const status = useMutation({
    mutationFn: (novo: string) => mudarStatus({ data: { ticketId, status: novo } }),
    onSuccess: () => {
      toast.success("Status do ticket atualizado.");
      queryClient.invalidateQueries({ queryKey: ["atendimento"] });
    },
    onError: onErro,
  });

  return (
    <div className="mt-3 border-t border-navy/10 pt-3">
      <EstadoDados
        carregando={isLoading}
        erro={error}
        dados={lista(data?.mensagens)}
        aoTentarNovamente={() => void refetch()}
        recurso="as mensagens do ticket"
        vazio="Nenhuma mensagem neste ticket."
      >
        {(itens) => (
          <ul className="space-y-2">
            {(itens as any[]).map((m: any) => (
              <li key={m.id} className="rounded-lg bg-cream p-2 text-sm">
                <p className="whitespace-pre-wrap">{m.corpo}</p>
                <p className="mt-1 text-[11px] text-navy/50">
                  {m.autor_tipo === "cliente" ? "Cliente" : "Equipe"}
                  {m.visivel_cliente ? "" : " · nota interna"} · {new Date(m.created_at).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </EstadoDados>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder={interna ? "Nota interna" : "Resposta ao cliente"}
        className={`${inputCls} mt-2`}
      />
      {temPendencia ? (
        <p className="mt-1 text-xs text-terracotta">
          Pendência do caso: {pendencias.join("; ")}. A resposta começa como nota interna; desmarcar torna visível ao
          cliente e a decisão fica registrada.
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-navy/60">
          <input type="checkbox" checked={interna} onChange={(e) => setInterna(e.target.checked)} />
          Nota interna (o cliente não vê)
        </label>
        <button
          onClick={() => enviar.mutate()}
          disabled={!texto.trim() || enviar.isPending}
          className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" /> Registrar resposta
        </button>
        <select
          onChange={(e) => e.target.value && status.mutate(e.target.value)}
          className="rounded-lg border border-navy/15 px-2 py-1.5 text-xs"
          defaultValue=""
        >
          <option value="">Alterar situação…</option>
          <option value="em_analise">Em análise</option>
          <option value="respondido">Respondido</option>
          <option value="resolvido">Resolvido</option>
          <option value="fechado">Fechado</option>
        </select>
      </div>
    </div>
  );
}
