import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Eye, EyeOff, Plus, Send, X } from "lucide-react";

import {
  atualizarStatusTicket,
  criarSolicitacaoDocumento,
  liberarEntregaCliente,
  liberarFaturaCliente,
  painelAtendimento,
  responderTicketEquipe,
  revisarEnvioCliente,
  ticketInterno,
} from "@/lib/portal-atendimento.functions";

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

function Selo({ texto }: { texto: string }) {
  return (
    <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
      {texto}
    </span>
  );
}

export function AtendimentoInterno() {
  const queryClient = useQueryClient();
  const carregar = useServerFn(painelAtendimento);
  const criar = useServerFn(criarSolicitacaoDocumento);
  const revisar = useServerFn(revisarEnvioCliente);
  const liberarDoc = useServerFn(liberarEntregaCliente);
  const liberarFat = useServerFn(liberarFaturaCliente);

  const [casoId, setCasoId] = useState<string>("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
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

  const novaSolicitacao = useMutation({
    mutationFn: () => criar({ data: { casoId, titulo, descricao, prazo: prazo || null } }),
    onSuccess: () => {
      setTitulo("");
      setDescricao("");
      setPrazo("");
      recarregar();
    },
    onError: falhar,
  });

  const revisarEnvio = useMutation({
    mutationFn: (p: { documentoId: string; decisao: "aceito" | "recusado"; motivo?: string }) =>
      revisar({ data: p }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const alternarEntrega = useMutation({
    mutationFn: (p: { documentoId: string; liberar: boolean }) => liberarDoc({ data: p }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const alternarFatura = useMutation({
    mutationFn: (p: { faturaId: string; liberar: boolean }) => liberarFat({ data: p }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const nomeCaso = (id: string) => data?.casos.find((c: any) => c.id === id)?.titulo ?? "—";

  return (
    <div className="space-y-5">
      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-navy/60">Caso</label>
        <select value={casoId} onChange={(e) => setCasoId(e.target.value)} className={`${inputCls} max-w-md`}>
          <option value="">Todos os casos</option>
          {(data?.casos ?? []).map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.codigo ? `${c.codigo} · ` : ""}
              {c.titulo}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <Painel titulo="Solicitar documento ao cliente" descricao="O pedido aparece no portal do cliente do caso escolhido.">
        <div className="grid gap-2 md:grid-cols-4">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Documento" className={inputCls} />
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Orientação ao cliente"
            className={`${inputCls} md:col-span-2`}
          />
          <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={inputCls} />
        </div>
        <button
          onClick={() => novaSolicitacao.mutate()}
          disabled={!casoId || !titulo.trim() || novaSolicitacao.isPending}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Solicitar
        </button>
        {!casoId ? <p className="mt-2 text-xs text-navy/50">Escolha um caso para solicitar.</p> : null}

        <ul className="mt-4 space-y-2">
          {(data?.solicitacoes ?? []).map((s: any) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 p-3 text-sm">
              <div>
                <p className="font-medium">{s.titulo}</p>
                <p className="text-xs text-navy/50">{nomeCaso(s.case_id)}</p>
              </div>
              <Selo texto={s.status} />
            </li>
          ))}
        </ul>
      </Painel>

      <Painel titulo="Envios do cliente" descricao="Todo envio chega como pendente de revisão.">
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
                    {nomeCaso(d.case_id)} · {new Date(d.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Selo texto={d.status} />
              </div>
              {d.status === "pendente_de_revisao" ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => revisarEnvio.mutate({ documentoId: d.id, decisao: "aceito" })}
                    className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" /> Aceitar
                  </button>
                  <button
                    onClick={() => {
                      const motivo = window.prompt("O que o cliente precisa reenviar?") ?? "";
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

      <Painel titulo="Entregas ao cliente" descricao="Liberar exige admin ou operações e fica registrado na auditoria.">
        <ul className="space-y-2">
          {(data?.entregas ?? []).map((d: any) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 p-3 text-sm">
              <div>
                <p className="font-medium">{d.titulo}</p>
                <p className="text-xs text-navy/50">
                  {nomeCaso(d.case_id)}
                  {d.liberado_em ? ` · liberado em ${new Date(d.liberado_em).toLocaleString("pt-BR")}` : ""}
                </p>
              </div>
              <button
                onClick={() => alternarEntrega.mutate({ documentoId: d.id, liberar: !d.liberado_cliente })}
                disabled={!data?.podeLiberar}
                className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {d.liberado_cliente ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {d.liberado_cliente ? "Recolher" : "Liberar ao cliente"}
              </button>
            </li>
          ))}
        </ul>
      </Painel>

      <Painel titulo="Faturas visíveis ao cliente" descricao="Somente admin e financeiro liberam faturas.">
        <ul className="space-y-2">
          {(data?.faturas ?? []).map((f: any) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 p-3 text-sm">
              <div>
                <p className="font-medium">{f.descricao ?? f.numero ?? "Fatura"}</p>
                <p className="text-xs text-navy/50">{nomeCaso(f.case_id)}</p>
              </div>
              <button
                onClick={() => alternarFatura.mutate({ faturaId: f.id, liberar: !f.liberada_cliente })}
                disabled={!data?.podeFinanceiro}
                className="inline-flex items-center gap-1 rounded-lg border border-navy/20 px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {f.liberada_cliente ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {f.liberada_cliente ? "Ocultar" : "Liberar ao cliente"}
              </button>
            </li>
          ))}
        </ul>
      </Painel>

      <Painel titulo="Atendimentos" descricao="Mensagens do cliente viram ticket. Nada é enviado por e-mail ou WhatsApp.">
        <ul className="space-y-2">
          {(data?.tickets ?? []).map((t: any) => (
            <li key={t.id} className="rounded-lg border border-navy/10 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button className="text-left" onClick={() => setTicketAberto(ticketAberto === t.id ? null : t.id)}>
                  <p className="font-medium">{t.assunto}</p>
                  <p className="text-xs text-navy/50">
                    {nomeCaso(t.case_id)} · {new Date(t.ultima_mensagem_em).toLocaleString("pt-BR")}
                  </p>
                </button>
                <Selo texto={t.status} />
              </div>
              {ticketAberto === t.id ? <Conversa ticketId={t.id} onErro={falhar} /> : null}
            </li>
          ))}
        </ul>
      </Painel>
    </div>
  );
}

function Conversa({ ticketId, onErro }: { ticketId: string; onErro: (e: unknown) => void }) {
  const queryClient = useQueryClient();
  const carregar = useServerFn(ticketInterno);
  const responder = useServerFn(responderTicketEquipe);
  const mudarStatus = useServerFn(atualizarStatusTicket);
  const [texto, setTexto] = useState("");
  const [interna, setInterna] = useState(false);

  const { data } = useQuery({
    queryKey: ["ticket-interno", ticketId],
    queryFn: () => carregar({ data: { ticketId } }),
  });

  const enviar = useMutation({
    mutationFn: () => responder({ data: { ticketId, mensagem: texto, interna } }),
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
        placeholder="Resposta ao cliente"
        className={`${inputCls} mt-2`}
      />
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
          <Send className="h-3.5 w-3.5" /> Responder
        </button>
        <select onChange={(e) => e.target.value && status.mutate(e.target.value)} className="rounded-lg border border-navy/15 px-2 py-1.5 text-xs" defaultValue="">
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
