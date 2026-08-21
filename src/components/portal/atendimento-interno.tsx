import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Eye, EyeOff, Lock, Plus, Send, X } from "lucide-react";

import {
  atualizarStatusTicket,
  cancelarSolicitacaoDocumento,
  criarSolicitacaoDocumento,
  liberarEntregaCliente,
  liberarFaturaCliente,
  painelAtendimento,
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

function Bloqueado({ motivos }: { motivos: string[] }) {
  if (motivos.length === 0) return null;
  return (
    <p className="mt-1 flex items-start gap-1.5 text-xs text-terracotta">
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>Bloqueado: {motivos.join("; ")}.</span>
    </p>
  );
}

export function AtendimentoInterno() {
  const queryClient = useQueryClient();
  const carregar = useServerFn(painelAtendimento);
  const criar = useServerFn(criarSolicitacaoDocumento);
  const cancelar = useServerFn(cancelarSolicitacaoDocumento);
  const revisar = useServerFn(revisarEnvioCliente);
  const liberarDoc = useServerFn(liberarEntregaCliente);
  const liberarFat = useServerFn(liberarFaturaCliente);

  const [casoId, setCasoId] = useState<string>("");
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

  const { data, isLoading } = useQuery({
    queryKey: ["atendimento", casoId],
    queryFn: () => carregar({ data: casoId ? { casoId } : {} }),
  });

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["atendimento"] });
  }
  function falhar(e: unknown) {
    setErro((e as Error).message);
  }

  const casos = (data?.casos ?? []) as CasoAtendimento[];
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
    return (data?.equipe ?? []).find((e: any) => e.auth_user_id === id)?.full_name ?? "responsável interno";
  };

  const participantes = useMemo(() => {
    if (!casoId) return [] as { id: string | null; nome: string }[];
    const caso = casoPorId.get(casoId);
    const titular = (data?.clientes ?? []).find((c: any) => c.id === caso?.cliente_id);
    const deps = (data?.dependentes ?? [])
      .filter((d: any) => d.case_id === casoId)
      .map((d: any) => ({ id: d.id as string, nome: `${d.nome_completo} (${d.vinculo_com_titular ?? "participante"})` }));
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
      recarregar();
    },
    onError: falhar,
  });

  const cancelarSolic = useMutation({
    mutationFn: (p: { solicitacaoId: string; motivo: string }) => cancelar({ data: p }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const revisarEnvio = useMutation({
    mutationFn: (p: { documentoId: string; decisao: "aceito" | "recusado"; motivo?: string }) => revisar({ data: p }),
    onSuccess: recarregar,
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
    onSuccess: recarregar,
    onError: falhar,
  });

  const alternarFatura = useMutation({
    mutationFn: (p: { faturaId: string; liberar: boolean }) => liberarFat({ data: p }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const formIncompleto =
    !casoId ||
    !!bloqueioSelecionado?.bloqueado ||
    !form.titulo.trim() ||
    !form.participante ||
    !form.responsavelId ||
    !form.prazo;

  return (
    <div className="space-y-5">
      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

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
        {bloqueioSelecionado ? <Bloqueado motivos={bloqueioSelecionado.motivos} /> : null}
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
            {(data?.equipe ?? []).map((e: any) => (
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
        <button
          onClick={() => novaSolicitacao.mutate()}
          disabled={formIncompleto || novaSolicitacao.isPending}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Solicitar
        </button>
        {!casoId ? <p className="mt-2 text-xs text-navy/50">Escolha um caso para solicitar.</p> : null}

        <ul className="mt-4 space-y-2">
          {(data?.solicitacoes ?? []).map((s: any) => {
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
                          const motivo = window.prompt("Motivo do cancelamento?") ?? "";
                          if (motivo.trim()) cancelarSolic.mutate({ solicitacaoId: s.id, motivo });
                        }}
                        className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </div>
                <Bloqueado motivos={b.motivos} />
              </li>
            );
          })}
        </ul>
      </Painel>

      <Painel
        titulo="Envios do cliente pendentes de revisão"
        descricao="Todo envio chega como pendente de revisão. Aceitar valida o recebimento internamente — não publica nem libera o arquivo."
      >
        {(data?.envios ?? []).filter((d: any) => d.status === "pendente_de_revisao").length === 0 ? (
          <p className="text-sm text-navy/60">Nenhum envio aguardando revisão.</p>
        ) : null}
        <ul className="space-y-2">
          {(data?.envios ?? []).map((d: any) => (
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
      </Painel>

      <Painel
        titulo="Entregas ao cliente"
        descricao={`Liberar exige admin ou operações, classificação "${CLASSIFICACAO_ENTREGA_LABEL}", versão e responsável. Recolher exige justificativa e preserva o histórico.`}
      >
        <ul className="space-y-2">
          {(data?.entregas ?? []).map((d: any) => {
            const b = bloqueio(d.case_id);
            const liberada = !!d.entrega_cliente;
            const impedido = !data?.podeLiberar || (!liberada && b.bloqueado);
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
                      onClick={() => {
                        if (liberada) {
                          const motivo = window.prompt("Justificativa objetiva do recolhimento?") ?? "";
                          if (!motivo.trim()) return;
                          const sub = window.prompt("Versão substituta (opcional)") ?? "";
                          alternarEntrega.mutate({
                            documentoId: d.id,
                            liberar: false,
                            motivo,
                            versaoSubstituta: sub.trim() || null,
                          });
                          return;
                        }
                        const versao = window.prompt("Versão da entrega (ex.: v1.0)") ?? "";
                        if (!versao.trim()) return;
                        alternarEntrega.mutate({
                          documentoId: d.id,
                          liberar: true,
                          versao,
                          responsavelId: form.responsavelId || undefined,
                        });
                      }}
                      disabled={impedido}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {liberada ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {liberada ? "Recolher" : "Liberar ao cliente"}
                    </button>
                  </div>
                </div>
                {!liberada ? <Bloqueado motivos={b.motivos} /> : null}
                {!data?.podeLiberar ? (
                  <p className="mt-1 text-xs text-terracotta">Bloqueado: seu papel não libera entregas.</p>
                ) : !liberada && !form.responsavelId ? (
                  <p className="mt-1 text-xs text-navy/50">Escolha o responsável interno no bloco acima antes de liberar.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Painel>

      <Painel
        titulo="Faturas visíveis ao cliente"
        descricao="Somente admin e financeiro. Exige caso vinculado, portal elegível e acesso autorizado ativo."
      >
        <ul className="space-y-2">
          {(data?.faturas ?? []).map((f: any) => {
            const caso = f.case_id ? casoPorId.get(f.case_id) : undefined;
            const b = bloqueioFatura(caso);
            const impedido = !data?.podeFinanceiro || (!f.liberada_cliente && b.bloqueado);
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
                      onClick={() => alternarFatura.mutate({ faturaId: f.id, liberar: !f.liberada_cliente })}
                      disabled={impedido}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {f.liberada_cliente ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {f.liberada_cliente ? "Ocultar" : "Liberar ao cliente"}
                    </button>
                  </div>
                </div>
                {!f.liberada_cliente ? <Bloqueado motivos={b.motivos} /> : null}
                {!data?.podeFinanceiro ? (
                  <p className="mt-1 text-xs text-terracotta">Bloqueado: seu papel não libera faturas.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Painel>

      <Painel
        titulo="Atendimentos e tickets"
        descricao="Mensagens do cliente geram alerta interno. Nada é enviado por e-mail, WhatsApp ou automação externa."
      >
        <ul className="space-y-2">
          {(data?.tickets ?? []).map((t: any) => {
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
                {b.bloqueado ? <Bloqueado motivos={[...b.motivos, "resposta visível ao cliente indisponível"]} /> : null}
                {ticketAberto === t.id ? (
                  <Conversa ticketId={t.id} bloqueado={b.bloqueado} onErro={falhar} />
                ) : null}
              </li>
            );
          })}
        </ul>
      </Painel>
    </div>
  );
}

function Conversa({
  ticketId,
  bloqueado,
  onErro,
}: {
  ticketId: string;
  bloqueado: boolean;
  onErro: (e: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const carregar = useServerFn(ticketInterno);
  const responder = useServerFn(responderTicketEquipe);
  const mudarStatus = useServerFn(atualizarStatusTicket);
  const [texto, setTexto] = useState("");
  const [interna, setInterna] = useState(bloqueado);

  const { data } = useQuery({
    queryKey: ["ticket-interno", ticketId],
    queryFn: () => carregar({ data: { ticketId } }),
  });

  const enviar = useMutation({
    mutationFn: () => responder({ data: { ticketId, mensagem: texto, interna: bloqueado ? true : interna } }),
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: ["ticket-interno", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["atendimento"] });
    },
    onError: onErro,
  });

  const status = useMutation({
    mutationFn: (novo: string) => mudarStatus({ data: { ticketId, status: novo } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["atendimento"] }),
    onError: onErro,
  });

  return (
    <div className="mt-3 border-t border-navy/10 pt-3">
      <ul className="space-y-2">
        {(data?.mensagens ?? []).map((m: any) => (
          <li key={m.id} className="rounded-lg bg-cream p-2 text-sm">
            <p className="whitespace-pre-wrap">{m.corpo}</p>
            <p className="mt-1 text-[11px] text-navy/50">
              {m.autor_tipo === "cliente" ? "Cliente" : "Equipe"}
              {m.visivel_cliente ? "" : " · nota interna"} · {new Date(m.created_at).toLocaleString("pt-BR")}
            </p>
          </li>
        ))}
      </ul>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder={bloqueado ? "Nota interna (caso sem portal elegível)" : "Resposta ao cliente"}
        className={`${inputCls} mt-2`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-navy/60">
          <input
            type="checkbox"
            checked={bloqueado ? true : interna}
            disabled={bloqueado}
            onChange={(e) => setInterna(e.target.checked)}
          />
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
